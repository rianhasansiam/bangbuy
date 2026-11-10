import { classifySurfacePath, getSurfaceOrigins } from "@/lib/security/surfaces";

/** Read-only tooling may review a configured public document, never a private
 * source URL or a conveniently stripped version of an unsafe URL. */
export function validateTrackingReviewUrl(value: string, env: { STOREFRONT_ORIGIN?: string; COMMERCE_ORIGIN?: string }): URL {
  const origins = getSurfaceOrigins(env);
  if (!origins.storefront || !origins.separated) throw new Error("Configure distinct storefront and commerce origins before reviewing tracking context.");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("A valid absolute public URL is required."); }
  if (url.username || url.password || url.search || url.hash || value.includes("?") || value.includes("#") || url.origin !== origins.storefront || classifySurfacePath(url.pathname) !== "public") throw new Error("Review requires a clean configured public URL without credentials, query or fragment.");
  return url;
}

export function isMarketingDestination(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return ["facebook.com", "facebook.net", "fbcdn.net", "googletagmanager.com", "google-analytics.com"].some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch { return true; }
}
