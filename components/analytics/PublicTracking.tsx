"use client";

import { useEffect } from "react";
import MarketingConsentControls from "./MarketingConsentControls";
import { createEventId, getNavigationEventId, subscribeFirstPartyInteractions } from "@/lib/analytics/meta-pixel";
import { dispatchPublicPixelEvent, publicPixelWasRequested, revalidatePublicPixel, suspendPublicPixel } from "@/lib/analytics/browser-pixel";
import { browserConsentDenies, CONSENT_CHANGE_EVENT, CONSENT_PREFERENCE_KEY, CONSENT_STOP_EVENT } from "@/lib/analytics/consent-browser";
import { buildEcommercePayload } from "@/lib/analytics/ecommerce";
import type { TrackingEvent } from "@/lib/analytics/events";
import { hasLegacyPrivateBrowserState } from "@/lib/analytics/browser-storage-policy";

/** This is the only application component that imports the Pixel transport. */
export default function PublicTracking() {
  useEffect(() => {
    let stopped = false;
    const eventId = getNavigationEventId("document", window.location.href);
    const page: TrackingEvent = { name: "PageView", eventId, eventTime: Math.floor(Date.now() / 1000), parameters: {} };
    async function currentDisplay() {
      if (stopped || browserConsentDenies() || document.querySelector("[data-tracking-pending]")) return;
      await dispatchPublicPixelEvent(page);
      if (stopped || browserConsentDenies()) return;
      // Read what is displayed now after consent; no pre-consent event replay.
      for (const element of document.querySelectorAll("[data-tracking-product]")) {
        try {
          const item = JSON.parse(element.getAttribute("data-tracking-product") ?? "null");
          const payload = buildEcommercePayload([{ productId: item.productId, productCode: item.productCode, quantity: 1, unitPrice: item.unitPrice }], "BDT");
          if (!payload) continue;
          await dispatchPublicPixelEvent({ name: "ViewContent", eventId, eventTime: Math.floor(Date.now() / 1000), parameters: {
            content_ids: payload.content_ids, content_type: payload.content_type,
            contents: payload.contents.map((line) => ({ id: line.id, quantity: line.quantity, item_price: line.item_price })),
            value: payload.value, currency: payload.currency, num_items: payload.num_items,
          } });
        } catch { /* A malformed display descriptor is ineligible. */ }
      }
    }
    const unsubscribe = subscribeFirstPartyInteractions((event) => {
      if (!stopped && !browserConsentDenies()) void dispatchPublicPixelEvent(event);
    });
    const stop = () => suspendPublicPixel(false);
    const changed = () => { if (publicPixelWasRequested()) suspendPublicPixel(true); else window.location.reload(); };
    const storage = (event: StorageEvent) => { if (event.key === CONSENT_PREFERENCE_KEY || hasLegacyPrivateBrowserState()) { stop(); changed(); } };
    const restored = (event: PageTransitionEvent) => { if (event.persisted) { stop(); changed(); } };
    const hashChanged = () => { if (publicPixelWasRequested()) suspendPublicPixel(true); };
    const visible = () => { if (document.visibilityState === "visible" && publicPixelWasRequested()) void revalidatePublicPixel({ ...page, eventId: createEventId() }); };
    window.addEventListener(CONSENT_STOP_EVENT, stop);
    window.addEventListener(CONSENT_CHANGE_EVENT, changed);
    window.addEventListener("storage", storage);
    window.addEventListener("pageshow", restored);
    window.addEventListener("pagehide", stop);
    window.addEventListener("hashchange", hashChanged);
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("bangbuy:public-content-ready", currentDisplay);
    const timer = window.setInterval(() => {
      if (!stopped && publicPixelWasRequested()) void revalidatePublicPixel({ ...page, eventId: createEventId() });
    }, 5000);
    void currentDisplay();
    return () => {
      stopped = true; unsubscribe(); window.clearInterval(timer);
      window.removeEventListener(CONSENT_STOP_EVENT, stop);
      window.removeEventListener(CONSENT_CHANGE_EVENT, changed);
      window.removeEventListener("storage", storage);
      window.removeEventListener("pageshow", restored);
      window.removeEventListener("pagehide", stop);
      window.removeEventListener("hashchange", hashChanged);
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("bangbuy:public-content-ready", currentDisplay);
    };
  }, []);
  return <MarketingConsentControls />;
}
