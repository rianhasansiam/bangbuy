import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cartFindMany: vi.fn(),
  activeCategoryIds: vi.fn(),
  isCategoryActive: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    cartItem: { findMany: mocks.cartFindMany },
  },
}));
vi.mock("@/lib/services/category.service", () => ({
  getEffectiveActiveCategoryIds: mocks.activeCategoryIds,
  isCategoryEffectivelyActive: mocks.isCategoryActive,
}));

import { getMyCart } from "@/lib/services/cart.service";

describe("cart variant/product relation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.activeCategoryIds.mockResolvedValue(["category-1"]);
    mocks.cartFindMany.mockResolvedValue([
      {
        id: "cart-1",
        quantity: 2,
        variantId: "variant-1",
        variant: {
          id: "variant-1",
          variantKey: "voltage=220%20v",
          name: "220 V",
          sku: "DRILL-220",
          modelNumber: "D220",
          color: null,
          size: null,
          attributes: { Voltage: "220 V", Phase: "Single" },
          stock: 8,
          isActive: true,
          product: {
            id: "product-1",
            name: "Cordless drill",
            slug: "cordless-drill",
            status: "ACTIVE",
            categoryId: "category-1",
            salePrice: 120,
            discountPrice: 100,
            images: [{ url: "/drill.webp" }],
          },
        },
      },
    ]);
  });

  it("derives compatibility productId and display data through variant.product", async () => {
    const result = await getMyCart("user-1");

    expect(mocks.cartFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        include: {
          variant: {
            select: expect.objectContaining({
              product: { select: expect.objectContaining({ id: true }) },
            }),
          },
        },
      }),
    );
    const query = mocks.cartFindMany.mock.calls[0]?.[0] as {
      include: Record<string, unknown>;
    };
    expect(query.include).not.toHaveProperty("product");

    expect(result.items[0]).toMatchObject({
      id: "cart-1",
      productId: "product-1",
      variantId: "variant-1",
      slug: "cordless-drill",
      name: "Cordless drill",
      attributes: { Phase: "Single", Voltage: "220 V" },
      quantity: 2,
      unitPrice: 100,
      lineTotal: 200,
      stock: 8,
      status: "ACTIVE",
    });
    expect(result.summary).toEqual({
      totalItems: 2,
      subtotal: 200,
      totalDiscount: 40,
      finalTotal: 200,
    });
  });
});
