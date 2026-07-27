Act as a senior Next.js SEO, caching, performance, and e-commerce architecture engineer.

PROJECT CONTEXT

Project name: BangBuy
Domain: bangbuy.net
Staging domain: www.bangbuy.net

BangBuy is a scalable, mobile-first B2B/B2C e-commerce platform for:

- Industrial automation and control products
- Electronics
- Daily essentials
- Toys
- Branded products
- Trending products

Technology stack:

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Ubuntu 24.04 staging server
- Standard HTTP caching
- Optional Nginx or hosting-provider reverse-proxy caching

Important constraint:


OBJECTIVE

Audit and implement production-ready technical SEO and performance improvements using:

- Static Site Generation
- Incremental Static Regeneration
- Next.js server-side caching
- Controlled on-demand cache revalidation
- Standard HTTP cache headers
- Optional reverse-proxy-compatible caching
- Dynamic metadata
- Canonical URLs
- Structured data
- XML sitemaps
- robots.txt
- Image optimization
- Reduced client-side JavaScript
- Mobile-first performance improvements

WORKING RULES

Before changing code:

1. Inspect the complete existing repository.
2. Identify the installed Next.js and React versions.
3. Check whether Cache Components are enabled.
4. Inspect the current rendering, fetching and caching architecture.
5. Identify all public, authenticated and administrative routes.
6. Inspect the Prisma schema and catalog relationships.
7. Find existing metadata, sitemap, robots and JSON-LD implementations.
8. Find every mutation that can update products, categories, brands, reviews, inventory, prices or public content.
9. Check the current deployment and reverse-proxy configuration if it exists.
10. Run the existing lint, type-check, test and build commands to establish a baseline.

Do not rewrite working architecture unnecessarily.

Use only caching and revalidation APIs supported by the installed Next.js version. Do not enable experimental features or Cache Components unless there is a clear architectural requirement.

Present a concise audit summary and implementation plan before editing. After that, implement the solution phase by phase. Do not stop after producing only a report.

1. ROUTE CLASSIFICATION

Create and document a rendering strategy for every route type.

Use the following target strategy unless the existing architecture requires a justified adjustment:

Public indexable routes:

- Homepage: SSG or ISR
- Product pages: SSG or ISR
- Category pages: SSG or ISR
- Nested category pages: SSG or ISR
- Brand pages: SSG or ISR
- Public content or article pages: SSG or ISR

Dynamic or private routes:

- Search results: dynamic and noindex by default
- Uncontrolled filter URLs: dynamic and noindex
- Cart: dynamic, private and noindex
- Checkout: dynamic, private and noindex
- Authentication: dynamic and noindex
- Customer account: dynamic, private and noindex
- Orders: dynamic, private and noindex
- Admin pages: dynamic, protected and noindex
- Sensitive API routes: never publicly cached

Avoid accessing cookies, headers or sessions from public layouts when doing so would force all public pages to become dynamic.

Never cache personalized, authenticated or user-specific HTML publicly.

2. STATIC GENERATION AND ISR

Implement static generation or ISR for public catalog and content pages.

Requirements:

- Pre-generate homepage, categories, brands and important products.
- Allow long-tail product pages to be generated and cached on demand.
- Use generateStaticParams where appropriate.
- Use time-based revalidation as a fallback.
- Use on-demand revalidation as the primary freshness mechanism.
- Return notFound() for missing, draft or unpublished entities.
- Keep temporarily out-of-stock products indexable if they may return.
- Ensure generated pages contain crawlable HTML without requiring client-side JavaScript.

Suggested fallback revalidation periods:

- Homepage and trending sections: 5–10 minutes
- Products: 10–15 minutes
- Categories and brands: 15–30 minutes
- Articles and public content: 1–6 hours

These periods are fallback protection. Product price, inventory and publication changes must trigger immediate on-demand revalidation.

3. CACHE ARCHITECTURE

Create a centralized caching and invalidation architecture.

Use a consistent cache-tag strategy, such as:

- product:{productId}
- product-slug:{slug}
- category:{categoryId}
- category-slug:{slug}
- category-tree
- brand:{brandId}
- brand-slug:{slug}
- catalog
- featured-products
- trending-products
- homepage
- product-reviews:{productId}
- sitemap

Use the correct cache APIs for the installed Next.js version.

Possible APIs may include:

- unstable_cache
- cacheTag
- revalidateTag
- updateTag
- revalidatePath

Do not use an API only because it appears in this prompt. First confirm that it matches the installed Next.js version and current caching model.

Create one centralized catalog cache-invalidation service. Mutation handlers and server actions should call this service only after the database mutation succeeds.

Avoid scattering unrelated revalidation calls throughout the project.

4. CACHE INVALIDATION MATRIX

Implement at least the following dependencies:

Product name, description, price, stock, image or specification update:

- Invalidate the product
- Invalidate its public product route
- Invalidate related category listings
- Invalidate its brand page
- Invalidate catalog caches
- Invalidate homepage when featured or trending
- Invalidate comparison data when applicable

Product slug update:

