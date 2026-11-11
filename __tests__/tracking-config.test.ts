import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getServerTrackingConfig, getTrackingRuntimePolicy } from "@/lib/analytics/config";
import { approvedTestPolicy } from "./fixtures/tracking-policy";

const folders: string[] = [];
afterEach(() => { for (const path of folders.splice(0)) rmSync(path, { recursive: true, force: true }); });
function config() {
  const folder = mkdtempSync(join(tmpdir(), "bangbuy-policy-")); folders.push(folder);
  const path = join(folder, "policy.json");
  writeFileSync(path, JSON.stringify(approvedTestPolicy()));
  const env = {
    NODE_ENV: "test", META_ENVIRONMENT: "test", META_POLICY_FILE: path,
    META_RUNTIME_ENABLED: "true", META_PIXEL_ENABLED: "true", META_CAPI_ENABLED: "true", TRACKING_ISOLATION_READY: "true",
    STOREFRONT_ORIGIN: "https://public.example.test", COMMERCE_ORIGIN: "https://commerce.example.test",
    NEXT_PUBLIC_META_PIXEL_ID: "999999999999999", META_TEST_PIXEL_ID: "100000000000000",
  };
  return { path, env };
}
describe("runtime tracking configuration", () => {
  it("has no delivery without explicit configuration and approvals", () => { expect(getTrackingRuntimePolicy({}).runtimeEnabled).toBe(false); });
  it("server-only mode denies legacy browser and order-worker delivery despite enabled legacy configuration", () => {
    const { env } = config();
    const policy = getTrackingRuntimePolicy({ ...env, META_TRACKING_MODE: "server-only" });
    expect(policy.runtimeEnabled).toBe(false);
    expect(policy.pixelEnabled).toBe(false);
    expect(policy.capiEnabled).toBe(false);
    expect(policy.pixelId).toBeNull();
  });
  it("re-reads the runtime kill switch without a build or process restart", () => {
    const { path, env } = config();
    expect(getTrackingRuntimePolicy(env).runtimeEnabled).toBe(true);
    writeFileSync(path, JSON.stringify({ ...approvedTestPolicy(), runtimeEnabled: false }));
    expect(getTrackingRuntimePolicy(env).runtimeEnabled).toBe(false);
    expect(getTrackingRuntimePolicy({ ...env, META_RUNTIME_ENABLED: "false" }).runtimeEnabled).toBe(false);
  });
  it("fails closed on invalid, unreadable or stale policy manifests", () => {
    const { path, env } = config();
    for (const value of ["not json", JSON.stringify({ ...approvedTestPolicy(), policyVersion: "old" }), JSON.stringify({ ...approvedTestPolicy(), accessToken: "never public" })]) {
      writeFileSync(path, value); expect(getTrackingRuntimePolicy(env).runtimeEnabled).toBe(false);
    }
    expect(getTrackingRuntimePolicy({ ...env, META_POLICY_FILE: path + "-missing" }).runtimeEnabled).toBe(false);
  });
  it("prevents staging from using the production dataset and requires HTTPS origins in production", () => {
    const { env } = config();
    expect(getTrackingRuntimePolicy({ ...env, META_TEST_PIXEL_ID: env.NEXT_PUBLIC_META_PIXEL_ID }).runtimeEnabled).toBe(false);
    expect(getTrackingRuntimePolicy({ ...env, NODE_ENV: "production", META_ENVIRONMENT: "production", STOREFRONT_ORIGIN: "http://public.localhost" }).storefrontOrigin).toBeNull();
  });
  it("does not expose tokens or enable production diagnostics", () => {
    const { env } = config();
    const secretEnv = { ...env, META_CAPI_ACCESS_TOKEN: "SYNTHETIC_SECRET", META_WORKER_SECRET: "SYNTHETIC_WORKER", META_GRAPH_API_VERSION: "v99.0", META_DEBUG: "true" };
    expect(JSON.stringify(getTrackingRuntimePolicy(secretEnv))).not.toContain("SYNTHETIC");
    expect(getServerTrackingConfig({ ...secretEnv, NODE_ENV: "production" }).debug).toBe(false);
    expect(getServerTrackingConfig(secretEnv).accessToken).toBe("SYNTHETIC_SECRET");
  });
  it("ships only a denied example manifest", () => {
    const file = JSON.parse(readFileSync(join(process.cwd(), "config/meta-policy.example.json"), "utf8"));
    expect(file.routes).toEqual([]); expect(file.business.approved).toBe(false); expect(file.runtimeEnabled).toBe(false);
  });
});
