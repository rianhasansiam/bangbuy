import { z } from "zod";
import { approvedMatchingFields, evaluateTrackingPolicy, type TrackingRuntimePolicy } from "./policy";
import { buildCapiProjection, conversionSnapshotSchema, type ClaimedConversion, type ConversionConsent } from "./conversion-contract";

const contextSchema = z.object({
  url: z.string().url(),
  referrer: z.string(),
  contentIds: z.array(z.string().min(1).max(128)).max(100),
  classification: z.enum(["ordinary", "sensitive", "restricted", "unknown"]),
  metadataFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

/** Used at enqueue and immediately before delivery; retries cannot bypass it. */
export function assessConversion(input: {
  record: ClaimedConversion;
  consent: ConversionConsent | null;
  policy: TrackingRuntimePolicy;
  now?: Date;
}) {
  const { record, consent, policy } = input;
  const now = input.now ?? new Date();
  const denied = (reason: string) => ({ allowed: false as const, reason });
  if (!consent || consent.id !== record.consentId || consent.state !== "granted") return denied("CONSENT_REQUIRED");
  if (record.policyVersion !== consent.policyVersion || record.policyVersion !== policy.policyVersion) return denied("POLICY_CHANGED");
  if (consent.occurredAt.getTime() > record.occurredAt.getTime() || consent.expiresAt.getTime() <= now.getTime()) return denied("CONSENT_EXPIRED_OR_REPLACED");
  if (record.expiresAt.getTime() <= now.getTime()) return denied("EVENT_EXPIRED");
  const context = contextSchema.safeParse(record.context);
  const snapshot = conversionSnapshotSchema.safeParse(record.payload);
  if (!context.success || !snapshot.success || record.sourceUrl !== context.data.url || consent.sourceUrl !== record.sourceUrl) return denied("SOURCE_CONTEXT_REQUIRED");
  if (new URL(context.data.url).origin !== consent.origin) return denied("CONSENT_ORIGIN_MISMATCH");
  if (JSON.stringify(consent.context) !== JSON.stringify(record.context) || JSON.stringify(consent.matching) !== JSON.stringify(record.matching)) return denied("CONSENT_CONTEXT_CHANGED");
  if (context.data.contentIds.length !== snapshot.data.contentIds.length || snapshot.data.contentIds.some((id) => !context.data.contentIds.includes(id))) return denied("PURCHASE_CONTENT_MISMATCH");
  const projection = buildCapiProjection({ record, approvedMatchingFields: approvedMatchingFields(policy, now.getTime()), now });
  if (!projection.allowed) return denied(projection.reason);
  const decision = evaluateTrackingPolicy({
    policy,
    channel: "server",
    consent: {
      state: consent.state,
      policyVersion: consent.policyVersion,
      occurredAt: consent.occurredAt.toISOString(),
      expiresAt: consent.expiresAt.toISOString(),
    },
    event: {
      name: record.eventName,
      eventId: record.id,
      eventTime: Math.floor(record.occurredAt.getTime() / 1000),
      parameters: projection.event.custom_data,
    },
    context: context.data,
    now: now.getTime(),
  });
  return decision.allowed ? { allowed: true as const, event: projection.event } : denied(decision.reason.toUpperCase());
}
