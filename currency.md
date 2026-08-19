# Task: Implement Production-Ready IP-Based Multi-Currency Pricing

You are working inside an existing production-oriented Next.js e-commerce application.

Implement a secure and maintainable **multi-currency product pricing system based on the visitor's detected country**.

## Core Requirement

The application's canonical/base currency is:

```ts
BASE_CURRENCY = "BDT";
```

All existing product prices remain stored in **BDT**.

Only the following foreign currencies are supported:

```ts
AUD
EUR
GBP
USD
CNY
```

Including the base currency, the complete currency type is:

```ts
type CurrencyCode =
  | "BDT"
  | "AUD"
  | "EUR"
  | "GBP"
  | "USD"
  | "CNY";
```

The system must automatically detect the visitor's country from their IP/geolocation headers and select the currency according to these rules:

```text
Australia → AUD

Eurozone countries → EUR

United Kingdom → GBP

United States → USD

China → CNY

Bangladesh → BDT

EVERY OTHER COUNTRY → BDT
```

This rule is critical.

Do NOT attempt to convert a visitor into another currency simply because their country has its own currency.

For example:

```text
India → BDT
Canada → BDT
Japan → BDT
Singapore → BDT
Malaysia → BDT
Saudi Arabia → BDT
UAE → BDT
Pakistan → BDT
Nepal → BDT
South Korea → BDT
```

Unless the visitor belongs to one of the explicitly supported geographic groups, show prices in **BDT**.

---

# 1. AUDIT THE EXISTING PROJECT FIRST

Before making changes, inspect the existing project thoroughly.

Identify:

* Next.js version.
* App Router vs Pages Router.
* Prisma schema.
* Existing Product price fields.
* Product variant/SKU price fields.
* Existing money/price utilities.
* Product listing architecture.
* Product detail architecture.
* Cart architecture.
* Checkout architecture.
* Order and OrderItem schema.
* PaymentTransaction schema.
* Payment gateway implementation.
* Discounts/coupons.
* Shipping calculation.
* Tax calculation if present.
* Existing middleware/proxy.
* Existing authentication.
* Existing caching.
* Redis usage if any.
* Cron/scheduled job infrastructure.
* Existing API routes/server actions.
* Customer order pages.
* Admin order pages.

Do not create duplicate infrastructure if equivalent functionality already exists.

Before implementation, briefly summarize:

1. Current product pricing flow.
2. Current cart pricing flow.
3. Current checkout pricing flow.
4. Current payment flow.
5. Files that need modification.
6. Database migration required.
7. Important compatibility/security risks.

Then proceed with implementation.

---

# 2. BASE CURRENCY

BDT is the source of truth.

```ts
export const BASE_CURRENCY = "BDT" as const;
```

Existing prices must remain BDT.

Example:

```text
Product.price = 5000

Meaning:

৳5,000 BDT
```

Do NOT create fields such as:

```text
priceUSD
priceGBP
priceEUR
priceAUD
priceCNY
```

Product prices should not be permanently converted.

Instead:

```text
Canonical BDT Price
       ↓
Current Exchange Rate
       ↓
Visitor Currency
       ↓
Display Price
```

---

# 3. SUPPORTED CURRENCIES

Create one centralized currency configuration.

Use exactly:

```ts
export const SUPPORTED_CURRENCIES = [
  "BDT",
  "AUD",
  "EUR",
  "GBP",
  "USD",
  "CNY",
] as const;
```

Do NOT add:

```text
CAD
JPY
INR
SGD
MYR
AED
SAR
```

or any other currencies unless explicitly requested later.

Create:

```ts
export type CurrencyCode =
  (typeof SUPPORTED_CURRENCIES)[number];
```

Also define centralized metadata.

Example:

```ts
export const CURRENCY_CONFIG = {
  BDT: {
    code: "BDT",
    locale: "bn-BD",
    decimals: 2,
  },

  AUD: {
    code: "AUD",
    locale: "en-AU",
    decimals: 2,
  },

  EUR: {
    code: "EUR",
    locale: "de-DE",
    decimals: 2,
  },

  GBP: {
    code: "GBP",
    locale: "en-GB",
    decimals: 2,
  },

  USD: {
    code: "USD",
    locale: "en-US",
    decimals: 2,
  },

  CNY: {
    code: "CNY",
    locale: "zh-CN",
    decimals: 2,
  },
} satisfies Record<CurrencyCode, ...>;
```

