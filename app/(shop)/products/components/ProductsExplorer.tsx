"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import { ProductGridSkeleton } from "@/components/ui/loading";
import {
  type ApiMeta,
  type CatalogFacets,
  type Product,
  type ProductSortOption,
} from "@/features/products/api";
import {
  parseProductsPageQuery,
  PRODUCTS_PAGE_SIZE,
} from "@/lib/catalog/products-page-query";
import { cn } from "@/lib/utils";

import FilterSidebar, {
  type CatalogFilterState,
} from "./FilterSidebar";
import MobileFilterDrawer from "./MobileFilterDrawer";
import ProductsGrid from "./ProductsGrid";
import ProductToolbar from "./ProductToolbar";

type ViewMode = "grid" | "list";

const EMPTY_FACETS: CatalogFacets = {
  categories: [],
  brands: [],
  manufacturers: [],
  priceBounds: { min: 0, max: 0 },
  availability: { inStock: 0, outOfStock: 0 },
};
const EMPTY_META: ApiMeta = {
  page: 1,
  pageSize: PRODUCTS_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};
type ProductsExplorerProps = {
  initialProducts: Product[];
  initialMeta: ApiMeta;
  initialFacets: CatalogFacets;
};

export default function ProductsExplorer({
  initialProducts,
  initialMeta,
  initialFacets,
}: ProductsExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedParams = searchParams.toString();

  const query = useMemo(
    () => parseProductsPageQuery(new URLSearchParams(serializedParams)),
    [serializedParams],
  );

  const filters: CatalogFilterState = {
    categoryPath: query.categoryPath,
    brandSlug: query.brandSlug,
    manufacturerSlug: query.manufacturerSlug,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    minRating: query.minRating,
    stock: query.stock,
  };

  const products = initialProducts;
  const meta = initialMeta ?? EMPTY_META;
  const facets = initialFacets ?? EMPTY_FACETS;
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const updateUrl = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(serializedParams);
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "" || value === 0) params.delete(key);
        else params.set(key, String(value));
      }
      const next = params.toString();
      startTransition(() => {
        router.push(next ? `${pathname}?${next}` : pathname);
      });
    },
    [pathname, router, serializedParams, startTransition],
  );

  const handleFiltersChange = (next: CatalogFilterState) => {
    setMobileFilterOpen(false);
    updateUrl({
      categoryPath: next.categoryPath,
      brandSlug: next.brandSlug,
      manufacturerSlug: next.manufacturerSlug,
      minPrice: next.minPrice,
      maxPrice: next.maxPrice,
      stock: next.stock,
      minRating: next.minRating,
      page: null,
    });
  };

  const resetFilters = () => {
    setMobileFilterOpen(false);
    updateUrl({
      categoryPath: null,
      brandSlug: null,
      manufacturerSlug: null,
      minPrice: null,
      maxPrice: null,
      stock: null,
      minRating: null,
      page: null,
    });
  };

  const activeFilterCount = [
    filters.categoryPath,
    filters.brandSlug,
    filters.manufacturerSlug,
    filters.minPrice,
    filters.maxPrice,
    filters.stock,
    filters.minRating,
  ].filter((value) => value !== "" && value != null && value !== 0).length;

  return (
    <div className="min-h-screen bg-brand-light-bg">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            {query.search ? `Results for “${query.search}”` : "All products"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse the catalog with live availability and verified customer ratings.
          </p>
          <ActiveFilterChips
            query={query.search}
            filters={filters}
            facets={facets}
            onRemove={(key) => updateUrl({ [key]: null, page: null })}
          />
        </div>

        <div className="flex gap-5">
          <div
            className={cn(
              "hidden shrink-0 overflow-hidden transition-[width,opacity,margin] duration-300 ease-in-out lg:block",
              sidebarOpen ? "w-64 opacity-100" : "-ml-5 w-0 opacity-0",
            )}
            aria-hidden={!sidebarOpen}
          >
            <div className="w-64">
              <FilterSidebar
                filters={filters}
                onChange={handleFiltersChange}
                onReset={resetFilters}
                facets={facets}
              />
            </div>
          </div>

          <main className="min-w-0 flex-1">
            <ProductToolbar
              resultsCount={products.length}
              totalCount={meta.total}
              page={meta.page}
              pageSize={meta.pageSize}
              activeFilterCount={activeFilterCount}
              sort={query.sort}
              onSortChange={(sort: ProductSortOption) =>
                updateUrl({ sort: sort === "popular" ? null : sort, page: null })
              }
              onPageSizeChange={(pageSize) =>
                updateUrl({
                  pageSize: pageSize === PRODUCTS_PAGE_SIZE ? null : pageSize,
                  page: null,
                })
              }
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenMobileFilter={() => setMobileFilterOpen(true)}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen((open) => !open)}
            />

            {isPending ? (
              <div aria-busy="true" aria-label="Loading products" className="mt-4">
                <ProductGridSkeleton wide={!sidebarOpen} />
              </div>
            ) : (
              <>
                <ProductsGrid
                  products={products}
                  viewMode={viewMode}
                  onClearFilters={resetFilters}
                  wide={!sidebarOpen}
                />
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  hrefForPage={(page) => {
                    const params = new URLSearchParams(serializedParams);
                    if (page === 1) params.delete("page");
                    else params.set("page", String(page));
                    const next = params.toString();
                    return next ? `${pathname}?${next}` : pathname;
                  }}
                />
              </>
            )}
          </main>
        </div>
      </div>

      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        onChange={handleFiltersChange}
        onReset={resetFilters}
        facets={facets}
      />
    </div>
  );
}

