"use client";

import type { ComponentPropsWithoutRef } from "react";

import { formatMoney } from "@/lib/currency/format-money";
import { priceFromBDT } from "@/lib/currency/pricing.service";

import { useCurrency } from "./CurrencyProvider";

type CurrencyAmountProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children"
> & {
  /** A final display amount in the canonical BDT currency. */
  amountBDT: number | string;
};

/** Converts a canonical BDT amount once, then formats the selected currency. */
export function CurrencyAmount({ amountBDT, ...props }: CurrencyAmountProps) {
  const context = useCurrency();
  const price = priceFromBDT({ baseAmount: amountBDT, context });

  return <span {...props}>{formatMoney(price.amount, price.currency)}</span>;
}

export default CurrencyAmount;
