import "server-only";

import { cache } from "react";

import {
  BASE_CURRENCY,
  FOREIGN_CURRENCIES,
  SUPPORTED_CURRENCIES,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency/config";
import {
  createExchangeRateProvider,
  ExchangeRateProviderError,
  type ExchangeRateResult,
  type ExchangeRateProvider,
} from "@/lib/currency/exchange-rate-provider";

export const DEFAULT_EXCHANGE_RATE_REFRESH_HOURS = 6;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1_000;

export type StoredExchangeRate = {
  baseCurrency: string;
  currency: string;
  rate: unknown;
  fetchedAt: Date;
};

export type ExchangeRateWrite = {
  baseCurrency: typeof BASE_CURRENCY;
  currency: CurrencyCode;
  rate: string;
  fetchedAt: Date;
};

export interface ExchangeRateRepository {
  find(
    baseCurrency: typeof BASE_CURRENCY,
    currency: CurrencyCode,
  ): Promise<StoredExchangeRate | null>;
  findAll(
    baseCurrency: typeof BASE_CURRENCY,
  ): Promise<StoredExchangeRate[]>;
  upsertAll(rows: readonly ExchangeRateWrite[]): Promise<void>;
}

export type CurrencyQuote = {
  baseCurrency: typeof BASE_CURRENCY;
  requestedCurrency: CurrencyCode;
  currency: CurrencyCode;
  rate: string;
  fetchedAt: string | null;
  stale: boolean;
};

export type ExchangeRateRefreshResult = {
  status: "fresh" | "refreshed";
  baseCurrency: typeof BASE_CURRENCY;
  currencies: readonly CurrencyCode[];
  refreshedAt: string;
  count: number;
};

export type RefreshExchangeRatesDependencies = {
  provider?: ExchangeRateProvider;
  repository?: ExchangeRateRepository;
  now?: () => Date;
};

let refreshInFlight: Promise<ExchangeRateRefreshResult> | null = null;

export class ExchangeRateRefreshError extends Error {
  readonly code: "PROVIDER_UNAVAILABLE" | "PERSISTENCE_FAILED";

  constructor(
    code: "PROVIDER_UNAVAILABLE" | "PERSISTENCE_FAILED",
  ) {
    super("Exchange-rate refresh failed; stale rates were retained.");
    this.name = "ExchangeRateRefreshError";
    this.code = code;
  }
}

function normalizePositiveDecimal(value: unknown): string | null {
  let raw: string;

  try {
    if (typeof value === "string" || typeof value === "number") {
      raw = String(value).trim();
    } else if (
      typeof value === "object" &&
      value !== null &&
      "toString" in value &&
      typeof value.toString === "function"
    ) {
      raw = value.toString().trim();
    } else {
      return null;
    }
  } catch {
    return null;
  }

  if (!raw) return null;

  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;

  return raw;
}

function fallbackQuote(requestedCurrency: CurrencyCode): CurrencyQuote {
  return {
    baseCurrency: BASE_CURRENCY,
    requestedCurrency,
    currency: BASE_CURRENCY,
    rate: "1",
    fetchedAt: null,
    stale: false,
  };
}

function sanitizedErrorKind(error: unknown): string {
  if (error instanceof ExchangeRateProviderError) return error.code;
  if (error instanceof Error) return error.name;
  return "UnknownError";
}

/**
 * Invalid configuration falls back to six hours. This parser is deliberately
 * non-throwing because it is also used on storefront read paths.
 */
export function getExchangeRateFreshnessMs(
  configuredHours = process.env.EXCHANGE_RATE_REFRESH_HOURS,
): number {
  const normalized = configuredHours?.trim() ?? "";
  const hours = normalized ? Number(normalized) : NaN;

  if (!Number.isFinite(hours) || hours <= 0) {
    return DEFAULT_EXCHANGE_RATE_REFRESH_HOURS * MILLISECONDS_PER_HOUR;
  }

  return hours * MILLISECONDS_PER_HOUR;
}

function assertCompleteWriteSet(
  rows: readonly ExchangeRateWrite[],
): void {
  if (rows.length !== SUPPORTED_CURRENCIES.length) {
    throw new Error("Exchange-rate refresh must write exactly six rows.");
  }

  const currencies = new Set(rows.map((row) => row.currency));
  if (
    currencies.size !== SUPPORTED_CURRENCIES.length ||
    !SUPPORTED_CURRENCIES.every((currency) => currencies.has(currency))
  ) {
    throw new Error(
      "Exchange-rate refresh must contain each supported currency once.",
    );
  }

  for (const row of rows) {
    if (
      row.baseCurrency !== BASE_CURRENCY ||
      !normalizePositiveDecimal(row.rate) ||
      Number.isNaN(row.fetchedAt.getTime())
    ) {
      throw new Error("Exchange-rate refresh contains an invalid row.");
    }
  }

  const baseRow = rows.find((row) => row.currency === BASE_CURRENCY);
  if (!baseRow || Number(baseRow.rate) !== 1) {
    throw new Error("The BDT identity exchange rate must equal one.");
  }
}

function getFreshSnapshotTimestamp(
  rows: readonly StoredExchangeRate[],
  now: Date,
  freshnessMs: number,
): Date | null {
  if (
    rows.length !== SUPPORTED_CURRENCIES.length ||
    Number.isNaN(now.getTime())
  ) {
    return null;
  }

  const byCurrency = new Map(rows.map((row) => [row.currency, row]));
  if (
    byCurrency.size !== SUPPORTED_CURRENCIES.length ||
    !SUPPORTED_CURRENCIES.every((currency) => byCurrency.has(currency))
  ) {
    return null;
  }

  const firstFetchedAt = rows[0]?.fetchedAt;
  const fetchedAtMs =
    firstFetchedAt instanceof Date ? firstFetchedAt.getTime() : NaN;
  for (const currency of SUPPORTED_CURRENCIES) {
    const row = byCurrency.get(currency);
    const rowFetchedAtMs =
      row?.fetchedAt instanceof Date ? row.fetchedAt.getTime() : NaN;
    if (
      !row ||
      row.baseCurrency !== BASE_CURRENCY ||
      !normalizePositiveDecimal(row.rate) ||
      Number.isNaN(rowFetchedAtMs) ||
      rowFetchedAtMs !== fetchedAtMs
    ) {
      return null;
    }
  }

  const baseRow = byCurrency.get(BASE_CURRENCY);
  if (!baseRow || Number(normalizePositiveDecimal(baseRow.rate)) !== 1) {
    return null;
  }

  const ageMs = Math.max(0, now.getTime() - fetchedAtMs);
  return ageMs < freshnessMs ? new Date(fetchedAtMs) : null;
}

/** Prisma adapter kept behind a narrow boundary for deterministic tests. */
export const prismaExchangeRateRepository: ExchangeRateRepository = {
  async find(baseCurrency, currency) {
    const { prisma } = await import("@/lib/db/prisma");
    return prisma.exchangeRate.findUnique({
      where: {
        baseCurrency_currency: { baseCurrency, currency },
      },
      select: {
        baseCurrency: true,
        currency: true,
        rate: true,
        fetchedAt: true,
      },
    });
  },

  async findAll(baseCurrency) {
    const { prisma } = await import("@/lib/db/prisma");
    return prisma.exchangeRate.findMany({
      where: {
        baseCurrency,
        currency: { in: [...SUPPORTED_CURRENCIES] },
      },
      select: {
        baseCurrency: true,
        currency: true,
        rate: true,
        fetchedAt: true,
      },
    });
  },

  async upsertAll(rows) {
    assertCompleteWriteSet(rows);
    const { prisma } = await import("@/lib/db/prisma");
    const operations = rows.map((row) =>
      prisma.exchangeRate.upsert({
        where: {
          baseCurrency_currency: {
            baseCurrency: row.baseCurrency,
            currency: row.currency,
          },
        },
        create: row,
        update: {
          rate: row.rate,
          fetchedAt: row.fetchedAt,
        },
      }),
    );

    // One Prisma transaction means a partial provider snapshot is never
    // observable. A failure rolls back all six upserts and retains stale rows.
    await prisma.$transaction(operations);
  },
};

/**
 * Fetch, validate, and atomically persist a complete snapshot. No storefront
 * request calls this function; Linux cron reaches it through the internal API.
 */
async function performExchangeRateRefresh(
  dependencies: RefreshExchangeRatesDependencies = {},
): Promise<ExchangeRateRefreshResult> {
  const repository =
    dependencies.repository ?? prismaExchangeRateRepository;
  const now = dependencies.now ?? (() => new Date());

  console.info("[currency.exchange-rates] refresh started");

  const freshnessMs = getExchangeRateFreshnessMs();
  let existingRows: StoredExchangeRate[];
  let freshnessCheckTime: Date;
  try {
    freshnessCheckTime = now();
    existingRows = await repository.findAll(BASE_CURRENCY);
  } catch (error) {
    console.error(
      "[currency.exchange-rates] refresh failed; stale rates retained",
      { reason: sanitizedErrorKind(error) },
    );
    throw new ExchangeRateRefreshError("PERSISTENCE_FAILED");
  }

  const freshSnapshotAt = getFreshSnapshotTimestamp(
    existingRows,
    freshnessCheckTime,
    freshnessMs,
  );
  if (freshSnapshotAt) {
    console.info(
      "[currency.exchange-rates] refresh skipped; cached snapshot is fresh",
      { refreshedAt: freshSnapshotAt.toISOString() },
    );
    return {
      status: "fresh",
      baseCurrency: BASE_CURRENCY,
      currencies: SUPPORTED_CURRENCIES,
      refreshedAt: freshSnapshotAt.toISOString(),
      count: SUPPORTED_CURRENCIES.length,
    };
  }

  let providerResult: ExchangeRateResult;
  try {
    const provider =
      dependencies.provider ?? createExchangeRateProvider();
    providerResult = await provider.getRates(BASE_CURRENCY);
    if (
      providerResult.baseCurrency !== BASE_CURRENCY ||
      !FOREIGN_CURRENCIES.every((currency) =>
        normalizePositiveDecimal(providerResult.rates[currency]),
      )
    ) {
      throw new ExchangeRateProviderError(
        "INVALID_RESPONSE",
        "The exchange-rate provider returned an invalid response.",
      );
    }
  } catch (error) {
    console.error(
      "[currency.exchange-rates] refresh failed; provider unavailable; stale rates retained",
      { reason: sanitizedErrorKind(error) },
    );
    throw new ExchangeRateRefreshError("PROVIDER_UNAVAILABLE");
  }

  const fetchedAt = now();
  if (Number.isNaN(fetchedAt.getTime())) {
    console.error(
      "[currency.exchange-rates] refresh failed; stale rates retained",
      { reason: "InvalidClock" },
    );
    throw new ExchangeRateRefreshError("PERSISTENCE_FAILED");
  }

  const rows: ExchangeRateWrite[] = [
    {
      baseCurrency: BASE_CURRENCY,
      currency: BASE_CURRENCY,
      rate: "1",
      fetchedAt,
    },
    ...FOREIGN_CURRENCIES.map((currency) => ({
      baseCurrency: BASE_CURRENCY,
      currency,
      rate: providerResult.rates[currency],
      fetchedAt,
    })),
  ];

  try {
    assertCompleteWriteSet(rows);
    await repository.upsertAll(rows);
  } catch (error) {
    console.error(
      "[currency.exchange-rates] refresh failed; stale rates retained",
      { reason: sanitizedErrorKind(error) },
    );
    throw new ExchangeRateRefreshError("PERSISTENCE_FAILED");
  }

  console.info("[currency.exchange-rates] refresh succeeded", {
    count: rows.length,
    refreshedAt: fetchedAt.toISOString(),
  });

  return {
    status: "refreshed",
    baseCurrency: BASE_CURRENCY,
    currencies: SUPPORTED_CURRENCIES,
    refreshedAt: fetchedAt.toISOString(),
    count: rows.length,
  };
}

/**
 * Coalesces concurrent scheduler calls in this Node.js process. Combined with
 * the fresh-snapshot check, retries and overlapping cron invocations do not
 * spend additional provider quota.
 */
export function refreshExchangeRates(
  dependencies: RefreshExchangeRatesDependencies = {},
): Promise<ExchangeRateRefreshResult> {
  if (refreshInFlight) return refreshInFlight;

  const operation = performExchangeRateRefresh(dependencies);
  refreshInFlight = operation;
  const clear = () => {
    if (refreshInFlight === operation) refreshInFlight = null;
  };
  void operation.then(clear, clear);

  return operation;
}

export type ResolveCurrencyQuoteDependencies = {
  repository?: ExchangeRateRepository;
  now?: () => Date;
  freshnessMs?: number;
};

/**
 * Safe cache lookup for one requested currency. A valid stale quote remains
 * usable; a missing, corrupt, or unreadable row downgrades both currency and
 * rate to the BDT identity quote.
 */
export async function resolveExchangeRateQuote(
  requestedCurrency: CurrencyCode,
  dependencies: ResolveCurrencyQuoteDependencies = {},
): Promise<CurrencyQuote> {
  const safeRequestedCurrency = isCurrencyCode(requestedCurrency)
    ? requestedCurrency
    : BASE_CURRENCY;

  if (safeRequestedCurrency === BASE_CURRENCY) {
    return fallbackQuote(safeRequestedCurrency);
  }

  const repository =
    dependencies.repository ?? prismaExchangeRateRepository;
  const now = dependencies.now ?? (() => new Date());
  const freshnessMs =
    dependencies.freshnessMs ?? getExchangeRateFreshnessMs();

  try {
    const row = await repository.find(
      BASE_CURRENCY,
      safeRequestedCurrency,
    );
    const rate = row ? normalizePositiveDecimal(row.rate) : null;
    const fetchedAtMs = row?.fetchedAt.getTime() ?? NaN;

    if (
      !row ||
      row.baseCurrency !== BASE_CURRENCY ||
      row.currency !== safeRequestedCurrency ||
      !rate ||
      Number.isNaN(fetchedAtMs)
    ) {
      return fallbackQuote(safeRequestedCurrency);
    }

    const ageMs = Math.max(0, now().getTime() - fetchedAtMs);
    return {
      baseCurrency: BASE_CURRENCY,
      requestedCurrency: safeRequestedCurrency,
      currency: safeRequestedCurrency,
      rate,
      fetchedAt: row.fetchedAt.toISOString(),
      stale: ageMs > freshnessMs,
    };
  } catch (error) {
    console.error(
      "[currency.exchange-rates] cached quote read failed; falling back to BDT",
      { reason: sanitizedErrorKind(error) },
    );
    return fallbackQuote(safeRequestedCurrency);
  }
}

const loadExchangeRateQuoteForRequest = cache(
  async (currency: CurrencyCode) => resolveExchangeRateQuote(currency),
);

/** Request-memoized production loader; output contains JSON primitives only. */
export function loadExchangeRateQuote(
  requestedCurrency: CurrencyCode,
): Promise<CurrencyQuote> {
  return loadExchangeRateQuoteForRequest(requestedCurrency);
}
