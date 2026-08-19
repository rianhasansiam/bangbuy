import { BASE_CURRENCY, type CurrencyCode } from "./config";

/** ISO 3166-1 alpha-2 codes for all 21 euro-area members in 2026. */
export const EUROZONE_COUNTRY_CODES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
] as const;

const eurozoneCountryCodeSet = new Set<string>(EUROZONE_COUNTRY_CODES);

const NON_COUNTRY_GEO_SENTINELS = new Set(["XX", "T1", "A1"]);

const DIRECT_COUNTRY_CURRENCY: Readonly<Record<string, CurrencyCode>> = {
  BD: "BDT",
  AU: "AUD",
  GB: "GBP",
  US: "USD",
  CN: "CNY",
};

/**
 * Normalize an already extracted ISO-like country value. Transport adapters
 * may trim outer whitespace first; comma-separated and non-alpha input remain
 * malformed.
 */
export function normalizeCountryCode(countryCode: unknown): string | null {
  if (typeof countryCode !== "string" || !/^[A-Za-z]{2}$/.test(countryCode)) {
    return null;
  }

  const normalized = countryCode.toUpperCase();
  return NON_COUNTRY_GEO_SENTINELS.has(normalized) ? null : normalized;
}

/** Resolve valid countries for display; detection failures use the BDT base. */
export function countryToCurrency(countryCode?: string | null): CurrencyCode {
  const country = normalizeCountryCode(countryCode);
  if (!country) return BASE_CURRENCY;

  const directlyMappedCurrency = DIRECT_COUNTRY_CURRENCY[country];
  if (directlyMappedCurrency) return directlyMappedCurrency;

  return eurozoneCountryCodeSet.has(country) ? "EUR" : "USD";
}
