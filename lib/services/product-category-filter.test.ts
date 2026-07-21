import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  productFindMany: vi.fn(),
  productCount: vi.fn(),
  activeCategoryIds: vi.fn(),
  categorySubtreeIds: vi.fn(),
  categoryBreadcrumbs: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    product: {
      findMany: mocks.productFindMany,
      count: mocks.productCount,
    },
  },
}));
vi.mock("@/lib/services/category.service", () => ({
  getEffectiveActiveCategoryIds: mocks.activeCategoryIds,
  getCategorySubtreeIds: mocks.categorySubtreeIds,
  getCategoryBreadcrumbsByIds: mocks.categoryBreadcrumbs,
  isCategoryEffectivelyActive: vi.fn(),
}));

import { listProducts } from "@/lib/services/product.service";
import { productQuerySchema } from "@/lib/validations/product.validation";

describe("product descendant-category filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.activeCategoryIds.mockResolvedValue([
      "tools",
      "power-tools",
      "drills",
      "hidden-branch",
    ]);
    mocks.categorySubtreeIds.mockResolvedValue(["power-tools", "drills"]);
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);
    mocks.categoryBreadcrumbs.mockResolvedValue(new Map());
  });

  it("expands a canonical path into its effectively active descendant IDs", async () => {
    const query = productQuerySchema.parse({
      categoryPath: "tools/power-tools",
    });

    await listProducts(query, { publicOnly: true });

    expect(mocks.categorySubtreeIds).toHaveBeenCalledWith(
      { path: "tools/power-tools" },
      { effectiveActiveOnly: true },
    );
    const expectedWhere = {
      AND: [
        { categoryId: { in: ["power-tools", "drills"] } },
        { status: "ACTIVE" },
      ],
    };
    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(mocks.productCount).toHaveBeenCalledWith({ where: expectedWhere });
  });
});
