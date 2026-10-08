# Meta Purchase tracking verification

Repository audit, repair, and release validation: **2026-10-08**. A read-only
Events Manager session did not expose the configured BangBuy dataset. No fresh
BangBuy events, its dashboard rules, production server configuration, or external
CAPI delivery were verified. Public storefront assets were inspected separately.
Passing repository checks does not establish Meta receipt or Diagnostics clearance.

## Confirmed findings and repair

- `lib/analytics/meta-pixel.ts` owns the application's direct Pixel calls;
  `app/layout.tsx` configures `NEXT_PUBLIC_META_PIXEL_ID`. No repository CAPI,
  GTM/dataLayer integration, or configurable injected marketing script was found.
  The warning's CAPI source therefore requires external investigation.
- Purchase previously shared `lib/analytics/ecommerce.ts`'s optional-total
  merchandise fallback. A missing Purchase value could become an invented item
  sum. `lib/analytics/purchase-payload.ts` now requires the explicit saved amount,
  supported currency, stable event ID, and original conversion timestamp.
- `lib/analytics/order-purchase.ts` and `order-purchase-browser.ts` excluded
  guests even though guest checkout and cookie-scoped order reads exist. Guest
  and registered checkout now share the verified payload and tracking rules.
- The previous adapter persisted a Purchase marker immediately after a bootstrap
  queue call. The repaired adapter keeps a pending snapshot until the SDK accepts
  a synchronous `trackSingle` handoff and scopes Purchase to the configured Pixel.
  A handoff still does **not** prove network delivery or Meta receipt.
- Invalid/deleted catalog metadata no longer discards an otherwise valid paid
  conversion. Valid product metadata is included; required value/currency never
  depend on product links. No checkout pricing or payment calculation is changed.

These are confirmed repository defects and coverage gaps. The existing normal
verified-payment path already supplied numeric values; this audit does not prove
which deployed or external source produced the reported 7% valid-value rate.

| Changed files | Purpose |
| --- | --- |
| `lib/analytics/order-purchase.ts` | Strict Decimal conversion, saved BDT/order/payment reconciliation, guest eligibility, original timestamp, safe validation diagnostics. |
| `lib/analytics/purchase-payload.ts` | Shared typed Purchase validation and required parameter construction without a merchandise fallback. |
| `lib/analytics/meta-pixel.ts` | Intended-Pixel delivery, stable pending snapshots, isolated retry copies, consent handling, SDK handoff markers. |
| `lib/analytics/order-purchase-browser.ts`, `app/(shop)/orders/[id]/components/OrderSummaryClient.tsx` | Cookie-authorized guest receipt support, owner and order/event identity checks. |
| `lib/analytics/purchase-diagnostics.ts` | Opt-in structured logging with allowlisted, sanitized fields. |
| `__tests__/order-purchase.test.ts`, `meta-pixel-browser.test.ts`, `meta-pixel-checkout.test.ts` | Expanded saved-money, payment, browser delivery, checkout/receipt and retry regression coverage. |
| `__tests__/order-purchase-guest.test.ts`, `purchase-payload.test.ts`, `purchase-diagnostics.test.ts` | Guest authorization, strict final boundary and diagnostic isolation tests. |
| This document and `docs/meta-pixel-tracking.md` | Current verification/runbook and a corrective link above historical findings. |
| `__tests__/product-card-responsive.test.ts` | Corrects stale fixed-height expectations; verifies complete image/action container placement while retaining responsive, compact sizing and keyboard-access assertions. ProductCard itself is unchanged. |
| `__tests__/meta-purchase-checkout-flow.test.ts`, `purchase-receipt-authorization.test.ts` | 70 additional flow/authorization tests across guest and registered checkout, both gateways, actual receipt/status effects, SQL scopes, cart clearing, redirects, exclusions, consent and retries. |
| `lib/services/upload.service.ts` | Prevents Turbopack from tracing persistent runtime upload files as release assets; retains filesystem checks and upload behavior. |

## Authority, totals, and conversion milestone

```text
Checkout request -> server validation and saved order/payment transaction
-> server-verified gateway success -> PAID and confirmed order, no payment review
-> order.service server snapshot -> shared Purchase validator
-> owner/cookie-scoped order API -> local checkout intent -> Pixel adapter
```

