# Task: Restructure All Payment-Related Code into a Centralized Payment Module

Act as a senior software architect and full-stack engineer.

The BangBuy SSLCommerz integration is already implemented and audited as production-ready.

The goal is **NOT to rewrite the payment system**.

The goal is to **restructure the existing payment implementation so all payment-related business logic, gateway logic, validation, types, reconciliation, callbacks, transaction handling, and utilities live under one cohesive payment domain folder**.

Preserve all existing behavior, security guarantees, tests, API contracts, database behavior, and transaction semantics.

---

# Current payment architecture

The existing implementation already includes:

* SSLCommerz gateway integration
* server-side credentials only
* server-authoritative pricing
* backend validation
* no direct client-to-gateway API communication
* server-to-server SSLCommerz validation
* IPN webhook processing
* idempotent payment processing
* PostgreSQL pessimistic locking
* payment reconciliation
* fraud/risk quarantine
* payment transaction ledger
* safe UX-only callbacks
* rate limiting
* timing-safe reconciliation token validation

Current important files include:

```text
sslcommerz.ts
payment.service.ts
callback.ts

app/api/payments/sslcommerz/ipn/route.ts
app/api/payments/sslcommerz/reconcile/route.ts

payment-transaction.service.ts
```

There may be additional payment-related:

```text
types
schemas
validation
constants
helpers
Prisma utilities
tests
API adapters
payment status helpers
payment reconciliation utilities
transaction locking helpers
```

Find all of them before making changes.

---

# Existing security guarantees that MUST remain unchanged

Preserve all current guarantees.

## Zero-trust pricing

All authoritative values continue to come from the backend/database:

```text
subtotal
discount
promotion
delivery fee
tax
final amount
currency
```

Never trust client-submitted financial values.

---

## Server-to-server payment verification

Browser callbacks must remain UX-only.

They must NEVER directly mark a payment:

```text
PAID
SUCCESSFUL
COMPLETED
```

Payment finality must continue to depend on:

```text
SSLCommerz IPN
+
server-to-server validation
+
database verification
```

---

## Pessimistic locking

Preserve the current PostgreSQL locking behavior including mechanisms equivalent to:

```text
lockOrderForStatusChange
lockPaymentAttempt
```

Do not replace locking with weaker optimistic application checks without a strong, documented reason.

Concurrency safety must remain correct for:

```text
duplicate IPN
simultaneous callbacks
reconciliation jobs
admin payment actions
status updates
```

---

## Fraud/risk quarantine

Preserve risk handling such as:

```text
requiresReview = true
```

for suspicious or anomalous cases, including existing handling of:

```text
risk level anomalies
validation ID inconsistencies
duplicate payment successes
unexpected state transitions
provider inconsistencies
```

Do not remove or weaken this logic while restructuring.

---

## Reconciliation security

Preserve timing-safe token validation.

Keep logic equivalent to:

```ts
crypto.timingSafeEqual(...)
```

with the current digest/constant-time comparison strategy.

Never replace this with:

```ts
token === expectedToken
```

---

# Main architectural goal

Create a centralized payment domain under:

```text
lib/payments/
```

or:

```text
modules/payments/
```

Choose whichever matches the existing repository conventions best.

Prefer:

```text
lib/payments/
```

unless the repository already has a strong domain-module structure.

---

# Target structure

Restructure toward:

