import { z } from "zod";
import { CURRENT_TRACKING_POLICY_VERSION, isMarketingConsentGranted } from "./consent";
import { MATCHING_FIELDS, TRACKING_EVENT_NAMES, TRACKING_FIELDS, parseTrackingEvent, type TrackingEvent, type TrackingEventName } from "./events";

export { CURRENT_TRACKING_POLICY_VERSION } from "./consent";
export type TrackingChannel = "browser" | "server";
export type ContentClassification = "ordinary" | "sensitive" | "restricted" | "unknown";
const timestamp = z.string().datetime();
const approval = {
  approved: z.boolean(),
  reference: z.string().max(200),
  expiresAt: timestamp.nullable(),
};
const classification = z.enum(["ordinary", "sensitive", "restricted", "unknown"]);
const channel = z.enum(["browser", "server"]);
const origin = z.string().url().refine((value) => {
  try { return new URL(value).origin === value; } catch { return false; }
}, "Expected an exact origin");

export const trackingRuntimePolicySchema = z.object({
  policyVersion: z.string().max(80),
  environment: z.enum(["disabled", "production", "staging", "test"]),
  runtimeEnabled: z.boolean(),
  pixelEnabled: z.boolean(),
  capiEnabled: z.boolean(),
  pixelId: z.string().regex(/^\d+$/).nullable(),
  storefrontOrigin: origin.nullable(),
  commerceOrigin: origin.nullable(),
  isolationReady: z.boolean(),
  business: z.object(approval).strict(),
  source: z.object({ ...approval, pixelId: z.string().regex(/^\d+$/).nullable() }).strict(),
  routes: z.array(z.object({
    ...approval,
    pathname: z.string().min(1).max(2048).regex(/^\/(?!\/)[^?#]*$/),
    channels: z.array(channel).max(2),
    events: z.array(z.enum(TRACKING_EVENT_NAMES)).max(6),
    classification,
    contentIds: z.array(z.string().min(1).max(128)).max(500),
    metadataFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  }).strict()).max(2000),
  contents: z.array(z.object({ ...approval, id: z.string().min(1).max(128), classification }).strict()).max(10000),
  eventApprovals: z.array(z.object({ ...approval, name: z.enum(TRACKING_EVENT_NAMES), channels: z.array(channel).max(2), fields: z.array(z.enum(TRACKING_FIELDS)).max(6) }).strict()).max(6),
  approvedReferrers: z.array(z.string().url().max(2048)).max(100),
  matching: z.object({ ...approval, fields: z.array(z.enum(MATCHING_FIELDS)).max(3) }).strict(),
  codDefinition: z.literal("disabled"),
}).strict();
export type TrackingRuntimePolicy = z.infer<typeof trackingRuntimePolicySchema>;

export type TrackingContext = {
  /** Actual browser/source URL. Do not substitute or strip private context. */
  url: string;
  referrer: string;
  contentIds: readonly string[];
  classification: ContentClassification;
  /** Reviewed SHA256 of the actual document context, not a fabricated safe title. */
  metadataFingerprint: string;
};

const noApproval = () => ({ approved: false, reference: "", expiresAt: null });
export function createDeniedTrackingPolicy(): TrackingRuntimePolicy {
  return {
    policyVersion: CURRENT_TRACKING_POLICY_VERSION,
    environment: "disabled", runtimeEnabled: false, pixelEnabled: false, capiEnabled: false,
    pixelId: null, storefrontOrigin: null, commerceOrigin: null, isolationReady: false,
    business: noApproval(), source: { ...noApproval(), pixelId: null },
    routes: [], contents: [], eventApprovals: [], approvedReferrers: [],
    matching: { ...noApproval(), fields: [] }, codDefinition: "disabled",
  };
}

function approved(value: { approved: boolean; reference: string; expiresAt: string | null }, now: number): boolean {
  return value.approved && value.reference.trim().length > 0 && value.expiresAt !== null && Date.parse(value.expiresAt) > now;
}

export function hasTrackingIsolation(policy: Pick<TrackingRuntimePolicy, "storefrontOrigin" | "commerceOrigin" | "isolationReady">): boolean {
  if (!policy.isolationReady || !policy.storefrontOrigin || !policy.commerceOrigin) return false;
  try {
    const storefront = new URL(policy.storefrontOrigin);
    const commerce = new URL(policy.commerceOrigin);
    // Different ports do not isolate host-only cookies. Hostnames must differ.
    return storefront.hostname !== commerce.hostname && storefront.origin === policy.storefrontOrigin && commerce.origin === policy.commerceOrigin;
  } catch { return false; }
}

export type TrackingDecision = { allowed: true; reason: "allowed" } | { allowed: false; reason: string };

/** Checks whether collecting/using this truthful context is approved, without
 * inventing a business event or a monetary value just to test eligibility. */
export function evaluateTrackingContext(input: {
  policy: unknown;
  channel: TrackingChannel;
  eventName: TrackingEventName;
  consent: unknown;
  context: TrackingContext;
  now?: number;
}): TrackingDecision {
  const deny = (reason: string): TrackingDecision => ({ allowed: false, reason });
  const parsed = trackingRuntimePolicySchema.safeParse(input.policy);
  if (!parsed.success) return deny("invalid_policy");
  const policy = parsed.data;
  const now = input.now ?? Date.now();
  if (policy.policyVersion !== CURRENT_TRACKING_POLICY_VERSION) return deny("unknown_policy_version");
  if (!policy.runtimeEnabled || policy.environment === "disabled" || !(input.channel === "browser" ? policy.pixelEnabled : policy.capiEnabled)) return deny("delivery_disabled");
  if (!hasTrackingIsolation(policy)) return deny("isolation_required");
  if (!policy.pixelId || !approved(policy.business, now) || !approved(policy.source, now) || policy.source.pixelId !== policy.pixelId) return deny("source_not_approved");
  if (!isMarketingConsentGranted(input.consent, policy.policyVersion, now)) return deny("consent_required");
  if (input.eventName === "OrderPlaced") return deny("internal_event");
  if (input.channel === "browser" && (input.eventName === "Purchase" || input.eventName === "InitiateCheckout")) return deny("private_conversion");
  let url: URL;
  try { url = new URL(input.context.url); } catch { return deny("invalid_context"); }
  if (url.username || url.password || url.search || url.hash || ![policy.storefrontOrigin, ...(input.channel === "server" ? [policy.commerceOrigin] : [])].includes(url.origin)) return deny("unapproved_url");
  if (input.context.referrer) {
    try {
      const referrer = new URL(input.context.referrer);
      if (referrer.search || referrer.hash || referrer.username || referrer.password || !policy.approvedReferrers.includes(input.context.referrer)) return deny("unapproved_referrer");
      if (referrer.origin === policy.commerceOrigin) return deny("private_referrer");
    } catch { return deny("unapproved_referrer"); }
  }
  if (input.context.classification !== "ordinary") return deny("content_not_eligible");
  const routes = policy.routes.filter((entry) => entry.pathname === url.pathname && entry.channels.includes(input.channel));
  if (routes.length !== 1) return deny("route_not_approved");
  const route = routes[0];
  if (!approved(route, now) || route.classification !== "ordinary" || !route.events.includes(input.eventName) || route.metadataFingerprint !== input.context.metadataFingerprint) return deny("route_not_approved");
  const ids = [...input.context.contentIds];
  if (new Set(ids).size !== ids.length || ids.length !== route.contentIds.length || route.contentIds.some((id) => !ids.includes(id))) return deny("content_manifest_mismatch");
  for (const id of ids) {
    const entries = policy.contents.filter((entry) => entry.id === id);
    if (entries.length !== 1 || entries[0].classification !== "ordinary" || !approved(entries[0], now)) return deny("content_not_approved");
  }
  const eventApprovals = policy.eventApprovals.filter((entry) => entry.name === input.eventName && entry.channels.includes(input.channel));
  if (eventApprovals.length !== 1 || !approved(eventApprovals[0], now)) return deny("event_not_approved");
  return { allowed: true, reason: "allowed" };
}

export function evaluateTrackingPolicy(input: {
  policy: unknown;
  channel: TrackingChannel;
  event: unknown;
  consent: unknown;
  context: TrackingContext;
  now?: number;
}): TrackingDecision {
  const event = parseTrackingEvent(input.event);
  const now = input.now ?? Date.now();
  if (!event || event.eventTime * 1000 > now + 300_000 || event.eventTime * 1000 < now - 7 * 86400_000) return { allowed: false, reason: "invalid_event" };
  const decision = evaluateTrackingContext({ ...input, eventName: event.name });
  if (!decision.allowed) return decision;
  const consent = input.consent as { occurredAt: string };
  if (event.eventTime < Math.floor(Date.parse(consent.occurredAt) / 1000)) return { allowed: false, reason: "pre_consent_event" };
  // Context evaluation has already validated the full strict policy schema.
  const policy = input.policy as TrackingRuntimePolicy;
  const payloadIds = "content_ids" in event.parameters ? event.parameters.content_ids ?? [] : [];
  if (payloadIds.some((id) => !input.context.contentIds.includes(id))) return { allowed: false, reason: "unapproved_payload_content" };
  const approval = policy.eventApprovals.find((entry) => entry.name === event.name && entry.channels.includes(input.channel))!;
  if (Object.keys(event.parameters).some((field) => !approval.fields.includes(field as never))) return { allowed: false, reason: "field_not_approved" };
  return { allowed: true, reason: "allowed" };
}

export function approvedMatchingFields(policy: TrackingRuntimePolicy, now = Date.now()): readonly (typeof MATCHING_FIELDS)[number][] {
  return policy.policyVersion === CURRENT_TRACKING_POLICY_VERSION && approved(policy.matching, now) ? policy.matching.fields : [];
}

/** Useful for adapter type annotations without exposing a raw commerce model. */
export type ApprovedTrackingEvent = TrackingEvent;
