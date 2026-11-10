# Local tracking isolation verification

Verified on 10 November 2026. This records repository implementation and local synthetic checks, not production deployment, policy approval or live Meta receipt.

This is the retained architecture-phase record. See the separate
[deployment preparation verification](deployment-staging-verification.md) for
the current rerun, new operational checks, exact skipped tests and outstanding
production prerequisites. Do not combine counts from the two phases.

## Architecture implemented

The application remains a modular monolith. Independent public and private root documents, configured distinct HTTPS hosts, anonymous public providers, hard navigation and validated selection handoffs separate the browser surfaces. Exact host/API gates, host-only credentials, private CSP and referrer protections preserve the commerce boundary. The shared policy denies unknown approvals, content, context, consent and versions. The SDK transport is reachable only from the public tracking component.

Registered server conversions use the additive transactional outbox, authoritative payment transitions and a runnable leased worker. Optional insert failures roll back to a savepoint without aborting commerce. Guest external conversions and COD Purchase are excluded by the existing privacy and collection contracts. Cart mutations remain internal first-party interactions because they occur on the untracked commerce origin.

## Automated checks passed

| Check | Observed result |
| --- | --- |
| Full Vitest suite with both guarded database suites enabled | 1,395 passed and 4 skipped across 90 files; remaining skips are three optional real LibreTranslate integration tests and one optional RTL artifact export test |
| Real guest checkout PostgreSQL integration | 10 passed on disposable loopback database `bangbuy_guest_checkout_test` |
| Real marketing outbox PostgreSQL integration | 12 passed on disposable loopback database `bangbuy_marketing_test` |
| Actual Next.js application through two temporary HTTPS origins | 14 commerce and isolation checks passed; zero Meta requests |
| Chromium SDK loading and outbound network checks | Eight scenarios passed, including a trusted real BFCache restoration with retained JavaScript state followed by a clean document and zero resumed delivery |
| Production build | Passed with an isolated local database, disabled tracking and synthetic server-secret sentinels |
| Compiled browser asset inspection | 84 JavaScript/map assets inspected; no server tracking configuration or synthetic CAPI, worker or auth secrets |
| Private dependency boundaries | 42 checks passed, including every private page/layout entry and shared commerce/session bootstrap |
| ESLint | No errors; three pre-existing unused-variable warnings |
| TypeScript | Passed |
| English and Bengali catalog validation | Passed with 2,926 required messages per locale |
| Whitespace validation | `git diff --check` passed |
| Anonymous context review CLI | Chromium smoke passed; Meta request intercepted and output remained unknown and unapproved |

The database suites were explicitly pointed at separate local test databases. Neither `.env` nor the production tunnel supplied their connection. All Meta destinations in browser tests and provider responses in server delivery tests were intercepted. No real customer, payment charge or production conversion was used.

Chrome evicted the normal no-store history fixture rather than caching it. A separate explicitly cache-permissive synthetic fixture verified a trusted persisted `pageshow`, the same document canary and retained SDK state before the restoration handler replaced the document. Consent stayed revoked and no new Meta requests occurred. Application cache headers were not relaxed to obtain this evidence.

The full-suite command used for this verification was:

```sh
GUEST_CHECKOUT_TEST_DATABASE_URL=postgresql://bangbuy_tracking_test@127.0.0.1:15439/bangbuy_guest_checkout_test MARKETING_TEST_DATABASE_URL=postgresql://marketing_test@127.0.0.1:56543/bangbuy_marketing_test npm test
```

The actual application smoke command was:

```sh
COMMERCE_ISOLATION_TEST_DATABASE_URL=postgresql://bangbuy_tracking_test@127.0.0.1:15439/bangbuy_tracking_test npm run test:commerce:isolation
```

Its 14 checks cover a fresh document on public-to-private handoff, exact variant and quantity recovery, server revalidation, guest Buy now preserving the cart, selected checkout preserving other lines, account login merging the guest cart, registered full-cart checkout, scoped guest receipts in a new tab, unauthorized receipt denial, private API and storage isolation, language switching, historical product redirects and forged payment flags remaining unpaid.

## Acceptance evidence

| Requirement | Implementation and executable evidence |
| --- | --- |
| No SDK before consent, after denial or without approval | `tracking-policy.test.ts`, `public-pixel-adapter.test.ts`, Chromium marketing runner |
| One initialization and one explicit event per occurrence | Public transport in-flight/sent/discarded identities; Strict Mode and outbound-network scenarios |
| Document replacement before private UI | Boundary-aware navigation and two roots; actual HTTPS commerce smoke and Chromium document canary |
| Direct private entry has no loader or noscript | Private import graph, private HTML/network assertions and CSP contract tests |
| No private forms, account state or raw models in payloads | Strict event/projection schemas, document-wide input veto, anonymous providers and denied private APIs |
| Unknown route, query, product and content remain denied | Exact context/fingerprint/content approvals; pending/mutable vetoes; policy, DOM and browser tests |
| Withdrawal, tabs and restored navigation do not revive delivery | Versioned host-scoped consent, synchronous suspension, necessary local denial, restoration checks and Chromium scenarios |
| Tracked origin cannot read private APIs or storage | Host allowlists, private origin checks, no credentialed CORS and actual HTTPS browser smoke |
| Guest/account journey survives hard navigation | Actual handoff, cart merge, Buy now, selected/full checkout, receipts, locale and slug checks |
| Failed actions do not become successful events | All 55 historical browser business cases and 58 checkout-flow cases retained with updated privacy expectations |
| Forged payment return cannot create Purchase | Actual unpaid COD receipt with forged flags; authoritative payment/outbox tests |
| Repeated payment observations and workers preserve one logical conversion | PostgreSQL advisory/row locks, unique business key and actual concurrent Airwallex/SSL/worker tests |
| Pending, failed, cancelled and review states remain distinct | Existing payment regression suites and outbox exclusion tests |
| Money is immutable and server authoritative | Stored payment snapshot projection, decimal/currency validation and PostgreSQL tests |
| Marketing failure cannot break commerce | Real failed SQL insert with savepoint recovery, rollback tests and blocked-network browser journey |
| Runtime disablement stops new dispatch | Fresh policy reads, file kill checks and browser/worker tests |
| Server credentials stay out of browser builds | `server-only` configuration, dependency checks and compiled asset scan with synthetic sentinels |

## Required infrastructure

Production needs two approved HTTPS hosts routed to the existing application, exact host enforcement at the reverse proxy, redacted access logs, private API exclusion and the reviewed migration of legacy sessions, guest receipt access and carts. Apply the additive migration through the normal authorized deployment process, and provide a protected shared policy file. A CAPI rollout also needs the separately operated worker. None of these production operations was performed here.

## External settings and approvals

Business, source/dataset, product/content, exact page context, event fields and any matching identifiers require actual review with references and expiry. Events Manager automatic events, advanced matching, detailed collection and competing integrations need an account-owner inspection. The example manifest grants nothing. Distinct test datasets are required for staging.

Private CAPI stays blocked without a truthful approved checkout URL and real permitted matching data. The implementation does not manufacture identifiers or transfer public consent into private account identity. A new guest-data or COD conversion definition requires a separate explicit contract change; generic approvals do not override the current exclusions.

## Live delivery verified

None. Browser tests prove controlled application loading and intercepted outbound requests. Server HTTP tests prove validated projections and acknowledgement handling. They do not prove Meta account eligibility, Events Manager receipt, deployed provider callback behavior, wallet availability or 3DS completion. Use the [release runbook](meta-tracking-release.md) for those subsequent approved checks.
