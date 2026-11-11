import { lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, sep } from "node:path";
import { parse } from "dotenv";

/** Read configuration without logging values or putting secrets in PM2 metadata. */
export function readProtectedEnvironment(file, { releaseRoot } = {}) {
  if (!file || !isAbsolute(file)) throw new Error("An absolute protected environment file is required.");
  if (!lstatSync(file).isFile()) throw new Error("The protected environment must not be a symlink.");
  const path = realpathSync(file);
  const stat = statSync(path);
  if (!stat.isFile() || stat.size > 128 * 1024) throw new Error("The protected environment must be a bounded regular file.");
  if (stat.mode & 0o077) throw new Error("The protected environment file must have owner-only permissions.");
  if (typeof process.getuid === "function" && stat.uid !== process.getuid()) throw new Error("The service owner must own its environment file.");
  if (releaseRoot) {
    const within = relative(realpathSync(releaseRoot), path);
    const outside = within === ".." || within.startsWith(`..${sep}`) || isAbsolute(within);
    if (!outside) throw new Error("Keep the protected environment outside the release checkout.");
  }
  const values = parse(readFileSync(path));
  if (Object.keys(values).some(key => /^NEXT_PUBLIC_.*(?:CAPI|TOKEN|SECRET|PASSWORD|PRIVATE)/i.test(key))) throw new Error("Server credentials must not use public environment names.");
  return values;
}

/** Stale PM2/shell or Next dotenv configuration must never enable delivery. */
export function loadApplicationEnvironment(file, { releaseRoot, inherited = process.env } = {}) {
  const supplied = readProtectedEnvironment(file, { releaseRoot });
  const safe = Object.fromEntries(Object.entries(inherited).filter(([key]) =>
    !key.startsWith("META_") && !key.startsWith("NEXT_PUBLIC_META_") &&
    !key.startsWith("DOTENV_") && key !== "TRACKING_ISOLATION_READY"));
  return {
    ...safe,
    // Explicit empty/default values also prevent Next from filling missing keys
    // from a stale release .env during `next start`.
    META_ENVIRONMENT: "disabled", META_POLICY_FILE: "", META_CAPI_ACCESS_TOKEN: "",
    META_TRACKING_MODE: "isolated", META_PUBLIC_CAPI_POLICY_FILE: "", META_PUBLIC_CAPI_CONSENT_SECRET: "",
    META_GRAPH_API_VERSION: "", META_WORKER_SECRET: "", META_TEST_PIXEL_ID: "",
    META_TEST_EVENT_CODE: "", NEXT_PUBLIC_META_PIXEL_ID: "",
    META_COD_CONVERSION_DEFINITION: "disabled",
    ...supplied,
    META_RUNTIME_ENABLED: supplied.META_RUNTIME_ENABLED === "true" ? "true" : "false",
    META_PIXEL_ENABLED: supplied.META_PIXEL_ENABLED === "true" ? "true" : "false",
    META_CAPI_ENABLED: supplied.META_CAPI_ENABLED === "true" ? "true" : "false",
    META_PUBLIC_CAPI_ENABLED: supplied.META_PUBLIC_CAPI_ENABLED === "true" ? "true" : "false",
    META_PUBLIC_CAPI_TRUST_PROXY: supplied.META_PUBLIC_CAPI_TRUST_PROXY === "true" ? "true" : "false",
    TRACKING_ISOLATION_READY: supplied.TRACKING_ISOLATION_READY === "true" ? "true" : "false",
    META_DEBUG: "false",
    NODE_ENV: "production",
  };
}
