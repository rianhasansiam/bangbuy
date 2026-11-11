import { describe, expect, it, vi } from "vitest";
import { createPublicCapiClient, isPublicCapiSourceEligible, PUBLIC_CAPI_POLICY_VERSION } from "@/lib/analytics/public-capi-client";
import type { PublicCapiConsent, PublicCapiConsentState, PublicCapiSnapshot } from "@/lib/analytics/public-capi/types";

const NOW = Date.parse("2026-11-11T12:00:00.000Z");
const ID = "281aeabc-5237-43ae-9b8b-4b9e0976d912";
const SOURCE = "https://bangbuy.net/en";
const json = (value: unknown, ok = true) => ({ ok, json: async () => value }) as Response;
const consent = (state: PublicCapiConsentState): PublicCapiConsent => ({ state, policyVersion: PUBLIC_CAPI_POLICY_VERSION, occurredAt: state === "unknown" ? null : new Date(NOW).toISOString(), expiresAt: state === "unknown" ? null : new Date(NOW + 60_000).toISOString() });
const preference = (state: PublicCapiConsentState, policyVersion: string = PUBLIC_CAPI_POLICY_VERSION) => JSON.stringify({ state, policyVersion });
const flush = async () => { for (let index = 0; index < 20; index++) await Promise.resolve(); };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function harness(initial: PublicCapiConsentState = "unknown") {
  let source = SOURCE;
  let stored: string | null = null;
  const snapshot: PublicCapiSnapshot = { policy: { enabled: true, policyVersion: PUBLIC_CAPI_POLICY_VERSION, eligiblePaths: ["/en", "/bn"] }, consent: consent(initial) };
  const calls: Array<{ path: string; init: RequestInit }> = [];
  const network = vi.fn(async (path: string, init: RequestInit): Promise<Response> => {
    if (path === "/api/public/capi/consent") {
      if (init.method === "POST") snapshot.consent = consent(JSON.parse(init.body as string).state);
      return json(snapshot);
    }
    return json({ accepted: true });
  });
  const eventId = vi.fn(() => ID);
  const env = {
    fetch: vi.fn((input: RequestInfo | URL, init: RequestInit = {}) => { calls.push({ path: String(input), init }); return network(String(input), init); }) as typeof fetch,
    sourceUrl: () => source,
    readPreference: () => stored,
    writePreference: (value: string) => { stored = value; },
    eventId, now: () => NOW,
  };
  const client = createPublicCapiClient(env);
  return { client, snapshot, network, calls, env, eventId, setSource: (value: string) => { source = value; }, setPreference: (value: string | null) => { stored = value; }, getPreference: () => stored, posts: () => calls.filter(call => call.path === "/api/public/capi") };
}

