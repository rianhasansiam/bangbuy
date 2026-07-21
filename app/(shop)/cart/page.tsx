"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "@/lib/auth/use-app-session";
import { useDispatch, useSelector } from "react-redux";

import CartHeader from "./components/CartHeader";
import CartItemCard from "./components/CartItemCard";
import EmptyCart from "./components/EmptyCart";
import FreeShippingBar from "./components/FreeShippingBar";
import OrderSummary from "./components/OrderSummary";
import SavedForLater from "./components/SavedForLater";
import {
  setCartData,
  setCartError,
} from "@/store/slices/cart.slice";
import type { AppDispatch, RootState } from "@/store";
import {
  addToCartOnServer,
  canUseServerCart,
  fetchServerCartSnapshot,
  removeCartItemOnServer,
  updateCartItemOnServer,
} from "@/features/cart/api";
import {
  fetchCheckoutPreview,
  type CheckoutPreview,
} from "@/features/checkout/api";
import {
  buildCheckoutHref,
  normalizeCheckoutPromoCode,
} from "@/features/checkout/promo";
import { computeCartSummary } from "@/features/cart/summary";
import {
  readLocalCart as readCartFromStorage,
  writeLocalCart,
  cartItemKey,
} from "@/features/cart/storage";
import type { CartItem } from "@/features/cart/api";
import {
  type SavedItem,
  readLocalSaved,
  writeLocalSaved,
} from "@/features/cart/saved-storage";
import { useAnimatedRemoval } from "@/hooks/useAnimatedRemoval";
import {
  LIST_ITEM_TRANSITION,
  LIST_ITEM_VARIANTS,
} from "@/lib/motion/list-removal";
import { confirm, toast } from "@/lib/feedback";
import { ButtonLoader, LoadingSpinner, SectionLoader } from "@/components/ui/loading";

type AppliedPromo = {
  code: string;
  discount: number;
  description: string | null;
};

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";

function readLocalCart(): CartItem[] {
  return readCartFromStorage({ dedupeByProductId: true });
}

function toSavedItem(item: CartItem): SavedItem {
  return {
    id: `saved:${item.variantId ?? item.productId}`,
    productId: item.productId,
    slug: item.slug ?? item.productId,
    variantId: item.variantId ?? null,
    sku: item.sku ?? null,
    variantName: item.variantName ?? null,
    color: item.color ?? null,
    size: item.size ?? null,
    attributes: item.attributes ?? null,
    attributeSummary: item.attributeSummary ?? null,
    name: item.name,
    brand: "PixoHouse",
    image: item.image ?? FALLBACK_PRODUCT_IMAGE,
    price: item.unitPrice,
    originalPrice: item.originalPrice > item.unitPrice ? item.originalPrice : undefined,
    inStock: item.status === "ACTIVE" && item.stock > 0,
  };
}

function toCartViewModel(item: CartItem) {
  return {
    id: item.id,
    productId: item.productId,
    slug: item.slug ?? item.productId,
    name: item.name,
    brand: "PixoHouse",
    image: item.image ?? FALLBACK_PRODUCT_IMAGE,
    price: item.unitPrice,
    originalPrice: item.originalPrice > item.unitPrice ? item.originalPrice : undefined,
    quantity: item.quantity,
    maxQuantity: Math.max(1, item.stock),
    color: item.color ?? undefined,
    size: item.size ?? undefined,
    variantName: item.variantName ?? undefined,
    attributeSummary: item.attributeSummary ?? undefined,
    inStock: item.status === "ACTIVE" && item.stock > 0,
    deliveryDays: 4,
    perks: ["Free returns"],
  };
}