SSLCommerz verification is in `lib/payments/core/payment-verification.service.ts`
and `payment-status.service.ts`; Airwallex verification is in
`lib/airwallex/services/airwallex-payment-verification.service.ts`. Pending,
failed, cancelled, review-held payments, button clicks, and success URL flags do
not qualify. Exactly one matching successful gateway transaction is required.
The timestamp is the persisted payment `paidAt` in Unix seconds, and the ID is
`purchase:<orderId>` across reads, callbacks, and delivery retries.

`prisma/schema.prisma` stores money as `Decimal(12, 2)` **major units**, not cents.
`checkout.service.ts` calculates canonical BDT `Order.totalAmount` from effective
product prices, minus the order promo discount, plus delivery fees and taxes.
SSLCommerz Purchase uses the matching BDT total. Airwallex uses its immutable
saved payment amount/currency and validates its BDT base amount and direct FX
rate against the order; it does not substitute the storefront display currency
or today's rate. Catalog item totals need not equal revenue after adjustments.

Currency must belong to `lib/currency/config.ts`'s supported set: BDT, AUD, EUR,
GBP, USD, CNY. Formatted money, missing/null/empty values, malformed strings,
non-finite amounts, and negative amounts are rejected. Timestamp validation
requires Unix seconds and allows at most five minutes of future clock skew.
A valid zero total is
distinct from missing data: the current online gateways require a positive
charge, so zero-value orders are suppressed as `zero_value_policy`, while the
order remains successful. **COD Purchase policy remains undefined**; existing
COD orders start PENDING/UNPAID and remain excluded. Choosing acceptance,
delivery, or collection as COD's milestone requires a separate business decision.

Registered receipts require the matching owner. Guest receipts require the
existing order-specific bearer cookie, checked by `/api/orders/[id]`; browser
tracking does not establish authorization. Both require an intent registered
after successful online checkout. Cart clearing cannot alter the saved payload.
Historical receipt browsing without an intent is excluded. Existing legacy
Purchase markers remain suppressed; do not delete markers or replay old orders.
Checkout intent currently uses a non-expiring browser marker, preserving the
existing behavior; no new analytics expiry period was invented. Missing/removed
intent suppresses Purchase, and consent revocation removes intent. Guest order
authorization cookies expire after 30 days; without the scoped cookie, the API
denies the payload even if an analytics marker remains. A browser marker never
substitutes for order authorization.

## Sanitized payload contract

Browser example, with a synthetic order and configured test Pixel:

```js
const payload = {
  eventId: "purchase:example-order",
  eventTime: 1791093600,
  value: 1500,
  currency: "BDT",
  items: [],
};
fbq("trackSingle", configuredTestPixelId, "Purchase", {
  value: payload.value,
  currency: payload.currency,
}, { eventID: payload.eventId });
```

`eventTime` stays in the canonical snapshot; it is not an extra Pixel argument.
Valid optional catalog fields are included by the adapter.

**CAPI CONTRACT ONLY — NOT IMPLEMENTED IN THIS REPOSITORY.** An external server
adapter must use the same intended dataset, snapshot, event name/ID, and original
time. This partial event example omits its required transport/user-data handling
and credentials; it is not an executable integration:

```json
{
  "event_name": "Purchase",
  "event_id": "purchase:example-order",
  "event_time": 1791093600,
  "action_source": "website",
  "custom_data": { "value": 1500, "currency": "BDT" }
}
```

No CAPI integration or credentials were added. Browser state cannot provide
durable server delivery guarantees or suppress an external server event.

## Controlled verification checklist

1. Use staging, the intended test Pixel, and sandbox gateways. Perform a fresh
   controlled guest and registered checkout for each online gateway, with a
   discount, delivery charge, and tax where configured. Do not place real orders
   or replay historical purchases for this check.
2. Before checkout, open DevTools Network with Preserve log and the intended
   dataset's Meta **Test Events**. Confirm the configured Pixel ID. Do not invoke
   `fbq` manually to manufacture conversions.
3. Inspect `/api/orders/[id]`'s `metaPurchase` after verified payment. Compare its
   numeric value/currency with the saved order and matching payment transaction,
   using authorized read-only access. For Airwallex compare payment amount and
   currency, not the separate customer display amount. Check `purchase:<orderId>`
   and the saved `paidAt` timestamp; provider evidence must remain server-side.
4. Inspect the fresh Facebook tracking request: Purchase name, intended Pixel
   destination, value, currency, and event ID. Compare with the received Test
   Events entry. Record browser request and Meta receipt as separate evidence.
   `queued` and `sdk_handoff` diagnostics alone are not delivery proof.
