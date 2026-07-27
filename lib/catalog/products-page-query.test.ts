import { describe, expect, it } from "vitest";

import {
  parseProductsPageQuery,
  productsPageIndexingPolicy,
} from "./products-page-query";

describe("products page query", () => {
  it("normalizes safe defaults", () => {
    expect(parseProductsPageQuery(new URLSearchParams())).toMatchObject({
      page: 1,
      pageSize: 12,
      sort: "popular",
      search: "",
    });
  });

  it("keeps clean pagination indexable with its own canonical", () => {
    expect(productsPageIndexingPolicy({ page: "3" })).toEqual({
      index: true,
      canonicalPath: "/products?page=3",
      hasUncontrolledParams: false,
    });
  });

  it("marks filters and tracking parameters non-indexable", () => {
    expect(productsPageIndexingPolicy({ brandSlug: "acme" }).index).toBe(false);
    expect(productsPageIndexingPolicy({ utm_source: "email" }).index).toBe(false);
  });

  it("strips tracking parameters without collapsing clean pagination", () => {
    expect(
      productsPageIndexingPolicy({ page: "2", utm_source: "email" }),
    ).toEqual({
      index: false,
      canonicalPath: "/products?page=2",
      hasUncontrolledParams: true,
    });
  });
});
