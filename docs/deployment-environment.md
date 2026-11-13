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