5. Refresh, repeat receipt effects, revisit the receipt, and retry sandbox payment
   callbacks. Expect the same ID and no new browser handoff after its stored
   marker. Delay SDK loading: pending attempts retain the original amount and ID,
   then hand off once. A failed SDK attempt can retry with that same ID. Existing
   legacy markers stay suppressed; do not erase them to force test events.
6. Check pending/failed/review-held online payments, COD, missing intent, unrelated
   registered owners, and unauthorized guest receipts: no Purchase. Denied or
   revoked consent discards pending activity; later consent must not replay it.
   Block the SDK or cause analytics failure: successful checkout and receipts
   must remain successful.
7. If an external CAPI exists, have its owner inspect fresh events and compare
   `event_name`, `event_id`, `event_time`, `custom_data.value/currency`, and dataset
   with the browser. Verify actual deduplication in Meta; this repository cannot
   establish or repair external delivery state.
8. Manually review Meta Event Setup Tool/automatic rules, GTM Purchase tags,
   server-side GTM, ecommerce plugins, CAPI Gateway/partner integrations, and
   proxy/hosting injections. Identify each Purchase trigger, dataset, value,
   currency, and ID. Reconcile confirmed overlapping Purchase sources without
   disabling unrelated legitimate tracking. These settings remain unverified.

Opt-in structured diagnostics use `META_PURCHASE_DIAGNOSTICS=true` on the server
and `NEXT_PUBLIC_META_PURCHASE_DIAGNOSTICS=true` in the browser. Public settings
require a rebuild. Default is off. Logs contain only event ID, source, validation,
allowlisted reason, and sanitized status; never customer data, provider payloads,
tokens, or URLs. Disable diagnostics after investigation.

## Validation and proposed deployment

Run locally against the intended safe test environment; record actual results
separately. Automated delivery is mocked and must not send production events:

