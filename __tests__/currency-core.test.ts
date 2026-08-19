import { describe, expect, it } from "vitest";

import {
  BASE_CURRENCY,
  CURRENCY_CONFIG,
  DEFAULT_CURRENCY_CONTEXT,
  DISPLAY_LOCALE,
  FOREIGN_CURRENCIES,
  isCurrencyCode,
  parseCurrencyCode,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/lib/currency/config";
import {
  convertFromBDT,
  convertToBDT,
} from "@/lib/currency/convert-money";
import {
  countryToCurrency,
  EUROZONE_COUNTRY_CODES,
  normalizeCountryCode,
} from "@/lib/currency/country-currency";
import {
  detectCountryCode,
  detectCurrency,
  normalizeCountryHeaderValue,
  type HeadersLike,
} from "@/lib/currency/detect-country";
import { formatMoney } from "@/lib/currency/format-money";
import {
  createPricingContext,
  priceFromBDT,
  priceToBDT,
} from "@/lib/currency/pricing.service";

function headers(values: Record<string, string | null>): HeadersLike {
  return {
    get(name) {
      return values[name] ?? null;
    },
  };
}

describe("currency configuration", () => {
  it("contains exactly the six allowed currencies in canonical order", () => {
    expect(BASE_CURRENCY).toBe("BDT");
    expect(SUPPORTED_CURRENCIES).toEqual([
      "BDT",
      "AUD",
      "EUR",
      "GBP",
      "USD",
      "CNY",
    ]);
    expect(Object.keys(CURRENCY_CONFIG)).toEqual(SUPPORTED_CURRENCIES);
    expect(FOREIGN_CURRENCIES).toEqual([
      "AUD",
      "EUR",
      "GBP",
      "USD",
      "CNY",
    ]);
  });

  it.each(SUPPORTED_CURRENCIES)("accepts supported currency %s", (currency) => {
    expect(isCurrencyCode(currency)).toBe(true);
    expect(parseCurrencyCode(currency)).toBe(currency);
    expect(CURRENCY_CONFIG[currency]).toMatchObject({
      code: currency,
      decimals: 2,
    });
  });

  it.each(["CAD", "JPY", "INR", "AED", "SAR", "usd", " USD ", "", null])(
    "rejects unsupported or malformed currency %s",
    (currency) => {
      expect(isCurrencyCode(currency)).toBe(false);
      expect(parseCurrencyCode(currency)).toBeNull();
    },
  );

  it("provides a serializable BDT pricing default", () => {
    expect(DEFAULT_CURRENCY_CONTEXT).toEqual({
      baseCurrency: "BDT",
      currency: "BDT",
      exchangeRate: "1",
      exchangeRateTimestamp: null,
      countryCode: null,
      source: "fallback",
    });
    expect(() => JSON.stringify(DEFAULT_CURRENCY_CONTEXT)).not.toThrow();
  });
});

describe("country-to-currency mapping", () => {
  it("contains the complete 21-member 2026 euro area, including Bulgaria", () => {
    expect(EUROZONE_COUNTRY_CODES).toHaveLength(21);
    expect(EUROZONE_COUNTRY_CODES).toContain("BG");
    expect(new Set(EUROZONE_COUNTRY_CODES).size).toBe(21);

    for (const country of EUROZONE_COUNTRY_CODES) {
      expect(countryToCurrency(country)).toBe("EUR");
    }
  });

  it.each([
    ["BD", "BDT"],
    ["AU", "AUD"],
    ["US", "USD"],
    ["GB", "GBP"],
    ["CN", "CNY"],
    ["DE", "EUR"],
    ["FR", "EUR"],
    ["IT", "EUR"],
  ] as const)("maps %s to %s", (country, currency) => {
    expect(countryToCurrency(country)).toBe(currency);
  });

  it.each(["IN", "CA", "JP", "SG", "AE", "SA", "PK", "NP", "CH", "KR", "ZZ"])(
    "falls back to BDT for unsupported country %s",
    (country) => {
      expect(countryToCurrency(country)).toBe("BDT");
    },
  );

  it.each([undefined, null, "", "U", "USA", " US", "US ", "U1", "US,CA"])(
    "falls back to BDT for missing or malformed country %s",
    (country) => {
      expect(countryToCurrency(country)).toBe("BDT");
    },
  );

  it("normalizes lowercase alpha-2 country codes only", () => {
    expect(normalizeCountryCode("de")).toBe("DE");
    expect(countryToCurrency("de")).toBe("EUR");
    expect(normalizeCountryCode(" de ")).toBeNull();
  });
});

describe("country header detection", () => {
  it.each(["BD", "DE", "CN", "US", "GB", "AU"])(
    "reads Cloudflare country %s through case-insensitive Web Headers",
    (country) => {
      expect(
        detectCountryCode(new Headers({ "CF-IPCountry": country })),
      ).toBe(country);
    },
  );

  it("reads supported infrastructure headers and normalizes the country", () => {
    expect(detectCountryCode(headers({ "cf-ipcountry": "us" }))).toBe("US");
    expect(
      detectCountryCode(headers({ "x-vercel-ip-country": "DE" })),
    ).toBe("DE");
    expect(
      detectCurrency(headers({ "x-country-code": "AU" }), {
        customHeaderName: "x-country-code",
      }),
    ).toBe("AUD");
  });

  it("trims transport whitespace before validating a country header", () => {
    expect(
      detectCountryCode(headers({ "cf-ipcountry": "  de  " })),
    ).toBe("DE");
    expect(normalizeCountryHeaderValue("  au  ")).toBe("AU");
  });

  it.each(["Germany", "USA", "123", "ZZZ", ""])(
    "rejects malformed Cloudflare country value %j",
    (country) => {
      expect(
        detectCountryCode(headers({ "cf-ipcountry": country })),
      ).toBeNull();
    },
  );

  it("uses deterministic header precedence", () => {
    expect(
      detectCountryCode(
        headers({
          "cf-ipcountry": "GB",
          "x-vercel-ip-country": "US",
        }),
      ),
    ).toBe("GB");
  });

  it("fails closed when the first present header is malformed", () => {
    const requestHeaders = headers({
      "cf-ipcountry": "US, CA",
      "x-vercel-ip-country": "US",
    });

    expect(detectCountryCode(requestHeaders)).toBeNull();
    expect(detectCurrency(requestHeaders)).toBe("BDT");
  });

  it.each(["XX", "T1", "A1"])(
    "rejects non-country geo sentinel %s",
    (sentinel) => {
      const requestHeaders = headers({ "cf-ipcountry": sentinel });
      expect(detectCountryCode(requestHeaders)).toBeNull();
      expect(detectCurrency(requestHeaders)).toBe("BDT");
    },
  );

  it("does not trust a generic custom header unless explicitly configured", () => {
    const requestHeaders = headers({ "x-country-code": "US" });
    expect(detectCountryCode(requestHeaders)).toBeNull();
    expect(
      detectCountryCode(requestHeaders, { customHeaderName: "x-country-code" }),
    ).toBe("US");
  });

  it("falls back to BDT for missing headers or header access failures", () => {
    expect(detectCountryCode(headers({}))).toBeNull();
    expect(detectCurrency(headers({}))).toBe("BDT");

    const throwingHeaders: HeadersLike = {
      get() {
        throw new Error("unavailable");
      },
    };
    expect(detectCountryCode(throwingHeaders)).toBeNull();
    expect(detectCurrency(throwingHeaders)).toBe("BDT");
  });
});

describe("BDT conversion", () => {
  it("returns BDT at rate one and rounds HALF_UP once", () => {
    expect(convertFromBDT({ amount: "5000", currency: "BDT" })).toBe(5000);
    expect(convertFromBDT({ amount: "1.005", currency: "BDT" })).toBe(1.01);
  });

  it.each([
    ["AUD", "0.014", 70],
    ["EUR", "0.0078", 39],
    ["GBP", "0.0066", 33],
    ["USD", "0.0082", 41],
    ["CNY", "0.059", 295],
  ] as const)("multiplies a BDT amount by its direct %s quote", (currency, rate, expected) => {
    expect(
      convertFromBDT({
        amount: "5000",
        currency,
        exchangeRate: rate,
      }),
    ).toBe(expected);
  });

  it("handles zero, large amounts, and exact HALF_UP boundaries", () => {
    expect(
      convertFromBDT({ amount: 0, currency: "USD", exchangeRate: "0.0082" }),
    ).toBe(0);
    expect(
      convertFromBDT({
        amount: "999999999999.99",
        currency: "USD",
        exchangeRate: "1.25",
      }),
    ).toBe(1249999999999.99);
    expect(
      convertFromBDT({ amount: "1", currency: "USD", exchangeRate: "1.005" }),
    ).toBe(1.01);
  });

  it("maps display-only catalog filter bounds back to canonical BDT", () => {
    expect(
      convertToBDT({
        amount: "41",
        currency: "USD",
        exchangeRate: "0.0082",
      }),
    ).toBe(5000);
    expect(convertToBDT({ amount: "5000", currency: "BDT" })).toBe(5000);

    const context = createPricingContext({
      currency: "USD",
      exchangeRate: "0.0082",
      source: "geo",
    });
    expect(priceToBDT({ amount: "41", context })).toBe(5000);
  });

  it.each([0, -1, "0", "NaN", "Infinity", "not-a-rate", null, undefined])(
    "rejects invalid foreign rate %s",
    (exchangeRate) => {
      expect(() =>
        convertFromBDT({
          amount: 100,
          currency: "USD",
          exchangeRate,
        }),
      ).toThrow();
    },
  );

  it("rejects unsupported currencies and invalid amounts", () => {
    expect(() =>
      convertFromBDT({
        amount: 100,
        currency: "CAD" as CurrencyCode,
        exchangeRate: 1,
      }),
    ).toThrow(/Unsupported currency/);
    expect(() =>
      convertFromBDT({ amount: -1, currency: "BDT" }),
    ).toThrow(/non-negative/);
    expect(() =>
      convertFromBDT({ amount: "NaN", currency: "BDT" }),
    ).toThrow(/finite/);
  });
});

describe("money formatting", () => {
  it.each(SUPPORTED_CURRENCIES)("uses the English display locale for %s", (currency) => {
    const expected = new Intl.NumberFormat(DISPLAY_LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(5000);

    expect(formatMoney(5000, currency)).toBe(expected);
  });

  it.each(SUPPORTED_CURRENCIES)("uses Latin digits for %s", (currency) => {
    const formatted = formatMoney(1234.56, currency);

    expect(formatted).toMatch(/1,234\.56/);
    expect(formatted).not.toMatch(/[০-৯٠-٩۰-۹]/u);
  });

  it("supports an explicit display locale without changing the currency", () => {
    expect(formatMoney("12.5", "BDT", { locale: "en-US" })).toBe(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(12.5),
    );
  });

  it("supports an ISO-code presentation for fonts without currency glyphs", () => {
    expect(
      formatMoney(10_750, "BDT", {
        locale: "en-US",
        currencyDisplay: "code",
      }),
    ).toBe(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "BDT",
        currencyDisplay: "code",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(10_750),
    );
  });
});

describe("pricing context", () => {
  it("keeps a valid foreign quote serializable", () => {
    expect(
      createPricingContext({
        currency: "USD",
        exchangeRate: "0.0082000000",
        exchangeRateTimestamp: "2026-08-19T06:00:00.000Z",
        countryCode: "us",
        source: "geo",
      }),
    ).toEqual({
      baseCurrency: "BDT",
      currency: "USD",
      exchangeRate: "0.0082",
      exchangeRateTimestamp: "2026-08-19T06:00:00.000Z",
      countryCode: "US",
      source: "geo",
    });
  });

  it.each([
    { currency: "CAD", exchangeRate: "1" },
    { currency: "USD", exchangeRate: "0" },
    { currency: "USD", exchangeRate: "garbage" },
  ])("atomically downgrades unusable quote $currency/$exchangeRate", (quote) => {
    expect(createPricingContext({ ...quote, countryCode: "US" })).toEqual({
      baseCurrency: "BDT",
      currency: "BDT",
      exchangeRate: "1",
      exchangeRateTimestamp: null,
      countryCode: "US",
      source: "fallback",
    });
  });

  it("forces BDT to its identity rate", () => {
    expect(
      createPricingContext({
        currency: "BDT",
        exchangeRate: "999",
        exchangeRateTimestamp: "2026-08-19T06:00:00.000Z",
        countryCode: "BD",
        source: "geo",
      }),
    ).toMatchObject({
      currency: "BDT",
      exchangeRate: "1",
      exchangeRateTimestamp: null,
    });
  });

  it("returns canonical and converted amounts with the same quote snapshot", () => {
    const context = createPricingContext({
      currency: "USD",
      exchangeRate: "0.0082",
      exchangeRateTimestamp: "2026-08-19T06:00:00.000Z",
      countryCode: "US",
      source: "geo",
    });

    expect(priceFromBDT({ baseAmount: "5000", context })).toEqual({
      ...context,
      baseAmount: 5000,
      amount: 41,
    });
  });
});
