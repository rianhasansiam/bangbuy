import type { CurrencyCode } from "./config";
import {
  countryToCurrency,
  normalizeCountryCode,
} from "./country-currency";

/** The subset of the Web Headers API needed by country detection. */
export type HeadersLike = {
  get(name: string): string | null | undefined;
};

/**
 * Ordered infrastructure headers. The reverse proxy/CDN must strip inbound
 * client values and set the header it owns before forwarding a request.
 */
export const GEO_COUNTRY_HEADER_NAMES = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "cloudfront-viewer-country",
] as const;

export type DetectCountryOptions = {
  /** Ordered infrastructure headers trusted for this deployment mode. */
  platformHeaderNames?: readonly string[];
  /** A reverse-proxy-owned header that the deployment explicitly sanitizes. */
  customHeaderName?: string;
};

const HTTP_HEADER_NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

/** Normalize optional transport whitespace without weakening alpha-2 checks. */
export function normalizeCountryHeaderValue(value: unknown): string | null {
  return typeof value === "string"
    ? normalizeCountryCode(value.trim())
    : null;
}

/**
 * Read the first present geo header and validate it as a single alpha-2 code.
 * A malformed higher-priority header is a detection failure; it does not fall
 * through to a potentially client-supplied lower-priority header.
 */
export function detectCountryCode(
  headers: HeadersLike,
  options: DetectCountryOptions = {},
): string | null {
  try {
    const platformHeaderNames =
      options.platformHeaderNames ?? GEO_COUNTRY_HEADER_NAMES;
    for (const headerName of platformHeaderNames) {
      const value = headers.get(headerName);
      if (value != null) return normalizeCountryHeaderValue(value);
    }

    if (
      options.customHeaderName &&
      HTTP_HEADER_NAME.test(options.customHeaderName)
    ) {
      const value = headers.get(options.customHeaderName);
      if (value != null) return normalizeCountryHeaderValue(value);
    }
  } catch {
    return null;
  }

  return null;
}

/** Resolve request headers directly to one of the six supported currencies. */
export function detectCurrency(
  headers: HeadersLike,
  options: DetectCountryOptions = {},
): CurrencyCode {
  return countryToCurrency(detectCountryCode(headers, options));
}
