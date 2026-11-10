import { z } from "zod";

export const CURRENT_TRACKING_POLICY_VERSION = "2026-11-10" as const;
export const MARKETING_CONSENT_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
export const MARKETING_CONSENT_COOKIE = "bangbuy-marketing-consent";
export const CONSENT_STATES = ["unknown", "granted", "denied", "revoked"] as const;
export type MarketingConsentState = (typeof CONSENT_STATES)[number];

export const marketingConsentSchema = z.object({
  state: z.enum(CONSENT_STATES),
  policyVersion: z.string().min(1).max(80),
  occurredAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
}).strict();
export type MarketingConsent = z.infer<typeof marketingConsentSchema>;

export const UNKNOWN_MARKETING_CONSENT: Readonly<MarketingConsent> = Object.freeze({
  state: "unknown", policyVersion: CURRENT_TRACKING_POLICY_VERSION, occurredAt: null, expiresAt: null,
});

export const marketingConsentChangeSchema = z.object({
  state: z.enum(["granted", "denied", "revoked"]),
  policyVersion: z.literal(CURRENT_TRACKING_POLICY_VERSION),
}).strict();

export function parseMarketingConsent(value: unknown): MarketingConsent {
  const result = marketingConsentSchema.safeParse(value);
  return result.success ? result.data : { ...UNKNOWN_MARKETING_CONSENT };
}

export function isMarketingConsentGranted(value: unknown, policyVersion: string, now = Date.now()): boolean {
  const result = marketingConsentSchema.safeParse(value);
  if (!result.success) return false;
  const consent = result.data;
  if (consent.state !== "granted" || consent.policyVersion !== CURRENT_TRACKING_POLICY_VERSION || consent.policyVersion !== policyVersion || !consent.occurredAt || !consent.expiresAt) return false;
  const occurredAt = Date.parse(consent.occurredAt);
  const expiresAt = Date.parse(consent.expiresAt);
  return occurredAt <= now && expiresAt > now && expiresAt > occurredAt && expiresAt - occurredAt <= MARKETING_CONSENT_MAX_AGE_SECONDS * 1000;
}
