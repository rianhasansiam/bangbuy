import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCatalogFacets: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/services/catalog-discovery.service", () => ({
  getCatalogFacets: mocks.getCatalogFacets,
}));

import { GET } from "@/app/api/catalog/facets/route";

describe("GET /api/catalog/facets", () => {
  it("returns category hierarchy, entities, price and availability", async () => {
    mocks.getCatalogFacets.mockResolvedValue({
      categories: [{ id: "tools", path: "tools", children: [] }],
      brands: [{ id: "brand-1", slug: "acme" }],
      manufacturers: [{ id: "maker-1", slug: "acme-industries" }],
      priceBounds: { min: 100, max: 500 },
      availability: { inStock: 3, outOfStock: 1 },
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        categories: [{ path: "tools" }],
        brands: [{ slug: "acme" }],
        manufacturers: [{ slug: "acme-industries" }],
        priceBounds: { min: 100, max: 500 },
        availability: { inStock: 3, outOfStock: 1 },
      },
    });
  });
});
