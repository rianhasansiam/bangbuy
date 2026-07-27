"use client";

import { Banknote, CreditCard, ShieldCheck } from "lucide-react";

import type { CheckoutPaymentMethod } from "@/features/checkout/api";
import { cn } from "@/lib/utils";

type PaymentMethodPickerProps = {
  value: CheckoutPaymentMethod;
  onChange: (value: CheckoutPaymentMethod) => void;
};

type PaymentOption = {
  value: CheckoutPaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
};

const OPTIONS: PaymentOption[] = [
  {
    value: "CASH_ON_DELIVERY",
    label: "Cash on delivery",
    description: "Pay in cash when the order arrives at your address.",
    icon: <Banknote className="h-5 w-5" />,
    badge: "No prepayment",
  },
  {
    value: "SSLCOMMERZ",
    label: "Online payment",
    description: "Secure payment via SSLCommerz.",
    icon: <CreditCard className="h-5 w-5" />,
    badge: "Visa / Mastercard",
  },
];

export default function PaymentMethodPicker({
  value,
  onChange,
}: PaymentMethodPickerProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-white p-5 shadow-sm sm:p-6">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Payment method</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Pick how you&apos;d like to pay. You can change it before placing the order.
          </p>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          Buyer protection
        </span>
      </header>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={cn(
                "group flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200",
                active
                  ? "border-brand-red bg-brand-red/5 shadow-sm ring-2 ring-brand-red/30"
                  : "border-brand-border bg-brand-white hover:border-brand-red/40 hover:bg-brand-light-bg",
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
                  active
                    ? "bg-brand-red text-brand-white"
                    : "bg-brand-light-bg text-brand-black group-hover:bg-brand-border",
                )}
              >
                {option.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {option.label}
                  </span>
                  {option.badge ? (
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        active
                          ? "bg-brand-red text-brand-white"
                          : "bg-brand-light-bg text-brand-black",
                      )}
                    >
                      {option.badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs text-gray-600">
                  {option.description}
                </span>
              </span>
              <span
                className={cn(
                  "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  active
                    ? "border-brand-red bg-brand-red"
                    : "border-brand-border bg-brand-white",
                )}
              >
                {active && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
