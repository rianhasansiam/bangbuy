import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createPublicCapiService, type PublicCapiDeliveryReport } from "@/lib/analytics/public-capi/service";
import { getPublicCapiRuntime, publicCapiPolicySchema } from "@/lib/analytics/public-capi/policy";
import { approvedClientAddress } from "@/lib/analytics/public-capi/client-address";
import { createPublicCapiConsentStore, PUBLIC_CAPI_CONSENT_COOKIE } from "@/lib/analytics/public-capi/consent";
import { PUBLIC_CAPI_POLICY_VERSION } from "@/lib/analytics/public-capi/types";

const origin = "https://bangbuy.test", alias = "https://www.bangbuy.test";
const clock = Date.parse("2026-11-11T06:00:00.000Z");
const eventId = "15a7a671-d9cd-4a88-ad37-18909b15425f";
const approval = { approved: true, reference: "owner-reviewed-public-pageview", expiresAt: "2026-12-01T00:00:00.000Z" };
function policy() {
  return {
    policyVersion: PUBLIC_CAPI_POLICY_VERSION, runtimeEnabled: true, origins: [origin, alias], pixelId: "123456789",
    business: { ...approval }, source: { ...approval, pixelId: "123456789" }, matching: { ...approval, fields: ["client_ip_address", "client_user_agent"] },
    routes: ["/en", "/en/products"].map(pathname => ({ ...approval, pathname, classification: "ordinary", events: ["PageView"] })),
  };
}
function request(path: string, body?: unknown, options: { cookie?: string; origin?: string; host?: string; headers?: Record<string, string>; method?: string } = {}) {
  const headers = new Headers({ host: options.host ?? "bangbuy.test", origin: options.origin ?? origin, "sec-fetch-site": "same-origin", "user-agent": "Synthetic QA Browser", "x-real-ip": "8.8.8.8", ...options.headers });
  if (options.cookie) headers.set("cookie", options.cookie);
  if (body !== undefined) headers.set("content-type", "application/json");
  return new Request(`http://127.0.0.1:3187${path}`, { method: options.method ?? (body === undefined ? "GET" : "POST"), headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
const payload = (sourceUrl = `${origin}/en`) => ({ eventId, name: "PageView", sourceUrl });

let directory: string, filename: string, environment: Record<string, string>, currentTime: number;
let send: ReturnType<typeof vi.fn<typeof fetch>>;
let reports: ReturnType<typeof vi.fn<(report: PublicCapiDeliveryReport) => void>>;
let service: ReturnType<typeof createPublicCapiService>;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "bangbuy-public-capi-")); filename = join(directory, "policy.json");
  writeFileSync(filename, JSON.stringify(policy()), { mode: 0o600 });
  currentTime = clock;
  environment = {
    NODE_ENV: "production", META_TRACKING_MODE: "server-only", META_ENVIRONMENT: "production", META_RUNTIME_ENABLED: "true", META_CAPI_ENABLED: "true", META_PUBLIC_CAPI_ENABLED: "true", META_PIXEL_ENABLED: "false", META_PUBLIC_CAPI_TRUST_PROXY: "true",
    NEXT_PUBLIC_META_PIXEL_ID: "123456789", META_PUBLIC_CAPI_POLICY_FILE: filename, META_PUBLIC_CAPI_CONSENT_SECRET: "synthetic-consent-signing-secret-32-bytes-minimum", META_CAPI_ACCESS_TOKEN: "private-token-never-return", META_GRAPH_API_VERSION: "v27.0",
  };
  send = vi.fn<typeof fetch>().mockImplementation(async () => Response.json({ events_received: 1, fbtrace_id: "not-returned" }));
  reports = vi.fn<(report: PublicCapiDeliveryReport) => void>();
  service = createPublicCapiService({ environment: () => environment, now: () => currentTime, send, report: reports });
});
afterEach(() => { rmSync(directory, { recursive: true, force: true }); });

