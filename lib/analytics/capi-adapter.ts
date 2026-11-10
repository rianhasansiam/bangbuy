import "server-only";

import type { buildCapiProjection } from "./conversion-contract";

type Projection = Extract<ReturnType<typeof buildCapiProjection>, { allowed: true }>["event"];
export type CapiConfiguration = {
  pixelId: string;
  accessToken: string;
  graphVersion: string;
  testEventCode?: string;
  environment: "production" | "staging" | "development";
};
export type CapiDeliveryResult = { delivered: true } |
  { delivered: false; retry: boolean; code: string };

/** Secrets stay in a bearer header and never appear in a URL or diagnostics. */
export async function deliverCapiProjection(
  event: Projection,
  config: CapiConfiguration,
  send: typeof fetch = fetch,
): Promise<CapiDeliveryResult> {
  if (!/^\d+$/.test(config.pixelId) || !config.accessToken || !/^v\d{1,3}\.\d$/.test(config.graphVersion)) {
    return { delivered: false, retry: false, code: "CONFIGURATION_INVALID" };
  }
  if (config.environment !== "production" && !config.testEventCode) {
    return { delivered: false, retry: false, code: "TEST_DATASET_NOT_CONFIGURED" };
  }
  if (config.environment === "production" && config.testEventCode) {
    return { delivered: false, retry: false, code: "PRODUCTION_TEST_CODE_REJECTED" };
  }
  try {
    const response = await send(`https://graph.facebook.com/${config.graphVersion}/${config.pixelId}/events`, {
      method: "POST",
      headers: { authorization: `Bearer ${config.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ data: [event], ...(config.testEventCode ? { test_event_code: config.testEventCode } : {}) }),
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
      cache: "no-store",
      credentials: "omit",
    });
    if (!response.ok) {
      return { delivered: false, retry: response.status === 429 || response.status >= 500, code: `HTTP_${response.status}` };
    }
    const result: unknown = await response.json();
    // An acknowledgement is not Events Manager/live delivery verification.
    if (!result || typeof result !== "object" || (result as { events_received?: unknown }).events_received !== 1) {
      return { delivered: false, retry: true, code: "PROVIDER_ACKNOWLEDGEMENT_INVALID" };
    }
    return { delivered: true };
  } catch {
    return { delivered: false, retry: true, code: "NETWORK_FAILURE" };
  }
}
