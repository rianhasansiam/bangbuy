import type { DecimalInput } from "@/lib/money";

import type { CurrencyCode } from "./config";
import { BASE_CURRENCY, isCurrencyCode } from "./config";
import {
  divideAndRoundDecimalHalfUp,
  multiplyAndRoundDecimalHalfUp,
  normalizeDecimalInput,
  roundDecimalHalfUp,
} from "./decimal";

export type ConvertFromBDTInput = {
  amount: DecimalInput;
  currency: CurrencyCode;
  /** Direct quote: units of the target currency per one BDT. */
  exchangeRate?: DecimalInput;
};

export type ConvertToBDTInput = {
  amount: DecimalInput;
  currency: CurrencyCode;
  /** Direct quote: units of the target currency per one BDT. */
  exchangeRate?: DecimalInput;
};

function requireValidAmount(amount: DecimalInput): string {
  let decimal: string;
  try {
    decimal = normalizeDecimalInput(amount);
  } catch {
    throw new TypeError("Amount must be a finite, valid decimal value");
  }

  if (decimal.startsWith("-")) {
    throw new RangeError("Amount must be a finite, non-negative value");
  }

  return decimal;
}

function requireValidExchangeRate(exchangeRate: DecimalInput): string {
  let decimal: string;
  try {
    decimal = normalizeDecimalInput(exchangeRate);
  } catch {
    throw new TypeError("Exchange rate must be a finite, valid decimal value");
  }

  if (decimal === "0" || decimal.startsWith("-")) {
    throw new RangeError("Exchange rate must be a finite, positive value");
  }

  return decimal;
}

/**
 * Convert a canonical BDT amount using a direct BDT quote and round once at the
 * presentation/payment boundary (two decimals, HALF_UP).
 */
export function convertFromBDT({
  amount,
  currency,
  exchangeRate,
}: ConvertFromBDTInput): number {
  if (!isCurrencyCode(currency)) {
    throw new TypeError("Unsupported currency code");
  }

  const baseAmount = requireValidAmount(amount);
  if (currency === BASE_CURRENCY) {
    return roundDecimalHalfUp(baseAmount, 2);
  }

  return multiplyAndRoundDecimalHalfUp(
    baseAmount,
    requireValidExchangeRate(exchangeRate),
    2,
  );
}

/** Convert a display-currency filter value back to its canonical BDT bound. */
export function convertToBDT({
  amount,
  currency,
  exchangeRate,
}: ConvertToBDTInput): number {
  if (!isCurrencyCode(currency)) {
    throw new TypeError("Unsupported currency code");
  }

  const displayAmount = requireValidAmount(amount);
  if (currency === BASE_CURRENCY) {
    return roundDecimalHalfUp(displayAmount, 2);
  }

  return divideAndRoundDecimalHalfUp(
    displayAmount,
    requireValidExchangeRate(exchangeRate),
    2,
  );
}
