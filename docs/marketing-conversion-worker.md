# Marketing conversion outbox and worker

The optional CAPI implementation is disabled by default. It does not enable an external integration, approve the business or products, change payment rules, or prove that Events Manager has received an event. Apply the separate [isolation decision](adr-meta-tracking-isolation.md) and deployment runbook before enabling either adapter.

## Conversion authority and monetary basis

`lib/airwallex/services/airwallex-payment-verification.service.ts` is the shared authoritative path for verified webhook processing and authorized status reconciliation. Its first successful non-review transition writes the eligible Purchase record in the same transaction as payment success. Repeated observations return the existing business result. SSLCommerz uses the equivalent reviewed success transaction in `lib/payments/core/payment-status.service.ts`.

Purchase uses the locked payment's immutable amount and currency in major units, with its original saved paid timestamp. It includes merchandise after discounts, delivery and tax. It does not use current storefront FX, receipt parameters or a client amount. Airwallex's saved payment currency can differ from BDT accounting and the display currency. The adapter neither forces BDT nor converts everything to USD.

The shared checkout transaction records `OrderPlaced` internally and can record an approved server `InitiateCheckout` once an order has actually been established. The internal record contains no marketing payload and is never exported as Purchase. COD Purchase remains disabled: the existing ordinary administrative PAID mutation is not a dedicated evidence-backed collection contract. An alternative order-created definition needs a separate explicit decision and implementation review; it must count placed orders rather than collected revenue and must not emit another Purchase at later collection.

Each external record has an opaque UUID that becomes `event_id`, an original occurrence time, policy/consent references and a unique business-conversion key. The internal order reference and business key are never exported. Private browser receipt and payment screens do not provide conversion delivery. No existing paid orders are backfilled or replayed when tracking is enabled.

## Consent and approved context

Consent is independent of account identity. Only a host-scoped HttpOnly cookie bearer digest is stored. The private checkout service can read its own current consent and records an ancillary `MarketingOrderConsent` relation without adding credentials to ordinary order API fields. A public-origin consent cookie is never transferred to commerce.

The existing guest privacy contract limits guest checkout information to fulfillment and support. Guest orders therefore never receive a marketing consent linkage or external InitiateCheckout/Purchase record, even when generic business, route and consent approvals are present. They still receive internal OrderPlaced records and the complete shopping/payment journey. The worker repeats the account-association check before delivery. Future guest conversion reporting requires a separately approved privacy-contract change and implementation review; this task does not change the legal text or infer that generic consent overrides it.

Optional server context must be supplied only after an explicit grant through the same-origin consent endpoint. It must contain no query or fragment and have an individually approved server route and content manifest. A supplied request Referer must match the context URL. Private documents suppress Referer, so those requests instead require same-origin Fetch Metadata and the explicit current-document context; these headers alone do not attest to a page's contents. A real private checkout source must be reviewed truthfully; a convenient public landing page is not a replacement for the website where the conversion occurred. Metadata fingerprint and content IDs must describe the actual approved document. Without that approved contract, leave the delivery blocked.

The only supported matching fields are individually approved `fbp`, `fbc` and `client_user_agent`. They are not copied automatically from a request, contact record or account. Required browser identifiers cannot be manufactured. Email, phone, address, account ID, client IP and server/proxy IP are not exported. User agent is required for this website adapter and must be explicitly approved and consented. At least one real approved `fbp` or `fbc` is also required. Missing context or matching blocks delivery; it does not justify weakening the commerce privacy contract.

A new isolated commerce origin normally has neither Meta attribution cookie because it never loads Pixel. This implementation does not transfer the public origin's cookies or manufacture replacements. Consequently private conversion delivery remains blocked when matching is absent, even if CAPI credentials are configured. Any future cross-origin attribution contract needs its own explicit privacy approval and implementation review. Normal guest/account shopping and payment remain available throughout.

The worker rechecks current consent, its origin/version/time, the exact captured context, policy approval expiry, actual purchased product IDs, current business/payment state and runtime enablement. It checks consent and policy again immediately before network dispatch. New grants use new consent identities; they cannot revive events associated with an older denied or revoked grant.

## Additive migration and verification

The additive migration is `prisma/migrations/20261110000000_marketing_conversion_outbox/migration.sql`. It creates `MarketingConsent`, `MarketingOrderConsent` and `MarketingConversionOutbox`; it does not rewrite customer, order, stock or payment records. Generate the Prisma client when preparing a release. Apply the migration only using the normal reviewed deployment connection and backup process. This implementation task did not apply migrations to a production database.

