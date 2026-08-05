

Act as a senior payment-system architect and senior Next.js engineer.
Implement a secure, production-ready Airwallex Hosted Payment Page integration in my existing BangBuy e-commerce project.

Server-only service modules
Server-authoritative checkout calculations
Existing Order and PaymentTransaction-related database models
Existing shared authentication, validation, API response and error-handling utilities
The current checkout supports Cash on Delivery. Airwallex must be added as an online payment option without breaking COD.
Before writing code, inspect the current repository and reuse its existing architecture, naming conventions, response helpers, authentication guards, Prisma client, order service, checkout service, logging system and error classes.
Do not invent duplicate infrastructure when the project already provides an equivalent utility.

Primary integration method
Use Airwallex Hosted Payment Page.
The required flow is:
An authenticated customer creates or selects an unpaid order.
The BangBuy server recalculates and validates the authoritative order amount.
The server authenticates with Airwallex.
The server creates an Airwallex PaymentIntent.
The browser receives only the PaymentIntent ID, PaymentIntent client secret, currency and safe checkout configuration.
Airwallex.js redirects the customer to the Hosted Payment Page.
The browser returns to the BangBuy order page after completing the hosted flow.
The browser return must not mark the order as paid.
A verified Airwallex webhook or secure server-to-server reconciliation confirms the final payment state.
The order page reads payment status from BangBuy’s database.
Use the current official Airwallex API and Airwallex.js documentation. Do not rely on deprecated examples.

Strict folder requirement
Place every Airwallex implementation file inside:
src/modules/airwallex/

Use a structure similar to:
lib/airwallex/
├── index.ts
├── config/
│   ├── airwallex.config.ts
│   └── airwallex.env.ts
├── constants/
│   └── airwallex.constants.ts
├── types/
│   ├── airwallex.types.ts
│   └── airwallex-webhook.types.ts
├── schemas/
│   ├── airwallex.schemas.ts
│   └── airwallex-webhook.schemas.ts
├── client/
│   ├── airwallex-http.client.ts
│   └── airwallex-token.service.ts
├── services/
│   ├── airwallex-payment-intent.service.ts
│   ├── airwallex-payment-initiation.service.ts
│   ├── airwallex-payment-status.service.ts
│   ├── airwallex-payment-verification.service.ts
│   ├── airwallex-payment-event.service.ts
│   ├── airwallex-reconciliation.service.ts
│   └── airwallex-risk.service.ts
├── security/
│   ├── airwallex-webhook-signature.ts
│   ├── airwallex-idempotency.ts
│   ├── airwallex-origin-validation.ts
│   └── airwallex-redaction.ts
├── repositories/
│   └── airwallex-payment.repository.ts
├── handlers/
│   ├── initiate-payment.handler.ts
│   ├── webhook.handler.ts
│   ├── payment-status.handler.ts
│   └── reconcile.handler.ts
├── components/
│   ├── AirwallexPayButton.tsx
│   └── AirwallexPaymentStatus.tsx
├── errors/
│   └── airwallex.errors.ts
├── tests/
   ├── airwallex-signature.test.ts
   ├── airwallex-initiation.test.ts
   ├── airwallex-webhook.test.ts
   ├── airwallex-idempotency.test.ts
   └── airwallex-reconciliation.test.ts



Do not put Airwallex business logic in:
Checkout page components
Generic API Route Handler files
Prisma seed files
Global utility folders
Redux slices
Unrelated payment provider folders
The only Airwallex-related files allowed outside the module are unavoidable integration points.
Thin Next.js route adapters
Create thin Route Handler adapters such as:
app/api/payments/airwallex/initiate/route.ts
app/api/payments/airwallex/webhook/route.ts
app/api/payments/airwallex/status/[orderId]/route.ts
app/api/payments/airwallex/reconcile/route.ts

Each route file must only import and re-export the corresponding handler:
export { POST } from "@/lib/airwallex/handlers/initiate-payment.handler";

Do not place validation, database operations, authentication logic or Airwallex API calls inside these route adapters.
Environment variables
Add the following variables to .env.example with safe placeholder values:
add comment which one for production and which one is for development
# Airwallex feature
AIRWALLEX_ENABLED=false
AIRWALLEX_ENV=sandbox

# Airwallex server credentials
AIRWALLEX_CLIENT_ID=
AIRWALLEX_API_KEY=
AIRWALLEX_WEBHOOK_SECRET=