- Invalidate the old product path
- Invalidate the new product path
- Invalidate product slug tags
- Invalidate related listings
- Invalidate sitemap
- Create or preserve a permanent redirect from the old slug

Product publication status update:

- Invalidate the product
- Invalidate related categories and brand
- Invalidate homepage when applicable
- Invalidate sitemap

Product price or inventory update:

- Immediately invalidate the product Offer structured data
- Invalidate relevant product listings
- Invalidate homepage when the product is displayed there

Category update:

- Invalidate the category
- Invalidate parent and child category dependencies
- Invalidate category navigation and breadcrumbs
- Invalidate affected product pages when metadata changes
- Invalidate sitemap when its slug or publication state changes

Brand update:

- Invalidate the brand page
- Invalidate associated product metadata and listings
- Invalidate sitemap when its slug or publication state changes

Review update:

- Invalidate product review data
- Invalidate visible rating information
- Invalidate Product structured data

Featured or trending update:

- Invalidate homepage
- Invalidate affected public landing pages

Cache invalidation failure must be logged clearly. It must not roll back a successful database transaction unless the current architecture explicitly requires transactional cache behavior.

5. HTTP AND REVERSE-PROXY CACHING

Use standard HTTP caching compatible with the selected hosting environment.

Requirements:

- Public ISR pages may use controlled shared-cache headers when supported.
- Keep browser caching conservative when content can change frequently.
- Allow longer shared-cache TTLs only for safe public pages.
- Use stale-while-revalidate where appropriate and supported.
- Never publicly cache authenticated or personalized responses.
- Never cache cart, checkout, account, orders, admin or sensitive API responses.
- Private routes must use no-store or private cache behavior.
- Public cacheable responses must not unintentionally set authentication or session cookies.
- Do not assume Nginx proxy caching exists; inspect the deployment first.
- If reverse-proxy caching is recommended, provide a safe optional configuration separately.
- Do not modify server-wide Nginx configuration without explicit authorization.
- Ensure application-level Next.js caching still works without a reverse proxy.

Measure warm cached responses and uncached origin responses separately.

Target:

Warm public pages should achieve a TTFB below 200 ms under normal staging or production-like testing conditions, when technically realistic for the hosting environment.

6. SEO DATABASE AND DATA MODEL

Inspect whether relevant Prisma models contain the required SEO data.

Products should support, where applicable:

- slug
- seoTitle
- metaDescription
- ogImage
- isPublished
- updatedAt
- image alt text
- SKU
- MPN
- GTIN
- manufacturer
- brand
- price
- currency
- stock or availability
- item condition

Categories, brands and content should support:

- slug
- seoTitle
- metaDescription
- ogImage
- isPublished
- updatedAt
- unique introductory SEO content

If fields are missing, propose and implement the smallest safe Prisma schema update.

Do not generate destructive migrations. Preserve all existing data and relationships.

If slugs can change, implement a reliable redirect-history mechanism for old product, category and brand URLs.

7. URL AND INDEXING RULES

Use stable, descriptive, lowercase SEO slugs.

Preferred route patterns:

- /products/[slug]
- /categories/[...slug]
- /brands/[slug]
- /blog/[slug]

Requirements:

- Generate absolute canonical URLs.
- Normalize the production domain using a validated SITE_URL environment variable.
- Prevent duplicate URLs caused by uppercase characters, trailing slashes or unnecessary parameters.
- Remove tracking parameters from canonical URLs.
- Mark internal search results noindex by default.
- Mark uncontrolled sort and filter combinations noindex.
- Allow explicitly curated SEO filter landing pages to be indexable.
- Do not canonicalize every paginated URL to page one.
- Preserve useful paginated product discovery.
- Implement permanent redirects for changed slugs.
- Ensure unpublished pages are not included in navigation or sitemaps.
- Verify canonical URLs always point to valid, indexable pages.

8. METADATA

Configure the root metadata system.

Requirements:

- Configure metadataBase using the validated production SITE_URL.
- Add a root title template.
- Add a useful default title and description.
- Use generateMetadata for products, categories, brands and public content.
- Generate unique titles and descriptions.
- Add absolute canonical URLs.
- Add OpenGraph metadata.
- Add Twitter card metadata.
- Use real product, category or brand images for social sharing.
- Add appropriate noindex metadata to private and non-canonical pages.
- Avoid duplicate database queries between generateMetadata and page rendering.
- Do not generate metadata from untrusted HTML.

Provide sensible fallbacks when optional SEO fields are empty, but avoid producing identical metadata across many pages.

9. STRUCTURED DATA

Create reusable and XSS-safe JSON-LD utilities.

Implement, when supported by real data:

Global:

- Organization
- WebSite

Product pages:

- Product
- Offer
- Brand
- BreadcrumbList

Variants:

- ProductGroup only when genuine product variants exist in the data model

Include only real values:

- Product name
- Description
- Canonical URL
- Crawlable images
- SKU
- MPN
- GTIN
- Brand or manufacturer
- Price
- priceCurrency
- Availability
- itemCondition

Rules:

