# Deployment preparation: staging verification

Prepared 10 November 2026. **No real staging deployment, production mutation or external Meta delivery was performed.** This report distinguishes local HTTPS checks from the outstanding operator/provider work. The [customer-state runbook](customer-state-migration.md) identifies an unresolved dual-legacy-host blocker; the passing local fixtures do not resolve it.

## Evidence classification

| Check | Current evidence | Scope and limitation |
| --- | --- | --- |
| Actual application, two HTTPS origins | Final rerun: **23 checks passed**, comprising 13 journey/isolation checks and 10 shared GET-only deployment health checks, against the final local production build. | `https://public.localhost:3188` and `https://commerce.localhost:3188`; temporary self-signed certificate, disposable PostgreSQL and Chrome, not real staging DNS/TLS. `--skip-build` means the smoke reused the final build. |
| Public SDK/consent/privacy browser scenarios | Rerun: 8 scenarios passed on two temporary HTTPS localhost hosts. | Actual adapter and consent UI bundled into a synthetic fixture. Every Meta destination intercepted; no live Meta SDK/account acceptance claimed. |
| Auditor privacy and compatibility | Rerun: 4 checks passed in an isolated synthetic Chrome profile. | Classified key/cookie/cache counts, no names or secret values exported, storage/cookies/cache/document unchanged, DevTools expression executes, unsafe configuration refuses without echoing supplied credentials. No customer browser audited. |
| Full test suite with real PostgreSQL outbox and guest checkout suites | Rerun: **1,399 passed / 4 optional skipped**, 90 test files passed and one skipped. Log `/tmp/bangbuy-deployment-final-tests.log`. | Both explicit disposable database opt-ins enabled. Includes real killed-worker restart/recovery. Synthetic provider/local sinks; no external delivery. |
| Production build/browser asset inspection | Rebuilt after runtime dependency classification changed; 84 browser assets clean. Logs `/tmp/bangbuy-deployment-final-build.log` and `/tmp/bangbuy-deployment-final-build-scan.log`. | Final local build ID `OuWhSuyZ8UNoTG8w7TDKs`; the 23-check HTTPS smoke was rerun against it. Compile/asset evidence cannot prove deployed routing, warm state migration or provider acceptance. |
| Deployment asset tests | 16 standalone tests passed: 9 host/launcher/proxy contracts and 7 database/worker operations guards. | `node --test tests/deployment-operations.mjs tests/deployment-host-assets.mjs`; log `/tmp/bangbuy-deployment-assets-final.log`. Actual Nginx/PM2 daemon behavior remains external. |
| Full worktree lint, typecheck and languages | ESLint passed with zero errors and three existing unused-variable warnings; TypeScript and English/Bengali validation passed. | Logs `/tmp/bangbuy-deployment-final-lint.log`, `/tmp/bangbuy-deployment-final-types.log`, `/tmp/bangbuy-deployment-final-i18n.log`; 2,926 required messages per locale. |
| Runtime packaging | `dotenv` 17.4.2 and `tsx` 4.23.1 moved to runtime dependencies; offline lock refresh and `npm ls --omit=dev dotenv tsx --depth=0` passed without version changes. | The new launchers need these packages at runtime. A clean pruned production installation/actual host startup was not executed. Build dependencies are still required during release compilation. |
| Live-host public discovery | Read-only discovery confirmed apex and `www` currently serve commerce independently. | No session, cookie value, customer order or VPS configuration was inspected. Remote deployment access unavailable. |
| Real staging deployment and warm-state cutover | **Not executed; blocked.** | Requires operator-owned staging origins, actual hosting access and a reviewed dual-legacy-host compatibility plan. |
| Provider payment sandbox journey | **Not executed externally.** | Local COD journey and payment tests are useful, but Airwallex hosted session/real callback reachability require sandbox configuration and permitted test data. |
| Intended Meta dataset acceptance/deduplication | **Not executed; no delivery attempted.** | Account/dataset permission, restrictions, dedicated dataset isolation and approved eligibility/activation remain external prerequisites. |

