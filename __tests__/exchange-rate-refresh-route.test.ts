import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshExchangeRates = vi.hoisted(() => vi.fn());

vi.mock("@/lib/currency/exchange-rate.service", () => ({
  refreshExchangeRates,
}));

import {
  GET,
  POST,
} from "@/app/api/internal/exchange-rates/refresh/route";

const SECRET = "b".repeat(64);
const ENDPOINT =
  "https://example.com/api/internal/exchange-rates/refresh";

function authorizedRequest(method: "GET" | "POST") {
  return new Request(ENDPOINT, {
    method,
    headers: { Authorization: `Bearer ${SECRET}` },
  });
}

describe("internal exchange-rate refresh route", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", SECRET);
    refreshExchangeRates.mockReset();
    refreshExchangeRates.mockResolvedValue({
      status: "refreshed",
      baseCurrency: "BDT",
      currencies: ["BDT", "AUD", "EUR", "GBP", "USD", "CNY"],
      refreshedAt: "2026-08-19T12:00:00.000Z",
      count: 6,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ["missing", undefined],
    ["incorrect", `Bearer ${"c".repeat(64)}`],
  ])("returns 401 for a %s credential", async (_label, authorization) => {
    const response = await GET(
      new Request(ENDPOINT, {
        headers: authorization ? { Authorization: authorization } : undefined,
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized.",
    });
    expect(refreshExchangeRates).not.toHaveBeenCalled();
  });

  it("fails closed when CRON_SECRET is not configured", async () => {
    vi.stubEnv("CRON_SECRET", "");

    const response = await GET(
      new Request(ENDPOINT, {
        headers: { Authorization: "Bearer anything" },
      }),
    );

    expect(response.status).toBe(401);
    expect(refreshExchangeRates).not.toHaveBeenCalled();
  });

  it.each([
    ["GET", GET],
    ["POST", POST],
  ] as const)("allows an authorized %s refresh", async (method, handler) => {
    const response = await handler(authorizedRequest(method));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { status: "refreshed", count: 6 },
    });
    expect(refreshExchangeRates).toHaveBeenCalledOnce();
  });

  it("returns a generic 503 without leaking refresh failures", async () => {
    refreshExchangeRates.mockRejectedValue(
      new Error("provider-key-and-database-details"),
    );

    const response = await POST(authorizedRequest("POST"));
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).toContain("stale rates were retained");
    expect(body).not.toContain("provider-key-and-database-details");
  });
});