# API configuration
AIRWALLEX_SANDBOX_API_BASE_URL=https://api.sandbox.airwallex.com
AIRWALLEX_PRODUCTION_API_BASE_URL=https://api.airwallex.com
AIRWALLEX_HTTP_TIMEOUT_MS=10000

# Security configuration
AIRWALLEX_WEBHOOK_TOLERANCE_SECONDS=300
AIRWALLEX_RECONCILIATION_SECRET=

# Application URLs
AIRWALLEX_RETURN_URL=https://dev.bangbuy.net/orders/payment-return

Do not expose these values with NEXT_PUBLIC_:
Client ID
API key
Access token
Webhook secret
Reconciliation secret
The Airwallex.js environment selector may be returned to the frontend as a safe value such as demo or prod. Do not expose any server credential.
Create a Zod-based environment schema that:
Validates all required variables
Validates URLs
Validates allowed environments
Converts numeric variables safely
Fails fast in production when Airwallex is enabled but credentials are missing
Allows Airwallex to remain disabled in local development
Never logs secret values
Keeps configuration in a server-only module
Database design
Inspect the current Prisma schema before modifying it.
Prefer extending or reusing the existing payment models when their semantics are compatible. Do not create duplicate models simply because a model name differs.
The database must support at least:
Payment attempt
Store:
Internal ID
Order ID
User ID where appropriate
Provider set to AIRWALLEX
Airwallex PaymentIntent ID
Airwallex request ID
Amount
Currency
Internal payment status
Provider status
Failure code
Safe failure message
Requires-review flag
Created time
Updated time
Confirmed time
Version or concurrency field when useful
Enforce uniqueness for:
Airwallex PaymentIntent ID
Airwallex request ID
Immutable provider event
Store:
Internal event record ID
Airwallex event ID
Event name
PaymentIntent ID
Account ID where provided
API version
Received timestamp
Processing status
Processing attempts
Sanitized payload
Processed timestamp
Processing error without secrets
The Airwallex event ID must be unique so webhook retries cannot process the same event twice.
Create an additive Prisma migration. Never reset the database.
Payment states
Create an explicit internal payment state machine.
Support states equivalent to:
CREATED
REQUIRES_PAYMENT_METHOD
PENDING
PENDING_REVIEW
PROCESSING
SUCCEEDED
FAILED
CANCELLED
REFUNDED
REQUIRES_REVIEW

Map Airwallex statuses into internal statuses in one centralized function.
Do not allow arbitrary state changes.
Protect against:
A failed event arriving after success
Duplicate success events
Out-of-order events
Multiple browser payment attempts
Two webhooks processing concurrently
Reconciliation and webhook processing at the same time
An already-paid order being paid again
Updating a cancelled order without an approved business rule
A successful payment must be monotonic. A later non-final or failed event must not downgrade a confirmed successful payment.
Airwallex API client
Implement a dedicated server-only HTTP client.
Requirements:
Use the official sandbox and production endpoints
Add an explicit timeout with AbortSignal.timeout
Use cache: "no-store"
Set required headers
Parse JSON defensively
Handle non-JSON error responses
Convert provider errors into safe internal errors
Never return secrets in error messages
Never log full request headers
Never log access tokens
Never log API keys
Never log PaymentIntent client secrets
Add structured logs containing only safe identifiers
Do not automatically retry unsafe operations
Retry only operations proven idempotent
Use bounded retry counts with exponential backoff and jitter
Access-token service
Authenticate to Airwallex only from the backend.
Implement an access-token cache that:
Stores the token only in server memory or an approved server-side cache
Uses the Airwallex expiry timestamp
Refreshes before expiry
Prevents multiple simultaneous token refresh requests
Never stores the access token in Prisma
Never sends the access token to the browser
Clears or refreshes the token after authentication failures
Works safely in multi-instance deployments, or clearly documents the per-instance cache behavior
Use a promise lock or equivalent mechanism to prevent a token-refresh stampede.
Payment initiation
Create an authenticated payment-initiation handler.
Input:
{
  "orderId": "internal-order-id"
}

