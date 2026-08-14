"use client";

import {
  ChevronRight,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ButtonLoader } from "@/components/ui/loading";
import type { CheckoutSummary } from "@/features/checkout/api";

import PromoCodeInput from "./PromoCodeInput";

type AppliedPromo = {
  code: string;
  discount: number;
  description: string | null;
};

type OrderSummaryProps = {
  summary: CheckoutSummary | null;
  fallbackSubtotal: number;
  itemCount: number;
  promo: AppliedPromo | null;
  promoError: string | null;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
  onPromoErrorClear: () => void;
  onCheckout: () => void;
  isApplyingPromo?: boolean;
  isCheckingOut?: boolean;
  isPricingLoading?: boolean;
  isCartSyncing?: boolean;
  isCheckoutDisabled?: boolean;
};

export default function OrderSummary({
  summary,
  fallbackSubtotal,
  itemCount,
  promo,
  promoError,
  onApplyPromo,
  onRemovePromo,
  onPromoErrorClear,
  onCheckout,
  isApplyingPromo = false,
  isCheckingOut = false,
  isPricingLoading = false,
  isCartSyncing = false,
  isCheckoutDisabled = false,
}: OrderSummaryProps) {
  const verifiedSummary = isPricingLoading ? null : summary;
  const subtotal = verifiedSummary?.subtotal ?? fallbackSubtotal;
  const totalSaved = verifiedSummary
    ? verifiedSummary.totalSavings + verifiedSummary.discount
    : 0;

  return (
    <aside
      className="sticky top-[88px] flex flex-col gap-4 rounded-3xl border border-brand-border bg-brand-white p-5 shadow-sm sm:p-6"
      aria-busy={isPricingLoading || isCheckingOut || isCartSyncing}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
        <span className="rounded-full bg-brand-light-bg px-2.5 py-0.5 text-xs font-semibold text-brand-black">
          {verifiedSummary
            ? "Server-priced"
            : isPricingLoading
              ? "Verifying..."
              : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        </span>
      </div>

      <PromoCodeInput
        applied={promo}
        onApply={onApplyPromo}
        onRemove={onRemovePromo}
        onErrorClear={onPromoErrorClear}
        error={promoError}
        isApplying={isApplyingPromo}
      />

      <div className="space-y-2.5 border-t border-dashed border-brand-border pt-4 text-sm">
        <SummaryRow label="Subtotal" value={subtotal} />
        {verifiedSummary?.discount && promo ? (
          <SummaryRow
            label={`Promo (${promo.code})`}
            value={-verifiedSummary.discount}
            tone="success"
          />
        ) : null}
        {verifiedSummary ? (
          <>
            <SummaryRow
              label={
                verifiedSummary.isOutsideDhaka
                  ? "Delivery outside Dhaka"
                  : "Delivery inside Dhaka"
              }
              value={verifiedSummary.shipping}
              freeLabel={
                verifiedSummary.shipping === 0 ? "FREE" : undefined
              }
            />
            <SummaryRow
              label={`Tax (${Math.round(verifiedSummary.taxRate * 100)}%)`}
              value={verifiedSummary.tax}
            />
          </>
        ) : (
          <>
            <SummaryTextRow
              label="Shipping"
              value={isPricingLoading ? "Calculating..." : "At checkout"}
            />
            <SummaryTextRow
              label="Tax"
              value={isPricingLoading ? "Calculating..." : "At checkout"}
            />
          </>
        )}
      </div>

      <div className="rounded-2xl border border-brand-border bg-brand-light-bg p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-gray-700">
            {verifiedSummary ? "Total" : "Subtotal"}
          </span>
          <span className="text-2xl font-extrabold text-brand-red sm:text-3xl">
            BDT {(verifiedSummary?.total ?? subtotal).toLocaleString()}
          </span>
        </div>
        {verifiedSummary && totalSaved > 0 && (
          <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Sparkles className="h-3 w-3" />
            You&apos;re saving BDT {totalSaved.toLocaleString()} today
          </p>
        )}
        {!verifiedSummary && (
          <p className="mt-1 text-[11px] text-gray-500">
            Shipping, tax, and promotions are verified before checkout.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={isCheckingOut || isCartSyncing || isCheckoutDisabled}
        aria-busy={isCheckingOut || isCartSyncing}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-red px-5 text-base font-bold text-brand-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-red-hover hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCartSyncing ? (
          <ButtonLoader label="Updating cart..." />
        ) : isCheckingOut ? (
          <ButtonLoader label="Opening checkout..." />
        ) : isCheckoutDisabled ? (
          "Select items to checkout"
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Secure Checkout
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        Pricing verified by server · Buyer protection included
      </div>
    </aside>
  );
}

function SummaryTextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-500">{value}</span>
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
