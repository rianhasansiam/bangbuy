# SEO and performance architecture

This document describes the storefront architecture implemented for Next.js 16.2.10. The application is the source of truth for rendering, metadata, cache policy, and invalidation. No Cloudflare dependency or server-wide Nginx change is part of this implementation.

## Route rendering strategy

| Route | Strategy | Freshness and behavior |
| --- | --- | --- |
| `/` | ISR | Revalidates every 600 seconds. Categories and active products are rendered on the server; the hero carousel is cached for 600 seconds. |
| `/products` | Dynamic SSR | Always renders query-specific HTML and metadata. Only clean `popular`, 12-item pages 1-20 use the 900-second catalog data cache; arbitrary searches, filters, sort orders, page sizes, and deep pages query the database directly. Facets use a separate 1800-second cache. |
| `/products/[slug]` | Hybrid ISR | The 100 most popular active products are generated at build time. Other active products generate on first request because `dynamicParams` is enabled. Route revalidation is 900 seconds and exact entity tags can expire embedded product, review, category, brand, manufacturer, and related-product data. |
| `/categories` | ISR | Active, effectively visible category tree; revalidates every 1800 seconds. |
| `/categories/[...segments]` | Hybrid ISR | The 100 active category paths with the highest product counts are generated at build time. Long-tail paths generate on demand and revalidate every 1800 seconds. Products from active descendants are included. |
| `/brands` | ISR | Active brand directory; revalidates every 1800 seconds. |
| `/brands/[slug]` | Hybrid ISR | The 100 active brands with the highest product counts are generated at build time. Long-tail brands generate on demand and revalidate every 1800 seconds. |
| `/about`, `/contact` | ISR | Declared revalidation is 3600 seconds. Testimonials use their own 3600-second tagged cache. |
| Policy pages | ISR | `/privacy-policy`, `/return-policy`, and `/terms-and-conditions` declare 21600-second revalidation. |
| `/sitemap.xml` | ISR metadata route | Regenerates every 3600 seconds and can be expired immediately by the `sitemap` tag/path. A database failure aborts regeneration so a partial sitemap is not cached. |
| `/robots.txt` | Metadata route | Allows the public site, blocks `/admin`, `/dashboard`, and `/api/`, and points to the canonical sitemap. |
| Auth and private customer routes | Dynamic SSR, noindex | Auth, cart, checkout, wishlist, profile, and orders layouts use `force-dynamic`, `noindex,nofollow`, and no canonical. They remain crawlable where appropriate so crawlers can read the page-level directive. |
| `/admin/**` | Dynamic SSR, noindex | Authenticated and authorization-checked on every request. Robots also blocks the route family. |
| `/api/**` | Private/no-store responses | Shared JSON responses emit `Cache-Control: private, no-cache, no-store`, `Expires: 0`, `Pragma: no-cache`, `Vary: Cookie, Authorization`, and `X-Content-Type-Options: nosniff`. |

The shared root layout reads the active category tree and top banner from 1800-second caches. Their tag expiry can therefore invalidate public pages that embedded the navigation or banner before a page's longer declared TTL.

### Catalog indexing rules

- Clean `/products` and clean pagination such as `/products?page=2` are indexable and self-canonicalize.
- Search, filter, alternate sort/page-size, unknown, repeated, or malformed query parameters are `noindex` and canonicalize to `/products`.
- Requested pages beyond the actual result set redirect to the real last page while preserving valid controls.
- Product, category, and brand slugs/paths are normalized to lowercase. A non-canonical case permanently redirects to the canonical URL.
- Missing or inactive catalog entities return 404 and their fallback metadata is `noindex`.
- A saved product, category, or brand slug/path change writes permanent redirect history in the same database transaction. Redirect chains are collapsed to the current destination.

## SEO data model and output

The root metadata supplies one title template, canonical origin, Open Graph/Twitter defaults, and indexing policy. Admin-authored metadata is converted to plain text and bounded before it is emitted.

- Products support `seoTitle`, `metaDescription`, `ogImage`, `gtin`, `itemCondition`, and per-image alt text.
- Categories and brands support `seoTitle`, `metaDescription`, and `ogImage`.
- Public pages emit canonical, Open Graph, Twitter, breadcrumb, and collection/product structured data as applicable.
- Product JSON-LD emits an offer with real price/currency/availability, identifiers only when present, and aggregate rating only from genuine review data. Confirm that the business meaning of `modelNumber` is a valid MPN before relying on it as `mpn`.
- Organization and WebSite JSON-LD are emitted once by the root layout. Only verified social profiles belong in `sameAs`.

