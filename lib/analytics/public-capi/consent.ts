import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { PUBLIC_CAPI_POLICY_VERSION, type PublicCapiConsent } from "./types";

export const PUBLIC_CAPI_CONSENT_COOKIE = "bangbuy-public-capi-consent";
export const PUBLIC_CAPI_CONSENT_MAX_AGE = 30 * 24 * 60 * 60;
const MAX_ACTIVE_GRANTS = 10_000;
const payloadSchema = z.object({
  state: z.enum(["granted", "denied", "revoked"]), policyVersion: z.literal(PUBLIC_CAPI_POLICY_VERSION),
  occurredAt: z.string().datetime(), expiresAt: z.string().datetime(), origin: z.string().max(256), nonce: z.string().regex(/^[a-f0-9]{32}$/),
}).strict();
type ConsentPayload = z.infer<typeof payloadSchema>;
export const unknownPublicCapiConsent = (): PublicCapiConsent => ({ state: "unknown", policyVersion: PUBLIC_CAPI_POLICY_VERSION, occurredAt: null, expiresAt: null });
export function consentTokenFromRequest(request: Request): string | null {
  const matches = (request.headers.get("cookie") ?? "").split(";").map(entry => entry.trim()).filter(entry => entry.startsWith(`${PUBLIC_CAPI_CONSENT_COOKIE}=`));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(PUBLIC_CAPI_CONSENT_COOKIE.length + 1);
  return token.length <= 2048 && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token) ? token : null;
}
export function consentTokenDigest(token: string): string { return createHash("sha256").update(token).digest("hex"); }
const signature = (payload: string, secret: string) => createHmac("sha256", secret).update(`bangbuy-public-capi-v1:${payload}`).digest();

/** The necessary-consent nonce never leaves this first-party cookie or reaches Meta. */
export function createPublicCapiConsentStore() {
  const active = new Map<string, number>();
  function expire(now: number) { for (const [key, expiry] of active) if (expiry <= now) active.delete(key); }
  function read(request: Request, origin: string | null, secret: string | null, now: number): PublicCapiConsent {
    const token = consentTokenFromRequest(request);
    if (!token || !origin || !secret) return unknownPublicCapiConsent();
    try {
      const [encoded, encodedSignature] = token.split(".");
      const actualSignature = Buffer.from(encodedSignature, "base64url");
      const expectedSignature = signature(encoded, secret);
      if (actualSignature.toString("base64url") !== encodedSignature || actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return unknownPublicCapiConsent();
      const decoded = Buffer.from(encoded, "base64url");
      if (decoded.toString("base64url") !== encoded) return unknownPublicCapiConsent();
      const parsed = payloadSchema.safeParse(JSON.parse(decoded.toString("utf8")));
      if (!parsed.success) return unknownPublicCapiConsent();
      const payload = parsed.data;
      const occurred = Date.parse(payload.occurredAt), expiry = Date.parse(payload.expiresAt);
      if (payload.origin !== origin || occurred > now || expiry <= now || expiry - occurred !== PUBLIC_CAPI_CONSENT_MAX_AGE * 1000) return unknownPublicCapiConsent();
      if (payload.state === "granted" && (active.get(consentTokenDigest(token)) ?? 0) <= now) return unknownPublicCapiConsent();
      return { state: payload.state, policyVersion: payload.policyVersion, occurredAt: payload.occurredAt, expiresAt: payload.expiresAt };
    } catch { return unknownPublicCapiConsent(); }
  }
  function replace(request: Request, state: ConsentPayload["state"], origin: string, secret: string, now: number): string {
    const former = consentTokenFromRequest(request);
    if (former) active.delete(consentTokenDigest(former));
    expire(now);
    const payload: ConsentPayload = {
      state, policyVersion: PUBLIC_CAPI_POLICY_VERSION, occurredAt: new Date(now).toISOString(), expiresAt: new Date(now + PUBLIC_CAPI_CONSENT_MAX_AGE * 1000).toISOString(), origin, nonce: randomBytes(16).toString("hex"),
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const token = `${encoded}.${signature(encoded, secret).toString("base64url")}`;
    if (state === "granted") {
      if (active.size >= MAX_ACTIVE_GRANTS) active.delete(active.keys().next().value!);
      active.set(consentTokenDigest(token), now + PUBLIC_CAPI_CONSENT_MAX_AGE * 1000);
    }
    return token;
  }
  return { read, replace };
}
