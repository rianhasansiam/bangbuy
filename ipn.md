# Task: Fix SSLCommerz Payment Stuck in PROCESSING / UNPAID

Act as a senior software engineer specializing in payment systems, Next.js, PostgreSQL, Prisma, concurrency, and secure webhook architecture.

The BangBuy SSLCommerz integration is already implemented with:

* server-only credentials
* server-authoritative pricing
* SSLCommerz IPN
* server-to-server validation
* idempotency
* PostgreSQL row locking
* payment risk quarantine
* reconciliation
* safe browser callbacks
* separate order/payment states

Do **not rewrite the payment system**.

Diagnose and fix the case where a successful SSLCommerz payment can remain:

```text
PROCESSING
UNPAID
```

because the browser callback succeeds but SSLCommerz IPN is delayed, missing, blocked, or not processed.

The solution must preserve the existing zero-trust payment architecture.

---

# Current Payment Structure

```text
lib/payments/
├── index.ts
│
├── core/
│   ├── payment.service.ts
│   ├── payment-initiation.service.ts
│   ├── payment-verification.service.ts
│   ├── payment-status.service.ts
│   ├── payment-risk.service.ts
│   ├── payment.constants.ts
│   ├── payment.errors.ts
│   └── payment.types.ts
│
├── gateways/
│   └── sslcommerz/
│       ├── sslcommerz.client.ts
│       ├── sslcommerz.service.ts
│       ├── sslcommerz.schemas.ts
│       ├── sslcommerz.types.ts
│       └── sslcommerz.constants.ts
│
├── callbacks/
│   └── payment-callback.service.ts
│
├── transactions/
│   ├── payment-transaction.service.ts
│   └── payment-transitions.ts
│
├── reconciliation/
│   ├── payment-reconciliation.service.ts
│   └── reconciliation-security.ts
│
├── validation/
│   ├── payment.schema.ts
│   └── payment-transaction.schema.ts
│
└── __tests__/
    ├── helpers.ts
    ├── payment-initiation.test.ts
    ├── payment-verification.test.ts
    ├── payment-reconciliation.test.ts
    ├── payment-callback.test.ts
    └── sslcommerz.test.ts
```

Keep this architecture.

Do not move payment domain logic back into Route Handlers.

---

# Current Payment Confirmation Flow

There are currently two paths.

## Path 1 — Browser callback

```text
SSLCommerz
   ↓
POST success callback
   ↓
BangBuy callback handler
   ↓
303 redirect
   ↓
Order page
```

The callback currently acts only as a UX signal.

It does not mark payment PAID.

That security property must remain.

---

## Path 2 — IPN

```text
SSLCommerz
   ↓
POST /api/payments/sslcommerz/ipn
   ↓
parse IPN
   ↓
server-to-server SSLCommerz validation
   ↓
verify transaction
   ↓
verify amount
   ↓
verify currency
   ↓
risk checks
   ↓
database transaction
   ↓
UNPAID/PENDING → PAID
```

This currently performs payment confirmation.

---

# Current Problem

The order summary page polls approximately every 2.5 seconds for up to 60 seconds.

Example:

```text
GET /api/orders/{id}
↓
paymentStatus = UNPAID
↓
wait
↓
GET again
↓
paymentStatus = UNPAID
```

Polling only observes database state.

It does not verify the payment.

Therefore, when:

```text
successful gateway payment
+
success callback received
+
IPN missing/delayed
```

the payment can remain:

```text
PROCESSING
UNPAID
```

indefinitely until another backend process reconciles it.

This must be fixed.

---

# Critical Security Invariant

Do NOT change this:

```text
browser callback != proof of payment
```

Never implement:

```text
success callback
→ mark PAID
```

That is forbidden.

Instead, implement:

```text
success callback
→ trigger server-side verification
→ SSLCommerz server API
→ verify transaction
→ trusted payment transition
```

The callback may trigger verification.

The callback itself may never be considered payment proof.

---

# Desired Architecture

Use three independent triggers that converge into the **same authoritative verification pipeline**.

```text
                      SSLCommerz
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
           IPN       Success Callback  Reconciliation
            │              │              │
            └──────────────┼──────────────┘
                           ▼
              payment-verification.service
                           │
                           ▼
                  SSLCommerz Server API
                           │
                           ▼
                 verify provider result
                           │
                           ▼
                  payment-risk.service
                           │
                           ▼
                 payment-status.service
                           │
                           ▼
                  PostgreSQL transaction
                           │
                           ▼
                          PAID
```

There must be ONE authoritative verification/status transition implementation.