Use `Intl.NumberFormat` for currency formatting.

Do not manually concatenate currency symbols.

---

# 4. COUNTRY → CURRENCY RULES

Create one centralized country-to-currency resolver.

Suggested file:

```text
lib/currency/country-currency.ts
```

Rules:

```text
BD → BDT

AU → AUD

GB → GBP

US → USD

CN → CNY
```

Eurozone countries should resolve to:

```text
EUR
```

Maintain an explicit ISO country-code set for the countries currently using the euro.

Do not assume every European country uses EUR.

For example, do not incorrectly map countries such as Switzerland to EUR simply because they are in Europe.

Use a centralized structure conceptually like:

```ts
const EUROZONE_COUNTRY_CODES = new Set([
  // current ISO 3166-1 alpha-2 Eurozone members
]);
```

Then:

```ts
export function countryToCurrency(
  countryCode?: string | null
): CurrencyCode {
  const country = countryCode?.toUpperCase();

  if (country === "AU") return "AUD";

  if (country === "GB") return "GBP";

  if (country === "US") return "USD";

  if (country === "CN") return "CNY";

  if (country && EUROZONE_COUNTRY_CODES.has(country)) {
    return "EUR";
  }

  return "BDT";
}
```

The fallback MUST always be:

```ts
return "BDT";
```

---

# 5. EXPECTED COUNTRY BEHAVIOR

The implementation must produce behavior similar to:

```text
Visitor: Bangladesh
→ BDT

Visitor: Australia
→ AUD

Visitor: United States
→ USD

Visitor: United Kingdom
→ GBP

Visitor: China
→ CNY

Visitor: Germany
→ EUR

Visitor: France
→ EUR

Visitor: Italy
→ EUR
```

But:

```text
Visitor: India
→ BDT

Visitor: Canada
→ BDT

Visitor: Japan
→ BDT

Visitor: Singapore
→ BDT

Visitor: UAE
→ BDT

Visitor: Saudi Arabia
→ BDT

Visitor: Pakistan
→ BDT

Visitor: Nepal
→ BDT

Visitor: Switzerland
→ BDT

Visitor: South Korea
→ BDT
```

This fallback behavior is intentional.

---

# 6. IP / COUNTRY DETECTION

Detect the visitor's country using the deployment environment's trusted geolocation/CDN/proxy headers.

First inspect the project's deployment architecture.

Do NOT unnecessarily call an external IP geolocation API on every page request.

Prefer infrastructure-provided country headers where available.

Country detection should conceptually work as:

```text
Request
   ↓
Trusted Geo/IP Country Header
   ↓
ISO Country Code
   ↓
countryToCurrency()
   ↓
AUD / EUR / GBP / USD / CNY / BDT
```

Detection must be defensive.

If:

* country is unavailable
* header is missing
* header is malformed
* country is unsupported
* geo detection fails

then:

```text
currency = BDT
```

Never allow geo detection failure to break rendering.

---

# 7. IP ONLY CHOOSES DISPLAY CURRENCY

IP/country detection is only responsible for choosing the visitor's display currency.

Example:

```text
US visitor
     ↓
USD
     ↓
BDT→USD exchange rate
     ↓
Converted product display
```

IP detection itself does NOT provide exchange rates.

These concerns must remain separate:

```text
Country Detection
        ↓
Currency Code

Exchange Rate Provider
        ↓
Conversion Rate
```

---

# 8. EXCHANGE RATE API

Use the configured exchange-rate provider.

Environment variable:

```env
EXCHANGE_RATE_API_KEY=
```

The API key must remain server-side.

Never use:

```env
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=
```

Do not expose exchange-rate credentials to the browser.

Create a provider abstraction.

Suggested:

```text
lib/currency/exchange-rate-provider.ts
```

Conceptually:

```ts
interface ExchangeRateProvider {
  getRates(
    baseCurrency: "BDT"
  ): Promise<ExchangeRateResult>;
}
```

The application should not directly call the third-party provider from random components/routes.

