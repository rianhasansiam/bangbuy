# Tracking release and verification runbook

The implementation is default denied. A configured Pixel ID, a successful build, an HTTP acknowledgement and a passing test suite do not approve the business or prove live event delivery. The [architecture decision](adr-meta-tracking-isolation.md), [origin migration runbook](meta-origin-isolation.md) and [conversion worker runbook](marketing-conversion-worker.md) describe separate responsibilities.

For deployment preparation, begin with the [current deployment runbook](deployment-runbook.md)
and [blocker matrix](deployment-blockers.md). Public discovery found two legacy
commerce hosts whose customer-state compatibility is not yet resolved; the
generic two-origin example must not be installed as a complete cutover plan.
Use the [activation checklist](tracking-activation.md) for the separate production
deployment and tracking decisions.

## Current event coverage

| Event | Implemented source | External delivery boundary |
| --- | --- | --- |
| PageView | Current committed public document | Browser adapter after origin, consent and full document approval |
| ViewContent | Approved product actually displayed in that document | Browser adapter after the same checks; prefetch cannot emit |
| AddToCart | Successful first-party cart mutation | Currently unreported externally because mutation occurs on the untracked commerce origin; clicking a handoff link is not cart success |
| InitiateCheckout | Successfully established registered order | Optional server outbox; requires separately approved consent, source and matching context |
| Purchase | Committed verified registered Airwallex or SSLCommerz payment success | Optional server outbox; no receipt, URL flag or browser intent trigger |
| OrderPlaced | Committed order | Internal only, including COD and guests |

Guest checkout data remains excluded from external conversions under the existing privacy contract, including when generic business or source approvals are supplied. COD Purchase is disabled because the existing administrative payment mutation does not establish a dedicated collection contract. Search, free text, AddPaymentInfo and automatic advanced matching are not application event sources. Missing server matching or a truthful approved source leaves the conversion unreported; it does not justify a tracked receipt page.

## Configuration and approvals

`.env.example` supplies nonsecret tracking defaults and preserves existing deployment-owned commerce settings. Keep database, authentication, payment and upload secrets in their established private environment. Configure distinct HTTPS storefront and commerce hosts and matching browser navigation origins. Keep the legacy commerce hostname untracked so existing sessions, guest receipts and carts remain accessible. Follow the origin migration runbook before marking isolation ready.

`config/meta-policy.example.json` deliberately contains no approvals. Copy it to a deployment-controlled file and set `META_POLICY_FILE` to that path. A reviewer must supply current policy version, explicit business and dataset approval references and expiry, exact approved route and channel entries, ordinary content classifications, every displayed or hydrated product ID, event and field approvals, and the actual document fingerprint. Unknown routes, classifications, fields, versions and query/fragment contexts remain denied. Review the actual URLs, referrers, title, metadata, JSON-LD, visible text, images and public hydrated snapshots. Do not invent a clean URL, rename a restricted activity or treat hashing as approval.

Mutable multi-slide banners veto SDK loading. Deferred content vetoes loading until ready. Public pagination and related expansion use a clean document before new catalog content appears. A content or metadata change invalidates its fingerprint. Known legacy cart, wishlist, saved-item, order and checkout-attribution storage on the public origin also vetoes SDK loading. This defense reads storage key names only; it does not replace the migration review or automatically erase a customer's commerce data.

Browser and server enablement are separate. Delivery requires the environment switch, runtime switch, isolation readiness and every applicable manifest approval together. `META_ENVIRONMENT=staging` or `test` selects `META_TEST_PIXEL_ID`, which must differ from the known production dataset. A staging CAPI worker also requires `META_TEST_EVENT_CODE`. Production debug output is disabled. Tokens and worker credentials are never `NEXT_PUBLIC` values.

Consent is versioned and scoped to its origin. Public catalog analytics and private checkout reporting require separate explicit choices; public consent is not copied into a private identity. Each origin exposes withdrawal controls, and same-origin tabs synchronize the necessary privacy preference. A failed server withdrawal leaves browser dispatch stopped and displays a retry error; it is not reported as a committed server revocation. Successful revocation suppresses unsent records linked to that grant. A later grant uses a new identity and cannot revive previously suppressed deliveries.

## Meta SDK controls and account settings

The browser uses the documented `autoConfig` false command before initialization and Meta consent revoke/grant commands. No advanced matching object is passed to initialization. Explicit events use `trackSingle` for the configured dataset and an opaque event ID. There is no noscript image, preconnect, preload, queued pre-consent replay, global SDK provider or private receipt workaround.

