import { jsonError, ok } from "@/lib/api/response";
import {
  countryToCurrency,
  normalizeCountryCode,
} from "@/lib/currency/country-currency";
import {
  normalizeCountryHeaderValue,
  type HeadersLike,
} from "@/lib/currency/detect-country";
import { isExchangeRateRefreshAuthorized as isBearerSecretAuthorized } from "@/lib/currency/exchange-rate-refresh-auth";
import {
  getCountryHeaderConfiguration,
  getCurrencyContextFromRequest,
} from "@/lib/currency/request-currency";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function countryHeader(headers: HeadersLike, name: string) {
  try {
    const value = headers.get(name);
    return {
      present: value != null,
      countryCode: normalizeCountryHeaderValue(value),
    };
  } catch {
    return { present: false, countryCode: null };
  }
}

function isAuthorized(request: Request): boolean {
  if (process.env.NODE_ENV === "development") return true;

  return isBearerSecretAuthorized(
    request,
    process.env.CURRENCY_DEBUG_SECRET?.trim() ?? "",
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return jsonError(401, "Unauthorized.");

  try {
    const configuration = getCountryHeaderConfiguration();
    const configuredHeaderCountry = configuration.headerName
      ? countryHeader(request.headers, configuration.headerName)
      : { present: false, countryCode: null };
    const context = await getCurrencyContextFromRequest(request);
    const detectedCountry = context.countryCode;
    const diagnostics = {
      nodeEnv: process.env.NODE_ENV ?? null,
      devOverrideEnabled:
        process.env.NODE_ENV === "development" &&
        normalizeCountryCode(process.env.DEV_COUNTRY?.trim()) !== null,
      configuredCountryHeader: {
        configured: configuration.configured,
        validName:
          !configuration.configured || configuration.headerName !== null,
        name: configuration.headerName,
        ...configuredHeaderCountry,
      },
      headers: {
        cfIpCountry: countryHeader(request.headers, "cf-ipcountry"),
        xVercelIpCountry: countryHeader(
          request.headers,
          "x-vercel-ip-country",
        ),
        cloudfrontViewerCountry: countryHeader(
          request.headers,
          "cloudfront-viewer-country",
        ),
      },
      detectedCountry,
      mappedCurrency: countryToCurrency(detectedCountry),
      resolvedCurrency: context.currency,
      resolutionSource: context.source,
    };

    console.debug("[currency] country diagnostic", diagnostics);
    return ok(diagnostics);
  } catch {
    console.error("[currency] country diagnostic failed");
    return jsonError(503, "Country diagnostics unavailable.");
  }
}
