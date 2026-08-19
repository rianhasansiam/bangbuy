import "server-only";

import { cookies, headers } from "next/headers";

import {
  BASE_CURRENCY,
  parseCurrencyCode,
  type CurrencyCode,
  type CurrencyContext,
} from "@/lib/currency/config";
import {
  detectCountryCode,
  type HeadersLike,
} from "@/lib/currency/detect-country";
import {
  countryToCurrency,
  normalizeCountryCode,
} from "@/lib/currency/country-currency";
import { loadExchangeRateQuote } from "@/lib/currency/exchange-rate.service";
import { createPricingContext } from "@/lib/currency/pricing.service";

export const CURRENCY_COOKIE_NAME = "currency";

const SAFE_HEADER_NAME = /^[A-Za-z0-9-]{1,64}$/;

export type CountryHeaderConfiguration = {
  configured: boolean;
  headerName: string | null;
};

/** Read the deployment-owned header name without ever allowing arbitrary lookup. */
export function getCountryHeaderConfiguration(): CountryHeaderConfiguration {
  const configuredName = process.env.GEO_COUNTRY_HEADER?.trim();
  if (!configuredName) return { configured: false, headerName: null };

  return {
    configured: true,
    headerName: SAFE_HEADER_NAME.test(configuredName) ? configuredName : null,
  };
}

function developmentCountryOverride(): string | null {
  if (process.env.NODE_ENV !== "development") return null;

  const countryCode = normalizeCountryCode(process.env.DEV_COUNTRY?.trim());
  if (!countryCode) return null;

  console.debug("[currency] Using DEV_COUNTRY override:", countryCode);
  return countryCode;
}

export function resolveRequestCountryCode(
  requestHeaders: HeadersLike,
): string | null {
  const developmentOverride = developmentCountryOverride();
  if (developmentOverride) return developmentOverride;

  const configured = getCountryHeaderConfiguration();
  // A malformed deployment setting remains a hard detection failure rather
  // than becoming an arbitrary request-header lookup.
  if (configured.configured && !configured.headerName) return null;

  return detectCountryCode(
    requestHeaders,
    configured.headerName
      ? {
          // Cloudflare is the only platform header allowed ahead of a
          // proxy-owned custom fallback. Direct Nginx deployments must strip
          // it; Cloudflare-fronted origins must preserve and authenticate it.
          platformHeaderNames: ["cf-ipcountry"],
          customHeaderName: configured.headerName,
        }
      : undefined,
  );
}

function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader || cookieHeader.length > 8_192) return null;

  for (const segment of cookieHeader.split(";")) {
    const separator = segment.indexOf("=");
    if (separator < 0) continue;
    const key = segment.slice(0, separator).trim();
    if (key !== name) continue;
    const rawValue = segment.slice(separator + 1).trim();
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return null;
    }
  }

  return null;
}

export type ResolveRequestCurrencyInput = {
  headers: HeadersLike;
  currencyCookie?: string | null;
};

/**
 * Resolve a request to a safe, serializable pricing context. A validated
 * manual cookie wins over geo detection. Missing/corrupt FX rows downgrade
 * both the amount currency and label to BDT.
 */
export async function resolveRequestCurrencyContext({
  headers: requestHeaders,
  currencyCookie,
}: ResolveRequestCurrencyInput): Promise<CurrencyContext> {
  const countryCode = resolveRequestCountryCode(requestHeaders);
  const cookieCurrency = parseCurrencyCode(currencyCookie);
  const requestedCurrency: CurrencyCode =
    cookieCurrency ?? countryToCurrency(countryCode);
  const quote = await loadExchangeRateQuote(requestedCurrency);
  const quoteAvailable = quote.currency === requestedCurrency;

  return createPricingContext({
    currency: quote.currency,
    exchangeRate: quote.rate,
    exchangeRateTimestamp: quote.fetchedAt,
    countryCode,
    source: quoteAvailable
      ? cookieCurrency
        ? "cookie"
        : countryCode
          ? "geo"
          : "fallback"
      : "fallback",
  });
}

/** Resolve currency in Server Components/layouts using Next 16 async APIs. */
export async function getRequestCurrencyContext(): Promise<CurrencyContext> {
  const [requestHeaders, cookieStore] = await Promise.all([
    headers(),
    cookies(),
  ]);

  return resolveRequestCurrencyContext({
    headers: requestHeaders,
    currencyCookie: cookieStore.get(CURRENCY_COOKIE_NAME)?.value ?? null,
  });
}

/** Resolve currency in Route Handlers without accepting any body values. */
export function getCurrencyContextFromRequest(
  request: Request,
): Promise<CurrencyContext> {
  return resolveRequestCurrencyContext({
    headers: request.headers,
    currencyCookie: readCookieValue(
      request.headers.get("cookie"),
      CURRENCY_COOKIE_NAME,
    ),
  });
}

/** Explicit canonical context for admin/accounting workflows. */
export function getBaseCurrencyContext(): CurrencyContext {
  return createPricingContext({
    currency: BASE_CURRENCY,
    exchangeRate: "1",
    source: "fallback",
  });
}
