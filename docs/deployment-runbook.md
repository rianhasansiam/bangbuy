# Application deployment runbook

Updated 12 November 2026 for removal of application-owned Meta tracking. Repository changes do not deploy the application, stop processes or apply database migrations. Use the existing BangBuy application directory and process manager; verify current paths and service ownership before operating on the host.

## Release preparation

1. Record the exact release commit, dependency lockfile, built artifact ID, protected environment revision, Node binary, application directory and named BangBuy process. Verify the current manager account and daemon. Preserve a deployable backup of source, dependencies and build assets, plus private database and upload backups.
2. Complete the [environment checklist](deployment-environment.md), [database procedure](deployment-database-and-worker.md) and [staging checks](deployment-staging-verification.md). Keep database URLs, access cookies and provider credentials out of reports and process-manager metadata.
3. Stop and remove any previously deployed conversion worker from the existing process manager and its saved restart configuration before applying `20261112000000_remove_meta_tracking`. The migration permanently deletes the three retired tracking tables. Review a restorable backup and exact target first. Earlier migration files remain immutable.
4. Install dependencies, generate the Prisma client, run the checks and build the final artifact. Keep build dependencies until compilation and validation complete. The protected-environment application launcher needs the release-local `dotenv` package at runtime.
5. Deploy only the confirmed BangBuy application. Do not restart all processes, initialize another manager or change unrelated applications. Keep persistent uploads, TLS configuration and the existing session secret intact.

## Host and application configuration

The current single-origin deployment can leave `STOREFRONT_ORIGIN`, `COMMERCE_ORIGIN` and their public counterparts blank. Do not enable separated mode as part of tracking removal. In separated mode, catalog and commerce require distinct exact HTTPS hostnames, while cart, login, account, checkout, orders and payment callbacks remain private. Preserve both legacy apex and www customer states; redirects cannot carry host-only cookies or local storage.

The checked-in Nginx renderer creates a review-only candidate and never installs it. Its configuration requires a selected catalog hostname, confirmed certificate/upload paths and a loopback application listener. Do not replace the existing combined apex/www vhost while legacy-host compatibility is unresolved. Retain explicit Host and Origin checks, bounded route-class logs, no credentialed cross-origin access and host-only session/guest cookies.

The prepared application launcher reads an owned mode-0600 environment file outside the release, binds Next to loopback and starts only the confirmed application port. The PM2 example requires the existing manager socket and stores configuration paths instead of credentials. Validate it against the actual manager before switching process declarations.

## Verification and recovery

Check the served build ID, both legacy hosts, language switching, catalog variants, cart and Buy now, guest and registered checkout, receipt authorization, stock/prices and authoritative payment status. Verify restricted CSP and no-store/no-referrer on private documents. Browser assets and network traces must contain no application-owned Meta bootstrap or delivery.

For an independently configured two-origin staging deployment, run the GET-only checker:

```sh
node scripts/deploy/healthcheck.mjs --public-origin "$STOREFRONT_ORIGIN" --commerce-origin "$COMMERCE_ORIGIN"
```

It checks six document/security/origin conditions without login or checkout mutations. It does not establish database health or payment verification and intentionally requires two origins; use ordinary application checks for the existing single-origin deployment.

Abort for failed migration, wrong artifact/configuration, lost cart/session/guest access, private API exposure or payment/stock failures. Preserve a bounded failure report and follow the [rollback procedure](deployment-rollback.md). Record actual check results for the released artifact; earlier local or historical deployment results do not establish this release's health.
