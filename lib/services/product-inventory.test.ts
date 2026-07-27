import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  queryRaw: vi.fn(),
  productUpdate: vi.fn(),
  productCreate: vi.fn(),
  productDelete: vi.fn(),
  productFindMany: vi.fn(),
  productFindFirst: vi.fn(),
  productFindUnique: vi.fn(),
  productFindUniqueOrThrow: vi.fn(),
  variantFindMany: vi.fn(),
  variantUpdate: vi.fn(),
  variantCreate: vi.fn(),
  variantDeleteMany: vi.fn(),
  inventoryCreate: vi.fn(),
  inventoryCreateMany: vi.fn(),
  categoryFindUnique: vi.fn(),
  brandFindUnique: vi.fn(),
  manufacturerFindUnique: vi.fn(),
  imageDeleteMany: vi.fn(),
  imageCreateMany: vi.fn(),
  imageFindFirst: vi.fn(),
  imageUpdate: vi.fn(),
  redirectFindMany: vi.fn(),
  redirectDeleteMany: vi.fn(),
  redirectUpdateMany: vi.fn(),
  redirectUpsert: vi.fn(),
  breadcrumbs: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: <Arguments extends unknown[], Result>(
    operation: (...args: Arguments) => Result,
  ) => operation,
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    product: {
      findMany: mocks.productFindMany,
      findFirst: mocks.productFindFirst,
    },
    catalogRedirect: { findMany: mocks.redirectFindMany },
  },
}));
vi.mock("@/lib/services/category.service", () => ({
  getCategoryBreadcrumbsByIds: mocks.breadcrumbs,
  getCategorySubtreeIds: vi.fn(),
  getEffectiveActiveCategoryIds: vi.fn(),
  isCategoryEffectivelyActive: vi.fn(),
}));

import {
  createProduct,
  getProductRedirectBySlug,
  hardDeleteProduct,
  updateProduct,
} from "@/lib/services/product.service";
import {
  createProductSchema,
  updateProductSchema,
} from "@/lib/validations/product.validation";