```sh
npm test
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

The existing [deployment preparation](meta-pixel-tracking.md#deployment-preparation--commands-require-explicit-approval)
and [VPS runbook](currency-exchange-rates-vps.md#2-deploy-the-additive-migration-and-application)
document npm, Prisma, and PM2. The following are **proposed commands only**, not a
release performed by this repair. Confirm current application directory, service
owner, clean release revision, environment, backups, and rollback procedure first.
Historical hardcoded release SHAs and production-test instructions in the linked
runbooks are superseded by this document: select `REVIEWED_RELEASE_SHA`, and run
tests only against the isolated database described below. After those tests pass,
validate and build the release against its confirmed deployment configuration:

```sh
cd /var/www/bangbuy
npm ci --include=dev
npx prisma validate
npx prisma generate
npx prisma migrate status
npx tsc --noEmit
npm run lint
npm run build
```

This tracking repair needs **no schema migration**. Review any unrelated migration
drift separately; do not run production migrations for analytics. Build with the
verified `NEXT_PUBLIC_META_PIXEL_ID`. After successful gates and explicit release
authorization, restart only the already confirmed service under its current owner:

```sh
pm2 restart CONFIRMED_BANGBUY_PROCESS_ID --update-env
pm2 save
```

Replace the placeholder with the verified existing process ID. Record release
source/build identity, then verify fresh browser requests and Meta receipt after
deployment. No production deployment, migration, order, or account setting change
is authorized or claimed here.

## Previous repair validation — 2026-10-08

| Command | Result |
| --- | --- |
| `npm test -- __tests__/meta-pixel-*.test.ts __tests__/order-purchase*.test.ts __tests__/purchase-*.test.ts` | Passed: 9 suites, 288 tests. Pixel and HTTP delivery are mocked; no real Purchase events sent. |
| `npm test` | Exit 1: 885 passed, 1 failed, 10 skipped; 56 suites passed, 1 failed, 1 skipped. Sole failure: existing mobile action styling assertion at `__tests__/product-card-responsive.test.ts:91`. |
| Isolated unchanged HEAD baseline | The same layout assertion failed at HEAD `badd8e160533be0d5ee1b07380eae1975d9828ec` in a temporary archived checkout: 1 failed, 1 passed. ProductCard/test hashes matched HEAD and the working tree; temporary checkout removed. |
| `npx tsc --noEmit` | Passed. |
| `npm run lint` | Passed: 0 errors, 4 existing unused-variable warnings in About, PaymentMethodPicker, CarouselBanner, and API envelope files. No new warnings. |
| `npm run build` | Exit 1: compilation and build TypeScript passed. Page-data collection for `/products/[slug]` failed with Prisma P1001 because PostgreSQL at `127.0.0.1:15432` was unreachable. Also reported an upload-route/Next-config tracing warning. |
| `git diff --check` | Passed. |

Those results describe the starting point. The follow-up below resolves the
local build and test failures. No production tunnel, migration, deployment,
real order, historical replay, or external tracking-setting change was performed.

## Follow-up release validation — 2026-10-08

**IMPLEMENTED:** The previous tracking repair is present in the current worktree.
The authoritative saved Decimal totals, historical Airwallex currency/rate,
verified online payment requirement, guest authorization, original timestamp,
stable identity, intended-Pixel delivery, consent and legacy markers remain.
No dependency, pricing, payment, rendering or cache policy was changed.

**VERIFIED LOCALLY:** ProductCard and its test matched unchanged HEAD
`badd8e160533be0d5ee1b07380eae1975d9828ec`. The baseline failure reproduced again.
Commit `c34efdf` introduced padding-based mobile controls and mismatched fixed-height
assertions together. The corrected test expects the existing padding and scans
balanced div containers, requiring both mobile actions after the entire image
container. Responsive visibility, width, typography, keyboard and variant checks
remain; no ProductCard UI change was needed.

**VERIFIED LOCALLY:** The build failure was unavailable database access, not Pixel
compilation. Next.js 16.2.12 intentionally calls database-backed catalog
`generateStaticParams`; metadata and rendering share real product queries. Existing
product `revalidate = 900`, `dynamicParams = true`, request/display-currency behavior,
SEO and error handling remain. No fake product response, empty-on-error fallback,
forced dynamic setting or disabled check was introduced.

Production-mode environment precedence is process environment,
`.env.production.local`, `.env.local`, `.env.production`, then `.env`.
The inspected checkout loaded `.env`, whose runtime `DATABASE_URL` selects
`127.0.0.1:15432/bangbuy_db`; `DIRECT_URL` is absent. README documents 15432 as
a production VPS SSH tunnel, not a local PostgreSQL service. Runtime Prisma uses
`DATABASE_URL`; `prisma.config.ts` uses `DIRECT_URL` for CLI/session connections
when provided. A CLI-only override would therefore not fix `next build`.

Installed PostgreSQL 18.6 was used in a disposable cluster bound only to
127.0.0.1:15433, with a private temporary socket/data directory. SQL confirmed the
target address, port, database and role before migrations or restoration.
The 12 existing migrations were applied only to fresh local databases; no new
migration was added. The build database `bangbuy_release_check` received only
Category, Brand, Manufacturer, Product, ProductVariant, ProductImage, Banner,
CatalogRedirect, ExchangeRate and StoreSettings data from the tracked September 4
archive, in foreign-key dependency order. It contained 72 products, 21 categories,
and **zero User, Order and PaymentTransaction rows**. The separate
`bangbuy_guest_checkout_test` database contained only synthetic test fixtures.

Both `DATABASE_URL` and `DIRECT_URL` were overridden for each command, never written
to the user's environment files. Automated tests used only the separate loopback
test database and mocked gateway/Pixel delivery. The local archive-built artifact
is verification evidence; it must not be deployed as a current production catalog.
After validation, the owned PostgreSQL cluster was stopped, port 15433 was
confirmed closed, and its temporary data/socket directory and old generated-build
snapshots were removed. No database service or tunnel remains from this task.

The upload warning came from runtime storage paths in
`lib/services/upload.service.ts`. Turbopack treated `stat(filePath)` as a file
asset and independently traced `path.resolve`/`path.join` as directory assets,
incorrectly collecting unrelated project files and reporting `next.config.ts`.
The installed output-tracing/Turbopack guides and the
[Next 16.2.12 tracer implementation](https://raw.githubusercontent.com/vercel/next.js/v16.2.12/turbopack/crates/turbopack-ecmascript/src/references/mod.rs)
were inspected before applying supported `/* turbopackIgnore: true */` argument
annotations to nine runtime `resolve` calls, one `join` call and one `stat` call.
No Next config exclusion or runtime expression change was needed.
Upload path containment, stat/unlink checks and SSH behavior are unchanged;
59 upload tests passed. The final clean upload trace has **260 entries**, with
zero Next config, backup, environment or unrelated `lib/` source entries; every
traced file exists and Sharp's required native binary remains included. The
Python storage helper is provisioned on the remote forced-command host by the
existing runbook, not imported locally, and no longer appears accidentally in
the application trace. Trace packaging is separate from PM2 deployment and
runtime storage provisioning.

| Actual command | Exit | Result |
| --- | --- | --- |
| Baseline `npm run build` with existing environment | 1 | Reproduced Prisma P1001 at 15432 during product page-data collection, plus upload tracing warning. |
| `npm test -- __tests__/product-card-responsive.test.ts` | 0 | 2 passed after the test correction. |
| `npm test -- __tests__/upload-service.test.ts __tests__/upload-ssh-storage.test.ts` | 0 | 59 upload/storage tests passed. |
| `npm test -- __tests__/meta-pixel-*.test.ts __tests__/order-purchase*.test.ts __tests__/purchase-*.test.ts __tests__/meta-purchase-checkout-flow.test.ts __tests__/product-card-responsive.test.ts` | 0 | 12 suites, 360 tests passed. |
| `npm test` with explicit local runtime/direct/test URLs | 0 | **60 suites, 966 tests passed; zero failures and zero skipped tests**, including the 10 previously opt-in database tests. |
| `npx tsc --noEmit` | 0 | Passed after the final build. |
| `npm run lint` | 0 | 0 errors; the same 4 existing unused-variable warnings. No new warnings. |
| Clean `npm run build` with explicit local build URLs | 0 | Compilation, TypeScript, page-data collection and all **114 static generation tasks** completed; no upload tracing warning. |
| `git diff --check` | 0 | Passed. |

The database-enabled suite emitted a `pg` query-concurrency deprecation warning
(future pg 9 behavior); it is a warning, not a failure. Dependencies were not upgraded.
The final build ID is `eVh7F6WTjCoil3kncVSWe`. Repair client chunk
`0boi7vs-f3o8l.js` contains `trackSingle` and `sdk_handoff`, SHA-256
`eec45ef36391e6d9194637ba27a9762932da3fe47371fb50882df3b3c2b4a625`.
The worktree remains reviewable and uncommitted; HEAD alone does not include it.

### Safe local reproduction

Use already installed PostgreSQL binaries. Create a new private disposable cluster
and database, bind only to loopback, and verify its identity first. Example
commands use task-specific variables and a separate port, without editing `.env`
or opening `npm run db:tunnel`:

```sh
BANGBUY_CHECK_DIR=$(mktemp -d /tmp/bangbuy-release-check.XXXXXX)
initdb -D "$BANGBUY_CHECK_DIR/pgdata" -U bangbuy_release_check --auth=trust --no-instructions
pg_ctl -D "$BANGBUY_CHECK_DIR/pgdata" -l "$BANGBUY_CHECK_DIR/postgres.log" \
  -o "-h 127.0.0.1 -p 15433 -k $BANGBUY_CHECK_DIR" start
