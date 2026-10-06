# Guest checkout

Checkout supports signed-in customers and unauthenticated guests through the
same pricing, inventory, promotion, order, and payment services. `User.role`
still contains only `USER` and `ADMIN`. Guests have no account, password, or
authenticated session.

## Persistence and access

Each successful guest checkout creates a `GuestCustomer` inside the order
transaction. Orders reference either a registered user or a guest profile.
Contact fields on the order remain the historical delivery snapshot. Guest
contacts are not unique and are never used to find, modify, or authorize a user.
Historical orders retain their existing associations; the migration does not
backfill guest identities.

The read-only preview establishes a random HttpOnly checkout cookie. Public
submission requires that established identity and a UUID idempotency key for
every payment method. Identical attempts serialize through a PostgreSQL
transaction advisory lock and return the original order, including after a
registered full-cart checkout clears its saved cart. The transaction includes
guest creation, stock movements, inventory logs, promotion usage, and payment
reservation. Rollback removes all of these writes if it fails.

Checkout sets a separate unguessable HttpOnly bearer cookie for each guest
order. Only its digest is stored on the order. Guest order detail, Airwallex
retry/status, and SSLCommerz browser callbacks verify that scoped credential.
Order IDs, email addresses, phone numbers, and the general checkout cookie do
not authorize an order read. Access cookies expire in the browser after 30 days
and require HTTPS in production. Clearing cookies or changing browsers loses
guest access; there is no contact-based recovery or order claiming flow.

Profile, registered order history, customer cancellation, admin endpoints, and
other protected features continue to require their existing authorization.
Admins process guest orders through the existing status, cancellation, and
payment-review workflows. Only newly associated guest profiles receive the
Guest label; historical unassociated orders are not relabeled.

The admin Customers page (`/admin/users`) lists registered accounts and guest
checkout profiles together. A customer-type filter selects Guests or Registered
customers; account roles remain a separate registered-only filter. Guest rows
show their submitted contact/address, order count, and non-cancelled order spend,
and have no role-management actions. Repeated contacts remain separate guest
profiles. Guest directory reads use the protected, uncached
`GET /api/admin/guests` endpoint, so refreshing the page fetches current profiles
and order totals.

COD and Airwallex retain optional guest email. SSLCommerz requires an email of
at most 50 characters and validates it before reserving an order. Signed-in
orders continue using the account email. Payment return flags never establish
payment success; existing provider verification, webhooks, and reconciliation
remain authoritative.

## Deployment

Apply the migration using the existing migration connection configuration,
then regenerate the client and build before starting the updated application:

```sh
npx prisma migrate deploy
npx prisma generate
npm run build
```

The migration is
`prisma/migrations/20261006000000_guest_checkout/migration.sql`. No new production
environment variable is required. Existing `AUTH_URL`, database, payment, and
proxy/IP-header configuration remains in use. Production must use HTTPS for
guest cookies. The configured application database was not migrated during
implementation; migration verification used a disposable local PostgreSQL
cluster.

Both public checkout routes enforce same-origin browser requests, persistent
rate limiting, JSON body size limits, and server validation. Guest submissions
also have an IP limit so rotating cookies does not reset the only limit.

## Changed files and their purposes

- `prisma/schema.prisma` and the new migration: guest profiles, optional order
  association, private access digest, checkout attempt key/fingerprint, indexes,
  and database constraints preserving historical associations.
- `lib/orders/checkout-customer.ts`: server identity, scoped token derivation,
  ownership, attempt keys, and removal of private fields from API data.
- `lib/orders/guest-access.ts`: checkout bootstrap, scoped cookies, origin
  validation, and guest order authorization.
- `lib/services/checkout.service.ts`: shared transactional guest/registered
  checkout, authoritative pricing, COD retry protection, and gateway reservation
  replay handling.
- `lib/validations/checkout.validation.ts`: normalized contact validation and
  checkout UUID requirements; `lib/validations/order.validation.ts`: admin
  customer-type filter.
- `app/api/checkout/route.ts` and `app/api/checkout/preview/route.ts`: anonymous
  checkout, guest identity/quote binding, abuse controls, and private cookies.
- `app/api/orders/[id]/route.ts`, `app/api/orders/route.ts`, and
  `lib/services/order.service.ts`: scoped guest reads, private-field removal,
  unchanged registered order ownership, and admin snapshot/filter serialization.
- `app/(shop)/checkout/page.tsx`, `layout.tsx`, and components
  `CheckoutHeader.tsx`, `CustomerForm.tsx`, `OrderSummaryCard.tsx`: optional login,
  editable guest email, local guest cart handling, field errors, and submission
  locking.
- `app/(shop)/cart/page.tsx` and
  `app/(shop)/products/[slug]/components/ProductActions.tsx`: guest entry into
  cart checkout and Buy Now.