The adapter also sets `disablePushState` and opts out of automatic setup, matching and first-party cookie features present in the official SDK inspected during implementation. These internal switches are additional defenses, not a stable documented sandbox or a guarantee about future vendor storage behavior. Real root documents, separate origins, strict content policy and private CSP provide the application boundary. See [Meta advanced configuration](https://developers.facebook.com/documentation/meta-pixel/advanced), [Meta consent controls](https://developers.facebook.com/documentation/meta-pixel/implementation/gdpr) and [Meta event reference](https://developers.facebook.com/documentation/meta-pixel/reference).

Before approving a dataset, its owner must inspect Events Manager and disable automatic event collection, automatic advanced matching, detailed automatic page/product collection and Event Setup Tool rules that would create unreviewed or duplicate events. Inventory partner integrations, GTM, managed CAPI and any independently hosted sender; do not assume a warning identifies its source. No account setting was changed or verified by this implementation. Meta receives ordinary network context when its SDK is requested; a minimal application payload does not conceal the actual page or replace source eligibility review.

## Automated verification

Use synthetic data and disposable loopback PostgreSQL databases. The opt-in database suites reject remote hosts and unexpected database names. Do not point any test, seed, reset or development migration at the production tunnel.

```sh
npm test
npm run lint
npm run typecheck
npm run i18n:validate
npm run test:marketing:browser
npm run build
npm run tracking:check-build
```

The Chromium marketing runner bundles the actual public adapter and consent UI into a synthetic fixture. It intercepts every Meta destination and proves loading decisions, initialization counts, outbound event counts, hard navigation, private storage isolation, withdrawal, tabs, cached restoration, runtime disablement and blocked-network behavior. A cache-permissive synthetic segment requires an actual trusted BFCache restoration; normal no-store responses and application headers are preserved. It does not claim live Meta acceptance. `npm run test:commerce:isolation` separately builds and runs the actual Next.js application behind two temporary HTTPS hosts with a guarded local database; its source documents the exact invocation and seed scope.

Run the additional real database gates using already migrated disposable databases:

```sh
MARKETING_TEST_DATABASE_URL=postgresql://test_user@127.0.0.1:56543/bangbuy_marketing_test npm test -- __tests__/marketing-outbox-database.test.ts
GUEST_CHECKOUT_TEST_DATABASE_URL=postgresql://test_user@127.0.0.1:15439/bangbuy_guest_checkout_test npm test -- __tests__/guest-checkout-database.test.ts
```

Review import-boundary tests and the production browser asset inspection as well as HTTP behavior. The former follows private entry dependencies to prove the Pixel transport is unreachable; the latter checks compiled assets for server-only tracking configuration and synthetic secret sentinels. Passing only a mocked event function is insufficient.

## Infrastructure rollout

Prepare the two hosts, TLS, reviewed host routing, private API rejection, no credentialed CORS and redacted access logging using `deploy/nginx/surfaces.conf.example`. Both hosts reuse the same application and services. Preserve existing payment callback and webhook URLs on commerce. Never broaden cookie Domain. Validate Nginx before deployment; the example is not automatically installed.

Apply the additive consent/outbox migration through the normal approved migration connection and backup process. Do not reset or seed production. Generate the client, build, run the privacy and commerce smoke checks, and keep all delivery switches false during the origin rollout. Deploying the infrastructure and enabling tracking are separate steps requiring their own actual approvals. This implementation task does neither.

For an approved server channel, deploy the awaited worker under its own unprivileged service identity and protected server environment. Run `npm run marketing:worker -- --status` and inspect grouped blocked, suppressed, expired and dead-letter states. A new isolated private origin normally lacks real `_fbp` or `_fbc` attribution; no cross-origin attribution transfer is implemented. Missing approved identifiers blocks CAPI even with valid credentials. Do not manufacture identifiers or substitute a public landing URL for a conversion on checkout.

## Live verification after approval

Use a separate approved staging dataset and synthetic shopper. With consent unknown or denied, inspect network and HTML for zero SDK, tracking image and Meta connections. With valid consent and all document approvals, confirm one initialization and one expected event for the navigation. Inspect the actual payload, event ID, amount, currency, URL and referrer, then confirm that same event in Events Manager Test Events under the intended dataset. Browser network emission and Events Manager receipt are separate observations.

Verify direct and cross-origin private entry, account/cart/checkout/receipt content, new tabs, language switching, historical redirects, browser back and forward, withdrawal and runtime disablement. In payment sandbox, verify hosted launch, cancellation, retry, provider-confirmed success, delayed webhook and authorized status reconciliation. Repeated observations must retain the same logical server conversion. Confirm private CSP permits the current hosted payment integration and blocks Meta destinations. Do not charge a real customer or send a production conversion to make an automated test pass.

## Runtime stop and rollback

Atomically replace the shared manifest with `runtimeEnabled: false`. The browser fetches fresh runtime policy at each dispatch and after SDK loading; loaded public documents revalidate every five seconds and on restoration. Workers re-read policy for each record and immediately before delivery. Every instance must receive the changed file. A server environment flag is an additional stop at startup; the runtime file does not require a browser rebuild.

Withdrawal stops application dispatch synchronously and revokes SDK consent. A clean document removes an already executed runtime; removing a script element alone does not unload JavaScript. Neither withdrawal nor a kill switch recalls a request already sent, and polling has a bounded propagation interval. Stop the worker as an additional operational measure.

To roll back, disable marketing first, stop workers and restore the previous application and reverse-proxy release while retaining the legacy commerce host and payment callbacks. Preserve additive consent/outbox tables and their audit evidence. Re-run private SDK, authorization and payment checks before any later enablement. Do not drop tables or migrate bearer credentials as a rollback shortcut.
