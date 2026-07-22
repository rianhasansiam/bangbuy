import type { Metadata } from "next";

import { noIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = noIndexMetadata(
  "My Profile",
  "Manage your account and personal shopping activity.",
);
export const dynamic = "force-dynamic";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
