import type { MetadataRoute } from "next";

import { absoluteUrl, siteConfig } from "@/lib/seo/site";

/**
 * Robots policy for PixoHouse.
 *
 * Public, customer-facing pages are crawlable. Private, transactional,
 * and authenticated areas are blocked so they never land in search
 * results. The sitemap URL is advertised for discovery.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/dashboard",
        "/login",
        "/register",
        "/cart",
        "/wishlist",
        "/checkout",
        "/orders",
        "/order-summary",
        "/profile",
        "/api/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