async function grant(target = service, cookie?: string, state = "granted") {
  const response = await target.consentPOST(request("/api/public/capi/consent", { state, policyVersion: PUBLIC_CAPI_POLICY_VERSION }, { cookie }));
  expect(response.status).toBe(200);
  return response.headers.get("set-cookie")!.split(";", 1)[0];
}

describe("standalone public CAPI configuration", () => {
  it("exposes only safe readiness, route and privacy fields", async () => {
    const response = await service.consentGET(request("/api/public/capi/consent"));
    expect(await response.json()).toEqual({ policy: { enabled: true, policyVersion: PUBLIC_CAPI_POLICY_VERSION, eligiblePaths: ["/en", "/en/products"] }, consent: { state: "unknown", policyVersion: PUBLIC_CAPI_POLICY_VERSION, occurredAt: null, expiresAt: null } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(send).not.toHaveBeenCalled();
  });
  it.each(["META_TRACKING_MODE", "META_RUNTIME_ENABLED", "META_CAPI_ENABLED", "META_PUBLIC_CAPI_ENABLED", "META_PUBLIC_CAPI_TRUST_PROXY", "META_PUBLIC_CAPI_CONSENT_SECRET", "META_CAPI_ACCESS_TOKEN", "META_GRAPH_API_VERSION", "META_PUBLIC_CAPI_POLICY_FILE"])("fails closed when %s is absent", key => {
    delete environment[key];
    expect(service.snapshot(request("/api/public/capi/consent")).policy.enabled).toBe(false);
  });
  it("requires browser Pixel explicitly false, current approvals and the exact dataset", () => {
    for (const mutate of [() => { environment.META_PIXEL_ENABLED = "true"; }, () => { const value = policy(); value.source.pixelId = "111"; writeFileSync(filename, JSON.stringify(value)); }, () => { const value = policy(); value.business.expiresAt = "2026-11-01T00:00:00.000Z"; writeFileSync(filename, JSON.stringify(value)); }]) {
      environment.META_PIXEL_ENABLED = "false"; writeFileSync(filename, JSON.stringify(policy())); mutate();
      expect(getPublicCapiRuntime(environment, clock).enabled).toBe(false);
    }
  });
  it("rejects duplicate/private/wildcard routes, extra matching fields and non-exact origins", () => {
    const original = policy();
    expect(publicCapiPolicySchema.safeParse({ ...original, routes: [...original.routes, original.routes[0]] }).success).toBe(false);
    for (const pathname of ["/en/checkout", "/en/orders/abc", "/en/products/*", "/en/products?search=private", "/en/products/%2f..", "//private.test/en"]) {
      expect(publicCapiPolicySchema.safeParse({ ...original, routes: [{ ...original.routes[0], pathname }] }).success).toBe(false);
    }
    expect(publicCapiPolicySchema.safeParse({ ...original, matching: { ...original.matching, fields: ["client_user_agent"] } }).success).toBe(false);
    for (const badOrigin of ["https://*.bangbuy.test", `${origin}/`, `https://user:pass@bangbuy.test`, "http://bangbuy.test"]) {
      writeFileSync(filename, JSON.stringify({ ...original, origins: [badOrigin] }));
      expect(getPublicCapiRuntime(environment, clock).enabled).toBe(false);
    }
  });
  it("ignores forwarding headers and requires an exact configured Host", async () => {
    const unknown = request("/api/public/capi/consent", undefined, { host: "attacker.test", headers: { "x-forwarded-host": "bangbuy.test", "x-forwarded-proto": "https" } });
    expect(service.snapshot(unknown).policy.enabled).toBe(false);
    expect((await service.eventPOST(request("/api/public/capi", payload(), { host: "attacker.test" }))).status).toBe(403);
    const missing = request("/api/public/capi/consent"); missing.headers.delete("host");
    expect(service.snapshot(missing).policy.enabled).toBe(false);
  });
  it("requires a distinct non-production dataset and test_event_code", async () => {
    environment.NODE_ENV = "test"; environment.META_ENVIRONMENT = "test"; environment.META_TEST_PIXEL_ID = "123456789"; environment.META_TEST_EVENT_CODE = "TEST123";
    expect(getPublicCapiRuntime(environment, clock).enabled).toBe(false);
    environment.META_TEST_PIXEL_ID = "987654321";
    const value = policy(); value.pixelId = "987654321"; value.source.pixelId = "987654321"; writeFileSync(filename, JSON.stringify(value));
    expect(getPublicCapiRuntime(environment, clock).enabled).toBe(true);
    delete environment.META_TEST_EVENT_CODE;
    expect(getPublicCapiRuntime(environment, clock).enabled).toBe(false);
  });
});

describe("first-party process-scoped consent", () => {
  it("sets a host-only secure HttpOnly Strict cookie without a customer identifier", async () => {
    const response = await service.consentPOST(request("/api/public/capi/consent", { state: "granted", policyVersion: PUBLIC_CAPI_POLICY_VERSION }));
    const header = response.headers.get("set-cookie")!;
    expect(header).toContain("HttpOnly"); expect(header).toContain("SameSite=Strict"); expect(header).toContain("Secure"); expect(header).not.toContain("Domain=");
    const text = JSON.stringify(await response.json());
    expect(text).not.toMatch(/token|nonce|secret|private-token|pixelId|matching|client_ip|Browser/);
    expect(send).not.toHaveBeenCalled();
  });
  it("makes tampered/cross-host/expired cookies unknown and never trusts old consent cookies", async () => {
    const cookie = await grant();
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie })).consent.state).toBe("granted");
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie: `${cookie}x` })).consent.state).toBe("unknown");
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie, origin: alias, host: "www.bangbuy.test" })).consent.state).toBe("unknown");
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie: "bangbuy-marketing-consent=old-token" })).consent.state).toBe("unknown");
    currentTime += 30 * 24 * 60 * 60_000;
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie })).consent.state).toBe("unknown");
  });
  it("invalidates old grants on withdrawal, including copied old cookies and restarted processes", async () => {
    const cookie = await grant();
    const revoked = await grant(service, cookie, "revoked");
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie: revoked })).consent.state).toBe("revoked");
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie })).consent.state).toBe("unknown");
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(204);
    const fresh = await grant();
    const restarted = createPublicCapiService({ environment: () => environment, now: () => clock, send });
    expect(restarted.snapshot(request("/api/public/capi/consent", undefined, { cookie: fresh })).consent.state).toBe("unknown");
    expect(send).not.toHaveBeenCalled();
  });
  it("permits withdrawal during a runtime kill but never silently grants when disabled", async () => {
    const cookie = await grant(); environment.META_RUNTIME_ENABLED = "false";
    const denied = await grant(service, cookie, "denied");
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie: denied })).consent.state).toBe("denied");
    expect((await service.consentPOST(request("/api/public/capi/consent", { state: "granted", policyVersion: PUBLIC_CAPI_POLICY_VERSION }))).status).toBe(204);
  });
  it("enforces CSRF, strict request shape and streaming size limits", async () => {
    expect((await service.consentPOST(request("/api/public/capi/consent", { state: "granted", policyVersion: PUBLIC_CAPI_POLICY_VERSION }, { origin: alias }))).status).toBe(403);
    expect((await service.consentPOST(request("/api/public/capi/consent", { state: "granted", policyVersion: PUBLIC_CAPI_POLICY_VERSION, email: "private@example.test" }))).status).toBe(400);
    expect((await service.consentPOST(request("/api/public/capi/consent", { state: "granted", policyVersion: "old" }))).status).toBe(400);
    expect((await service.consentPOST(request("/api/public/capi/consent", { state: "x".repeat(2048), policyVersion: PUBLIC_CAPI_POLICY_VERSION }))).status).toBe(413);
  });
  it("evicts active grants fail closed at the fixed registry capacity", () => {
    const store = createPublicCapiConsentStore(), secret = environment.META_PUBLIC_CAPI_CONSENT_SECRET;
    const original = store.replace(request("/"), "granted", origin, secret, clock);
    for (let index = 0; index < 10_000; index++) store.replace(request("/"), "granted", origin, secret, clock);
    expect(store.read(request("/", undefined, { cookie: `${PUBLIC_CAPI_CONSENT_COOKIE}=${original}` }), origin, secret, clock).state).toBe("unknown");
  });
});