---

# 9. ONLY FETCH REQUIRED FX RATES

The application only requires:

```text
BDT → AUD
BDT → EUR
BDT → GBP
BDT → USD
BDT → CNY
```

And:

```text
BDT → BDT = 1
```

Do not store unnecessary exchange rates for dozens or hundreds of currencies unless the external provider response requires receiving them.

Filter the response before persisting.

---

# 10. API QUOTA PROTECTION

The current exchange-rate API free plan has a limited request quota.

Do NOT request exchange rates:

```text
per visitor
per page view
per product
per cart request
per component
per checkout render
per currency conversion
```

Instead, fetch exchange rates centrally and cache them.

Target refresh interval:

```text
Every 6 hours
```

Approximately:

```text
4 refresh operations/day
~120/month
```

This keeps usage comfortably below a 1,500-request monthly quota.

---

# 11. EXCHANGE RATE DATABASE CACHE

Create or adapt an ExchangeRate Prisma model.

Recommended:

```prisma
model ExchangeRate {
  id           String   @id @default(cuid())

  baseCurrency String
  currency     String
  rate         Decimal  @db.Decimal(20, 10)

  fetchedAt    DateTime

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([baseCurrency, currency])
  @@index([baseCurrency])
}
```

Adapt naming/IDs/timestamps to the existing project conventions.

Expected records:

```text
BDT → BDT = 1
BDT → AUD = ...
BDT → EUR = ...
BDT → GBP = ...
BDT → USD = ...
BDT → CNY = ...
```

Use Prisma Decimal or the project's existing decimal-money implementation.

---

# 12. EXCHANGE RATE REFRESH

Create a central service.

Suggested:

```text
lib/currency/exchange-rate.service.ts
```

Responsibilities:

* Fetch current BDT exchange rates.
* Validate external response.
* Filter to AUD/EUR/GBP/USD/CNY.
* Add BDT rate = 1.
* Reject invalid rates.
* Persist valid rates.
* Preserve existing valid rates on provider failure.
* Record `fetchedAt`.
* Log failures safely.
* Never expose credentials.

Validation:

```text
rate must be numeric
rate must be finite
rate must be > 0
currency must be supported
```

Never save:

```text
0
null
undefined
NaN
Infinity
negative rate
```

---

# 13. FAILURE STRATEGY

External FX API downtime must NOT take down the website.

Use this priority:

```text
1. Fresh cached exchange rate
2. Existing stale cached exchange rate
3. BDT fallback
```

If the provider fails:

```text
Do not delete previous rates.
Do not overwrite rates with zero.
Do not throw errors into product pages.
Do not produce NaN prices.
```

Continue using the most recent valid cached rate.

If there has never been a valid exchange rate for the requested currency:

```text
display BDT
```

---

# # SCHEDULED EXCHANGE-RATE REFRESH — LINUX VPS

The application is currently deployed on a **Linux VPS** and runs as a Next.js application managed by the existing VPS process setup.

Do NOT implement Vercel Cron.

Do NOT add cloud-specific scheduling unless it already exists and is actively used.

Use standard **Linux cron** on the VPS to refresh exchange rates every 6 hours.

## Architecture

```text
Linux Cron
    ↓
Secure Next.js internal API route
    ↓
Exchange-rate provider
    ↓
Validate latest rates
    ↓
Prisma ExchangeRate table
    ↓
Website uses cached rates
```

## Secure Refresh Endpoint

Create an internal route such as:

```text
/api/internal/exchange-rates/refresh
```

Protect it using:

```env
CRON_SECRET=
```

The endpoint must require:

```text
Authorization: Bearer <CRON_SECRET>
```

Return `401 Unauthorized` when the secret is missing or incorrect.

Do not expose the exchange-rate provider API key.

## Linux Cron Configuration

Configure the VPS cron scheduler with:

```bash
crontab -e
```

Add a job that runs every 6 hours:

```cron
0 */6 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_DOMAIN/api/internal/exchange-rates/refresh
```

This should run approximately at:

```text
00:00
18:00
```

according to the VPS timezone.

If the server timezone differs from the desired timezone, document that and either configure the cron timezone explicitly or account for it safely.

## Important Rules

