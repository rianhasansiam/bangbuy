import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import MetaPixel from "@/components/analytics/MetaPixel";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SiteChrome from "@/components/layout/SiteChrome";
import TopBanner from "@/components/layout/TopBanner";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { siteConfig } from "@/lib/seo/site";
import { parsePublicCategoryNode } from "@/features/categories/api";
import { getActiveCategoryTree } from "@/lib/services/category.service";
import { getRequestCurrencyContext } from "@/lib/currency/request-currency";

import Providers from "./providers";

// The request-scoped currency context depends on trusted headers/cookies.
// Canonical catalog queries retain their own data caches, while the HTML/RSC
// shell must never be shared between visitors in different countries.
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Shop Industrial Automation, Electronics & More Online",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Online Shopping for Electronics, Fashion & More`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, alt: `${siteConfig.name} online store` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Online Shopping`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#8140DF",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, currencyContext] = await Promise.all([
    getActiveCategoryTree()
      .then((tree) => tree.map(parsePublicCategoryNode))
      .catch((error: unknown) => {
        console.error("layout: failed to load category navigation", error);
        return [];
      }),
    getRequestCurrencyContext(),
  ]);

  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  const isMetaPixelEnabled = /^\d+$/.test(metaPixelId);

  return (
    <html
      lang="en"
      className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Browser extensions add attributes to <body> before React hydrates. */}
      <body suppressHydrationWarning>
        {isMetaPixelEnabled && (
          <>
            <Suspense fallback={null}>
              <MetaPixel pixelId={metaPixelId} />
            </Suspense>
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1" />`,
              }}
            />
          </>
        )}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Providers initialCurrencyContext={currencyContext}>
          <SiteChrome
            banner={<TopBanner />}
            navbar={<Navbar categories={categories} />}
            footer={<Footer />}
          >
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
