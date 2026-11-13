import { stripLocalePrefix } from "@/lib/i18n/paths";
import { getRegisteredLocales } from "@/lib/i18n/registry";

export type Surface = "public" | "private";
export type SurfaceOrigins = { storefront: string | null; commerce: string | null; separated: boolean };
type OriginEnvironment = { STOREFRONT_ORIGIN?: string; COMMERCE_ORIGIN?: string };

function origin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = process.env.NODE_ENV !== "production" && (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.hostname.endsWith(".localhost"));
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) return null;
    return url.origin;
  } catch { return null; }
}

/** Invalid, absent or identical origins keep the application on one private surface. */
export function getSurfaceOrigins(env: OriginEnvironment = { STOREFRONT_ORIGIN: process.env.STOREFRONT_ORIGIN, COMMERCE_ORIGIN: process.env.COMMERCE_ORIGIN }): SurfaceOrigins {
  const storefront = origin(env.STOREFRONT_ORIGIN);
  const commerce = origin(env.COMMERCE_ORIGIN);
  return { storefront, commerce, separated: Boolean(storefront && commerce && storefront !== commerce && new URL(storefront).hostname !== new URL(commerce).hostname) };
}

export function getBrowserSurfaceOrigins(): SurfaceOrigins {
  if (typeof document !== "undefined" && document.documentElement?.hasAttribute("data-surface-configured")) {
    // The server owns navigation destinations. A stale public build variable
    // cannot redirect a current shopping selection to a different origin.
    return getSurfaceOrigins({ STOREFRONT_ORIGIN: document.documentElement.getAttribute("data-storefront-origin") || undefined, COMMERCE_ORIGIN: document.documentElement.getAttribute("data-commerce-origin") || undefined });
  }
  if (typeof window === "undefined") return getSurfaceOrigins();
  return getSurfaceOrigins({ STOREFRONT_ORIGIN: process.env.NEXT_PUBLIC_STOREFRONT_ORIGIN, COMMERCE_ORIGIN: process.env.NEXT_PUBLIC_COMMERCE_ORIGIN });
}

/** Only known catalog and policy documents are public. Unknowns stay private. */
export function classifySurfacePath(pathname: string): Surface {
  const first = pathname.split("/")[1];
  // A syntactically valid but unknown three-letter segment is not an approved
  // locale homepage. The locale registry remains the supported path vocabulary.
  if (stripLocalePrefix(pathname) !== pathname && !getRegisteredLocales().some(locale => locale.code === first)) return "private";
  const path = stripLocalePrefix(pathname);
  return /^\/(?:$|products(?:\/[^/]+)?\/?$|categories(?:\/[^/]+)*\/?$|brands(?:\/[^/]+)?\/?$|about\/?$|privacy-policy\/?$|return-policy\/?$|terms-and-conditions\/?$)/.test(path) ? "public" : "private";
}

export function requestSurface(requestUrl: string, env?: OriginEnvironment): Surface | "unknown" {
  const config = getSurfaceOrigins(env);
  if (!config.separated) return "private";
  try {
    const actual = new URL(requestUrl).origin;
    return actual === config.storefront ? "public" : actual === config.commerce ? "private" : "unknown";
  } catch { return "unknown"; }
}

/** Next may use an internal upstream URL. Only an exactly configured Host can
 * select its externally configured origin; forwarded host/proto never decide it. */
export function resolveSurfaceRequestUrl(request: Pick<Request, "url" | "headers">, env?: OriginEnvironment): string | null {
  const origins = getSurfaceOrigins(env);
  if (!origins.separated) return request.url;
  const host = request.headers.get("host");
  if (!host) return requestSurface(request.url, env) === "unknown" ? null : request.url;
  const allowed = [origins.storefront!, origins.commerce!].find(candidate => new URL(candidate).host === host.toLowerCase());
  if (!allowed) return null;
  const url = new URL(request.url);
  const canonical = new URL(allowed);
  url.protocol = canonical.protocol; url.hostname = canonical.hostname; url.port = canonical.port;
  return url.toString();
}

/** Explicit anonymous operations only. Never expose session, user, cart or order handlers. */
export function isPublicApiAllowed(pathname: string, method: string): boolean {
  if (method === "GET" && /^\/api\/(?:products(?:\/[^/]+)?|categories(?:\/[^/]+)?|brands(?:\/[^/]+)?|manufacturers(?:\/[^/]+)?|reviews|catalog\/(?:search|facets))$/.test(pathname)) return true;
  return /^\/api\/public\/language$/.test(pathname) && ["GET", "POST"].includes(method);
}

/** Only relative first-party navigation is remapped. No caller-supplied origin is trusted. */
export function surfaceHref(href: string, origins: SurfaceOrigins): string {
  if (!href.startsWith("/") || href.startsWith("//") || !origins.separated) return href;
  const path = href.split(/[?#]/, 1)[0];
  return (classifySurfacePath(path) === "public" ? origins.storefront : origins.commerce) + href;
}

export function needsDocumentNavigation(current: string, destination: string, origins: SurfaceOrigins): boolean {
  try {
    const from = new URL(current);
    const to = new URL(destination, from);
    return to.origin !== from.origin || classifySurfacePath(from.pathname) === "public" || classifySurfacePath(to.pathname) === "public" || Boolean(origins.separated && from.origin === origins.storefront);
  } catch { return true; }
}
