"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { ProductGridSkeleton } from "@/components/ui/loading";
import {
  fetchCatalogFacets,
  fetchProductsFromApi,
  type ApiMeta,
  type CatalogFacets,
  type Product,
  type ProductSortOption,
} from "@/features/products/api";
import { cn } from "@/lib/utils";

import FilterSidebar, {
  type CatalogFilterState,
} from "./components/FilterSidebar";
import MobileFilterDrawer from "./components/MobileFilterDrawer";
import ProductsGrid from "./components/ProductsGrid";
import ProductToolbar from "./components/ProductToolbar";

type ViewMode = "grid" | "list";

const DEFAULT_PAGE_SIZE = 12;
const EMPTY_FACETS: CatalogFacets = {
  categories: [],
  brands: [],
  manufacturers: [],
  priceBounds: { min: 0, max: 0 },
  availability: { inStock: 0, outOfStock: 0 },
};
const EMPTY_META: ApiMeta = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};
const SORT_OPTIONS = new Set<ProductSortOption>([
  "popular",
  "price-low",
  "price-high",
  "rating",
  "latest",
]);

function positiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function optionalNonNegative(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <AllProductsPageInner />
    </Suspense>
  );
}

function ProductsPageFallback() {
  return (
    <div className="min-h-screen bg-brand-light-bg">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
        <ProductGridSkeleton wide />
      </div>
    </div>
  );
}

function AllProductsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedParams = searchParams.toString();

  const query = useMemo(() => {
    const params = new URLSearchParams(serializedParams);
    const rawSort = params.get("sort") as ProductSortOption | null;
    const rawStock = params.get("stock");
    const pageSizeValue = positiveInteger(
      params.get("pageSize"),
      DEFAULT_PAGE_SIZE,
    );
    const pageSize = [12, 24, 48].includes(pageSizeValue)
      ? pageSizeValue
      : DEFAULT_PAGE_SIZE;

    return {
      search: (params.get("search") ?? "").trim(),
      categoryPath: (params.get("categoryPath") ?? "").trim(),
      brandSlug: (params.get("brandSlug") ?? "").trim(),
      manufacturerSlug: (params.get("manufacturerSlug") ?? "").trim(),
      minPrice: optionalNonNegative(params.get("minPrice")),
      maxPrice: optionalNonNegative(params.get("maxPrice")),
      stock:
        rawStock === "in-stock" || rawStock === "out-of-stock"
          ? rawStock
          : "",
      minRating: Math.min(
        5,
        optionalNonNegative(params.get("minRating")) ?? 0,
      ),
      sort: rawSort && SORT_OPTIONS.has(rawSort) ? rawSort : "popular",
      page: positiveInteger(params.get("page"), 1),
      pageSize,
    } satisfies CatalogFilterState & {
      search: string;
      sort: ProductSortOption;
      page: number;
      pageSize: number;
    };
  }, [serializedParams]);

  const filters: CatalogFilterState = {
    categoryPath: query.categoryPath,
    brandSlug: query.brandSlug,
    manufacturerSlug: query.manufacturerSlug,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    minRating: query.minRating,
    stock: query.stock,
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ApiMeta>(EMPTY_META);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [facets, setFacets] = useState<CatalogFacets>(EMPTY_FACETS);
  const [facetsError, setFacetsError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchProductsFromApi(
          {
            search: query.search || undefined,
            categoryPath: query.categoryPath || undefined,
            brandSlug: query.brandSlug || undefined,
            manufacturerSlug: query.manufacturerSlug || undefined,
            minPrice: query.minPrice ?? undefined,
            maxPrice: query.maxPrice ?? undefined,
            stock: query.stock || undefined,
            minRating: query.minRating || undefined,
            sort: query.sort,
            page: query.page,
            pageSize: query.pageSize,
          },
          { signal: controller.signal },
        );
        setProducts(result.items);
        setMeta(result.meta);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setProducts([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load products.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setFacetsError(null);
        setFacets(await fetchCatalogFacets(controller.signal));
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setFacetsError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load catalog filters.",
        );
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [reloadKey]);

  const updateUrl = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(serializedParams);
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "" || value === 0) params.delete(key);
        else params.set(key, String(value));
      }
      const next = params.toString();
      router.push(next ? `${pathname}?${next}` : pathname);
    },
    [pathname, router, serializedParams],
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
              {facetsError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {facetsError}
                </div>
              ) : (
                <FilterSidebar
                  filters={filters}
                  onChange={handleFiltersChange}
                  onReset={resetFilters}
                  facets={facets}
                />
              )}
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
              onSortChange={(sort) =>
                updateUrl({ sort: sort === "popular" ? null : sort, page: null })
              }
              onPageSizeChange={(pageSize) =>
                updateUrl({
                  pageSize: pageSize === DEFAULT_PAGE_SIZE ? null : pageSize,
                  page: null,
                })
              }
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenMobileFilter={() => setMobileFilterOpen(true)}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen((open) => !open)}
            />

            {isLoading ? (
              <div aria-busy="true" aria-label="Loading products" className="mt-4">
                <ProductGridSkeleton wide={!sidebarOpen} />
              </div>
            ) : error ? (
              <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Try again
                </button>
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
                  onPageChange={(page) => updateUrl({ page: page === 1 ? null : page })}
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
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
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
        onClick={() => onPageChange(page - 1)}
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
            <button
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
              className={cn(
                "h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold transition-colors",
                pageNumber === page
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-brand-red hover:text-brand-red",
              )}
            >
              {pageNumber}
            </button>
          </span>
        );
      })}
      <PaginationButton
        label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationButton>
    </nav>
  );
}

function PaginationButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-brand-red hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
