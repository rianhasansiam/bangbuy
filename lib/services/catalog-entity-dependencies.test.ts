import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  brandFindUnique: vi.fn(),
  brandDelete: vi.fn(),
  brandFindFirst: vi.fn(),
  brandUpdate: vi.fn(),
  manufacturerFindUnique: vi.fn(),
  manufacturerDelete: vi.fn(),
  manufacturerFindFirst: vi.fn(),
  manufacturerUpdate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    brand: {
      findFirst: mocks.brandFindFirst,
      update: mocks.brandUpdate,
    },
    manufacturer: {
      findFirst: mocks.manufacturerFindFirst,
      update: mocks.manufacturerUpdate,
    },
  },
}));

import { deleteBrand, updateBrand } from "@/lib/services/brand.service";
import {
  deleteManufacturer,
  updateManufacturer,
} from "@/lib/services/manufacturer.service";

describe("catalog entity dependency guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(
      async (
        callback: (tx: {
          brand: {
            findUnique: typeof mocks.brandFindUnique;
            delete: typeof mocks.brandDelete;
          };
          manufacturer: {
            findUnique: typeof mocks.manufacturerFindUnique;
            delete: typeof mocks.manufacturerDelete;
          };
        }) => Promise<unknown>,
      ) =>
        callback({
          brand: {
            findUnique: mocks.brandFindUnique,
            delete: mocks.brandDelete,
          },
          manufacturer: {
            findUnique: mocks.manufacturerFindUnique,
            delete: mocks.manufacturerDelete,
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
    expect(mocks.brandUpdate.mock.calls[0]?.[0].data).not.toHaveProperty("slug");
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
