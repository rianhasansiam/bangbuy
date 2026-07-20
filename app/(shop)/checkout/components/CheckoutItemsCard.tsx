"use client";

import { Package } from "lucide-react";

import type { CheckoutItemPriced } from "@/features/checkout/api";
import ColorBadge from "@/components/ui/ColorBadge";
import { Skeleton } from "@/components/ui/loading";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";

type CheckoutItemsCardProps = {
  items: CheckoutItemPriced[];
  isLoading: boolean;
};

export default function CheckoutItemsCard({
  items,
  isLoading,
}: CheckoutItemsCardProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-white p-5 shadow-sm sm:p-6">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-light-bg text-brand-black">
            <Package className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-bold text-gray-900">Order items</h2>
        </div>
        <span className="text-xs text-gray-500">
          {items.length} {items.length === 1 ? "product" : "products"}
        </span>
      </header>

      {isLoading ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-brand-border bg-brand-light-bg p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border bg-brand-light-bg p-6 text-center text-sm text-gray-600">
          No items selected.
        </div>
      ) : (
        <ul className="divide-y divide-brand-border">
          {items.map((item) => {
            const savings =
              (item.originalPrice - item.unitPrice) * item.quantity;
            return (
              <li
                key={item.variantId || item.productId}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-border bg-brand-light-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <ColorBadge
                    color={item.color}
                    size={item.size}
                    className="mt-0.5"
                  />
                  <p className="mt-0.5 text-xs text-gray-500">
                    Qty {item.quantity} • BDT{" "}
                    {item.unitPrice.toLocaleString()} each
                  </p>
                  {savings > 0 && (
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">
                      You save BDT {savings.toLocaleString()}
                    </p>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900">
                  BDT {item.lineTotal.toLocaleString()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
