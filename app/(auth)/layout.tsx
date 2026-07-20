import type { Metadata } from "next";

import { noIndexMetadata } from "@/lib/seo/metadata";

/**
 * Auth routes (login/register) are client components, so they can't
 * export metadata themselves. This server layout adds a noindex robots
 * tag as defense-in-depth alongside the robots.txt disallow rules.
 */
export const metadata: Metadata = noIndexMetadata("Account");

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
