# Meta Pixel

The existing browser integration supports one or more Pixels through one public
environment variable. No Pixel ID is enabled by the example configuration.

```dotenv
NEXT_PUBLIC_META_PIXEL_IDS=
# Format only: NEXT_PUBLIC_META_PIXEL_IDS=111111111111111,222222222222222
NEXT_PUBLIC_META_PIXEL_TEST_MODE=false
```

Use the actual numeric Pixel IDs as comma-separated strings. Whitespace and empty
entries are ignored, invalid nonnumeric entries are discarded, and duplicates are
removed. A single ID works without a comma. An empty or wholly invalid list is a
safe no-op. The old `NEXT_PUBLIC_META_PIXEL_ID` setting is replaced by the plural
setting; copy an existing ID into the new setting when upgrading. IDs are public;
never put an access token or other secret in either public setting.

Next.js embeds `NEXT_PUBLIC_*` values during the build. Adding/removing IDs or
changing test mode requires a rebuild and redeployment; restarting an old build
does not update its browser configuration. Keep build and runtime configuration
consistent so the server's quote loading and CSP agree with the browser bundle.

## Consent deployment requirement

The current application has no active marketing-consent system to connect.
Tracking therefore defaults to denied on every document: configuring IDs alone
does not load the SDK or send events. Before enabling tracking, connect the
authoritative marketing-consent decision to the exported helper on initial
consent load and every change, including withdrawal:

```ts
import { setMetaPixelConsent } from "@/lib/meta-pixel";

// Call from the consent integration after its authoritative state is known.
setMetaPixelConsent(marketingConsent === "granted");
```

Unknown, denied and withdrawn consent must pass `false`. Restore the decision
on every new document, rather than treating Pixel configuration as consent. No
new consent UI, platform or consent persistence is included. This connection is
an unresolved deployment requirement; do not unconditionally grant consent in
application startup code.

All configured Pixels share the decision. Withdrawal stops this integration's
dispatches and revokes SDK consent when the SDK exists. Consent changes emit the
internal `bangbuy:meta-consent-change` browser event so the current eligible page,
checkout entry and verified purchase can be reconsidered. Earlier cart additions
are not replayed. Previously handed-off events cannot be recalled.

## Shared SDK and events

`components/MetaPixel.tsx` mounts through the existing `DocumentFrame` and follows
completed App Router pathname/query changes. `lib/meta-pixel.ts` asynchronously
loads `https://connect.facebook.net/en_US/fbevents.js` once after consent and
initializes each unique configured ID once per browser document. It uses the
official SDK queue while loading, with no custom retry or delivery service.

Every manual event uses `fbq('trackSingle', pixelId, eventName, parameters)` for
each configured Pixel. No broadcast `track` call is added. Automatic configuration
and history tracking are disabled; initialization does not send another PageView.
There is no noscript tracking image, advanced matching, third-party Pixel package,
Conversions API, backend event table or payment-processing change.

| Event | Trigger | Values |
| --- | --- | --- |
| PageView | Initial eligible page after consent and each completed eligible pathname/query navigation; repeated renders do not repeat it and returning to a prior page counts again | No custom customer data |
| AddToCart | Successful parsed server cart POST, or successful guest cart write at an existing add callsite | Product ID, quantity actually added, USD price/value; capped zero additions, failed writes, hydration, merging and quantity edits do not emit it |
| InitiateCheckout | Existing checkout page entry after authentication and, for full-cart checkout, cart readiness, once per entry; consent grant can enable an entry that was skipped | Current item IDs/quantities and USD cart subtotal when available; selected-cart checkout prices only selected quantities when all active variant prices are ready; Buy Now omits value when pricing is unavailable at entry; delivery/promo/pricing refreshes do not repeat it |
| Purchase | Nonembedded Airwallex return status reports backend `SUCCEEDED` without review, then the existing owner/guest-scoped order API returns `AIRWALLEX`, `PAID`, no payment review | Confirmed USD order total or payment amount, available purchased product IDs and quantities |

The return URL's `orderId` is only a lookup key. Redirects and query parameters
never establish payment success. Existing Airwallex verification, webhooks,
polling and order authorization remain responsible for confirmation. Pending,
failed, cancelled, unpaid and review-required payment states cannot qualify.

The application stores base prices in BDT and chooses display currency by
IP/cookie. Tracking preserves that behavior and uses the existing cached
BDT-to-USD quote and decimal conversion utility. Monetary parameters are numeric
USD major units, never integer cents or a foreign amount relabeled as USD.
Purchase prefers the saved USD order total, then the confirmed USD payment amount.
Other-currency orders use their confirmed base total converted at the quote
available on the return visit; this equivalent can differ from a historical USD
conversion. No rate or value is invented. Events requiring an unavailable USD
conversion are skipped; checkout can still send item information without a value.
For selected-cart checkout, a subtotal is available only when every selected item
and variant matches an active item in the ready cart; otherwise value is omitted.
Later pricing does not resend an entry that was already dispatched.

## URL privacy and duplicate suppression

Only known catalog/policy and shopping paths are eligible. Admin, profile,
authentication and private account/order-detail pages are excluded. Payment
return is an explicit exception under `/orders`; only its opaque CUID lookup is
allowed. Structured catalog filters, product selections and `fbclid` are allowed.
Free-text search, coupon/unknown query parameters, credentials and URL fragments
suppress tracking. An unsafe referrer also suppresses tracking because the SDK
can read it, including a provider return with unsafe parameters. No URL is
rewritten to make it trackable. Not every navigation will produce an event.

