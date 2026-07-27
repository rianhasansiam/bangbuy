"use client";

import { useState } from "react";
import { AlertCircle, Check, Tag, X } from "lucide-react";

import { Input } from "@/components/ui/input";

type AppliedPromo = {
  code: string;
  discount: number;
  description: string | null;
};

type PromoCodeInputProps = {
  applied: AppliedPromo | null;
  onApply: (code: string) => void;
  onRemove: () => void;
  onErrorClear: () => void;
  error: string | null;
  isApplying?: boolean;
};

export default function PromoCodeInput({
  applied,
  onApply,
  onRemove,
  onErrorClear,
  error,
  isApplying = false,
}: PromoCodeInputProps) {
  const [value, setValue] = useState("");

  const handleApply = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    onApply(trimmed);
  };

  if (applied) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
            <Check className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-800">
              <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-xs text-emerald-700">
                {applied.code}
              </span>
              applied
            </p>
            <p className="truncate text-xs text-emerald-700">
              {isApplying ? (
                "Revalidating discount..."
              ) : (
                <>
                  {applied.description ? `${applied.description} · ` : ""}-BDT{" "}
                  {applied.discount.toLocaleString()}
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove promo code"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
          <Input
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) onErrorClear();
            }}
            disabled={isApplying}
            maxLength={40}
            placeholder="Promo code"
            className="h-11 rounded-xl border-brand-border bg-white pl-10 pr-3 text-sm font-medium uppercase tracking-wide focus-visible:border-brand-red focus-visible:ring-brand-red/30"
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim() || isApplying}
          aria-busy={isApplying}
          className="rounded-xl bg-brand-red px-4 text-sm font-semibold text-brand-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          {isApplying ? "Applying..." : "Apply"}
        </button>
      </form>
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      <p className="text-[11px] text-gray-500">
        Promo availability and discount are verified by the checkout service.
      </p>
    </div>
  );
}
