import { describe, expect, it } from "vitest";
import { createDeniedTrackingPolicy, evaluateTrackingPolicy, hasTrackingIsolation, type TrackingRuntimePolicy } from "@/lib/analytics/policy";
import { parseTrackingEvent } from "@/lib/analytics/events";
import { isMarketingConsentGranted, parseMarketingConsent, UNKNOWN_MARKETING_CONSENT } from "@/lib/analytics/consent";
import { TRACKING_TEST_TIME as now, approvedTestPolicy, grantedConsent, trackingContext, trackingTestEvent } from "./fixtures/tracking-policy";

function decision(policy: unknown = approvedTestPolicy(), overrides = {}) {
  return evaluateTrackingPolicy({ policy, channel: "browser", event: trackingTestEvent(), consent: grantedConsent(), context: trackingContext, now, ...overrides });
}

describe("tracking requires every explicit approval", () => {
  it("allows a strictly approved consented document and event", () => { expect(decision()).toEqual({ allowed: true, reason: "allowed" }); });
  it("defaults to denied and rejects malformed or unknown policy versions", () => {
    for (const policy of [undefined, {}, createDeniedTrackingPolicy(), { ...approvedTestPolicy(), policyVersion: "future" }, { ...approvedTestPolicy(), accidentalSecret: "never accept" }]) expect(decision(policy, { policy }).allowed).toBe(false);
  });
  it.each(["runtimeEnabled", "pixelEnabled", "isolationReady"] as const)("honors the %s switch independently", (key) => { expect(decision({ ...approvedTestPolicy(), [key]: false }).allowed).toBe(false); });
  it("requires separate hostnames rather than separate ports", () => {
    expect(hasTrackingIsolation({ isolationReady: true, storefrontOrigin: "https://shop.test:3000", commerceOrigin: "https://shop.test:3001" })).toBe(false);
    expect(hasTrackingIsolation({ isolationReady: true, storefrontOrigin: "https://public.test", commerceOrigin: "https://commerce.test" })).toBe(true);
  });
  it("does not let approval flags replace approval evidence, expiry or the approved source ID", () => {
    for (const change of [
      { business: { approved: true, reference: "", expiresAt: new Date(now + 10000).toISOString() } },
      { business: { approved: true, reference: "review", expiresAt: new Date(now).toISOString() } },
      { source: { ...approvedTestPolicy().source, pixelId: "123" } },
    ]) expect(decision({ ...approvedTestPolicy(), ...change }).allowed).toBe(false);
  });
  it.each(["unknown", "denied", "revoked"])("denies %s consent", (state) => { expect(decision(undefined, { consent: { ...grantedConsent(), state } }).allowed).toBe(false); });
  it("denies expired, future, overlong and stale-version consent", () => {
    const consent = grantedConsent();
    for (const change of [{ expiresAt: new Date(now).toISOString() }, { occurredAt: new Date(now + 1).toISOString() }, { expiresAt: new Date(now + 31 * 86400_000).toISOString() }, { policyVersion: "old" }]) expect(decision(undefined, { consent: { ...consent, ...change } }).allowed).toBe(false);
  });
  it.each(["?q=private", "?fbclid=unapproved", "#private"])("rejects real unapproved URL context %s", (suffix) => { expect(decision(undefined, { context: { ...trackingContext, url: trackingContext.url + suffix } }).allowed).toBe(false); });
  it("rejects private origin, unknown paths, content changes and metadata changes", () => {
    for (const change of [{ url: "https://commerce.example.test/en/products/example" }, { url: "https://public.example.test/en/checkout" }, { contentIds: ["OTHER"] }, { metadataFingerprint: "b".repeat(64) }, { classification: "sensitive" }]) expect(decision(undefined, { context: { ...trackingContext, ...change } }).allowed).toBe(false);
  });
  it("requires approval of each rendered content ID and an unambiguous route entry", () => {
    const policy = approvedTestPolicy();
    expect(decision({ ...policy, contents: [] }).allowed).toBe(false);
    expect(decision({ ...policy, contents: [{ ...policy.contents[0], classification: "restricted" }] }).allowed).toBe(false);
    expect(decision({ ...policy, routes: [...policy.routes, policy.routes[0]] }).allowed).toBe(false);
  });
  it("does not allow private referrers, even if put in a referrer allowlist", () => {
    const referrer = "https://commerce.example.test/en/orders/private-id";
    expect(decision({ ...approvedTestPolicy(), approvedReferrers: [referrer] }, { context: { ...trackingContext, referrer } }).allowed).toBe(false);
  });
  it("requires exact approved clean referrers", () => {
    const referrer = "https://public.example.test/en";
    expect(decision(undefined, { context: { ...trackingContext, referrer } }).allowed).toBe(false);
    expect(decision({ ...approvedTestPolicy(), approvedReferrers: [referrer] }, { context: { ...trackingContext, referrer } }).allowed).toBe(true);
  });
  it("rejects unapproved event payload fields and content IDs", () => {
    const policy = approvedTestPolicy();
    const narrow: TrackingRuntimePolicy = { ...policy, eventApprovals: policy.eventApprovals.map((entry) => ({ ...entry, fields: [] })) };
    expect(decision(narrow, { event: trackingTestEvent("ViewContent") }).allowed).toBe(false);
    const event = trackingTestEvent("ViewContent");
    if (event.name === "ViewContent") { event.parameters.content_ids = ["UNKNOWN"]; event.parameters.contents[0].id = "UNKNOWN"; }
    expect(decision(undefined, { event }).allowed).toBe(false);
  });
  it("never sends private conversions through the browser, even with general approvals", () => {
    expect(decision(undefined, { event: trackingTestEvent("Purchase") }).allowed).toBe(false);
    expect(decision(undefined, { channel: "server", event: trackingTestEvent("Purchase") }).allowed).toBe(true);
    expect(decision(undefined, { channel: "server", event: { ...trackingTestEvent("Purchase"), name: "OrderPlaced" } }).allowed).toBe(false);
  });
  it("does not replay an action that occurred before the consent grant", () => {
    expect(decision(undefined, { event: trackingTestEvent("PageView", now - 5000) })).toEqual({ allowed: false, reason: "pre_consent_event" });
  });
});