## Exact local HTTPS application rerun

```sh
COMMERCE_ISOLATION_TEST_DATABASE_URL=postgresql://marketing_test@127.0.0.1:56543/bangbuy_tracking_test \
COMMERCE_ISOLATION_REPORT_PATH=/tmp/bangbuy-commerce-isolation-current.json \
npm run test:commerce:isolation -- --skip-build
```

The database guard permits only the named disposable `bangbuy_tracking_test` database on loopback ports 15439 or 56543; it does not read the application's `.env` connection. The runner overrides application/auth/payment/marketing environment settings for synthetic use. Remove `--skip-build` to include a new isolated production build. Do not run two Next builds concurrently in the same checkout.

Current log: `/tmp/bangbuy-commerce-isolation-current.log`; generated structured report: `/tmp/bangbuy-commerce-isolation-current.json`. It records the final build ID, reused-build mode, timestamp, each health result and an empty `metaRequests` array. Thirteen journey/isolation checks passed:

1. Local-only database guard and synthetic catalog setup.
2. TLS reverse proxy serves both exact configured hosts.
3. Public host denies account and order APIs.
4. Public-to-private handoff replaces document/origin, preserves variant/quantity, and a GET does not mutate cart.
5. Guest Buy now creates an unpaid COD order while preserving the cart.
6. HttpOnly scoped guest receipt works in another tab and is denied to an unrelated browser context.
7. Selected checkout purchases selected lines and retains unselected lines.
8. Guest cart merges into an authenticated commerce account.
9. Registered full-cart checkout clears the server cart.
10. Historical product redirect works; public storage/private API isolation holds.
11. Anonymous catalog language switching preserves the product path and changes HTML language.
12. Private documents and forged payment flags produce neither Meta activity nor a paid state transition.
13. No external marketing request occurs during the synthetic commerce journey.

Ten shared `scripts/deploy/healthcheck.mjs` checks also passed before any synthetic account or guest cookie existed: both policy endpoints return bounded uncached JSON with `no-referrer`; both show runtime/Pixel/CAPI delivery disabled; both report the exact origin pair; public private-page entry redirects to commerce before rendering; public account API is absent; a public-Origin request to the private account API is rejected without CORS; and the private cart document has no Pixel bootstrap and retains its private CSP/referrer/cache headers. The request wrapper uses GET and disables redirect following. These are application availability/boundary checks, not database or provider health.

The earlier 14-check run included an additional build check. The final smoke records **23** (13 journey/isolation + 10 health) without counting its reused build as a newly performed build. The fixture tests one configured commerce host; it does not cover preserving the discovered second legacy commerce host.

## HTTPS marketing privacy rerun

```sh
npm run test:marketing:browser
```

Current log: `/tmp/bangbuy-marketing-https-current.log`. The runner now creates a temporary certificate and two HTTPS hosts. It preserves all eight existing scenarios: pre-consent/denied/unapproved suppression; one initialization and expected events once after approved consent; query/fragment/content/metadata denial; hard private navigation/direct entry; withdrawal and same-origin tab synchronization; runtime disablement; revoked-consent history restoration; and nonfatal ad blockers/private-conversion suppression.

The normal `no-store` history fixture was evicted by Chrome, which reported `MainResourceHasCacheControlNoStore`, `JsNetworkRequestReceivedCacheControlNoStoreResource` and `BrowsingInstanceNotSwapped`. A separately identified cache-permissive synthetic segment proved a **trusted persisted `pageshow`**, the same JavaScript document and cached SDK, followed by the controller's clean document replacement and no additional Meta request. This is actual BFCache evidence for the defensive branch; it does not claim production `no-store` pages were cached. Application headers were unchanged.

