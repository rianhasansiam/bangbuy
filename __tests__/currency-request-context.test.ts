import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CurrencyCode } from "@/lib/currency/config";
import type { CurrencyQuote } from "@/lib/currency/exchange-rate.service";
import { loadExchangeRateQuote } from "@/lib/currency/exchange-rate.service";
import type { HeadersLike } from "@/lib/currency/detect-country";
import { resolveRequestCurrencyContext } from "@/lib/currency/request-currency";

vi.mock("@/lib/currency/exchange-rate.service", () => ({
  loadExchangeRateQuote: vi.fn(),
}));

const mockedLoadQuote = vi.mocked(loadExchangeRateQuote);
const fetchedAt = "2026-08-19T06:00:00.000Z";

const rates: Record<CurrencyCode, string> = {
  BDT: "1",
  AUD: "0.0123",
  EUR: "0.0071",
  GBP: "0.0061",
  USD: "0.0082",
  CNY: "0.0588",
};

function headers(values: Record<string, string | null>): HeadersLike {
  return {
    get(name) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

function availableQuote(currency: CurrencyCode): CurrencyQuote {
  return {
    baseCurrency: "BDT",
    requestedCurrency: currency,
    currency,
    rate: rates[currency],
    fetchedAt: currency === "BDT" ? null : fetchedAt,
    stale: false,
  };
}

beforeEach(() => {
  vi.stubEnv("GEO_COUNTRY_HEADER", "");
  mockedLoadQuote.mockImplementation(async (currency) =>
    availableQuote(currency),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("request currency resolution", () => {
  it("lets a valid exact currency cookie override geo detection", async () => {
    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "US" }),
        currencyCookie: "EUR",
      }),
    ).resolves.toEqual({
      baseCurrency: "BDT",
      currency: "EUR",
      exchangeRate: "0.0071",
      exchangeRateTimestamp: fetchedAt,
      countryCode: "US",
      source: "cookie",
    });

    expect(mockedLoadQuote).toHaveBeenCalledWith("EUR");
  });

  it.each(["usd", "CAD", " USD ", ""])(
    "ignores invalid cookie %j and falls through to trusted geo",
    async (currencyCookie) => {
      const context = await resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "AU" }),
        currencyCookie,
      });

      expect(context).toMatchObject({
        currency: "AUD",
        exchangeRate: "0.0123",
        countryCode: "AU",
        source: "geo",
      });
      expect(mockedLoadQuote).toHaveBeenLastCalledWith("AUD");
    },
  );

  it("trusts a custom geo header only when it is explicitly configured", async () => {
    const requestHeaders = headers({ "x-origin-country": "CN" });

    await expect(
      resolveRequestCurrencyContext({ headers: requestHeaders }),
    ).resolves.toMatchObject({
      currency: "BDT",
      countryCode: null,
      source: "fallback",
    });

    vi.stubEnv("GEO_COUNTRY_HEADER", "x-origin-country");

    await expect(
      resolveRequestCurrencyContext({ headers: requestHeaders }),
    ).resolves.toMatchObject({
      currency: "CNY",
      exchangeRate: "0.0588",
      countryCode: "CN",
      source: "geo",
    });
  });

  it("fails closed for a malformed custom-header configuration", async () => {
    vi.stubEnv("GEO_COUNTRY_HEADER", "bad header name");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({
          "cf-ipcountry": "US",
          "bad header name": "AU",
        }),
      }),
    ).resolves.toEqual({
      baseCurrency: "BDT",
      currency: "BDT",
      exchangeRate: "1",
      exchangeRateTimestamp: null,
      countryCode: null,
      source: "fallback",
    });

    expect(mockedLoadQuote).toHaveBeenCalledWith("BDT");
  });

  it("downgrades the currency, rate, timestamp, and source when a quote is missing", async () => {
    mockedLoadQuote.mockResolvedValueOnce({
      baseCurrency: "BDT",
      requestedCurrency: "USD",
      currency: "BDT",
      rate: "1",
      fetchedAt: null,
      stale: false,
    });

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "US" }),
      }),
    ).resolves.toEqual({
      baseCurrency: "BDT",
      currency: "BDT",
      exchangeRate: "1",
      exchangeRateTimestamp: null,
      countryCode: "US",
      source: "fallback",
    });
  });
});
