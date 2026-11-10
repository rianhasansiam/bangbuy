# Redacted deployment environment checklist

Keep actual values in the existing protected environment store. Do not paste tokens, database URLs, guest cookies, order payloads or `.env` output into tickets, logs or this checklist. Record `present`, `absent`, `matches approved origin` and a configuration revision/hash instead. The VPS process-manager paths and owner need current verification; see [blockers](deployment-blockers.md).

## Shared application and origin settings

| Key or setting | Stage 1 requirement | Verification |
| --- | --- | --- |
| `NODE_ENV` | `production` | Production build/start; no development proxy rewrites. |
| `STOREFRONT_ORIGIN` | Exact approved new public HTTPS origin, no slash/path/query/credentials | Fresh origin with no legacy private state; hostname differs from commerce. |
| `COMMERCE_ORIGIN` | Exact retained legacy commerce HTTPS origin | Preserve its session, carts and guest receipt credentials. Resolve apex/www compatibility before strict routing. |
| `NEXT_PUBLIC_STOREFRONT_ORIGIN`, `NEXT_PUBLIC_COMMERCE_ORIGIN` | Match approved server origins at build and startup | Server document attributes are authoritative; test actual rendered navigation. |
| `AUTH_URL` | Exact private origin | Same-origin credential/register/login and callback checks. Existing alias sessions require their own reviewed compatibility. |
| `SITE_URL`, `NEXT_PUBLIC_SITE_URL` | Keep the approved retained commerce origin for the current release | `absoluteUrl` in `lib/seo/site.ts` is also used by SSLCommerz callback creation and browser redirects. Do not point it at the tracked catalog merely to change canonical metadata. Review this coupling before any later change. |
| `AUTH_SECRET` | Existing protected secret retained for session continuity | Presence and continuity evidence only; do not rotate during origin migration without a recovery plan. |
| `AUTH_TRUST_HOST` | Reviewed only behind the trusted, host-allowlisting proxy | Bind Next to loopback; overwrite forwarded host/proto/client address; reject unknown hosts. Do not trust arbitrary Internet-supplied forwarded headers. |
| `DATABASE_URL` | Existing least-privilege application connection | Never reused for local tests. Production tunnel port 15432 is production, not a test database. |
| `DIRECT_URL` | Approved migration connection per `prisma.config.ts` | Explicit controlled target for migration status/deploy; check redacted host/database identity before running. |
| Upload, currency, translation settings | Preserve existing deployment values | Existing upload/image origins, local translation and currency services remain untouched; test if changed. |
| OAuth client credentials and redirect registrations | Remain server-only; registered callback on commerce | Test real provider sandbox/login redirects without copying account tokens across origins. |
| Auth and guest cookies | Secure, HttpOnly as implemented, host-only, scoped appropriately | No cookie `Domain` override; inspect Set-Cookie metadata only. Do not broaden Domain or credentialed CORS. |

## Payment settings

Inventory the keys used by `lib/airwallex/config/airwallex.env.ts`, `lib/payments/gateways/sslcommerz/sslcommerz.client.ts` and the reconciliation route against the existing private environment. Record only presence/environment and approved callback host. Do not copy a staging credential into production or infer a callback registration from a successful local mock.

| Exact keys | Requirement |
| --- | --- |
| `AIRWALLEX_ENABLED`, `AIRWALLEX_ENV` | Preserve the approved provider enablement and sandbox/production selection. |
| `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`, `AIRWALLEX_WEBHOOK_SECRET`, `AIRWALLEX_RECONCILIATION_SECRET` | Existing protected server credentials; presence only in the checklist. |
| `AIRWALLEX_RETURN_URL` | Explicit retained commerce `/orders/payment-return`; the built-in dev-host default is not production configuration. |
| `AIRWALLEX_SANDBOX_API_BASE_URL`, `AIRWALLEX_PRODUCTION_API_BASE_URL`, `AIRWALLEX_HTTP_TIMEOUT_MS`, `AIRWALLEX_WEBHOOK_TOLERANCE_SECONDS` | Review defaults and preserve provider environment/timeouts. |
| `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_IS_LIVE` | Existing server credentials and explicit provider mode; visible picker remains hidden. |
| `PAYMENT_RECONCILIATION_SECRET` | At least 32 characters, scheduler-only bearer credential; never browser-exposed. |
| `SITE_URL` / `NEXT_PUBLIC_SITE_URL` | Current SSLCommerz callbacks and redirects derive from this origin; require the retained private commerce host. |

Airwallex return/cancel URLs, webhook secret, enable flag, currency/quote settings and reconciliation credentials must match the retained commerce origin and its provider environment. SSLCommerz success/fail/cancel/IPN URLs must remain reachable on the origin that holds the order's access cookie. Browser return parameters are navigation hints; verification and reconciliation remain authoritative. Test delayed confirmation, cancellation and retry in provider sandbox before rollout.

## Delivery disabled for Stage 1

```dotenv
META_ENVIRONMENT=disabled
META_RUNTIME_ENABLED=false
META_PIXEL_ENABLED=false
META_CAPI_ENABLED=false
TRACKING_ISOLATION_READY=false
META_DEBUG=false
META_COD_CONVERSION_DEFINITION=disabled
# Absolute path to a deployment-owned copy of config/meta-policy.example.json
META_POLICY_FILE=/ABSOLUTE/PROTECTED/PATH/meta-policy.json
```

The manifest must also have `runtimeEnabled`, `pixelEnabled`, `capiEnabled` and `isolationReady` false. Preserve denied business/source/content/event approvals. No consent or approval is manufactured by deploying infrastructure. Keep the policy outside the public webroot, non-world-writable, readable by the application and optional worker; avoid symlinked emergency targets and concurrent policy writers.

## Browser Pixel channel only when explicitly authorized

`NEXT_PUBLIC_META_PIXEL_ID` is the known production destination ID, not a credential or approval. For `META_ENVIRONMENT=staging|test`, the server selects `META_TEST_PIXEL_ID`, which must differ from that production ID. `lib/analytics/config.ts` reads the current server policy; the public response excludes access tokens and worker secrets.

Browser enablement requires the environment flag AND matching manifest flag, valid runtime/isolation gates, consent and all exact route/content/event/context approvals. Keep `META_CAPI_ENABLED=false` when only Pixel is authorized. Search, private commerce, query/hash contexts, sensitive/unknown content, mutable/unready documents and stale fingerprints remain denied.

## Optional server CAPI channel

| Key | Requirement |
| --- | --- |
| `META_CAPI_ACCESS_TOKEN` | Server-only scoped credential for the selected permitted dataset; never `NEXT_PUBLIC`, URL or logs. |
| `META_GRAPH_API_VERSION` | Supported version verified by the dataset owner; `vN.N` format. Do not guess from old examples. |
| `META_WORKER_SECRET` | Private operational credential where worker authorization is required; do not place in client bundles. The CLI worker itself is protected by host/process access. |
| `META_TEST_PIXEL_ID` | Distinct permitted non-production dataset for staging/test; not an alias of production. |
| `META_TEST_EVENT_CODE` | Required for non-production worker calls; does not replace separate dataset isolation. |
| `META_ENVIRONMENT=production` | Production mode ignores test code; production delivery requires its own explicit authorization. |

CAPI is optional. It also needs migrated outbox tables, the dedicated worker configuration, current registered-customer consent and approved truthful source/matching context. Missing real permitted identifiers remains a blocker; do not invent them or transfer public IDs into private checkout. Keep guest external events and COD Purchase excluded.
