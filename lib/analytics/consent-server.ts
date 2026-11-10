import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveSurfaceRequestUrl } from "@/lib/security/surfaces";
import { CURRENT_TRACKING_POLICY_VERSION, MARKETING_CONSENT_COOKIE, UNKNOWN_MARKETING_CONSENT, isMarketingConsentGranted, parseMarketingConsent, type MarketingConsent } from "./consent";
import type { TrackingContext } from "./policy";
import type { TrackingMatchingField } from "./events";

export type StoredMarketingConsent = MarketingConsent & {
  id: string;
  origin: string;
  sourceUrl: string | null;
  matching: Partial<Record<TrackingMatchingField, string>> | null;
  context: TrackingContext | null;
};

export function hashMarketingConsentSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function newMarketingConsentSecret(): string {
  return randomBytes(32).toString("hex");
}

export function consentSecretFromRequest(request: Request): string | null {
  const req = request as NextRequest;
  const raw = req.cookies?.get(MARKETING_CONSENT_COOKIE)?.value ?? request.headers.get("cookie")?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${MARKETING_CONSENT_COOKIE}=`))?.slice(MARKETING_CONSENT_COOKIE.length + 1);
  return raw && /^[a-f0-9]{64}$/.test(raw) ? raw : null;
}

function serializeConsent(row: {
  id: string; state: string; policyVersion: string; occurredAt: Date; expiresAt: Date;
  origin: string; sourceUrl: string | null; matching: unknown; context: unknown;
}): StoredMarketingConsent {
  return {
    ...parseMarketingConsent({ state: row.state, policyVersion: row.policyVersion, occurredAt: row.occurredAt.toISOString(), expiresAt: row.expiresAt.toISOString() }),
    id: row.id, origin: row.origin, sourceUrl: row.sourceUrl,
    matching: row.matching as StoredMarketingConsent["matching"],
    context: row.context as TrackingContext | null,
  };
}

export async function findMarketingConsentById(id: string): Promise<StoredMarketingConsent | null> {
  try {
    const row = await prisma.marketingConsent.findUnique({ where: { id } });
    return row ? serializeConsent(row) : null;
  } catch { return null; }
}

export async function readMarketingConsent(request: Request): Promise<StoredMarketingConsent | null> {
  try {
    const requestUrl = resolveSurfaceRequestUrl(request);
    if (!requestUrl) return null;
    const secret = consentSecretFromRequest(request);
    if (!secret) return null;
    const row = await prisma.marketingConsent.findUnique({ where: { secretHash: hashMarketingConsentSecret(secret) } });
    // A copied cookie from another host must not authorize consent on this host.
    if (!row || row.origin !== new URL(requestUrl).origin) return null;
    return serializeConsent(row);
  } catch { return null; }
}

/** Checkout may use its own host-only consent; public consent is never transferred. */
export async function getMarketingConsentForCurrentRequest(): Promise<StoredMarketingConsent | null> {
  try {
    const jar = await cookies();
    const secret = jar.get(MARKETING_CONSENT_COOKIE)?.value;
    if (!secret || !/^[a-f0-9]{64}$/.test(secret)) return null;
    const row = await prisma.marketingConsent.findUnique({ where: { secretHash: hashMarketingConsentSecret(secret) } });
    if (!row) return null;
    // Commerce callers cannot inherit a consent recorded on the public origin.
    const configured = process.env.COMMERCE_ORIGIN;
    if (!configured || row.origin !== configured) return null;
    return serializeConsent(row);
  } catch { return null; }
}

/** A browser receives only state/timestamps, never bearer secrets or matching data. */
export function publicMarketingConsent(consent: MarketingConsent | null): MarketingConsent {
  if (!consent) return { ...UNKNOWN_MARKETING_CONSENT };
  const snapshot = { state: consent.state, policyVersion: consent.policyVersion, occurredAt: consent.occurredAt, expiresAt: consent.expiresAt };
  if (consent.state === "granted" && !isMarketingConsentGranted(snapshot, CURRENT_TRACKING_POLICY_VERSION)) return { ...UNKNOWN_MARKETING_CONSENT };
  return snapshot;
}
