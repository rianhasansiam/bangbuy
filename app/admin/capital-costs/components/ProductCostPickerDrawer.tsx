"use client";

import { useMemo, useState } from "react";
import { CheckSquare, Search, X } from "lucide-react";

import type { ProductCostOption } from "@/features/admin-capital-costs/api";
import { formatCurrency } from "@/features/admin-capital-costs/api";
import { ButtonLoader, LoadingSpinner } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

export default function ProductCostPickerDrawer({
  open,
  options,
  selectedProductIds,
  existingProductIds,
  currency,
  isLoading,
  isSubmitting,
  error,
  onToggle,
  onClose,
  onSubmit,
}: {
  open: boolean;
  options: ProductCostOption[];
  selectedProductIds: string[];
  existingProductIds: string[];
  currency: string;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onToggle: (productId: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(
    () => new Set(selectedProductIds),
    [selectedProductIds],
  );
  const existingSet = useMemo(
    () => new Set(existingProductIds),
    [existingProductIds],
  );
  const visibleOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((product) =>
      [product.name, product.productCode]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [options, query]);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-60 bg-gray-900/35 backdrop-blur-[1px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="product-cost-picker-title"
        className={cn(
          "fixed inset-y-0 right-0 z-70 flex w-full max-w-xl flex-col border-l border-brand-border bg-brand-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-border bg-brand-black px-5 py-4 text-white">
          <div>
            <h2 id="product-cost-picker-title" className="text-lg font-bold">
              Add product costs
            </h2>
            <p className="mt-0.5 text-xs text-white/70">
              Select the catalog products you want included in this tracker.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product cost picker"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="relative block">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by product name or code"
                className="h-10 w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-red"
              />
            </label>

            <p className="text-xs text-gray-500">
              {selectedProductIds.length} product
              {selectedProductIds.length === 1 ? "" : "s"} selected. Products
              already in the tracker cannot be added twice.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-light-bg p-8 text-sm font-medium text-gray-600">
                <LoadingSpinner decorative size="sm" />
                Loading products...
              </div>
            ) : visibleOptions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-border bg-brand-light-bg p-8 text-center text-sm text-gray-600">
                {options.length === 0
                  ? "No catalog products are available yet."
                  : "No products match your search."}
              </div>
            ) : (
              <div className="space-y-2">
                {visibleOptions.map((product) => {
                  const isExisting = existingSet.has(product.id);
                  const isChecked = selectedSet.has(product.id);
                  return (
                    <label
                      key={product.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border p-3 transition",
                        isExisting
                          ? "cursor-not-allowed border-brand-border bg-gray-50 opacity-65"
                          : isChecked
                            ? "border-brand-red bg-brand-light-bg"
                            : "border-brand-border bg-white hover:border-brand-red/60",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked || isExisting}
                        disabled={isExisting || isSubmitting}
                        onChange={() => onToggle(product.id)}
                        className="mt-1 h-4 w-4 rounded border-brand-border accent-brand-red"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-bold text-brand-black">
                            {product.name}
                          </span>
                          {isExisting && (
                            <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                              Already added
                            </span>
                          )}
                          {product.status === "INACTIVE" && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                              Inactive
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          {product.productCode}
                        </span>
                        <span className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <span>
                            <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Buying
                            </span>
                            {formatCurrency(product.buyingPrice, currency)}
                          </span>
                          <span>
                            <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Stock
                            </span>
                            {product.totalUnits.toLocaleString()}
                          </span>
                          <span>
                            <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Cost
                            </span>
                            <span className="font-bold text-brand-black">
                              {formatCurrency(product.totalCost, currency)}
                            </span>
                          </span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-brand-border bg-brand-white px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-brand-border px-4 text-sm font-semibold text-foreground transition hover:bg-brand-light-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedProductIds.length === 0 || isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-semibold text-white transition hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <ButtonLoader label="Adding..." />
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Add selected
                </>
              )}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
