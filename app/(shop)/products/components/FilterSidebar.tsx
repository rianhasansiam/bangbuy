"use client";

import { RotateCcw, Star } from "lucide-react";
import { useId, useState } from "react";

import type {
  CatalogCategoryFacet,
  CatalogFacets,
} from "@/features/products/api";
import { cn } from "@/lib/utils";

export type CatalogFilterState = {
  categoryPath: string;
  brandSlug: string;
  manufacturerSlug: string;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number;
  stock: "" | "in-stock" | "out-of-stock";
};

type Props = {
  filters: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  onReset: () => void;
  facets: CatalogFacets;
  className?: string;
};

type FlatCategory = CatalogCategoryFacet & { displayDepth: number };

function flattenCategories(
  categories: CatalogCategoryFacet[],
  displayDepth = 0,
): FlatCategory[] {
  return categories.flatMap((category) => [
    { ...category, displayDepth },
    ...flattenCategories(category.children, displayDepth + 1),
  ]);
}

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  facets,
  className,
}: Props) {
  const controlId = useId();
  const brandFilterId = `${controlId}-brand-filter`;
  const manufacturerFilterId = `${controlId}-manufacturer-filter`;
  const categories = flattenCategories(facets.categories);

  const update = <K extends keyof CatalogFilterState>(
    key: K,
    value: CatalogFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  const setMinRating = (rating: number) => {
    update("minRating", filters.minRating === rating ? 0 : rating);
  };

  return (
    <aside
      aria-label="Product filters"
      className={cn(
        "sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-brand-border bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-base font-bold text-gray-900">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="group flex items-center gap-1 text-xs font-semibold text-brand-red transition-colors hover:text-brand-red-hover"
        >
          <RotateCcw className="h-3 w-3 transition-transform duration-500 group-hover:-rotate-180" />
          Reset
        </button>
      </div>

      <FilterGroup title="Category">
        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          <FilterChoice
            active={!filters.categoryPath}
            label="All categories"
            count={facets.categories.reduce(
              (total, category) => total + category.totalProductCount,
              0,
            )}
            onClick={() => update("categoryPath", "")}
          />
          {categories.map((category) => (
            <FilterChoice
              key={category.id}
              active={filters.categoryPath === category.path}
              label={category.name}
              count={category.totalProductCount}
              onClick={() => update("categoryPath", category.path)}
              style={{ paddingLeft: `${8 + Math.min(category.displayDepth, 4) * 14}px` }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price range">
        <PriceFilter
          key={`${filters.minPrice ?? ""}:${filters.maxPrice ?? ""}:${facets.priceBounds.min}:${facets.priceBounds.max}`}
          filters={filters}
          bounds={facets.priceBounds}
          onApply={(minPrice, maxPrice) =>
            onChange({ ...filters, minPrice, maxPrice })
          }
        />
      </FilterGroup>

      <FilterGroup title="Customer rating">
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setMinRating(rating)}
              aria-pressed={filters.minRating === rating}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                filters.minRating === rating
                  ? "bg-brand-red/10 text-brand-red"
                  : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <span className="flex" aria-label={`${rating} stars and up`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    aria-hidden="true"
                    className={cn(
                      "h-3.5 w-3.5",
                      index < rating
                        ? "fill-brand-gold text-brand-gold"
                        : "text-gray-300",
                    )}
                  />
                ))}
              </span>
              <span className="text-xs">& up</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      {facets.brands.length > 0 && (
        <FilterGroup title="Brand">
          <label className="sr-only" htmlFor={brandFilterId}>
            Brand
          </label>
          <select
            id={brandFilterId}
            value={filters.brandSlug}
            onChange={(event) => update("brandSlug", event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
          >
            <option value="">All brands</option>
            {facets.brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name} ({brand.productCount})
              </option>
            ))}
          </select>
        </FilterGroup>
      )}

      {facets.manufacturers.length > 0 && (
        <FilterGroup title="Manufacturer">
          <label className="sr-only" htmlFor={manufacturerFilterId}>
            Manufacturer
          </label>
          <select
            id={manufacturerFilterId}
            value={filters.manufacturerSlug}
            onChange={(event) => update("manufacturerSlug", event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
          >
            <option value="">All manufacturers</option>
            {facets.manufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.slug}>
                {manufacturer.name} ({manufacturer.productCount})
              </option>
            ))}
          </select>
        </FilterGroup>
      )}

      <FilterGroup title="Availability" last>
        <div className="space-y-1">
          <FilterChoice
            active={!filters.stock}
            label="Any availability"
            count={facets.availability.inStock + facets.availability.outOfStock}
            onClick={() => update("stock", "")}
          />
          <FilterChoice
            active={filters.stock === "in-stock"}
            label="In stock"
            count={facets.availability.inStock}
            onClick={() => update("stock", "in-stock")}
          />
          <FilterChoice
            active={filters.stock === "out-of-stock"}
            label="Out of stock"
            count={facets.availability.outOfStock}
            onClick={() => update("stock", "out-of-stock")}
          />
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterChoice({
  active,
  label,
  count,
  onClick,
  style,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={style}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-brand-red/10 font-semibold text-brand-red"
          : "text-gray-700 hover:bg-gray-50 hover:text-brand-red",
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="shrink-0 text-[11px] text-gray-400">{count}</span>
    </button>
  );
}

function PriceFilter({
  filters,
  bounds,
  onApply,
}: {
  filters: CatalogFilterState;
  bounds: { min: number; max: number };
  onApply: (minPrice: number | null, maxPrice: number | null) => void;
}) {
  const [min, setMin] = useState(filters.minPrice?.toString() ?? "");
  const [max, setMax] = useState(filters.maxPrice?.toString() ?? "");

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const parsedMin = min.trim() === "" ? null : Math.max(0, Number(min));
        const parsedMax = max.trim() === "" ? null : Math.max(0, Number(max));
        const validMin =
          parsedMin != null && Number.isFinite(parsedMin) ? parsedMin : null;
        const validMax =
          parsedMax != null && Number.isFinite(parsedMax) ? parsedMax : null;
        onApply(
          validMin != null && validMax != null
            ? Math.min(validMin, validMax)
            : validMin,
          validMin != null && validMax != null
            ? Math.max(validMin, validMax)
            : validMax,
        );
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[11px] font-medium text-gray-500">
          Minimum
          <input
            inputMode="decimal"
            type="number"
            min={0}
            max={bounds.max || undefined}
            value={min}
            onChange={(event) => setMin(event.target.value)}
            placeholder={String(bounds.min)}
            className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-2 text-sm text-gray-800 outline-none focus:border-brand-red"
          />
        </label>
        <label className="text-[11px] font-medium text-gray-500">
          Maximum
          <input
            inputMode="decimal"
            type="number"
            min={0}
            max={bounds.max || undefined}
            value={max}
            onChange={(event) => setMax(event.target.value)}
            placeholder={String(bounds.max)}
            className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-2 text-sm text-gray-800 outline-none focus:border-brand-red"
          />
        </label>
      </div>
      <button
        type="submit"
        className="h-9 w-full rounded-lg border border-brand-red/20 bg-brand-red/5 text-xs font-semibold text-brand-red transition-colors hover:bg-brand-red/10"
      >
        Apply price
      </button>
    </form>
  );
}

function FilterGroup({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={`py-4 ${last ? "" : "border-b border-gray-100"}`}>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-900">
        {title}
      </h3>
      {children}
    </section>
  );
}
