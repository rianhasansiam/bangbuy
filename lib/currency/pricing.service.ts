import type { DecimalInput } from "@/lib/money";

import type {
  CurrencyCode,
  CurrencyContext,
  CurrencyContextSource,
} from "./config";
import {
  BASE_CURRENCY,
  CURRENCY_CONTEXT_SOURCES,
  isCurrencyCode,
} from "./config";
import { normalizeCountryCode } from "./country-currency";
import { convertFromBDT, convertToBDT } from "./convert-money";
import { normalizeDecimalInput } from "./decimal";

export type CreatePricingContextInput = {
  currency?: unknown;
  exchangeRate?: DecimalInput;
  exchangeRateTimestamp?: string | Date | null;
  countryCode?: unknown;
  source?: unknown;
};

export type PriceFromBDTInput = {
  baseAmount: DecimalInput;
  context: CurrencyContext;
};

export type PriceToBDTInput = {
  amount: DecimalInput;
  context: CurrencyContext;
};

export type PricingResult = CurrencyContext & {
  baseAmount: number;
  amount: number;
};

const contextSources = new Set<string>(CURRENCY_CONTEXT_SOURCES);

function isContextSource(value: unknown): value is CurrencyContextSource {
  return typeof value === "string" && contextSources.has(value);
}

function normalizeTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function normalizePositiveRate(value: DecimalInput): string | null {
  try {
    const rate = normalizeDecimalInput(value);
    return rate !== "0" && !rate.startsWith("-") ? rate : null;
  } catch {
    return null;
  }
}

function fallbackContext(countryCode: string | null): CurrencyContext {
  return {
    baseCurrency: BASE_CURRENCY,
    currency: BASE_CURRENCY,
    exchangeRate: "1",
    exchangeRateTimestamp: null,
    countryCode,
    source: "fallback",
  };
}

/**
 * Build a serializable, validated context. Invalid/unsupported currencies or
 * unusable foreign quotes downgrade atomically to BDT at rate 1.
 */
export function createPricingContext(
  input: CreatePricingContextInput = {},
): CurrencyContext {
  const countryCode = normalizeCountryCode(input.countryCode);
  if (!isCurrencyCode(input.currency)) return fallbackContext(countryCode);

  if (input.currency === BASE_CURRENCY) {
    return {
      baseCurrency: BASE_CURRENCY,
      currency: BASE_CURRENCY,
      exchangeRate: "1",
      exchangeRateTimestamp: null,
      countryCode,
      source: isContextSource(input.source) ? input.source : "fallback",
    };
  }

  const exchangeRate = normalizePositiveRate(input.exchangeRate);
  if (!exchangeRate) return fallbackContext(countryCode);

  return {
    baseCurrency: BASE_CURRENCY,
    currency: input.currency,
    exchangeRate,
    exchangeRateTimestamp: normalizeTimestamp(input.exchangeRateTimestamp),
    countryCode,
    source: isContextSource(input.source) ? input.source : "geo",
  };
}

/** Convert one already-final canonical BDT amount using a request quote. */
export function priceFromBDT({
  baseAmount,
  context,
}: PriceFromBDTInput): PricingResult {
  const safeContext = createPricingContext(context);
  const normalizedBaseAmount = convertFromBDT({
    amount: baseAmount,
    currency: BASE_CURRENCY,
  });
  const amount = convertFromBDT({
    amount: baseAmount,
    currency: safeContext.currency,
    exchangeRate: safeContext.exchangeRate,
  });

  return {
    ...safeContext,
    baseAmount: normalizedBaseAmount,
    amount,
  };
}

/** Map a display-only catalog filter value back to its canonical BDT bound. */
export function priceToBDT({ amount, context }: PriceToBDTInput): number {
  const safeContext = createPricingContext(context);
  return convertToBDT({
    amount,
    currency: safeContext.currency,
    exchangeRate: safeContext.exchangeRate,
  });
}

/** Convenience type for consumers that only need the selected currency. */
export type PricingCurrency = CurrencyCode;
