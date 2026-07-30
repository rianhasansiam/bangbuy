"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  LoaderCircle,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { useSession } from "@/lib/auth/use-app-session";

import { fetchOrderDetail, type OrderDetail } from "@/features/orders/api";
import {
  isAwaitingSslCommerzConfirmation,
  paymentMethodLabel,
  PAYMENT_STATUS_META,
} from "@/features/orders/payment";
import { downloadOrderPdf } from "@/features/orders/pdf";
import { clearOrderSnapshot } from "@/features/orders/storage";
import { ORDER_STATUS_META } from "@/lib/orders/status";
import ColorBadge from "@/components/ui/ColorBadge";
import { ButtonLoader, OrderDetailsPageSkeleton } from "@/components/ui/loading";
import OrderTracker from "./OrderTracker";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";
const PAYMENT_POLL_INTERVAL_MS = 2_500;
const PAYMENT_POLL_TIMEOUT_MS = 60_000;

type OrderSummaryClientProps = {
  orderId: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; order: OrderDetail }
  | { status: "error"; message: string };

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const STATUS_TONE: Record<
  OrderDetail["status"],
  { label: string; pill: string }
> = Object.fromEntries(
  Object.entries(ORDER_STATUS_META).map(([status, meta]) => [
    status,
    { label: meta.label, pill: meta.tone.pill },
  ]),
) as Record<OrderDetail["status"], { label: string; pill: string }>;

