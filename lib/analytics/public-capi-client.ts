import { classifySurfacePath } from "@/lib/security/surfaces";
import { PUBLIC_CAPI_POLICY_VERSION, type PublicCapiConsent as Consent, type PublicCapiConsentState, type PublicCapiSnapshot as Snapshot } from "./public-capi/types";

export { PUBLIC_CAPI_POLICY_VERSION } from "./public-capi/types";
export const PUBLIC_CAPI_PREFERENCE_KEY = "bangbuy:privacy:public-capi";
export type { PublicCapiConsentState } from "./public-capi/types";
export type PublicCapiClientState = Readonly<{ ready: boolean; enabled: boolean; eligible: boolean; consent: PublicCapiConsentState; busy: boolean; failed: boolean }>;
export const INITIAL_PUBLIC_CAPI_STATE: PublicCapiClientState = Object.freeze({ ready: false, enabled: false, eligible: false, consent: "unknown", busy: false, failed: false });

type Environment = {
  fetch: typeof fetch;
  sourceUrl: () => string;
  readPreference: () => string | null;
  writePreference: (value: string) => void;
  eventId: () => string;
  now: () => number;
};
const consentStates = new Set(["unknown", "granted", "denied", "revoked"]);

function parseConsent(value: unknown): Consent | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.state !== "string" || !consentStates.has(item.state) || item.policyVersion !== PUBLIC_CAPI_POLICY_VERSION) return null;
  for (const key of ["occurredAt", "expiresAt"]) if (item[key] !== null && (typeof item[key] !== "string" || !Number.isFinite(Date.parse(item[key] as string)))) return null;
  return item as Consent;
}

function parseSnapshot(value: unknown): Snapshot | null {
  if (!value || typeof value !== "object") return null;
  const item = value as { policy?: Record<string, unknown>; consent?: unknown };
  const consent = parseConsent(item.consent);
  const policy = item.policy;
  if (!consent || !policy || typeof policy.enabled !== "boolean" || policy.policyVersion !== PUBLIC_CAPI_POLICY_VERSION || !Array.isArray(policy.eligiblePaths) || policy.eligiblePaths.length > 2000 || policy.eligiblePaths.some(path => typeof path !== "string")) return null;
  return { policy: policy as Snapshot["policy"], consent };
}

/** Evaluate the actual URL without stripping private query strings or hashes. */
export function isPublicCapiSourceEligible(sourceUrl: string, paths: readonly string[]): boolean {
  try {
    const url = new URL(sourceUrl);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return !url.username && !url.password && !sourceUrl.includes("?") && !sourceUrl.includes("#") && (url.protocol === "https:" || (local && url.protocol === "http:")) && classifySurfacePath(url.pathname) === "public" && paths.includes(url.pathname);
  } catch { return false; }
}

