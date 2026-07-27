import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  isAdminRequest: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  getCategoryById: vi.fn(),
  listCategories: vi.fn(),
  listCategoriesCached: vi.fn(),
  updateCategory: vi.fn(),
  reorderCategories: vi.fn(),
  logAdminActivity: vi.fn(),
  invalidateCategoryMutation: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  isAdminRequest: mocks.isAdminRequest,
}));
vi.mock("@/lib/services/category.service", () => ({
  createCategory: mocks.createCategory,
  deleteCategory: mocks.deleteCategory,
  getCategoryById: mocks.getCategoryById,
  listCategories: mocks.listCategories,
  listCategoriesCached: mocks.listCategoriesCached,
  updateCategory: mocks.updateCategory,
  reorderCategories: mocks.reorderCategories,
}));
vi.mock("@/lib/services/admin-activity.service", () => ({
  logAdminActivity: mocks.logAdminActivity,
}));
vi.mock("@/lib/cache/catalog-invalidation", () => ({
  invalidateCategoryMutation: mocks.invalidateCategoryMutation,
}));

import { DELETE as deleteCategoryRoute } from "@/app/api/categories/[id]/route";
import { GET, POST } from "@/app/api/categories/route";
import { PATCH as reorderCategoryRoute } from "@/app/api/categories/reorder/route";
import { ServiceError } from "@/lib/services/service-error";

const adminSession = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin",
    image: null,
    role: "ADMIN" as const,
  },
  expires: "2099-01-01T00:00:00.000Z",
};

function guardResponse(status: 401 | 403, error: string): Response {
  return Response.json({ error }, { status });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ ok: true, session: adminSession });
  mocks.isAdminRequest.mockResolvedValue(false);
  mocks.logAdminActivity.mockResolvedValue(undefined);
  mocks.listCategories.mockResolvedValue({
    items: [],
    meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  });
  mocks.listCategoriesCached.mockResolvedValue({
    items: [],
    meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  });
});

describe("category API authentication", () => {
  it.each([
    [401, "Authentication required."],
    [403, "Admin access only."],
  ] as const)("passes through a %i write guard response", async (status, error) => {
    mocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: guardResponse(status, error),
    });

    const response = await POST(
      new NextRequest("http://localhost/api/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Power tools" }),
      }),
    );

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error });
    expect(mocks.createCategory).not.toHaveBeenCalled();
    expect(mocks.logAdminActivity).not.toHaveBeenCalled();
  });

  it("applies the same admin guard before category reorder validation", async () => {
    mocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: guardResponse(403, "Admin access only."),
    });

    const response = await reorderCategoryRoute(
      new NextRequest("http://localhost/api/categories/reorder", {
        method: "PATCH",
        body: "not-json",
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.reorderCategories).not.toHaveBeenCalled();
  });
});

describe("GET /api/categories", () => {
  it("returns the standard validation envelope before reading the catalog", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/categories?page=0&view=invalid"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid query parameters.",
      fieldErrors: {
        page: expect.any(Array),
        view: expect.any(Array),
      },
    });
    expect(mocks.isAdminRequest).not.toHaveBeenCalled();
    expect(mocks.listCategories).not.toHaveBeenCalled();
    expect(mocks.listCategoriesCached).not.toHaveBeenCalled();
  });

  it("forwards parsed tree queries to the uncached admin service", async () => {
    mocks.isAdminRequest.mockResolvedValue(true);
    mocks.listCategories.mockResolvedValue({
      items: [{ id: "root-1", name: "Tools", children: [] }],
      meta: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/categories?view=tree&parentId=root&status=INACTIVE&pageSize=50&sort=name",
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.listCategories).toHaveBeenCalledWith({
      page: 1,
      pageSize: 50,
      parentId: null,
      sort: "name",
      status: "INACTIVE",
      view: "tree",
      withCounts: true,
      withProductCount: false,
    });
    expect(mocks.listCategoriesCached).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [{ id: "root-1", name: "Tools", children: [] }],
      meta: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
    });
  });

  it("forces effective ACTIVE ancestry and cached reads for public tree queries", async () => {
    await GET(
      new NextRequest("http://localhost/api/categories?view=tree&pageSize=100"),
    );

    expect(mocks.listCategoriesCached).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 100,
        status: "ACTIVE",
        view: "tree",
      }),
      { effectiveActiveOnly: true, activeProductsOnly: true },
    );
    expect(mocks.listCategories).not.toHaveBeenCalled();
  });
});

describe("category API conflict mapping", () => {
  it("maps dependency conflicts to 409 with service details", async () => {
    mocks.deleteCategory.mockRejectedValue(
      new ServiceError(409, "Only an empty leaf category can be deleted.", {
        childCount: 2,
        directProductCount: 1,
        totalProductCount: 4,
      }),
    );

    const response = await deleteCategoryRoute(
      new NextRequest("http://localhost/api/categories/tools", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "tools" }) },
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Only an empty leaf category can be deleted.",
      details: {
        childCount: 2,
        directProductCount: 1,
        totalProductCount: 4,
      },
    });
    expect(mocks.invalidateCategoryMutation).not.toHaveBeenCalled();
  });
});
