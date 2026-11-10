import type { Metadata, Viewport } from "next";
import { siteConfig } from "./site";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  referrer: "no-referrer",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: siteConfig.locale, url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Online Shopping for Electronics, Fashion & More`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, alt: `${siteConfig.name} online store` }],
  },
  twitter: { card: "summary_large_image", title: `${siteConfig.name} - Online Shopping`, description: siteConfig.description, images: [siteConfig.ogImage] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};
export const rootViewport: Viewport = { themeColor: "#8140DF", width: "device-width", initialScale: 1 };
