import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { rateLimitPersistent, getClientIp } from "@/lib/auth/rate-limit";
import { resolveSurfaceRequestUrl } from "@/lib/security/surfaces";
import { requireUser } from "@/lib/api/guards";
import { CURRENT_TRACKING_POLICY_VERSION, MARKETING_CONSENT_COOKIE, MARKETING_CONSENT_MAX_AGE_SECONDS, marketingConsentChangeSchema } from "./consent";
import { getTrackingRuntimePolicy } from "./config";
import { approvedMatchingFields, evaluateTrackingContext, type TrackingContext } from "./policy";
import { permittedMatchingSchema } from "./conversion-contract";
import { consentSecretFromRequest, hashMarketingConsentSecret, newMarketingConsentSecret, publicMarketingConsent, readMarketingConsent } from "./consent-server";
import type { NextRequest } from "next/server";

const contextSchema = z.object({
  url: z.string().url().max(2048), referrer: z.string().max(2048),
  contentIds: z.array(z.string().min(1).max(128)).max(500),
  classification: z.enum(["ordinary", "sensitive", "restricted", "unknown"]),
  metadataFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export const marketingConsentRequestSchema = marketingConsentChangeSchema.extend({ context: contextSchema.optional(), matching: permittedMatchingSchema.optional() }).strict();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "Vary": "Cookie" } });
}

export async function GET(request: NextRequest) {
  return json({ consent: publicMarketingConsent(await readMarketingConsent(request)) });
}

function approvedContext(request: Request, context: TrackingContext | undefined): boolean {
  const requestUrl = resolveSurfaceRequestUrl(request);
  if (!context || !requestUrl || new URL(context.url).origin !== new URL(requestUrl).origin) return false;
  const referrer = request.headers.get("referer");
  // Private documents use no-referrer. Their same-origin fetch still supplies
  // Sec-Fetch-Site; an explicit differing Referer can never be papered over.
  if (referrer ? referrer !== context.url : request.headers.get("sec-fetch-site") !== "same-origin") return false;
  const policy = getTrackingRuntimePolicy();
  // Context collection is itself optional marketing data. Require a real approved
  // server event and every route/content gate; this check sends no event.
  const now = Date.now();
  const consent = { state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, occurredAt: new Date(now).toISOString(), expiresAt: new Date(now + MARKETING_CONSENT_MAX_AGE_SECONDS * 1000).toISOString() };
  return policy.eventApprovals.some((entry) => {
    if (entry.name !== "Purchase" && entry.name !== "InitiateCheckout") return false;
    return evaluateTrackingContext({ policy, channel: "server", consent, context, eventName: entry.name, now }).allowed;
  });
}

export async function POST(request: NextRequest) {
  const requestUrl = resolveSurfaceRequestUrl(request);
  const origin = request.headers.get("origin");
  if (!requestUrl || origin !== new URL(requestUrl).origin || request.headers.get("sec-fetch-site") === "cross-site") return json({ error: "Request origin is not allowed." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return json({ error: "Content-Type must be application/json." }, 415);
  let value: unknown;
  try {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > 16 * 1024) return json({ error: "Consent request is too large." }, 413);
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return json({ error: "Invalid consent request." }, 400); }
  const parsed = marketingConsentRequestSchema.safeParse(value);
  if (!parsed.success) return json({ error: "Invalid consent choice or policy version." }, 400);
  const body = parsed.data;
  if (body.state !== "granted" && (body.context || body.matching)) return json({ error: "Optional marketing data requires explicit consent." }, 400);
  if ((body.context || body.matching) && !approvedContext(request, body.context)) return json({ error: "Marketing context is not approved." }, 400);
  const policy = getTrackingRuntimePolicy();
  if ((body.context || body.matching) && origin === policy.commerceOrigin) {
    // Guest checkout details are restricted to fulfillment/support by the
    // existing privacy contract. Generic marketing consent cannot override it.
    const account = await requireUser();
    if (!account.ok) return json({ error: "Guest checkout context is unavailable for marketing." }, 400);
  }
  const permitted = approvedMatchingFields(policy);
  if (body.matching && Object.keys(body.matching).some((field) => !permitted.includes(field as never))) return json({ error: "Matching fields are not approved." }, 400);
  if (body.matching?.client_user_agent && body.matching.client_user_agent !== request.headers.get("user-agent")) return json({ error: "Matching context must describe this browser." }, 400);
  try {
    const limit = await rateLimitPersistent(`marketing-consent:${getClientIp(request)}`, 30, 60_000);
    if (!limit.allowed) return json({ error: "Too many consent requests." }, 429);
    const oldSecret = consentSecretFromRequest(request);
    const newSecret = newMarketingConsentSecret();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + MARKETING_CONSENT_MAX_AGE_SECONDS * 1000);
    const row = await prisma.$transaction(async (tx) => {
      if (oldSecret) {
        const existing = await tx.marketingConsent.findUnique({ where: { secretHash: hashMarketingConsentSecret(oldSecret) } });
        if (existing && existing.origin === origin) {
          // Every explicit choice closes the former grant. A later grant has a
          // new identity and can never revive deliveries suppressed by withdrawal.
          await tx.marketingConsent.update({ where: { id: existing.id }, data: { state: body.state === "denied" ? "denied" : "revoked", occurredAt: now } });
          await tx.marketingConversionOutbox.updateMany({ where: { consentId: existing.id, state: { in: ["PENDING", "RETRY", "PROCESSING"] } }, data: { state: "SUPPRESSED", lastFailureCode: "CONSENT_CHANGED", lockedAt: null, lockToken: null } });
        }
      }
      return tx.marketingConsent.create({ data: {
        secretHash: hashMarketingConsentSecret(newSecret), state: body.state,
        policyVersion: CURRENT_TRACKING_POLICY_VERSION, occurredAt: now, expiresAt, origin,
        sourceUrl: body.context?.url ?? null,
        ...(body.context ? { context: body.context as unknown as Prisma.InputJsonValue } : {}),
        ...(body.matching ? { matching: body.matching as Prisma.InputJsonValue } : {}),
      } });
    });
    const response = json({ consent: { state: row.state, policyVersion: row.policyVersion, occurredAt: row.occurredAt.toISOString(), expiresAt: row.expiresAt.toISOString() } });
    response.cookies.set(MARKETING_CONSENT_COOKIE, newSecret, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: MARKETING_CONSENT_MAX_AGE_SECONDS });
    return response;
  } catch {
    // A failed consent write never falls back to permission in local storage.
    return json({ error: "Consent could not be saved. Marketing remains disabled." }, 503);
  }
}
