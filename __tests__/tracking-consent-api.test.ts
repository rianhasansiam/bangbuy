import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { approvedTestPolicy, trackingContext, TRACKING_TEST_TIME as now } from "./fixtures/tracking-policy";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), transaction: vi.fn(),
  policy: vi.fn(), limit: vi.fn(), jar: new Map<string, string>(),
  account: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {
  marketingConsent: { findUnique: mocks.findUnique, create: mocks.create, update: mocks.update },
  marketingConversionOutbox: { updateMany: mocks.updateMany }, $transaction: mocks.transaction,
} }));
vi.mock("@/lib/analytics/config", () => ({ getTrackingRuntimePolicy: mocks.policy }));
vi.mock("@/lib/auth/rate-limit", () => ({ rateLimitPersistent: mocks.limit, getClientIp: () => "synthetic-abuse-key" }));
vi.mock("@/lib/api/guards", () => ({ requireUser: mocks.account }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (name: string) => mocks.jar.has(name) ? { value: mocks.jar.get(name) } : undefined }) }));

import { GET, POST } from "@/lib/analytics/consent-handler";
import { MARKETING_CONSENT_COOKIE, CURRENT_TRACKING_POLICY_VERSION, UNKNOWN_MARKETING_CONSENT } from "@/lib/analytics/consent";
import { consentSecretFromRequest, getMarketingConsentForCurrentRequest, hashMarketingConsentSecret, readMarketingConsent } from "@/lib/analytics/consent-server";
import { createDeniedTrackingPolicy } from "@/lib/analytics/policy";

