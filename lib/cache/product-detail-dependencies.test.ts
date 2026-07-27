import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { productDetailCacheTags } from "@/lib/cache/product-detail-dependencies";
import { catalogCacheTags } from "@/lib/cache/catalog-tags";

describe("product detail cache dependencies", () => {
  it("expires with category visibility changes and related product changes", () => {
    const tags = productDetailCacheTags({
      product: { id: "product-1", slug: "parent-product" },
      category: { id: "parent", path: "tools" },
      categoryBreadcrumb: [{ id: "parent", path: "tools" }],
      relatedProducts: [{ id: "product-2", slug: "child-product" }],
      brand: { id: "brand-1", slug: "acme" },
      manufacturerId: "manufacturer-1",
    });

    expect(tags).toEqual(
      expect.arrayContaining([
        catalogCacheTags.categoryTree,
        catalogCacheTags.categoryPath("tools"),
        catalogCacheTags.product("product-1"),
        catalogCacheTags.product("product-2"),
        catalogCacheTags.productSlug("child-product"),
      ]),
    );
  });
});
