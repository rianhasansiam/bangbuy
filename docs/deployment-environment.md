# Redacted deployment environment checklist

Keep actual values in the protected deployment environment. Record presence, approved host matches and configuration revisions; do not export tokens, database URLs, guest cookies, order payloads or environment-file contents.

## Application and origins

| Setting | Requirement |
| --- | --- |
| `NODE_ENV` | `production` for build/start. |
| `DATABASE_URL`, `DIRECT_URL` | Existing application and approved direct migration connections. Confirm exact target privately before migrations. Production tunnel port 15432 is never a test database. |
| `AUTH_SECRET` | Preserve the existing protected secret for session continuity. |
| `AUTH_URL`, `AUTH_TRUST_HOST` | Preserve the approved commerce origin and trusted, host-allowlisting proxy boundary. Bind Next to loopback; overwrite forwarded information and reject unknown hosts. |
| `SITE_URL`, `NEXT_PUBLIC_SITE_URL` | Preserve the approved commerce origin: SSLCommerz callbacks and redirects also use this URL helper. |
| `STOREFRONT_ORIGIN`, `COMMERCE_ORIGIN` | Optional separate exact HTTPS origins without paths, queries or credentials. Leave blank for the current single-origin deployment. Do not introduce an origin migration with tracking removal. |
| `NEXT_PUBLIC_STOREFRONT_ORIGIN`, `NEXT_PUBLIC_COMMERCE_ORIGIN` | Match server origins at build/start if separated mode is configured. Server-rendered navigation attributes remain authoritative. |
| Upload, currency, translation and OAuth settings | Preserve existing private values and approved callback/upload hosts; test any changed service. |
| Auth and guest cookies | Retain Secure/HttpOnly metadata and host-only scope. Do not broaden cookie Domain or enable credentialed CORS. |

Remove obsolete tracking configuration and credentials from the private application environment and any saved process-manager environment during the separately operated deployment. No tracking ID, token, policy file or enable flag is required by the application. Stop any retired conversion worker and remove its saved restart entry before applying the removal migration.

## Optional browser Meta Pixel integration

Added 17 November 2026. This browser integration is separate from the retired
server tracking worker and tables described above; it requires no server token,
worker or database change.

| Setting or dependency | Requirement |
| --- | --- |
| `NEXT_PUBLIC_META_PIXEL_IDS` | Optional comma-separated numeric IDs, empty by default. Trims whitespace, discards empty/invalid entries and deduplicates string IDs. Migrate the previous singular `NEXT_PUBLIC_META_PIXEL_ID` value into this setting. IDs are public; never put tokens or secrets here. |
| `NEXT_PUBLIC_META_PIXEL_TEST_MODE` | Default `false` still permits normal production tracking when preferences allow. `true` is a custom application flag permitting local/development/browser automation, not a Meta sandbox; use dedicated test Pixels because requests are real. Saved rejection and URL guards still apply, and `NODE_ENV=test` always stays disabled. Keep `false` for release. |
| Build/runtime agreement | Public values are embedded at build time. Rebuild and redeploy after adding/removing IDs or changing test mode; match runtime configuration so CSP and USD quote loading agree. A process restart alone does not change browser values. |
| Marketing preferences | CookieConsent restores `bangbuy:marketing-consent:v1` from localStorage. Readable absent/granted preferences activate tracking automatically without an initial banner; saved rejection keeps it off. Automatic activation does not write an explicit acceptance. Cookie settings retains Accept/Reject and withdrawal. Unreadable storage keeps tracking off and opens the choices; explicit choices work for the document even if persistence fails. Earlier shopping actions are not replayed. |
| SDK loading fallback | A script error or 10 seconds without its load event offers Reload page / Continue shopping on eligible pages. Continue dismisses the prompt for the tab session under `bangbuy:meta-load-prompt-dismissed:v1`, with memory fallback, and future pages still try automatically. Reload is a normal page reload; there are no automatic retries or blocker bypasses. SDK load success does not prove Meta receipt. |
| Meta account configuration | Disable automatic advanced matching, automatic events/event detection and Event Setup Tool event rules for every configured Pixel. Remove any independent duplicate tracking installation. Verify each ID separately in Helper and Events Manager. |

Use the event triggers, privacy exclusions, dedicated test setup and browser-only
limitations in [Meta Pixel](meta-pixel.md). Do not restore retired server tracking
credentials or workers to enable this optional integration.

For production, Next resolves settings from inherited `process.env`, then
`.env.production.local`, `.env.local`, `.env.production` and `.env`, stopping at
the first value. An empty higher-priority value also overrides a lower one.
The protected-environment application launcher runs only at startup and does not
supply the build environment. Pass the plural ID list to the deployment build as
well as the protected runtime file. Local `.env` changes alone do not update the
served production artifact. Do not replace supplied real IDs with the empty
example value or rely on the old singular variable.

The earlier local build failed because the developer SSH tunnel at
`127.0.0.1:15432` was unavailable. The production database was healthy, and the
consent-repair release subsequently passed its full VPS build and deployment.
The automatic-default/loading-fallback change needs a fresh successful full
`npm run build` and deployment; successful compilation alone is insufficient.

## Payments

Inventory the settings used by the installed payment integrations against the existing private environment. Record presence and provider environment rather than credential values.

| Settings | Requirement |
| --- | --- |
| `AIRWALLEX_ENABLED`, `AIRWALLEX_ENV` | Preserve the approved enablement and sandbox/production selection. |
| `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`, `AIRWALLEX_WEBHOOK_SECRET`, `AIRWALLEX_RECONCILIATION_SECRET` | Existing protected server credentials. |
| `AIRWALLEX_RETURN_URL` | Explicit approved commerce `/orders/payment-return`; development defaults are not production configuration. |
| Airwallex API-base, timeout, tolerance and currency/quote settings | Preserve provider environment and approved behavior. |
| `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_IS_LIVE` | Existing protected credentials and explicit provider mode. |
| `PAYMENT_RECONCILIATION_SECRET` | Scheduler-only bearer credential, at least 32 characters; never browser-exposed. |

Payment callbacks must remain reachable on the origin holding the order-access cookie. Return parameters are navigation hints; verified callbacks/status reconciliation remain authoritative. Exercise delayed confirmation, cancellation and retry in the provider sandbox before release.