Payloads explicitly select product IDs, quantities and money. Customer names,
emails, phone numbers, addresses, notes, payment details and authentication
credentials are excluded. CSP permits the required Meta script/image/connection
origins only when configuration and environment allow tracking, retaining
`Referrer-Policy: no-referrer`.

Purchase checks `bangbuy:meta-purchase:<pixelId>:<orderId>` separately for each
Pixel before dispatch and records the marker after handing the event to the SDK.
The existing key prefix is retained so prior single-Pixel markers still suppress
repeat orders. Missing configuration, denied consent or invalid data do not mark
the order. Storage errors fall back to memory for the current document, so they
do not prevent the other configured Pixels from receiving dispatch attempts.

This is best-effort duplicate suppression, not guaranteed delivery or cross-device
deduplication. Memory markers cannot survive refresh; clearing storage, another
browser/device/origin or simultaneous tabs can repeat a Purchase. A marker means
SDK handoff, not receipt by Meta. A blocked script/network, unavailable quote or
leaving the return page can lose an event. There are no retries, ad-blocker
workarounds, backend recovery or recovery from excluded private order pages.

## Verification

Development, loopback hosts and webdriver browsers are disabled by default.
For deliberate local/browser automation testing only, configure dedicated test
Pixel IDs and set `NEXT_PUBLIC_META_PIXEL_TEST_MODE=true` before rebuilding or
starting the development server. This permits real test-Pixel traffic in those
environments; it does not bypass consent or URL privacy checks. `NODE_ENV=test`
always remains disabled. Keep test mode `false` for normal development and release
builds. Never use production Pixels for deliberate test traffic.

1. Connect the authoritative consent source and use one dedicated test ID, then
   two. Exercise whitespace, duplicates, empty and invalid entries. Expect only
   the unique valid IDs; an empty/invalid configuration must make no Meta request.
2. Install [Meta Pixel Helper](https://www.facebook.com/business/help/198406697184603).
   Expand each configured ID separately and inspect its event count and payload.
   In [Meta Events Manager](https://www.facebook.com/events_manager2/), select each
   Pixel/data source separately and open **Test events** while repeating the same
   storefront action. Confirm all configured IDs receive the same intended event,
   and no unconfigured ID receives this integration's events.
3. Deny consent before loading: expect no Meta script or event. Grant consent on
   an eligible page: expect one initial PageView per Pixel, one script and one
   initialization per ID. Rerender, navigate between catalog pages, change a safe
   query and return to a previous page. Expect one PageView per qualifying visit.
   Withdraw consent: further events must stop. Unknown/sensitive queries and
   admin/profile/login/private-order pages must not send events.
4. Add an item as a guest through handoff confirmation, then as a signed-in user;
   include wishlist/saved-item adds. Expect the newly added quantity and its USD
   value, not accumulated cart quantity. Failed writes, capped zero additions,
   hydration/merging, quantity edits and button clicks alone must emit nothing.
5. Enter full-cart checkout, selected-cart checkout and Buy Now. Expect one
   InitiateCheckout on actual entry after the required readiness, with item data
   and available USD subtotal. Selected-cart value must cover only the selected
   quantities with matching active variant prices; omit it if any price is
   unavailable. Buy Now can omit value at entry. Changing
   delivery, promo or pricing must not repeat it. Leave and reenter to confirm a
   legitimate new entry can emit again. Grant consent while on checkout to check
   an initially skipped entry.
6. Complete an Airwallex sandbox payment and wait for backend confirmation.
   Inspect Purchase separately for each Pixel and compare with paid order data.
   Pending, failed, cancelled, unpaid and review-required payments must emit none,
   including with a crafted return URL. Refresh/revisit the paid order's return
   page: neither Pixel repeats. Seed a guard for only one test Pixel and verify
   the other still receives its own dispatch attempt.
7. Block Meta requests and deny localStorage access separately. Shopping,
   checkout and payment status must continue. Storage failure must still allow
   one Purchase attempt per Pixel in the document; repeat the call in the same
   document and expect memory suppression. Do not expect persistence after refresh.

For every configured Pixel, keep **automatic advanced matching**, **automatic
events/automatic event detection** and any **Event Setup Tool** event rules off in
Events Manager. Remove any separately installed duplicate Pixel or tag-manager
events before release. Those external settings can create additional collection
or duplicates outside this code.

There is no existing test command or active test framework. The repository checks
are `npm run lint`, `npm run typecheck` and `npm run build`. Mocked browser checks
can inspect parsing, queue calls, event timing and guards without contacting Meta;
the implementation report records which checks were actually completed. Delivery
in Helper/Events Manager and an end-to-end paid journey require actual dedicated
Pixel IDs, a connected consent source and a configured Airwallex environment.

Meta's maintained [Pixel browser API example](https://github.com/meta/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl)
shows the queue, per-ID dispatch, consent, `autoConfig` and `disablePushState`
switches used here. This project does not install or use Google Tag Manager.

## Files changed for multiple-Pixel support

- Configuration: `.env.example`, local `.env` (migrate the optional Pixel setting
  without overwriting unrelated values).
- Shared integration: `lib/meta-pixel.ts`, `components/layout/DocumentFrame.tsx`,
  `lib/security/content-security-policy.ts`; the existing
  `components/MetaPixel.tsx` routing component is reused.
- Checkout entry: `app/(private-commerce)/(shop)/checkout/page.tsx`.
- Confirmed payment reevaluation: `lib/airwallex/components/AirwallexPaymentStatus.tsx`.
- Documentation: `docs/meta-pixel.md`, `docs/deployment-blockers.md`,
  `docs/deployment-environment.md`.

Existing server/local cart success callsites continue to use the shared helper;
they do not need a separate integration or a per-Pixel component.
