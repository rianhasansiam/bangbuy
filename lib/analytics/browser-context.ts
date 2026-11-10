import { classifySurfacePath } from "@/lib/security/surfaces";
import type { TrackingContext, TrackingRuntimePolicy } from "./policy";

/** Fingerprint the actual document, including metadata, links and visible content. */
export async function collectBrowserTrackingContext(policy: TrackingRuntimePolicy): Promise<TrackingContext | null> {
  try {
    const url = new URL(window.location.href);
    const wrapper = document.querySelector("[data-tracking-content]");
    if (!wrapper || classifySurfacePath(url.pathname) !== "public" || document.querySelector("[data-tracking-pending],[data-tracking-mutable]")) return null;
    // Sensitive forms never belong in an SDK document, even if a stale manifest
    // accidentally approves the URL. Public numeric variant controls are safe.
    if (document.querySelector('input:not([type="number"]):not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="button"]):not([type="submit"]),textarea,[contenteditable="true"],[data-private-commerce]')) return null;
    const ids = [...wrapper.querySelectorAll("[data-tracking-content-id]")]
      .map((node) => node.getAttribute("data-tracking-content-id") ?? "").filter(Boolean);
    const products = [...wrapper.querySelectorAll("[data-tracking-product]")];
    for (const node of products) {
      const product = JSON.parse(node.getAttribute("data-tracking-product") ?? "null");
      if (product && typeof (product.productCode || product.productId) === "string") ids.push(product.productCode || product.productId);
    }
    const context = JSON.stringify({
      title: document.title,
      metadata: [...document.querySelectorAll("meta[name],meta[property],link[rel=canonical],script[type='application/ld+json']")]
        .map((node) => node.outerHTML).sort(),
      text: (wrapper as HTMLElement).innerText ?? wrapper.textContent ?? "",
      links: [...wrapper.querySelectorAll("a")].map((node) => node.getAttribute("href")),
      images: [...wrapper.querySelectorAll("img")].map((node) => [node.getAttribute("src"), node.getAttribute("alt")]),
      products: products.map((node) => node.getAttribute("data-tracking-product")),
      publicSnapshots: [...document.querySelectorAll("[data-tracking-public-snapshot]")].map((node) => node.getAttribute("data-tracking-public-snapshot")),
    });
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(context));
    const metadataFingerprint = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
    const route = policy.routes.find((entry) => entry.pathname === url.pathname && entry.channels.includes("browser"));
    return { url: window.location.href, referrer: document.referrer, contentIds: [...new Set(ids)].sort(), classification: route?.classification ?? "unknown", metadataFingerprint };
  } catch { return null; }
}