```text
lib/
└── payments/
    ├── index.ts

    ├── core/
    │   ├── payment.service.ts
    │   ├── payment.types.ts
    │   ├── payment.constants.ts
    │   ├── payment.errors.ts
    │   └── payment.utils.ts

    ├── transactions/
    │   ├── payment-transaction.service.ts
    │   ├── payment-transaction.types.ts
    │   ├── payment-locks.ts
    │   └── payment-transitions.ts

    ├── gateways/
    │   └── sslcommerz/
    │       ├── sslcommerz.client.ts
    │       ├── sslcommerz.service.ts
    │       ├── sslcommerz.types.ts
    │       ├── sslcommerz.schemas.ts
    │       ├── sslcommerz.constants.ts
    │       ├── sslcommerz.validation.ts
    │       └── sslcommerz.utils.ts

    ├── callbacks/
    │   └── payment-callback.service.ts

    ├── webhooks/
    │   └── sslcommerz-ipn.service.ts

    ├── reconciliation/
    │   ├── payment-reconciliation.service.ts
    │   └── reconciliation-security.ts

    ├── validation/
    │   ├── payment.schema.ts
    │   └── payment.validation.ts

    └── tests/
        ├── payment.service.test.ts
        ├── sslcommerz.test.ts
        ├── ipn.test.ts
        ├── reconciliation.test.ts
        └── payment-transaction.test.ts
```

This is a target architecture, not a requirement to create every file.

Do not split small files merely to match this structure.

Only create a file when it owns a clear responsibility.

---

# Important Next.js rule

Do NOT move Next.js Route Handler entrypoints out of:

```text
app/api/
```

Next.js routes must remain inside the App Router filesystem.

Keep these files:

```text
app/api/payments/sslcommerz/ipn/route.ts
app/api/payments/sslcommerz/reconcile/route.ts
app/api/payments/sslcommerz/success/route.ts
app/api/payments/sslcommerz/fail/route.ts
app/api/payments/sslcommerz/cancel/route.ts
```

if they currently exist or are required.

However, they should become **thin transport adapters**.

Example:

```ts
export async function POST(request: Request) {
  return handleSSLCommerzIPN(request);
}
```

or:

```ts
export async function POST(request: Request) {
  const result = await processSSLCommerzIPN(request);

  return toApiResponse(result);
}
```

The route should handle only transport-level responsibilities such as:

```text
request parsing
authentication if required
rate limiting
HTTP response construction
```

Business/payment logic belongs in:

```text
lib/payments/
```

---

# Desired dependency direction

Maintain this dependency direction:

```text
app/api
   ↓
lib/payments
   ↓
payment/domain services
   ↓
order/inventory/promotion services
   ↓
Prisma
```

Gateway communication:

```text
lib/payments
   ↓
gateways/sslcommerz
   ↓
SSLCommerz API
```

Never create dependencies like:

```text
lib/payments
↓
app/api
```

Business logic must not import Route Handlers.

---

# Separate provider logic from core payment logic

The payment domain must not become tightly coupled to SSLCommerz.

Core payment code should work with concepts like:

```text
PaymentProvider
PaymentAttempt
PaymentTransaction
PaymentStatus
PaymentVerification
PaymentResult
```

SSLCommerz-specific objects should stay under:

```text
gateways/sslcommerz/
```

For example:

```ts
type PaymentProvider =
  | "SSLCOMMERZ"
  | "PAYPAL";
```

Do not implement PayPal now unless already present.

The goal is simply to make future providers possible without rewriting the payment core.

---

# Gateway interface

Where useful, introduce a small provider abstraction.

Example concept:

```ts
interface PaymentGateway {
  createPaymentSession(
    input: CreatePaymentInput
  ): Promise<CreatePaymentResult>;

  validatePayment(
    input: ValidatePaymentInput
  ): Promise<PaymentValidationResult>;
}
```

Then SSLCommerz may implement:

```text
SSLCommerzGateway
```

Do NOT create excessive abstractions if only one gateway exists.

Use the smallest abstraction that creates a clean provider boundary.

---

# Move SSLCommerz integration

Existing code such as:

```text
sslcommerz.ts
```

should be moved/refactored into something like:

```text
lib/payments/gateways/sslcommerz/
```

Separate responsibilities where useful:

```text
sslcommerz.client.ts
```

Responsible for:

```text
HTTP requests
sandbox/live base URL
timeouts
headers
gateway API communication
```

---

```text
sslcommerz.schemas.ts
```