createdb -h "$BANGBUY_CHECK_DIR" -p 15433 -U bangbuy_release_check bangbuy_release_check
psql -h 127.0.0.1 -p 15433 -U bangbuy_release_check -d bangbuy_release_check \
  -c 'SELECT current_database(), current_user, inet_server_addr(), inet_server_port();'
BANGBUY_CHECK_URL='postgresql://bangbuy_release_check@127.0.0.1:15433/bangbuy_release_check?sslmode=disable'
DATABASE_URL="$BANGBUY_CHECK_URL" DIRECT_URL="$BANGBUY_CHECK_URL" npx prisma migrate deploy
```

For representative catalog generation, use the existing archive's **data-only**
restore with an ordered TOC list containing exactly the ten catalog/config tables
listed above (Category and Brand/Manufacturer before Product; Product before its
variants/images; Banner after Category). Do not restore customer, order, payment,
credentials or migration-history data. Verify row counts and the zero excluded
table counts. Then run:

```sh
DATABASE_URL="$BANGBUY_CHECK_URL" DIRECT_URL="$BANGBUY_CHECK_URL" npm run build
```

To enable all database tests, create and migrate a separate empty local database
named exactly `bangbuy_guest_checkout_test`; the existing suite refuses remote
hosts or another name. Set all three command-specific URLs to that database:

```sh
createdb -h "$BANGBUY_CHECK_DIR" -p 15433 -U bangbuy_release_check bangbuy_guest_checkout_test
BANGBUY_TEST_URL='postgresql://bangbuy_release_check@127.0.0.1:15433/bangbuy_guest_checkout_test?sslmode=disable'
DATABASE_URL="$BANGBUY_TEST_URL" DIRECT_URL="$BANGBUY_TEST_URL" npx prisma migrate deploy
DATABASE_URL="$BANGBUY_TEST_URL" DIRECT_URL="$BANGBUY_TEST_URL" \
  GUEST_CHECKOUT_TEST_DATABASE_URL="$BANGBUY_TEST_URL" npm test
