import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import IntlProvider from "@/components/i18n/IntlProvider";
import { getRequestLocale, getRequestPath } from "@/lib/i18n/server";
import { loadMessages, selectClientMessages } from "@/lib/i18n/catalogs";
import { getLocaleDefinition } from "@/lib/i18n/registry";
import { getSurfaceOrigins } from "@/lib/security/surfaces";
import "@/app/globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Shared markup, not a persistent layout. Each surface owns its own root document. */
export default async function DocumentFrame({ children }: { children: ReactNode }) {
  const [locale, pathname] = await Promise.all([getRequestLocale(), getRequestPath()]);
  const messages = selectClientMessages(await loadMessages(locale), pathname);
  const origins = getSurfaceOrigins();
  return <html lang={locale} dir={getLocaleDefinition(locale).direction} data-surface-configured="true" data-storefront-origin={origins.separated ? origins.storefront : ""} data-commerce-origin={origins.separated ? origins.commerce : ""} className={`${sans.className} ${sans.variable} ${mono.variable} h-full antialiased`}>
    <body suppressHydrationWarning><IntlProvider locale={locale} messages={messages}>{children}</IntlProvider></body>
  </html>;
}
