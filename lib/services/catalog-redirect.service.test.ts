import type { Prisma } from "@/app/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  deleteMany: vi.fn(),
  updateMany: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: <Arguments extends unknown[], Result>(
    operation: (...args: Arguments) => Result,
  ) => operation,
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: { catalogRedirect: { findMany: mocks.findMany } },
}));

import {
  deleteCatalogRedirectsForEntity,
  getCatalogRedirectByPath,
  recordCatalogRedirectMoves,
  releaseCatalogRedirectSources,
} from "@/lib/services/catalog-redirect.service";

function transactionClient(): Prisma.TransactionClient {
  return {
    catalogRedirect: {
      deleteMany: mocks.deleteMany,
      updateMany: mocks.updateMany,
      upsert: mocks.upsert,
    },
  } as unknown as Prisma.TransactionClient;
}

describe("catalog redirect service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMany.mockResolvedValue([]);
    mocks.deleteMany.mockResolvedValue({ count: 0 });
    mocks.updateMany.mockResolvedValue({ count: 0 });
    mocks.upsert.mockImplementation(async ({ create }) => create);
  });

  it("uses one exact cached index and enforces the expected entity type", async () => {
    mocks.findMany.mockResolvedValue([
      {
        sourcePath: "/products/old-motor",
        destinationPath: "/products/current-motor",
        entityType: "PRODUCT",
        entityId: "product-1",
        permanent: true,
      },
    ]);

    await expect(
      getCatalogRedirectByPath(" /PRODUCTS/OLD-MOTOR/ ", "PRODUCT"),
    ).resolves.toMatchObject({ destinationPath: "/products/current-motor" });
    await expect(
      getCatalogRedirectByPath("/products/old-motor", "BRAND"),
    ).resolves.toBeNull();

    expect(mocks.findMany).toHaveBeenCalledWith({
      select: {
        sourcePath: true,
        destinationPath: true,
        entityType: true,
        entityId: true,
        permanent: true,
      },
    });
  });

  it("atomically releases normalized paths when they become live", async () => {
    await releaseCatalogRedirectSources(transactionClient(), [
      " /products/new-motor/ ",
      "/PRODUCTS/NEW-MOTOR",
      "",
    ]);

    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { sourcePath: { in: ["/products/new-motor"] } },
    });
  });

  it("collapses an earlier chain and records one permanent destination", async () => {
    await recordCatalogRedirectMoves(transactionClient(), "PRODUCT", [
      {
        entityId: "product-1",
        sourcePath: "/products/original",
        destinationPath: "/products/current",
      },
    ]);

    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        destinationPath: "/products/original",
        entityType: "PRODUCT",
      },
      data: { destinationPath: "/products/current" },
    });
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sourcePath: "/products/original" },
        create: expect.objectContaining({
          destinationPath: "/products/current",
          permanent: true,
        }),
      }),
    );
  });

  it("removes owned history before a hard delete commits", async () => {
    await deleteCatalogRedirectsForEntity(
      transactionClient(),
      "CATEGORY",
      "category-1",
    );

    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { entityType: "CATEGORY", entityId: "category-1" },
    });
  });
});