Do not accept these values as authoritative browser input:
Amount
Currency
Product price
Discount
Delivery fee
Tax
Payment status
User ID
The server must:
Authenticate the customer.
Validate request content type and body with Zod.
Perform same-origin or CSRF protection using the project’s existing approach.
Load the order with owner scoping.
Reject unauthorized access.
Reject already-paid orders.
Reject invalid order statuses.
Recalculate product prices, inventory, promotions, tax and delivery fees using the existing checkout service.
Use Prisma Decimal-compatible handling.
Determine currency from trusted server data.
Create and persist a unique request ID.
Make PaymentIntent creation idempotent.
Reuse a valid existing PaymentIntent when appropriate.
Create a new attempt when the previous attempt is terminal or unusable.
Save the provider PaymentIntent ID and safe status.
Return only safe browser fields.
The client response may contain:
{
  "intentId": "Airwallex PaymentIntent ID",
  "clientSecret": "PaymentIntent client secret",
  "currency": "USD",
  "environment": "demo",
  "successUrl": "trusted same-origin HTTPS URL"
}

Do not persist the PaymentIntent client secret unless absolutely necessary.
When persistence is required, encrypt it using an application encryption mechanism and document why it is needed. Prefer not to persist it.
Do not include the client secret in logs, analytics, error monitoring or browser storage.
Hosted Payment Page frontend
Use the current official Airwallex.js package or SDK.
Create an isolated client component inside the Airwallex module.
The component must:
Call the BangBuy initiation endpoint
Show loading state
Prevent repeated clicks
Handle initiation errors safely
Initialize the correct Airwallex.js environment
Redirect using Hosted Payment Page
Use the server-provided PaymentIntent ID
Use the server-provided client secret
Use an HTTPS same-origin success URL
Avoid storing the client secret in localStorage or sessionStorage
Avoid putting the client secret in the URL
Avoid printing provider responses to the console
Support keyboard navigation
Provide an accessible loading announcement
Restore the button state after recoverable errors
Do not collect raw card details inside BangBuy.
Do not use custom card input fields.
Return-page behavior
The Airwallex success or return URL is only a browser navigation signal.
The return page must:
Never mark the order as paid
Never trust query parameters as confirmation
Display “Confirming your payment”
Poll BangBuy’s payment-status endpoint
Stop polling after a bounded period
Stop when a terminal status is reached
Provide a manual refresh button
Display pending-review states clearly
Display safe failure information
Link back to the order details page
The return URL must be generated from a trusted configured origin.
Reject:
External return URLs
Protocol-relative URLs
javascript: URLs
Untrusted query-provided callbacks
Non-HTTPS production URLs
Webhook security
Implement the webhook using the exact raw request body.
Required verification sequence:
Read the raw body using request.text().
Read x-timestamp.
Read x-signature.
Reject missing headers.
Concatenate the exact timestamp string followed by the untouched raw body.
Calculate HMAC-SHA256 with the webhook secret.
Decode signatures safely.
Check equal buffer lengths.
Compare with crypto.timingSafeEqual.
Validate timestamp freshness using the configured tolerance.
Verify before parsing JSON.
Parse JSON only after verification succeeds.
Validate the event payload with Zod.
Reject malformed payloads without leaking details.
Do not use a parsed and re-serialized JSON object for signature verification.
IP allowlisting may be implemented as defense in depth, but it must never replace signature verification.
Durable webhook ingestion
Design webhook processing in two stages.
Stage one: ingestion
The webhook handler should:
Verify the signature
Validate the event envelope
Insert the event into the database using the unique Airwallex event ID
Treat duplicate event insertion as successful
Return HTTP 200 quickly after durable persistence
Avoid slow provider API calls before acknowledgment
Avoid long-running business operations before acknowledgment
Stage two: processing
Process persisted events through a durable worker, database-backed processor, scheduled endpoint or existing job infrastructure.
The processor must:
Claim pending events atomically
Prevent two workers from processing the same event
Use bounded retries
Record processing attempts
Record safe errors
Mark successful events as processed
Move repeatedly failing events into a review state
Be safe to execute multiple times
Handle events arriving out of order
When the project has no background queue, implement a database-backed event processor that can be invoked safely after ingestion and through the reconciliation route. Do not pretend an unreliable fire-and-forget promise is a durable background job.
Payment confirmation
Before marking an order paid, verify:
The PaymentIntent exists internally
It belongs to the expected order
The merchant order ID matches
The amount matches the authoritative internal amount
The currency matches
The provider status represents success
The payment has not already been consumed by another order
The order is eligible for payment
The event is authentic and not a replay
Use a Prisma transaction.
Use row-level locking or the repository’s existing payment/order locking utilities.
Inside the transaction:
Lock the payment attempt.
Lock the order.
Re-read current states.
Verify amount and currency.
Apply the legal payment transition.
Update the order payment status.
Append an immutable internal payment event.
Record confirmation timestamp.
Mark the provider event processed.
Commit atomically.
Do not dispatch irreversible side effects such as fulfillment or customer notification before the transaction commits.
Use an outbox or post-commit mechanism for those side effects.
Amount and currency security
Never compare money with JavaScript binary floating-point arithmetic.
Use:
Prisma Decimal
Decimal-safe string normalization
Currency-aware minor-unit handling where needed
Create one shared function for provider amount comparison.
When amount, currency or order identifiers do not match:
Do not mark the order paid
Set requiresReview = true
Save a safe mismatch reason
Produce a security log with safe identifiers
Keep fulfillment blocked
Reconciliation
Create a protected reconciliation handler.
It must:
Require a strong server-side reconciliation secret or existing protected scheduled-job authentication
Use constant-time secret comparison
Reject browser access
Query unresolved Airwallex payment attempts
Retrieve the latest PaymentIntent status from Airwallex
Pass results through the same centralized state-transition service used by webhooks
Process records in bounded batches
Avoid unbounded scans
Use timeouts
Be idempotent
Record reconciliation timestamps and results
Quarantine mismatches
Never create a separate payment-confirmation implementation
The reconciliation service and webhook processor must share the same verification and state-transition code.
Payment-status API
Create an owner-scoped status endpoint.
It must:
Require authentication
Verify the order belongs to the customer
Use current database authorization
Return private no-store responses
Expose only safe fields
Never return provider secrets
Never return complete webhook payloads
Example safe response:
{
  "success": true,
  "data": {
    "orderId": "order-id",
    "paymentStatus": "PENDING",
    "provider": "AIRWALLEX",
    "requiresReview": false,
    "updatedAt": "ISO date"
  }
}