## Cache design

`lib/cache/catalog-tags.ts` owns the catalog tag vocabulary. Dynamic values are normalized, length-bounded, and deterministically hashed when needed. Cached data automatically contributes tags to the Full Route Cache. Product pages also call `dependOnCatalogTags`, which attaches precise dependencies without serializing Prisma records into a second cache.

### Tag producers and consumers

| Tag | Produced or attached by | Main consumers |
| --- | --- | --- |
| `catalog`, `catalog-listings` | Bounded public catalog pages; cached category listings also use these tags | `/products`, catalog APIs, category/listing-derived data |
| `catalog-facets` | Public catalog facets cache | Filter controls on `/products` and `/api/catalog/facets` |
| `category-tree` | Active category tree, category detail/list caches, home-category data, facets, and category redirect lookups | Root navigation, home, category directory/detail, filters |
| `brand-directory` | Public brand directory cache | `/brands` and brand choices/counts |
| `homepage` | Home-category/product cache | `/` |
| `sitemap` | Sitemap Full Route Cache dependency | `/sitemap.xml` |
| `catalog-redirects` | Product/brand redirect lookup cache and category redirect lookup cache | Old product, category, and brand URLs |
| `product:<id>`, `product-slug:<slug>` | Product detail dependency marker, including related products | Product detail Full Route Cache entries |
| `product-reviews:<id>` | Product detail dependency marker | Rating, review list, and review JSON-LD on product detail |
| `category:<id>`, `category-path:<path>` | Category data cache and product detail dependency marker | Category pages and every product page embedding the category ancestry |
| `brand:<id>`, `brand-slug:<slug>` | Brand data cache and product detail dependency marker | Brand detail and product pages embedding brand data |
| `manufacturer:<id>` | Product detail dependency marker | Product pages embedding manufacturer data |

Supplemental tagged caches remain independent: `carousel-banners` (600 seconds), `deal-banners` and `promo-banners` (900), `top-banners` (1800), and `testimonials` (3600). Their admin writes must continue to revalidate the matching existing tags.

### Mutation invalidation matrix

| Mutation | Immediately expired data and paths |
| --- | --- |
| Product create/update/delete | Catalog listings/facets, brand directory, homepage, exact old/new product IDs and slugs, product route, category and all ancestor category paths, brand, manufacturer, and affected public paths. Product CRUD also expires redirects and sitemap; create/delete and status/category changes expire the category tree. |
| Category create/update/delete/reorder | Catalog/listings/facets, category tree, redirects, brand directory, homepage, sitemap, exact IDs and old/new paths, directory paths, and the category catch-all route pattern. |
| Brand create/update/delete | Catalog/listings/facets, exact ID and old/new slugs, brand directory, redirects, sitemap, brand paths, and every associated product dependency discovered by product ID. |
| Manufacturer create/update/delete | Catalog/listings/facets, exact manufacturer tag, and every associated product dependency discovered by product ID. |
| Checkout/order/cancel/return stock change | Every affected product snapshot, listing/facet/home/category/brand surfaces, and exact product paths. Sitemap is not expired for stock-only changes. |
| Review create/delete/moderation | Exact product and review dependencies plus rating-sensitive listing/facet/home/category/brand surfaces. |

Catalog invalidation uses `revalidateTag(tag, { expire: 0 })` and `revalidatePath`. It runs after the database transaction commits, attempts every tag/path independently, and logs failures instead of changing a successful mutation into an HTTP 500. If the cache backend fails, the configured time-based TTL is the fallback; alert on `[catalog-cache]` and `[cache]` errors.

## Canonical environment configuration

Set the canonical origin with the server-only `SITE_URL` variable:

```dotenv
SITE_URL=https://bangbuy.net
NEXT_PUBLIC_SITE_URL=https://bangbuy.net
```

`SITE_URL` takes precedence. `NEXT_PUBLIC_SITE_URL` remains only for compatibility and should match it. The resolver requires an absolute HTTP(S) origin without credentials, path, query, hash, or trailing route. Non-local production origins must use HTTPS. When no valid server value exists, production falls back to `https://bangbuy.net`; local development falls back to `http://localhost:3000`. A legacy localhost public value is deliberately ignored during a production build.

Changing the canonical origin requires a rebuild/redeploy because metadata, JSON-LD, robots, and sitemap output use this configuration during rendering/build. Validate a staging deployment before exposing it to crawlers; a wrong origin contaminates every canonical URL.

## Database migration and deployment

