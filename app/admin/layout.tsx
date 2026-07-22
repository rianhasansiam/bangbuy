import type { Metadata } from "next";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

import AdminShell from "@/app/admin/components/AdminShell";
import { auth } from "@/lib/auth/auth";
import { toAppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { noIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = noIndexMetadata("Administration");
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = toAppSession((await auth()) as Session | null);

  if (!session) {
    redirect("/login?callbackUrl=%2Fadmin");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
