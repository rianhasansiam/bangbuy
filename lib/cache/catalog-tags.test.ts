import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { catalogCacheTags } from "./catalog-tags";

describe("catalog cache tags", () => {
  it("keeps ordinary identifiers readable", () => {
    expect(catalogCacheTags.product("Product-123")).toBe("product:product-123");
    expect(catalogCacheTags.categoryPath("Controls/PLCs")).toBe(
      "category-path:controls/plcs",
    );
  });

  it("keeps long dynamic tags within Next.js limits deterministically", () => {
    const path = Array.from({ length: 80 }, (_, index) => `segment-${index}`).join(
      "/",
    );
    const first = catalogCacheTags.categoryPath(path);
    const second = catalogCacheTags.categoryPath(path);

    expect(first).toBe(second);
    expect(first.length).toBeLessThanOrEqual(256);
  });
});
