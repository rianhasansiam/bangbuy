import { describe, expect, it, vi } from "vitest";

import type {
  CurrencyCode,
  CurrencyContext,
} from "@/lib/currency/config";
import type { CurrencyQuote } from "@/lib/currency/exchange-rate.service";

import {
  AirwallexExchangeRateUnavailableError,
  AirwallexValidationError,
} from "../errors/airwallex.errors";
import {
  quoteAirwallexPayment,
  resolveAirwallexPaymentCurrency,
} from "../services/airwallex-currency.service";

const RATE_TIMESTAMP = "2026-08-22T00:00:00.000Z";

function makeDisplayContext(
  currency: CurrencyCode,
  exchangeRate = "1",
): CurrencyContext {
  return {
    baseCurrency: "BDT",
    currency,
    exchangeRate,
    exchangeRateTimestamp:
      currency === "BDT" ? null : RATE_TIMESTAMP,
    countryCode: currency === "AUD" ? "AU" : null,
    source: "geo",
  };
}

describe("resolveAirwallexPaymentCurrency", () => {
  it.each([
    ["EUR", "EUR"],
    ["GBP", "GBP"],
    ["CNY", "CNY"],
    ["USD", "USD"],
  ] as const)("routes %s directly", (displayCurrency, expected) => {
    expect(resolveAirwallexPaymentCurrency(displayCurrency)).toBe(expected);
  });

  it.each([
    ["AUD", "USD"],
    ["INR", "USD"],
    ["BDT", "USD"],
    ["XYZ", "USD"],
  ] as const)("routes unsupported %s through USD", (displayCurrency, expected) => {
    expect(resolveAirwallexPaymentCurrency(displayCurrency)).toBe(expected);
  });

  it.each([
    ["  eur  ", "EUR"],
    ["\tgbp\n", "GBP"],
    [" cNy ", "CNY"],
    [" UsD ", "USD"],
  ] as const)(
    "normalizes case and whitespace in %j",
    (displayCurrency, expected) => {
      expect(resolveAirwallexPaymentCurrency(displayCurrency)).toBe(expected);
    },
  );
});

describe("quoteAirwallexPayment", () => {
  it("converts an AUD storefront amount directly from BDT to USD", async () => {
    const loadQuote = vi.fn(
      async (currency: CurrencyCode): Promise<CurrencyQuote> => ({
        baseCurrency: "BDT",
        requestedCurrency: currency,
        currency,
        rate: "0.01",
        fetchedAt: RATE_TIMESTAMP,
        stale: false,
      }),
    );

    const quote = await quoteAirwallexPayment({
      baseAmount: "1000",
      displayContext: makeDisplayContext("AUD", "0.0125"),
      dependencies: { loadQuote },
    });

    expect(quote).toMatchObject({
      baseCurrency: "BDT",
      displayCurrency: "AUD",
      paymentCurrency: "USD",
    });
    expect(quote.paymentAmount.toFixed(2)).toBe("10.00");
    expect(loadQuote).toHaveBeenCalledTimes(1);
    expect(loadQuote).toHaveBeenCalledWith("USD");
    expect(loadQuote).not.toHaveBeenCalledWith("AUD");
    expect(loadQuote.mock.calls.map(([currency]) => currency)).toEqual([
      "USD",
    ]);
  });

  it("fails safely when the required USD rate is missing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const loadQuote = vi.fn(
      async (currency: CurrencyCode): Promise<CurrencyQuote> => ({
        baseCurrency: "BDT",
        requestedCurrency: currency,
        currency: "BDT",
        rate: "1",
        fetchedAt: null,
        stale: false,
      }),
    );

    await expect(
      quoteAirwallexPayment({
        baseAmount: "1000",
        displayContext: makeDisplayContext("AUD", "0.0125"),
        dependencies: { loadQuote },
      }),
    ).rejects.toBeInstanceOf(AirwallexExchangeRateUnavailableError);
    expect(loadQuote).toHaveBeenCalledOnce();
    expect(loadQuote).toHaveBeenCalledWith("USD");
  });

  it.each(["0", "-0.01"])(
    "rejects a non-positive canonical BDT amount (%s)",
    async (baseAmount) => {
      await expect(
        quoteAirwallexPayment({
          baseAmount,
          displayContext: makeDisplayContext("USD", "1"),
        }),
      ).rejects.toBeInstanceOf(AirwallexValidationError);
    },
  );

  it.each(["EUR", "GBP", "CNY", "USD"] as const)(
    "rounds a %s payment to two decimals using HALF_UP",
    async (paymentCurrency) => {
      const loadQuote = vi.fn();

      const quote = await quoteAirwallexPayment({
        baseAmount: "1",
        displayContext: makeDisplayContext(paymentCurrency, "1.005"),
        dependencies: { loadQuote },
      });

      expect(quote.paymentCurrency).toBe(paymentCurrency);
      expect(quote.paymentAmount.toFixed(2)).toBe("1.01");
      expect(loadQuote).not.toHaveBeenCalled();
    },
  );
});
