"use client";

import {
  Bookmark,
  Trash2,
  Truck,
  Tag,
  Sparkles,
  AlertTriangle,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CurrencyAmount } from "@/components/currency/CurrencyAmount";
import ColorBadge from "@/components/ui/ColorBadge";
import { cn } from "@/lib/utils";

import QuantityStepper from "./QuantityStepper";

type CartItem = {
  id: string;
  slug: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number;
  color?: string;
  size?: string;
  variantName?: string;
  attributeSummary?: string;
  inStock: boolean;
  deliveryDays?: number;
  perks?: string[];
};

type CartItemCardProps = {
  item: CartItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater: (id: string) => void;
  selected: boolean;
  selectionDisabled?: boolean;
  onSelectionChange: (id: string) => void;
};

export default function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  selected,
  selectionDisabled = false,
  onSelectionChange,
}: CartItemCardProps) {
  const hasDiscount =
    typeof item.originalPrice === "number" && item.originalPrice > item.price;
  const lineTotal = item.price * item.quantity;
  const lineSavings = hasDiscount
    ? (item.originalPrice! - item.price) * item.quantity
    : 0;
  const nearMax = item.quantity >= item.maxQuantity;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md sm:p-4",
        selected
          ? "border-brand-red/35 ring-1 ring-brand-red/10"
          : "border-gray-100 hover:border-brand-red/40",
      )}
    >
      <div className="flex gap-2 sm:gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={
            selectionDisabled
              ? `${item.name} is unavailable for checkout`
              : `${selected ? "Deselect" : "Select"} ${item.name} for checkout`
          }
          disabled={selectionDisabled}
          onClick={() => onSelectionChange(item.id)}
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center self-center rounded-full border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
            selected
              ? "border-brand-red bg-brand-red text-white shadow-sm"
              : "border-gray-300 bg-white text-transparent hover:border-brand-red",
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </button>

        <Link
          href={`/products/${item.slug}`}
          className="relative aspect-square w-32 h-32 justify-center items-center mt-8  shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:w-32"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 639px) 96px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hasDiscount && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-red px-1.5 py-0.5 text-[10px] font-bold text-brand-white shadow">
              -
              {Math.round(
                ((item.originalPrice! - item.price) / item.originalPrice!) *
                  100,
              )}
              %
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-text-muted">
                {item.brand}
              </p>
              <Link
                href={`/products/${item.slug}`}
                className="mt-0.5 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-brand-red sm:text-base"
              >
                {item.name}
              </Link>
              {(item.color || item.size) && (
                <ColorBadge color={item.color} size={item.size} className="mt-1" />
              )}
              {(item.variantName || item.attributeSummary) && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                  {[item.variantName, item.attributeSummary]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-base font-extrabold text-brand-red sm:text-lg">
                <CurrencyAmount amountBDT={lineTotal} />
              </p>
              {hasDiscount && (
                <p className="text-xs text-gray-400 line-through">
                  <CurrencyAmount
                    amountBDT={item.originalPrice! * item.quantity}
                  />
                </p>
              )}
              <p className="mt-0.5 text-[11px] text-gray-500">
                <CurrencyAmount amountBDT={item.price} /> each
              </p>
            </div>
          </div>

          {/* Perks */}
          {(item.perks?.length || item.deliveryDays) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {item.deliveryDays && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <Truck className="h-3 w-3" />
                  {item.deliveryDays}-day delivery
                </span>
              )}
              {item.perks?.map((perk) => (
                <span
                  key={perk}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-light-bg px-2 py-0.5 text-[11px] font-medium text-brand-text-dark"
                >
                  <Sparkles className="h-3 w-3" />
                  {perk}
                </span>
              ))}
            </div>
          )}

          {hasDiscount && (
            <p className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <Tag className="h-3 w-3" />
              You&apos;re saving <CurrencyAmount amountBDT={lineSavings} />
            </p>
          )}

          {/* Bottom row: quantity + actions */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-3">
              <QuantityStepper
                value={item.quantity}
                min={1}
                max={item.maxQuantity}
                onChange={(q) => onQuantityChange(item.id, q)}
              />
              {nearMax && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                  <AlertTriangle className="h-3 w-3" />
                  Max {item.maxQuantity}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onSaveForLater(item.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-brand-light-bg hover:text-brand-red"
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Save for later</span>
                <span className="sm:hidden">Save</span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label="Remove from cart"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