describe("strict first-party contracts", () => {
  it("rejects private fields, raw commerce objects and unsupported events", () => {
    const event = trackingTestEvent("Purchase");
    for (const value of [{ ...event, user: { email: "private@example.test" } }, { ...event, parameters: { ...event.parameters, customerEmail: "private@example.test" } }, { ...event, parameters: { ...event.parameters, content_name: "free text" } }, { ...event, name: "Search" }, { ...event, name: "AddPaymentInfo" }]) expect(parseTrackingEvent(value)).toBeNull();
  });
  it("requires opaque event identity, numeric major units and valid item totals", () => {
    const event = trackingTestEvent("ViewContent");
    expect(parseTrackingEvent(event)).toEqual(event);
    expect(parseTrackingEvent({ ...event, eventId: "purchase:private-order-id" })).toBeNull();
    expect(parseTrackingEvent({ ...event, parameters: { ...event.parameters, value: "125.50" } })).toBeNull();
    expect(parseTrackingEvent({ ...event, parameters: { ...event.parameters, value: 125.501 } })).toBeNull();
    expect(parseTrackingEvent({ ...event, parameters: { ...event.parameters, num_items: 2 } })).toBeNull();
  });
  it("parses unknown consent safely and requires a current grant", () => {
    expect(parseMarketingConsent({ accidental: "yes" })).toEqual(UNKNOWN_MARKETING_CONSENT);
    expect(isMarketingConsentGranted(grantedConsent(), "2026-11-10", now)).toBe(true);
    expect(isMarketingConsentGranted(grantedConsent(), "old", now)).toBe(false);
  });
});
