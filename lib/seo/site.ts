/**
 * Central SEO/site configuration for BangBuy.
 *
 * Everything that the metadata helpers, JSON-LD builders, robots, and
 * sitemap need lives here so there is a single source of truth. The
 * production origin prefers `SITE_URL`, then `NEXT_PUBLIC_SITE_URL`, with a safe local
 * fallback — never hardcode localhost into shipped metadata.
 */

const PRODUCTION_SITE_URL = "https://bangbuy.net";
const LOCAL_SITE_URL = "http://localhost:3000";

type SiteUrlEnvironment = {
  NODE_ENV?: string;
  SITE_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

/** Resolve one canonical origin for metadata, sitemaps, robots, and JSON-LD. */
export function resolveSiteUrl(
  environment: SiteUrlEnvironment = process.env,
): string {
  const serverUrl = environment.SITE_URL?.trim();
  const publicUrl = environment.NEXT_PUBLIC_SITE_URL?.trim();
  let configured = serverUrl
    ? { name: "SITE_URL", value: serverUrl }
    : publicUrl
      ? { name: "NEXT_PUBLIC_SITE_URL", value: publicUrl }
      : null;
  const isProduction = environment.NODE_ENV === "production";

  // A developer's checked-out `.env` commonly keeps the legacy public value
  // on localhost. Do not let that client compatibility value poison a
  // production build when the canonical server-only variable is absent.
  if (!serverUrl && publicUrl && isProduction) {
    try {
      if (isLocalHostname(new URL(publicUrl).hostname)) configured = null;
    } catch {
      // Preserve the normal validation error below for malformed values.
    }
  }

  if (!configured) {
    return isProduction ? PRODUCTION_SITE_URL : LOCAL_SITE_URL;
  }

  let parsed: URL;
  try {
    parsed = new URL(configured.value);
  } catch {
    throw new Error(
      `${configured.name} must be an absolute http(s) origin without a path, query, or hash.`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${configured.name} must use the http or https protocol.`);
  }
  if (parsed.username || parsed.password) {
    throw new Error(`${configured.name} must not contain credentials.`);
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(`${configured.name} must contain only an origin.`);
  }
  if (
    parsed.protocol !== "https:" &&
    (isProduction || !isLocalHostname(parsed.hostname))
  ) {
    throw new Error(
      `${configured.name} must use https; plain http is only allowed for local development.`,
    );
  }

  return parsed.origin;
}

const normalizedUrl = resolveSiteUrl({
  NODE_ENV: process.env.NODE_ENV,
  SITE_URL: process.env.SITE_URL,
  // Keep this direct access so Next.js can inline the public compatibility
  // value in Client Components that consume non-sensitive brand settings.
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const siteConfig = {
  /** Brand / website name. */
  name: "BangBuy",
  /** Short name for PWA-style metadata (application name). */
  shortName: "BangBuy",
  /** Absolute canonical origin with no trailing slash. */
  url: normalizedUrl,
  /** Default, e-commerce-focused site description. */
  description:
    "BangBuy is your trusted online shopping destination. Discover quality electronics, fashion, and home essentials with secure checkout, fast delivery, and great prices in BDT.",
  /** Default keyword set used as a baseline across the storefront. */
  keywords: [
    "BangBuy",
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
  author: "BangBuy",
  creator: "BangBuy",
  publisher: "BangBuy",
  /**
   * Business contact details — single source of truth for the contact
   * page, policy callouts, footer, and PDF documents.
   */
  contact: {
    /** Public support email. */
    email: "BangBuy@gmail.com",
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