function enrichCartItemFromPreview(
  item: CartItem,
  preview: CheckoutPreview | null,
): CartItem {
  const priced = preview?.items.find((candidate) =>
    item.variantId
      ? candidate.variantId === item.variantId
      : candidate.productId === item.productId,
  );
  if (!priced) return item;

  return {
    ...item,
    productId: priced.productId,
    variantId: priced.variantId,
    sku: priced.sku,
    variantName: priced.variantName,
    color: priced.color,
    size: priced.size,
    attributes: priced.attributes,
    attributeSummary: priced.attributeSummary,
    name: priced.name,
    image: priced.image ?? item.image,
    unitPrice: priced.unitPrice,
    originalPrice: priced.originalPrice,
    lineTotal: priced.lineTotal,
    stock: priced.stock,
    status: "ACTIVE",
  };
}

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const items = useSelector((state: RootState) => state.cart.items);
  const summary = useSelector((state: RootState) => state.cart.summary);
  const mode = useSelector((state: RootState) => state.cart.mode);
  const isLoading = useSelector((state: RootState) => state.cart.isLoading);
  const isHydrated = useSelector((state: RootState) => state.cart.isHydrated);
  const error = useSelector((state: RootState) => state.cart.error);

  const [saved, setSaved] = useState<SavedItem[]>(() => readLocalSaved());
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [promoCandidate, setPromoCandidate] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [checkoutPreview, setCheckoutPreview] =
    useState<CheckoutPreview | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState(0);
  const [isCheckoutPending, startCheckoutTransition] = useTransition();
  const itemsRef = useRef(items);

  const canUseServer = canUseServerCart(session?.user?.role, status);

  const {
    visibleItems: visibleCartItems,
    queueRemoval: queueCartRemoval,
  } = useAnimatedRemoval({
    items,
    getId: (item) => item.id,
  });

  const {
    visibleItems: visibleSavedItems,
    queueRemoval: queueSavedRemoval,
  } = useAnimatedRemoval({
    items: saved,
    getId: (item) => item.id,
  });

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const totals = useMemo(() => {
    const localItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const localSubtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const itemCount = mode === "server" ? summary.totalItems : localItemCount;
    const subtotal = mode === "server" ? summary.subtotal : localSubtotal;

    return {
      itemCount,
      subtotal,
    };
  }, [items, mode, summary]);

  const promoCodeForPreview = promoCandidate ?? promo?.code ?? null;
  const pricingReady =
    isHydrated &&
    status !== "loading" &&
    items.length > 0 &&
    (!canUseServer || (mode === "server" && !isLoading));

  useEffect(() => {
    if (!pricingReady) return;

    let ignore = false;

    void (async () => {
      setPricingLoading(true);
      setPricingError(null);

      try {
        const next = await fetchCheckoutPreview({
          items: canUseServer
            ? undefined
            : items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                ...(item.variantId ? { variantId: item.variantId } : {}),
              })),
          deliveryZone: "INSIDE_DHAKA",
          promoCode: promoCodeForPreview,
        });
        if (ignore) return;

        setCheckoutPreview(next);

        if (promoCodeForPreview) {
          if (next.promo?.ok) {
            setPromo({
              code: next.promo.code,
              discount: next.promo.discount,
              description: next.promo.description,
            });
            setPromoCandidate(null);
            setPromoError(null);
          } else {
            const reason =
              next.promo && !next.promo.ok
                ? next.promo.reason
                : "Promo code could not be applied.";
            setPromo(null);
            setPromoCandidate(promoCodeForPreview);
            setPromoError(reason);
          }
        } else {
          setPromo(null);
        }
      } catch (requestError) {
        if (ignore) return;
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Failed to verify cart totals.";
        setCheckoutPreview(null);
        setPricingError(message);
      } finally {
        if (!ignore) setPricingLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [
    canUseServer,
    items,
    pricingReady,
    previewToken,
    promoCodeForPreview,
  ]);

  const handleQuantityChange = async (id: string, quantity: number) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const verifiedTarget = enrichCartItemFromPreview(
      target,
      pricingReady && !pricingLoading ? checkoutPreview : null,
    );
    const safeQuantity = Math.max(
      1,
      Math.min(verifiedTarget.stock || 1, quantity),
    );
    dispatch(setCartError(null));

    if (canUseServer) {
      try {
        await updateCartItemOnServer(id, safeQuantity);
        const snapshot = await fetchServerCartSnapshot();
        dispatch(setCartData(snapshot));
        writeLocalCart(snapshot.items);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update cart quantity.";
        dispatch(setCartError(message));
        toast.error(message);
      }
      return;
    }

    // Local path: build the updated list directly from Redux state (the
    // source of truth) — do NOT re-read from localStorage, because
    // readLocalCart({ dedupeByProductId: true }) sums duplicate quantities
    // and would inflate the count on every change.
    const updatedItems = items.map((item) =>
      item.id === id
        ? { ...item, quantity: safeQuantity, lineTotal: item.unitPrice * safeQuantity }
        : item,
    );
    writeLocalCart(updatedItems);
    dispatch(setCartData({ items: updatedItems, summary: computeCartSummary(updatedItems) }));
  };

  const removeSavedFromLocal = (id: string) => {
    setSaved((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeLocalSaved(next);
      return next;
    });
  };

  const commitRemoveFromCart = async (id: string) => {
    dispatch(setCartError(null));

    if (canUseServer) {
      try {
        await removeCartItemOnServer(id);
        const snapshot = await fetchServerCartSnapshot();
        dispatch(setCartData(snapshot));
        writeLocalCart(snapshot.items);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to remove item from cart.";
        dispatch(setCartError(message));
        throw new Error(message);
      }
      return;
    }

    const next = itemsRef.current.filter((item) => item.id !== id);
    writeLocalCart(next);
    dispatch(setCartData({ items: next, summary: computeCartSummary(next) }));
  };

  const handleRemove = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const ok = await confirm({
      title: "Remove item?",
      description: `"${target.name}" will be removed from your cart.`,
      confirmLabel: "Remove",
      variant: "danger",
    });
    if (!ok) return;

    queueCartRemoval(
      id,
      async () => {
        await commitRemoveFromCart(id);
        toast.success("Item removed from cart");
      },
      (error) => {
        const message =
          error instanceof Error ? error.message : "Failed to remove item from cart.";
        toast.error(message);
      },
    );
  };

  const handleSaveForLater = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const savedItem = toSavedItem(
      enrichCartItemFromPreview(
        target,
        pricingReady && !pricingLoading ? checkoutPreview : null,
      ),
    );

    queueCartRemoval(
      id,
      async () => {
        await commitRemoveFromCart(id);
        setSaved((prev) => {
          const next = [savedItem, ...prev.filter((item) => item.id !== savedItem.id)];
          writeLocalSaved(next);
          return next;
        });
        toast.info("Saved for later");
      },
      (error) => {
        const message =
          error instanceof Error ? error.message : "Failed to save item for later.";
        toast.error(message);
      },
    );
  };

  const handleSavedRemove = (id: string) => {
    queueSavedRemoval(id, () => {
      removeSavedFromLocal(id);
      toast.success("Removed from saved items");
    });
  };

  const handleSavedMoveToCart = (id: string) => {
    const target = saved.find((item) => item.id === id);
    if (!target || !target.inStock) return;

    queueSavedRemoval(
      id,
      async () => {
        if (canUseServer) {
          dispatch(setCartError(null));

          try {
            await addToCartOnServer(target.productId, 1, target.variantId);
            const snapshot = await fetchServerCartSnapshot();
            dispatch(setCartData(snapshot));
            writeLocalCart(snapshot.items);
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Failed to move saved item to cart.";
            dispatch(setCartError(message));
            throw new Error(message);
          }
        } else {
          const localCartBefore = readLocalCart();
          const savedKey = cartItemKey(target);
          const existing = localCartBefore.find(
            (item) => cartItemKey(item) === savedKey,
          );
          const nextItem: CartItem = existing
            ? {
                ...existing,
                quantity: existing.quantity + 1,
                lineTotal: existing.unitPrice * (existing.quantity + 1),
              }
            : {
                id: `local:${target.variantId ?? target.productId}`,
                productId: target.productId,
                variantId: target.variantId ?? null,
                sku: target.sku ?? null,
                variantName: target.variantName ?? null,
                color: target.color ?? null,
                size: target.size ?? null,
                attributes: target.attributes ?? null,
                attributeSummary: target.attributeSummary ?? null,
                name: target.name,
                image: target.image,
                quantity: 1,
                unitPrice: target.price,
                originalPrice: target.originalPrice ?? target.price,
                lineTotal: target.price,
                stock: 10,
                status: "ACTIVE",
              };

          const localCartAfter = existing
            ? localCartBefore.map((item) =>
                cartItemKey(item) === savedKey ? nextItem : item,
              )
            : [nextItem, ...localCartBefore];

          writeLocalCart(localCartAfter);
          dispatch(
            setCartData({
              items: localCartAfter,
              summary: computeCartSummary(localCartAfter),
            }),
          );
        }

        removeSavedFromLocal(id);
        toast.success(`${target.name} moved to cart`);
      },
      (error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to move saved item to cart.";
        toast.error(message);
      },
    );
  };

  const handleApplyPromo = (code: string) => {
    const normalized = normalizeCheckoutPromoCode(code);
    if (!normalized) {
      setPromoError("Enter a promo code between 2 and 40 characters.");
      return;
    }

    setPromoError(null);
    setPromoCandidate(normalized);
    setPreviewToken((token) => token + 1);
  };

  const handleRemovePromo = () => {
    setPromo(null);
    setPromoCandidate(null);
    setPromoError(null);
    toast.info("Promo code removed");
  };

  const handleCheckout = () => {
    const target = buildCheckoutHref(promo?.code);
    // Checkout requires authentication so the order can be attached
    // to a real user record. Bounce unauthenticated visitors to the
    // sign-in page first, with a callbackUrl that lands them right
    // back on /checkout.
    if (status !== "authenticated") {
      startCheckoutTransition(() => {
        router.push(`/login?callbackUrl=${encodeURIComponent(target)}`);
      });
      return;
    }
    startCheckoutTransition(() => {
      router.push(target);
    });
  };

  const isEmpty = items.length === 0;
  const verifiedPreview =
    pricingReady && !pricingLoading ? checkoutPreview : null;
  const verifiedSummary = verifiedPreview?.summary ?? null;
  const itemCards = visibleCartItems.map((item) =>
    toCartViewModel(enrichCartItemFromPreview(item, verifiedPreview)),
  );
  const mobileAmount = verifiedSummary?.total ?? totals.subtotal;

  return (
    <main className="min-h-screen bg-brand-light-bg">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <CartHeader itemCount={totals.itemCount} />

        <div className="mt-2 flex items-center justify-between px-1 text-xs text-gray-500">
          <span>Storage mode: {mode === "server" ? "Server + Local" : "Local only"}</span>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5">
              <LoadingSpinner decorative size="xs" />
              Syncing cart...
            </span>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {pricingError && !error && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {pricingError} Shipping, tax, and promotions will be checked again at
            checkout.
          </div>
        )}

        {isLoading && isEmpty ? (
          <SectionLoader title="Loading cart" rows={6} className="mt-6" />
        ) : isEmpty ? (
          <>
            <EmptyCart />
            {visibleSavedItems.length > 0 && (
              <div className="mt-6">
                <SavedForLater
                  items={visibleSavedItems}
                  onMoveToCart={handleSavedMoveToCart}
                  onRemove={handleSavedRemove}
                />
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            <div className="flex min-w-0 flex-col gap-4">
              {verifiedSummary && verifiedSummary.freeShippingThreshold > 0 && (
                <FreeShippingBar
                  subtotal={
                    verifiedSummary.subtotal - verifiedSummary.discount
                  }
                  threshold={verifiedSummary.freeShippingThreshold}
                />
              )}

              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {itemCards.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={LIST_ITEM_VARIANTS}
                      transition={LIST_ITEM_TRANSITION}
                      className="overflow-hidden"
                    >
                      <CartItemCard
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemove}
                        onSaveForLater={handleSaveForLater}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-dashed border-brand-border bg-brand-white/60 px-4 py-3 text-sm">
                <p className="text-gray-600">Looking for something else?</p>
                <Link
                  href="/products"
                  className="font-semibold text-brand-red hover:underline"
                >
                  Continue shopping {"->"}
                </Link>
              </div>

              <SavedForLater
                items={visibleSavedItems}
                onMoveToCart={handleSavedMoveToCart}
                onRemove={handleSavedRemove}
              />
            </div>

            <div className="hidden lg:block">
              <OrderSummary
                summary={verifiedSummary}
                fallbackSubtotal={totals.subtotal}
                itemCount={totals.itemCount}
                promo={promo}
                promoError={promoError}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
                onPromoErrorClear={() => setPromoError(null)}
                onCheckout={handleCheckout}
                isApplyingPromo={pricingLoading && promoCodeForPreview !== null}
                isCheckingOut={isCheckoutPending}
                isPricingLoading={pricingReady && pricingLoading}
              />
            </div>

            <div className="lg:hidden">
              <OrderSummary
                summary={verifiedSummary}
                fallbackSubtotal={totals.subtotal}
                itemCount={totals.itemCount}
                promo={promo}
                promoError={promoError}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
                onPromoErrorClear={() => setPromoError(null)}
                onCheckout={handleCheckout}
                isApplyingPromo={pricingLoading && promoCodeForPreview !== null}
                isCheckingOut={isCheckoutPending}
                isPricingLoading={pricingReady && pricingLoading}
              />
            </div>
          </div>
        )}

        {!isEmpty && <div className="h-24 lg:hidden" />}
      </div>

      {!isEmpty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-brand-white/95 px-4 py-3 backdrop-blur-lg shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-gray-500">
                {verifiedSummary ? "Total" : "Subtotal"} ({totals.itemCount}{" "}
                {totals.itemCount === 1 ? "item" : "items"})
              </p>
              <p className="text-lg font-extrabold text-brand-red">
                BDT {mobileAmount.toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckoutPending}
              aria-busy={isCheckoutPending}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-brand-red px-5 text-sm font-bold text-brand-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red-hover hover:shadow-xl"
            >
              {isCheckoutPending ? (
                <ButtonLoader label="Opening checkout..." />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Checkout
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
