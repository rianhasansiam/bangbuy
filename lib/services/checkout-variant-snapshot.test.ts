import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  productFindMany: vi.fn(),
  userFindUnique: vi.fn(),
  cartFindMany: vi.fn(),
  variantUpdateMany: vi.fn(),
  inventoryCreate: vi.fn(),
  orderCreate: vi.fn(),
  queryRaw: vi.fn(),
  activeCategoryIds: vi.fn(),
  getStoreSettings: vi.fn(),
  findActivePromoCode: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    product: { findMany: mocks.productFindMany },
    user: { findUnique: mocks.userFindUnique },
    cartItem: { findMany: mocks.cartFindMany },
  },
}));
vi.mock("@/lib/services/category.service", () => ({
  getEffectiveActiveCategoryIds: mocks.activeCategoryIds,
}));
vi.mock("@/lib/services/settings.service", () => ({
  getStoreSettings: mocks.getStoreSettings,
  findActivePromoCode: mocks.findActivePromoCode,
}));

import { placeOrder } from "@/lib/services/checkout.service";
import { checkoutSchema } from "@/lib/validations/checkout.validation";

describe("checkout variant snapshots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.activeCategoryIds.mockResolvedValue(["category-1"]);
    mocks.getStoreSettings.mockResolvedValue({
      taxRate: 0,
      standardShippingFee: 0,
      expressShippingFee: 0,
      freeShippingThreshold: 0,
      currency: "BDT",
    });
    mocks.userFindUnique.mockResolvedValue({ email: "buyer@example.com" });
    mocks.productFindMany.mockResolvedValue([
      {
        id: "product-1",
        name: "Industrial drill",
        status: "ACTIVE",
        categoryId: "category-1",
        salePrice: 120,
        discountPrice: 100,
        buyingPrice: 70,
        images: [{ url: "/industrial-drill.webp" }],
        variants: [
          {
            id: "variant-1",
            variantKey: "phase=single|voltage=220%20v",
            name: "Workshop 220 V",
            sku: "DRILL-220",
            modelNumber: "D-220",
            color: "Blue",
            size: "Standard",
            attributes: {
              Voltage: "220 V",
              Phase: "Single",
              blank: " ",
            },
            stock: 9,
            isActive: true,
          },
        ],
      },
    ]);
    mocks.variantUpdateMany.mockResolvedValue({ count: 1 });
    mocks.inventoryCreate.mockResolvedValue({});
    mocks.orderCreate.mockImplementation(async ({ data }: { data: {
      items: { create: unknown[] };
    } }) => ({
      id: "order-1",
      orderNumber: "ORD-TEST",
      items: data.items.create,
    }));

    const transactionClient = {
      $queryRaw: mocks.queryRaw,
      product: { findMany: mocks.productFindMany },
      productVariant: { updateMany: mocks.variantUpdateMany },
      inventoryLog: { create: mocks.inventoryCreate },
      order: { create: mocks.orderCreate },
      promoCode: { updateMany: vi.fn() },
      promoCodeUsage: { create: vi.fn() },
      cartItem: { deleteMany: vi.fn() },
    };
    mocks.transaction.mockImplementation(async (operation: unknown) => {
      if (typeof operation !== "function") throw new Error("Expected a transaction callback.");
      return (operation as (tx: typeof transactionClient) => Promise<unknown>)(
        transactionClient,
      );
    });
  });

  it("persists the selected variant and cleaned generic attributes on OrderItem", async () => {
    const input = checkoutSchema.parse({
      items: [{ productId: "product-1", variantId: "variant-1", quantity: 2 }],
      customerName: "Test Buyer",
      customerPhone: "01700000000",
      customerAddress: "123 Test Road",
      deliveryZone: "INSIDE_DHAKA",
      paymentMethod: "CASH_ON_DELIVERY",
    });

    await placeOrder("user-1", input);

    expect(mocks.queryRaw).toHaveBeenCalledTimes(3);
    expect(mocks.queryRaw.mock.invocationCallOrder[2]).toBeLessThan(
      mocks.productFindMany.mock.invocationCallOrder[0]!,
    );
    expect(mocks.variantUpdateMany).toHaveBeenCalledWith({
      where: { id: "variant-1", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
    expect(mocks.inventoryCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        variantId: "variant-1",
        type: "ORDER_PLACED",
        quantity: -2,
      }),
    });

    const orderData = mocks.orderCreate.mock.calls[0]?.[0].data as {
      items: { create: Array<Record<string, unknown>> };
    };
    expect(orderData.items.create).toEqual([
      expect.objectContaining({
        productId: "product-1",
        variantId: "variant-1",
        sku: "DRILL-220",
        variantName: "Workshop 220 V",
        color: "Blue",
        size: "Standard",
        variantAttributes: { Phase: "Single", Voltage: "220 V" },
        quantity: 2,
        unitPrice: 100,
        totalPrice: 200,
        buyingPrice: 70,
      }),
    ]);
  });
});