Rate limiting and abuse protection
Apply rate limiting to:
Payment initiation
Payment-status polling
Reconciliation
Any manual retry operation
Rate limits should consider:
Authenticated user ID
Order ID
Trusted client IP where appropriate
Do not rate-limit the webhook in a way that causes valid Airwallex retries to be incorrectly rejected.
Use signature verification, event uniqueness and bounded processing to protect the webhook.
Logging and data protection
Create a redaction utility.
Never log:
API key
Client ID when considered sensitive by policy
Access token
Webhook secret
PaymentIntent client secret
Raw card information
Full billing address
Full webhook payload
Customer personal information unless specifically approved
Safe logging fields include:
Internal order ID
Internal payment-attempt ID
Airwallex PaymentIntent ID
Airwallex event ID
Event name
Safe status transition
Processing duration
Sanitized error code
Requires-review flag
Do not expose internal provider errors directly to customers.
Error handling
Create typed errors such as:
AirwallexConfigurationError
AirwallexAuthenticationError
AirwallexApiError
AirwallexTimeoutError
AirwallexValidationError
AirwallexSignatureError
AirwallexReplayError
AirwallexAmountMismatchError
AirwallexCurrencyMismatchError
AirwallexStateTransitionError
AirwallexPaymentAlreadyProcessedError

Map them to stable safe API responses.
Do not leak:
Provider response bodies containing sensitive data
Environment values
Stack traces
Database details
Secrets
Internal fraud rules
Tests
Add comprehensive Vitest tests.
At minimum, test:
Environment
Airwallex disabled without credentials
Airwallex enabled with missing credentials
Invalid environment value
Invalid URL
Invalid timeout value
Authentication client
Successful access-token creation
Token reuse before expiry
Refresh before expiry
Concurrent refresh deduplication
Authentication failure
Timeout
No secret logging
Payment initiation
Unauthenticated customer
Customer does not own order
Already-paid order
Invalid order status
Browser-submitted amount is ignored
Server-authoritative total is used
Duplicate initiation is idempotent
Existing valid PaymentIntent is reused
Provider failure does not incorrectly update the order
Timeout handling
Client secret is not logged
Webhook signature
Valid signature
Invalid signature
Missing signature
Missing timestamp
Expired timestamp
Future timestamp outside tolerance
Modified payload
Wrong concatenation order
Unequal signature lengths
Parsed and re-serialized payload mismatch
Webhook processing
Duplicate event
Successful payment
Failed payment
Pending payment
Pending-review payment
Unknown
