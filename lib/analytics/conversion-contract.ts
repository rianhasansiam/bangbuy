import { z } from "zod";

// This is an internal monetary/context projection, not a serialized Order or
// request. Product references are evaluated by policy; they are not exported.
export const conversionSnapshotSchema = z.object({
  value: z.number().finite().positive().refine((value) =>
    Number.isSafeInteger(Math.round(value * 100)) && Math.abs(value * 100 - Math.round(value * 100)) < 0.000001),
  currency: z.enum(["BDT", "AUD", "EUR", "GBP", "USD", "CNY"]),
  contentIds: z.array(z.string().min(1).max(128)).max(100),
}).strict();

export type ConversionSnapshot = z.infer<typeof conversionSnapshotSchema>;
export type ConversionName = "InitiateCheckout" | "Purchase";
export type OutboxState = "INTERNAL" | "PENDING" | "PROCESSING" | "RETRY" |
  "DELIVERED" | "SUPPRESSED" | "BLOCKED" | "EXPIRED" | "DEAD_LETTER";

export const permittedMatchingSchema = z.object({
  fbp: z.string().regex(/^fb\.\d\.\d{13}\.\d{1,100}$/).optional(),
  fbc: z.string().regex(/^fb\.\d\.\d{13}\.[A-Za-z0-9._~-]{1,500}$/).optional(),
  client_user_agent: z.string().min(1).max(512).regex(/^[^\r\n\u0000]+$/).optional(),
}).strict();
export type PermittedMatching = z.infer<typeof permittedMatchingSchema>;

export type ConversionConsent = {
  id: string;
  state: string;
  policyVersion: string;
  occurredAt: Date;
  expiresAt: Date;
  origin: string;
  sourceUrl: string | null;
  matching: unknown;
  context?: unknown;
};

export type ClaimedConversion = {
  id: string;
  eventName: string;
  occurredAt: Date;
  payload: unknown;
  consentId: string | null;
  policyVersion: string;
  sourceUrl: string | null;
  matching: unknown;
  context?: unknown;
  attempts: number;
  expiresAt: Date;
  lockToken: string;
};

/** No order IDs, contacts, IP addresses or arbitrary payload fields. */
export function buildCapiProjection(input: {
  record: ClaimedConversion;
  approvedMatchingFields: readonly string[];
  now?: Date;
}): { allowed: true; event: {
  event_id: string;
  event_name: ConversionName;
  event_time: number;
  action_source: "website";
  event_source_url: string;
  user_data: PermittedMatching;
  custom_data: { value: number; currency: string };
} } | { allowed: false; reason: string } {
  const { record } = input;
  const now = input.now ?? new Date();
  if (!z.uuid().safeParse(record.id).success) return { allowed: false, reason: "INVALID_EVENT_ID" };
  if (!["Purchase", "InitiateCheckout"].includes(record.eventName)) return { allowed: false, reason: "UNAPPROVED_EVENT" };
  const at = record.occurredAt.getTime();
  if (!Number.isFinite(at) || at > now.getTime() + 300_000 || now.getTime() - at >= 7 * 86_400_000) {
    return { allowed: false, reason: "INVALID_EVENT_TIME" };
  }
  const snapshot = conversionSnapshotSchema.safeParse(record.payload);
  if (!snapshot.success) return { allowed: false, reason: "INVALID_SNAPSHOT" };
  let url: URL;
  try {
    url = new URL(record.sourceUrl ?? "");
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      return { allowed: false, reason: "UNSAFE_SOURCE_URL" };
    }
  } catch { return { allowed: false, reason: "MISSING_SOURCE_URL" }; }
  const matching = permittedMatchingSchema.safeParse(record.matching);
  if (!matching.success) return { allowed: false, reason: "INVALID_MATCHING" };
  const fields = Object.keys(matching.data);
  if (fields.some((key) => !input.approvedMatchingFields.includes(key))) return { allowed: false, reason: "MATCHING_NOT_APPROVED" };
  if (!matching.data.client_user_agent || (!matching.data.fbp && !matching.data.fbc)) {
    return { allowed: false, reason: "REQUIRED_MATCHING_ABSENT" };
  }
  return { allowed: true, event: {
    event_id: record.id,
    event_name: record.eventName as ConversionName,
    event_time: Math.floor(at / 1000),
    action_source: "website",
    event_source_url: record.sourceUrl!,
    user_data: matching.data,
    custom_data: { value: snapshot.data.value, currency: snapshot.data.currency },
  } };
}
