import "server-only";

import type { Prisma } from "@/app/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

import {
  BASE_CURRENCY,
  CURRENCY_CONFIG,
  type CurrencyCode,
  type CurrencyContext,
} from "@/lib/currency/config";
import { convertFromBDT } from "@/lib/currency/convert-money";
import {
  loadExchangeRateQuote,
  type CurrencyQuote,
} from "@/lib/currency/exchange-rate.service";
import { createPricingContext } from "@/lib/currency/pricing.service";
import type { DecimalInput } from "@/lib/money";
import { toDecimal } from "@/lib/money";

import {
  AirwallexExchangeRateUnavailableError,
  AirwallexValidationError,
} from "../errors/airwallex.errors";

export const DIRECT_AIRWALLEX_PAYMENT_CURRENCIES = [
  "EUR",
  "GBP",
  "USD",
  "CNY",
] as const;

export type AirwallexPaymentCurrency =
  (typeof DIRECT_AIRWALLEX_PAYMENT_CURRENCIES)[number];

const directPaymentCurrencies = new Set<string>(
  DIRECT_AIRWALLEX_PAYMENT_CURRENCIES,
);

/** Central business policy for the currency sent to Airwallex. */
export function resolveAirwallexPaymentCurrency(
  storefrontCurrency: string,
): AirwallexPaymentCurrency {
  const normalized =
    typeof storefrontCurrency === "string"
      ? storefrontCurrency.trim().toUpperCase()
      : "";

  return directPaymentCurrencies.has(normalized)
    ? (normalized as AirwallexPaymentCurrency)
    : "USD";
}

export type AirwallexPaymentRate = {
  baseCurrency: typeof BASE_CURRENCY;
  displayCurrency: CurrencyCode;
  paymentCurrency: AirwallexPaymentCurrency;
  exchangeRate: string;
  exchangeRateTimestamp: string;
  stale: boolean;
};

export type AirwallexPaymentQuote = {
  baseCurrency: typeof BASE_CURRENCY;
  baseAmount: Prisma.Decimal;
  displayCurrency: CurrencyCode;
  paymentCurrency: AirwallexPaymentCurrency;
  paymentAmount: Prisma.Decimal;
  exchangeRate: Prisma.Decimal;
  exchangeRateAt: Date;
  stale: boolean;
};

export type PublicAirwallexPaymentQuote = {
  baseCurrency: typeof BASE_CURRENCY;
  baseAmount: number;
  displayCurrency: CurrencyCode;
  paymentCurrency: AirwallexPaymentCurrency;
  paymentAmount: number;
  exchangeRate: string;
  exchangeRateTimestamp: string;
};

type LoadExchangeRateQuote = (
  currency: CurrencyCode,
) => Promise<CurrencyQuote>;

export type ResolveAirwallexPaymentRateDependencies = {
  loadQuote?: LoadExchangeRateQuote;
};

function validTimestamp(value: string | null): value is string {
  return value !== null && Number.isFinite(Date.parse(value));
}

function unavailablePaymentRate(
  displayCurrency: CurrencyCode,
  paymentCurrency: AirwallexPaymentCurrency,
  reason: string,
): never {
  console.error("[payments.airwallex] payment quote unavailable", {
    displayCurrency,
    paymentCurrency,
    reason,
  });
  throw new AirwallexExchangeRateUnavailableError();
}

/**
 * Resolve one direct BDT -> Airwallex-currency rate from the existing cache.
 * A direct storefront currency reuses its request-scoped quote. Fallback
 * currencies load USD directly, never through the displayed currency.
 */
export async function resolveAirwallexPaymentRate(
  displayContext: CurrencyContext,
  dependencies: ResolveAirwallexPaymentRateDependencies = {},
): Promise<AirwallexPaymentRate> {
  const safeDisplayContext = createPricingContext(displayContext);
  const displayCurrency = safeDisplayContext.currency;
  const paymentCurrency = resolveAirwallexPaymentCurrency(displayCurrency);

  if (
    paymentCurrency === displayCurrency &&
    validTimestamp(safeDisplayContext.exchangeRateTimestamp)
  ) {
    return {
      baseCurrency: BASE_CURRENCY,
      displayCurrency,
      paymentCurrency,
      exchangeRate: safeDisplayContext.exchangeRate,
      exchangeRateTimestamp: safeDisplayContext.exchangeRateTimestamp,
      stale: false,
    };
  }

  const quote = await (dependencies.loadQuote ?? loadExchangeRateQuote)(
    paymentCurrency,
  );
  if (quote.currency !== paymentCurrency) {
    unavailablePaymentRate(
      displayCurrency,
      paymentCurrency,
      "MISSING_OR_INVALID_RATE",
    );
  }
  if (!validTimestamp(quote.fetchedAt)) {
    unavailablePaymentRate(
      displayCurrency,
      paymentCurrency,
      "MISSING_RATE_TIMESTAMP",
    );
  }

  const paymentContext = createPricingContext({
    currency: paymentCurrency,
    exchangeRate: quote.rate,
    exchangeRateTimestamp: quote.fetchedAt,
    countryCode: safeDisplayContext.countryCode,
    source: "fallback",
  });
  if (
    paymentContext.currency !== paymentCurrency ||
    !validTimestamp(paymentContext.exchangeRateTimestamp)
  ) {
    unavailablePaymentRate(
      displayCurrency,
      paymentCurrency,
      "UNUSABLE_RATE",
    );
  }

  return {
    baseCurrency: BASE_CURRENCY,
    displayCurrency,
    paymentCurrency,
    exchangeRate: paymentContext.exchangeRate,
    exchangeRateTimestamp: paymentContext.exchangeRateTimestamp,
    stale: quote.stale,
  };
}