The additive migration is `prisma/migrations/20260722000000_catalog_seo_redirects/migration.sql`. It adds nullable SEO fields, the product condition enum/default, GTIN, permanent catalog redirects and indexes, and backfills only missing/blank product image alt text. The application can read the new columns during build-time static generation, so the migration must be deployed before the new build runs against that database.

Use a coordinated release:

1. Confirm `DATABASE_URL` targets the intended environment and take a database backup/snapshot.
2. Configure `SITE_URL`, aligned `NEXT_PUBLIC_SITE_URL`, database, Auth.js, and integration secrets in the deployment environment. Do not put production secrets in `.env.example`.
3. Install locked dependencies with `npm ci` (`postinstall` generates the Prisma client).
4. Run `npx prisma validate` and `npx prisma migrate status`. Treat the release migration as pending until status proves otherwise.
5. Apply the additive migration with `npx prisma migrate deploy`, then run `npx prisma generate` if the install lifecycle did not do so.
6. Run the correctness gates below, including `npm run build`, against the migrated schema.
7. Deploy/start the same tested artifact with `npm start` and perform the public/private smoke checks.

Do not use `prisma migrate dev` or `prisma migrate reset` in production. Do not enable admin slug/path editing on an instance whose database lacks `CatalogRedirect`.

## Sitemap capacity

The current sitemap is intentionally a single document. It includes static public routes and active products, active brands, and effectively active categories; product visibility also requires an active category ancestry. Dynamic entries use database `updatedAt`, while static content uses the maintained content date.

The sitemap protocol caps one file at 50,000 URLs and 50 MB uncompressed. Start sharding before approximately 45,000 total entries to leave rollout headroom. Replace the single query with stable, paged shards using Next's `generateSitemaps` API or an explicit sitemap index, keep every shard below both limits, and update `robots.txt` to advertise the index. Avoid offset-only partitions when rows are changing rapidly; stable ID/range partitioning prevents gaps and duplicates.

## Verification and performance runbook

### Release correctness gates

Run from the repository root with the release environment configured:

```powershell
npx prisma format
npx prisma validate
npx prisma migrate status
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

The focused regression coverage includes site URL validation, metadata sanitization/noindex behavior, JSON-LD truthfulness, products query indexing, cache admission, tag dependency/invalidation, API private headers, sitemap filtering/failure behavior, redirects/entity dependencies, validation, inventory, reviews, and category hierarchy behavior. The full test command remains the release gate; focused tests are diagnostic, not a substitute.

### Production-mode smoke checks

Start the built application and use representative active product, category, and brand slugs:

```powershell
npm start
curl.exe -I http://localhost:3000/
curl.exe -I http://localhost:3000/products/ACTIVE-PRODUCT-SLUG
curl.exe -I http://localhost:3000/categories/ACTIVE/CATEGORY-PATH
curl.exe -I http://localhost:3000/brands/ACTIVE-BRAND-SLUG
curl.exe -I http://localhost:3000/sitemap.xml
curl.exe -I http://localhost:3000/robots.txt
curl.exe -I http://localhost:3000/api/catalog/facets
```

Verify in returned HTML and browser developer tools:

- Exactly one correct canonical, title, description, Open Graph/Twitter set, and valid JSON-LD graph.
- Meaningful server-rendered headings, links, products, prices, stock state, and image alt text before hydration.
- Filter/search URLs are `noindex`; clean pagination self-canonicalizes; out-of-range pagination redirects.
- Inactive entities are 404; uppercase or historical slugs/paths permanently redirect (normally HTTP 308) to one lowercase destination without a chain.
- Sitemap contains only public entities, has real modification dates, and uses the configured HTTPS origin.
- Private layouts emit `noindex,nofollow` with no canonical. API responses remain private/no-store and vary on Cookie/Authorization.
- Browser console has no hydration errors and the network panel has no repeated catalog request loop.

### Invalidation acceptance test

Use a staging database and a disposable catalog record, not an unapproved production record:

1. Warm `/`, `/products`, the product detail, its category ancestry, its brand, and `/sitemap.xml` twice.
2. Through authenticated admin flows, change price/stock and confirm the next request reflects it on every embedding surface.
3. Add/delete or moderate a review and confirm rating/review JSON-LD changes without waiting for the 900-second TTL.
4. Change a slug/path and confirm the new canonical, the old permanent redirect, no redirect chain, and updated sitemap.
5. Move or deactivate a category and confirm descendants, navigation, filters, brand counts, 404 behavior, and sitemap visibility.
6. Restore/delete the disposable record and repeat the visibility checks.

For a multi-instance deployment, run this test across different instances. The default self-hosted cache is not sufficient if tag/path invalidation is not shared between instances; configure a supported shared cache/invalidation mechanism or use one application instance until that coordination exists.

### Mobile performance audit

Run Lighthouse against a production build with a warm cache for `/`, one representative product, one category, and one brand. Lighthouse defaults to mobile emulation:

```powershell
npx lighthouse http://localhost:3000/ --only-categories=performance,seo,best-practices,accessibility --output=html --output-path=lighthouse-home.html
npx lighthouse http://localhost:3000/products/ACTIVE-PRODUCT-SLUG --only-categories=performance,seo,best-practices,accessibility --output=html --output-path=lighthouse-product.html
npx lighthouse http://localhost:3000/categories/ACTIVE/CATEGORY-PATH --only-categories=performance,seo,best-practices,accessibility --output=html --output-path=lighthouse-category.html
npx lighthouse http://localhost:3000/brands/ACTIVE-BRAND-SLUG --only-categories=performance,seo,best-practices,accessibility --output=html --output-path=lighthouse-brand.html
```

Use an approved pinned Lighthouse version in CI. Record scores and trace evidence in the release artifact rather than claiming a score from development mode. Suggested release targets are LCP at or below 2.5 seconds, CLS at or below 0.1, no serious accessibility/SEO finding, and no regression in transferred JavaScript. Lighthouse cannot validate field INP; use real-user monitoring for the 200 ms INP target. Review the `next build` route output and browser coverage/trace before adding a bundle analyzer dependency.

## Operational risks and rollback

- **Pending migration:** Build-time product/category/brand queries can fail when generated Prisma code expects columns that are absent. Deploy the additive migration first.
- **Bad canonical configuration:** Incorrect `SITE_URL` affects all SEO surfaces. Correct the environment and rebuild; do not patch generated HTML at the proxy.
- **Invalidation failure:** Mutations intentionally stay successful when invalidation fails. Monitor errors; TTLs bound staleness, but inventory-sensitive incidents may require an application cache purge/redeploy.
- **Multiple instances:** Local cache state and on-demand invalidation may diverge. Verify a shared cache handler/coordination before scaling horizontally.
- **Unbounded dynamic queries:** Arbitrary product filters are intentionally uncached to prevent cache-key explosion. Monitor database/search load and add rate limiting or a dedicated search index if traffic requires it.
- **Sitemap growth:** The current generator loads all eligible rows. Shard before the protocol or memory limit is approached.
- **Structured-data accuracy:** GTIN, condition, MPN, price, availability, and reviews must remain truthful and visible on the page. Remove uncertain identifiers instead of inventing values.
- **Static content dates:** Update the sitemap's maintained static content date when static public copy materially changes.

For rollback, deploy the previous application artifact first. The migration is additive, so its new nullable columns, enums, indexes, and redirect table can normally remain while the older app runs. Do not automatically drop them: redirect history is SEO data, and the alt-text backfill is not exactly reversible. If a database rollback is mandatory, restore the verified pre-release snapshot or apply a separately reviewed down migration during a maintenance window. Purge application caches after either application or database rollback and repeat the smoke checks.

## Optional Nginx guidance

No Nginx configuration is changed by this work. If Nginx fronts the self-hosted application:

- Preserve upstream `Cache-Control`, `Vary`, `Set-Cookie`, status, and redirect headers. Do not replace application cache policy with a blanket proxy TTL.
- Cache `/_next/static/**` as immutable and allow `/_next/image`/public assets to follow their upstream headers. Enable gzip, or Brotli only when the installed module is supported, for text, CSS, JavaScript, SVG, and JSON.
- Do not proxy-cache HTML by default. Next tag/path invalidation does not purge an independent Nginx cache, so a second HTML cache can defeat read-after-write behavior.
- If HTML caching is later proven necessary, bypass `/api/**`, `/admin/**`, auth routes, `/cart`, `/checkout`, `/wishlist`, `/profile`, `/orders`, any request with Cookie or Authorization, and any response with `Set-Cookie` or `private`/`no-store`.
- Preserve the complete query string, including `_rsc`, and include relevant Next router/RSC request headers plus the upstream `Vary` dimensions in any cache key. Never serve an RSC payload as normal HTML or vice versa.
- Forward the original host and HTTPS scheme correctly, but continue to derive canonical URLs from `SITE_URL`, not untrusted request headers.

Prefer the application-only cache model until Nginx cache invalidation, RSC variation, authenticated bypass, and multi-instance behavior have explicit automated acceptance coverage.