pg_ctl -D "$BANGBUY_CHECK_DIR/pgdata" -m fast stop
```

Remove only the private temporary directory created by this procedure after the
server stops. Both verification databases are disposable. The normal `.env`
build still needs its configured database to be available; no production tunnel
is authorized by these instructions.

### Identifiable Purchase sources

| Source / owner | Trigger and delivery | Destination | Value/currency and identity | Evidence/status |
| --- | --- | --- | --- | --- |
| Current repository Pixel / application developer | Authorized fresh receipt/status read after verified online payment; browser | Configured `NEXT_PUBLIC_META_PIXEL_ID`, currently `1396304422710398` | Saved verified transaction/order snapshot; `purchase:<orderId>` | **IMPLEMENTED / VERIFIED LOCALLY**; SDK transport mocked. |
| Currently served application Pixel / release operator | Earlier browser helper is present in public product assets; actual Purchase trigger/request not exercised | Public configured Pixel `1396304422710398` | Earlier helper lacks this release's strict boundary and SDK-handoff refinements; actual emitted values/IDs unverified | Public HTML/script bytes inspected; reviewed repair release still required. |
| Meta Event Setup Tool/automatic rules / dataset administrator | Unknown rule triggers; browser | Requires target-dataset inspection | Must inspect actual rule value/currency configuration and ID behavior | **NEEDS EXTERNAL ACCESS**; historical rules are not proof of current Purchase firing. |
| GTM / server-side GTM / container owner | No emitter found in repository; externally injected triggers unknown | Unknown | Unknown until container and expanded event evidence are supplied | **NEEDS EXTERNAL ACCESS**; existence is not assumed. |
| Partner integration / CAPI Gateway / integration owner | No CAPI sender found in repository; server source unidentified | Unknown | Must inspect `custom_data.value/currency`, original `event_time`, and `event_id` | **NEEDS EXTERNAL ACCESS**; diagnostic wording does not identify an integration. |
| Proxy/hosting injection / hosting operator | No configurable injected Purchase script found in repository; running server config unknown | Unknown | Unknown | **NEEDS EXTERNAL ACCESS**; inspect actual hosting scripts/config read-only. |

A fresh public HTTP read of `https://bangbuy.net/products/male-side-bag` found build
ID `eFEMj4870Rb-j6J47XJYZ`. Its 16 initial scripts include Pixel chunk
`1z-lm-yo1rrjz.js`, SHA-256
`73d0c6f004160d02742f5736d76a2251f3ef64f70faa2f01fca123fc57f51c43`.
That chunk contains Purchase and the older application/intent/duplicate markers,
but none of the initial scripts contains `trackSingle` or `sdk_handoff`.
This confirms the earlier tracking implementation is served, rather than this
release's browser refinements. It does not prove an exact deployed Git SHA,
Purchase request transmission, malformed source attribution, or Meta receipt.

Read-only Events Manager navigation reached an unrelated app dataset in the
signed-in account. Navigating to the configured Pixel redirected to Overview;
the intended BangBuy dataset was not exposed. No advertising setting was changed.
No staging URL/sandbox session was supplied, so no staging checkout or fresh
Purchase network request was performed. **VERIFIED IN META: none.**

Request exactly this sanitized evidence from the intended dataset owner: one
fresh expanded Purchase event, its Browser/Server source, numeric `value`,
`currency`, event ID, dataset/Pixel destination ID, and displayed integration
name. Include receipt time and a non-customer order reference if needed to
correlate with an authorized saved-order read. Exclude tokens, cookies, full URLs
with sensitive query parameters, names, contact details, addresses and raw user data.

