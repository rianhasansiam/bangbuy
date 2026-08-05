import "server-only";

import { Decimal } from "@prisma/client/runtime/client";

import type { DecimalInput } from "@/lib/money";
import { toDecimal } from "@/lib/money";

import { AirwallexConfigurationError } from "../errors/airwallex.errors";

/**
 * The currency Airwallex receives when the storefront currency (BDT)
 * is not directly supported by the payment provider.
 */
export const AIRWALLEX_SETTLEMENT_CURRENCY = "USD" as const;

/**
 * Read and validate the BDT_TO_USD_RATE environment variable.
 *
 * The value represents how many BDT equal 1 USD (e.g. 120 → 120 BDT = 1 USD).
 * Throws a clear configuration error if missing, empty, or not a positive number.
 */
function getBdtToUsdRate(): Decimal {
  const raw = process.env.BDT_TO_USD_RATE;
  if (!raw || !raw.trim()) {
    throw new AirwallexConfigurationError();
  }
  let rate: Decimal;
  try {
    rate = new Decimal(raw.trim());
  } catch {
    throw new AirwallexConfigurationError();
  }
  if (!rate.isFinite() || rate.isZero() || rate.isNegative()) {
    throw new AirwallexConfigurationError();
  }
  return rate;
}

export type CurrencyConversionResult = {
  /** The amount in USD, rounded to exactly 2 decimal places. */
  amountInUsd: number;
  /** The conversion rate that was used (BDT per 1 USD). */
  rate: number;
  /** Always "USD". */
  currency: typeof AIRWALLEX_SETTLEMENT_CURRENCY;
};

/**
 * Convert a BDT amount to USD using the configured static rate.
 *
 * Uses exact Decimal arithmetic and rounds to 2 decimal places (HALF_UP)
 * to satisfy Airwallex's `amount` field requirement of ≤2 decimals.
 *
 * @example
 * ```ts
 * // BDT_TO_USD_RATE=120
 * convertBdtToUsd(1071.30)
 * // → { amountInUsd: 8.93, rate: 120, currency: "USD" }
 * ```
 */
export function convertBdtToUsd(amountInBdt: DecimalInput): CurrencyConversionResult {
  const rate = getBdtToUsdRate();
  const bdt = toDecimal(amountInBdt);

  if (bdt.isNegative()) {
    throw new AirwallexConfigurationError();
  }

  const usd = bdt
    .dividedBy(rate)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    amountInUsd: usd.toNumber(),
    rate: rate.toNumber(),
    currency: AIRWALLEX_SETTLEMENT_CURRENCY,
  };
}

/**
 * Returns true when the given currency requires server-side conversion
 * before being sent to Airwallex.
 */
export function requiresCurrencyConversion(currency: string): boolean {
  return currency.trim().toUpperCase() === "BDT";
}