Do not duplicate payment verification logic in:

```text
IPN
callback
reconciliation
```

All three should reuse the same domain functions.

---

# Step 1 — Diagnose Current IPN Flow

Before changing code, inspect the complete current implementation.

Inspect:

```text
payment-verification.service.ts
payment-callback.service.ts
payment-reconciliation.service.ts
sslcommerz.service.ts
sslcommerz.client.ts
payment-status.service.ts
payment-risk.service.ts
payment-transitions.ts

app/api/payments/sslcommerz/ipn/route.ts
app/api/payments/sslcommerz/success/route.ts
app/api/payments/sslcommerz/fail/route.ts
app/api/payments/sslcommerz/cancel/route.ts
app/api/payments/sslcommerz/reconcile/route.ts
```

Also inspect:

* session initialization request
* `ipn_url`
* callback URLs
* current Content-Type parsing
* authentication requirements
* CSRF/origin checks
* rate limiting
* reverse proxy behavior
* Cloudflare behavior if configured
* payment transaction fields
* session ID / transaction ID persistence
* SSLCommerz `val_id` handling

Determine whether the IPN can currently fail because of:

```text
wrong IPN URL
private/unreachable URL
authentication guard
origin/CSRF validation
rate limiter
wrong request parser
invalid Zod schema
Cloudflare/WAF rejection
missing transaction lookup
SSLCommerz validation failure
amount mismatch
currency mismatch
risk quarantine
state transition rejection
database locking issue
```

Do not assume the sandbox is responsible without evidence.

---

# Step 2 — Add Structured Payment Observability

Add safe structured logging around the payment lifecycle.

Do not log credentials or sensitive PII.

Track stages such as:

```text
PAYMENT_INITIATED

CALLBACK_RECEIVED
CALLBACK_VERIFICATION_STARTED
CALLBACK_VERIFICATION_SUCCEEDED
CALLBACK_VERIFICATION_PENDING
CALLBACK_VERIFICATION_FAILED

IPN_RECEIVED
IPN_PARSED
IPN_PAYMENT_FOUND
IPN_VALIDATION_STARTED
IPN_VALIDATION_SUCCEEDED
IPN_VALIDATION_FAILED

PAYMENT_AMOUNT_VERIFIED
PAYMENT_CURRENCY_VERIFIED
PAYMENT_TRANSACTION_VERIFIED

PAYMENT_RISK_ACCEPTED
PAYMENT_RISK_REVIEW_REQUIRED

PAYMENT_STATUS_COMMITTED

RECONCILIATION_STARTED
RECONCILIATION_PAYMENT_FOUND
RECONCILIATION_VERIFIED
RECONCILIATION_COMMITTED
```

Include safe identifiers:

```text
internal order ID
internal payment attempt ID
provider transaction ID
provider
current status
target status
```

Never log:

```text
store password
API secrets
authorization tokens
full card information
unnecessary customer information
```

---

# Step 3 — Extract a Shared Authoritative Verification Pipeline

Ensure `payment-verification.service.ts` owns the shared verification operation.

Conceptually create or reuse something like:

```ts
verifyAndFinalizePayment(...)
```

or:

```ts
verifySSLCommerzPayment(...)
```

The exact name should follow existing conventions.

It must be callable from:

```text
IPN
success callback
reconciliation
```

The verification pipeline must perform:

```text
1. locate payment transaction
2. acquire required DB locks
3. check existing state
4. query/validate with SSLCommerz server-to-server
5. verify transaction ID
6. verify expected amount
7. verify currency
8. verify provider status
9. run risk assessment
10. validate payment state transition
11. update payment transaction
12. update order payment status
13. write necessary history
14. commit atomically
```

Preserve existing pessimistic locking.

Preserve existing idempotency.

---

# Step 4 — Success Callback Should Trigger Verification

Change the current callback behavior.

Current:

```text
success callback
→ redirect
```

Desired:

```text
success callback
→ identify payment safely
→ attempt authoritative backend verification
→ redirect
```

Important:

The callback must NOT directly call:

```text
markPaid()
updatePaymentStatus("PAID")
```

It must call the shared verification service.

Example concept:

```ts
await verifyAndFinalizePayment({
  trigger: "CALLBACK",
  transactionId,
  validationId,
});
```

The verification service then contacts SSLCommerz and determines whether the payment is valid.

---

# Callback Failure Must Not Break UX

If callback verification fails because of:

```text
temporary SSLCommerz outage
timeout
provider response unavailable
database contention
temporary network error
```

do not show a server error page after the customer has already paid.

