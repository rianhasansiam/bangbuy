import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  queryRaw: vi.fn(),
  productUpdate: vi.fn(),
  productFindUniqueOrThrow: vi.fn(),
  variantFindMany: vi.fn(),
  variantUpdate: vi.fn(),
  variantCreate: vi.fn(),
  variantDeleteMany: vi.fn(),
  inventoryCreate: vi.fn(),
  categoryFindUnique: vi.fn(),
  brandFindUnique: vi.fn(),
  manufacturerFindUnique: vi.fn(),
  breadcrumbs: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));
vi.mock("@/lib/services/category.service", () => ({
  getCategoryBreadcrumbsByIds: mocks.breadcrumbs,
  getCategorySubtreeIds: vi.fn(),
  getEffectiveActiveCategoryIds: vi.fn(),
  isCategoryEffectivelyActive: vi.fn(),
}));

import { updateProduct } from "@/lib/services/product.service";
import { updateProductSchema } from "@/lib/validations/product.validation";

describe("manual product stock adjustments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queryRaw.mockResolvedValue([{ id: "product-1" }]);
    mocks.productUpdate.mockResolvedValue({ id: "product-1" });
    mocks.variantFindMany.mockResolvedValue([
      { id: "variant-up", stock: 10 },
      { id: "variant-down", stock: 5 },
    ]);
    mocks.variantUpdate.mockResolvedValue({});
    mocks.variantCreate.mockResolvedValue({ id: "variant-new" });
    mocks.variantDeleteMany.mockResolvedValue({ count: 0 });
    mocks.inventoryCreate.mockResolvedValue({});
    mocks.categoryFindUnique.mockResolvedValue(null);
    mocks.brandFindUnique.mockResolvedValue(null);
    mocks.manufacturerFindUnique.mockResolvedValue(null);
    mocks.productFindUniqueOrThrow.mockResolvedValue({
      id: "product-1",
      categoryId: "category-1",
    });
    mocks.breadcrumbs.mockResolvedValue(new Map());

    const client = {
      $queryRaw: mocks.queryRaw,
      product: {
        update: mocks.productUpdate,
        findUniqueOrThrow: mocks.productFindUniqueOrThrow,
      },
      productVariant: {
        findMany: mocks.variantFindMany,
        update: mocks.variantUpdate,
        create: mocks.variantCreate,
        deleteMany: mocks.variantDeleteMany,
      },
      inventoryLog: { create: mocks.inventoryCreate },
      productImage: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      category: { findUnique: mocks.categoryFindUnique },
      brand: { findUnique: mocks.brandFindUnique },
      manufacturer: { findUnique: mocks.manufacturerFindUnique },
    };
    mocks.transaction.mockImplementation(async (operation: unknown) => {
      if (typeof operation !== "function") throw new Error("Expected a transaction callback.");
      return (operation as (tx: typeof client) => Promise<unknown>)(client);
    });
  });

  it("writes signed deltas for increases, decreases, and initial variant stock", async () => {
    const input = updateProductSchema.parse({
      variants: [
        {
          id: "variant-up",
          name: "High stock",
          attributes: { Voltage: "220 V" },
          stock: 14,
        },
        {
          id: "variant-down",
          name: "Low stock",
          attributes: { Voltage: "110 V" },
          stock: 2,
        },
        {
          name: "New option",
          attributes: { Voltage: "12 V" },
          stock: 7,
        },
      ],
    });

    await updateProduct("product-1", input);

    expect(mocks.queryRaw).toHaveBeenCalledTimes(2);
    expect(mocks.queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.productUpdate.mock.invocationCallOrder[0]!,
    );
    expect(mocks.queryRaw.mock.invocationCallOrder[1]).toBeLessThan(
      mocks.variantFindMany.mock.invocationCallOrder[0]!,
    );

    expect(mocks.inventoryCreate.mock.calls.map(([argument]) => argument.data)).toEqual([
      {
        variantId: "variant-up",
        type: "MANUAL_ADJUSTMENT",
        quantity: 4,
        note: "Stock changed from product editor",
      },
      {
        variantId: "variant-down",
        type: "MANUAL_ADJUSTMENT",
        quantity: -3,
        note: "Stock changed from product editor",
      },
      {
        variantId: "variant-new",
        type: "MANUAL_ADJUSTMENT",
        quantity: 7,
        note: "Initial variant stock",
      },
    ]);
  });

  it("does not create a ledger row when stock is unchanged", async () => {
    mocks.variantFindMany.mockResolvedValue([{ id: "variant-up", stock: 10 }]);
    const input = updateProductSchema.parse({
      variants: [
        {
          id: "variant-up",
          attributes: { Voltage: "220 V" },
          stock: 10,
        },
      ],
    });

    await updateProduct("product-1", input);

    expect(mocks.inventoryCreate).not.toHaveBeenCalled();
  });
});
