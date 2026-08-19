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
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("DEV_COUNTRY", "");
  vi.stubEnv("GEO_COUNTRY_HEADER", "");
  mockedLoadQuote.mockImplementation(async (currency) =>
    availableQuote(currency),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("request currency resolution", () => {
  it("maps a development Germany override through the normal EUR flow", async () => {
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_COUNTRY", "DE");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "BD" }),
      }),
    ).resolves.toMatchObject({
      currency: "EUR",
      countryCode: "DE",
      source: "geo",
    });

    expect(mockedLoadQuote).toHaveBeenCalledWith("EUR");
  });

  it("ignores a Germany development override in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEV_COUNTRY", "DE");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "BD" }),
      }),
    ).resolves.toMatchObject({
      currency: "BDT",
      countryCode: "BD",
      source: "geo",
    });
  });

  it.each([
    ["DE", "EUR"],
    ["CN", "CNY"],
    ["BD", "BDT"],
    ["IN", "USD"],
  ] as const)(
    "resolves Cloudflare country %s through the full %s request flow",
    async (country, currency) => {
      const context = await resolveRequestCurrencyContext({
        headers: new Headers({ "CF-IPCountry": country }),
      });

      expect(context).toMatchObject({
        currency,
        countryCode: country,
        source: "geo",
      });
      expect(mockedLoadQuote).toHaveBeenCalledWith(currency);
    },
  );

  it("uses the BDT base when no visitor country can be detected", async () => {
    await expect(
      resolveRequestCurrencyContext({ headers: headers({}) }),
    ).resolves.toMatchObject({
      currency: "BDT",
      exchangeRate: "1",
      countryCode: null,
      source: "fallback",
    });

    expect(mockedLoadQuote).toHaveBeenCalledWith("BDT");
  });

  it("prefers Cloudflare before a configured Nginx country fallback", async () => {
    vi.stubEnv("GEO_COUNTRY_HEADER", "x-origin-country");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({
          "cf-ipcountry": "DE",
          "x-origin-country": "CN",
        }),
      }),
    ).resolves.toMatchObject({
      currency: "EUR",
      countryCode: "DE",
      source: "geo",
    });
  });

  it("uses the configured Nginx country when platform headers are absent", async () => {
    vi.stubEnv("GEO_COUNTRY_HEADER", "x-origin-country");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "x-origin-country": "CN" }),
      }),
    ).resolves.toMatchObject({
      currency: "CNY",
      countryCode: "CN",
      source: "geo",
    });
  });

  it("fails closed when Cloudflare is present but malformed", async () => {
    vi.stubEnv("GEO_COUNTRY_HEADER", "x-origin-country");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({
          "cf-ipcountry": "Germany",
          "x-origin-country": "CN",
        }),
      }),
    ).resolves.toMatchObject({
      currency: "BDT",
      countryCode: null,
      source: "fallback",
    });
    expect(mockedLoadQuote).toHaveBeenLastCalledWith("BDT");
  });

  it("does not let unrelated platform headers outrank a configured Nginx header", async () => {
    vi.stubEnv("GEO_COUNTRY_HEADER", "x-origin-country");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({
          "x-vercel-ip-country": "US",
          "cloudfront-viewer-country": "AU",
          "x-origin-country": "CN",
        }),
      }),
    ).resolves.toMatchObject({
      currency: "CNY",
      countryCode: "CN",
      source: "geo",
    });
  });

  it("uses DEV_COUNTRY before a configured geo header in development", async () => {
    const debugSpy = vi
      .spyOn(console, "debug")
      .mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_COUNTRY", "US");
    vi.stubEnv("GEO_COUNTRY_HEADER", "x-origin-country");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "x-origin-country": "BD" }),
      }),
    ).resolves.toMatchObject({
      currency: "USD",
      exchangeRate: "0.0082",
      countryCode: "US",
      source: "geo",
    });

    expect(mockedLoadQuote).toHaveBeenCalledWith("USD");
    expect(debugSpy).toHaveBeenCalledWith(
      "[currency] Using DEV_COUNTRY override:",
      "US",
    );
  });

  it("normalizes a lowercase DEV_COUNTRY in development", async () => {
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_COUNTRY", "gb");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "BD" }),
      }),
    ).resolves.toMatchObject({
      currency: "GBP",
      countryCode: "GB",
      source: "geo",
    });
  });

  it("trims a whitespace-padded DEV_COUNTRY in development", async () => {
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_COUNTRY", "  AU  ");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "BD" }),
      }),
    ).resolves.toMatchObject({
      currency: "AUD",
      countryCode: "AU",
      source: "geo",
    });
  });

  it("ignores an invalid DEV_COUNTRY and continues normal detection", async () => {
    const debugSpy = vi
      .spyOn(console, "debug")
      .mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_COUNTRY", "USA");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "BD" }),
      }),
    ).resolves.toMatchObject({
      currency: "BDT",
      countryCode: "BD",
      source: "geo",
    });

    expect(mockedLoadQuote).toHaveBeenCalledWith("BDT");
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("never uses DEV_COUNTRY in production", async () => {
    const debugSpy = vi
      .spyOn(console, "debug")
      .mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEV_COUNTRY", "US");

    await expect(
      resolveRequestCurrencyContext({
        headers: headers({ "cf-ipcountry": "BD" }),
      }),
    ).resolves.toMatchObject({
      currency: "BDT",
      countryCode: "BD",
      source: "geo",
    });

    expect(mockedLoadQuote).toHaveBeenCalledWith("BDT");
    expect(debugSpy).not.toHaveBeenCalled();
  });

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
