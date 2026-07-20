import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";

/**
 * Server layout for the All Products listing.
 *
 * The page itself is a client component (filters/sort/search live in the
 * URL), so metadata can't be exported from it. This layout supplies the
 * listing SEO and—critically—pins the canonical URL to the clean
 * `/products` path. Filter/sort/search/pagination query params therefore
 * all canonicalize to the same listing, avoiding duplicate-content
 * issues from `?category=`, `?sort=`, `?search=`, etc.
 */
export const metadata: Metadata = buildMetadata({
  title: "All Products - Shop Electronics, Fashion & More",
  description: `Browse the full ${siteConfig.name} catalog. Filter by category, brand, price, and rating to find quality products at great prices with secure checkout and fast delivery.`,
  path: "/products",
  keywords: [
    "all products",
    "shop online",
    "product catalog",
    "browse products",
    ...siteConfig.keywords,
  ],
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