describe("minimal public PageView delivery", () => {
  it("sends only a truthful consented PageView, real proxy IP and UA; secrets remain in the server header", async () => {
    const cookie = await grant();
    const response = await service.eventPOST(request("/api/public/capi", payload(), { cookie, headers: { referer: `${origin}/en`, "x-forwarded-for": "1.1.1.1" } }));
    expect(response.status).toBe(202); expect(await response.json()).toEqual({ accepted: true });
    expect(send).toHaveBeenCalledTimes(1);
    const [url, options] = send.mock.calls[0];
    expect(url).toBe("https://graph.facebook.com/v27.0/123456789/events");
    expect(url).not.toContain(environment.META_CAPI_ACCESS_TOKEN);
    expect(new Headers(options!.headers).get("authorization")).toBe(`Bearer ${environment.META_CAPI_ACCESS_TOKEN}`);
    expect(JSON.parse(String(options!.body))).toEqual({ data: [{ event_name: "PageView", event_time: Math.floor(clock / 1000), event_id: eventId, action_source: "website", event_source_url: `${origin}/en`, user_data: { client_ip_address: "8.8.8.8", client_user_agent: "Synthetic QA Browser" } }] });
    expect(options).toMatchObject({ cache: "no-store", credentials: "omit", redirect: "error" });
    expect(options!.signal).toBeInstanceOf(AbortSignal);
  });
  it("never sends before consent, after withdrawal, on a runtime kill or without a token", async () => {
    expect((await service.eventPOST(request("/api/public/capi", payload()))).status).toBe(204);
    const cookie = await grant();
    environment.META_RUNTIME_ENABLED = "false";
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(204);
    environment.META_RUNTIME_ENABLED = "true"; delete environment.META_CAPI_ACCESS_TOKEN;
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(204);
    expect(send).not.toHaveBeenCalled();
  });
  it.each(["/en/cart", "/en/checkout", "/en/orders/abc", "/en/search", "/en/products?q=private", "/en?", "/en#", "/en#private", "/en/../en", "/%65n", "/en/products/../checkout"])("refuses private, queried, fragmented or normalized source %s", async (path) => {
    const cookie = await grant();
    expect((await service.eventPOST(request("/api/public/capi", payload(`${origin}${path}`), { cookie }))).status).toBe(204);
    expect(send).not.toHaveBeenCalled();
  });
  it("rejects cross-host source, referrer mismatches, untrusted context and arbitrary payload fields", async () => {
    const cookie = await grant();
    expect((await service.eventPOST(request("/api/public/capi", payload(`${alias}/en`), { cookie }))).status).toBe(204);
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie, headers: { referer: `${origin}/en/checkout` } }))).status).toBe(403);
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie, headers: { "sec-fetch-site": "same-site" } }))).status).toBe(403);
    expect((await service.eventPOST(request("/api/public/capi", { ...payload(), email: "private@example.test", client_ip_address: "1.1.1.1" }, { cookie }))).status).toBe(400);
    expect((await service.eventPOST(request("/api/public/capi", { ...payload(), name: "Purchase" }, { cookie }))).status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });
  it("deduplicates acknowledged events and binds identity to the approved source", async () => {
    const cookie = await grant();
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(202);
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(202);
    expect((await service.eventPOST(request("/api/public/capi", payload(`${origin}/en/products`), { cookie }))).status).toBe(409);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("does not label a pending or failed duplicate accepted and never automatically retries", async () => {
    let finish!: (value: Response) => void;
    send.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const cookie = await grant();
    const first = service.eventPOST(request("/api/public/capi", payload(), { cookie }));
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(204);
    finish(Response.json({ error: { message: "private provider detail" } }, { status: 500 }));
    const response = await first;
    expect(response.status).toBe(503); expect(JSON.stringify(await response.json())).not.toContain("provider detail");
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(503);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("requires exactly one provider acknowledgement and hides raw errors", async () => {
    send.mockResolvedValueOnce(Response.json({ events_received: 0, error: environment.META_CAPI_ACCESS_TOKEN }));
    const cookie = await grant();
    const response = await service.eventPOST(request("/api/public/capi", payload(), { cookie }));
    expect(response.status).toBe(503); expect(await response.json()).toEqual({ error: "Event service is unavailable." });
  });
  it("reports only whitelisted delivery evidence, never private context, token or provider messages", async () => {
    const cookie = await grant();
    expect(reports).not.toHaveBeenCalled();
    send.mockResolvedValueOnce(Response.json({ error: { code: 190, error_subcode: 463, message: `private ${environment.META_CAPI_ACCESS_TOKEN} 8.8.8.8 Synthetic QA Browser ${origin}/en` } }, { status: 400 }));
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(503);
    expect(reports).toHaveBeenCalledExactlyOnceWith({ eventName: "PageView", eventId, outcome: "http_error", providerStatus: 400, providerCode: 190, providerSubcode: 463 });
    expect(JSON.stringify(reports.mock.calls)).not.toMatch(/private-token|8\.8\.8\.8|Synthetic|bangbuy\.test|cookie|message|fbtrace/);
    const working = createPublicCapiService({ environment: () => environment, now: () => clock, send, report: () => { throw new Error("reporter unavailable"); } });
    const fresh = await grant(working);
    expect((await working.eventPOST(request("/api/public/capi", payload(), { cookie: fresh }))).status).toBe(202);
  });
  it("rate limits a grant and globally limits renewed consent identities", async () => {
    const cookie = await grant();
    for (let index = 0; index < 30; index++) {
      const unique = { ...payload(), eventId: `15a7a671-d9cd-4a88-ad37-${index.toString().padStart(12, "0")}` };
      expect((await service.eventPOST(request("/api/public/capi", unique, { cookie }))).status).toBe(202);
    }
    expect((await service.eventPOST(request("/api/public/capi", payload(), { cookie }))).status).toBe(429);
    for (let index = 0; index < 99; index++) await grant();
    expect((await service.consentPOST(request("/api/public/capi/consent", { state: "granted", policyVersion: PUBLIC_CAPI_POLICY_VERSION }))).status).toBe(429);
    await grant(service, cookie, "revoked");
    expect(service.snapshot(request("/api/public/capi/consent", undefined, { cookie })).consent.state).toBe("unknown");
  });
});

describe("trusted proxy client address", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.0.1", "169.254.0.1", "100.64.0.1", "192.0.2.1", "198.51.100.1", "203.0.113.1", "224.0.0.1", "::", "::1", "::ffff:8.8.8.8", "::ffff:7f00:1", "::ffff:a00:1", "2001:4860::8888%eth0", "fc00::1", "fe80::1", "2001:db8::1", "2002:808:808::1", "8.8.8.8, 1.1.1.1", "invalid"])("rejects non-public or malformed production address %s", address => {
    expect(approvedClientAddress(request("/", undefined, { headers: { "x-real-ip": address } }))).toBeNull();
  });
  it("supports genuine IPv4/IPv6, test-only documentation ranges and no forwarding fallback", () => {
    expect(approvedClientAddress(request("/"))).toBe("8.8.8.8");
    expect(approvedClientAddress(request("/", undefined, { headers: { "x-real-ip": "2606:4700:4700::1111" } }))).toBe("2606:4700:4700::1111");
    expect(approvedClientAddress(request("/", undefined, { headers: { "x-real-ip": "203.0.113.1" } }), true)).toBe("203.0.113.1");
    const missing = request("/", undefined, { headers: { "x-forwarded-for": "8.8.8.8" } }); missing.headers.delete("x-real-ip");
    expect(approvedClientAddress(missing)).toBeNull();
  });
});
