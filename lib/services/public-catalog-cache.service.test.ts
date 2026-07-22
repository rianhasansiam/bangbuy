import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  wrappers: [] as ReturnType<typeof vi.fn>[],
  cacheOptions: [] as unknown[],
  listProducts: vi.fn(),
  serializeProduct: vi.fn((product: unknown) => product),
  mapApiProduct: vi.fn((product: unknown) => product),
  getCatalogFacets: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn(
    (operation: (...args: unknown[]) => unknown, _keys: string[], options: unknown) => {
      const wrapper = vi.fn(operation);
      mocks.wrappers.push(wrapper);
      mocks.cacheOptions.push(options);
      return wrapper;
    },
  ),
}));
vi.mock("@/features/products/api", () => ({
  mapApiProduct: mocks.mapApiProduct,
}));
vi.mock("@/lib/services/catalog-discovery.service", () => ({
  getCatalogFacets: mocks.getCatalogFacets,
}));
vi.mock("@/lib/services/product.service", () => ({
  listProducts: mocks.listProducts,
  serializeProduct: mocks.serializeProduct,
}));

import { catalogCacheTags } from "@/lib/cache/catalog-tags";
import {
  getPublicCatalogPage,
  isCacheablePublicCatalogQuery,
} from "@/lib/services/public-catalog-cache.service";
import type { ProductQueryInput } from "@/lib/validations/product.validation";

function query(overrides: Partial<ProductQueryInput> = {}): ProductQueryInput {
  return {
    page: 1,
    pageSize: 12,
    sort: "popular",
    ...overrides,
  };
}

describe("public catalog data cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const wrapper of mocks.wrappers) wrapper.mockClear();
    mocks.listProducts.mockResolvedValue({ items: [], meta: { page: 1 } });
  });

  it("uses a bounded TTL and mutation tags for cached listing data", () => {
    expect(mocks.cacheOptions[0]).toEqual({
      revalidate: 900,
      tags: [catalogCacheTags.catalog, catalogCacheTags.listings],
    });
    expect(mocks.cacheOptions[1]).toEqual({
      revalidate: 1800,
      tags: [
        catalogCacheTags.catalog,
        catalogCacheTags.facets,
        catalogCacheTags.categoryTree,
      ],
    });
  });

  it("caches bounded browse pages but bypasses search and deep pagination", async () => {
    expect(isCacheablePublicCatalogQuery(query({ page: 20 }))).toBe(true);
    expect(isCacheablePublicCatalogQuery(query({ search: "motor" }))).toBe(false);
    expect(isCacheablePublicCatalogQuery(query({ page: 21 }))).toBe(false);

    await getPublicCatalogPage(query({ page: 20 }));
    expect(mocks.wrappers[0]).toHaveBeenCalledOnce();

    mocks.wrappers[0].mockClear();
    await getPublicCatalogPage(query({ search: "motor" }));
    await getPublicCatalogPage(query({ page: 21 }));
    expect(mocks.wrappers[0]).not.toHaveBeenCalled();
    expect(mocks.listProducts).toHaveBeenCalledTimes(3);
  });

  it("bypasses arbitrary filter, sort, and page-size combinations", () => {
    expect(isCacheablePublicCatalogQuery(query({ brandSlug: "acme" }))).toBe(
      false,
    );
    expect(isCacheablePublicCatalogQuery(query({ minPrice: 10 }))).toBe(false);
    expect(isCacheablePublicCatalogQuery(query({ sort: "latest" }))).toBe(false);
    expect(isCacheablePublicCatalogQuery(query({ pageSize: 24 }))).toBe(false);
  });
});