Optional marketing inserts run inside a savepoint. If a table is unavailable or an insert fails, the service rolls back to that savepoint before commerce continues. Catching a PostgreSQL error without this rollback would leave the enclosing transaction aborted. Failure logging contains a fixed classification only. An optional-write failure can lose a marketing event, so monitor `OPTIONAL_WRITE_UNAVAILABLE`; payment correctness takes precedence.

The opt-in integration suite refuses non-loopback hosts and any database name other than `bangbuy_marketing_test`. It never reads the application `DATABASE_URL` or `.env`. Use an already migrated disposable local database and synthetic data:

```sh
MARKETING_TEST_DATABASE_URL=postgresql://test_user@127.0.0.1:56543/bangbuy_marketing_test npm test -- __tests__/marketing-outbox-database.test.ts
npm test -- __tests__/marketing-conversions.test.ts
```

The suite verifies actual authoritative payment transitions, webhook/status convergence, one logical Purchase under concurrent observations, real SQL savepoint rollback, enclosing transaction rollback, COD exclusions, immutable money, leased worker races, revocation and runtime file disablement. Provider HTTP tests use synthetic intercepted responses and never send a production conversion.

## Running the worker

The worker is a real awaited process. It is not an unawaited API request. Run it in the server runtime using private environment configuration:

```sh
npm run marketing:worker -- --status
npm run marketing:worker -- --cycles 1 --batch 20
npm run marketing:worker -- --cycles 1000000 --batch 20 --interval 5000
```

The equivalent direct command is `node --conditions=react-server --import tsx scripts/marketing-worker.ts`. The `react-server` condition permits imports of server-only application modules. `--status` returns grouped delivery state and sanitized failure counts without exposing URLs, matching data or credentials. SIGINT/SIGTERM stop further cycles after the current bounded batch.

Use the existing confirmed process manager. Historical host documentation identifies PM2; current SSH verification was unavailable. The parameterized [PM2 worker declaration](../deploy/pm2/marketing-worker.config.cjs) and protected-file launcher are prepared for that stack, pending confirmation of its current owner, `PM2_HOME`, Node binary and release paths. They introduce no separate service manager. See [database and worker deployment operations](deployment-database-and-worker.md) for the exact preflight, disabled startup, backup, migration and rollback sequence.

All instances must share the same PostgreSQL database and reviewed runtime policy file. Do not pass credentials on a command line. The launcher requires an owned, owner-only environment file outside the release tree and never falls back to the application's `.env`. Its default server/runtime flags are false, and its browser flag is always false. Deployment must grant only the required database permissions and protect the shared policy file. Server credentials remain outside `NEXT_PUBLIC` settings and source control. No production worker was installed, started or enabled during preparation.

## Delivery states and failure handling

The claim uses `FOR UPDATE SKIP LOCKED` and a two-minute lease. Each worker claims one row immediately before processing it; it does not pre-lease a large batch. Lease ownership guards final state changes, and expired leases can be claimed by another worker. HTTP requests time out after ten seconds.

There are at most six delivery attempts. Throttling, provider 5xx, malformed acknowledgements and network failures receive bounded exponential backoff beginning at 30 seconds. Permanent provider 4xx responses and exhausted attempts enter `DEAD_LETTER`. Failure details are fixed codes such as `HTTP_401` rather than response bodies or exception strings. Expiry is the earlier of the original event's seven-day limit and consent expiry. Revoked, changed or no longer approved contexts enter `SUPPRESSED`; missing required safe context enters `BLOCKED`. These terminal states do not become deliverable merely because configuration is enabled later.

Delivery is durable at-least-once processing with deduplication controls. A crash after provider acceptance and before persisting acknowledgement can resend the original event ID and occurrence time. This is not an unlimited exactly-once guarantee. The current design sends private conversions only through the server adapter, so it does not generate an independent browser Purchase ID.

Before any requeue, investigate the grouped status and review the original unchanged identity/time, eligibility, consent and expiry. Do not reset denied/expired records or invent a new occurrence time to evade provider limits. No automatic requeue of blocked or dead-letter records is supplied.

## Configuration and runtime stop

