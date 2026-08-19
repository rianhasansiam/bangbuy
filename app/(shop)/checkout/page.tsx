"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth/use-app-session";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCheckoutPreview,
  fetchCheckoutProfile,
  placeCheckoutOrder,
  CheckoutSubmissionError,
  type CheckoutItemInput,
  type CheckoutPaymentMethod,
  type CheckoutPreview,
  type PlaceOrderRequest,
} from "@/features/checkout/api";
import {
  resolveCheckoutIdempotencyAttempt,
  type CheckoutIdempotencyAttempt,
} from "@/features/checkout/idempotency";
import { normalizeCheckoutPromoCode } from "@/features/checkout/promo";
import {
  setCartData,
  setCartError,
} from "@/store/slices/cart.slice";
import { computeCartSummary } from "@/features/cart/summary";
import { fetchServerCartSnapshot } from "@/features/cart/api";
import { writeLocalCart } from "@/features/cart/storage";
import type { AppDispatch, RootState } from "@/store";
import { toast } from "@/lib/feedback";
import { BASE_CURRENCY } from "@/lib/currency/config";
import { startAirwallexHostedCheckout } from "@/lib/airwallex/components/AirwallexPayButton";
import {
  CheckoutPageSkeleton,
  FullPageLoader,
} from "@/components/ui/loading";

import CheckoutHeader from "./components/CheckoutHeader";
import CheckoutItemsCard from "./components/CheckoutItemsCard";
import CustomerForm, {
  type CustomerFormState,
} from "./components/CustomerForm";
import PaymentMethodPicker from "./components/PaymentMethodPicker";
import OrderSummaryCard from "./components/OrderSummaryCard";

const EMPTY_FORM: CustomerFormState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  customerCity: "",
  deliveryZone: "INSIDE_DHAKA",
  customerPostalCode: "",
  customerNote: "",
};

type CheckoutSource =
  | { kind: "cart" }
  | { kind: "cart-selection"; items: CheckoutItemInput[] }
  | { kind: "buy-now"; items: CheckoutItemInput[] };

