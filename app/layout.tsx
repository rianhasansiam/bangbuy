import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import Script from "next/script";
import "./globals.css";

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

// const META_PIXEL_ID = "887205770572625";
// const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
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

  return (
    <html
      lang="en"
      className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Browser extensions add attributes to <body> before React hydrates. */}
      <body suppressHydrationWarning>
        {/* Meta Pixel is disabled.
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" />`,
          }}
        />
        */}
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
