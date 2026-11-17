"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useInterfaceTranslations } from "@/components/i18n/translate";
import {
  canTrackMetaPixel,
  getMetaPixelLoadState,
  META_PIXEL_CONSENT_EVENT,
  META_PIXEL_LOAD_EVENT,
  trackPageView,
} from "@/lib/meta-pixel";

const DISMISSED_KEY = "bangbuy:meta-load-prompt-dismissed:v1";
let dismissedInDocument = false;

function subscribe(onChange: () => void) {
  window.addEventListener(META_PIXEL_LOAD_EVENT, onChange);
  window.addEventListener(META_PIXEL_CONSENT_EVENT, onChange);
  return () => {
    window.removeEventListener(META_PIXEL_LOAD_EVENT, onChange);
    window.removeEventListener(META_PIXEL_CONSENT_EVENT, onChange);
  };
}

const shouldPrompt = () => getMetaPixelLoadState() === "failed" && canTrackMetaPixel();
const serverSnapshot = () => false;

export default function MetaPixel({ usdExchangeRate }: { usdExchangeRate: string | null }) {
  const i18n = useInterfaceTranslations("InterfaceMetaPixel");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const failed = useSyncExternalStore(subscribe, shouldPrompt, serverSnapshot);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return dismissedInDocument || (typeof window !== "undefined" && window.sessionStorage.getItem(DISMISSED_KEY) === "1");
    } catch { return dismissedInDocument; }
  });

  useEffect(() => { trackPageView(usdExchangeRate); }, [pathname, searchParams, usdExchangeRate]);

  const continueShopping = () => {
    dismissedInDocument = true;
    try { window.sessionStorage.setItem(DISMISSED_KEY, "1"); }
    catch { /* A blocked store still permits dismissal in this document. */ }
    setDismissed(true);
  };

  if (!failed || dismissed) return null;
  return (
    <section role="status" aria-labelledby="meta-load-heading" className="fixed inset-x-4 top-4 z-[60] mx-auto max-w-md rounded-2xl border border-border bg-background p-5 text-foreground shadow-xl">
      <h2 id="meta-load-heading" className="text-sm font-bold">{i18n("Optional advertising measurement couldn’t load.")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{i18n("You can keep shopping or reload this page.")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="min-h-11 px-4" onClick={continueShopping}>{i18n("Continue shopping")}</Button>
        <Button type="button" variant="outline" className="min-h-11 px-4" onClick={() => window.location.reload()}>{i18n("Reload page")}</Button>
      </div>
    </section>
  );
}