Instead:

```text
callback
↓
verification attempt fails safely
↓
log failure
↓
leave payment PENDING
↓
redirect order page
↓
show "Confirming payment"
↓
IPN or reconciliation can finish it
```

Use the current error hierarchy such as:

```text
PaymentError
CommittedPaymentError
```

appropriately.

Do not swallow security failures silently.

---

# Step 5 — Use val_id When Available

If SSLCommerz success callback or IPN provides:

```text
val_id
```

use the official server-side validation mechanism currently supported by the gateway integration.

Do not trust the callback's:

```text
status
amount
currency
tran_id
```

as payment truth.

Treat callback/IPN payload fields as input for finding/verifying the payment.

Payment authority must come from server-to-server provider validation.

---

# Step 6 — Preserve Idempotency Across Concurrent Triggers

These events may happen simultaneously:

```text
IPN
success callback
reconciliation
```

Example:

```text
IPN starts
callback starts
reconciliation starts
```

All three may attempt to finalize the same payment.

The result must still be exactly one logical payment transition.

Use the existing:

```text
row locks
payment locks
order locks
state transitions
unique constraints
```

as appropriate.

Required result:

```text
PENDING
  ↓
PAID
```

exactly once.

Other callers should observe:

```text
already PAID
```

and return an idempotent success/no-op.

They must NOT:

```text
deduct stock twice
create duplicate status history
increment promo usage twice
create duplicate transaction records
send duplicate notifications
change totals
restore inventory incorrectly
```

---

# Step 7 — Reconciliation Must Remain the Final Recovery Layer

The callback verification improves UX and recovery speed.

It does NOT replace reconciliation.

Continue using:

```text
reconciliation/payment-reconciliation.service.ts
```

for stale pending payments.

Conceptually:

```text
find stale PENDING payment
↓
query SSLCommerz transaction
↓
provider says successful
↓
shared verification pipeline
↓
PAID
```

Do not implement a separate status mutation path inside reconciliation.

Reuse:

```text
payment-verification.service.ts
payment-risk.service.ts
payment-status.service.ts
```

---

# Step 8 — Verify Transaction Query Recovery

If the existing SSLCommerz integration stores:

```text
sessionkey
tran_id
val_id
```

determine which identifiers can reliably be used for recovery.

Payment reconciliation should be able to recover when:

```text
IPN never arrived
success callback had no usable validation ID
browser disappeared after payment
customer closed the tab
callback request failed
```

Use the existing SSLCommerz transaction query functionality where supported by the integration.

Do not rely exclusively on `val_id` if recovery by stored transaction/session identifiers is already supported.

---

# Step 9 — Review Payment States

Do not overload:

```text
UNPAID
```

if the application already has a more appropriate state representing an online payment awaiting verification.

Inspect current enums first.

A preferred conceptual distinction is:

```text
COD:
UNPAID

Online payment awaiting provider confirmation:
PENDING / PROCESSING

Verified online payment:
PAID

Provider failure:
FAILED

User cancelled:
CANCELLED

Risk anomaly:
REQUIRES_REVIEW
```

Do not introduce new enums unnecessarily.

Use the existing schema and state machine where possible.

The important requirement is that a valid pending online payment is distinguishable from a plain COD unpaid order if the current model supports that distinction.

---

# Step 10 — Keep Browser Polling as UX Only

Current order-page polling:

```text
every 2.5 seconds
for up to 60 seconds
```

may remain.

It should continue to poll authoritative BangBuy state:

```text
GET /api/orders/{id}
```

Do not make the browser call SSLCommerz.

Do not put reconciliation secrets or gateway credentials in the browser.

Polling means:

```text
"Has backend verification completed?"
```

not:

```text
"Verify my payment."
```

---

# Optional Improvement — Safe Customer Verification Trigger

Only implement this if required after inspecting the current architecture.

If payment can remain pending even after callback and IPN failures, consider a safe authenticated endpoint such as:

```text
POST /api/orders/{id}/payment/verify
```

or equivalent.

It must:

```text
authenticate user
verify order ownership
rate limit
locate pending payment
call shared server-side verification
return authoritative status
```

The browser must NOT send:

```text
amount
payment status
trusted gateway result
credentials
```

This endpoint must never allow verification of another customer's order.

Do not add this endpoint if the existing callback + IPN + reconciliation architecture already solves the problem cleanly.

---

# Step 11 — IPN Route Security Review

Ensure:

```text
app/api/payments/sslcommerz/ipn/route.ts
```

does not depend on customer authentication.

