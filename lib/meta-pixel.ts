import { stripLocalePrefix } from "@/lib/i18n/paths";
import type { CartItem } from "@/features/cart/api";
import type { OrderDetail } from "@/features/orders/api";
import { convertFromBDT } from "@/lib/currency/convert-money";

type Pixel = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Pixel;
  loaded: boolean;
  version: string;
  disablePushState: boolean;
};

declare global {
  interface Window { fbq?: Pixel; _fbq?: Pixel }
}

/** Public IDs stay strings (including IDs larger than Number.MAX_SAFE_INTEGER). */
export function parseMetaPixelIds(raw = process.env.NEXT_PUBLIC_META_PIXEL_IDS): string[] {
  return [...new Set((raw ?? "").split(",").map(id => id.trim()).filter(id => /^\d+$/.test(id)))];
}

const pixelIds = parseMetaPixelIds();
const initialized = new Set<string>();
const purchases = new Set<string>();
// CookieConsent resolves the automatic default or saved rejection after hydration.
let marketingConsent = false;
let lastPage: string | null = null;
let usdRate: string | null = null;
export const META_PIXEL_CONSENT_EVENT = "bangbuy:meta-consent-change";
export const META_PIXEL_LOAD_EVENT = "bangbuy:meta-load-change";
export type MetaPixelLoadState = "idle" | "loading" | "loaded" | "failed";
let loadState: MetaPixelLoadState = "idle";

/** SDK resource state only; a loaded script does not confirm event delivery. */
export function getMetaPixelLoadState(): MetaPixelLoadState { return loadState; }

function setLoadState(next: MetaPixelLoadState): void {
  if (loadState === next) return;
  loadState = next;
  try { window.dispatchEvent(new Event(META_PIXEL_LOAD_EVENT)); }
  catch { /* Optional status observers must never affect shopping. */ }
}

function loadSdk(): void {
  if (loadState !== "idle") return;
  if (window.fbq?.callMethod) { setLoadState("loaded"); return; }
  setLoadState("loading");
  const timeout = window.setTimeout(() => setLoadState("failed"), 10_000);
  const finish = (next: "loaded" | "failed") => {
    window.clearTimeout(timeout);
    setLoadState(next);
  };
  try {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://connect.facebook.net/en_US/fbevents.js"]');
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => finish("loaded"), { once: true });
    script.addEventListener("error", () => finish("failed"), { once: true });
    if (!existing) {
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.referrerPolicy = "no-referrer";
      document.head.appendChild(script);
    }
  } catch { finish("failed"); }
}

/** Call on initial consent resolution and every marketing-consent change. */
export function setMetaPixelConsent(granted: boolean): void {
  if (typeof window === "undefined" || marketingConsent === granted) return;
  marketingConsent = granted;
  if (!granted) lastPage = null;
  try {
    if (initialized.size) window.fbq?.("consent", granted ? "grant" : "revoke");
  } catch { /* Consent or tracking errors must never affect shopping. */ }
  if (granted) trackPageView(usdRate);
  try { window.dispatchEvent(new Event(META_PIXEL_CONSENT_EVENT)); }
  catch { /* Optional observers must never interrupt the consent decision. */ }
}

/** Only known shopping URLs and structured parameters; never free-text search. */
function safeUrl(raw: string): boolean {
  const url = new URL(raw);
  const path = stripLocalePrefix(url.pathname).replace(/\/$/, "") || "/";
  if (url.username || url.password || url.hash) return false;
  if (!/^(?:\/|\/(?:products|categories|brands)(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*|\/(?:about|privacy-policy|return-policy|terms-and-conditions|cart|wishlist|checkout|shopping-handoff|orders\/payment-return))$/.test(path)) return false;
  for (const [key, value] of url.searchParams) {
    if (key === "fbclid" && /^[a-zA-Z0-9_-]{1,512}$/.test(value)) continue;
    if (path === "/orders/payment-return" && key === "orderId" && /^c[a-z0-9]{24}$/.test(value)) continue;
    if (path === "/checkout" && key === "buy" && /^[a-zA-Z0-9_-]+:\d+(?::[a-zA-Z0-9_-]*)?(?:,[a-zA-Z0-9_-]+:\d+(?::[a-zA-Z0-9_-]*)?)*$/.test(value)) continue;
    if (path === "/checkout" && key === "source" && value === "cart") continue;
    if (path === "/shopping-handoff" && (
      (key === "action" && /^(cart|wishlist)$/.test(value)) ||
      (/^(productId|variantId)$/.test(key) && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) ||
      (key === "quantity" && /^\d{1,4}$/.test(value))
    )) continue;
    if (/^\/(products|categories|brands)(\/|$)/.test(path) && (
      (/^(page|pageSize|minPrice|maxPrice|minRating)$/.test(key) && /^\d+(?:\.\d{1,2})?$/.test(value)) ||
      (key === "sort" && /^(popular|price-low|price-high|rating|latest)$/.test(value)) ||
      (key === "stock" && /^(in-stock|out-of-stock)$/.test(value)) ||
      (/^(categoryPath|brandSlug|manufacturerSlug)$/.test(key) && /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(value))
    )) continue;
    return false;
  }
  return true;
}

export function canTrackMetaPixel(): boolean {
  try {
    const testMode = process.env.NEXT_PUBLIC_META_PIXEL_TEST_MODE === "true";
    return process.env.NODE_ENV !== "test" && (process.env.NODE_ENV === "production" || testMode) &&
      pixelIds.length > 0 && marketingConsent && typeof window !== "undefined" &&
      (testMode || (!window.navigator.webdriver &&
        !/^(localhost|.*\.localhost|127(?:\.\d{1,3}){3}|\[::1\])$/.test(window.location.hostname))) &&
      safeUrl(window.location.href) && (!document.referrer || safeUrl(document.referrer));
  } catch { return false; }
}

function pixel(): Pixel | null {
  if (!canTrackMetaPixel()) return null;
  // Official fbevents.js bootstrap queue, without a second initial PageView.
  if (!window.fbq) {
    const fbq: Pixel = Object.assign(function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }, { queue: [] as unknown[][], loaded: true, version: "2.0", disablePushState: true }) as Pixel;
    fbq.push = fbq;
    window.fbq = fbq;
    window._fbq ??= fbq;
  }
  window.fbq.disablePushState = true;
  loadSdk();
  return window.fbq ?? null;
}

