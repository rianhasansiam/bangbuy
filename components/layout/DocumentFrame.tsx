import { Suspense, type ReactNode } from "react";
import MetaPixel from "@/components/MetaPixel";
import { Geist, Geist_Mono } from "next/font/google";
import IntlProvider from "@/components/i18n/IntlProvider";
import { getRequestLocale, getRequestPath } from "@/lib/i18n/server";
import { loadMessages, selectClientMessages } from "@/lib/i18n/catalogs";
import { getLocaleDefinition } from "@/lib/i18n/registry";
import { getSurfaceOrigins } from "@/lib/security/surfaces";
import { loadExchangeRateQuote } from "@/lib/currency/exchange-rate.service";
import "@/app/globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Shared markup, not a persistent layout. Each surface owns its own root document. */
export default async function DocumentFrame({ children }: { children: ReactNode }) {
  // Reuse the cached pricing quote for browser-only USD event values. No
  // provider request, currency preference, order or payment state is changed.
  const [locale, pathname, quote] = await Promise.all([
    getRequestLocale(), getRequestPath(),
    process.env.NODE_ENV === "production" && /^\d+$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "")
      ? loadExchangeRateQuote("USD").catch(() => null) : null,
  ]);
  const messages = selectClientMessages(await loadMessages(locale), pathname);
  const origins = getSurfaceOrigins();
  const usdExchangeRate = quote?.currency === "USD" ? quote.rate : null;
  return <html lang={locale} dir={getLocaleDefinition(locale).direction} data-surface-configured="true" data-storefront-origin={origins.separated ? origins.storefront : ""} data-commerce-origin={origins.separated ? origins.commerce : ""} className={`${sans.className} ${sans.variable} ${mono.variable} h-full antialiased`}>
    <body suppressHydrationWarning><IntlProvider locale={locale} messages={messages}><Suspense fallback={null}><MetaPixel usdExchangeRate={usdExchangeRate} /></Suspense>{children}</IntlProvider></body>
  </html>;
}