All external Meta destinations were intercepted. Positive synthetic dispatch is evidence of application event schema/deduplication behavior only. External verification remains separately **not attempted / no API response / no intended-dataset observation / no external deduplication proof**.

## Optional tests and production-readiness relevance

The **current enabled rerun passed 1,399 tests with 4 optional skips**. Both local database suites were enabled. Three emergency-disable CLI cases and one real killed-worker recovery case were added after the previously reported 1,395 passing / 4 skipped baseline.

The initial default run before those four additions passed 1,373 tests with 26 skipped: its extra 22 skips were the then-12 real-PostgreSQL outbox cases and 10 guest-checkout database cases. That is an earlier baseline, not the current default count. A default green run without the database URLs does not replace the transactional tests.

```sh
MARKETING_TEST_DATABASE_URL=postgresql://marketing_test@127.0.0.1:56543/bangbuy_marketing_test \
GUEST_CHECKOUT_TEST_DATABASE_URL=postgresql://marketing_test@127.0.0.1:56543/bangbuy_guest_checkout_test \
npm test
```

The original four optional cases are:

| Exact test | Gate and dependency | Readiness meaning |
| --- | --- | --- |
| `discovers directed pairs, deduplicates jobs, persists reviewed content and preserves manual overrides` | `__tests__/translation-local.integration.test.ts:49`; `RUN_LOCAL_TRANSLATION_INTEGRATION=1`, dedicated local `translation_local` database and real loopback LibreTranslate. | Translation integration evidence, not Meta delivery evidence. Required for confidence if deploying changes to that integration/configuration; otherwise record why unchanged. |
| `persists all public product text and structured descriptions without changing identifiers, links or prices` | Same suite, line 73 and gate. | Relevant to translation persistence/content integrity; an approved route's actual rendered fingerprint must still be reviewed independently. |
| `keeps stored content readable during a translation service outage` | Same suite, line 97 and gate; deliberately unavailable loopback service for the outage assertion. | Translation outage resilience evidence. Not required to demonstrate origin separation itself, but relevant when translation service rollout is in scope. |
| `writes a reviewable fixture using the running final build's styles` | `__tests__/rtl-layout.test.ts:135`; `BUILD_RTL_FIXTURE=1`, final build running on port 3111. | Optional unpublished Arabic visual artifact export. Normal structural RTL cases still execute. It does not establish that Arabic is published or approve a production locale. |

The translation suite explicitly rejects the production tunnel on port 15432 and remote providers. Do not remove these guards or point it at production to eliminate skips. None of the four optional cases alone prevents validating the Meta code boundary; production readiness still requires the infrastructure, migration, provider and eligibility evidence below. No new pass claim is made for these four unexecuted cases.

## Remaining real staging acceptance

The release owner must supply approved HTTPS staging hosts and the same reviewed reverse-proxy/application compatibility plan needed for the two live legacy origins. Use synthetic warm profiles for each legacy host, plus fresh catalog and commerce contexts. Keep delivery disabled until the appropriate test phase. Run the customer-state acceptance matrix, host/CSRF/CSP checks and health preflight, then record timestamp/release/build/config references without secrets.

For payment sandbox, prove hosted launch, cancel/failure/retry, delayed webhook, status reconciliation and duplicate webhook/poll handling. Do not treat return flags or a website HTTP 200 as payment/conversion proof. Current local PostgreSQL/worker tests cover atomic deduplication, retries reusing event ID, revocation, runtime disablement, expiry and isolation of marketing write failures; external callback routing and provider behavior remain unverified.

For any explicitly authorized external tracking test, use a dedicated non-production dataset and permitted synthetic content/matching fields. A test-event code alone does not isolate a production dataset. Record request attempted, provider response, observation in the intended dataset and deduplication separately. Preserve guest-conversion and COD Purchase exclusions. Do not activate an event or channel merely to finish this checklist.

No DNS, VPS configuration, production migration, production service, production tracking flag or customer browser state was changed by these local checks.