/** One document's first-party client. It never reads account, cart or order state. */
export function createPublicCapiClient(environment: Environment) {
  let view = INITIAL_PUBLIC_CAPI_STATE;
  let epoch = 0;
  let suspended = false;
  let attempted = false;
  let eventId: string | null = null;
  let memoryDenial: "denied" | "revoked" | null = null;
  const documentUrl = environment.sourceUrl();
  const listeners = new Set<() => void>();
  const requests = new Set<AbortController>();
  const patch = (change: Partial<PublicCapiClientState>) => {
    view = { ...view, ...change };
    for (const listener of listeners) listener();
  };
  const cancel = () => {
    epoch++;
    for (const request of requests) request.abort();
    requests.clear();
    if (view.busy) patch({ busy: false });
  };
  function localDenial(): "denied" | "revoked" | null {
    if (memoryDenial) return memoryDenial;
    try {
      const raw = environment.readPreference();
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (!item || item.policyVersion !== PUBLIC_CAPI_POLICY_VERSION || !consentStates.has(item.state)) return "denied";
      return item.state === "denied" || item.state === "revoked" ? item.state : null;
    } catch { return "denied"; }
  }
  function remember(state: Exclude<PublicCapiConsentState, "unknown">): boolean {
    try { environment.writePreference(JSON.stringify({ policyVersion: PUBLIC_CAPI_POLICY_VERSION, state })); return true; }
    catch { return false; }
  }
  const alive = (generation: number) => generation === epoch && listeners.size > 0;
  const grantIsCurrent = (consent: Consent) => consent.state === "granted" && consent.occurredAt !== null && consent.expiresAt !== null && Date.parse(consent.occurredAt) <= environment.now() && Date.parse(consent.expiresAt) > environment.now();

  async function refresh(sendCurrentPage: boolean) {
    const generation = epoch;
    const controller = new AbortController();
    let dispatching = false;
    requests.add(controller);
    try {
      const response = await environment.fetch("/api/public/capi/consent", { cache: "no-store", credentials: "same-origin", redirect: "error", referrerPolicy: "no-referrer", signal: controller.signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Consent unavailable");
      const snapshot = parseSnapshot(await response.json());
      if (!snapshot) throw new Error("Consent unavailable");
      if (!alive(generation)) return;
      const sourceUrl = environment.sourceUrl();
      const eligible = sourceUrl === documentUrl && isPublicCapiSourceEligible(sourceUrl, snapshot.policy.eligiblePaths);
      const denied = localDenial();
      const currentGrant = grantIsCurrent(snapshot.consent);
      patch({ ready: true, enabled: snapshot.policy.enabled, eligible, consent: denied ?? (snapshot.consent.state === "granted" && !currentGrant ? "unknown" : snapshot.consent.state), failed: false });
      if (!sendCurrentPage || suspended || attempted || denied || !snapshot.policy.enabled || !eligible || !currentGrant || !alive(generation)) return;
      // Generate only after consent, for the current document now. There is no
      // pre-consent queue and no automatic retry after an attempted POST.
      eventId ??= environment.eventId();
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)) return;
      if (localDenial() || environment.sourceUrl() !== sourceUrl || !alive(generation)) return;
      attempted = true;
      dispatching = true;
      await environment.fetch("/api/public/capi", { method: "POST", cache: "no-store", credentials: "same-origin", redirect: "error", referrerPolicy: "no-referrer", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId, name: "PageView", sourceUrl }) });
    } catch {
      if (alive(generation) && !controller.signal.aborted && !dispatching) patch({ ready: true, enabled: false, eligible: false, failed: true });
    } finally { requests.delete(controller); }
  }

  async function choose(state: "granted" | "denied" | "revoked"): Promise<void> {
    if (!listeners.size || (state === "granted" && view.busy)) return;
    // A withdrawal wins synchronously, even while grant or event requests run.
    cancel();
    if (state !== "granted") { memoryDenial = state; remember(state); patch({ consent: state }); }
    patch({ busy: true, failed: false });
    const generation = epoch;
    const controller = new AbortController();
    requests.add(controller);
    try {
      const response = await environment.fetch("/api/public/capi/consent", { method: "POST", cache: "no-store", credentials: "same-origin", redirect: "error", referrerPolicy: "no-referrer", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state, policyVersion: PUBLIC_CAPI_POLICY_VERSION }) });
      if (!response.ok) throw new Error("Consent unavailable");
      const body = await response.json();
      const consent = parseConsent(body?.consent);
      if (!alive(generation)) return;
      if (!consent || consent.state !== state) throw new Error("Consent unavailable");
      if (state === "granted" && !grantIsCurrent(consent)) throw new Error("Consent unavailable");
      if (state === "granted") {
        // A local grant alone never restores a missing/expired server grant.
        if (!remember(state)) throw new Error("Consent unavailable");
        memoryDenial = null;
      }
      patch({ consent: state });
      if (state === "granted") await refresh(true);
    } catch {
      if (alive(generation) && !controller.signal.aborted) patch({ failed: true });
    } finally {
      requests.delete(controller);
      if (alive(generation)) patch({ busy: false });
    }
  }

  return {
    getSnapshot: () => view,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      const generation = epoch;
      // React StrictMode may subscribe, clean up, then subscribe again. The
      // obsolete microtask cannot consume this document's PageView attempt.
      queueMicrotask(() => { if (alive(generation) && listeners.has(listener)) void refresh(true); });
      return () => { listeners.delete(listener); if (!listeners.size) cancel(); };
    },
    choose,
    syncPreference: () => {
      cancel();
      const denied = localDenial();
      if (denied) patch({ consent: denied, busy: false });
      // A grant from another tab updates the UI, not historical page traffic.
      if (listeners.size) void refresh(false);
    },
    suspend: () => { suspended = true; cancel(); patch({ busy: false }); },
  };
}

export type PublicCapiClient = ReturnType<typeof createPublicCapiClient>;
declare global { interface Window { __bangbuyPublicCapiClient?: PublicCapiClient } }
export function getBrowserPublicCapiClient(): PublicCapiClient {
  return window.__bangbuyPublicCapiClient ??= createPublicCapiClient({
    fetch: (input, init) => window.fetch(input, init), sourceUrl: () => window.location.href,
    readPreference: () => window.localStorage.getItem(PUBLIC_CAPI_PREFERENCE_KEY),
    writePreference: value => window.localStorage.setItem(PUBLIC_CAPI_PREFERENCE_KEY, value),
    eventId: () => window.crypto.randomUUID(), now: () => Date.now(),
  });
}
