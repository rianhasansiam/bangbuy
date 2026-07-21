import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAdminRequest: vi.fn(),
  requireAdmin: vi.fn(),
  listProducts: vi.fn(),
  serializeProduct: vi.fn(),
  createProduct: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/guards", () => ({
  isAdminRequest: mocks.isAdminRequest,
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/lib/services/product.service", () => ({
  ProductError: class ProductError extends Error {},
  listProducts: mocks.listProducts,
  serializeProduct: mocks.serializeProduct,
  createProduct: mocks.createProduct,
}));
vi.mock("@/lib/services/admin-activity.service", () => ({
  logAdminActivity: vi.fn(),
}));
vi.mock("@/lib/cache/revalidation", () => ({
  revalidateCacheTagsImmediately: vi.fn(),
}));

import { GET } from "@/app/api/products/route";

describe("GET /api/products catalog filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAdminRequest.mockResolvedValue(false);
    mocks.listProducts.mockResolvedValue({
      items: [{ id: "product-1", categoryId: "power-tools" }],
      meta: { page: 2, pageSize: 12, total: 13, totalPages: 2 },
    });
    mocks.serializeProduct.mockReturnValue({
      id: "product-1",
      categoryPath: "tools/power-tools",
    });
  });

  it("rejects a non-canonical category path before calling the service", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/products?categoryPath=%2Ftools"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid query parameters.",
      fieldErrors: { categoryPath: expect.any(Array) },
    });
    expect(mocks.isAdminRequest).not.toHaveBeenCalled();
    expect(mocks.listProducts).not.toHaveBeenCalled();
  });

  it("forwards canonical descendant-category and facet filters to the public service", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/products?categoryPath=tools%2Fpower-tools&categoryId=legacy-id&brandSlug=acme&manufacturerSlug=acme-industries&minPrice=100&maxPrice=900&stock=in-stock&minRating=4&sort=rating&page=2&pageSize=12&search=drill",
      ),
    );

    expect(mocks.listProducts).toHaveBeenCalledWith(
      {
        page: 2,
        pageSize: 12,
        search: "drill",
        categoryId: "legacy-id",
        categoryPath: "tools/power-tools",
        brandSlug: "acme",
        manufacturerSlug: "acme-industries",
        minPrice: 100,
        maxPrice: 900,
        minRating: 4,
        stock: "in-stock",
        sort: "rating",
        status: "ACTIVE",
      },
      { publicOnly: true },
    );
    expect(mocks.serializeProduct).toHaveBeenCalledWith(
      { id: "product-1", categoryId: "power-tools" },
      { includeBuyingPrice: false },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [{ id: "product-1", categoryPath: "tools/power-tools" }],
      meta: { page: 2, pageSize: 12, total: 13, totalPages: 2 },
    });
  });
});
