import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  listTransactionsForAdmin: vi.fn(),
  logAdminRouteActivity: vi.fn(),
  revalidateCacheTagsImmediately: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/guards", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/lib/payments", () => ({
  listTransactionsForAdmin: mocks.listTransactionsForAdmin,
}));
vi.mock("@/lib/services/admin-activity.service", () => ({
  logAdminRouteActivity: mocks.logAdminRouteActivity,
}));
vi.mock("@/lib/cache/revalidation", () => ({
  revalidateCacheTagsImmediately: mocks.revalidateCacheTagsImmediately,
}));

import { GET } from "@/app/api/admin/transactions/route";

function request(query = "") {
  return new NextRequest(`http://localhost/api/admin/transactions${query}`);
}

describe("GET /api/admin/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      session: {
        expires: "2099-01-01T00:00:00.000Z",
        user: { id: "admin-1", role: "ADMIN" },
      },
    });
    mocks.listTransactionsForAdmin.mockResolvedValue({
      items: [{ id: "payment-1" }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
    mocks.logAdminRouteActivity.mockResolvedValue(undefined);
  });

  it("passes through the admin guard response", async () => {
    mocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: Response.json(
        { error: "Admin access only." },
        { status: 403 },
      ),
    });

    const response = await GET(request());

    expect(response.status).toBe(403);
    expect(mocks.listTransactionsForAdmin).not.toHaveBeenCalled();
  });

  it("rejects invalid filters before querying the ledger", async () => {
    const response = await GET(
      request("?status=PAID&review=CLOSED&pageSize=500"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid query parameters.",
      fieldErrors: {
        status: expect.any(Array),
        review: expect.any(Array),
        pageSize: expect.any(Array),
      },
    });
    expect(mocks.listTransactionsForAdmin).not.toHaveBeenCalled();
  });

  it("normalizes filters and returns private paginated data", async () => {
    const response = await GET(
      request(
        "?page=2&pageSize=10&provider=sslcommerz&status=PENDING&search=BB-1001&review=OPEN",
      ),
    );

    expect(mocks.listTransactionsForAdmin).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      provider: "SSLCOMMERZ",
      status: "PENDING",
      search: "BB-1001",
      review: "OPEN",
    });
    expect(mocks.logAdminRouteActivity).toHaveBeenCalledWith({
      scope: "admin.transactions.GET",
      method: "GET",
      actor: { id: "admin-1", role: "ADMIN" },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [{ id: "payment-1" }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
  });
});
