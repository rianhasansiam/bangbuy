# Staging verification

Run these checks against the final tracking-removal artifact. Historical validation results and prior deployment observations do not establish current health. Record actual commands, results, build ID and configuration revision without credentials or customer values.

## Local validation

```sh
npm run typecheck
npm run lint
npm run i18n:validate
npm run build
```

Inspect the generated browser assets and rendered public/private documents for absence of application-owned tracking bootstrap. Verify that retired tracking and consent endpoints are absent. Keep payment provider hosts available in private CSP.

## Commerce and host acceptance

Use an explicitly isolated database and synthetic customer profiles for manual commerce checks. Never use the application database or production tunnel. Do not run concurrent builds in the same checkout.

Check catalog variants and quantity, cart handoff with no GET mutation, guest Buy now, selected/full cart checkout, guest receipt in another tab, denial from unrelated browser contexts, guest-cart login merge, product redirects and locale switching. Forged payment return flags must not mark an order paid. Preserve cart/session/receipt data rather than clearing it to make checks pass.

For an already configured two-origin staging pair:

```sh
node scripts/deploy/healthcheck.mjs --public-origin "$STOREFRONT_ORIGIN" --commerce-origin "$COMMERCE_ORIGIN"
```

The checker verifies both home documents with restricted headers, public private-page redirect, public account API denial, cross-origin private API denial without CORS, and no-store/restricted headers on the private cart. It uses GET requests and does not execute browser scripts. The current single-origin deployment should use its own ordinary page/journey checks rather than introducing an origin cutover for this release.

## Migration and provider acceptance

Rehearse the pending tracking-table removal migration on an isolated database with synthetic tracking and commerce records. Confirm only the retired tables disappear, commerce data remains usable and migration history/checksums are preserved. Stop any deployed old conversion worker before applying the migration. Follow the [database procedure](deployment-database-and-worker.md).

On provider sandbox, verify hosted payment launch, cancel/failure/retry, delayed webhook, reconciliation and duplicate callback/poll convergence. HTTP 200 and return flags alone do not establish payment verification. Before any later origin split, prove each legacy apex/www warm profile preserves cart, session, guest receipt and payment returns. No customer browser storage should be cleared as part of acceptance.

Verify translation-service availability and offline stored-content behavior manually, alongside desktop/mobile language selection and RTL layout. Keep these checks isolated from production data.
