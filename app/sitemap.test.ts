import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const catalogMocks = vi.hoisted(() => ({
  categoryFindMany: vi.fn(),
  productFindMany: vi.fn(),
  brandFindMany: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    category: { findMany: catalogMocks.categoryFindMany },
    product: { findMany: catalogMocks.productFindMany },
    brand: { findMany: catalogMocks.brandFindMany },
  },
}));

vi.mock("@/lib/seo/site", () => ({
  absoluteUrl: (path: string) => `https://example.com${path}`,
}));

vi.mock("@/lib/cache/catalog-dependency", () => ({
  dependOnCatalogTags: vi.fn().mockResolvedValue(undefined),
}));

import sitemap from "./sitemap";

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    catalogMocks.categoryFindMany.mockResolvedValue([
      {
        id: "active-root",
        parentId: null,
        path: "tools",
        status: "ACTIVE",
        updatedAt: new Date("2026-07-20T00:00:00.000Z"),
      },
      {
        id: "inactive-child",
        parentId: "active-root",
        path: "tools/retired",
        status: "INACTIVE",
        updatedAt: new Date("2026-07-19T00:00:00.000Z"),
      },
    ]);
    catalogMocks.productFindMany.mockResolvedValue([
      {
        slug: "active-drill",
        categoryId: "active-root",
        updatedAt: new Date("2026-07-21T00:00:00.000Z"),
      },
      {
        slug: "hidden-drill",
        categoryId: "inactive-child",
        updatedAt: new Date("2026-07-21T00:00:00.000Z"),
      },
    ]);
    catalogMocks.brandFindMany.mockResolvedValue([
      {
        slug: "acme",
        updatedAt: new Date("2026-07-18T00:00:00.000Z"),
      },
    ]);
  });

  it("includes active brands and products only from visible categories", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://example.com/brands");
    expect(urls).toContain("https://example.com/brands/acme");
    expect(urls).toContain("https://example.com/categories/tools");
    expect(urls).toContain("https://example.com/products/active-drill");
    expect(urls).not.toContain("https://example.com/categories/tools/retired");
    expect(urls).not.toContain("https://example.com/products/hidden-drill");
  });

  it("uses a stable last-modified value for static pages", async () => {
    const first = await sitemap();
    const second = await sitemap();
    const firstHome = first.find((entry) => entry.url === "https://example.com/");
    const secondHome = second.find((entry) => entry.url === "https://example.com/");

    expect(firstHome?.lastModified).toEqual(
      new Date("2026-07-22T00:00:00.000Z"),
    );
    expect(secondHome?.lastModified).toEqual(firstHome?.lastModified);
  });

  it("fails regeneration when the category graph cannot be loaded", async () => {
    const databaseError = new Error("database unavailable");
    catalogMocks.categoryFindMany.mockRejectedValue(databaseError);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(sitemap()).rejects.toBe(databaseError);
    expect(catalogMocks.productFindMany).not.toHaveBeenCalled();
    expect(catalogMocks.brandFindMany).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
