import { BASE_CURRENCY, type CurrencyCode } from "@/lib/currency/config";
import { buildEcommercePayload, localCartAddedItems, type CommerceItem, type CommerceSnapshot, type EcommercePayload } from "./ecommerce";

type MetaEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
type PixelCommand = unknown[];
export type PixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: PixelCommand[];
  push?: PixelFunction;
  loaded?: boolean;
  version?: string;
};
type PixelState = {
  pixelId: string | null;
  initialized: boolean;
  scriptRequested: boolean;
  consent: boolean;
  sent: Set<string>;
  navigation: { route: string; id: string } | null;
  purchaseIntents: Set<string>;
  allowStoredPurchaseIntents: boolean;
};
declare global {
  interface Window {
    fbq?: PixelFunction;
    _fbq?: PixelFunction;
    __bangbuyMetaPixel?: PixelState;
  }
}

function state(): PixelState | null {
  if (typeof window === "undefined") return null;
  return window.__bangbuyMetaPixel ??= {
    pixelId: null, initialized: false, scriptRequested: false,
    consent: true, // Preserve existing behavior: no consent control exists in the repo.
    sent: new Set(), navigation: null, purchaseIntents: new Set(), allowStoredPurchaseIntents: true,
  };
}

export function createEventId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  } catch { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
}

/** Meta's supported bootstrap queue is available before its external script loads. */
export function initializeMetaPixel(pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ""): boolean {
  try {
    const current = state();
    if (!current || !current.consent) return false;
    const configuredId = pixelId.trim();
    if (!/^\d+$/.test(configuredId)) return false;
    if (current.initialized) return current.pixelId === configuredId;
    current.pixelId = configuredId;
    if (!window.fbq) {
      const queue: PixelCommand[] = [];
      const fbq: PixelFunction = (...args) => {
        if (fbq.callMethod) fbq.callMethod(...args);
        else queue.push(args);
      };
      fbq.queue = queue;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      window._fbq ??= fbq;
    }
    // Once per document, including remounts and development effect replay.
    window.fbq("init", configuredId);
    current.initialized = true;
    if (!current.scriptRequested && !window.fbq.callMethod) {
      current.scriptRequested = true;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.id = "meta-pixel";
      document.head.appendChild(script);
    }
    return true;
  } catch { return false; }
}

/** Consent integration gate; denied actions are discarded, never replayed. */
export function setMetaPixelConsent(granted: boolean): void {
  try {
    const current = state();
    if (!current) return;
    current.consent = granted;
    if (!granted) {
      const prefix = `enterfly:meta-checkout:${current.pixelId ?? process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()}:`;
      // Pending payment attribution is also analytics activity. Discard it on
      // revocation, including intents from an earlier document in this browser.
      const pendingIds = [...current.purchaseIntents];
      current.purchaseIntents.clear();
      current.allowStoredPurchaseIntents = false;
      try {
        const storage = window.localStorage;
        for (const orderId of pendingIds) storage.removeItem(`${prefix}${orderId}`);
        for (let index = storage.length - 1; index >= 0; index -= 1) {
          const key = storage.key(index);
          if (key?.startsWith(prefix)) storage.removeItem(key);
        }
      } catch { /* Restricted storage still has the cleared in-memory gate. */ }
    }
    if (!granted && window.fbq?.queue) {
      const retained = window.fbq.queue.filter((command) => !["track", "trackCustom", "trackSingle", "trackSingleCustom"].includes(String(command[0])));
      window.fbq.queue.splice(0, window.fbq.queue.length, ...retained);
    }
    if (current.initialized) window.fbq?.("consent", granted ? "grant" : "revoke");
  } catch { /* Analytics must never affect shopping. */ }
}

export function getNavigationEventId(scope: string, route: string): string {
  try {
    const current = state();
    if (!current) return `${scope}:server`;
    if (current.navigation?.route !== route) current.navigation = { route, id: createEventId() };
    return `${scope}:${current.navigation.id}`;
  } catch { return `${scope}:${createEventId()}`; }
}

