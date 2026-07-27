import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  reconcile: vi.fn(),
  invalidateProductsById: vi.fn(),
  revalidateCacheTags: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/payments", () => ({
  reconcileStaleSslCommerzPayments: mocks.reconcile,
}));
vi.mock("@/lib/cache/catalog-invalidation", () => ({
  invalidateProductsById: mocks.invalidateProductsById,
}));
vi.mock("@/lib/cache/revalidation", () => ({
  revalidateCacheTags: mocks.revalidateCacheTags,
}));

import { POST } from "@/app/api/payments/sslcommerz/reconcile/route";

const SECRET = "0123456789abcdef0123456789abcdef";

function request(token?: string) {
  return new Request(
    "http://localhost/api/payments/sslcommerz/reconcile",
    {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    },
  );
}

describe("POST /api/payments/sslcommerz/reconcile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PAYMENT_RECONCILIATION_SECRET", SECRET);
    mocks.reconcile.mockResolvedValue({
      examined: 2,
      confirmed: 1,
      terminalized: 1,
      locallyExpired: 1,
      stillPending: 0,
      errors: 0,
      affectedProductIds: ["product-1"],
    });
    mocks.invalidateProductsById.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when the scheduler secret is missing or weak", async () => {
    vi.stubEnv("PAYMENT_RECONCILIATION_SECRET", "too-short");

    const response = await POST(request("too-short"));

    expect(response.status).toBe(503);
    expect(mocks.reconcile).not.toHaveBeenCalled();
  });

  it.each([undefined, "wrong-secret"])(
    "rejects an unauthorized scheduler token %j",
    async (token) => {
      const response = await POST(request(token));

      expect(response.status).toBe(401);
      expect(mocks.reconcile).not.toHaveBeenCalled();
    },
  );

  it("runs a bounded recovery batch and invalidates restored stock caches", async () => {
    const response = await POST(request(SECRET));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        examined: 2,
        confirmed: 1,
        terminalized: 1,
        locallyExpired: 1,
        stillPending: 0,
        errors: 0,
      },
    });
    expect(mocks.reconcile).toHaveBeenCalledOnce();
    expect(mocks.invalidateProductsById).toHaveBeenCalledWith(
      ["product-1"],
      { reason: "stale payment reconciliation stock restore" },
    );
    expect(mocks.revalidateCacheTags).toHaveBeenCalledWith([
      "admin-orders",
      "promo-codes",
    ]);
  });
});
