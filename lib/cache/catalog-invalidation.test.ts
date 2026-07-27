import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  productFindMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    product: { findMany: mocks.productFindMany },
  },
}));

import {
  invalidateBrandMutation,
  invalidateCatalogEntries,
  invalidateCategoryMutation,
  invalidateProductsById,
  invalidateProductSnapshots,
  loadProductInvalidationSnapshots,
  type ProductInvalidationSnapshot,
} from "@/lib/cache/catalog-invalidation";
import { catalogCacheTags } from "@/lib/cache/catalog-tags";

const SNAPSHOT: ProductInvalidationSnapshot = {
  id: "Product-1",
  slug: "Control-Panel",
  categoryId: "Category-3",
  categoryPath: "Industrial/Controls/PLCs",
  brandId: "Brand-1",
  brandSlug: "Acme",
  manufacturerId: "Manufacturer-1",
};

function invalidatedTags(): string[] {
  return mocks.revalidateTag.mock.calls.map(([tag]) => tag as string);
}

function invalidatedPaths(): string[] {
  return mocks.revalidatePath.mock.calls.map(([path]) => path as string);
}

describe("catalog invalidation dependencies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.productFindMany.mockResolvedValue([]);
  });

  it("expires every public dependency of a product snapshot immediately", () => {
    invalidateProductSnapshots([SNAPSHOT, SNAPSHOT], {
      reason: "product changed",
      reviews: true,
      sitemap: true,
      categoryTree: true,
    });

    expect(invalidatedTags()).toEqual(
      expect.arrayContaining([
        catalogCacheTags.catalog,
        catalogCacheTags.listings,
        catalogCacheTags.facets,
        catalogCacheTags.brandDirectory,
        catalogCacheTags.homepage,
        catalogCacheTags.sitemap,
        catalogCacheTags.redirects,
        catalogCacheTags.categoryTree,
        catalogCacheTags.product(SNAPSHOT.id),
        catalogCacheTags.productSlug(SNAPSHOT.slug),
        catalogCacheTags.productReviews(SNAPSHOT.id),
        catalogCacheTags.category(SNAPSHOT.categoryId),
        catalogCacheTags.categoryPath("Industrial"),
        catalogCacheTags.categoryPath("Industrial/Controls"),
        catalogCacheTags.categoryPath(SNAPSHOT.categoryPath),
        catalogCacheTags.brand(SNAPSHOT.brandId!),
        catalogCacheTags.brandSlug(SNAPSHOT.brandSlug!),
        catalogCacheTags.manufacturer(SNAPSHOT.manufacturerId!),
      ]),
    );
    expect(invalidatedPaths()).toEqual(
      expect.arrayContaining([
        "/",
        "/products",
        "/products/Control-Panel",
        "/categories/Industrial",
        "/categories/Industrial/Controls",
        "/categories/Industrial/Controls/PLCs",
        "/brands/Acme",
        "/sitemap.xml",
      ]),
    );
    expect(new Set(invalidatedTags()).size).toBe(invalidatedTags().length);
    expect(new Set(invalidatedPaths()).size).toBe(invalidatedPaths().length);
    expect(mocks.revalidateTag).toHaveBeenCalledWith(
      catalogCacheTags.product(SNAPSHOT.id),
      { expire: 0 },
    );
  });

  it("attempts every distinct entry when one tag and one path fail", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.revalidateTag.mockImplementationOnce(() => {
      throw new Error("tag cache unavailable");
    });
    mocks.revalidatePath.mockImplementationOnce(() => {
      throw new Error("route cache unavailable");
    });

    expect(() =>
      invalidateCatalogEntries({
        tags: ["first", "first", "second"],
        paths: ["/first", "/first", "/second"],
        reason: "test failure isolation",
      }),
    ).not.toThrow();

    expect(invalidatedTags()).toEqual(["first", "second"]);
    expect(invalidatedPaths()).toEqual(["/first", "/second"]);
    expect(consoleError).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });

  it("deduplicates dependency lookups and maps nullable relations", async () => {
    mocks.productFindMany.mockResolvedValueOnce([
      {
        id: "product-1",
        slug: "panel",
        categoryId: "category-1",
        category: { path: "controls/panels" },
        brandId: null,
        brand: null,
        manufacturerId: null,
      },
    ]);

    await expect(
      loadProductInvalidationSnapshots(["product-1", "", "product-1"]),
    ).resolves.toEqual([
      {
        id: "product-1",
        slug: "panel",
        categoryId: "category-1",
        categoryPath: "controls/panels",
        brandId: null,
        brandSlug: null,
        manufacturerId: null,
      },
    ]);
    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["product-1"] } } }),
    );
  });

  it("expires known product tags when dependency discovery fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.productFindMany.mockRejectedValueOnce(
      new Error("database unavailable"),
    );

    await expect(
      invalidateProductsById(["product-1", "product-1"], {
        reason: "review approved",
        reviews: true,
      }),
    ).resolves.toBeUndefined();

    expect(invalidatedTags()).toEqual(
      expect.arrayContaining([
        catalogCacheTags.catalog,
        catalogCacheTags.listings,
        catalogCacheTags.product("product-1"),
        catalogCacheTags.productReviews("product-1"),
      ]),
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[catalog-cache] Failed to load product dependencies",
      expect.objectContaining({ productIds: ["product-1"] }),
    );
    consoleError.mockRestore();
  });

  it("invalidates old and new category URLs plus the complete dynamic route", () => {
    invalidateCategoryMutation({
      reason: "category moved",
      categoryIds: ["category-1"],
      oldPaths: ["tools/power"],
      newPaths: ["home/power"],
    });

    expect(invalidatedTags()).toEqual(
      expect.arrayContaining([
        catalogCacheTags.categoryTree,
        catalogCacheTags.redirects,
        catalogCacheTags.category("category-1"),
        catalogCacheTags.categoryPath("tools/power"),
        catalogCacheTags.categoryPath("home/power"),
      ]),
    );
    expect(invalidatedPaths()).toEqual(
      expect.arrayContaining([
        "/categories/tools/power",
        "/categories/home/power",
        "/categories/[...segments]",
      ]),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/categories/[...segments]",
      "page",
    );
  });

  it("walks from a brand mutation to every associated product dependency", async () => {
    mocks.productFindMany
      .mockResolvedValueOnce([{ id: "product-1" }])
      .mockResolvedValueOnce([
        {
          id: "product-1",
          slug: "panel",
          categoryId: "category-1",
          category: { path: "controls/panels" },
          brandId: "brand-1",
          brand: { slug: "new-brand" },
          manufacturerId: null,
        },
      ]);

    await invalidateBrandMutation({
      id: "brand-1",
      slugs: ["old-brand", "new-brand"],
      reason: "brand renamed",
    });

    expect(mocks.productFindMany.mock.calls[0]?.[0]).toEqual({
      where: { brandId: "brand-1" },
      select: { id: true },
    });
    expect(invalidatedTags()).toEqual(
      expect.arrayContaining([
        catalogCacheTags.brand("brand-1"),
        catalogCacheTags.brandSlug("old-brand"),
        catalogCacheTags.brandSlug("new-brand"),
        catalogCacheTags.product("product-1"),
      ]),
    );
    expect(invalidatedPaths()).toEqual(
      expect.arrayContaining([
        "/brands/old-brand",
        "/brands/new-brand",
        "/products/panel",
      ]),
    );
  });

  it("still expires broad brand caches when dependency discovery fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.productFindMany.mockRejectedValueOnce(
      new Error("database unavailable"),
    );

    await expect(
      invalidateBrandMutation({
        id: "brand-1",
        slugs: ["acme"],
        reason: "brand changed",
      }),
    ).resolves.toBeUndefined();

    expect(invalidatedTags()).toEqual(
      expect.arrayContaining([
        catalogCacheTags.catalog,
        catalogCacheTags.listings,
        catalogCacheTags.brand("brand-1"),
        catalogCacheTags.brandSlug("acme"),
      ]),
    );
    expect(invalidatedPaths()).toEqual(
      expect.arrayContaining(["/brands", "/brands/acme", "/products"]),
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[catalog-cache] Failed to load brand dependencies",
      expect.objectContaining({ brandId: "brand-1" }),
    );
    consoleError.mockRestore();
  });
});
