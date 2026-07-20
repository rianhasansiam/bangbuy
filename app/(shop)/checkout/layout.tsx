import type { Metadata } from "next";

import { noIndexMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";

/**
 * Checkout is an authenticated, transactional client page. This server
 * layout supplies a noindex robots tag so it's never indexed, matching
 * the robots.txt disallow rule.
 */
export const metadata: Metadata = noIndexMetadata(
  "Checkout",
  `Complete your ${siteConfig.name} order securely.`,
);

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
