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

Next.js resolves each setting from inherited `process.env`, then
`.env.production.local`, `.env.local`, `.env.production` and `.env` for a production
build; an earlier value wins, including an empty override. The checked-in
protected-environment launcher supplies values only when starting Next, not when
building. Supply the same plural ID list to the deployment build and protected
runtime environment, preserving every supplied ID. Local `.env` edits alone do
not update production, and the retired singular setting is not read.

## Automatic activation and preferences

`components/CookieConsent.tsx` mounts through the shared `DocumentFrame` and
calls the existing `setMetaPixelConsent(boolean)` helper. On eligible pages,
tracking starts automatically when the readable preference is absent or granted.
A saved rejection keeps all Pixels off. New visitors do not see an initial
acceptance banner. **Cookie settings** in the footer remains available to accept or reject
marketing cookies and links to the privacy policy.

The visitor's `granted` or `denied` choice is stored in localStorage under
`bangbuy:marketing-consent:v1` and restored on every new document. Automatic
activation does not write `granted` or imply an explicit visitor choice. Only
explicit Accept/Reject choices are persisted. Accepting after rejection starts
the current eligible PageView immediately; repeated callbacks or route effects
do not duplicate it. Withdrawal stops future dispatch and applies SDK consent
revocation. Storage changes synchronize same-origin tabs; removing the preference
restores the automatic default.

If preference storage cannot be read, tracking stays off and the choice panel
opens. An explicit choice still applies to the current document if saving fails;
a refresh may ask again. Preferences are local to the browser/origin. Shopping
actions while tracking is off are discarded, not replayed on acceptance.
Previously handed-off events cannot be recalled.

## SDK loading fallback

The shared helper exposes internal `idle`, `loading`, `loaded` and `failed`
resource states. An SDK script error, or 10 seconds without its load event,
shows a nonblocking **Reload page** / **Continue shopping** prompt on eligible
storefront pages. A later successful load hides the prompt. Loaded means the SDK
resource loaded, not that either Pixel's configuration or events reached Meta.

Reload performs a normal page reload; it does not inject a second script into
the current document. Continue dismisses the prompt for the tab's session using
`bangbuy:meta-load-prompt-dismissed:v1` in sessionStorage, with an in-memory
fallback when storage fails. It does not save a rejection or prevent automatic
attempts on subsequent pages. Missing IDs, saved rejection, excluded routes and
development/test guards are intentional skips and do not show this prompt.
There is no blocker bypass, automatic retry or custom event queue.

## Shared SDK and events

`components/MetaPixel.tsx` mounts through the existing `DocumentFrame` and follows
completed App Router pathname/query changes. `lib/meta-pixel.ts` asynchronously
loads `https://connect.facebook.net/en_US/fbevents.js` once when preferences allow and
initializes each unique configured ID once per browser document. It uses the
official SDK queue while loading, with no custom retry or delivery service.

Every manual event uses `fbq('trackSingle', pixelId, eventName, parameters)` for
each configured Pixel. No broadcast `track` call is added. Automatic configuration
and history tracking are disabled; initialization does not send another PageView.
There is no noscript tracking image, advanced matching, third-party Pixel package,
Conversions API, backend event table or payment-processing change.

| Event | Trigger | Values |
| --- | --- | --- |
| PageView | Initial eligible page when preferences allow and each completed eligible pathname/query navigation; repeated renders do not repeat it and returning to a prior page counts again | No custom customer data |
| AddToCart | Successful parsed server cart POST, or successful guest cart write at an existing add callsite | Product ID, quantity actually added, USD price/value; capped zero additions, failed writes, hydration, merging and quantity edits do not emit it |
| InitiateCheckout | Existing checkout page entry after authentication and, for full-cart checkout, cart readiness, once per entry; an entry while tracking is off is not replayed | Current item IDs/quantities and USD cart subtotal when available; selected-cart checkout prices only selected quantities when all active variant prices are ready; Buy Now omits value when pricing is unavailable at entry; delivery/promo/pricing refreshes do not repeat it |
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
environments. This custom application flag only relaxes the local/development/
automation guards; it is not a Meta-provided sandbox and sends real browser
requests. It does not bypass saved rejection or URL privacy checks. `NODE_ENV=test`
always remains disabled. A `false` value allows normal production tracking when
preferences allow on eligible nonlocal, nonautomated pages. Keep test mode `false` for normal development and release
builds. Never use production Pixels for deliberate test traffic.

1. Use one dedicated test ID, then two. Exercise whitespace, duplicates, empty and invalid entries. Expect only
   the unique valid IDs; an empty/invalid configuration must make no Meta request.
