import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  brandFindUnique: vi.fn(),
  brandDelete: vi.fn(),
  brandFindFirst: vi.fn(),
  brandUpdate: vi.fn(),
  brandCreate: vi.fn(),
  queryRaw: vi.fn(),
  redirectFindMany: vi.fn(),
  redirectDeleteMany: vi.fn(),
  redirectUpdateMany: vi.fn(),
  redirectUpsert: vi.fn(),
  manufacturerFindUnique: vi.fn(),
  manufacturerDelete: vi.fn(),
  manufacturerFindFirst: vi.fn(),
  manufacturerUpdate: vi.fn(),
  transaction: vi.fn(),
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
    brand: {
      findFirst: mocks.brandFindFirst,
      findUnique: mocks.brandFindUnique,
      update: mocks.brandUpdate,
    },
    manufacturer: {
      findFirst: mocks.manufacturerFindFirst,
      update: mocks.manufacturerUpdate,
    },
    catalogRedirect: { findMany: mocks.redirectFindMany },
  },
}));

import {
  createBrand,
  deleteBrand,
  getBrandRedirectBySlug,
  updateBrand,
} from "@/lib/services/brand.service";
import {
  deleteManufacturer,
  updateManufacturer,
} from "@/lib/services/manufacturer.service";

describe("catalog entity dependency guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queryRaw.mockResolvedValue([
      { id: "brand-3", slug: "original-brand-slug" },
    ]);
    mocks.redirectFindMany.mockResolvedValue([]);
    mocks.redirectDeleteMany.mockResolvedValue({ count: 0 });
    mocks.redirectUpdateMany.mockResolvedValue({ count: 0 });
    mocks.redirectUpsert.mockImplementation(async ({ create }) => create);
    mocks.transaction.mockImplementation(
      async (
        callback: (tx: {
          $queryRaw: typeof mocks.queryRaw;
          brand: {
            findUnique: typeof mocks.brandFindUnique;
            delete: typeof mocks.brandDelete;
            update: typeof mocks.brandUpdate;
            create: typeof mocks.brandCreate;
          };
          manufacturer: {
            findUnique: typeof mocks.manufacturerFindUnique;
            delete: typeof mocks.manufacturerDelete;
          };
          catalogRedirect: {
            deleteMany: typeof mocks.redirectDeleteMany;
            updateMany: typeof mocks.redirectUpdateMany;
            upsert: typeof mocks.redirectUpsert;
          };
        }) => Promise<unknown>,
      ) =>
        callback({
          $queryRaw: mocks.queryRaw,
          brand: {
            findUnique: mocks.brandFindUnique,
            delete: mocks.brandDelete,
            update: mocks.brandUpdate,
            create: mocks.brandCreate,
          },
          manufacturer: {
            findUnique: mocks.manufacturerFindUnique,
            delete: mocks.manufacturerDelete,
          },
          catalogRedirect: {
            deleteMany: mocks.redirectDeleteMany,
            updateMany: mocks.redirectUpdateMany,
            upsert: mocks.redirectUpsert,
          },
        }),
    );
  });

  it("blocks deleting a brand referenced by products", async () => {
    mocks.brandFindUnique.mockResolvedValue({
      id: "brand-1",
      _count: { products: 2 },
    });

    await expect(deleteBrand("brand-1")).rejects.toMatchObject({
      status: 409,
      details: { productCount: 2 },
    });
    expect(mocks.brandDelete).not.toHaveBeenCalled();
  });

  it("blocks deleting a manufacturer referenced by products", async () => {
    mocks.manufacturerFindUnique.mockResolvedValue({
      id: "manufacturer-1",
      _count: { products: 1 },
    });

    await expect(deleteManufacturer("manufacturer-1")).rejects.toMatchObject({
      status: 409,
      details: { productCount: 1 },
    });
    expect(mocks.manufacturerDelete).not.toHaveBeenCalled();
  });

  it("deletes an unreferenced entity", async () => {
    mocks.brandFindUnique.mockResolvedValue({
      id: "brand-2",
      _count: { products: 0 },
    });
    mocks.brandDelete.mockResolvedValue({ id: "brand-2" });

    await expect(deleteBrand("brand-2")).resolves.toEqual({ id: "brand-2" });
    expect(mocks.brandDelete).toHaveBeenCalledWith({
      where: { id: "brand-2" },
    });
    expect(mocks.redirectDeleteMany).toHaveBeenCalledWith({
      where: { entityType: "BRAND", entityId: "brand-2" },
    });
  });

  it("releases stale redirect history when a brand path becomes live", async () => {
    mocks.brandFindUnique.mockResolvedValue(null);
    mocks.brandFindFirst.mockResolvedValue(null);
    mocks.brandCreate.mockResolvedValue({
      id: "brand-new",
      name: "Acme Controls",
      slug: "acme-controls",
      description: null,
      logo: null,
      website: null,
      seoTitle: null,
      metaDescription: null,
      ogImage: null,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      _count: { products: 0 },
    });

    await createBrand({
      name: "Acme Controls",
      status: "ACTIVE",
    });

    expect(mocks.redirectDeleteMany).toHaveBeenCalledWith({
      where: { sourcePath: { in: ["/brands/acme-controls"] } },
    });
  });

  it("keeps a brand slug stable when its display name changes", async () => {
    mocks.brandFindFirst.mockResolvedValue(null);
    mocks.brandUpdate.mockResolvedValue({
      id: "brand-3",
      name: "New display name",
      slug: "original-brand-slug",
      description: null,
      logo: null,
      website: null,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      _count: { products: 0 },
    });

    await updateBrand("brand-3", { name: "New display name" });

    expect(mocks.brandUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "brand-3" },
        data: { name: "New display name" },
      }),
    );
    expect(mocks.brandUpdate.mock.calls[0]?.[0].data).not.toHaveProperty(
      "slug",
    );
  });

  it("records and resolves a permanent redirect when a brand slug changes", async () => {
    mocks.brandFindUnique.mockResolvedValue(null);
    mocks.brandUpdate.mockResolvedValue({
      id: "brand-3",
      name: "Original brand",
      slug: "replacement-brand-slug",
      description: null,
      logo: null,
      website: null,
      seoTitle: null,
      metaDescription: null,
      ogImage: null,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      _count: { products: 0 },
    });

    await updateBrand("brand-3", { slug: "replacement-brand-slug" });

    expect(mocks.redirectUpsert).toHaveBeenCalledWith({
      where: { sourcePath: "/brands/original-brand-slug" },
      update: {
        destinationPath: "/brands/replacement-brand-slug",
        entityType: "BRAND",
        entityId: "brand-3",
        permanent: true,
      },
      create: {
        sourcePath: "/brands/original-brand-slug",
        destinationPath: "/brands/replacement-brand-slug",
        entityType: "BRAND",
        entityId: "brand-3",
        permanent: true,
      },
    });

    mocks.redirectFindMany.mockResolvedValue([
      {
        sourcePath: "/brands/original-brand-slug",
        destinationPath: "/brands/replacement-brand-slug",
        entityType: "BRAND",
        entityId: "brand-3",
        permanent: true,
      },
    ]);
    await expect(
      getBrandRedirectBySlug("original-brand-slug"),
    ).resolves.toMatchObject({
      destinationPath: "/brands/replacement-brand-slug",
      entityType: "BRAND",
      permanent: true,
    });
  });

  it("keeps a manufacturer slug stable when its display name changes", async () => {
    mocks.manufacturerFindFirst.mockResolvedValue(null);
    mocks.manufacturerUpdate.mockResolvedValue({
      id: "manufacturer-2",
      name: "New maker name",
      slug: "original-manufacturer-slug",
      description: null,
      logo: null,
      website: null,
      country: null,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      _count: { products: 0 },
    });

    await updateManufacturer("manufacturer-2", { name: "New maker name" });

    expect(mocks.manufacturerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "manufacturer-2" },
        data: { name: "New maker name" },
      }),
    );
    expect(mocks.manufacturerUpdate.mock.calls[0]?.[0].data).not.toHaveProperty(
      "slug",
    );
  });
});
