"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CURRENT_TRACKING_POLICY_VERSION, parseMarketingConsent, type MarketingConsentState } from "@/lib/analytics/consent";
import { CONSENT_CHANGE_EVENT, CONSENT_STOP_EVENT, rememberBrowserConsent } from "@/lib/analytics/consent-browser";
import { captureApprovedConsentContext } from "@/lib/analytics/consent-capture";
import { useSurface } from "@/components/layout/SurfaceContext";
import Link from "@/lib/i18n/navigation";

/** Shared consent UI contains no Pixel import, SDK initialization or private data. */
export default function MarketingConsentControls() {
  const t = useTranslations("InterfaceComponentsMarketingConsent");
  const surface = useSurface();
  const [state, setState] = useState<MarketingConsentState>("unknown");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let stopped = false;
    void fetch("/api/public/consent", { cache: "no-store", credentials: "same-origin" })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => { if (!stopped) setState(parseMarketingConsent(body?.consent).state); })
      .catch(() => {});
    return () => { stopped = true; };
  }, []);

  async function choose(next: "granted" | "denied" | "revoked") {
    if (busy) return;
    if (next !== "granted") {
      // Stop synchronously before waiting for the network. Never reload away
      // from an uncommitted withdrawal request.
      rememberBrowserConsent(next);
      window.dispatchEvent(new Event(CONSENT_STOP_EVENT));
      setState(next);
    }
    setBusy(true); setFailed(false);
    try {
      const approvedContext = await captureApprovedConsentContext(next);
      const response = await fetch("/api/public/consent", {
        method: "POST", cache: "no-store", credentials: "same-origin", redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: next, policyVersion: CURRENT_TRACKING_POLICY_VERSION, ...approvedContext }),
      });
      if (!response.ok) throw new Error("Consent unavailable");
      const body = await response.json();
      const consent = parseMarketingConsent(body.consent);
      if (consent.state !== next) throw new Error("Consent unavailable");
      rememberBrowserConsent(next); setState(next);
      window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
    } catch { setFailed(true); }
    finally { setBusy(false); }
  }

  return <section id="marketing-consent" aria-label={surface === "public" ? t("publicTitle") : t("privateTitle")} className="mx-auto my-5 max-w-7xl rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800" data-consent-controls>
    <h2 className="font-semibold">{surface === "public" ? t("publicTitle") : t("privateTitle")}</h2>
    <p className="mt-1 max-w-4xl">{surface === "public" ? t("publicDescription") : t("privateDescription")}</p>
    <p className="mt-1">{t("status", { state: t(state) })}</p>
    <div className="mt-3 flex flex-wrap gap-3">
      {state !== "granted" && <button type="button" disabled={busy} onClick={() => void choose("granted")} className="rounded border px-3 py-2">{surface === "public" ? t("publicAllow") : t("privateAllow")}</button>}
      <button type="button" disabled={busy} onClick={() => void choose(state === "granted" ? "revoked" : "denied")} className="rounded border px-3 py-2">{surface === "public" ? (state === "granted" ? t("publicWithdraw") : t("publicDeny")) : (state === "granted" ? t("privateWithdraw") : t("privateDeny"))}</button>
    </div>
    <p className="mt-3">{surface === "public"
      ? <Link href="/cart#marketing-consent" className="underline">{t("manageCheckout")}</Link>
      : <Link href="/#marketing-consent" className="underline">{t("manageCatalog")}</Link>}</p>
    {failed && <p role="alert" className="mt-2 text-red-700">{t("error")}</p>}
  </section>;
}
