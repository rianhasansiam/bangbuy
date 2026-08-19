import "server-only";

import {
  BASE_CURRENCY,
  FOREIGN_CURRENCIES,
  type CurrencyCode,
} from "@/lib/currency/config";

const EXCHANGE_RATE_API_ORIGIN = "https://v6.exchangerate-api.com";
const PROVIDER_TIMEOUT_MS = 10_000;

export type ForeignCurrencyCode = Exclude<
  CurrencyCode,
  typeof BASE_CURRENCY
>;

export type ExchangeRateResult = {
  baseCurrency: typeof BASE_CURRENCY;
  rates: Record<ForeignCurrencyCode, string>;
};

export interface ExchangeRateProvider {
  getRates(
    baseCurrency: typeof BASE_CURRENCY,
  ): Promise<ExchangeRateResult>;
}

export type ExchangeRateProviderErrorCode =
  | "NOT_CONFIGURED"
  | "NETWORK_ERROR"
  | "HTTP_ERROR"
  | "INVALID_RESPONSE";

export class ExchangeRateProviderError extends Error {
  readonly code: ExchangeRateProviderErrorCode;

  constructor(code: ExchangeRateProviderErrorCode, message: string) {
    super(message);
    this.name = "ExchangeRateProviderError";
    this.code = code;
  }
}

type ExchangeRateApiSuccess = {
  result: "success";
  base_code: string;
  conversion_rates: Record<string, unknown>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSuccessPayload(
  value: unknown,
): value is ExchangeRateApiSuccess {
  return (
    isObject(value) &&
    value.result === "success" &&
    typeof value.base_code === "string" &&
    isObject(value.conversion_rates)
  );
}

function normalizeProviderRate(value: unknown): string | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value.toString();
}

export type ExchangeRateApiProviderOptions = {
  apiKey: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

/**
 * Server-only ExchangeRate-API adapter. It returns only the five currencies
 * this application supports; the BDT identity quote is owned by the cache
 * service and is never trusted to an external provider.
 */
export class ExchangeRateApiProvider implements ExchangeRateProvider {
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor({
    apiKey,
    fetchImpl = fetch,
    timeoutMs = PROVIDER_TIMEOUT_MS,
  }: ExchangeRateApiProviderOptions) {
    const normalizedApiKey = apiKey.trim();
    if (!normalizedApiKey) {
      throw new ExchangeRateProviderError(
        "NOT_CONFIGURED",
        "The exchange-rate provider is not configured.",
      );
    }

    this.apiKey = normalizedApiKey;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async getRates(
    baseCurrency: typeof BASE_CURRENCY,
  ): Promise<ExchangeRateResult> {
    const endpoint = new URL(
      `/v6/${encodeURIComponent(this.apiKey)}/latest/${baseCurrency}`,
      EXCHANGE_RATE_API_ORIGIN,
    );

    let response: Response;
    try {
      response = await this.fetchImpl(endpoint, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      throw new ExchangeRateProviderError(
        "NETWORK_ERROR",
        "The exchange-rate provider is unavailable.",
      );
    }

    if (!response.ok) {
      throw new ExchangeRateProviderError(
        "HTTP_ERROR",
        `The exchange-rate provider returned HTTP ${response.status}.`,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new ExchangeRateProviderError(
        "INVALID_RESPONSE",
        "The exchange-rate provider returned invalid JSON.",
      );
    }

    if (
      !isSuccessPayload(payload) ||
      payload.base_code.toUpperCase() !== BASE_CURRENCY
    ) {
      throw new ExchangeRateProviderError(
        "INVALID_RESPONSE",
        "The exchange-rate provider returned an invalid response.",
      );
    }

    const rates = {} as Record<ForeignCurrencyCode, string>;
    for (const currency of FOREIGN_CURRENCIES) {
      const rate = normalizeProviderRate(
        payload.conversion_rates[currency],
      );
      if (!rate) {
        throw new ExchangeRateProviderError(
          "INVALID_RESPONSE",
          `The exchange-rate provider omitted a valid ${currency} rate.`,
        );
      }
      rates[currency] = rate;
    }

    return { baseCurrency: BASE_CURRENCY, rates };
  }
}

export function createExchangeRateProvider(): ExchangeRateProvider {
  return new ExchangeRateApiProvider({
    apiKey: process.env.EXCHANGE_RATE_API_KEY ?? "",
  });
}
