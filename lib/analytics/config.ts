import "server-only";
import { readFileSync, statSync } from "node:fs";
import { z } from "zod";
import { CURRENT_TRACKING_POLICY_VERSION } from "./consent";
import { createDeniedTrackingPolicy, trackingRuntimePolicySchema, type TrackingRuntimePolicy } from "./policy";

const flag = (value: string | undefined) => value === "true";
type TrackingEnvironment = Readonly<Record<string, string | undefined>>;
const exactOrigin = (value: string | undefined, production: boolean): string | null => {
  try {
    const url = new URL(value ?? "");
    const loopback = ["localhost", "127.0.0.1", "[::1]", "public.localhost", "commerce.localhost"].includes(url.hostname);
    if (url.origin !== value || url.username || url.password || (url.protocol !== "https:" && (production || !loopback || url.protocol !== "http:"))) return null;
    return url.origin;
  } catch { return null; }
};

/** Public snapshot: no secret, worker credential, file path or customer data. */
export function getTrackingRuntimePolicy(env: TrackingEnvironment = process.env): TrackingRuntimePolicy {
  const denied = createDeniedTrackingPolicy();
  const production = env.NODE_ENV === "production";
  const storefrontOrigin = exactOrigin(env.STOREFRONT_ORIGIN, production);
  const commerceOrigin = exactOrigin(env.COMMERCE_ORIGIN, production);
  const environment = z.enum(["disabled", "production", "staging", "test"]).safeParse(env.META_ENVIRONMENT ?? "disabled");
  const mode = environment.success ? environment.data : "disabled";
  const productionId = env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const selectedId = mode === "production" ? productionId : env.META_TEST_PIXEL_ID?.trim();
  const pixelId = selectedId && /^\d+$/.test(selectedId) ? selectedId : null;
  const base = { ...denied, storefrontOrigin, commerceOrigin };
  // The single-origin CAPI channel has its own public PageView contract and
  // consent. It must never enable legacy browser or order-conversion delivery.
  if (env.META_TRACKING_MODE === "server-only") return base;
  if (!env.META_POLICY_FILE || !environment.success || mode === "disabled" || !pixelId || (mode === "production" && !production) || (mode !== "production" && (!productionId || selectedId === productionId))) return base;
  try {
    // Re-read on every dispatch/poll/worker cycle; file updates are runtime kills.
    if (statSync(env.META_POLICY_FILE).size > 256 * 1024) return base;
    const file = JSON.parse(readFileSync(env.META_POLICY_FILE, "utf8"));
    const parsed = trackingRuntimePolicySchema.safeParse(file);
    if (!parsed.success || parsed.data.policyVersion !== CURRENT_TRACKING_POLICY_VERSION) return base;
    const policy = parsed.data;
    return {
      ...policy,
      environment: mode,
      pixelId,
      storefrontOrigin,
      commerceOrigin,
      isolationReady: flag(env.TRACKING_ISOLATION_READY) && policy.isolationReady,
      runtimeEnabled: flag(env.META_RUNTIME_ENABLED) && policy.runtimeEnabled,
      pixelEnabled: flag(env.META_PIXEL_ENABLED) && policy.pixelEnabled,
      capiEnabled: flag(env.META_CAPI_ENABLED) && policy.capiEnabled,
    };
  } catch { return base; }
}

/** Never return this object to a browser or log it. */
export function getServerTrackingConfig(env: TrackingEnvironment = process.env) {
  const graphVersion = env.META_GRAPH_API_VERSION?.trim() ?? "";
  return {
    accessToken: env.META_CAPI_ACCESS_TOKEN?.trim() ?? "",
    pixelId: getTrackingRuntimePolicy(env).pixelId,
    graphVersion: /^v\d+\.\d+$/.test(graphVersion) ? graphVersion : null,
    testEventCode: env.META_ENVIRONMENT === "production" ? null : env.META_TEST_EVENT_CODE?.trim() || null,
    debug: env.NODE_ENV !== "production" && env.META_DEBUG === "true",
    workerSecret: env.META_WORKER_SECRET?.trim() ?? "",
  };
}