const secret = "a".repeat(64);
const consentRow = () => ({
  id: "6850324f-50c0-42f8-b1d8-94895352202a", secretHash: hashMarketingConsentSecret(secret),
  state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION,
  occurredAt: new Date(now - 1000), expiresAt: new Date(now + 86400_000), origin: "https://public.example.test",
  sourceUrl: trackingContext.url, context: trackingContext, matching: { fbp: "fb.1.1794290400000.1234567890123456", client_user_agent: "SyntheticBrowser" },
});
function request(value: unknown = { state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION }, options: { origin?: string | null; cookie?: boolean; referer?: string; url?: string; contentType?: string } = {}) {
  return new NextRequest(options.url ?? "https://public.example.test/api/public/consent", {
    method: "POST", headers: {
      ...(options.origin === null ? {} : { Origin: options.origin ?? "https://public.example.test" }),
      "Content-Type": options.contentType ?? "application/json", "User-Agent": "SyntheticBrowser",
      ...(options.cookie ? { Cookie: `${MARKETING_CONSENT_COOKIE}=${secret}` } : {}),
      ...(options.referer ? { Referer: options.referer } : {}),
    }, body: JSON.stringify(value),
  });
}

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(now); vi.resetAllMocks(); mocks.jar.clear();
  mocks.policy.mockReturnValue(approvedTestPolicy()); mocks.limit.mockResolvedValue({ allowed: true });
  mocks.account.mockResolvedValue({ ok: true, session: { user: { id: "synthetic-account" } } });
  mocks.findUnique.mockResolvedValue(null); mocks.update.mockResolvedValue({}); mocks.updateMany.mockResolvedValue({ count: 0 });
  mocks.create.mockImplementation(async ({ data }) => ({ ...data, id: "0f36dfd5-1157-4566-a5f3-09e426476b5d" }));
  mocks.transaction.mockImplementation(async (callback) => callback({ marketingConsent: { findUnique: mocks.findUnique, create: mocks.create, update: mocks.update }, marketingConversionOutbox: { updateMany: mocks.updateMany } }));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("host-scoped versioned marketing consent", () => {
  it("starts unknown without collecting an identifier or writing a cookie", async () => {
    const response = await GET(new NextRequest("https://public.example.test/api/public/consent"));
    expect(await response.json()).toEqual({ consent: UNKNOWN_MARKETING_CONSENT });
    expect(response.headers.get("set-cookie")).toBeNull(); expect(mocks.findUnique).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled();
  });
  it("persists an explicit grant with opaque host-only HttpOnly storage and no matching defaults", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await POST(request());
    expect(response.status).toBe(200);
    const body = await response.json(); expect(body.consent.state).toBe("granted"); expect(Object.keys(body.consent).sort()).toEqual(["expiresAt", "occurredAt", "policyVersion", "state"]);
    const saved = mocks.create.mock.calls[0][0].data;
    expect(saved.secretHash).toMatch(/^[a-f0-9]{64}$/); expect(saved.matching).toBeUndefined(); expect(saved.context).toBeUndefined(); expect(saved.sourceUrl).toBeNull();
    expect(JSON.stringify(saved)).not.toContain("synthetic-abuse-key");
    const cookie = response.headers.get("set-cookie")!; expect(cookie).toContain("HttpOnly"); expect(cookie).toContain("Secure"); expect(cookie).toContain("SameSite=strict"); expect(cookie).not.toMatch(/Domain=/i); expect(cookie).not.toContain(saved.secretHash);
    expect(response.headers.get("cache-control")).toContain("no-store"); expect(response.headers.has("access-control-allow-origin")).toBe(false);
  });
  it("uses the configured external host rather than the internal Next.js listener behind TLS proxy", async () => {
    vi.stubEnv("STOREFRONT_ORIGIN", "https://public.example.test"); vi.stubEnv("COMMERCE_ORIGIN", "https://commerce.example.test");
    const proxied = new NextRequest("https://localhost:3187/api/public/consent", { method: "POST", headers: { Host: "public.example.test", Origin: "https://public.example.test", "Content-Type": "application/json" }, body: JSON.stringify({ state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION }) });
    expect((await POST(proxied)).status).toBe(200); expect(mocks.create.mock.calls[0][0].data.origin).toBe("https://public.example.test");
    mocks.findUnique.mockResolvedValue(consentRow());
    expect((await readMarketingConsent(new NextRequest("https://localhost:3187/api/public/consent", { headers: { Host: "public.example.test", Cookie: `${MARKETING_CONSENT_COOKIE}=${secret}` } })))?.state).toBe("granted");
    const unknown = new NextRequest("https://localhost:3187/api/public/consent", { method: "POST", headers: { Host: "attacker.example.test", Origin: "https://attacker.example.test", "Content-Type": "application/json" }, body: JSON.stringify({ state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION }) });
    expect((await POST(unknown)).status).toBe(403);
  });
  it.each([null, "https://attacker.example.test", "https://commerce.example.test"])("requires an explicit same-origin CSRF boundary for Origin %s", async (origin) => {
    expect((await POST(request(undefined, { origin }))).status).toBe(403); expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("does not accept unsupported states, stale versions, customer fields or unexpected matching identifiers", async () => {
    for (const input of [
      { state: "unknown", policyVersion: CURRENT_TRACKING_POLICY_VERSION },
      { state: "granted", policyVersion: "old" },
      { state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, email: "private@example.test" },
      { state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, matching: { email: "private@example.test" } },
    ]) expect((await POST(request(input))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("revokes former consent and suppresses unsent deliveries before responding", async () => {
    mocks.findUnique.mockResolvedValue(consentRow());
    const response = await POST(request({ state: "revoked", policyVersion: CURRENT_TRACKING_POLICY_VERSION }, { cookie: true }));
    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: consentRow().id }, data: { state: "revoked", occurredAt: new Date(now) } });
    expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { consentId: consentRow().id, state: { in: ["PENDING", "RETRY", "PROCESSING"] } }, data: expect.objectContaining({ state: "SUPPRESSED", lastFailureCode: "CONSENT_CHANGED" }) }));
    expect(mocks.create.mock.calls[0][0].data.secretHash).not.toBe(consentRow().secretHash);
    expect(mocks.create.mock.calls[0][0].data.matching).toBeUndefined();
  });
  it("gives a later grant a fresh consent identity so withdrawn events cannot revive", async () => {
    mocks.findUnique.mockResolvedValue({ ...consentRow(), state: "revoked" });
    await POST(request(undefined, { cookie: true }));
    expect(mocks.updateMany).toHaveBeenCalledTimes(1); expect(mocks.create.mock.calls[0][0].data.secretHash).not.toBe(consentRow().secretHash);
  });
  it("rejects optional context before grant, without approvals or when it is not the actual referring document", async () => {
    const matching = { client_user_agent: "SyntheticBrowser", fbp: "fb.1.1794290400000.1234567890123456" };
    const payload = { state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, context: trackingContext, matching };
    expect((await POST(request({ ...payload, state: "denied" }, { referer: trackingContext.url }))).status).toBe(400);
    expect((await POST(request(payload, { referer: "https://public.example.test/en/other" }))).status).toBe(400);
    mocks.policy.mockReturnValue(createDeniedTrackingPolicy());
    expect((await POST(request(payload, { referer: trackingContext.url }))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("captures only explicit approved truthful context and matching fields after grant", async () => {
    const matching = { client_user_agent: "SyntheticBrowser", fbp: "fb.1.1794290400000.1234567890123456" };
    const payload = { state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, context: trackingContext, matching };
    expect((await POST(request(payload, { referer: trackingContext.url }))).status).toBe(200);
    const saved = mocks.create.mock.calls[0][0].data; expect(saved.context).toEqual(trackingContext); expect(saved.sourceUrl).toBe(trackingContext.url); expect(saved.matching).toEqual(matching);
    mocks.policy.mockReturnValue({ ...approvedTestPolicy(), matching: { ...approvedTestPolicy().matching, fields: [] } });
    expect((await POST(request(payload, { referer: trackingContext.url }))).status).toBe(400);
  });
  it("preserves guest preference choices but never stores guest commerce context or matching", async () => {
    const context = { ...trackingContext, url: "https://commerce.example.test/en/checkout" };
    const policy = approvedTestPolicy(); policy.routes[0].pathname = "/en/checkout"; mocks.policy.mockReturnValue(policy);
    mocks.account.mockResolvedValue({ ok: false });
    const options = { url: "https://commerce.example.test/api/public/consent", origin: "https://commerce.example.test", referer: context.url };
    expect((await POST(request({ state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, context, matching: { client_user_agent: "SyntheticBrowser", fbp: "fb.1.1794290400000.1234567890123456" } }, options))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
    expect((await POST(request({ state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION }, options))).status).toBe(200);
    expect(mocks.create.mock.calls[0][0].data.context).toBeUndefined(); expect(mocks.create.mock.calls[0][0].data.matching).toBeUndefined();
  });
  it("rejects fabricated user-agent data or unsafe context", async () => {
    expect((await POST(request({ state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, context: trackingContext, matching: { client_user_agent: "other browser" } }, { referer: trackingContext.url }))).status).toBe(400);
    const context = { ...trackingContext, url: trackingContext.url + "?private=1" };
    expect((await POST(request({ state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, context }, { referer: context.url }))).status).toBe(400);
  });
  it("does not serialize consent credentials or matching fields on GET", async () => {
    mocks.findUnique.mockResolvedValue(consentRow());
    const getRequest = new NextRequest("https://public.example.test/api/public/consent", { headers: { Cookie: `${MARKETING_CONSENT_COOKIE}=${secret}` } });
    expect(consentSecretFromRequest(getRequest)).toBe(secret);
    expect((await readMarketingConsent(getRequest))?.state).toBe("granted");
    const response = await GET(getRequest);
    const body = await response.text(); expect(body).not.toContain("secretHash"); expect(body).not.toContain("fbp"); expect(body).not.toContain(consentRow().id); expect(body).toContain('"state":"granted"');
  });
  it("fails closed when storage is unavailable", async () => {
    mocks.transaction.mockRejectedValue(new Error("synthetic DB outage"));
    const response = await POST(request()); expect(response.status).toBe(503); expect(response.headers.get("set-cookie")).toBeNull();
  });
});

describe("consent cannot cross browser origins", () => {
  it("does not authorize a copied public token on the commerce host", async () => {
    mocks.findUnique.mockResolvedValue(consentRow());
    expect(await readMarketingConsent(new NextRequest("https://commerce.example.test/api/public/consent", { headers: { Cookie: `${MARKETING_CONSENT_COOKIE}=${secret}` } }))).toBeNull();
  });
  it("accepts only the opaque cookie format and never a query credential", () => {
    expect(consentSecretFromRequest(new Request("https://public.example.test/?consent=" + secret))).toBeNull();
    expect(consentSecretFromRequest(new Request("https://public.example.test/", { headers: { Cookie: `${MARKETING_CONSENT_COOKIE}=email@example.test` } }))).toBeNull();
  });
  it("does not attach a public-origin grant to private checkout", async () => {
    vi.stubEnv("COMMERCE_ORIGIN", "https://commerce.example.test"); mocks.jar.set(MARKETING_CONSENT_COOKIE, secret); mocks.findUnique.mockResolvedValue(consentRow());
    expect(await getMarketingConsentForCurrentRequest()).toBeNull();
    mocks.findUnique.mockResolvedValue({ ...consentRow(), origin: "https://commerce.example.test" });
    expect((await getMarketingConsentForCurrentRequest())?.id).toBe(consentRow().id);
  });
});