Responsible for validating:

```text
SSLCommerz responses
IPN payloads
validation responses
session responses
```

---

```text
sslcommerz.service.ts
```

Responsible for domain-aware orchestration between SSLCommerz and the BangBuy payment system.

---

```text
sslcommerz.types.ts
```

Contains provider-specific types.

---

```text
sslcommerz.constants.ts
```

Contains:

```text
provider name
currency
timeouts
supported statuses
provider identifiers
```

Do not put credentials in constants.

---

# Central payment orchestration

Move/refactor:

```text
payment.service.ts
```

under:

```text
lib/payments/core/payment.service.ts
```

or equivalent.

This should remain the primary payment orchestration layer.

Responsibilities may include:

```text
create payment attempt
initiate payment
validate payment
apply payment success
apply payment failure
apply payment cancellation
coordinate transaction ledger
coordinate order status
coordinate inventory behavior
coordinate reconciliation
```

Do not move catalog/order-specific logic into the payment module unless it is directly required by payment orchestration.

---

# Payment transaction ledger

Move:

```text
payment-transaction.service.ts
```

under:

```text
lib/payments/transactions/
```

This module should own payment transaction-specific operations such as:

```text
create attempt
find by provider transaction ID
record validation
record provider transaction data
mark success
mark failure
mark cancelled
mark review required
fetch customer transaction history
fetch admin transaction ledger
```

Keep Prisma access centralized according to the repository's existing service conventions.

---

# State transitions

If payment transition logic currently exists across multiple files, centralize it.

Example:

```text
lib/payments/transactions/payment-transitions.ts
```

Define valid transitions like:

```text
PENDING → PAID
PENDING → FAILED
PENDING → CANCELLED
```

And rules for:

```text
PAID → duplicate PAID event
FAILED → late gateway success
CANCELLED → late gateway success
```

Do not duplicate transition rules across:

```text
IPN
callback
reconciliation
admin endpoints
```

Every flow should use the same transition policy.

---

# Database locking

Centralize payment-specific database locks if appropriate.

Example:

```text
lib/payments/transactions/payment-locks.ts
```

Move helpers equivalent to:

```text
lockPaymentAttempt
lockOrderForStatusChange
```

only if they are payment-specific.

If order locking is shared by non-payment order workflows, leave it in the order domain and import it.

Do not move shared business logic just to make the payment folder larger.

---

# IPN processing

Move all IPN business logic into:

```text
lib/payments/webhooks/sslcommerz-ipn.service.ts
```

The actual route should be thin.

Target:

```text
app/api/payments/sslcommerz/ipn/route.ts
```

→

```text
validate request shape
apply abuse controls where appropriate
delegate to payment module
return HTTP response
```

The payment module should handle:

```text
transaction lookup
locking
SSLCommerz validation
amount verification
currency verification
provider verification
state transition validation
risk detection
ledger update
order update
idempotency
```

---

# Browser callback handling

Move callback business logic into:

```text
lib/payments/callbacks/payment-callback.service.ts
```

or provider-specific equivalent.

Callbacks remain UX-only.

Their responsibilities should remain limited to things such as:

```text
identify safe internal order
determine redirect destination
show processing/success/failure UX
```

Callbacks must NEVER become the payment authority.

Do not allow callback parameters to directly mutate payment state.

---

# Reconciliation

Move reconciliation logic into:

```text
lib/payments/reconciliation/
```

Possible structure:

```text
payment-reconciliation.service.ts
reconciliation-security.ts
```

Preserve:

```text
batch recovery
provider validation
database locking
idempotency
risk handling
status correction
safe logging
```

Keep timing-safe reconciliation secret validation.

The Next.js route:

```text
app/api/payments/sslcommerz/reconcile/route.ts
```

should delegate to the reconciliation module.

---

# Validation

Consolidate payment-specific Zod schemas under:

```text
lib/payments/validation/
```

when they are exclusively payment-related.

