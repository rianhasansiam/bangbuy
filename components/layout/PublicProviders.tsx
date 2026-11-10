"use client";

import { useState, type ReactNode } from "react";
import { SessionContext } from "next-auth/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import CurrencyProvider from "@/components/currency/CurrencyProvider";
import type { CurrencyContext } from "@/lib/currency/config";
import { SurfaceContext } from "./SurfaceContext";
import Toaster from "@/components/ui/Toaster";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// Compatibility views for catalog widgets only. No private reducers, persistence,
// session fetch, StoreHydrator, account IDs or historical commerce state exist here.
function makeAnonymousCatalogStore() {
  const empty = {
    cart: { items: [], summary: { totalItems: 0, subtotal: 0, totalDiscount: 0, finalTotal: 0 }, mode: "local", isHydrated: true, isLoading: false, error: null },
    wishlist: { items: [], mode: "local", isHydrated: true, isLoading: false, error: null },
  };
  return configureStore({ reducer: (state = empty) => state });
}
const anonymousSession = { data: null, status: "unauthenticated" as const, update: async () => null };

export default function PublicProviders({ children, currencyContext }: { children: ReactNode; currencyContext: CurrencyContext }) {
  const [store] = useState(makeAnonymousCatalogStore);
  return <SurfaceContext.Provider value="public"><CurrencyProvider initialContext={currencyContext}>
    <SessionContext.Provider value={anonymousSession}><Provider store={store}>{children}<Toaster /><ConfirmDialog /></Provider></SessionContext.Provider>
  </CurrencyProvider></SurfaceContext.Provider>;
}
