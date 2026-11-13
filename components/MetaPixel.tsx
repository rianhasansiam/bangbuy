"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/meta-pixel";

export default function MetaPixel({ usdExchangeRate }: { usdExchangeRate: string | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => { trackPageView(usdExchangeRate); }, [pathname, searchParams, usdExchangeRate]);
  return null;
}