SSLCommerz does not have a BangBuy customer session.

Do not require:

```text
Auth.js customer cookie
CSRF token intended for browser forms
same-origin browser Origin
```

for the provider webhook.

Trust is established by:

```text
payload validation
known transaction lookup
server-to-server SSLCommerz verification
amount verification
currency verification
idempotency
database locks
risk checks
```

---

# Step 12 — IPN Parsing

Verify that the route parses the actual request format used by the current SSLCommerz integration.

Do not blindly assume:

```ts
request.json()
```

If the gateway sends form-encoded data.

Parse according to Content-Type and validate with the existing:

```text
validation/payment.schema.ts
```

Reject malformed payloads safely.

---

# Step 13 — Rate Limiting

Do not use normal aggressive customer rate limits for SSLCommerz IPN.

A gateway may send:

```text
retries
multiple notifications
many customers from shared infrastructure
```

Do not create a situation where legitimate payment confirmations get `429`.

Protect IPN primarily through provider verification and idempotency.

Keep abuse protection appropriate to the endpoint.

Customer-triggered payment initiation and verification endpoints should remain rate limited.

---

# Step 14 — Callback Authorization

Callbacks are public gateway entrypoints.

Do not trust callback parameters to authorize access to another customer's order.

When constructing redirects, ensure:

```text
transaction
→ payment
→ order
```

is resolved from trusted database relationships.

Do not accept arbitrary:

```text
orderId
redirect URL
callback URL
userId
```

and use it without validation.

Prevent open redirects.

Redirect only to validated internal BangBuy paths.

---

# Step 15 — Risk Quarantine

Preserve current fraud controls.

Examples:

```text
unexpected risk level
validation ID mismatch
provider transaction mismatch
duplicate successful transaction anomaly
amount mismatch
currency mismatch
invalid payment state
```

should not silently become PAID.

Use:

```text
requiresReview = true
```

or the current equivalent when appropriate.

Do not weaken risk handling simply to make the PROCESSING banner disappear.

Correctness is more important than immediate UI success.

---

# Step 16 — Database Transaction Boundaries

Payment finalization must remain atomic.

Conceptually:

```text
BEGIN

lock payment
lock order

verify current state

update PaymentTransaction
update Order.paymentStatus
write status/history records
perform existing related side effects

COMMIT
```

If something fails before commit:

```text
ROLLBACK
```

Do not allow:

```text
payment transaction = PAID
order = UNPAID
```

or the reverse because separate updates partially succeeded.

Preserve existing `CommittedPaymentError` semantics if it is used to distinguish post-commit failures.

---

# Required Scenarios

The system must correctly handle all of these.

## Scenario 1 — IPN arrives first

```text
payment
↓
IPN
↓
verify
↓
PAID
↓
callback
↓
sees already PAID
↓
redirect
```

Result:

```text
PAID
```

No duplicate mutations.

---

## Scenario 2 — Callback arrives first

```text
payment
↓
success callback
↓
server-side verification
↓
PAID
↓
redirect
```

Later:

```text
IPN
↓
already PAID
↓
idempotent no-op
```

---

## Scenario 3 — Callback verification temporary failure

```text
callback
↓
provider timeout
↓
remain PENDING
↓
redirect order page
```

Later:

```text
IPN
↓
verify
↓
PAID
```

---

## Scenario 4 — Missing IPN

```text
payment successful
↓
callback verification unavailable
↓
PENDING
```

Later:

```text
reconciliation
↓
query SSLCommerz
↓
verify
↓
PAID
```

---

## Scenario 5 — Browser closes after payment

```text
payment successful
↓
browser disappears
```

IPN or reconciliation must still result in:

```text
PAID
```

---

## Scenario 6 — Fake success callback

Attacker requests callback manually.

Result:

```text
server verification fails
↓
NO PAID transition
```

---

## Scenario 7 — Wrong amount

Gateway/provider result does not equal expected stored amount.

Result:

```text
NO automatic PAID
risk/review handling
```

---

## Scenario 8 — Wrong currency

Result:

```text
NO automatic PAID
```

---

## Scenario 9 — Duplicate IPN

```text
IPN
IPN
IPN
```

Result:

```text
one logical PAID transition
```

---

## Scenario 10 — Callback + IPN concurrently

Result:

```text
one wins lock
PAID

other observes PAID
safe no-op
```

---

## Scenario 11 — Reconciliation + IPN concurrently

Same requirement:

```text
exactly one effective mutation
```

---

# Tests

Add or update tests under:

```text
lib/payments/__tests__/
```