- `features/checkout/api.ts`, `idempotency.ts`, and `features/orders/api.ts`:
  guest request/types, stable attempt keys across quote refreshes, initial
  preview serialization, field errors, and order identity typing.
- `app/(shop)/orders/[id]/page.tsx` and
  `components/OrderSummaryClient.tsx`: cookie-authorized guest confirmation and
  payment polling.
- `lib/payments/core/payment-order-access.ts` and `payment-order-customer.ts`:
  scoped guest payment authorization and exact database ownership predicates.
- `lib/payments/core/payment-initiation.service.ts` and
  `lib/payments/callbacks/payment-callback.service.ts`: SSLCommerz guest replay,
  concurrent initialization protection, verified callbacks, and SameSite cookie
  return handling.
- Airwallex handlers `initiate-payment.handler.ts`, `payment-status.handler.ts`,
  repository `airwallex-payment.repository.ts`, and services
  `airwallex-payment-initiation.service.ts`, `airwallex-payment-status.service.ts`:
  guest retry/status authorization through the existing frozen payment quote
  and provider verification paths.
- `app/admin/orders/page.tsx`, components `AdminOrderDrawer.tsx`,
  `OrdersTable.tsx`, `OrdersToolbar.tsx`, `features/admin-orders/api.ts`, and
  `app/api/admin/orders/route.ts`: Guest/Registered labels and filter, submitted
  contact/location/notes, and admin order API documentation.
- `app/admin/users/page.tsx`, components `UserSummaryCards.tsx`,
  `UsersTable.tsx`, `UsersToolbar.tsx`, `features/admin-users/api.ts`, and
  `store/slices/admin-users.slice.ts`: combined registered/guest customer
  directory, search/type filters, guest summary, and account-only role controls.
- `app/api/admin/guests/route.ts`, `lib/services/guest-customer.service.ts`, and
  `lib/validations/user.validation.ts`: authorized guest contact pagination,
  search, and per-guest order aggregates without account/contact matching.
- New tests `admin-guest-orders`, `guest-checkout-api`,
  `guest-checkout-client`, `guest-checkout-database`, `guest-checkout-form`,
  `guest-checkout-route`, `guest-order-access`, `guest-payment-callback`,
  `guest-sslcommerz-checkout`, and `airwallex-guest-access`: admin rendering,
  browser logic, request validation, authorization, transactions, and payment
  regression coverage.
- `__tests__/admin-guest-customers.test.ts` and
  `__tests__/admin-guest-customers-ui.test.ts`: directory authorization, profile
  pagination/aggregates, guest display/filtering, registered account compatibility,
  and guest exclusion from role updates.
- Updated tests `currency-order-snapshots`, `meta-pixel-checkout`,
  `meta-pixel-product-actions`, `airwallex-initiation`, and
  `airwallex-payment-quote-token`: guest entry behavior, registered fixtures,
  concurrent replay, and guest-bound quotes.

## Verification and follow-up

Verification performed for the initial guest checkout implementation:

- Prisma generation and schema validation passed.
- The new SQL migration applied to an original-schema local database containing
  a registered user, an administrator, and a historical order. Original fields
  and associations were unchanged. Prisma migration/schema comparison reported
  no differences.
- Ten real PostgreSQL integration tests passed, covering guest and registered
  checkout, account/contact isolation, full-cart replay, concurrent identical
  attempts, last-unit races, stock rejection, post-write rollback, scoped reads,
  database constraints, and admin cancellation with stock/promo restoration.
- Production build, TypeScript, and whitespace checks passed. Full ESLint
  completed with no errors and four existing warnings.
- A production-server HTTP smoke check passed for anonymous COD checkout,
  one-debit retry replay, scoped confirmation, and profile/history/admin denial.
- Chrome verification completed a COD order using only required guest fields
  and displayed its order receipt without login.
- The full automated suite reports one existing failure in
  `__tests__/product-card-responsive.test.ts:91`, whose expected mobile button
  classes do not match the unchanged `ProductCard.tsx` implementation. All other
  tests pass: 584 passed and one failed across 47 files, including all checkout,
  authentication, order management, and payment tests. This run enabled all ten
  real database tests.

The database suite is opt-in and defaults to skipped. Set
`GUEST_CHECKOUT_TEST_DATABASE_URL` to an already migrated, disposable local
database named `bangbuy_guest_checkout_test`, then run:

```sh
npx vitest run __tests__/guest-checkout-database.test.ts
```

This suite replaces test data in that database. It rejects remote hostnames and
other database names, and never reads the application `DATABASE_URL` or `.env`.

Before production release, manually verify real Airwallex/SSLCommerz sandbox
redirects, webhook outcomes, gateway cancellation/retry, and admin fulfillment
in the deployment environment. No live payment was charged during testing.
