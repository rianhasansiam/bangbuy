"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { getBrowserPublicCapiClient, INITIAL_PUBLIC_CAPI_STATE, PUBLIC_CAPI_PREFERENCE_KEY } from "@/lib/analytics/public-capi-client";

const serverSnapshot = () => INITIAL_PUBLIC_CAPI_STATE;
const serverSubscribe = () => () => {};

/** First-party consent and PageView only, with no third-party marketing SDK. */
export default function PublicCapiTracking() {
  const t = useTranslations("InterfaceComponentsPublicCapiConsent");
  const client = typeof window === "undefined" ? null : getBrowserPublicCapiClient();
  const view = useSyncExternalStore(client?.subscribe ?? serverSubscribe, client?.getSnapshot ?? serverSnapshot, serverSnapshot);
  useEffect(() => {
    if (!client) return;
    const stop = () => client.suspend();
    const restored = (event: PageTransitionEvent) => { if (event.persisted) client.suspend(); };
    const storage = (event: StorageEvent) => { if (event.key === PUBLIC_CAPI_PREFERENCE_KEY || event.key === null) client.syncPreference(); };
    window.addEventListener("pagehide", stop);
    window.addEventListener("pageshow", restored);
    window.addEventListener("hashchange", stop);
    window.addEventListener("popstate", stop);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("pagehide", stop);
      window.removeEventListener("pageshow", restored);
      window.removeEventListener("hashchange", stop);
      window.removeEventListener("popstate", stop);
      window.removeEventListener("storage", storage);
    };
  }, [client]);
  if (!view.ready) return null;
  return <section id="marketing-consent" aria-label={t("title")} className="mx-auto my-5 max-w-7xl rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800" data-consent-controls>
    <h2 className="font-semibold">{t("title")}</h2>
    <p className="mt-1 max-w-4xl">{t("description")}</p>
    <p className="mt-1" aria-live="polite">{t("status", { state: t(view.consent) })}</p>
    {(!view.enabled || !view.eligible) && <p className="mt-1">{t("unavailable")}</p>}
    <div className="mt-3 flex flex-wrap gap-3">
      {view.consent !== "granted" && <button type="button" disabled={view.busy || !view.enabled || !view.eligible} onClick={() => void client?.choose("granted")} className="rounded border px-3 py-2 disabled:opacity-50">{t("allow")}</button>}
      <button type="button" onClick={() => void client?.choose(view.consent === "granted" ? "revoked" : "denied")} className="rounded border px-3 py-2">{view.consent === "granted" ? t("withdraw") : t("deny")}</button>
    </div>
    {view.failed && <p role="alert" className="mt-2 text-red-700">{t("error")}</p>}
  </section>;
}