Once identified, correct the responsible source's mapping: application requests
must match the authorized canonical payload; a Setup Tool rule must use a verified
completion milestone and real order data; a GTM tag must consume the validated
snapshot instead of button text; an external CAPI must reuse its value/currency,
ID and original time with proper nesting. Reconcile confirmed duplicate Purchase
ownership only. Do not disable unrelated valid tags or enable a second CAPI.

### Test payloads and staging/Meta gates

The combined flow tests use separate synthetic orders per case:

| Gateway | Customers exercised | Saved revenue | Separate display amount | Event identity/time |
| --- | --- | --- | --- | --- |
| SSLCommerz | Guest and registered | `{ "value": 2010, "currency": "BDT" }` | EUR 18.49 | `purchase:flow-order-1`, `1791093600` |
| Airwallex | Guest and registered | `{ "value": 16.48, "currency": "USD" }` | EUR 18.49 | `purchase:flow-order-1`, `1791093600` |

They exercise real checkout/receipt handlers, API adapters, cart storage, Decimal
builder and Pixel adapter with mocked transport, UI scheduling and SDK. Actual
Airwallex status reads and SSL receipt polling require a canonical eligible order.
Unauthorized route/SQL reads never build or expose a tracking payload. None of
this establishes browser network delivery or Meta receipt.

Before release, obtain a staging URL, sandbox gateway configuration, a confirmed
intended test Pixel/dataset, and authorized test users. Complete the controlled
checklist above for each gateway and customer type. Record five separate gates:

1. **Code correctness:** review the saved payload, eligibility and source ownership.
2. **Local validation:** tests/type/lint/build results above.
3. **Browser transmission:** fresh network request, intended destination and exact
   value/currency/event ID; rejected/blocked requests recorded separately.
4. **Meta receipt/deduplication:** expanded fresh Test Events record; if a server
   source is identified, compare name/ID/dataset and actual deduplication result.
5. **Diagnostics clearance:** separately inspect the intended dataset's current
   Diagnostics after new correctly mapped traffic; do not infer clearance from gates 1–4.

### Deployment, rollback and remaining actions

**RELEASE BLOCKER:** The reviewed worktree must be committed to an intended release
revision, built against the confirmed deployment environment, and explicitly
authorized for release. Local archive build artifacts are not the production
release. Verify public Pixel configuration before build; public settings are
compiled into client code. Confirm the actual existing PM2 process ID, service
owner, cwd and Nginx upstream under the current operator; historical runbooks do
not establish their current values. Preserve `.env` and credentials securely.

Use the proposed npm/Prisma validation commands above and the actual VPS runbook.
No new schema migration is needed. If the checkout is dirty, preserve and reconcile
production-only changes before selecting `REVIEWED_RELEASE_SHA`; never reset them.
Record the reviewed source SHA, build ID and client hash. Preserve the previous
working source/artifact, lockfile and protected environment before an approved
in-place replacement. Stop/restart only the confirmed BangBuy service under its
existing owner after the approved release gates; never all PM2 processes.

Rollback restores the recorded previous source/artifact and matching dependencies
and protected environment, then restarts only that same confirmed service with
`pm2 restart CONFIRMED_BANGBUY_PROCESS_ID --update-env`. Verify HTTP health and the
served previous build identity. There is no analytics schema change to roll back;
do not perform a database restore as part of this code rollback. A separate release
directory may be switched only if that deployment procedure is already established.

| Remaining issue | Fixed/verified | Precise action still required |
| --- | --- | --- |
| Local build and ProductCard test | **VERIFIED LOCALLY**: all 966 tests, type checking, lint and isolated clean build pass | Build the reviewed release again with current deployment DB/public configuration. |
| Current storefront runs earlier tracking code | Public artifact mismatch confirmed | Reviewed revision, rollback record and explicit release authorization; no deployment performed here. |
| Fresh Purchase network delivery | **NEEDS EXTERNAL ACCESS** | Supply staging/sandbox access and intended test dataset; record actual requests for all four gateway/customer flows. |
| Invalid Browser/Server source, Meta receipt/deduplication and warning clearance | **NEEDS EXTERNAL ACCESS**; none **VERIFIED IN META** | Supply the sanitized expanded event fields above, identify its owner, correct that source, and verify gates 4 and 5 separately. |
| COD Purchase milestone | **NEEDS BUSINESS DECISION**; COD is offered and remains excluded | Decide acceptance, delivery or payment collection, then implement a persisted method-specific milestone without historical replay. |

At which milestone should a COD order count as a Meta Purchase: acceptance, delivery, or payment collection?
