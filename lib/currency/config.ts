export const BASE_CURRENCY = "BDT" as const;

/** The storefront language is always English, independent of detected country. */
export const DISPLAY_LOCALE = "en-US" as const;

export const SUPPORTED_CURRENCIES = [
  "BDT",
  "AUD",
  "EUR",
  "GBP",
  "USD",
  "CNY",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export type ForeignCurrencyCode = Exclude<
  CurrencyCode,
  typeof BASE_CURRENCY
>;

export const FOREIGN_CURRENCIES = [
  "AUD",
  "EUR",
  "GBP",
  "USD",
  "CNY",
] as const satisfies readonly ForeignCurrencyCode[];

export type CurrencyMetadata = {
  readonly code: CurrencyCode;
  readonly decimals: 2;
};

export const CURRENCY_CONFIG = {
  BDT: {
    code: "BDT",
    decimals: 2,
  },
  AUD: {
    code: "AUD",
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    decimals: 2,
  },
  USD: {
    code: "USD",
    decimals: 2,
  },
  CNY: {
    code: "CNY",
    decimals: 2,
  },
} as const satisfies Record<CurrencyCode, CurrencyMetadata>;

const supportedCurrencyCodes = new Set<string>(SUPPORTED_CURRENCIES);

/** Validate untrusted currency input without widening the supported set. */
export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && supportedCurrencyCodes.has(value);
}

/** Return a supported currency or `null`; useful at cookie/API boundaries. */
export function parseCurrencyCode(value: unknown): CurrencyCode | null {
  return isCurrencyCode(value) ? value : null;
}

export const CURRENCY_CONTEXT_SOURCES = [
  "geo",
  "cookie",
  "fallback",
] as const;

export type CurrencyContextSource =
  (typeof CURRENCY_CONTEXT_SOURCES)[number];

/**
 * Request-safe pricing context. Decimal values and timestamps remain strings so
 * this object can cross a Server Component/client boundary without coercion.
 */
export type CurrencyContext = {
  baseCurrency: typeof BASE_CURRENCY;
  currency: CurrencyCode;
  exchangeRate: string;
  exchangeRateTimestamp: string | null;
  countryCode: string | null;
  source: CurrencyContextSource;
};

export type PricingContext = CurrencyContext;

export const DEFAULT_CURRENCY_CONTEXT = Object.freeze({
  baseCurrency: BASE_CURRENCY,
  currency: BASE_CURRENCY,
  exchangeRate: "1",
  exchangeRateTimestamp: null,
  countryCode: null,
  source: "fallback",
} as const satisfies CurrencyContext);
