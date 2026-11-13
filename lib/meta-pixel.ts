import { stripLocalePrefix } from "@/lib/i18n/paths";
import type { CartItem } from "@/features/cart/api";
import type { CheckoutPreview } from "@/features/checkout/api";
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

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
let initialized = false;
let lastPage: string | null = null;
let usdRate: string | null = null;

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
    return process.env.NODE_ENV === "production" && Boolean(pixelId && /^\d+$/.test(pixelId)) &&
      typeof window !== "undefined" && !window.navigator.webdriver &&
      !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) &&
      safeUrl(window.location.href) && (!document.referrer || safeUrl(document.referrer));
  } catch { return false; }
}

function pixel(): Pixel | null {
  if (!canTrackMetaPixel()) return null;
  if (!initialized) {
    // Official fbevents.js bootstrap queue, without a second initial PageView.
    if (!window.fbq) {
      const fbq: Pixel = Object.assign(function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      }, { queue: [] as unknown[][], loaded: true, version: "2.0", disablePushState: true }) as Pixel;
      fbq.push = fbq;
      window.fbq = fbq;
      window._fbq = fbq;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.referrerPolicy = "no-referrer";
      document.head.appendChild(script);
    }
    window.fbq.disablePushState = true;
    window.fbq("set", "autoConfig", false, pixelId);
    window.fbq("init", pixelId);
    initialized = true;
  }
  return window.fbq ?? null;
}

export function trackPageView(exchangeRate: string | null): void {
  try {
    usdRate = exchangeRate;
    const current = typeof window === "undefined" ? null : window.location.href;
    if (current === lastPage) return;
    // Remember excluded visits too, so returning to a shopping page counts anew.
    lastPage = current;
    pixel()?.("track", "PageView");
  } catch { /* Tracking must never affect shopping. */ }
}

type PixelItem = { id: string; quantity: number; item_price?: number };

function usd(amountBDT: number): number | null {
  return usdRate ? convertFromBDT({ amount: amountBDT, currency: "USD", exchangeRate: usdRate }) : null;
}

function track(event: "AddToCart" | "InitiateCheckout" | "Purchase", contents: PixelItem[], value: number | null): boolean {
  if (value === null || !Number.isFinite(value) || value < 0 || !contents.length ||
    contents.some(item => !item.id || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) return false;
  const fbq = pixel();
  if (!fbq) return false;
  fbq("track", event, {
    content_type: "product",
    content_ids: contents.map(item => item.id),
    contents,
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    value,
    currency: "USD",
  });
  return true;
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

export function trackInitiateCheckout(preview: CheckoutPreview): boolean {
  try {
    if (!canTrackMetaPixel()) return false;
    const value = preview.summary.currency === "USD" ? preview.summary.total : usd(preview.summary.baseTotal);
    return track("InitiateCheckout", preview.items.map(item => ({ id: item.productId, quantity: item.quantity })), value);
  } catch { return false; }
}

export function trackPurchase(order: OrderDetail): void {
  try {
    if (!canTrackMetaPixel() || order.paymentMethod !== "AIRWALLEX" ||
      order.paymentStatus !== "PAID" || order.requiresPaymentReview || !order.id) return;
    // Prefer immutable USD amounts. Foreign orders use their confirmed base
    // total and the existing USD quote; never relabel a foreign amount as USD.
    const value = order.currency === "USD" ? order.totalAmount :
      order.paymentCurrency === "USD" && order.paymentAmount !== null ? order.paymentAmount : usd(order.baseTotalAmount);
    const contents = order.items.filter(item => item.productId).map(item => ({ id: item.productId!, quantity: item.quantity }));
    const key = `bangbuy:meta-purchase:${pixelId}:${order.id}`;
    // If persistence is unavailable, skip rather than repeat on every refresh.
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
    try {
      if (!track("Purchase", contents, value)) window.localStorage.removeItem(key);
    } catch {
      window.localStorage.removeItem(key);
    }
  } catch { /* Tracking must never affect shopping or payment confirmation. */ }
}