describe("manual product stock adjustments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queryRaw.mockResolvedValue([
      {
        id: "product-1",
        name: "Industrial Motor",
        slug: "industrial-motor",
      },
    ]);
    mocks.productUpdate.mockResolvedValue({ id: "product-1" });
    mocks.productDelete.mockResolvedValue({ id: "product-1" });
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productFindFirst.mockResolvedValue(null);
    mocks.productFindUnique.mockResolvedValue(null);
    mocks.variantFindMany.mockResolvedValue([
      { id: "variant-up", stock: 10 },
      { id: "variant-down", stock: 5 },
    ]);
    mocks.variantUpdate.mockResolvedValue({});
    mocks.variantCreate.mockResolvedValue({ id: "variant-new" });
    mocks.variantDeleteMany.mockResolvedValue({ count: 0 });
    mocks.inventoryCreate.mockResolvedValue({});
    mocks.inventoryCreateMany.mockResolvedValue({ count: 0 });
    mocks.categoryFindUnique.mockResolvedValue(null);
    mocks.brandFindUnique.mockResolvedValue(null);
    mocks.manufacturerFindUnique.mockResolvedValue(null);
    mocks.imageDeleteMany.mockResolvedValue({ count: 0 });
    mocks.imageCreateMany.mockResolvedValue({ count: 0 });
    mocks.imageFindFirst.mockResolvedValue(null);
    mocks.imageUpdate.mockResolvedValue({});
    mocks.redirectFindMany.mockResolvedValue([]);
    mocks.redirectDeleteMany.mockResolvedValue({ count: 0 });
    mocks.redirectUpdateMany.mockResolvedValue({ count: 0 });
    mocks.redirectUpsert.mockImplementation(async ({ create }) => create);
    mocks.productFindUniqueOrThrow.mockResolvedValue({
      id: "product-1",
      categoryId: "category-1",
    });
    mocks.breadcrumbs.mockResolvedValue(new Map());

    const client = {
      $queryRaw: mocks.queryRaw,
      product: {
        update: mocks.productUpdate,
        create: mocks.productCreate,
        delete: mocks.productDelete,
        findUnique: mocks.productFindUnique,
        findUniqueOrThrow: mocks.productFindUniqueOrThrow,
      },
      productVariant: {
        findMany: mocks.variantFindMany,
        update: mocks.variantUpdate,
        create: mocks.variantCreate,
        deleteMany: mocks.variantDeleteMany,
      },
      inventoryLog: {
        create: mocks.inventoryCreate,
        createMany: mocks.inventoryCreateMany,
      },
      productImage: {
        deleteMany: mocks.imageDeleteMany,
        createMany: mocks.imageCreateMany,
        findFirst: mocks.imageFindFirst,
        update: mocks.imageUpdate,
      },
      category: { findUnique: mocks.categoryFindUnique },
      brand: { findUnique: mocks.brandFindUnique },
      manufacturer: { findUnique: mocks.manufacturerFindUnique },
      catalogRedirect: {
        deleteMany: mocks.redirectDeleteMany,
        updateMany: mocks.redirectUpdateMany,
        upsert: mocks.redirectUpsert,
      },
    };
    mocks.transaction.mockImplementation(async (operation: unknown) => {
      if (typeof operation !== "function")
        throw new Error("Expected a transaction callback.");
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

    expect(
      mocks.inventoryCreate.mock.calls.map(([argument]) => argument.data),
    ).toEqual([
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

  it("stores meaningful alt text when product images are replaced", async () => {
    const input = updateProductSchema.parse({
      images: ["/motor-front.webp", "/motor-side.webp"],
      primaryImageAlt: "Industrial motor front view",
    });

    await updateProduct("product-1", input);

    expect(mocks.imageCreateMany).toHaveBeenCalledWith({
      data: [
        {
          productId: "product-1",
          url: "/motor-front.webp",
          alt: "Industrial motor front view",
          position: 0,
        },
        {
          productId: "product-1",
          url: "/motor-side.webp",
          alt: "Industrial Motor image 2",
          position: 1,
        },
      ],
    });
  });

  it("releases stale redirect history when a product path becomes live", async () => {
    mocks.categoryFindUnique.mockResolvedValue({ id: "category-1" });
    mocks.productCreate.mockResolvedValue({
      id: "product-new",
      categoryId: "category-1",
      slug: "industrial-motor",
      variants: [{ id: "variant-new", stock: 0 }],
    });

    await createProduct(
      createProductSchema.parse({
        name: "Industrial Motor",
        buyingPrice: 100,
        salePrice: 120,
        categoryId: "category-1",
        variants: [{ stock: 0 }],
      }),
    );

    expect(mocks.redirectDeleteMany).toHaveBeenCalledWith({
      where: { sourcePath: { in: ["/products/industrial-motor"] } },
    });
  });

  it("removes product-owned redirect history on hard delete", async () => {
    await hardDeleteProduct("product-1");

    expect(mocks.productDelete).toHaveBeenCalledWith({
      where: { id: "product-1" },
    });
    expect(mocks.redirectDeleteMany).toHaveBeenCalledWith({
      where: { entityType: "PRODUCT", entityId: "product-1" },
    });
  });

  it("records an atomic permanent redirect when the product slug changes", async () => {
    await updateProduct(
      "product-1",
      updateProductSchema.parse({ slug: "industrial-motor-v2" }),
    );

    expect(mocks.productUpdate).toHaveBeenCalledWith({
      where: { id: "product-1" },
      data: { slug: "industrial-motor-v2" },
    });
    expect(mocks.redirectDeleteMany).toHaveBeenCalledWith({
      where: {
        sourcePath: { in: ["/products/industrial-motor-v2"] },
      },
    });
    expect(mocks.redirectUpdateMany).toHaveBeenCalledWith({
      where: {
        destinationPath: "/products/industrial-motor",
        entityType: "PRODUCT",
      },
      data: { destinationPath: "/products/industrial-motor-v2" },
    });
    expect(mocks.redirectUpsert).toHaveBeenCalledWith({
      where: { sourcePath: "/products/industrial-motor" },
      update: {
        destinationPath: "/products/industrial-motor-v2",
        entityType: "PRODUCT",
        entityId: "product-1",
        permanent: true,
      },
      create: {
        sourcePath: "/products/industrial-motor",
        destinationPath: "/products/industrial-motor-v2",
        entityType: "PRODUCT",
        entityId: "product-1",
        permanent: true,
      },
    });
  });

  it("resolves a cached product redirect by legacy slug", async () => {
    mocks.redirectFindMany.mockResolvedValue([
      {
        sourcePath: "/products/legacy-motor",
        destinationPath: "/products/industrial-motor",
        entityType: "PRODUCT",
        entityId: "product-1",
        permanent: true,
      },
    ]);

    await expect(getProductRedirectBySlug("legacy-motor")).resolves.toEqual({
      sourcePath: "/products/legacy-motor",
      destinationPath: "/products/industrial-motor",
      entityType: "PRODUCT",
      entityId: "product-1",
      permanent: true,
    });
  });
});
