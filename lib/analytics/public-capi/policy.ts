import "server-only";
import { lstatSync, readFileSync } from "node:fs";
import { z } from "zod";
import { classifySurfacePath } from "@/lib/security/surfaces";
import { PUBLIC_CAPI_POLICY_VERSION } from "./types";

export type PublicCapiEnvironment = Readonly<Record<string, string | undefined>>;
const approval = { approved: z.boolean(), reference: z.string().max(200), expiresAt: z.string().datetime().nullable() };
export function isCleanPublicPath(pathname: string): boolean {
  return pathname.length <= 2048 && /^\/(?!\/)/.test(pathname) && !/[?#\\%*]/.test(pathname) && new URL(pathname, "https://validation.invalid").pathname === pathname && classifySurfacePath(pathname) === "public";
}
export const publicCapiPolicySchema = z.object({
  policyVersion: z.literal(PUBLIC_CAPI_POLICY_VERSION),
  runtimeEnabled: z.boolean(),
  origins: z.array(z.string().max(256)).max(8),
  pixelId: z.string().regex(/^\d+$/).nullable(),
  business: z.object(approval).strict(),
  source: z.object({ ...approval, pixelId: z.string().regex(/^\d+$/).nullable() }).strict(),
  matching: z.object({ ...approval, fields: z.tuple([z.literal("client_ip_address"), z.literal("client_user_agent")]) }).strict(),
  routes: z.array(z.object({
    ...approval, pathname: z.string().refine(isCleanPublicPath), classification: z.literal("ordinary"), events: z.tuple([z.literal("PageView")]),
  }).strict()).max(200),
}).strict().superRefine((policy, context) => {
  if (new Set(policy.origins).size !== policy.origins.length || new Set(policy.routes.map(route => route.pathname)).size !== policy.routes.length) context.addIssue({ code: "custom", message: "Duplicate origins or routes are not permitted." });
});
export type PublicCapiPolicy = z.infer<typeof publicCapiPolicySchema>;
export type PublicCapiRuntime = {
  policy: PublicCapiPolicy | null;
  enabled: boolean;
  pixelId: string | null;
  accessToken: string;
  graphVersion: string;
  testEventCode: string | null;
  consentSecret: string | null;
  environment: string;
};

export function isApproved(approval: { approved: boolean; reference: string; expiresAt: string | null }, now: number): boolean {
  return approval.approved && Boolean(approval.reference.trim()) && approval.expiresAt !== null && Date.parse(approval.expiresAt) > now;
}

function validOrigin(value: string, allowLoopbackHttp: boolean): boolean {
  try {
    const url = new URL(value);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.hostname.endsWith(".localhost");
    return url.origin === value && !url.username && !url.password && !url.hostname.includes("*") && (url.protocol === "https:" || (allowLoopbackHttp && loopback && url.protocol === "http:"));
  } catch { return false; }
}

/** Every call re-reads the bounded manifest. There is no permissive fallback. */
export function getPublicCapiRuntime(env: PublicCapiEnvironment = process.env, now = Date.now()): PublicCapiRuntime {
  const environment = env.META_ENVIRONMENT ?? "disabled";
  const productionId = env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  const selectedId = environment === "production" ? productionId : env.META_TEST_PIXEL_ID?.trim() ?? "";
  const secret = env.META_PUBLIC_CAPI_CONSENT_SECRET ?? "";
  const result: PublicCapiRuntime = {
    policy: null, enabled: false, pixelId: /^\d+$/.test(selectedId) ? selectedId : null,
    accessToken: env.META_CAPI_ACCESS_TOKEN?.trim() ?? "", graphVersion: env.META_GRAPH_API_VERSION?.trim() ?? "",
    testEventCode: environment === "production" ? null : env.META_TEST_EVENT_CODE?.trim() || null,
    consentSecret: Buffer.byteLength(secret.trim(), "utf8") >= 32 && Buffer.byteLength(secret, "utf8") <= 4096 ? secret : null,
    environment,
  };
  try {
    const filename = env.META_PUBLIC_CAPI_POLICY_FILE;
    if (!filename) return result;
    const stat = lstatSync(filename);
    if (!stat.isFile() || stat.size > 64 * 1024) return result;
    const parsed = publicCapiPolicySchema.safeParse(JSON.parse(readFileSync(filename, "utf8")));
    if (!parsed.success) return result;
    const policy = parsed.data;
    const localTest = environment === "test" && env.NODE_ENV !== "production";
    if (!policy.origins.every(origin => validOrigin(origin, localTest))) return result;
    result.policy = policy;
    const production = environment === "production" && env.NODE_ENV === "production";
    const nonProduction = ["staging", "test"].includes(environment) && /^\d+$/.test(productionId) && selectedId !== productionId && Boolean(result.testEventCode);
    result.enabled = env.META_TRACKING_MODE === "server-only" && env.META_PUBLIC_CAPI_TRUST_PROXY === "true" && env.META_RUNTIME_ENABLED === "true" && env.META_CAPI_ENABLED === "true" && env.META_PUBLIC_CAPI_ENABLED === "true" && env.META_PIXEL_ENABLED === "false" &&
      (production || nonProduction) && policy.runtimeEnabled && policy.origins.length > 0 && result.pixelId !== null && policy.pixelId === result.pixelId && policy.source.pixelId === result.pixelId &&
      isApproved(policy.business, now) && isApproved(policy.source, now) && isApproved(policy.matching, now) && Boolean(result.consentSecret) && Boolean(result.accessToken) && /^v\d{1,3}\.\d{1,2}$/.test(result.graphVersion);
    return result;
  } catch { return result; }
}

/** Host is selected solely from the exact manifest allowlist, never forwarding headers. */
export function publicCapiRequestOrigin(request: Pick<Request, "headers">, runtime: PublicCapiRuntime): string | null {
  const host = request.headers.get("host")?.toLowerCase();
  if (!host || !runtime.policy) return null;
  return runtime.policy.origins.find(origin => new URL(origin).host === host) ?? null;
}

export function eligiblePublicCapiPaths(runtime: PublicCapiRuntime, now: number): string[] {
  return runtime.enabled ? runtime.policy!.routes.filter(route => isApproved(route, now)).map(route => route.pathname) : [];
}

export function approvedPublicCapiSource(sourceUrl: string, origin: string, runtime: PublicCapiRuntime, now: number): boolean {
  try {
    const url = new URL(sourceUrl);
    return runtime.enabled && sourceUrl.length <= 2048 && !/[?#]/.test(sourceUrl) && url.href === sourceUrl && url.origin === origin && !url.username && !url.password && isCleanPublicPath(url.pathname) && eligiblePublicCapiPaths(runtime, now).includes(url.pathname);
  } catch { return false; }
}