- Structured data must match the visible page content.
- Never invent ratings, reviews, prices, discounts or stock values.
- Add aggregateRating and reviews only when genuine data is visible.
- Do not output empty, undefined or invalid structured-data properties.
- Escape serialized JSON-LD safely to prevent script injection.

10. SITEMAP AND ROBOTS

Implement Next.js metadata routes using app/sitemap.ts and app/robots.ts, or an appropriate sitemap-sharding strategy.

Sitemap requirements:

- Include published products
- Include published categories
- Include published brands
- Include public content and articles
- Include only canonical, indexable URLs returning HTTP 200
- Use actual updatedAt values for lastModified
- Use the production SITE_URL
- Exclude search and filtered URLs
- Exclude cart and checkout
- Exclude authentication pages
- Exclude account and order pages
- Exclude admin pages
- Exclude API routes
- Exclude drafts and unpublished records
- Use sitemap indexes or sharding if the catalog is large

robots.txt requirements:

- Reference the production sitemap
- Prevent crawling of private utility areas where appropriate
- Do not treat robots.txt as authentication or authorization
- Do not block a URL when a crawler must access it to detect a noindex directive

11. IMAGE OPTIMIZATION

Audit all public catalog images.

Requirements:

- Use next/image where appropriate.
- Provide width and height.
- Provide correct responsive sizes.
- Add meaningful alt text.
- Prioritize only the primary LCP image.
- Lazy-load below-the-fold images.
- Avoid loading original oversized images in small cards.
- Prevent layout shifts by reserving image dimensions.
- Configure remote image domains safely.
- Ensure product images remain crawlable.
- Do not place important product information only inside images.

12. JAVASCRIPT AND MOBILE PERFORMANCE

Use React Server Components by default.

Requirements:

- Keep Client Components limited to interactive elements.
- Avoid marking entire pages or layouts with "use client".
- Keep filters, sliders, carousels and cart controls as small client islands.
- Dynamically import heavy non-critical components.
- Lazy-load below-the-fold sections.
- Reduce unnecessary global providers.
- Reduce unnecessary third-party scripts.
- Do not send complete product records to client components.
- Select only fields needed by each component.
- Avoid shipping large specification or catalog datasets to the browser.
- Use an optimized font-loading strategy.
- Prevent cumulative layout shift.
- Preserve accessible navigation and interactions on mobile devices.

13. INTERNAL LINKING AND CONTENT

Improve crawlability and catalog discovery.

Implement:

- Breadcrumb navigation
- Links from category pages to child categories
- Links from product pages to their category and brand
- Related-product links
- Featured and trending product links
- Clear category descriptions
- Unique brand-page descriptions
- Useful empty-state and out-of-stock handling

Do not create keyword-stuffed or automatically duplicated descriptions.

14. SECURITY AND PRIVACY

Caching and SEO changes must not weaken application security.

Requirements:

- Never include private user data in a publicly cached response.
- Never cache authentication, cart, checkout, account or admin content publicly.
- Never expose secrets through client-side environment variables.
- Continue enforcing authorization on the server.
- Do not rely on robots.txt or noindex for security.
- Sanitize JSON-LD output.
- Preserve existing rate limiting, validation and authorization controls.
- Do not change payment or authentication logic unless required to correct a directly related problem.

15. TESTING AND ACCEPTANCE CRITERIA

After implementation:

- Run lint.
- Run TypeScript type checking.
- Run automated tests.
- Run the production build.
- Report pre-existing failures separately from failures introduced by this work.
- Inspect representative generated HTML.
- Confirm indexable pages contain meaningful content without client JavaScript.
- Confirm each indexable page has a unique title and description.
- Confirm each indexable page has a correct canonical URL.
- Validate Product and BreadcrumbList JSON-LD.
- Confirm sitemap and robots routes are accessible.
- Confirm sitemap URLs use the production domain.
- Confirm sitemap entries return HTTP 200.
- Confirm drafts and private pages are excluded.
- Confirm public ISR pages are cached and revalidated correctly.
- Confirm authenticated and private pages use no-store or private caching.
- Update a test product and verify all dependent public caches refresh.
- Test old and new URLs after a slug change.
- Measure warm and uncached TTFB separately.
- Run mobile Lighthouse tests for:
  - Homepage
  - Product page
  - Category page
  - Brand page
- Check for hydration problems, layout shifts and broken structured data.

16. DELIVERABLES

Provide:

1. Short initial audit summary
2. Phase-by-phase implementation plan
3. Implemented code
4. List of modified files with explanations
5. Route rendering and caching strategy table
6. Cache-tag naming documentation
7. Cache-invalidation dependency matrix
8. Required environment variables
9. Optional reverse-proxy configuration recommendations
10. Database migration details, if any
11. Lint, type-check, test and build results
12. SEO validation results
13. Performance test results
14. Remaining risks and manual configuration steps
15. Rollback guidance for significant architectural changes

FINAL INSTRUCTION

Complete the implementation instead of only recommending changes.

Work carefully with the existing architecture and preserve unrelated functionality. Do not introduce Cloudflare or any Cloudflare-dependent solution.

If a requirement cannot be completed because credentials, production access or business data are missing, complete everything else and clearly document the exact blocker.