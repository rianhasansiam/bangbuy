import { describe, expect, it } from "vitest";

import {
  categoryFallbackDescription,
  categoryFallbackTitle,
  productFallbackDescription,
  productFallbackTitle,
} from "@/lib/seo/catalog-metadata";

describe("catalog fallback metadata", () => {
  it("distinguishes same-named categories in separate branches", () => {
    const toolsTitle = categoryFallbackTitle({
      name: "Drills",
      path: "tools/drills",
      breadcrumb: [{ name: "Tools" }],
    });
    const homeTitle = categoryFallbackTitle({
      name: "Drills",
      path: "home/drills",
      breadcrumb: [{ name: "Home" }],
    });
    const toolsDescription = categoryFallbackDescription({
      name: "Drills",
      path: "tools/drills",
      breadcrumb: [{ name: "Tools" }],
      totalProductCount: 4,
    });
    const homeDescription = categoryFallbackDescription({
      name: "Drills",
      path: "home/drills",
      breadcrumb: [{ name: "Home" }],
      totalProductCount: 4,
    });

    expect(toolsTitle).toBe("Shop Tools › Drills Online");
    expect(homeTitle).toBe("Shop Home › Drills Online");
    expect(toolsTitle).not.toBe(homeTitle);
    expect(toolsDescription).not.toBe(homeDescription);
  });

  it("uses the stable product code to distinguish duplicate product names", () => {
    const firstTitle = productFallbackTitle({
      name: "Industrial Motor",
      productCode: "PRD-00001",
    });
    const secondTitle = productFallbackTitle({
      name: "Industrial Motor",
      productCode: "PRD-00002",
    });
    const firstDescription = productFallbackDescription({
      name: "Industrial Motor",
      productCode: "PRD-00001",
      description: "High-efficiency motor.",
      categoryName: "Motors",
      price: 1200,
    });
    const secondDescription = productFallbackDescription({
      name: "Industrial Motor",
      productCode: "PRD-00002",
      description: "High-efficiency motor.",
      categoryName: "Motors",
      price: 1200,
    });

    expect(firstTitle).not.toBe(secondTitle);
    expect(firstDescription).not.toBe(secondDescription);
    expect(firstDescription).toContain("PRD-00001");
  });

  it("bounds long titles while preserving stable distinguishing suffixes", () => {
    const categoryTitle = categoryFallbackTitle({
      name: "Programmable Logic Controllers and Human Machine Interfaces",
      path: `${"industrial-automation/".repeat(20)}plcs-hmis`,
      breadcrumb: Array.from({ length: 20 }, () => ({
        name: "Industrial Automation",
      })),
    });
    const productTitle = productFallbackTitle({
      name: "Industrial automation motor controller ".repeat(8),
      productCode: "PRD-00999",
    });

    expect(categoryTitle.length).toBeLessThanOrEqual(70);
    expect(categoryTitle).toMatch(/ Online · [a-z0-9]{7}$/);
    expect(productTitle.length).toBeLessThanOrEqual(70);
    expect(productTitle).toContain("PRD-00999");
    expect(productTitle).toContain("BangBuy");
  });
});