/** Anchor payment attribution to a committed checkout in this browser, not receipt visits. */
export function registerPurchaseIntent(orderId: string): void {
  try {
    const current = state();
    if (!current?.consent || !orderId || !initializeMetaPixel(current.pixelId ?? undefined)) return;
    current.purchaseIntents.add(orderId);
    try { window.localStorage.setItem(`enterfly:meta-checkout:${current.pixelId}:${orderId}`, "1"); } catch { /* Memory fallback. */ }
  } catch { /* No analytics failure may interrupt payment navigation. */ }
}

export function hasPurchaseIntent(orderId: string): boolean {
  try {
    const current = state();
    if (!current?.consent || !orderId) return false;
    if (current.purchaseIntents.has(orderId)) return true;
    if (!current.allowStoredPurchaseIntents) return false;
    const pixelId = current.pixelId ?? process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
    if (!pixelId || !/^\d+$/.test(pixelId)) return false;
    return window.localStorage.getItem(`enterfly:meta-checkout:${pixelId}:${orderId}`) === "1";
  } catch { return false; }
}

function deliver(name: MetaEvent, payload: EcommercePayload | Record<string, never>, eventId: string): void {
  try {
    const current = state();
    if (!current || !eventId) return;
    const key = `${name}:${eventId}`;
    if (current.sent.has(key)) return;
    if (!current.consent) { current.sent.add(key); return; }
    if (!initializeMetaPixel(current.pixelId ?? undefined)) return;
    const purchaseKey = `enterfly:meta-purchase:${current.pixelId}:${eventId}`;
    if (name === "Purchase") {
      try {
        if (window.localStorage.getItem(purchaseKey)) { current.sent.add(key); return; }
      } catch { /* Memory/eventID dedup still works without storage. */ }
    }
    window.fbq?.("track", name, payload, { eventID: eventId });
    current.sent.add(key);
    if (name === "Purchase") {
      try { window.localStorage.setItem(purchaseKey, "1"); } catch { /* Optional persistence. */ }
    }
  } catch { /* Never propagate SDK/storage failures into commerce. */ }
}

export function trackPageView(route: string): void {
  try { deliver("PageView", {}, getNavigationEventId("page", route)); } catch { /* Best effort. */ }
}
function trackItems(name: Exclude<MetaEvent, "PageView">, items: readonly CommerceItem[], currency: CurrencyCode, eventId: string, value?: number): void {
  try {
    const payload = buildEcommercePayload(items, currency, value);
    if (payload) deliver(name, payload, eventId);
  } catch { /* Payload failures must not change successful commerce actions. */ }
}
export function trackViewContent(item: CommerceItem, eventId: string, currency: CurrencyCode = BASE_CURRENCY): void {
  trackItems("ViewContent", [{ ...item, quantity: 1 }], currency, eventId);
}
export function trackAddToCart(item: CommerceItem, eventId: string, currency: CurrencyCode = BASE_CURRENCY): void {
  trackItems("AddToCart", [item], currency, eventId);
}
export function trackLocalCartAddition(before: readonly CommerceItem[], after: readonly CommerceItem[], eventId: string): void {
  try { trackItems("AddToCart", localCartAddedItems(before, after), BASE_CURRENCY, eventId); } catch { /* Best effort. */ }
}
export function trackInitiateCheckout(snapshot: CommerceSnapshot, eventId: string): void {
  trackItems("InitiateCheckout", snapshot.items, snapshot.currency, eventId, snapshot.value);
}
/** Only server-verified, immutable online-payment order snapshots are eligible. */
export function trackPurchase(snapshot: CommerceSnapshot, eventId: string): void {
  trackItems("Purchase", snapshot.items, snapshot.currency, eventId, snapshot.value);
}