export default function OrderSummaryClient({ orderId }: OrderSummaryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();

  const justPlaced = searchParams.get("just-placed") === "1";
  const paymentParameter = searchParams.get("payment");
  const paymentReturnOutcome =
    paymentParameter === "processing" ||
    paymentParameter === "failed" ||
    paymentParameter === "cancelled"
      ? paymentParameter
      : null;

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [paymentPollTimedOut, setPaymentPollTimedOut] = useState(false);

  // Load only through the owner-scoped API. Browser storage is untrusted and
  // must never paint another customer's or a forged receipt.
  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus !== "authenticated") return;

    let ignore = false;
    clearOrderSnapshot();

    void (async () => {
      try {
        const order = await fetchOrderDetail(orderId);
        if (ignore) return;
        setState({ status: "ready", order });
      } catch (error) {
        if (ignore) return;
        const message =
          error instanceof Error
            ? error.message
            : "We couldn't find this order on your account.";
        setState({ status: "error", message });
      }
    })();

    return () => {
      ignore = true;
    };
  }, [authStatus, orderId]);

  // SSLCommerz redirects are navigation only, never proof of payment. Poll the
  // existing owner-scoped, no-store order endpoint for up to one minute so the
  // page reflects the server-authoritative IPN/validation result.
  useEffect(() => {
    if (authStatus !== "authenticated" || !paymentReturnOutcome) return;

    let ignore = false;
    let timer: number | undefined;
    const startedAt = Date.now();

    const poll = async () => {
      if (ignore) return;

      try {
        const nextOrder = await fetchOrderDetail(orderId);
        if (ignore) return;

        setState({ status: "ready", order: nextOrder });
        if (
          nextOrder.requiresPaymentReview ||
          !isAwaitingSslCommerzConfirmation(
            nextOrder.paymentMethod,
            nextOrder.paymentStatus,
          )
        ) {
          return;
        }
      } catch {
        // A transient read failure should not replace an already-rendered
        // receipt. Keep retrying within the same bounded polling window.
      }

      if (ignore) return;
      if (Date.now() - startedAt >= PAYMENT_POLL_TIMEOUT_MS) {
        setPaymentPollTimedOut(true);
        return;
      }

      timer = window.setTimeout(() => {
        void poll();
      }, PAYMENT_POLL_INTERVAL_MS);
    };

    timer = window.setTimeout(() => {
      void poll();
    }, PAYMENT_POLL_INTERVAL_MS);

    return () => {
      ignore = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [authStatus, orderId, paymentReturnOutcome]);

  const order = state.status === "ready" ? state.order : null;

  const totalSavings = useMemo(() => {
    if (!order) return 0;
    return Math.max(0, order.discountAmount);
  }, [order]);

  const handleDownload = async () => {
    if (!order || downloading) return;
    setDownloadError(null);
    setDownloading(true);
    try {
      // Yield a frame so the loading state can paint before jsPDF
      // takes the main thread.
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await downloadOrderPdf(order);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate PDF.";
      setDownloadError(message);
    } finally {
      setDownloading(false);
    }
  };

  if (
    authStatus === "loading" ||
    (authStatus === "authenticated" && state.status === "loading")
  ) {
    return <OrderDetailsPageSkeleton />;
  }

  if (authStatus !== "authenticated" || state.status === "error" || !order) {
    const message =
      authStatus !== "authenticated"
        ? "Sign in to view this order."
        : state.status === "error"
          ? state.message
          : "Sign in or open the original checkout link to view this order.";
    return (
      <main className="min-h-screen bg-brand-light-bg">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-rose-700">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
              Order not available
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-red px-5 py-2.5 text-sm font-bold text-brand-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red-hover hover:shadow-xl"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse products
              </Link>
              {authStatus !== "authenticated" && (
                <Link
                  href={`/login?callbackUrl=/orders/${orderId}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-brand-border bg-brand-white px-5 py-2.5 text-sm font-bold text-brand-black transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-red hover:bg-brand-light-bg"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const statusBadge = STATUS_TONE[order.status] ?? STATUS_TONE.PENDING;
  const paymentBadge =
    PAYMENT_STATUS_META[order.paymentStatus] ?? PAYMENT_STATUS_META.UNPAID;
  const showPaymentResult =
    order.paymentMethod === "SSLCOMMERZ" &&
    (paymentReturnOutcome !== null || order.requiresPaymentReview);
  const paymentUnderReview = order.requiresPaymentReview;

  const addressLines = [
    order.customerAddress,
    [order.customerCity, order.customerPostalCode]
      .filter((part): part is string => Boolean(part))
      .join(" "),
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-brand-light-bg">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-brand-border bg-brand-white shadow-sm">
          <div className="relative bg-brand-black px-6 py-8 text-brand-white sm:px-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {justPlaced ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Order placed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    Order summary
                  </span>
                )}
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  #{order.orderNumber}
                </h1>
                <p className="mt-2 text-sm text-white/85">
                  Placed on {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  aria-busy={downloading}
                >
                  {downloading ? (
                    <ButtonLoader label="Generating PDF..." />
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </button>
                {downloadError && (
                  <p className="rounded-lg bg-rose-500/30 px-2 py-1 text-[11px] font-medium text-white">
                    {downloadError}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-3 border-t border-brand-border p-5 sm:grid-cols-4 sm:p-6">
            <Stat label="Order ID" value={order.id} mono />
            <Stat label="Order date" value={formatDateTime(order.createdAt)} />
            <Stat
              label="Order status"
              custom={
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusBadge.pill}`}
                >
                  <Package className="h-3.5 w-3.5" />
                  {statusBadge.label}
                </span>
              }
            />
            <Stat
              label="Payment"
              custom={
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {paymentMethodLabel(order.paymentMethod)}
                  </span>
                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${paymentBadge.pill}`}
                  >
                    {paymentBadge.label}
                  </span>
                </div>
              }
            />
          </div>
        </section>

        {showPaymentResult && (
          <section
            aria-live="polite"
            className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${
              paymentUnderReview
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : order.paymentStatus === "PAID"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : order.paymentStatus === "REFUNDED"
                    ? "border-slate-200 bg-slate-50 text-slate-800"
                : order.paymentStatus === "FAILED"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
            }`}
          >
            {paymentUnderReview ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : order.paymentStatus === "PAID" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : order.paymentStatus === "REFUNDED" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : order.paymentStatus === "FAILED" ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : paymentPollTimedOut ? (
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
            )}
            <div>
              <h2 className="text-sm font-bold">
                {paymentUnderReview && order.paymentStatus !== "PAID"
                  ? "Payment verification needs review"
                  : order.paymentStatus === "PAID"
                  ? paymentUnderReview
                    ? "Payment received — review pending"
                    : "Payment confirmed"
                  : order.paymentStatus === "REFUNDED"
                    ? "Payment refunded"
                  : order.paymentStatus === "FAILED"
                    ? "Payment was not completed"
                    : paymentPollTimedOut
                      ? "Payment confirmation is taking longer than expected"
                      : paymentReturnOutcome === "failed"
                        ? "Checking the failed payment"
                        : paymentReturnOutcome === "cancelled"
                          ? "Checking the cancelled payment"
                          : "Confirming your payment"}
              </h2>
              <p className="mt-1 text-xs leading-5">
                {paymentUnderReview && order.paymentStatus !== "PAID"
                  ? "BangBuy detected a gateway verification discrepancy. The order remains safely on hold while support investigates the payment."
                  : order.paymentStatus === "PAID"
                  ? paymentUnderReview
                    ? "BangBuy verified the payment, but the order is safely on hold for an operations review."
                    : "SSLCommerz has been verified by BangBuy. Your order is ready for processing."
                  : order.paymentStatus === "REFUNDED"
                    ? "BangBuy recorded the externally confirmed SSLCommerz refund. No payment is retained for this order."
                  : order.paymentStatus === "FAILED"
                    ? "BangBuy has not confirmed this payment. You can review your orders or try checkout again."
                    : paymentPollTimedOut
                      ? "Your order remains safe. Check this page again shortly for the authoritative payment status."
                      : paymentReturnOutcome === "failed"
                        ? "SSLCommerz returned a failure signal. BangBuy is waiting for the authoritative server notification before finalizing the order."
                        : paymentReturnOutcome === "cancelled"
                          ? "SSLCommerz returned a cancellation signal. BangBuy is waiting for the authoritative server notification before finalizing the order."
                          : "BangBuy is waiting for secure server verification from SSLCommerz. This page updates automatically."}
              </p>
            </div>
          </section>
        )}

        {/* Tracking timeline */}
        <OrderTracker
          status={order.status}
          history={order.statusHistory ?? []}
          className="mt-6"
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-5">
            {/* Customer + shipping */}
            <section className="rounded-3xl border border-brand-border bg-brand-white p-5 shadow-sm sm:p-6">
              <header className="mb-4 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-light-bg text-brand-black">
                  <User className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  Customer details
                </h2>
              </header>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Field
                  icon={<User className="h-4 w-4" />}
                  label="Name"
                  value={order.customerName}
                />
                <Field
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={order.customerPhone}
                />
                <Field
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={order.customerEmail ?? "—"}
                />
                <Field
                  icon={<Truck className="h-4 w-4" />}
                  label="Payment method"
                  value={paymentMethodLabel(order.paymentMethod)}
                />
                <div className="sm:col-span-2">
                  <Field
                    icon={<MapPin className="h-4 w-4" />}
                    label="Shipping address"
                    value={addressLines.join(", ")}
                  />
                </div>
                {order.customerNote && (
                  <div className="sm:col-span-2">
                    <Field
                      icon={<Mail className="h-4 w-4" />}
                      label="Note from customer"
                      value={order.customerNote}
                    />
                  </div>
                )}
              </dl>
            </section>

            {/* Items */}
            <section className="rounded-3xl border border-brand-border bg-brand-white p-5 shadow-sm sm:p-6">
              <header className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-light-bg text-brand-black">
                    <Package className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">Items</h2>
                </div>
                <span className="text-xs text-gray-500">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "product" : "products"}
                </span>
              </header>
              <ul className="divide-y divide-brand-border">
                {order.items.map((item) => {
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-border bg-brand-light-bg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.productImage || FALLBACK_IMAGE}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {item.productName}
                        </p>
                        <ColorBadge
                          color={item.color}
                          size={item.size}
                          className="mt-0.5"
                        />
                        {(item.variantName || item.attributeSummary) && (
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500">
                            {[item.variantName, item.attributeSummary]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-gray-500">
                          Qty {item.quantity} · BDT {item.unitPrice.toLocaleString()} each
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        BDT {item.totalPrice.toLocaleString()}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* Totals */}
          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <section className="rounded-3xl border border-brand-border bg-brand-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Total</h2>
              <div className="mt-4 space-y-2.5 text-sm">
                <SummaryRow label="Subtotal" value={order.subtotal} />
                {order.discountAmount > 0 && (
                  <SummaryRow
                    label={
                      order.promoCode
                        ? `Discount (${order.promoCode})`
                        : "Discount"
                    }
                    value={-order.discountAmount}
                    tone="success"
                  />
                )}
                <SummaryRow
                  label="Delivery charge"
                  value={order.deliveryCharge}
                  freeLabel={order.deliveryCharge === 0 ? "FREE" : undefined}
                />
                {order.taxAmount > 0 && (
                  <SummaryRow label="Tax" value={order.taxAmount} />
                )}
                {order.advancePayment > 0 && (
                  <>
                    <SummaryRow
                      label="Advance payment"
                      value={-order.advancePayment}
                      tone="success"
                    />
                    <SummaryRow
                      label="Balance due"
                      value={Math.max(
                        order.totalAmount - order.advancePayment,
                        0,
                      )}
                    />
                  </>
                )}
              </div>
              <div className="mt-4 rounded-2xl border border-brand-border bg-brand-light-bg p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Grand total
                  </span>
                  <span className="text-2xl font-extrabold text-brand-red sm:text-3xl">
                    BDT {order.totalAmount.toLocaleString()}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    You saved BDT {totalSavings.toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-red text-base font-bold text-brand-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-red-hover hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:translate-y-0"
                aria-busy={downloading}
              >
                {downloading ? (
                  <ButtonLoader label="Generating PDF..." />
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF receipt
                  </>
                )}
              </button>
              {downloadError && (
                <p className="mt-2 flex items-start gap-1.5 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {downloadError}
                </p>
              )}
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-brand-border bg-brand-white text-sm font-bold text-brand-black transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-red hover:bg-brand-light-bg"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue shopping
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-light-bg text-brand-black">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="mt-0.5 wrap-break-word text-sm font-medium text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  custom,
  mono,
}: {
  label: string;
  value?: string;
  custom?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <div className="mt-1">
        {custom ? (
          custom
        ) : (
          <p
            className={`break-all text-sm font-bold text-gray-900 ${mono ? "font-mono" : ""}`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone = "default",
  freeLabel,
}: {
  label: string;
  value: number;
  tone?: "default" | "success";
  freeLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      {freeLabel ? (
        <span className="font-bold uppercase tracking-wider text-emerald-600">
          {freeLabel}
        </span>
      ) : (
        <span
          className={`font-semibold ${
            tone === "success" ? "text-emerald-600" : "text-gray-900"
          }`}
        >
          {value < 0 ? "-" : ""}BDT {Math.abs(value).toLocaleString()}
        </span>
      )}
    </div>
  );
}
