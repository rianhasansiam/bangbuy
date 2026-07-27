import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchAdminTransactions,
  fetchMyTransactions,
  formatTransactionAmount,
  paymentProviderLabel,
} from "@/features/transactions/api";

describe("transaction history client API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the owner query and retains pagination metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        success: true,
        data: [{ id: "payment-1", amount: 10 }],
        meta: { page: 2, pageSize: 8, total: 9, totalPages: 2 },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchMyTransactions({
      page: 2,
      pageSize: 8,
      status: "SUCCESS",
      provider: "sslcommerz",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/transactions?page=2&pageSize=8&status=SUCCESS&provider=SSLCOMMERZ",
      { method: "GET", cache: "no-store" },
    );
    expect(result.meta).toEqual({
      page: 2,
      pageSize: 8,
      total: 9,
      totalPages: 2,
    });
  });

  it("builds all supported admin filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        success: true,
        data: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchAdminTransactions({
      page: 1,
      pageSize: 20,
      status: "PENDING",
      provider: "SSLCOMMERZ",
      search: " BB-1001 ",
      review: "OPEN",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/transactions?page=1&pageSize=20&status=PENDING&provider=SSLCOMMERZ&search=BB-1001&review=OPEN",
      { method: "GET", cache: "no-store" },
    );
  });

  it("surfaces the API error and rejects invalid envelopes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ error: "Admin access only." }, { status: 403 }),
      ),
    );

    await expect(fetchAdminTransactions()).rejects.toThrow(
      "Admin access only.",
    );
  });

  it("formats provider and money labels", () => {
    expect(paymentProviderLabel("SSLCOMMERZ")).toBe("SSLCommerz");
    expect(paymentProviderLabel("CASH_ON_DELIVERY")).toBe("Cash on delivery");
    expect(paymentProviderLabel("ADMIN_ADVANCE")).toBe("Admin advance");
    expect(formatTransactionAmount(1250, "BDT")).toContain("1,250");
  });
});