The exchange-rate provider must NOT be called:

* when a user opens the homepage
* when a product card renders
* when a product page loads
* when the cart opens
* when checkout loads
* when a visitor changes pages
* once per customer

Normal website requests must use exchange rates already stored in the database/cache.

## Failure Behavior

If the scheduled API refresh fails:

```text
Do NOT delete old rates.
Do NOT replace rates with zero.
Do NOT break the website.
```

Keep using the most recent valid cached exchange rates.

Fallback priority:

```text
1. Fresh cached rate
2. Last valid stale cached rate
3. BDT
```

## Logging

The refresh route/service should log:

```text
refresh started
refresh succeeded
refresh failed
provider unavailable
stale rates retained
```

Do not log:

```text
EXCHANGE_RATE_API_KEY
CRON_SECRET
payment secrets
```

## Deployment Documentation

After implementation, provide the exact VPS commands required to:

1. Add/update environment variables.
2. Apply the Prisma migration.
3. Build the Next.js application.
4. Restart the existing PM2 process.
5. Add the Linux cron entry.
6. Verify the cron endpoint manually.
7. Verify that exchange rates were written to the database.
8. Verify the cron job is actually executing.

Do not assume Vercel or any other managed hosting platform.


---

# 16. CURRENCY COOKIE

If manual currency override is supported, use a cookie such as:

```text
currency=USD
```

Validate the value against exactly:

```ts
[
  "BDT",
  "AUD",
  "EUR",
  "GBP",
  "USD",
  "CNY",
]
```

If someone sends:

```text
currency=CAD
```

or:

```text
currency=INVALID
```

it must not be accepted.

Fall back to country detection or BDT.

Recommended cookie settings:

```text
path=/
sameSite=lax
secure=true in production
long expiration
```

---

# 17. CENTRAL MONEY CONVERSION

Create a centralized conversion function/service.

Do not calculate FX conversions directly in React components.

Conceptually:

```ts
convertFromBDT({
  amount,
  currency,
  exchangeRate,
});
```

Rules:

```text
BDT → BDT
return original amount

BDT → AUD
amount × AUD rate

BDT → EUR
amount × EUR rate

BDT → GBP
amount × GBP rate

BDT → USD
amount × USD rate

BDT → CNY
amount × CNY rate
```

Use decimal-safe calculations.

Validate:

```ts
rate > 0
```

Do not convert an already converted amount.

---

# 18. MONEY FORMATTING

Create/reuse a single:

```ts
formatMoney()
```

Use:

```ts
Intl.NumberFormat
```

Example:

```ts
new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
}).format(amount);
```

Expected presentations:

```text
BDT → ৳5,000.00
AUD → A$...
EUR → €...
GBP → £...
USD → $...
CNY → CN¥... / ¥...
```

Let `Intl.NumberFormat` handle localization instead of manually constructing currency strings.

---

# 19. CENTRAL PRICING SERVICE

Create or extend a centralized pricing layer.

Suggested structure:

```text
lib/
  currency/
    config.ts
    types.ts
    country-currency.ts
    detect-country.ts
    exchange-rate-provider.ts
    exchange-rate.service.ts
    convert-money.ts
    format-money.ts
    pricing.service.ts
```

Adapt to the existing architecture.

Do not create unnecessary duplicate modules.

A pricing result should conceptually expose:

```ts
{
  baseAmount,
  baseCurrency: "BDT",

  amount,
  currency,

  exchangeRate,
  exchangeRateTimestamp,
}
```

---

# 20. APPLY CURRENCY THROUGHOUT THE CUSTOMER WEBSITE

Audit all places where prices are displayed.

Apply the selected display currency consistently to:

* Homepage product cards
* Product listing pages
* Category pages
* Search results
* Product details
* Product variants/SKUs
* Related products
* Recommended products
* Wishlist
* Recently viewed products
* Cart drawer
* Cart page
* Product subtotal
* Discounts
* Shipping presentation
* Taxes if applicable
* Checkout
* Checkout summary
* Order confirmation
* Customer order history
* Customer order details

Do not miss variation prices.

---

# 21. PRODUCT VARIANTS

If variants have separate prices, they remain stored in BDT.

Example:

