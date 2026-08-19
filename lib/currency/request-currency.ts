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

function configuredCountryCode(requestHeaders: HeadersLike): {
  configured: boolean;
  countryCode: string | null;
} {
  const configuredName = process.env.GEO_COUNTRY_HEADER?.trim();
  if (!configuredName) return { configured: false, countryCode: null };

  // An invalid deployment setting fails closed instead of causing an
  // arbitrary header lookup.
  if (!SAFE_HEADER_NAME.test(configuredName)) {
    return { configured: true, countryCode: null };
  }

  try {
    return {
      configured: true,
      countryCode: normalizeCountryCode(requestHeaders.get(configuredName)),
    };
  } catch {
    return { configured: true, countryCode: null };
  }
}

function resolveCountryCode(requestHeaders: HeadersLike): string | null {
  const configured = configuredCountryCode(requestHeaders);
  return configured.configured
    ? configured.countryCode
    : detectCountryCode(requestHeaders);
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
  const countryCode = resolveCountryCode(requestHeaders);
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