`META_CAPI_ENABLED` is separate from `META_PIXEL_ENABLED`. Both require `META_RUNTIME_ENABLED`, a current approved manifest and active origin isolation. `META_CAPI_ACCESS_TOKEN` and `META_GRAPH_API_VERSION` are server-only. A staging worker requires a distinct test Pixel and `META_TEST_EVENT_CODE`; it refuses a missing test code. Production rejects a test-event code. No managed CAPI or partner integration is enabled implicitly.

Atomically replace the shared policy file with `runtimeEnabled: false` to stop new worker dispatch without a client rebuild or process restart. Each record is checked against that file, including a final check before HTTP. All instances must observe the changed file. Stop the worker process as an additional operational measure. Consent revocation suppresses unsent records. Neither stopping the worker nor withdrawal recalls a request already sent; an in-flight acceptance/persistence race can still require reconciliation.

For rollback, disable runtime delivery first, stop the worker and restore the previous application release/configuration through the normal release process. Retain the additive tables and their evidence; do not drop them to roll back application code. Recheck private-page SDK/CSP isolation before any later re-enable.

## Payment CSP verification scope

The installed Airwallex integration calls `init({enabledElements: ['payments']})` and `payments.redirectToCheckout()` in `AirwallexPayButton.tsx`. Components SDK 1.35.1 loads its controller from `static.airwallex.com` and its payment bundle from `checkout.airwallex.com`, with corresponding demo/sandbox subdomains. Its observability endpoints use Airwallex subdomains. The private CSP explicitly permits these Airwallex destinations and retained SSLCommerz destinations while excluding Meta script, connection and image destinations.

This application does not mount embedded Google Pay, Apple Pay, card or Drop-in elements. Wallet entry and issuer 3DS happen after navigation to the Airwallex-hosted document, whose provider CSP governs those frames. The merchant policy therefore does not add arbitrary wallet or issuer HTTPS allowances. See [Airwallex hosted checkout quickstart](https://www.airwallex.com/docs/payments/get-started/quickstart) and [Airwallex.js hosted payment page](https://www.airwallex.com/docs/js/payments/hosted-payment-page). The CSP contract tests check installed SDK hosts and current integration mode; they do not prove live wallet or 3DS success. Sandbox hosted redirects, cancellation, retry, wallet availability and 3DS remain deployment verification gates. A later switch to embedded elements requires a fresh provider-domain audit.

## Browser controls and external settings

The current official Pixel advanced documentation specifies `fbq('set', 'autoConfig', false, pixelId)` above `init` to disable additional button-click and page-metadata configuration. The consent documentation specifies `fbq('consent', 'revoke')` before initialization and `grant` only after affirmative consent. The public adapter uses these controls and passes no advanced-matching customer object to `init`. See [Meta Pixel advanced configuration](https://developers.facebook.com/documentation/meta-pixel/advanced/) and [Meta Pixel consent controls](https://developers.facebook.com/documentation/meta-pixel/implementation/gdpr/).

The public SDK source retrieved during implementation also exposes per-Pixel opt-out controls for AutomaticSetup and AutomaticMatching features and a `disablePushState` property. The adapter uses these as additional controls. They are observations of the current SDK, not a durable public isolation guarantee. Full document navigation and distinct origins remain the boundaries; removing a script element or changing an internal flag does not unload executed JavaScript.

Before any approved staging release, the dataset owner must review and disable automatic advanced matching and automatic events without code for this integration, remove overlapping Event Setup Tool rules for the application-owned events, and identify any separately installed Pixel, tag-manager or partner integration. Unrelated valid rules need their own review rather than blanket deletion. Managed CAPI, CAPI Gateway and partner integrations must remain off unless separately approved and coordinated; this code enables none of them. No account setting or business approval was changed or verified here.

## Provider documentation and live review

The website projection follows Meta's documented `event_name`, original `event_time`, `event_id`, `action_source`, `event_source_url`, `user_data` and `custom_data` fields. Website events require truthful source context and client user agent; retries retain event identity and time. See [Meta server event parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event/) and [Meta customer information parameters](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters/). Developer-page requests were throttled through one retrieval tool; the current official documentation was retrieved directly during implementation and the required fields were also checked against Meta's official source examples.

An HTTP acknowledgement with `events_received: 1` records provider acceptance only. Live browser/network inspection and Events Manager Test Events under the intended approved dataset are separate release gates. No real customer data, production conversion, Events Manager approval or live delivery was verified by the automated tests.
