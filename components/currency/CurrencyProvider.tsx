"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  DEFAULT_CURRENCY_CONTEXT,
  type CurrencyContext,
} from "@/lib/currency/config";

const CurrencyPresentationContext = createContext<CurrencyContext>(
  DEFAULT_CURRENCY_CONTEXT,
);

type CurrencyProviderProps = {
  children: ReactNode;
  initialContext?: CurrencyContext;
};

/** Shares the request-resolved display currency with client catalog UI. */
export function CurrencyProvider({
  children,
  initialContext = DEFAULT_CURRENCY_CONTEXT,
}: CurrencyProviderProps) {
  return (
    <CurrencyPresentationContext.Provider value={initialContext}>
      {children}
    </CurrencyPresentationContext.Provider>
  );
}

export function useCurrency(): CurrencyContext {
  return useContext(CurrencyPresentationContext);
}

export default CurrencyProvider;