/** One SDK handoff per configured Pixel; a failure cannot suppress another ID. */
function dispatch(event: "PageView" | "AddToCart" | "InitiateCheckout" | "Purchase", parameters: Record<string, unknown> = {}, orderId?: string): boolean {
  const fbq = pixel();
  if (!fbq) return false;
  let sent = false;
  for (const pixelId of pixelIds) {
    try {
      const key = orderId ? `bangbuy:meta-purchase:${pixelId}:${orderId}` : null;
      if (key) {
        if (purchases.has(key)) continue;
        try { if (window.localStorage.getItem(key)) continue; }
        catch { /* Storage may be disabled; use the document's memory guard. */ }
      }
      if (!initialized.has(pixelId)) {
        fbq("set", "autoConfig", false, pixelId);
        fbq("init", pixelId);
        initialized.add(pixelId);
      }
      fbq("trackSingle", pixelId, event, parameters);
      sent = true;
      // A marker means handed to the SDK, never confirmed delivery to Meta.
      if (key) {
        purchases.add(key);
        try { window.localStorage.setItem(key, "1"); }
        catch { /* Memory still prevents duplicates in the current document. */ }
      }
    } catch { /* Keep the other Pixels and the storefront working. */ }
  }
  return sent;
}

export function trackPageView(exchangeRate: string | null): void {
  try {
    usdRate = exchangeRate;
    const current = typeof window === "undefined" ? null : window.location.href;
    if (current === lastPage) return;
    // Excluded/denied visits break the sequence too, allowing a later visit.
    lastPage = null;
    if (dispatch("PageView")) lastPage = current;
  } catch { /* Tracking must never affect shopping. */ }
}

type PixelItem = { id: string; quantity: number; item_price?: number };

function usd(amountBDT: number): number | null {
  return usdRate ? convertFromBDT({ amount: amountBDT, currency: "USD", exchangeRate: usdRate }) : null;
}

function track(event: "AddToCart" | "InitiateCheckout" | "Purchase", contents: PixelItem[], value: number | null, orderId?: string): boolean {
  if ((value === null && event !== "InitiateCheckout") ||
    (value !== null && (!Number.isFinite(value) || value < 0)) || !contents.length ||
    contents.some(item => !item.id || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) return false;
  return dispatch(event, {
    content_type: "product",
    content_ids: contents.map(item => item.id),
    contents,
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    ...(value !== null ? { value } : {}),
    currency: "USD",
  }, orderId);
}

export function trackAddToCart(item: Pick<CartItem, "productId" | "unitPrice">, quantity: number): void {
  try {
    if (!canTrackMetaPixel()) return;
    const itemPrice = usd(item.unitPrice);
    track("AddToCart", [{ id: item.productId, quantity, ...(itemPrice !== null ? { item_price: itemPrice } : {}) }], usd(item.unitPrice * quantity));
  } catch { /* Tracking must never affect shopping. */ }
}

/** Call only after a successful local add, never hydration, merge or quantity edits. */
export function trackCartAddition(before: CartItem[], after: CartItem[]): void {
  try {
    if (!canTrackMetaPixel()) return;
    for (const item of after) {
      const previous = before.find(entry => entry.productId === item.productId && entry.variantId === item.variantId);
      const added = item.quantity - (previous?.quantity ?? 0);
      if (added > 0) trackAddToCart(item, added);
    }
  } catch { /* Tracking must never affect shopping. */ }
}

export function trackInitiateCheckout(items: Array<{ productId: string; quantity: number }>, valueBDT?: number): boolean {
  try {
    if (!canTrackMetaPixel()) return false;
    return track("InitiateCheckout", items.map(item => ({ id: item.productId, quantity: item.quantity })),
      valueBDT === undefined ? null : usd(valueBDT));
  } catch { return false; }
}

export function trackPurchase(order: OrderDetail): void {
  try {
    if (!canTrackMetaPixel() || order.paymentMethod !== "AIRWALLEX" ||
      order.paymentStatus !== "PAID" || order.status === "PENDING" || order.status === "CANCELLED" ||
      order.requiresPaymentReview || !order.id) return;
    // Prefer immutable USD amounts. Foreign orders use their confirmed base
    // total and the existing USD quote; never relabel a foreign amount as USD.
    const value = order.currency === "USD" ? order.totalAmount :
      order.paymentCurrency === "USD" && order.paymentAmount !== null ? order.paymentAmount : usd(order.baseTotalAmount);
    const contents = order.items.filter(item => item.productId).map(item => ({ id: item.productId!, quantity: item.quantity }));
    track("Purchase", contents, value, order.id);
  } catch { /* Tracking must never affect shopping or payment confirmation. */ }
}
