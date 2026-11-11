import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { approvedPublicCapiSource, eligiblePublicCapiPaths, getPublicCapiRuntime, publicCapiRequestOrigin, type PublicCapiEnvironment } from "./policy";
import { consentTokenDigest, consentTokenFromRequest, createPublicCapiConsentStore, PUBLIC_CAPI_CONSENT_COOKIE, PUBLIC_CAPI_CONSENT_MAX_AGE } from "./consent";
import { PUBLIC_CAPI_POLICY_VERSION, type PublicCapiSnapshot } from "./types";
import { approvedClientAddress } from "./client-address";

const consentChangeSchema = z.object({ state: z.enum(["granted", "denied", "revoked"]), policyVersion: z.literal(PUBLIC_CAPI_POLICY_VERSION) }).strict();
const eventSchema = z.object({ eventId: z.uuid(), name: z.literal("PageView"), sourceUrl: z.string().min(1).max(2048) }).strict();
const responseHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", Vary: "Cookie" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: responseHeaders });
const ignored = () => new Response(null, { status: 204, headers: responseHeaders });

/** Bounded streaming prevents a missing or false Content-Length from bypassing limits. */
async function boundedJson(request: Pick<Request, "headers" | "body">, maximum: number): Promise<{ value: unknown } | { status: number }> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return { status: 415 };
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maximum)) return { status: 413 };
  const reader = request.body?.getReader();
  if (!reader) return { status: 400 };
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > maximum) { await reader.cancel(); return { status: 413 }; }
      chunks.push(chunk.value);
    }
    return { value: JSON.parse(Buffer.concat(chunks, total).toString("utf8")) };
  } catch { return { status: 400 }; }
}

function sameOrigin(request: Request, origin: string | null): boolean {
  return origin !== null && request.headers.get("origin") === origin && request.headers.get("sec-fetch-site") !== "cross-site";
}

export type PublicCapiDeliveryReport = {
  eventName: "PageView";
  eventId: string;
  outcome: "ack" | "http_error" | "invalid_ack" | "network_error";
  providerStatus?: number;
  providerCode?: number;
  providerSubcode?: number;
};
type Dependencies = { environment?: () => PublicCapiEnvironment; now?: () => number; send?: typeof fetch; report?: (report: PublicCapiDeliveryReport) => void };
type Deduplication = { state: "pending" | "accepted" | "failed"; expiresAt: number; sourceDigest: string };

function providerErrorNumbers(value: unknown): Pick<PublicCapiDeliveryReport, "providerCode" | "providerSubcode"> {
  if (!value || typeof value !== "object") return {};
  const error = (value as { error?: unknown }).error;
  if (!error || typeof error !== "object") return {};
  const { code, error_subcode: subcode } = error as { code?: unknown; error_subcode?: unknown };
  const numeric = (number: unknown): number is number => typeof number === "number" && Number.isSafeInteger(number) && number >= 0 && number <= 2_147_483_647;
  return { ...(numeric(code) ? { providerCode: code } : {}), ...(numeric(subcode) ? { providerSubcode: subcode } : {}) };
}

