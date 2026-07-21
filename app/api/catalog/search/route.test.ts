import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  searchCatalog: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/services/catalog-discovery.service", () => ({
  searchCatalog: mocks.searchCatalog,
}));

import { GET } from "@/app/api/catalog/search/route";

describe("GET /api/catalog/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the standard 400 validation envelope for an empty query", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/catalog/search?q="),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid search parameters.",
      fieldErrors: { q: expect.any(Array) },
    });
    expect(mocks.searchCatalog).not.toHaveBeenCalled();
  });

  it("passes bounded grouped-search inputs to the service", async () => {
    mocks.searchCatalog.mockResolvedValue({
      query: "drill",
      products: [{ id: "product-1", name: "Cordless drill" }],
      categories: [{ id: "category-1", name: "Power tools" }],
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/catalog/search?q=drill&productLimit=4&categoryLimit=3",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        query: "drill",
        products: [{ id: "product-1" }],
        categories: [{ id: "category-1" }],
      },
    });
    expect(mocks.searchCatalog).toHaveBeenCalledWith({
      q: "drill",
      productLimit: 4,
      categoryLimit: 3,
    });
  });
});