/** Convert one authoritative, already-final BDT payable amount exactly once. */
export function createAirwallexPaymentQuote(input: {
  baseAmount: DecimalInput;
  displayCurrency: CurrencyCode;
  paymentRate: AirwallexPaymentRate;
}): AirwallexPaymentQuote {
  const baseAmount = toDecimal(input.baseAmount);
  if (!baseAmount.isFinite() || baseAmount.lessThanOrEqualTo(0)) {
    throw new AirwallexValidationError(
      "The order total cannot be paid online.",
    );
  }
  if (
    input.paymentRate.baseCurrency !== BASE_CURRENCY ||
    input.paymentRate.displayCurrency !== input.displayCurrency ||
    input.paymentRate.paymentCurrency !==
      resolveAirwallexPaymentCurrency(input.displayCurrency)
  ) {
    throw new AirwallexValidationError("Invalid payment currency quote.");
  }

  const decimals = CURRENCY_CONFIG[input.paymentRate.paymentCurrency].decimals;
  const convertedAmount = convertFromBDT({
    amount: baseAmount,
    currency: input.paymentRate.paymentCurrency,
    exchangeRate: input.paymentRate.exchangeRate,
  });
  const paymentAmount = new Decimal(String(convertedAmount)).toDecimalPlaces(
    decimals,
    Decimal.ROUND_HALF_UP,
  );
  if (!paymentAmount.isFinite() || paymentAmount.lessThanOrEqualTo(0)) {
    throw new AirwallexValidationError(
      "The order total cannot be paid online.",
    );
  }

  return {
    baseCurrency: BASE_CURRENCY,
    baseAmount: baseAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    displayCurrency: input.displayCurrency,
    paymentCurrency: input.paymentRate.paymentCurrency,
    paymentAmount,
    exchangeRate: toDecimal(input.paymentRate.exchangeRate),
    exchangeRateAt: new Date(input.paymentRate.exchangeRateTimestamp),
    stale: input.paymentRate.stale,
  };
}

export async function quoteAirwallexPayment(input: {
  baseAmount: DecimalInput;
  displayContext: CurrencyContext;
  dependencies?: ResolveAirwallexPaymentRateDependencies;
}): Promise<AirwallexPaymentQuote> {
  const safeDisplayContext = createPricingContext(input.displayContext);
  const paymentRate = await resolveAirwallexPaymentRate(
    safeDisplayContext,
    input.dependencies,
  );
  return createAirwallexPaymentQuote({
    baseAmount: input.baseAmount,
    displayCurrency: safeDisplayContext.currency,
    paymentRate,
  });
}

export function toPublicAirwallexPaymentQuote(
  quote: AirwallexPaymentQuote,
): PublicAirwallexPaymentQuote {
  return {
    baseCurrency: quote.baseCurrency,
    baseAmount: quote.baseAmount.toNumber(),
    displayCurrency: quote.displayCurrency,
    paymentCurrency: quote.paymentCurrency,
    paymentAmount: quote.paymentAmount.toNumber(),
    exchangeRate: quote.exchangeRate.toString(),
    exchangeRateTimestamp: quote.exchangeRateAt.toISOString(),
  };
}

export type AirwallexPaymentQuoteMismatch =
  | "AMOUNT_MISMATCH"
  | "CURRENCY_MISMATCH"
  | "PAYMENT_QUOTE_MISMATCH";

/** Validate a persisted quote without consulting today's FX table. */
export function findAirwallexPaymentQuoteMismatch(input: {
  canonicalBaseAmount: DecimalInput;
  displayCurrency: string;
  baseAmount: DecimalInput;
  baseCurrency: string | null;
  paymentAmount: DecimalInput;
  paymentCurrency: string;
  exchangeRate: DecimalInput;
  exchangeRateAt: Date | string | null;
}): AirwallexPaymentQuoteMismatch | null {
  const expectedPaymentCurrency = resolveAirwallexPaymentCurrency(
    input.displayCurrency,
  );
  if (
    input.baseCurrency?.trim().toUpperCase() !== BASE_CURRENCY ||
    input.paymentCurrency.trim().toUpperCase() !== expectedPaymentCurrency
  ) {
    return "CURRENCY_MISMATCH";
  }

  try {
    const canonicalBaseAmount = toDecimal(input.canonicalBaseAmount);
    const persistedBaseAmount = toDecimal(input.baseAmount);
    const persistedPaymentAmount = toDecimal(input.paymentAmount);
    const exchangeRate = toDecimal(input.exchangeRate);
    const exchangeRateAt =
      input.exchangeRateAt instanceof Date
        ? input.exchangeRateAt
        : input.exchangeRateAt
          ? new Date(input.exchangeRateAt)
          : null;

    if (
      canonicalBaseAmount.lessThanOrEqualTo(0) ||
      !persistedBaseAmount.equals(canonicalBaseAmount) ||
      persistedPaymentAmount.lessThanOrEqualTo(0)
    ) {
      return "AMOUNT_MISMATCH";
    }
    if (
      !exchangeRate.isFinite() ||
      !exchangeRate.isPositive() ||
      !exchangeRateAt ||
      !Number.isFinite(exchangeRateAt.getTime())
    ) {
      return "PAYMENT_QUOTE_MISMATCH";
    }

    const expectedAmount = toDecimal(
      String(
        convertFromBDT({
          amount: canonicalBaseAmount,
          currency: expectedPaymentCurrency,
          exchangeRate,
        }),
      ),
    );
    return expectedAmount.equals(persistedPaymentAmount)
      ? null
      : "AMOUNT_MISMATCH";
  } catch {
    return "PAYMENT_QUOTE_MISMATCH";
  }
}
