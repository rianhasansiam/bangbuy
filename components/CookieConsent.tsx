"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useInterfaceTranslations } from "@/components/i18n/translate";
import { setMetaPixelConsent } from "@/lib/meta-pixel";

const STORAGE_KEY = "bangbuy:marketing-consent:v1";
const OPEN_SETTINGS_EVENT = "bangbuy:open-cookie-settings";
type Choice = "granted" | "denied" | null;
const parseChoice = (value: string | null): Choice =>
  value === "granted" || value === "denied" ? value : null;

/** A normal footer control; preference restoration stays in the document root. */
export function CookieSettingsButton() {
  const i18n = useInterfaceTranslations("InterfaceCookieConsent");
  return (
    <Button
      type="button"
      variant="link"
      className="h-auto min-h-11 justify-start p-0 text-xs text-brand-white hover:text-brand-red sm:text-sm"
      onClick={(event) => window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT, { detail: event.currentTarget }))}
    >{i18n("Cookie settings")}</Button>
  );
}

/** Optional marketing cookies only; necessary storefront cookies stay available. */
export default function CookieConsent() {
  const i18n = useInterfaceTranslations("InterfaceCookieConsent");
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<Choice>(null);
  const [preferenceUnavailable, setPreferenceUnavailable] = useState(false);
  const bannerRef = useRef<HTMLElement>(null);
  const settingsRef = useRef<HTMLElement>(null);
  const reopenedRef = useRef(false);

  useLayoutEffect(() => {
    let active = true;
    let stored: Choice = null;
    let readable = true;
    try { stored = parseChoice(window.localStorage.getItem(STORAGE_KEY)); }
    catch { readable = false; }
    // Restore before storefront passive effects can dispatch shopping events.
    // The automatic default is not stored as an explicit visitor acceptance.
    setMetaPixelConsent(readable && stored !== "denied");
    void Promise.resolve().then(() => {
      if (!active) return;
      setChoice(stored);
      setPreferenceUnavailable(!readable);
      setOpen(!readable);
      setReady(true);
    });

    const syncChoice = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try { if (event.storageArea !== window.localStorage) return; }
      catch {
        setMetaPixelConsent(false);
        setChoice(null);
        setPreferenceUnavailable(true);
        setOpen(true);
        return;
      }
      const next = parseChoice(event.newValue);
      setMetaPixelConsent(next !== "denied");
      setChoice(next);
      setPreferenceUnavailable(false);
      setOpen(false);
    };
    const openSettings = (event: Event) => {
      const trigger = (event as CustomEvent<HTMLElement>).detail;
      if (trigger instanceof HTMLElement) settingsRef.current = trigger;
      reopenedRef.current = true;
      setOpen(true);
    };
    window.addEventListener("storage", syncChoice);
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => {
      active = false;
      window.removeEventListener("storage", syncChoice);
      window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
    };
  }, []);

  useEffect(() => {
    if (reopenedRef.current) (open ? bannerRef.current : settingsRef.current)?.focus();
  }, [open]);

  const choose = (next: Exclude<Choice, null>) => {
    // Apply immediately, even if storage is blocked or full.
    setMetaPixelConsent(next === "granted");
    try { window.localStorage.setItem(STORAGE_KEY, next); }
    catch { /* The current document still respects this choice. */ }
    setChoice(next);
    setPreferenceUnavailable(false);
    setOpen(false);
  };

  if (!ready || !open) return null;

  return (
    <section
      id="marketing-cookie-settings"
      ref={bannerRef}
      tabIndex={-1}
      aria-labelledby="marketing-cookie-heading"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-3xl rounded-2xl border border-border bg-background p-5 text-foreground shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red sm:p-6 lg:bottom-4"
    >
      <h2 id="marketing-cookie-heading" className="text-base font-bold">{i18n("Your cookie choices")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {i18n("We use Meta marketing cookies for advertising measurement. You can turn optional tracking off in Cookie settings.")}{" "}
        <Link href="/privacy-policy" className="font-medium text-brand-red underline underline-offset-4">{i18n("Privacy Policy")}</Link>
      </p>
      {choice !== null && <p className="mt-2 text-sm">{i18n(choice === "granted" ? "Marketing cookies are accepted." : "Optional cookies are rejected.")}</p>}
      {choice === null && <p className="mt-2 text-sm">{i18n(preferenceUnavailable
        ? "Your cookie preference could not be read. Choose whether to allow marketing cookies."
        : "Marketing cookies are enabled by default.")}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" className="h-auto min-h-11 whitespace-normal px-4 py-2" onClick={() => choose("granted")}>{i18n("Accept marketing cookies")}</Button>
        <Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal px-4 py-2" onClick={() => choose("denied")}>{i18n("Reject optional cookies")}</Button>
      </div>
    </section>
  );
}