```text
Product:
৳5,000

Variant:
৳5,500
```

For a US visitor:

```text
variant BDT price
× BDT→USD rate
→ USD presentation
```

Use the actual selected variant canonical price.

Do not convert the parent price and derive variants incorrectly.

---

# 22. DISCOUNT CALCULATIONS

Keep existing business rules based on canonical BDT values.

Preferred flow:

```text
Product price in BDT
       ↓
Apply discount/coupon in BDT
       ↓
Calculate canonical final price
       ↓
Convert resulting amount
       ↓
Format selected currency
```

Do not convert first and repeatedly round intermediate values.

Percentage discounts should preserve existing behavior.

Fixed discounts stored in BDT remain BDT internally.

---

# 23. CART SECURITY

The cart must not treat converted frontend prices as authoritative.

Cart state should primarily identify:

```text
product
variant
quantity
other selections
```

Server-side pricing should determine the actual canonical amount.

Do not trust:

```text
client price
client exchangeRate
client subtotal
```

---

# 24. CHECKOUT SECURITY

This is critical.

At checkout the server must recalculate everything from canonical database data.

Never trust:

```text
client product price
client converted price
client exchange rate
client subtotal
client discount
client shipping
client tax
client total
```

Server checkout flow:

```text
Load cart
    ↓
Load canonical product/variant BDT prices
    ↓
Validate inventory/selections
    ↓
Apply discounts
    ↓
Calculate shipping
    ↓
Calculate tax if applicable
    ↓
Calculate canonical BDT total
    ↓
Resolve customer's selected currency
    ↓
Load cached exchange rate
    ↓
Convert server-side
    ↓
Currency-specific rounding
    ↓
Create order
    ↓
Send server-calculated amount to payment provider
```

Client values are display-only.

---

# 25. PAYMENT CURRENCY MUST BE VERIFIED

Inspect the existing payment gateway.

Do NOT assume the payment provider can charge:

```text
AUD
EUR
GBP
USD
CNY
BDT
```

Determine the actual supported payment currencies.

Maintain a distinction if necessary:

```ts
DISPLAY_CURRENCIES
```

versus:

```ts
PAYMENT_CURRENCIES
```

Display currencies are exactly:

```ts
[
  "BDT",
  "AUD",
  "EUR",
  "GBP",
  "USD",
  "CNY",
]
```

If the current payment gateway cannot actually charge one of these currencies, do not silently create an incorrect transaction.

Preserve existing:

* idempotency
* payment callbacks
* payment webhooks
* transaction records
* order statuses
* retries
* authentication
* payment-security checks

Do not replace the payment integration unnecessarily.

---

# 26. ORDER EXCHANGE-RATE SNAPSHOT

Historical orders must never change when exchange rates change.

Extend the existing Order model appropriately.

Recommended information:

```prisma
baseCurrency   String
currency       String

baseSubtotal   Decimal
subtotal       Decimal

baseDiscount   Decimal?
discount       Decimal?

baseShipping   Decimal?
shipping       Decimal?

baseTax        Decimal?
tax            Decimal?

baseTotal      Decimal
total          Decimal

exchangeRate   Decimal?
exchangeRateAt DateTime?
```

Adapt field names to the existing schema.

Do not duplicate fields that already exist.

---

# 27. HISTORICAL ORDER DISPLAY

Never perform:

```text
Old BDT order total
× today's FX rate
```

Instead use the order snapshot:

```text
Order.currency
Order.total
Order.exchangeRate
```

The price displayed on an old order should remain the same forever.

---

# 28. ADMIN PANEL

Admin/accounting pricing should continue to use canonical BDT unless there is an existing reason otherwise.

For international orders, it may be useful to show:

```text
Base total:
৳12,500

Customer currency:
USD

Converted/paid total:
$...

Exchange rate:
...

Exchange rate timestamp:
...
```

Do not make admin accounting dependent on an IP-detected display currency.

---

# 29. SSR AND HYDRATION

Currency detection should work correctly with server-rendered Next.js pages.

Avoid:

```text
Server:
৳5,000

Browser hydration:
$41.00
```

causing visible flashes or hydration mismatches where reasonably avoidable.

Resolve the country/currency server-side as early as the existing architecture allows.

