/** Safe first-party interface. This module contains no server configuration. */
export const PUBLIC_CAPI_POLICY_VERSION = "2026-11-11-public-capi-v1" as const;
export type PublicCapiConsentState = "unknown" | "granted" | "denied" | "revoked";
export type PublicCapiConsent = {
  state: PublicCapiConsentState;
  policyVersion: typeof PUBLIC_CAPI_POLICY_VERSION;
  occurredAt: string | null;
  expiresAt: string | null;
};
export type PublicCapiSnapshot = {
  policy: { enabled: boolean; policyVersion: typeof PUBLIC_CAPI_POLICY_VERSION; eligiblePaths: string[] };
  consent: PublicCapiConsent;
};