Examples:

```text
payment method
payment initiation
IPN payload
reconciliation request
callback parameters
provider transaction identifiers
```

Do not move general checkout validation if it belongs to the checkout domain.

Avoid duplicating Zod schemas.

---

# Server-only boundary

The entire payment module containing credentials/provider communication must remain server-only.

Use:

```ts
import "server-only";
```

where appropriate.

Ensure client components cannot accidentally import:

```text
SSLCommerz credentials
gateway clients
reconciliation secrets
database payment services
```

If shared payment types are required by client code, isolate them in a safe file that does not import server-only modules.

Example:

```text
features/payments/payment.types.ts
```

or a carefully isolated shared type module.

---

# Client-side payment code

Do NOT move browser UI into:

```text
lib/payments/
```

Client code may stay under:

```text
features/payments/
components/checkout/
```

The browser should only know concepts like:

```text
payment method
payment URL
payment status
order/payment display information
```

It must never know:

```text
store password
gateway API internals
validation secrets
reconciliation secrets
provider credentials
```

---

# Avoid circular dependencies

Before restructuring, inspect dependencies.

Prevent cycles such as:

```text
payment.service
→ order.service
→ payment.service
```

Where necessary, extract small domain functions rather than creating circular service imports.

Desired architecture:

```text
Payment orchestration
      ↓
Order operations
Inventory operations
Promotion operations
Payment ledger
Gateway provider
```

Keep orchestration ownership clear.

---

# Public module API

Provide a clean barrel file where useful:

```text
lib/payments/index.ts
```

Expose only intended payment APIs.

Example:

```ts
export {
  initiatePayment,
  processPaymentVerification,
  reconcilePayment,
} from "./core/payment.service";
```

Do not export:

```text
credentials
internal lock helpers
raw gateway secrets
private provider internals
```

Avoid exporting every internal file.

---

# Tests

Move or organize payment tests alongside the centralized payment domain if consistent with the repository test conventions.

At minimum preserve and run tests covering:

```text
payment initiation
SSLCommerz session creation
IPN processing
server-side verification
amount mismatch
currency mismatch
unknown transaction
duplicate IPN
risk quarantine
callback safety
reconciliation
reconciliation authentication
concurrency
database locks
status transitions
cross-user authorization
```

Do not delete tests merely because import paths changed.

Update imports and mocks carefully.

---

# Refactor requirements

This should be a structural refactor.

Avoid behavioral changes.

Do NOT:

```text
change gateway behavior
change checkout amounts
change Prisma semantics unnecessarily
change payment statuses unnecessarily
change API contracts unnecessarily
change inventory behavior
change promotion behavior
change authorization rules
change reconciliation semantics
change callback behavior
remove database locks
weaken rate limiting
```

If a behavioral change is necessary to support the restructure, clearly explain why.

---

# Refactor sequence

Perform the restructure in small stages.

## Step 1

Inventory every payment-related file.

Provide a dependency map before moving code.

Example:

```text
Checkout
   ↓
PaymentService
   ├── PaymentTransactionService
   ├── OrderService
   ├── InventoryService
   └── SSLCommerz
```

---

## Step 2

Create the centralized payment module.

Do not delete existing code yet.

---

## Step 3

Move provider-specific SSLCommerz code.

Update imports.

Run type checking.

---

## Step 4

Move core payment orchestration.

Update imports.

Run tests.

---

## Step 5

Move transaction/reconciliation/callback/IPN logic.

Keep App Router route handlers thin.

---

## Step 6

Remove obsolete payment files only after all callers have migrated.

Search the entire repository for stale imports.

---

## Step 7

Run complete verification.

---

# Desired final architecture

Target high-level structure:

