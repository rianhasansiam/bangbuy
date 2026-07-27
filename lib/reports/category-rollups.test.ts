import { describe, expect, it } from "vitest";

import { buildCategoryPerformance } from "@/lib/reports/category-rollups";

describe("category report rollups", () => {
  const categories = [
    {
      id: "tools",
      name: "Tools",
      path: "tools",
      parentId: null,
      depth: 0,
      status: "ACTIVE" as const,
      directProductCount: 2,
    },
    {
      id: "power",
      name: "Power Tools",
      path: "tools/power-tools",
      parentId: "tools",
      depth: 1,
      status: "ACTIVE" as const,
      directProductCount: 3,
    },
    {
      id: "drills",
      name: "Drills",
      path: "tools/power-tools/drills",
      parentId: "power",
      depth: 2,
      status: "INACTIVE" as const,
      directProductCount: 4,
    },
    {
      id: "safety",
      name: "Safety",
      path: "safety",
      parentId: null,
      depth: 0,
      status: "ACTIVE" as const,
      directProductCount: 1,
    },
  ];

  it("keeps direct rows separate and labels them with their ancestry", () => {
    const result = buildCategoryPerformance(categories, [
      { categoryId: "power", unitsSold: 5, revenue: 500 },
    ]);

    const powerTools = result.rows.find((row) => row.categoryId === "power");
    expect(powerTools).toMatchObject({
      breadcrumbLabel: "Tools / Power Tools",
      directProductCount: 3,
      productCount: 3,
      unitsSold: 5,
      revenue: 500,
    });
  });

  it("attributes every descendant exactly once to its root rollup", () => {
    const result = buildCategoryPerformance(categories, [
      { categoryId: "tools", unitsSold: 2, revenue: 100 },
      { categoryId: "power", unitsSold: 5, revenue: 500 },
      { categoryId: "drills", unitsSold: 7, revenue: 700 },
      { categoryId: "safety", unitsSold: 1, revenue: 50 },
    ]);

    expect(result.rootRollups).toEqual([
      {
        categoryId: "tools",
        name: "Tools",
        path: "tools",
        status: "ACTIVE",
        categoryCount: 3,
        totalProductCount: 9,
        unitsSold: 14,
        revenue: 1300,
      },
      {
        categoryId: "safety",
        name: "Safety",
        path: "safety",
        status: "ACTIVE",
        categoryCount: 1,
        totalProductCount: 1,
        unitsSold: 1,
        revenue: 50,
      },
    ]);
    expect(result.totals).toEqual({ products: 10, unitsSold: 15, revenue: 1350 });
  });

  it("computes totals before any report preview limit is applied", () => {
    const result = buildCategoryPerformance(categories, [
      { categoryId: "tools", unitsSold: 2, revenue: 200 },
      { categoryId: "safety", unitsSold: 1, revenue: 100 },
    ]);

    expect(result.rows.slice(0, 1)).toHaveLength(1);
    expect(result.totals).toEqual({ products: 10, unitsSold: 3, revenue: 300 });
  });
});
