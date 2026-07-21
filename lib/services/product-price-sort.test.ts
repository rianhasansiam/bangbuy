import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  productFindMany: vi.fn(),
  queryRaw: vi.fn(),
  breadcrumbs: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    product: { findMany: mocks.productFindMany },
    $queryRaw: mocks.queryRaw,
  },
}));
vi.mock("@/lib/services/category.service", () => ({
  getCategoryBreadcrumbsByIds: mocks.breadcrumbs,
  getCategorySubtreeIds: vi.fn(),
  getEffectiveActiveCategoryIds: vi.fn(),
  isCategoryEffectivelyActive: vi.fn(),
}));

import { listProducts } from "@/lib/services/product.service";
import { productQuerySchema } from "@/lib/validations/product.validation";

describe("product price sorting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.productFindMany.mockResolvedValue([{ id: "product-1" }]);
    mocks.queryRaw.mockResolvedValue([]);
    mocks.breadcrumbs.mockResolvedValue(new Map());
  });

  it.each([
    ["price-low", "ASC"],
    ["price-high", "DESC"],
  ] as const)(
    "sorts %s by the effective discounted price",
    async (sort, direction) => {
      await listProducts(productQuerySchema.parse({ sort }), {
        publicOnly: false,
      });

      const query = mocks.queryRaw.mock.calls[0]?.[0] as { sql?: string };
      const sql = query.sql?.replace(/\s+/g, " ");
      expect(sql).toContain(
        'CASE WHEN p."discountPrice" IS NOT NULL AND p."discountPrice" < p."salePrice"',
      );
      expect(sql).toContain(`ORDER BY "effectivePrice" ${direction}`);
    },
  );
});
