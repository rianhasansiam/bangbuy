import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  listTransactionsForUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/guards", () => ({
  requireUser: mocks.requireUser,
}));
vi.mock("@/lib/payments", () => ({
  listTransactionsForUser: mocks.listTransactionsForUser,
}));

import { GET } from "@/app/api/transactions/route";

function request(query = "") {
  return new NextRequest(`http://localhost/api/transactions${query}`);
}

describe("GET /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({
      ok: true,
      session: {
        expires: "2099-01-01T00:00:00.000Z",
        user: { id: "user-1", role: "USER" },
      },
    });
    mocks.listTransactionsForUser.mockResolvedValue({
      items: [{ id: "payment-1" }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
  });

  it("passes through the authentication response without querying", async () => {
    mocks.requireUser.mockResolvedValue({
      ok: false,
      response: Response.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    });

    const response = await GET(request());

    expect(response.status).toBe(401);
    expect(mocks.listTransactionsForUser).not.toHaveBeenCalled();
  });

  it("rejects invalid pagination and statuses", async () => {
    const response = await GET(request("?page=0&pageSize=101&status=PAID"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid query parameters.",
      fieldErrors: {
        page: expect.any(Array),
        pageSize: expect.any(Array),
        status: expect.any(Array),
      },
    });
    expect(mocks.listTransactionsForUser).not.toHaveBeenCalled();
  });

  it("uses only the authenticated user ID and returns pagination metadata", async () => {
    const response = await GET(
      request(
        "?page=2&pageSize=10&status=SUCCESS&provider=sslcommerz&userId=other",
      ),
    );

    expect(mocks.listTransactionsForUser).toHaveBeenCalledWith("user-1", {
      page: 2,
      pageSize: 10,
      status: "SUCCESS",
      provider: "SSLCOMMERZ",
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