```text
app/
└── api/
    └── payments/
        └── sslcommerz/
            ├── ipn/
            │   └── route.ts
            ├── reconcile/
            │   └── route.ts
            ├── success/
            │   └── route.ts
            ├── fail/
            │   └── route.ts
            └── cancel/
                └── route.ts


lib/
└── payments/
    ├── index.ts
    │
    ├── core/
    │   ├── payment.service.ts
    │   ├── payment.types.ts
    │   ├── payment.constants.ts
    │   └── payment.errors.ts
    │
    ├── gateways/
    │   └── sslcommerz/
    │       ├── sslcommerz.client.ts
    │       ├── sslcommerz.service.ts
    │       ├── sslcommerz.types.ts
    │       ├── sslcommerz.schemas.ts
    │       └── sslcommerz.constants.ts
    │
    ├── transactions/
    │   ├── payment-transaction.service.ts
    │   ├── payment-locks.ts
    │   └── payment-transitions.ts
    │
    ├── callbacks/
    │   └── payment-callback.service.ts
    │
    ├── webhooks/
    │   └── sslcommerz-ipn.service.ts
    │
    ├── reconciliation/
    │   ├── payment-reconciliation.service.ts
    │   └── reconciliation-security.ts
    │
    └── validation/
        └── payment.schema.ts
```

And:

```text
components/
features/
```

may continue to contain payment-related presentation/client code where appropriate.

Do not force UI code into the server-side payment module.

---

# Architectural rule

The centralized folder is a **payment domain module**, not a dumping ground.

Each submodule must have a clear responsibility.

Core principle:

```text
Payments own payment behavior.

Orders own order behavior.

Inventory owns inventory behavior.

Promotions own promotion behavior.

SSLCommerz owns provider-specific behavior.

Routes own HTTP transport.

Components own UI.
```

The payment module may orchestrate other domains, but it should not absorb their internal responsibilities.

---

# Documentation

Update existing payment architecture documentation and:

```text
payment_system_audit_report.md
```

if paths change.

Update sequence diagrams to reflect the new module structure.

The documented security guarantees must remain true.

Do not claim behavior changed unless it actually changed.

---

# Verification

After restructuring run:

```bash
npm run lint
npx tsc --noEmit
npx vitest run
```

Also run the relevant payment-specific tests separately.

Search for stale references:

```bash
rg "sslcommerz"
rg "payment.service"
rg "payment-transaction.service"
rg "callback"
rg "reconcile"
```

Verify no duplicate old implementation remains.

---

# Final report

After completing the refactor, provide:

## Previous structure

Show where payment code existed before.

## New structure

Print the final payment directory tree.

## Files moved

Provide:

```text
old path → new path
```

for every moved payment file.

## Files created

List new files and their responsibility.

## Files deleted

List obsolete files removed after migration.

## Import changes

Explain important dependency direction changes.

## Security verification

Explicitly verify that restructuring did NOT weaken:

```text
server-only credentials
server-authoritative pricing
input validation
rate limiting
IPN verification
server-to-server validation
payment idempotency
PostgreSQL locking
fraud quarantine
reconciliation authentication
timing-safe comparison
authorization
payment transaction history
```

## Test results

Provide actual results for:

```text
lint
TypeScript
Vitest
payment tests
```

Do not claim success for commands that were not executed.

---

# Critical rule

This is a **refactor, not a rewrite**.

The existing audited payment behavior is the source of truth.

Prefer:

```text
move
rename
extract
centralize
update imports
```

over:

```text
rewrite
simplify security logic
replace transaction handling
replace locking
redesign payment flow
```

The final system should behave exactly as before, but the payment architecture should be easier to understand, maintain, test, audit, and extend.

The desired result is:

```text
Thin Next.js Routes
        ↓
Central Payment Domain
        ↓
┌────────────────────────────┐
│ Payment Core               │
│ Transaction Ledger         │
│ IPN Processing             │
│ Reconciliation             │
│ Risk Handling              │
│ Callback Handling          │
└────────────────────────────┘
        ↓
Gateway Abstraction
        ↓
SSLCommerz
```

while preserving the existing production-grade security guarantees.
