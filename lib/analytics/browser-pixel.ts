/** Explicit public-root-only transport. Never import from commerce helpers. */
import { classifySurfacePath } from "@/lib/security/surfaces";
import { parseMarketingConsent, type MarketingConsent } from "./consent";
import { parseTrackingEvent, type TrackingEvent } from "./events";
import { collectBrowserTrackingContext } from "./browser-context";
import { evaluateTrackingPolicy, trackingRuntimePolicySchema, type TrackingRuntimePolicy } from "./policy";
import type { PixelFunction } from "./meta-pixel";
import { browserConsentDenies } from "./consent-browser";
import { hasLegacyPrivateBrowserState } from "./browser-storage-policy";

type Pixel = PixelFunction & { disablePushState?: boolean };
type PublicPixelState = {
  pixelId: string | null;
  load: Promise<boolean> | null;
  requested: boolean;
  loaded: boolean;
  suspended: boolean;
  sent: Set<string>;
  inFlight: Set<string>;
  discarded: Set<string>;
};
declare global {
  interface Window {
    fbq?: Pixel;
    _fbq?: Pixel;
    __bangbuyPublicPixel?: PublicPixelState;
  }
}

export type TrackingBrowserSnapshot = { policy: TrackingRuntimePolicy; consent: MarketingConsent };

export async function fetchTrackingBrowserSnapshot(): Promise<TrackingBrowserSnapshot | null> {
  try {
    const response = await fetch("/api/public/tracking-policy", { cache: "no-store", credentials: "same-origin", redirect: "error", headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    const body = await response.json();
    const parsed = trackingRuntimePolicySchema.safeParse(body.policy);
    return parsed.success ? { policy: parsed.data, consent: parseMarketingConsent(body.consent) } : null;
  } catch { return null; }
}

function state(): PublicPixelState {
  return window.__bangbuyPublicPixel ??= { pixelId: null, load: null, requested: false, loaded: false, suspended: false, sent: new Set(), inFlight: new Set(), discarded: new Set() };
}

function clearMarketingStorage(): void {
  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      for (let index = storage.length - 1; index >= 0; index--) {
        const key = storage.key(index);
        if (key && (/^(?:bangbuy:marketing:|enterfly:meta-)/.test(key))) storage.removeItem(key);
      }
    }
    // Delete only application-controlled, host-only marketing cookies. Never
    // broaden Domain or touch auth/guest/cart storage.
    for (const name of ["_fbp", "_fbc"]) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  } catch { /* Restricted storage never blocks withdrawal. */ }
}

/** Revocation stops dispatch synchronously; replacing the document unloads SDK. */
export function suspendPublicPixel(cleanDocument = false): void {
  if (typeof window === "undefined") return;
  const current = state();
  current.suspended = true;
  for (const key of current.inFlight) current.discarded.add(key);
  current.inFlight.clear();
  if (window.fbq?.queue) window.fbq.queue.length = 0;
  try { window.fbq?.("consent", "revoke"); } catch { /* Nonfatal. */ }
  clearMarketingStorage();
  if (cleanDocument && current.requested) window.location.reload();
}