At minimum add coverage for:

```text
callback triggers server-side verification
callback does not directly mark payment PAID
valid callback verification can finalize payment
fake callback cannot finalize payment
callback provider timeout leaves PENDING
IPN later finalizes callback-pending payment
duplicate IPN is idempotent
callback + IPN concurrency is safe
reconciliation + IPN concurrency is safe
already PAID callback is safe
amount mismatch cannot finalize
currency mismatch cannot finalize
unknown transaction cannot finalize
risk anomaly is quarantined
missing IPN can be recovered by reconciliation
browser absence does not prevent reconciliation
```

Also add direct tests for:

```text
payment-status.service.ts
payment-transitions.ts
payment-risk.service.ts
```

if those state/risk rules are currently only indirectly tested.

---

# Do Not Break Existing Security

Explicitly preserve:

```text
server-only SSLCommerz credentials
no browser → SSLCommerz API calls
server-authoritative amount calculation
Zod validation
customer authorization
cross-user isolation
rate limiting
SSLCommerz server validation
IPN validation
pessimistic locking
idempotency
payment state machine
risk quarantine
reconciliation authentication
timing-safe token comparison
immutable transaction history
```

---

# Do Not Solve It Like This

Never implement:

```ts
if (callback.status === "VALID") {
  paymentStatus = "PAID";
}
```

Never implement:

```ts
if (searchParams.success === "true") {
  paymentStatus = "PAID";
}
```

Never let browser polling directly change payment status.

Never trust client-provided:

```text
amount
currency
payment status
provider result
transaction ownership
```

Never disable fraud checks to solve the stuck PROCESSING state.

---

# Target Final Flow

```text
CUSTOMER PAYS
      │
      ▼
  SSLCommerz
      │
      ├───────────────────┐
      │                   │
      ▼                   ▼
     IPN             Success Callback
      │                   │
      └─────────┬─────────┘
                ▼
      Shared Payment Verification
                │
                ▼
         SSLCommerz API
                │
                ▼
     Transaction / Amount /
       Currency Verification
                │
                ▼
          Risk Assessment
                │
                ▼
       Database Locks + State
                │
                ▼
              PAID


If neither completes:
                │
                ▼
      Stale Pending Payment
                │
                ▼
          Reconciliation
                │
                ▼
       SSLCommerz Query API
                │
                ▼
      Shared Verification Flow
                │
                ▼
              PAID
```

---

# Verification Commands

After implementation run:

```bash
npm run lint
npx tsc --noEmit
npx vitest run
```

Also run the payment tests separately.

Report the exact results.

Do not claim checks passed unless they were executed successfully.

---

# Final Deliverables

After fixing the issue, provide:

## Root Cause

Explain exactly why payments remained PROCESSING.

Distinguish whether the issue was:

```text
IPN not delivered
IPN blocked
IPN parsing failure
IPN schema rejection
validation API failure
state transition problem
database transaction problem
frontend-only polling limitation
or multiple causes
```

Do not blame sandbox behavior without evidence.

## Files Changed

List each changed file and responsibility.

## Flow Before

Show the old confirmation flow.

## Flow After

Show the new resilient flow.

## Security Confirmation

Explicitly confirm:

```text
callback still cannot directly mark PAID
payment remains server-authoritative
SSLCommerz verification still determines finality
amount/currency/transaction checks remain enforced
duplicate events are idempotent
locking remains intact
risk handling remains intact
reconciliation remains available
credentials remain server-only
```

## Tests

Provide actual:

```text
lint result
TypeScript result
test result
payment test counts
```

## Operational Debugging

Provide a concise list of log events developers should inspect when a payment remains pending.

Example:

```text
CALLBACK_RECEIVED
CALLBACK_VERIFICATION_STARTED
SSL_VALIDATION_RESULT
IPN_RECEIVED
PAYMENT_STATUS_COMMITTED
RECONCILIATION_STARTED
```

---

# Final Requirement

Do not make production reliability depend on SSLCommerz always delivering IPN immediately.

The system must tolerate:

```text
delayed IPN
missing IPN
duplicate IPN
callback arriving first
IPN arriving first
provider timeout
browser closing
out-of-order events
concurrent reconciliation
```

while preserving this fundamental invariant:

```text
Browser callback
!=
proof of payment
```

Trusted payment confirmation must remain:

```text
Known BangBuy payment
+
server-to-server SSLCommerz verification
+
transaction verification
+
server-authoritative amount verification
+
currency verification
+
risk assessment
+
valid state transition
+
idempotent locked database transaction
=
PAID
```