function parseBuyNowParam(raw: string | null): CheckoutItemInput[] | null {
  if (!raw) return null;
  // Format: "<productId>:<quantity>[:<variantId>]" or a comma-separated
  // list of those.
  const parts = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const items: CheckoutItemInput[] = [];
  for (const part of parts) {
    const [productId, qtyRaw, variantId] = part.split(":");
    if (!productId) continue;
    const quantity = Math.max(1, Math.round(Number(qtyRaw ?? 1) || 1));
    items.push({
      productId: productId.trim(),
      quantity,
      ...(variantId ? { variantId: variantId.trim() } : {}),
    });
  }
  return items.length > 0 ? items : null;
}

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status: authStatus } = useSession();

  const items = useSelector((state: RootState) => state.cart.items);
  const cartMode = useSelector((state: RootState) => state.cart.mode);
  const cartIsHydrated = useSelector(
    (state: RootState) => state.cart.isHydrated,
  );
  const cartIsLoading = useSelector((state: RootState) => state.cart.isLoading);
  const cartError = useSelector((state: RootState) => state.cart.error);

  // Source: explicit Buy Now items, an explicit cart selection, or the full
  // persisted cart when no item payload is present.
  const buyNowItems = useMemo(
    () => parseBuyNowParam(searchParams.get("buy")),
    [searchParams],
  );
  const isCartSelection = searchParams.get("source") === "cart";
  const source = useMemo<CheckoutSource>(
    () =>
      buyNowItems
        ? {
            kind: isCartSelection ? "cart-selection" : "buy-now",
            items: buyNowItems,
          }
        : { kind: "cart" },
    [buyNowItems, isCartSelection],
  );
  const carriedPromo = useMemo(
    () => normalizeCheckoutPromoCode(searchParams.get("promo")),
    [searchParams],
  );

  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("CASH_ON_DELIVERY");
  const [promoCode, setPromoCode] = useState<string>(carriedPromo ?? "");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(carriedPromo);
  const [promoFeedback, setPromoFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  // Bumping this token forces the preview effect to re-fetch even when
  // none of its other deps changed (e.g. after a manual retry).
  const [previewToken, setPreviewToken] = useState(0);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);
  const onlineIdempotencyAttemptRef =
    useRef<CheckoutIdempotencyAttempt | null>(null);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CustomerFormState, string>>
  >({});

  // Profile auto-fill lifecycle. Kept separate from the preview state so
  // the form can show its own loading/error affordances. `profileToken`
  // lets the user retry a failed profile load.
  const [profileStatus, setProfileStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [profileToken, setProfileToken] = useState(0);

  // Anonymous visitors can't reach checkout. Bounce them to /login
  // with a callback URL that preserves any "Buy now" intent so the
  // post-login redirect lands them right back here.
  useEffect(() => {
    if (authStatus !== "unauthenticated") return;
    const query = searchParams.toString();
    const target = query ? `/checkout?${query}` : "/checkout";
    router.replace(`/login?callbackUrl=${encodeURIComponent(target)}`);
  }, [authStatus, router, searchParams]);

  // Hydrate the form from the authenticated user's saved profile. The
  // database profile is the source of truth (not Redux/localStorage), so
  // we refetch it whenever auth resolves or the user retries. Email is
  // always taken from the profile and locked; the editable shipping
  // fields only backfill when empty so a refetch never clobbers typing.
  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus !== "authenticated") return;

    let ignore = false;

    void (async () => {
      // setState calls live inside the async closure (microtask) so the
      // lint rule against synchronous effect-body setState is satisfied,
      // matching the preview effect below.
      setProfileStatus("loading");

      const profile = await fetchCheckoutProfile();
      if (ignore) return;

      if (!profile) {
        setProfileStatus("error");
        return;
      }

      setForm((prev) => ({
        ...prev,
        // Identity-bound: always reflect the DB/session email, never
        // preserve a stale typed value (the field is read-only anyway).
        customerEmail: profile.email ?? session?.user?.email ?? "",
        // Shipping fields: backfill only when the user hasn't typed yet.
        customerName: prev.customerName || profile.name || "",
        customerPhone: prev.customerPhone || profile.phone || "",
        customerCity: prev.customerCity || profile.city || "",
        customerAddress: prev.customerAddress || profile.address || "",
        customerPostalCode:
          prev.customerPostalCode || profile.postalCode || "",
      }));
      setProfileStatus("loaded");
    })();

    return () => {
      ignore = true;
    };
  }, [authStatus, session?.user?.email, profileToken]);

  const handleRetryProfile = useCallback(
    () => setProfileToken((token) => token + 1),
    [],
  );

  // Build the items payload sent to /api/checkout/preview.
  // Buy Now and selected-cart flows forward explicit items. Full-cart
  // checkout omits `items` so the server reads the persisted cart.
  const buildItemsPayload = useCallback((): CheckoutItemInput[] | undefined => {
    if (source.kind !== "cart") return source.items;
    return undefined;
  }, [source]);

  const cartSourceReady =
    source.kind !== "cart" ||
    (cartIsHydrated && cartMode === "server" && !cartIsLoading);

  // Single source of truth for "fetch the preview". Triggered by:
  //   - auth status becoming known
  //   - the items source changing (cart -> buy-now and vice versa)
  //   - the applied promo code changing
  //   - the manual reload token bumping
  // Anything that should refresh totals just updates one of those inputs.
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!cartSourceReady) {
      if (
        source.kind === "cart" &&
        cartIsHydrated &&
        !cartIsLoading &&
        cartError
      ) {
        void (async () => {
          setPreview(null);
          setPreviewLoading(false);
          setPreviewError(cartError);
        })();
      }
      return;
    }

    let ignore = false;

    void (async () => {
      // setState calls live inside the async closure (microtask) so the
      // lint rule against synchronous effect-body setState is satisfied.
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const next = await fetchCheckoutPreview({
          items: buildItemsPayload(),
          deliveryZone: form.deliveryZone,
          promoCode: appliedPromo,
        });
        if (ignore) return;

        setPreview(next);

        if (appliedPromo && next.promo) {
          if (next.promo.ok) {
            setPromoFeedback({
              tone: "success",
              message: `${next.promo.code} applied.`,
            });
            toast.success(`Promo code ${next.promo.code} applied`);
          } else {
            setAppliedPromo(null);
            setPromoFeedback({ tone: "error", message: next.promo.reason });
            toast.error(next.promo.reason);
          }
        }
      } catch (error) {
        if (ignore) return;
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load order summary.";
        setPreviewError(message);
        setPreview(null);
      } finally {
        if (!ignore) setPreviewLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [
    authStatus,
    cartError,
    cartIsHydrated,
    cartIsLoading,
    cartSourceReady,
    source,
    appliedPromo,
    previewToken,
    buildItemsPayload,
    form.deliveryZone,
  ]);

  const handleApplyPromo = () => {
    const trimmed = promoCode.trim().toUpperCase();
    if (!trimmed) return;
    setPromoFeedback(null);
    setAppliedPromo(trimmed);
    // The preview effect will pick up the new appliedPromo and refetch.
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoFeedback(null);
    toast.info("Promo code removed");
  };

  const handleRetry = () => setPreviewToken((token) => token + 1);

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (form.customerName.trim().length < 2) {
      errors.customerName = "Enter your full name.";
    }
    if (form.customerPhone.trim().length < 7) {
      errors.customerPhone = "Enter a valid phone number.";
    }
    if (form.customerAddress.trim().length < 5) {
      errors.customerAddress = "Enter your delivery address.";
    }
    if (form.customerCity.trim() && form.customerCity.trim().length < 2) {
      errors.customerCity = "City / district is too short.";
    }
    if (
      form.customerPostalCode.trim() &&
      form.customerPostalCode.trim().length < 3
    ) {
      errors.customerPostalCode = "Postal code is too short.";
    }
    if (form.customerNote.length > 1000) {
      errors.customerNote = "Note is too long.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const syncCartAfterOrder = async () => {
    if (source.kind === "buy-now") return;

    try {
      const snapshot = await fetchServerCartSnapshot();
      writeLocalCart(snapshot.items);
      dispatch(setCartData(snapshot));
    } catch {
      const remainingItems =
        source.kind === "cart"
          ? []
          : items.filter(
              (cartItem) =>
                !source.items.some((orderedItem) =>
                  orderedItem.variantId
                    ? orderedItem.variantId === cartItem.variantId
                    : orderedItem.productId === cartItem.productId,
                ),
            );
      writeLocalCart(remainingItems);
      dispatch(
        setCartData({
          items: remainingItems,
          summary: computeCartSummary(remainingItems),
        }),
      );
    }
    dispatch(setCartError(null));
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder || submitInFlightRef.current) return;
    setSubmitError(null);

    if (!preview || preview.items.length === 0) {
      const msg = "Your cart is empty. Add items before checking out.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    if (!validateForm()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    submitInFlightRef.current = true;
    setIsPlacingOrder(true);
    let handingOffToGateway = false;
    let reservedAirwallexOrderId: string | null = null;

    try {
      const checkoutRequest: PlaceOrderRequest = {
        items: buildItemsPayload(),
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        // Email is intentionally not sent: the server stamps the order
        // with the authenticated account's email.
        customerAddress: form.customerAddress.trim(),
        customerCity: form.customerCity.trim() || undefined,
        deliveryZone: form.deliveryZone,
        customerPostalCode: form.customerPostalCode.trim() || undefined,
        customerNote: form.customerNote.trim() || undefined,
        paymentMethod,
        promoCode: appliedPromo,
        clearCart: source.kind !== "buy-now",
      };

      if (
        paymentMethod === "SSLCOMMERZ" ||
        paymentMethod === "AIRWALLEX"
      ) {
        const attempt = resolveCheckoutIdempotencyAttempt(
          onlineIdempotencyAttemptRef.current,
          JSON.stringify(checkoutRequest),
          () => window.crypto.randomUUID(),
        );
        onlineIdempotencyAttemptRef.current = attempt;
        checkoutRequest.idempotencyKey = attempt.key;
      }

      const result = await placeCheckoutOrder(checkoutRequest);
      const paymentUrl =
        paymentMethod === "SSLCOMMERZ" ? result.paymentUrl : undefined;
      if (paymentMethod === "SSLCOMMERZ" && !paymentUrl) {
        throw new Error(
          "The secure payment session could not be started. Please try again.",
        );
      }

      // A full-cart order empties the cart; a selected-cart order removes
      // only the purchased lines. Keep Redux and local storage authoritative.
      await syncCartAfterOrder();

      if (paymentMethod === "SSLCOMMERZ" && paymentUrl) {
        toast.info("Redirecting to secure payment...");
        window.location.assign(paymentUrl);
        handingOffToGateway = true;
        return;
      }

      if (paymentMethod === "AIRWALLEX") {
        reservedAirwallexOrderId = result.order.id;
        toast.info("Opening Airwallex secure checkout...");
        await startAirwallexHostedCheckout(result.order.id);
        handingOffToGateway = true;
        return;
      }

      toast.success("Order placed successfully!");
      router.push(`/orders/${result.order.id}?just-placed=1`);
    } catch (error) {
      if (reservedAirwallexOrderId) {
        toast.info(
          "Your order is reserved. Open it to retry the secure payment.",
        );
        router.push(
          `/orders/${reservedAirwallexOrderId}?payment=failed`,
        );
        return;
      }
      if (
        error instanceof CheckoutSubmissionError &&
        error.orderId &&
        paymentMethod === "SSLCOMMERZ"
      ) {
        await syncCartAfterOrder();
        const outcome =
          error.paymentState === "PENDING" ||
          error.paymentState === "SUCCESS"
            ? "processing"
            : "failed";
        toast.info(
          outcome === "processing"
            ? "Your order is safe while payment status is checked."
            : "The payment attempt ended. Review the order for details.",
        );
        router.push(`/orders/${error.orderId}?payment=${outcome}`);
        return;
      }
      const message =
        error instanceof Error ? error.message : "Failed to place the order.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      if (!handingOffToGateway) {
        submitInFlightRef.current = false;
        setIsPlacingOrder(false);
      }
    }
  };

  const isEmpty = !previewLoading && (!preview || preview.items.length === 0);
  const isAuthenticated = authStatus === "authenticated";

  // Show a friendly gate while auth resolves or while we bounce
  // unauthenticated visitors to /login. Without this the customer
  // sees an empty form for a flash before the redirect kicks in.
  if (authStatus !== "authenticated") {
    return (
      <FullPageLoader
        title={
          authStatus === "loading"
            ? "Loading checkout..."
            : "Redirecting to sign in..."
        }
        message={
          authStatus === "loading"
            ? "One moment while we load your account."
            : "Please wait while we attach checkout to your account."
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-brand-light-bg">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <CheckoutHeader
          isAuthenticated={isAuthenticated}
          itemCount={preview?.items.reduce((sum, x) => sum + x.quantity, 0) ?? 0}
          source={source.kind}
        />

        {previewError && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{previewError}</span>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {isEmpty ? (
          <div className="mt-8 rounded-3xl border border-brand-border bg-brand-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">
              Nothing to check out yet
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Add a few products to your cart, then come back to complete the order.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand-red px-5 py-2.5 text-sm font-bold text-brand-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red-hover hover:shadow-xl"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
            <div className="flex min-w-0 flex-col gap-5">
              <CustomerForm
                form={form}
                onChange={(field, value) => {
                  setForm((prev) => ({ ...prev, [field]: value }));
                  if (fieldErrors[field]) {
                    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
                  }
                }}
                errors={fieldErrors}
                isAuthenticated={isAuthenticated}
                profileStatus={profileStatus}
                onRetryProfile={handleRetryProfile}
              />

              <PaymentMethodPicker
                value={paymentMethod}
                onChange={setPaymentMethod}
                airwallexEnabled={
                  preview?.availablePaymentMethods.includes("AIRWALLEX") ??
                  false
                }
              />

              <CheckoutItemsCard
                items={preview?.items ?? []}
                currency={preview?.summary.currency ?? BASE_CURRENCY}
                isLoading={previewLoading && !preview}
              />
            </div>

            <div className="lg:sticky lg:top-[88px] lg:self-start">
              <OrderSummaryCard
                summary={preview?.summary ?? null}
                isLoading={previewLoading && !preview}
                items={items}
                promoCode={promoCode}
                appliedPromo={appliedPromo}
                onPromoCodeChange={setPromoCode}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
                promoFeedback={promoFeedback}
                onPlaceOrder={handlePlaceOrder}
                isPlacing={isPlacingOrder}
                submitError={submitError}
                paymentMethod={paymentMethod}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutPageInner />
    </Suspense>
  );
}
