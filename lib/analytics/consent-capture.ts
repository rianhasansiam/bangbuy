import { CURRENT_TRACKING_POLICY_VERSION, MARKETING_CONSENT_MAX_AGE_SECONDS } from "./consent";
import { approvedMatchingFields, evaluateTrackingContext, trackingRuntimePolicySchema, type TrackingContext, type TrackingRuntimePolicy } from "./policy";
import type { TrackingMatchingField } from "./events";
import { permittedMatchingSchema } from "./conversion-contract";

type OptionalConsentCapture = { context?: TrackingContext; matching?: Partial<Record<TrackingMatchingField, string>> };

/** This first-party fingerprint remains server-side. It never reads input values. */
export async function collectCurrentConversionContext(policy: TrackingRuntimePolicy): Promise<TrackingContext | null> {
  try {
    const url = new URL(window.location.href);
    if (url.search || url.hash || url.username || url.password || ![policy.storefrontOrigin, policy.commerceOrigin].includes(url.origin)) return null;
    const original = document.querySelector("[data-tracking-content]") ?? document.querySelector("main");
    if (!original) return null;
    const wrapper = original.cloneNode(true) as HTMLElement;
    for (const control of wrapper.querySelectorAll("[data-consent-controls]")) control.remove();
    const ids = [...wrapper.querySelectorAll("[data-tracking-content-id]")].map((node) => node.getAttribute("data-tracking-content-id") ?? "").filter(Boolean);
    const products = [...wrapper.querySelectorAll("[data-tracking-product]")];
    for (const node of products) {
      const product = JSON.parse(node.getAttribute("data-tracking-product") ?? "null");
      if (product && typeof (product.productCode || product.productId) === "string") ids.push(product.productCode || product.productId);
    }
    const actual = JSON.stringify({
      title: document.title,
      metadata: [...document.querySelectorAll("meta[name],meta[property],link[rel=canonical],script[type='application/ld+json']")].map((node) => node.outerHTML).sort(),
      text: wrapper.textContent ?? "",
      links: [...wrapper.querySelectorAll("a")].map((node) => node.getAttribute("href")),
      images: [...wrapper.querySelectorAll("img")].map((node) => [node.getAttribute("src"), node.getAttribute("alt")]),
      products: products.map((node) => node.getAttribute("data-tracking-product")),
      publicSnapshots: [...document.querySelectorAll("[data-tracking-public-snapshot]")].map((node) => node.getAttribute("data-tracking-public-snapshot")),
    });
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(actual));
    const metadataFingerprint = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
    const route = policy.routes.find((entry) => entry.pathname === url.pathname && entry.channels.includes("server"));
    return { url: window.location.href, referrer: document.referrer, contentIds: [...new Set(ids)].sort(), classification: route?.classification ?? "unknown", metadataFingerprint };
  } catch { return null; }
}

function existingAttributionCookie(name: "_fbp" | "_fbc"): string | undefined {
  const raw = document.cookie.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`))?.slice(name.length + 1);
  if (!raw) return undefined;
  try {
    const value = decodeURIComponent(raw);
    const parsed = permittedMatchingSchema.shape[name === "_fbp" ? "fbp" : "fbc"].safeParse(value);
    return parsed.success ? parsed.data : undefined;
  } catch { return undefined; }
}

/** Call only inside the explicit grant action. Nothing is collected on mount,
 * before eligibility review, or from a denied/revoked choice. Existing approved
 * attribution is optional; no identifier is manufactured from a URL or device. */
export async function captureApprovedConsentContext(choice: "granted" | "denied" | "revoked"): Promise<OptionalConsentCapture> {
  if (choice !== "granted" || typeof window === "undefined") return {};
  try {
    const response = await fetch("/api/public/tracking-policy", { cache: "no-store", credentials: "same-origin", redirect: "error" });
    if (!response.ok) return {};
    const body = await response.json();
    const parsed = trackingRuntimePolicySchema.safeParse(body.policy);
    if (!parsed.success) return {};
    const policy = parsed.data;
    if (!policy.capiEnabled || !policy.runtimeEnabled) return {};
    const fields = approvedMatchingFields(policy);
    if (!fields.includes("client_user_agent") || !fields.some((field) => field === "fbp" || field === "fbc")) return {};
    const context = await collectCurrentConversionContext(policy);
    if (!context) return {};
    const now = Date.now();
    const consent = { state: "granted", policyVersion: CURRENT_TRACKING_POLICY_VERSION, occurredAt: new Date(now).toISOString(), expiresAt: new Date(now + MARKETING_CONSENT_MAX_AGE_SECONDS * 1000).toISOString() };
    if (!["Purchase", "InitiateCheckout"].some((eventName) => evaluateTrackingContext({ policy, channel: "server", eventName: eventName as "Purchase" | "InitiateCheckout", consent, context, now }).allowed)) return {};
    if (new URL(window.location.href).origin === policy.commerceOrigin) {
      // Only the isolated private origin may consult a session, after the
      // explicit grant and eligibility checks. Public pages never hydrate it.
      const accountResponse = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin", redirect: "error" });
      if (!accountResponse.ok) return {};
      const account: unknown = await accountResponse.json();
      if (!account || typeof account !== "object" || !("user" in account) || !account.user || typeof account.user !== "object" || !("id" in account.user) || typeof account.user.id !== "string" || !account.user.id) return {};
    }
    // These reads occur only after consent and all context/field approvals pass.
    const fbp = fields.includes("fbp") ? existingAttributionCookie("_fbp") : undefined;
    const fbc = fields.includes("fbc") ? existingAttributionCookie("_fbc") : undefined;
    if (!fbp && !fbc) return {};
    const ua = navigator.userAgent;
    if (!permittedMatchingSchema.shape.client_user_agent.safeParse(ua).success) return {};
    return { context, matching: { client_user_agent: ua, ...(fbp ? { fbp } : {}), ...(fbc ? { fbc } : {}) } };
  } catch { return {}; }
}
