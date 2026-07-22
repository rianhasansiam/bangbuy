import { describe, expect, it } from "vitest";

import {
  parseProductsPageQuery,
  productsPagePathForActualPage,
  productsPageIndexingPolicy,
  toProductQueryInput,
} from "@/lib/catalog/products-page-query";

describe("products query normalization boundaries", () => {
  it("normalizes unsupported enum values and allowed page sizes", () => {
    expect(
      parseProductsPageQuery(
        new URLSearchParams({
          sort: "oldest",
          stock: "reserved",
          page: "0",
          pageSize: "100",
          minRating: "12",
        }),
      ),
    ).toMatchObject({
      sort: "popular",
      stock: "",
      page: 1,
      pageSize: 12,
      minRating: 5,
    });
  });

  it("omits empty filters when creating the database query", () => {
    const parsed = parseProductsPageQuery(new URLSearchParams());

    expect(toProductQueryInput(parsed)).toEqual({
      page: 1,
      pageSize: 12,
      sort: "popular",
      search: undefined,
      categoryPath: undefined,
      brandSlug: undefined,
      manufacturerSlug: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      stock: undefined,
      minRating: undefined,
    });
  });

  it("uses the first value consistently for repeated query parameters", () => {
    expect(
      parseProductsPageQuery({ page: ["4", "9"], search: ["motor", "pump"] }),
    ).toMatchObject({ page: 4, search: "motor" });
    expect(
      productsPageIndexingPolicy({ page: ["4", "9"] }),
    ).toMatchObject({ index: false, canonicalPath: "/products" });
  });

  it("canonicalizes explicit first-page pagination to the catalog root", () => {
    expect(productsPageIndexingPolicy({ page: "1" })).toEqual({
      index: true,
      canonicalPath: "/products",
      hasUncontrolledParams: false,
    });
  });

  it("treats empty and invalid filter values as noisy URLs", () => {
    expect(productsPageIndexingPolicy({ search: "" })).toMatchObject({
      index: false,
      canonicalPath: "/products",
    });
    expect(productsPageIndexingPolicy({ sort: "unsupported" })).toMatchObject({
      index: false,
      canonicalPath: "/products",
    });
  });

  it("bounds pagination and noindexes malformed or repeated page values", () => {
    expect(parseProductsPageQuery({ page: "9007199254740992" }).page).toBe(1);
    for (const page of ["abc", "-2", "01", "10001"]) {
      expect(productsPageIndexingPolicy({ page })).toMatchObject({
        index: false,
        canonicalPath: "/products",
      });
    }
    expect(productsPageIndexingPolicy({ page: ["2", "3"] }).index).toBe(false);
  });

  it("drops both ends of a contradictory price range", () => {
    expect(
      parseProductsPageQuery({ minPrice: "500", maxPrice: "100" }),
    ).toMatchObject({ minPrice: null, maxPrice: null });
  });

  it("builds a stable redirect target for a clamped result page", () => {
    expect(
      productsPagePathForActualPage(
        { page: "999", brandSlug: "acme", utm_source: "email" },
        4,
      ),
    ).toBe("/products?brandSlug=acme&utm_source=email&page=4");
    expect(productsPagePathForActualPage({ page: "2" }, 1)).toBe("/products");
  });
});
