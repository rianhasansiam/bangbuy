import { absoluteUrl, siteConfig, socialProfiles } from "./site";

/**
 * Strongly-typed-ish JSON-LD builders for PixoHouse.
 *
 * Each helper returns a plain object ready to be serialized into a
 * `<script type="application/ld+json">` tag. We never invent data:
 * brand, SKU, ratings, etc. are only included when a real value is
 * passed in. Keys with `undefined` values are stripped before render.
 */

export type JsonLd = Record<string, unknown>;

/** Remove `undefined`/`null` values so we never emit empty JSON-LD fields. */
function prune<T extends JsonLd>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null),
  ) as T;
}

/** Organization schema for PixoHouse (use once, app-wide). */
export function organizationJsonLd(): JsonLd {
  return prune({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: siteConfig.logo,
    description: siteConfig.description,
    sameAs: socialProfiles.length > 0 ? socialProfiles : undefined,
  });
}

/**
 * WebSite schema with an optional SearchAction. PixoHouse's search routes
 * to `/products?search=<query>`, so we wire the SearchAction there.
 */
export function websiteJsonLd(): JsonLd {
  return prune({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

export type BreadcrumbItem = { name: string; path: string };

/** BreadcrumbList schema from an ordered list of {name, path} items. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type ProductJsonLdInput = {
  name: string;
  description: string;
  /** Image URLs (absolute or site-relative). At least one recommended. */
  images?: string[];
  /** Product detail path, e.g. `/products/<id>`. */
  path: string;
  /** Effective selling price (already resolved to sale price when valid). */
  price: number;
  currency?: string;
  /** Whether at least one variant is purchasable. */
  inStock: boolean;
  /** Category name, used as a hint only. */
  category?: string | null;
  /** Real SKU if available — omitted entirely when absent. */
  sku?: string | null;
  /** Real brand name if available — omitted entirely when absent. */
  brand?: string | null;
};

/**
 * Product schema for a product detail page.
 *
 * Only emits `offers`, `sku`, `brand`, `category` and `image` when real
 * values exist. No `aggregateRating`/`review` is ever fabricated — add
 * that separately only when backed by real review data.
 */
export function productJsonLd(input: ProductJsonLdInput): JsonLd {
  const url = absoluteUrl(input.path);
  const images = (input.images ?? [])
    .filter((src) => typeof src === "string" && src.length > 0)
    .map((src) => absoluteUrl(src));

  return prune({
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description.replace(/\s+/g, " ").trim(),
    url,
    image: images.length > 0 ? images : undefined,
    sku: input.sku ?? undefined,
    brand: input.brand ? { "@type": "Brand", name: input.brand } : undefined,
    category: input.category ?? undefined,
    offers: prune({
      "@type": "Offer",
      url,
      priceCurrency: input.currency ?? siteConfig.currency,
      price: Number.isFinite(input.price) ? input.price.toFixed(2) : undefined,
      availability: input.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
    }),
  });
}

/** CollectionPage schema for a category landing page. */
export function collectionPageJsonLd(input: {
  name: string;
  description?: string | null;
  path: string;
}): JsonLd {
  return prune({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description
      ? input.description.replace(/\s+/g, " ").trim()
      : undefined,
    url: absoluteUrl(input.path),
  });
}
