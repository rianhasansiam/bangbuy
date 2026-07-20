/**
 * Central SEO/site configuration for PixoHouse.
 *
 * Everything that the metadata helpers, JSON-LD builders, robots, and
 * sitemap need lives here so there is a single source of truth. The
 * production origin comes from `NEXT_PUBLIC_SITE_URL` with a safe local
 * fallback — never hardcode localhost into shipped metadata.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Strip a trailing slash so URL composition (`${url}${path}`) never
// produces a double slash.
const normalizedUrl = siteUrl.replace(/\/+$/, "");

export const siteConfig = {
  /** Brand / website name. */
  name: "PixoHouse",
  /** Short name for PWA-style metadata (application name). */
  shortName: "PixoHouse",
  /** Absolute production origin, e.g. https://pixohouse.tech (no trailing slash). */
  url: normalizedUrl,
  /** Default, e-commerce-focused site description. */
  description:
    "PixoHouse is your trusted online shopping destination. Discover quality electronics, fashion, and home essentials with secure checkout, fast delivery, and great prices in BDT.",
  /** Default keyword set used as a baseline across the storefront. */
  keywords: [
    "PixoHouse",
    "online shopping",
    "ecommerce",
    "buy online",
    "electronics",
    "fashion",
    "home essentials",
    "online store",
    "deals",
    "BDT shopping",
  ],
  /** Open Graph locale. */
  locale: "en_US",
  /** Store currency (ISO 4217) — used in Product offers JSON-LD. */
  currency: "BDT",
  author: "PixoHouse",
  creator: "PixoHouse",
  publisher: "PixoHouse",
  /**
   * Business contact details — single source of truth for the contact
   * page, policy callouts, footer, and PDF documents.
   */
  contact: {
    /** Public support email. */
    email: "pixohouse@gmail.com",
    /** Local Bangladeshi mobile number (display + tel: form). */
    phone: "01932600504",
    /** International (E.164) form for `tel:` links. */
    phoneIntl: "+8801932600504",
    /** Physical / HQ address. */
    address: "Mirpur, Dhaka, Bangladesh",
  },
  /**
   * Default / fallback Open Graph image (absolute URL). Used on the home
   * page and any page whose own image is missing. The brand logo is the
   * only real image asset available, so it doubles as the social card.
   */
  ogImage: `${normalizedUrl}/logo/logo.png`,
  /** Brand logo (absolute URL) — used in Organization JSON-LD. */
  logo: `${normalizedUrl}/logo/logo.png`,
  /**
   * Real, verified social profiles only (kept truthful for `sameAs`).
   * Add more here as they are confirmed.
   */
  social: {
    facebook: "https://www.facebook.com/enterfly26",
  },
} as const;

/** Public profile URLs for Organization `sameAs`. */
export const socialProfiles: string[] = Object.values(
  siteConfig.social as Record<string, string>,
).filter((href) => typeof href === "string" && href.startsWith("http"));

/**
 * Build an absolute URL from a site-relative path.
 *
 * Accepts "/", "/products", "products/123", etc. and always returns a
 * fully-qualified URL rooted at `siteConfig.url`.
 */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${suffix === "/" ? "" : suffix}` || siteConfig.url;
}

export type SiteConfig = typeof siteConfig;