Be especially careful with:

* Server Components
* cookies
* request headers
* static caching
* dynamic rendering

---

# 30. NEXT.JS CACHE SAFETY

Do not accidentally cache a US visitor's USD-rendered HTML and serve it to someone in Bangladesh.

Audit:

```text
Route Cache
Data Cache
fetch cache
CDN cache
Server Components
revalidate
static generation
```

Currency-sensitive output must not leak between visitors.

Canonical product data may remain cacheable independently where appropriate.

---

# 31. PERFORMANCE

Do NOT query the exchange-rate table individually for every product.

Bad:

```text
24 products
→ 24 ExchangeRate queries
```

Instead:

```text
Resolve user's currency once
        ↓
Load corresponding rate once
        ↓
Convert all visible products
```

Avoid N+1 queries.

Use request-scoped memoization/caching where appropriate.

---

# 32. PRISMA MIGRATION

Create the necessary migration safely.

Do not perform destructive production resets.

Never casually run:

```bash
prisma migrate reset
```

Use the project's proper development/production migration workflow.

Existing products and orders must remain valid.

---

# 33. ENVIRONMENT VARIABLES

Document environment variables in the existing `.env.example` or equivalent.

Example:

```env
BASE_CURRENCY=BDT

EXCHANGE_RATE_API_KEY=

EXCHANGE_RATE_REFRESH_HOURS=6

CRON_SECRET=
```

Never commit actual secrets.

---

# 34. TESTING

Use the project's existing test framework.

Do not introduce another framework unnecessarily.

Add tests for:

## Country mapping

```text
BD → BDT

AU → AUD

US → USD

GB → GBP

CN → CNY

Germany → EUR

France → EUR

Italy → EUR

India → BDT

Canada → BDT

Japan → BDT

Singapore → BDT

UAE → BDT

unknown country → BDT

missing country → BDT
```

## Currency validation

Accept:

```text
BDT
AUD
EUR
GBP
USD
CNY
```

Reject:

```text
CAD
JPY
INR
AED
SAR
invalid strings
```

## Conversion

Test:

```text
BDT → BDT
BDT → AUD
BDT → EUR
BDT → GBP
BDT → USD
BDT → CNY
zero amount
large amounts
invalid rates
```

## Exchange-rate cache

Test:

```text
fresh cache
stale cache
API failure
invalid API response
fallback to stale rate
fallback to BDT
```

## Checkout security

Verify that modifying frontend:

```text
price
exchange rate
subtotal
discount
shipping
total
```

cannot change the authoritative server-calculated payment amount.

## Historical orders

Verify changing current exchange rates does not modify existing order totals.

---

# 35. SECURITY REVIEW

After implementation inspect for:

* Product price tampering
* Exchange-rate tampering
* Unsupported currency injection
* Client-controlled totals
* Public cron abuse
* Exposed API keys
* Cache poisoning
* Currency mismatch
* Double currency conversion
* Incorrect decimal arithmetic
* Incorrect payment minor units
* Payment idempotency regressions

Fix issues found.

---

# 36. EXPECTED END-TO-END BEHAVIOR

### Bangladesh visitor

```text
IP country = BD

Currency = BDT

Product database:
5000 BDT

Display:
৳5,000
```

### United States visitor

```text
IP country = US

Currency = USD

Product database:
5000 BDT

Exchange rate:
BDT → USD

Display:
$convertedAmount
```

### Australia visitor

```text
IP country = AU

Currency = AUD

Display:
A$convertedAmount
```

### United Kingdom visitor

```text
IP country = GB

Currency = GBP

Display:
£convertedAmount
```

### China visitor

```text
IP country = CN

Currency = CNY

Display:
¥convertedAmount
```

### Germany visitor

```text
IP country = DE

DE is Eurozone
→ EUR

Display:
€convertedAmount
```

### India visitor

```text
IP country = IN

IN is NOT configured

→ BDT

Display:
৳5,000
```

### Canada visitor

```text
IP country = CA

CAD is NOT supported

→ BDT

Display:
৳5,000
```

This is the required behavior.

---

# 37. ROUNDING

All business calculations should remain based on BDT.

Preferred sequence:

```text
Canonical product BDT price
       ↓
Discount/business logic
       ↓
Canonical BDT final amount
       ↓
Exchange-rate conversion
       ↓
Target currency rounding
       ↓
Customer display/payment amount
```

Do not repeatedly convert and round intermediate amounts.

Use decimal-safe arithmetic.

---

# 38. IMPLEMENTATION PRINCIPLES

Follow these rules:

* BDT remains canonical.
* Only AUD/EUR/GBP/USD/CNY are foreign currencies.
* Every unsupported country falls back to BDT.
* Do not automatically support a country's local currency unless listed.
* Use ISO currency codes internally.
* Use ISO country codes for geolocation.
* Keep FX API server-only.
* Cache FX rates.
* Refresh rates every 6 hours.
* Avoid unnecessary API requests.
* Never trust client prices.
* Use Decimal-safe financial calculations.
* Preserve current payment logic.
* Preserve existing cart behavior.
* Preserve existing discounts.
* Preserve existing checkout functionality.
* Avoid unrelated refactoring.
* Avoid unnecessary dependencies.
* Avoid duplicated conversion functions.
* Avoid duplicated country mappings.

---

# 39. VALIDATION AFTER IMPLEMENTATION

Run:

```text
Prisma schema validation
Prisma migration validation
TypeScript typecheck
ESLint
existing automated tests
new currency tests
production build
```

Fix errors introduced by this feature.

Do not hide errors with:

```text
@ts-ignore
unnecessary any
disabled lint rules
unsafe casting
```

unless specifically justified.

---

# 40. FINAL REPORT

After completing implementation provide:

## Existing Architecture

Briefly explain the pricing/payment architecture you found.

## New Currency Architecture

Show:

```text
Visitor IP
    ↓
Country
    ↓
Country-to-currency mapping
    ↓
AUD / EUR / GBP / USD / CNY
or
BDT fallback
    ↓
Cached BDT exchange rate
    ↓
Pricing service
    ↓
Customer display
    ↓
Server checkout recalculation
    ↓
Order FX snapshot
```

## Files Changed

List every created/modified file.

## Database Changes

Explain Prisma fields/models/migrations.

## Country Mapping

List exactly which countries/groups resolve to:

```text
AUD
EUR
GBP
USD
CNY
BDT
```

## Exchange Rate System

Explain:

* provider integration
* cache
* six-hour refresh
* API quota protection
* stale-rate fallback

## Checkout Security

Explain how frontend manipulation is prevented.

## Payment Currency Compatibility

State exactly which currencies the existing payment gateway supports for actual transactions.

Do not assume.

## Tests

List tests added and their results.

## Environment Variables

List variables that must be configured.

## Deployment Steps

Provide exact deployment steps for:

```text
environment variables
Prisma migration
cron configuration
build
application restart/redeploy
```

## Remaining Risks

Report anything that could not safely be completed.

---

# CRITICAL ACCEPTANCE CRITERIA

Do not consider the task complete until:

```text
✓ Base product prices remain BDT

✓ Only BDT/AUD/EUR/GBP/USD/CNY exist in this feature

✓ Australia automatically receives AUD

✓ Eurozone visitors automatically receive EUR

✓ UK visitors automatically receive GBP

✓ US visitors automatically receive USD

✓ China visitors automatically receive CNY

✓ Bangladesh receives BDT

✓ ALL OTHER COUNTRIES receive BDT

✓ IP detection failure falls back to BDT

✓ Exchange rates are fetched automatically

✓ Exchange rates are cached

✓ API is NOT called per visitor/page/product

✓ FX refresh runs approximately every 6 hours

✓ Product prices convert correctly

✓ Variant prices convert correctly

✓ Cart prices convert correctly

✓ Discounts remain correct

✓ Checkout recalculates server-side

✓ Client prices cannot manipulate checkout

✓ Orders snapshot currency and exchange rate

✓ Historical order totals never change

✓ Payment gateway currency support is verified

✓ Existing payment functionality remains intact

✓ API failure does not break the store

✓ Existing tests pass

✓ New currency tests pass

✓ Production build passes
```

Implement this as a financial/pricing infrastructure feature, not simply as a frontend currency-symbol switch.