describe("server-only first-party public PageView", () => {
  it("does not create or queue an event before a current server grant", async () => {
    const h = harness(); h.client.subscribe(() => {}); await flush();
    expect(h.client.getSnapshot()).toMatchObject({ ready: true, enabled: true, consent: "unknown" });
    expect(h.calls.map(call => [call.path, call.init.method ?? "GET"])).toEqual([["/api/public/capi/consent", "GET"]]);
    expect(h.eventId).not.toHaveBeenCalled();
  });

  it("sends one strict current-page payload using only first-party requests", async () => {
    const h = harness("granted"); h.client.subscribe(() => {}); await flush();
    expect(h.posts()).toHaveLength(1);
    expect(JSON.parse(h.posts()[0].init.body as string)).toEqual({ eventId: ID, name: "PageView", sourceUrl: SOURCE });
    for (const call of h.calls) {
      expect(call.path).toMatch(/^\/api\/public\/capi(?:\/consent)?$/);
      expect(call.init).toMatchObject({ cache: "no-store", credentials: "same-origin", redirect: "error", referrerPolicy: "no-referrer" });
    }
    expect(h.getPreference()).toBeNull();
  });

  it.each(["https://bangbuy.net/en?email=private@example.test", "https://bangbuy.net/en?", "https://bangbuy.net/en#draft", "https://bangbuy.net/en#", "https://bangbuy.net/en/checkout", "https://bangbuy.net/en/orders/order-1", "https://bangbuy.net/search", "https://user:secret@bangbuy.net/en"])("suppresses the actual unsafe source without sanitizing it: %s", async source => {
    const h = harness("granted"); h.setSource(source); h.snapshot.policy.eligiblePaths.push(new URL(source).pathname);
    h.client.subscribe(() => {}); await flush();
    expect(h.posts()).toHaveLength(0); expect(h.eventId).not.toHaveBeenCalled();
  });

  it("requires an enabled policy and an exact approved path", async () => {
    for (const change of ["disabled", "unlisted"] as const) {
      const h = harness("granted");
      if (change === "disabled") h.snapshot.policy.enabled = false; else h.snapshot.policy.eligiblePaths = ["/bn"];
      h.client.subscribe(() => {}); await flush(); expect(h.posts()).toHaveLength(0);
    }
  });

  it.each(["denied", "revoked"] as const)("honors a local %s preference over a stale granted cookie", async state => {
    const h = harness("granted"); h.setPreference(preference(state)); h.client.subscribe(() => {}); await flush();
    expect(h.posts()).toHaveLength(0); expect(h.client.getSnapshot().consent).toBe(state);
  });

  it("never turns a local grant into server consent after a restart or expiry", async () => {
    const h = harness("unknown"); h.setPreference(preference("granted")); h.client.subscribe(() => {}); await flush();
    expect(h.posts()).toHaveLength(0); expect(h.client.getSnapshot().consent).toBe("unknown");
    expect(h.calls.some(call => call.init.method === "POST")).toBe(false);
  });

  it.each(["expired", "future"])("suppresses a %s server grant", async value => {
    const h = harness("granted");
    if (value === "expired") h.snapshot.consent.expiresAt = new Date(NOW - 1).toISOString();
    else h.snapshot.consent.occurredAt = new Date(NOW + 1).toISOString();
    h.client.subscribe(() => {}); await flush(); expect(h.posts()).toHaveLength(0); expect(h.client.getSnapshot().consent).toBe("unknown");
  });

  it("creates a new current-document event only after explicit grant and a fresh policy check", async () => {
    const h = harness(); h.client.subscribe(() => {}); await flush();
    expect(h.eventId).not.toHaveBeenCalled();
    await h.client.choose("granted");
    expect(h.calls.map(call => [call.path, call.init.method ?? "GET"])).toEqual([
      ["/api/public/capi/consent", "GET"], ["/api/public/capi/consent", "POST"],
      ["/api/public/capi/consent", "GET"], ["/api/public/capi", "POST"],
    ]);
    expect(JSON.parse(h.calls[1].init.body as string)).toEqual({ state: "granted", policyVersion: PUBLIC_CAPI_POLICY_VERSION });
    expect(h.eventId).toHaveBeenCalledOnce(); expect(h.client.getSnapshot()).toMatchObject({ consent: "granted", busy: false });
  });

  it("honors a runtime kill occurring while grant is saved", async () => {
    const h = harness(); h.client.subscribe(() => {}); await flush();
    h.network.mockImplementation(async (path, init) => {
      if (path.endsWith("/consent") && init.method === "POST") { h.snapshot.consent = consent("granted"); h.snapshot.policy.enabled = false; }
      return json(h.snapshot);
    });
    await h.client.choose("granted");
    expect(h.posts()).toHaveLength(0); expect(h.client.getSnapshot()).toMatchObject({ enabled: false, consent: "granted" });
  });

  it("survives StrictMode subscribe-cleanup-subscribe without losing or duplicating PageView", async () => {
    const h = harness("granted"); const first = h.client.subscribe(() => {}); first();
    const second = h.client.subscribe(() => {}); await flush();
    expect(h.posts()).toHaveLength(1); expect(h.eventId).toHaveBeenCalledOnce();
    second(); h.client.subscribe(() => {}); await flush(); expect(h.posts()).toHaveLength(1);
  });

  it("ignores an obsolete preflight completion after unmount and uses the new subscription", async () => {
    const h = harness("granted"); const pending = deferred<Response>(); h.network.mockImplementationOnce(() => pending.promise);
    const stop = h.client.subscribe(() => {}); await flush();
    const firstSignal = h.calls[0].init.signal!; stop(); expect(firstSignal.aborted).toBe(true);
    h.client.subscribe(() => {}); await flush(); expect(h.posts()).toHaveLength(1);
    pending.resolve(json(h.snapshot)); await flush(); expect(h.posts()).toHaveLength(1);
  });

  it("clears a cancelled consent request's busy state so a remount can accept a new choice", async () => {
    const h = harness(); const stop = h.client.subscribe(() => {}); await flush(); const pending = deferred<Response>();
    h.network.mockImplementationOnce(() => pending.promise);
    const granting = h.client.choose("granted"); expect(h.client.getSnapshot().busy).toBe(true);
    stop(); expect(h.client.getSnapshot().busy).toBe(false);
    h.client.subscribe(() => {}); await flush();
    pending.resolve(json({ ...h.snapshot, consent: consent("granted") })); await granting;
    expect(h.client.getSnapshot()).toMatchObject({ consent: "unknown", busy: false });
    await h.client.choose("denied"); expect(h.client.getSnapshot()).toMatchObject({ consent: "denied", busy: false });
  });

  it("does not retry or replay a failed event, including after resubscription", async () => {
    const h = harness("granted"); h.network.mockImplementation(async path => path.endsWith("/consent") ? json(h.snapshot) : Promise.reject(new Error("network")));
    const stop = h.client.subscribe(() => {}); await flush(); stop(); h.client.subscribe(() => {}); await flush(); h.client.syncPreference(); await flush();
    expect(h.posts()).toHaveLength(1); expect(h.eventId).toHaveBeenCalledOnce();
  });

  it("withdraws locally and aborts an in-flight event before the withdrawal request finishes", async () => {
    const h = harness("granted"); const pending = deferred<Response>();
    h.network.mockImplementation(async (path, init) => path === "/api/public/capi" ? pending.promise : init.method === "POST" ? Promise.reject(new Error("offline")) : json(h.snapshot));
    h.client.subscribe(() => {}); await flush();
    const eventSignal = h.posts()[0].init.signal!;
    const withdrawing = h.client.choose("revoked");
    expect(eventSignal.aborted).toBe(true); expect(h.client.getSnapshot().consent).toBe("revoked"); expect(JSON.parse(h.getPreference()!)).toEqual(JSON.parse(preference("revoked")));
    await withdrawing; expect(h.client.getSnapshot().failed).toBe(true);
    pending.resolve(json({ accepted: true })); await flush(); expect(h.client.getSnapshot().consent).toBe("revoked");
    const next = createPublicCapiClient(h.env); next.subscribe(() => {}); await flush(); expect(h.posts()).toHaveLength(1);
  });

  it("lets denial win against a pending grant response", async () => {
    const h = harness(); h.client.subscribe(() => {}); await flush(); const grant = deferred<Response>();
    h.network.mockImplementation(async (path, init) => {
      if (path.endsWith("/consent") && init.method === "POST") {
        const state = JSON.parse(init.body as string).state;
        if (state === "granted") return grant.promise;
        return json({ ...h.snapshot, consent: consent(state) });
      }
      return json(h.snapshot);
    });
    const granting = h.client.choose("granted"); const grantSignal = h.calls.at(-1)!.init.signal!;
    await h.client.choose("denied"); expect(grantSignal.aborted).toBe(true);
    grant.resolve(json({ ...h.snapshot, consent: consent("granted") })); await granting;
    expect(h.client.getSnapshot().consent).toBe("denied"); expect(h.posts()).toHaveLength(0); expect(JSON.parse(h.getPreference()!)).toEqual(JSON.parse(preference("denied")));
  });

  it("synchronizes another tab's grant without replaying this pre-consent page", async () => {
    const h = harness(); h.client.subscribe(() => {}); await flush();
    h.snapshot.consent = consent("granted"); h.setPreference(preference("granted")); h.client.syncPreference(); await flush();
    expect(h.client.getSnapshot().consent).toBe("granted"); expect(h.posts()).toHaveLength(0); expect(h.eventId).not.toHaveBeenCalled();
    h.setPreference(preference("revoked")); h.client.syncPreference(); await flush(); expect(h.client.getSnapshot().consent).toBe("revoked");
  });

  it("cancels pending work permanently for a hidden/BFCache or navigated old document", async () => {
    const h = harness("granted"); const pending = deferred<Response>(); h.network.mockImplementationOnce(() => pending.promise);
    h.client.subscribe(() => {}); await flush(); const preflightSignal = h.calls[0].init.signal!;
    h.client.suspend(); expect(preflightSignal.aborted).toBe(true);
    pending.resolve(json(h.snapshot)); await flush(); h.client.syncPreference(); await flush(); await h.client.choose("granted");
    expect(h.posts()).toHaveLength(0);
  });

  it("does not relabel the source when a URL changes while policy is loading", async () => {
    const h = harness("granted"); const pending = deferred<Response>(); h.network.mockImplementationOnce(() => pending.promise);
    h.client.subscribe(() => {}); await flush(); h.setSource(`${SOURCE}?checkout=draft`); pending.resolve(json(h.snapshot)); await flush();
    expect(h.posts()).toHaveLength(0); expect(h.client.getSnapshot().eligible).toBe(false);
  });

  it.each(["malformed", "wrong-version", "unreadable"])("fails closed for a %s browser preference", async value => {
    const h = harness("granted");
    if (value === "unreadable") h.env.readPreference = () => { throw new Error("blocked"); };
    else h.setPreference(value === "malformed" ? "bad json" : preference("granted", "old-version"));
    h.client.subscribe(() => {}); await flush(); expect(h.posts()).toHaveLength(0);
  });

  it("reports malformed consent confirmation and keeps existing denial effective", async () => {
    const h = harness("denied"); h.setPreference(preference("denied")); h.client.subscribe(() => {}); await flush();
    h.network.mockImplementation(async () => json({ consent: { state: "granted" } }));
    await h.client.choose("granted");
    expect(h.posts()).toHaveLength(0); expect(h.client.getSnapshot()).toMatchObject({ consent: "denied", busy: false, failed: true });
  });
});

describe("source classification", () => {
  it("rejects private paths even if a malformed approval list includes them", () => {
    expect(isPublicCapiSourceEligible("https://bangbuy.net/en/cart", ["/en/cart"])).toBe(false);
    expect(isPublicCapiSourceEligible("https://bangbuy.net/bn", ["/bn"])).toBe(true);
  });
});