2. Install [Meta Pixel Helper](https://www.facebook.com/business/help/198406697184603).
   Expand each configured ID separately and inspect its event count and payload.
   In [Meta Events Manager](https://www.facebook.com/events_manager2/), select each
   Pixel/data source separately and open **Test events** while repeating the same
   storefront action. Confirm all configured IDs receive the same intended event,
   and no unconfigured ID receives this integration's events.
3. Visit with readable storage and no saved choice: expect automatic activation,
   no initial acceptance banner, one PageView per Pixel, one script and one
   initialization per ID. Rerender, navigate between catalog pages, change a safe
   query and return to a previous page. Expect one PageView per qualifying visit.
   Use Cookie settings to reject: further events must stop, including in another
   tab after storage synchronization; refresh must load no SDK. Accept again:
   tracking resumes without replaying earlier shopping actions. Refresh with a
   saved acceptance must restore tracking. Unknown/sensitive queries and
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
   legitimate new entry can emit again. Enter while tracking is rejected and then
   accept: PageView starts immediately, while the earlier checkout entry is not
   replayed. A later checkout entry after consent can emit normally.
6. Complete an Airwallex sandbox payment and wait for backend confirmation.
   Inspect Purchase separately for each Pixel and compare with paid order data.
   Pending, failed, cancelled, unpaid and review-required payments must emit none,
   including with a crafted return URL. Refresh/revisit the paid order's return
   page: neither Pixel repeats. Seed a guard for only one test Pixel and verify
   the other still receives its own dispatch attempt.
7. Block the SDK or delay its load beyond 10 seconds: expect the optional prompt.
   Continue must dismiss it for the tab's session without changing the marketing
   preference; later pages still attempt automatically. Reload must perform a
   normal page reload. A late successful load must hide the prompt. Intentional
   skips must not prompt. Deny sessionStorage access and verify memory dismissal.
8. Deny localStorage reads: expect tracking off and the choice panel, with shopping
   still working. Explicit acceptance must work for the document even if saving
   fails. Purchase storage errors must allow one attempt per Pixel using memory;
   repeated calls in the same document stay suppressed. Refresh persistence is
   unavailable when browser storage fails.

For every configured Pixel, keep **automatic advanced matching**, **automatic
events/automatic event detection** and any **Event Setup Tool** event rules off in
Events Manager. Remove any separately installed duplicate Pixel or tag-manager
events before release. Those external settings can create additional collection
or duplicates outside this code.

There is no existing test command or active test framework. The repository checks
are `npm run lint`, `npm run typecheck` and `npm run build`. Mocked browser checks
can inspect parsing, queue calls, event timing and guards without contacting Meta;
the implementation report records which checks were actually completed. The
earlier local build failed because the developer SSH tunnel on
`127.0.0.1:15432` was unavailable. The production database was healthy, and the
subsequent consent-repair release passed its full production build on the VPS.
This automatic-activation change requires a fresh successful build and deployment;
compilation alone is not a successful build. Delivery
in Helper/Events Manager and an end-to-end paid journey require actual dedicated
Pixel IDs, preferences that allow tracking and a configured
Airwallex environment. Inspect actual script/configuration/event requests and
CSP/extension errors in browser DevTools. A queue entry or mock pass does not
prove that Meta received an event.

Meta's maintained [Pixel browser API example](https://github.com/meta/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl)
shows the queue, per-ID dispatch, consent, `autoConfig` and `disablePushState`
switches used here. This project does not install or use Google Tag Manager.

## Consent repair

On 17 November 2026, the public storefront's served JavaScript contained both
supplied IDs, but the uncalled consent setter allowed its default-false eligibility
check to compile to a constant false. The served CSP already permitted Meta's
required origins. These HTTP asset observations do not establish browser delivery
or Meta receipt. The consent repair was subsequently built and deployed on the
VPS; the automatic-default and loading-prompt changes require a new release.

Changed files:

- `components/CookieConsent.tsx`, `components/layout/DocumentFrame.tsx`: consent UI,
  persistence, restoration and withdrawal.
- `lib/meta-pixel.ts`: resume the current PageView after a real withdrawal and
  later acceptance, while repeated callbacks remain suppressed.
- `app/(private-commerce)/(shop)/checkout/page.tsx`,
  `lib/airwallex/components/AirwallexPaymentStatus.tsx`: discard shopping events
  skipped before consent instead of replaying them on acceptance.
- `.env.example`, `docs/meta-pixel.md`, `docs/deployment-blockers.md`,
  `docs/deployment-environment.md`: configuration and release guidance.

Existing real local Pixel IDs, routing integration, SDK loader, CSP, cart success
callsites, per-Pixel Purchase guards and Airwallex payment processing are preserved.
