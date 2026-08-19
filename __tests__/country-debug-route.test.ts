import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCountryHeaderConfiguration = vi.hoisted(() => vi.fn());
const getCurrencyContextFromRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/currency/request-currency", () => ({
  getCountryHeaderConfiguration,
  getCurrencyContextFromRequest,
}));

import { GET } from "@/app/api/debug/country/route";

const SECRET = "d".repeat(64);
const ENDPOINT = "https://example.com/api/debug/country";

function request(
  authorization?: string,
  additionalHeaders: Record<string, string> = {},
) {
  return new Request(ENDPOINT, {
    headers: {
      ...(authorization ? { Authorization: authorization } : {}),
      ...additionalHeaders,
    },
  });
}

describe("country diagnostic route", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEV_COUNTRY", "");
    vi.stubEnv("CURRENCY_DEBUG_SECRET", SECRET);
    getCountryHeaderConfiguration.mockReturnValue({
      configured: false,
      headerName: null,
    });
    getCurrencyContextFromRequest.mockResolvedValue({
      baseCurrency: "BDT",
      currency: "EUR",
      exchangeRate: "0.0071",
      exchangeRateTimestamp: "2026-08-19T06:00:00.000Z",
      countryCode: "DE",
      source: "geo",
    });
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ["missing", undefined],
    ["incorrect", `Bearer ${"e".repeat(64)}`],
  ])("rejects a %s production credential", async (_label, authorization) => {
    const response = await GET(request(authorization));

    expect(response.status).toBe(401);
    expect(getCurrencyContextFromRequest).not.toHaveBeenCalled();
  });

  it("fails closed when the production debug secret is absent", async () => {
    vi.stubEnv("CURRENCY_DEBUG_SECRET", "");

    const response = await GET(request("Bearer anything"));

    expect(response.status).toBe(401);
    expect(getCurrencyContextFromRequest).not.toHaveBeenCalled();
  });

  it("returns only normalized, no-store country diagnostics", async () => {
    const response = await GET(
      request(`Bearer ${SECRET}`, {
        "CF-IPCountry": " de ",
        "CF-Ray": "sensitive-ray-value",
        Cookie: "currency=USD; private=value",
        "X-Real-IP": "203.0.113.9",
      }),
    );
    const text = await response.text();
    const body = JSON.parse(text) as {
      success: boolean;
      data: Record<string, unknown>;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(body).toMatchObject({
      success: true,
      data: {
        nodeEnv: "production",
        devOverrideEnabled: false,
        headers: {
          cfIpCountry: { present: true, countryCode: "DE" },
          xVercelIpCountry: { present: false, countryCode: null },
          cloudfrontViewerCountry: { present: false, countryCode: null },
        },
        detectedCountry: "DE",
        mappedCurrency: "EUR",
        resolvedCurrency: "EUR",
        resolutionSource: "geo",
      },
    });
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain("sensitive-ray-value");
    expect(text).not.toContain("private=value");
    expect(text).not.toContain("203.0.113.9");
  });

  it("reports a configured custom header without exposing other headers", async () => {
    getCountryHeaderConfiguration.mockReturnValue({
      configured: true,
      headerName: "X-BangBuy-Country",
    });
    getCurrencyContextFromRequest.mockResolvedValue({
      baseCurrency: "BDT",
      currency: "CNY",
      exchangeRate: "0.0588",
      exchangeRateTimestamp: "2026-08-19T06:00:00.000Z",
      countryCode: "CN",
      source: "geo",
    });

    const response = await GET(
      request(`Bearer ${SECRET}`, { "X-BangBuy-Country": "CN" }),
    );

    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        configuredCountryHeader: {
          configured: true,
          validName: true,
          name: "X-BangBuy-Country",
          present: true,
          countryCode: "CN",
        },
        detectedCountry: "CN",
        mappedCurrency: "CNY",
        resolvedCurrency: "CNY",
      },
    });
  });

  it("distinguishes country mapping from the effective cookie currency", async () => {
    getCurrencyContextFromRequest.mockResolvedValue({
      baseCurrency: "BDT",
      currency: "USD",
      exchangeRate: "0.0082",
      exchangeRateTimestamp: "2026-08-19T06:00:00.000Z",
      countryCode: "DE",
      source: "cookie",
    });

    const response = await GET(
      request(`Bearer ${SECRET}`, {
        "CF-IPCountry": "DE",
        Cookie: "currency=USD",
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        detectedCountry: "DE",
        mappedCurrency: "EUR",
        resolvedCurrency: "USD",
        resolutionSource: "cookie",
      },
    });
  });

  it("allows diagnostics without a secret only in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("CURRENCY_DEBUG_SECRET", "");
    getCurrencyContextFromRequest.mockResolvedValue({
      baseCurrency: "BDT",
      currency: "BDT",
      exchangeRate: "1",
      exchangeRateTimestamp: null,
      countryCode: "BD",
      source: "geo",
    });

    const response = await GET(request(undefined, { "CF-IPCountry": "BD" }));

    expect(response.status).toBe(200);
  });
});
