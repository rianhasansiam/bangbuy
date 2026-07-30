"use client";

import { FolderTree, PackageSearch, Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  searchCatalogFromApi,
  type CatalogCategorySuggestion,
  type CatalogSearchResult,
  type Product,
} from "@/features/products/api";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;
const PRODUCT_RESULTS_LIMIT = 6;
const CATEGORY_RESULTS_LIMIT = 5;

type SearchBarProps = {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  shouldFocus?: boolean;
  onNavigate?: () => void;
};

type SearchOption =
  | { kind: "product"; key: string; product: Product }
  | {
      kind: "category";
      key: string;
      category: CatalogCategorySuggestion;
    }
  | { kind: "all"; key: "all" };

const EMPTY_RESULTS: CatalogSearchResult = {
  query: "",
  products: [],
  categories: [],
};

export default function SearchBar({
  className,
  inputClassName,
  placeholder = "Search products, codes, models and categories...",
  shouldFocus = false,
  onNavigate,
}: SearchBarProps) {
  const router = useRouter();
  const rawId = useId();
  const listboxId = `catalog-search-${rawId.replace(/:/g, "")}`;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSearchResult>(EMPTY_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const trimmed = query.trim();
  const options = useMemo<SearchOption[]>(() => {
    if (!trimmed) return [];
    return [
      ...results.products.map(
        (product): SearchOption => ({
          kind: "product",
          key: `product-${product.id}`,
          product,
        }),
      ),
      ...results.categories.map(
        (category): SearchOption => ({
          kind: "category",
          key: `category-${category.id}`,
          category,
        }),
      ),
      { kind: "all", key: "all" },
    ];
  }, [results.categories, results.products, trimmed]);

  useEffect(() => {
    if (!shouldFocus) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [shouldFocus]);

  useEffect(() => {
    if (!trimmed) {
      const timer = setTimeout(() => {
        setResults(EMPTY_RESULTS);
        setError(null);
        setIsLoading(false);
        setActiveIndex(-1);
      }, 0);
      return () => clearTimeout(timer);
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const nextResults = await searchCatalogFromApi(trimmed, {
          productLimit: PRODUCT_RESULTS_LIMIT,
          categoryLimit: CATEGORY_RESULTS_LIMIT,
          signal: controller.signal,
        });
        setResults(nextResults);
        setActiveIndex(-1);
        setError(null);
      } catch (searchError) {
        if (controller.signal.aborted) return;
        setResults(EMPTY_RESULTS);
        setActiveIndex(-1);
        setError(
          searchError instanceof Error
            ? searchError.message
            : "Failed to search the catalog.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const closeDropdown = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const navigate = (href: string) => {
    closeDropdown();
    onNavigate?.();
    router.push(href);
  };

  const goToAllResults = () => {
    if (!trimmed) return;
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const selectOption = (option: SearchOption | undefined) => {
    if (!option || option.kind === "all") {
      goToAllResults();
      return;
    }
    if (option.kind === "product") {
      navigate(`/products/${option.product.slug}`);
      return;
    }
    navigate(`/categories/${option.category.path}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      if (options.length > 0) {
        setActiveIndex((index) => (index + 1) % options.length);
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (options.length > 0) {
        setActiveIndex((index) =>
          index <= 0 ? options.length - 1 : index - 1,
        );
      }
      return;
    }
    if (event.key === "Home" && open && options.length > 0) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End" && open && options.length > 0) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      selectOption(activeIndex >= 0 ? options[activeIndex] : undefined);
      return;
    }
    if (event.key === "Escape") {
      closeDropdown();
    }
  };

  const showDropdown = open && trimmed.length > 0;
  const activeDescendant =
    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;
  let optionIndex = 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative w-full">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
        />
        <Input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search the catalog"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-busy={isLoading}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setResults(EMPTY_RESULTS);
            setOpen(true);
            setActiveIndex(-1);
            setIsLoading(next.trim().length > 0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-10 rounded-xl border-brand-border bg-white/60 pl-11 pr-9 text-sm text-gray-800 focus-visible:border-brand-red focus-visible:bg-white focus-visible:ring-brand-red/30",
            inputClassName,
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults(EMPTY_RESULTS);
              closeDropdown();
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/70"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-brand-border bg-white shadow-xl">
          {isLoading && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-brand-red"
            >
              <LoadingSpinner decorative size="sm" />
              <span>Searching...</span>
            </div>
          )}

          {!isLoading && error && (
            <div role="alert" className="px-4 py-5 text-sm text-red-600">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Catalog search suggestions"
              className="max-h-[65vh] overflow-y-auto py-1"
            >
              {results.products.length === 0 &&
                results.categories.length === 0 && (
                  <li role="presentation" className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                    <PackageSearch className="h-6 w-6 text-brand-text-muted" />
                    <p className="text-sm text-gray-600">
                      No direct matches for <strong>“{trimmed}”</strong>
                    </p>
                  </li>
                )}

              {results.products.length > 0 && (
                <li role="presentation">
                  <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Products
                  </div>
                  <ul role="group" aria-label="Products">
                    {results.products.map((product) => {
                      const index = optionIndex++;
                      const finalPrice = product.discountPrice ?? product.price;
                      const hasDiscount =
                        product.discountPrice != null &&
                        product.discountPrice < product.price;
                      return (
                        <li
                          key={product.id}
                          id={`${listboxId}-option-${index}`}
                          role="option"
                          aria-selected={index === activeIndex}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectOption(options[index])}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors",
                            index === activeIndex
                              ? "bg-brand-red/10"
                              : "hover:bg-brand-red/5",
                          )}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                            <Image
                              src={product.image}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-sm font-medium text-gray-800">
                              {product.name}
                            </p>
                            <p className="line-clamp-1 text-xs text-gray-500">
                              {[product.brand, product.modelNumber, product.category]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-brand-red">
                              BDT {finalPrice.toLocaleString()}
                            </p>
                            {hasDiscount && (
                              <p className="text-[11px] text-gray-400 line-through">
                                BDT {product.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )}

              {results.categories.length > 0 && (
                <li role="presentation" className="border-t border-gray-100">
                  <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Categories
                  </div>
                  <ul role="group" aria-label="Categories">
                    {results.categories.map((category) => {
                      const index = optionIndex++;
                      const breadcrumb = category.breadcrumb
                        .map((item) => item.name)
                        .join(" / ");
                      return (
                        <li
                          key={category.id}
                          id={`${listboxId}-option-${index}`}
                          role="option"
                          aria-selected={index === activeIndex}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectOption(options[index])}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors",
                            index === activeIndex
                              ? "bg-brand-red/10"
                              : "hover:bg-brand-red/5",
                          )}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light-bg text-brand-red">
                            <FolderTree className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-gray-800">
                              {category.name}
                            </span>
                            <span className="block truncate text-xs text-gray-500">
                              {breadcrumb}
                            </span>
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {category.totalProductCount} items
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )}

              {(() => {
                const index = optionIndex++;
                return (
                  <li
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(options[index])}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-1.5 border-t border-gray-100 bg-brand-light-bg px-4 py-2.5 text-sm font-semibold text-brand-red transition-colors",
                      index === activeIndex && "bg-brand-red/10",
                    )}
                  >
                    <Search className="h-4 w-4" />
                    View all results for “{trimmed}”
                  </li>
                );
              })()}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