/** One process owns this channel. Restart or consent-cache eviction fails closed. */
export function createPublicCapiService(dependencies: Dependencies = {}) {
  const environment = dependencies.environment ?? (() => process.env);
  const now = dependencies.now ?? Date.now;
  const send = dependencies.send ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const reporter = dependencies.report ?? ((report: PublicCapiDeliveryReport) => {
    if (report.outcome === "ack") console.info(JSON.stringify(report));
    else console.warn(JSON.stringify(report));
  });
  const report = (value: PublicCapiDeliveryReport) => { try { reporter(value); } catch { /* Reporting never changes delivery or commerce behavior. */ } };
  const consents = createPublicCapiConsentStore();
  const events = new Map<string, Deduplication>();
  const grantRates = new Map<string, { count: number; until: number }>();
  let consentRate = { count: 0, until: 0 }, eventRate = { count: 0, until: 0 };

  function rateAllowed(kind: "consent" | "event", at: number): boolean {
    let rate = kind === "consent" ? consentRate : eventRate;
    if (rate.until <= at) {
      rate = { count: 0, until: at + 60_000 };
      if (kind === "consent") consentRate = rate; else eventRate = rate;
    }
    rate.count += 1;
    return rate.count <= (kind === "consent" ? 100 : 500);
  }
  function grantRateAllowed(key: string, at: number): boolean {
    for (const [entry, rate] of grantRates) if (rate.until <= at) grantRates.delete(entry);
    const rate = grantRates.get(key) ?? { count: 0, until: at + 60_000 };
    if (!grantRates.has(key) && grantRates.size >= 10_000) return false;
    rate.count += 1; grantRates.set(key, rate);
    return rate.count <= 30;
  }
  function snapshot(request: Request): PublicCapiSnapshot {
    const at = now(), runtime = getPublicCapiRuntime(environment(), at);
    const origin = publicCapiRequestOrigin(request, runtime);
    return {
      policy: { enabled: Boolean(origin && runtime.enabled), policyVersion: PUBLIC_CAPI_POLICY_VERSION, eligiblePaths: origin ? eligiblePublicCapiPaths(runtime, at) : [] },
      consent: consents.read(request, origin, runtime.consentSecret, at),
    };
  }
  async function consentGET(request: Request) { return json(snapshot(request)); }
  async function consentPOST(request: Request) {
    const at = now(), runtime = getPublicCapiRuntime(environment(), at);
    const origin = publicCapiRequestOrigin(request, runtime);
    if (!sameOrigin(request, origin)) return json({ error: "Request origin is not allowed." }, 403);
    const body = await boundedJson(request, 1024);
    if ("status" in body) return json({ error: "Invalid consent request." }, body.status);
    const parsed = consentChangeSchema.safeParse(body.value);
    if (!parsed.success) return json({ error: "Invalid consent request." }, 400);
    if (!runtime.consentSecret || !origin) return json({ error: "Consent service is unavailable." }, 503);
    // Withdrawal creates no active grant and must remain available when the
    // process-wide budget for creating new grants has been exhausted.
    if (parsed.data.state === "granted" && !rateAllowed("consent", at)) return json({ error: "Too many requests." }, 429);
    // A runtime stop cannot prevent a customer from withdrawing consent.
    if (parsed.data.state === "granted" && !runtime.enabled) return ignored();
    const token = consents.replace(request, parsed.data.state, origin, runtime.consentSecret, at);
    const updatedHeaders = new Headers(request.headers);
    updatedHeaders.set("cookie", `${PUBLIC_CAPI_CONSENT_COOKIE}=${token}`);
    const updatedRequest = new Request(request.url, { headers: updatedHeaders });
    const response = json(snapshot(updatedRequest));
    response.headers.set("Set-Cookie", `${PUBLIC_CAPI_CONSENT_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${PUBLIC_CAPI_CONSENT_MAX_AGE}${origin.startsWith("https:") ? "; Secure" : ""}`);
    return response;
  }
  async function eventPOST(request: Request) {
    const at = now(), runtime = getPublicCapiRuntime(environment(), at);
    const origin = publicCapiRequestOrigin(request, runtime);
    if (!sameOrigin(request, origin)) return json({ error: "Request origin is not allowed." }, 403);
    if (!runtime.enabled) return ignored();
    const body = await boundedJson(request, 4096);
    if ("status" in body) return json({ error: "Invalid event request." }, body.status);
    const parsed = eventSchema.safeParse(body.value);
    if (!parsed.success) return json({ error: "Invalid event request." }, 400);
    if (!origin || !approvedPublicCapiSource(parsed.data.sourceUrl, origin, runtime, at)) return ignored();
    const referrer = request.headers.get("referer");
    if (referrer ? referrer !== parsed.data.sourceUrl : request.headers.get("sec-fetch-site") !== "same-origin") return json({ error: "Source context is not allowed." }, 403);
    const consent = consents.read(request, origin, runtime.consentSecret, at);
    if (consent.state !== "granted") return ignored();
    const agent = request.headers.get("user-agent");
    if (!agent || agent.length > 1024 || /[\u0000-\u001f\u007f]/.test(agent)) return json({ error: "Browser context is unavailable." }, 400);
    const address = approvedClientAddress(request, runtime.environment === "test" && environment().NODE_ENV !== "production");
    if (!address) return json({ error: "Browser context is unavailable." }, 400);
    const token = consentTokenFromRequest(request);
    if (!token) return ignored();
    const grant = consentTokenDigest(token), key = `${grant}:${parsed.data.eventId}`;
    const sourceDigest = createHash("sha256").update(parsed.data.sourceUrl).digest("hex");
    for (const [entry, record] of events) if (record.expiresAt <= at) events.delete(entry);
    const former = events.get(key);
    if (former) {
      if (former.sourceDigest !== sourceDigest) return json({ error: "Event identity is already in use." }, 409);
      return former.state === "accepted" ? json({ accepted: true }, 202) : former.state === "pending" ? ignored() : json({ error: "Event service is unavailable." }, 503);
    }
    if (!rateAllowed("event", at) || !grantRateAllowed(grant, at) || events.size >= 20_000) return json({ error: "Too many requests." }, 429);
    const record: Deduplication = { state: "pending", expiresAt: at + 60 * 60_000, sourceDigest };
    events.set(key, record);
    // Re-read the policy and active grant immediately before external I/O.
    const latestAt = now(), latest = getPublicCapiRuntime(environment(), latestAt);
    if (publicCapiRequestOrigin(request, latest) !== origin || !approvedPublicCapiSource(parsed.data.sourceUrl, origin, latest, latestAt) || consents.read(request, origin, latest.consentSecret, latestAt).state !== "granted") { events.delete(key); return ignored(); }
    try {
      const response = await send(`https://graph.facebook.com/${latest.graphVersion}/${latest.pixelId}/events`, {
        method: "POST", headers: { Authorization: `Bearer ${latest.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ data: [{ event_name: "PageView", event_time: Math.floor(at / 1000), event_id: parsed.data.eventId, action_source: "website", event_source_url: parsed.data.sourceUrl, user_data: { client_ip_address: address, client_user_agent: agent } }], ...(latest.testEventCode ? { test_event_code: latest.testEventCode } : {}) }),
        signal: AbortSignal.timeout(5000), cache: "no-store", credentials: "omit", redirect: "error",
      });
      const acknowledgement = await boundedJson(response, 8192);
      const result = "value" in acknowledgement ? acknowledgement.value : null;
      if (!response.ok) {
        record.state = "failed";
        report({ eventName: "PageView", eventId: parsed.data.eventId, outcome: "http_error", providerStatus: response.status, ...providerErrorNumbers(result) });
        return json({ error: "Event service is unavailable." }, 503);
      }
      if (!result || typeof result !== "object" || (result as { events_received?: unknown }).events_received !== 1) {
        record.state = "failed";
        report({ eventName: "PageView", eventId: parsed.data.eventId, outcome: "invalid_ack", providerStatus: response.status, ...providerErrorNumbers(result) });
        return json({ error: "Event service is unavailable." }, 503);
      }
      record.state = "accepted";
      report({ eventName: "PageView", eventId: parsed.data.eventId, outcome: "ack", providerStatus: response.status });
      return json({ accepted: true }, 202);
    } catch {
      record.state = "failed";
      report({ eventName: "PageView", eventId: parsed.data.eventId, outcome: "network_error" });
      return json({ error: "Event service is unavailable." }, 503);
    }
  }
  return { snapshot, consentGET, consentPOST, eventPOST };
}

// Next may instantiate this module in multiple route bundles. One process-wide
// service keeps active grants, revocation, pending claims and rate limits shared.
const serviceKey = Symbol.for("bangbuy.public-capi.service.v1");
const shared = globalThis as typeof globalThis & { [key: symbol]: ReturnType<typeof createPublicCapiService> | undefined };
const service = shared[serviceKey] ??= createPublicCapiService();
export const getPublicCapiSnapshot = service.snapshot;
export const publicCapiConsentGET = service.consentGET;
export const publicCapiConsentPOST = service.consentPOST;
export const publicCapiPOST = service.eventPOST;
