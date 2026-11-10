import { CURRENT_TRACKING_POLICY_VERSION, type MarketingConsent } from "@/lib/analytics/consent";
import { createDeniedTrackingPolicy, type TrackingContext, type TrackingRuntimePolicy } from "@/lib/analytics/policy";
import type { TrackingEvent } from "@/lib/analytics/events";

export const TRACKING_TEST_TIME = Date.parse("2026-11-10T06:00:00.000Z");
export const trackingContext: TrackingContext = {
  url: "https://public.example.test/en/products/example",
  referrer: "", contentIds: ["SKU-EXAMPLE"], classification: "ordinary",
  metadataFingerprint: "a".repeat(64),
};
export function grantedConsent(now = TRACKING_TEST_TIME): MarketingConsent {
  return { state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, occurredAt: new Date(now - 1000).toISOString(), expiresAt: new Date(now + 86400_000).toISOString() };
}
/** Synthetic test approvals only. This fixture is never application configuration. */
export function approvedTestPolicy(now = TRACKING_TEST_TIME): TrackingRuntimePolicy {
  const approval = { approved: true, reference: "synthetic-test-review", expiresAt: new Date(now + 7 * 86400_000).toISOString() };
  return {
    ...createDeniedTrackingPolicy(), environment: "test", runtimeEnabled: true,
    pixelEnabled: true, capiEnabled: true, pixelId: "100000000000000",
    storefrontOrigin: "https://public.example.test", commerceOrigin: "https://commerce.example.test", isolationReady: true,
    business: { ...approval }, source: { ...approval, pixelId: "100000000000000" },
    routes: [{ ...approval, pathname: "/en/products/example", channels: ["browser", "server"], events: ["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"], classification: "ordinary", contentIds: ["SKU-EXAMPLE"], metadataFingerprint: trackingContext.metadataFingerprint }],
    contents: [{ ...approval, id: "SKU-EXAMPLE", classification: "ordinary" }],
    eventApprovals: ["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"].map((name) => ({ ...approval, name: name as "PageView", channels: ["browser", "server"], fields: ["content_ids", "content_type", "contents", "value", "currency", "num_items"] })),
    matching: { ...approval, fields: ["fbp", "fbc", "client_user_agent"] },
  };
}
export function trackingTestEvent(name: "PageView" | "ViewContent" | "Purchase" = "PageView", now = TRACKING_TEST_TIME): TrackingEvent {
  const identity = { eventId: "e3975bfc-dcb5-4915-bdcf-da0cfdfb57a2", eventTime: Math.floor(now / 1000) };
  if (name === "PageView") return { ...identity, name, parameters: {} };
  if (name === "Purchase") return { ...identity, name, parameters: { value: 125.5, currency: "EUR" } };
  return { ...identity, name, parameters: { content_ids: ["SKU-EXAMPLE"], content_type: "product", contents: [{ id: "SKU-EXAMPLE", quantity: 1, item_price: 125.5 }], value: 125.5, currency: "EUR", num_items: 1 } };
}