function ActiveFilterChips({
  query,
  filters,
  facets,
  onRemove,
}: {
  query: string;
  filters: CatalogFilterState;
  facets: CatalogFacets;
  onRemove: (key: string) => void;
}) {
  const categoryName = (() => {
    const stack = [...facets.categories];
    while (stack.length > 0) {
      const category = stack.shift();
      if (!category) continue;
      if (category.path === filters.categoryPath) return category.name;
      stack.push(...category.children);
    }
    return filters.categoryPath;
  })();
  const chips = [
    query ? { key: "search", label: `Search: ${query}` } : null,
    filters.categoryPath
      ? { key: "categoryPath", label: `Category: ${categoryName}` }
      : null,
    filters.brandSlug
      ? {
          key: "brandSlug",
          label: `Brand: ${facets.brands.find((brand) => brand.slug === filters.brandSlug)?.name ?? filters.brandSlug}`,
        }
      : null,
    filters.manufacturerSlug
      ? {
          key: "manufacturerSlug",
          label: `Manufacturer: ${facets.manufacturers.find((item) => item.slug === filters.manufacturerSlug)?.name ?? filters.manufacturerSlug}`,
        }
      : null,
    filters.minPrice != null
      ? { key: "minPrice", label: `From BDT ${filters.minPrice.toLocaleString()}` }
      : null,
    filters.maxPrice != null
      ? { key: "maxPrice", label: `Up to BDT ${filters.maxPrice.toLocaleString()}` }
      : null,
    filters.stock ? { key: "stock", label: filters.stock === "in-stock" ? "In stock" : "Out of stock" } : null,
    filters.minRating
      ? { key: "minRating", label: `${filters.minRating}+ stars` }
      : null,
  ].filter((chip): chip is { key: string; label: string } => Boolean(chip));

  if (chips.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label="Active product filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1 rounded-full border border-brand-red/20 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-brand-red hover:text-brand-red"
          aria-label={`Remove ${chip.label} filter`}
        >
          {chip.label}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const pageNumbers = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav
      aria-label="Product pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      <PaginationButton
        label="Previous page"
        disabled={page <= 1}
        href={hrefForPage(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationButton>
      {pageNumbers.map((pageNumber, index) => {
        const previous = pageNumbers[index - 1];
        return (
          <span key={pageNumber} className="contents">
            {previous != null && pageNumber - previous > 1 && (
              <span className="px-1 text-sm text-gray-400" aria-hidden="true">
                …
              </span>
            )}
            <Link
              href={hrefForPage(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
              className={cn(
                "h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold transition-colors",
                pageNumber === page
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-brand-red hover:text-brand-red",
              )}
            >
              {pageNumber}
            </Link>
          </span>
        );
      })}
      <PaginationButton
        label="Next page"
        disabled={page >= totalPages}
        href={hrefForPage(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationButton>
    </nav>
  );
}

function PaginationButton({
  label,
  disabled,
  href,
  children,
}: {
  label: string;
  disabled: boolean;
  href: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-label={label}
        aria-disabled="true"
        className="flex h-9 min-w-9 cursor-not-allowed items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 opacity-40"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-brand-red hover:text-brand-red"
    >
      {children}
    </Link>
  );
}
