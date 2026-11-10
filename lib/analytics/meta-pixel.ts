/**
 * First-party commerce interactions. This compatibility module NEVER imports
 * or initializes a marketing SDK. browser-pixel.ts belongs to the public root.
 */
import { BASE_CURRENCY, type CurrencyCode } from "@/lib/currency/config";
import { buildEcommercePayload, localCartAddedItems, type CommerceItem, type CommerceSnapshot } from "./ecommerce";
import { parseTrackingEvent, type TrackingEvent } from "./events";

export type PixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: PixelFunction;
  loaded?: boolean;
  version?: string;
};

const subscribers = new Set<(event: TrackingEvent) => void>();
const published = new Set<string>();
let navigation: { route: string; id: string } | null = null;

export function createEventId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (value) =>
    (Number(value) ^ (Math.random() * 16 >> (Number(value) / 4))).toString(16));
}

/** No buffering: an interaction without an active subscriber is discarded. */
export function subscribeFirstPartyInteractions(listener: (event: TrackingEvent) => void): () => void {
  subscribers.add(listener);
  return () => { subscribers.delete(listener); };
}

function publish(value: unknown): void {
  const event = parseTrackingEvent(value);
  if (!event || subscribers.size === 0) return;
  const key = `${event.name}:${event.eventId}`;
  if (published.has(key)) return;
  published.add(key);
  for (const listener of subscribers) {
    try { listener(event); } catch { /* Marketing failures never change commerce. */ }
  }
}

export function getNavigationEventId(_scope: string, route: string): string {
  if (navigation?.route !== route) navigation = { route, id: createEventId() };
  return navigation.id;
}

export function trackPageView(route: string): void {
  publish({ name: "PageView", eventId: getNavigationEventId("page", route), eventTime: Math.floor(Date.now() / 1000), parameters: {} });
}

function trackItems(name: "ViewContent" | "AddToCart" | "InitiateCheckout", items: readonly CommerceItem[], currency: CurrencyCode, eventId: string, value?: number): void {
  try {
    const payload = buildEcommercePayload(items, currency, value);
    if (!payload) return;
    // Explicit projection: no names, variants, private state or raw objects.
    publish({ name, eventId, eventTime: Math.floor(Date.now() / 1000), parameters: {
      content_ids: payload.content_ids, content_type: payload.content_type,
      contents: payload.contents.map((line) => ({ id: line.id, quantity: line.quantity, item_price: line.item_price })),
      value: payload.value, currency: payload.currency, num_items: payload.num_items,
    } });
  } catch { /* Never interrupt a successful business action. */ }
}

export function trackViewContent(item: CommerceItem, eventId: string, currency: CurrencyCode = BASE_CURRENCY): void {
  trackItems("ViewContent", [{ productId: item.productId, productCode: item.productCode, quantity: 1, unitPrice: item.unitPrice }], currency, eventId);
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

/** Deprecated browser conversion entry points are inert for old callers. */
export function initializeMetaPixel(pixelId?: string): boolean { void pixelId; return false; }
export function setMetaPixelConsent(granted: boolean): void { void granted; /* Versioned consent controls replace this. */ }
export function registerPurchaseIntent(orderId: string): void { void orderId; /* No browser order attribution storage. */ }
export function hasPurchaseIntent(orderId: string): boolean { void orderId; return false; }
export function trackPurchase(snapshot: unknown, eventId: string): void { void snapshot; void eventId; /* Server committed transitions only. */ }
