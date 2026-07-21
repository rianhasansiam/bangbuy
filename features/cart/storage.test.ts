import { describe, expect, it } from "vitest";

import type { CartItem } from "@/features/cart/api";
import { normalizeCartItem, upsertLocalCartItem } from "@/features/cart/storage";

function cartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "local:product-1",
    productId: "product-1",
    slug: "product-1",
    variantId: "variant-1",
    variantName: "Default",
    sku: "SKU-1",
    color: null,
    size: null,
    attributes: null,
    attributeSummary: null,
    name: "Product one",
    image: null,
    quantity: 1,
    unitPrice: 250,
    originalPrice: 300,
    lineTotal: 250,
    stock: 3,
    status: "ACTIVE",
    ...overrides,
  };
}

describe("guest cart stock limits", () => {
  it("clamps a rehydrated line to its known stock", () => {
    const item = normalizeCartItem({
      id: "local:product-1",
      productId: "product-1",
      name: "Product one",
      quantity: 9,
      unitPrice: 250,
      stock: 3,
    });

    expect(item).toMatchObject({
      quantity: 3,
      lineTotal: 750,
      stock: 3,
    });
  });

  it("clamps a new line to available stock", () => {
    const result = upsertLocalCartItem([], cartItem({ quantity: 8 }));

    expect(result[0]).toMatchObject({
      quantity: 3,
      lineTotal: 750,
      stock: 3,
    });
  });

  it("does not let repeated additions exceed available stock", () => {
    const existing = cartItem({ quantity: 2, lineTotal: 500 });
    const result = upsertLocalCartItem(
      [existing],
      cartItem({ quantity: 2 }),
    );

    expect(result[0]).toMatchObject({
      quantity: 3,
      lineTotal: 750,
      stock: 3,
    });
  });

  it("does not add an unavailable item", () => {
    const existing = [cartItem()];

    expect(
      upsertLocalCartItem(existing, cartItem({ stock: 0 })),
    ).toBe(existing);
  });
});