async function ensureSDK(pixelId: string): Promise<boolean> {
  const current = state();
  if (current.suspended || (current.pixelId && current.pixelId !== pixelId)) return false;
  if (current.load) return current.load;
  // Another integration is not trusted to obey this application's policy.
  if (window.fbq || document.getElementById("bangbuy-public-pixel")) return false;
  current.pixelId = pixelId;
  current.requested = true;
  const queue: unknown[][] = [];
  const pixel: Pixel = (...args: unknown[]) => {
    if (pixel.callMethod) pixel.callMethod(...args);
    else queue.push(args);
  };
  pixel.queue = queue; pixel.push = pixel; pixel.loaded = true; pixel.version = "2.0";
  // Observed in the official SDK; hard navigation remains the real lifecycle
  // boundary. Manual-only autoConfig is the documented additional-data control.
  pixel.disablePushState = true;
  window.fbq = pixel; window._fbq = pixel;
  pixel("consent", "revoke");
  pixel("set", "autoConfig", false, pixelId);
  for (const feature of ["AutomaticSetup", "AutomaticMatching", "AutomaticMatchingRegex", "AutomaticMatchingAI", "FirstPartyCookies"]) pixel("optOut", pixelId, feature);
  pixel("init", pixelId);
  pixel("consent", "grant");
  current.load = new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = "bangbuy-public-pixel"; script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.referrerPolicy = "no-referrer";
    const timer = window.setTimeout(() => resolve(false), 8000);
    script.onload = () => {
      window.clearTimeout(timer);
      current.loaded = !current.suspended && Boolean(window.fbq?.callMethod);
      resolve(current.loaded);
    };
    script.onerror = () => { window.clearTimeout(timer); resolve(false); };
    try { document.head.appendChild(script); } catch { window.clearTimeout(timer); resolve(false); }
  });
  return current.load;
}

export async function dispatchPublicPixelEvent(value: unknown): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const current = state();
  const event = parseTrackingEvent(value);
  if (!event || !["PageView", "ViewContent", "AddToCart"].includes(event.name)) return false;
  const key = `${event.name}:${event.eventId}`;
  if (current.sent.has(key) || current.inFlight.has(key) || current.discarded.has(key)) return false;
  if (current.suspended || browserConsentDenies() || hasLegacyPrivateBrowserState() || classifySurfacePath(window.location.pathname) !== "public") { current.discarded.add(key); return false; }
  current.inFlight.add(key);
  try {
    // Always re-read runtime policy; no build-only flag or pre-consent queue.
    const snapshot = await fetchTrackingBrowserSnapshot();
    if (!snapshot || current.suspended || browserConsentDenies() || hasLegacyPrivateBrowserState()) return false;
    const context = await collectBrowserTrackingContext(snapshot.policy);
    if (!context || !evaluateTrackingPolicy({ ...snapshot, context, channel: "browser", event }).allowed || !snapshot.policy.pixelId) {
      if (current.requested) suspendPublicPixel(true);
      return false;
    }
    if (!await ensureSDK(snapshot.policy.pixelId) || current.suspended) return false;
    // A withdrawal, runtime kill or content change during download must win.
    const latest = await fetchTrackingBrowserSnapshot();
    const latestContext = latest ? await collectBrowserTrackingContext(latest.policy) : null;
    if (!latest || !latestContext || current.suspended || browserConsentDenies() || hasLegacyPrivateBrowserState() || !evaluateTrackingPolicy({ ...latest, context: latestContext, channel: "browser", event }).allowed) {
      suspendPublicPixel(true);
      return false;
    }
    if (!window.fbq?.callMethod || current.sent.has(key)) return false;
    window.fbq("trackSingle", latest.policy.pixelId, event.name, structuredClone(event.parameters), { eventID: event.eventId });
    current.sent.add(key);
    return true;
  } catch { return false; }
  finally { current.inFlight.delete(key); if (!current.sent.has(key)) current.discarded.add(key); }
}

export function publicPixelWasRequested(): boolean {
  return typeof window !== "undefined" && Boolean(window.__bangbuyPublicPixel?.requested);
}

/** Recheck after tab/BFCache restoration before any further dispatch. */
export async function revalidatePublicPixel(event: TrackingEvent): Promise<boolean> {
  const snapshot = await fetchTrackingBrowserSnapshot();
  const context = snapshot ? await collectBrowserTrackingContext(snapshot.policy) : null;
  const allowed = Boolean(!browserConsentDenies() && !hasLegacyPrivateBrowserState() && snapshot && context && evaluateTrackingPolicy({ ...snapshot, context, channel: "browser", event }).allowed);
  if (!allowed && publicPixelWasRequested()) suspendPublicPixel(true);
  return allowed;
}
