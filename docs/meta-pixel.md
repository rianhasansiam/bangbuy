# Meta Pixel

Set `NEXT_PUBLIC_META_PIXEL_ID` to your numeric Pixel ID before a production
build, then rebuild/redeploy. The empty placeholder in `.env.example` and local
`.env` disables tracking. The ID is public; do not put a token or secret here.
Development, tests (`NODE_ENV=test`), localhost and webdriver browsers do not
send events. No dependency, CAPI, backend event store or payment change is added.

`components/MetaPixel.tsx` mounts once per document through the existing shared
`DocumentFrame`. `lib/meta-pixel.ts` loads Meta's official
`https://connect.facebook.net/en_US/fbevents.js` once and queues manual events.
Automatic configuration and history tracking are disabled so the App Router
effect owns the initial PageView and subsequent pathname/query navigations.
There is no separate bootstrap PageView or noscript tracking image.

| Event | Trigger | Values |
| --- | --- | --- |
| PageView | Initial eligible page and subsequent App Router navigation; repeated effects for the same URL are ignored | No custom customer data |
| AddToCart | Successful parsed server cart POST, or successful guest cart write at an add callsite | Product ID, quantity actually added, USD price/value; no event for capped zero additions, hydration or cart merging |
| InitiateCheckout | First successful nonempty checkout preview after the customer selects a delivery area | Priced product IDs/quantities and USD total; promo, delivery and auth refreshes do not repeat a sent event |
| Purchase | Non-embedded Airwallex return status reports backend `SUCCEEDED` without review, then the existing owner/guest-scoped order API returns `AIRWALLEX`, `PAID`, no payment review | Confirmed order total in USD, available product IDs and quantities |

The return URL's `orderId` is only a lookup key. Redirects and query parameters
never establish payment success. The existing Airwallex verification, webhook,
polling and order authorization logic remain responsible for confirmation.

The application actually stores base prices in BDT and chooses display currency
by IP/cookie. Tracking preserves this behavior. For USD events it reuses the
existing cached BDT-to-USD quote and decimal conversion utility. Cart values
come from base prices; checkout uses its USD snapshot when available, otherwise
its server-priced base total. Purchase prefers the saved USD order total, then
the confirmed USD payment amount. For orders in another payment/display
currency, it converts the confirmed base order total using the quote available
on the return visit; this USD equivalent may differ from a historical USD
conversion. No exchange rate is invented: if the quote is unavailable, events
needing conversion are skipped. PageView and purchases with saved USD amounts
can still work.

Only known catalog/policy and shopping paths are eligible. Admin, profile,
authentication and account/order-detail pages are excluded. The payment return
page is an explicit exception under `/orders`; its opaque CUID order lookup is
allowed. Structured catalog filters, product selections and `fbclid` are allowed;
free-text search, coupon/unknown query parameters and URL fragments suppress
tracking. An unsafe referrer also suppresses tracking because Pixel can read it.
No URL is rewritten to make it trackable. As a result, not every navigation
produces an event. CSP permits only the required Meta script/image/connection
origins when a production Pixel ID is configured, retaining `no-referrer`.

Payloads explicitly select product IDs, quantities and money. Customer names,
contacts, addresses, notes, authentication and payment credentials are never
included. No advanced matching is configured. Keep automatic advanced matching,
automatic events and Event Setup Tool rules disabled in Meta Events Manager to
avoid extra collection/events outside this code. The current source has no
active marketing/cookie-consent handler to reuse; no new consent UI or previous
tracking subsystem is introduced. If consent handling is added, gate script
initialization and every event through that same consent decision.

Purchase uses a persistent localStorage key containing the Pixel and order IDs.
Refreshes and revisits in the same browser/origin skip previously queued orders.
If storage is unavailable, Purchase is skipped. This is best-effort browser
protection: clearing storage, another browser/device/origin, or simultaneous tabs
can repeat an event. A blocked script/network or leaving the return page can
lose an event; a stored marker means queued, not acknowledged by Meta. Purchases
are intentionally not recovered from excluded account/order-detail pages.

## Verification

1. Use a dedicated test Pixel on an HTTPS production build with the ID configured
   at build and runtime. An ordinary browser is needed; development, localhost
   and webdriver are deliberately disabled. Keep automatic matching/events off.
2. Install [Meta Pixel Helper](https://www.facebook.com/business/help/198406697184603)
   and open the Pixel's **Test events** view in
   [Meta Events Manager](https://www.facebook.com/events_manager2/).
3. Open a clean catalog URL, follow catalog links, then navigate cart/checkout.
   Expect one PageView per eligible visit/navigation, including safe query changes.
   Visit profile/admin/login or a URL with `email=`, `search=` or an unknown
   parameter: no event should be sent. Check network requests as well as Helper.
4. Add an item as a guest through the handoff confirmation, then as a signed-in
   user; test wishlist/saved-item adds. Expect the newly added quantity, not the
   accumulated cart quantity. Failed additions, public handoff clicks alone and
   storage/cart hydration must not emit AddToCart.
5. Open checkout and select a delivery area to produce its priced preview.
   Expect one InitiateCheckout. Change delivery, promo or refresh pricing without
   leaving checkout; no second event should appear. All monetary events must say
   `USD`, including when the site displays another currency.
6. Complete an Airwallex test payment in a configured sandbox flow and wait on
   the return page for backend confirmation. Verify Purchase uses the API's paid
   order/confirmed USD amount. Pending, failed, cancelled or review-required
   payments must not emit Purchase, even with a crafted return URL. Refresh and
   revisit the same order's return URL; there should be no second Purchase.
7. Clear the Pixel ID and rebuild, or use development/test mode: verify there is
   no Meta script/request. Block Meta or localStorage and confirm shopping and
   payment status still work.

The repository currently has no test command or active test framework. Use its
existing `npm run lint`, `npm run typecheck` and `npm run build` checks. Mocked
browser checks can verify event timing/payloads without contacting Meta; delivery
in Helper/Events Manager and a real confirmed-payment journey require an actual
Pixel ID and a configured Airwallex payment environment.

Meta's maintained [Pixel browser API example](https://github.com/meta/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl)
documents the queue, `autoConfig` and `disablePushState` switches used here; this
project does not install or use Google Tag Manager.

## Changed files

- Configuration: `.env.example`, local `.env` (empty placeholder only).
- Integration: `lib/meta-pixel.ts`, `components/MetaPixel.tsx`,
  `components/layout/DocumentFrame.tsx`, `lib/security/content-security-policy.ts`.
- Server cart success: `features/cart/api.ts`.
- Local cart successes: `components/product/ProductCard.tsx`,
  `app/(shop)/products/components/ProductsGrid.tsx`,
  `app/(shop)/products/[slug]/components/ProductActions.tsx`,
  `app/(shop)/products/[slug]/components/RelatedProducts.tsx`,
  `app/(private-commerce)/(shop)/shopping-handoff/selection.tsx`,
  `app/(private-commerce)/(shop)/wishlist/page.tsx`,
  `app/(private-commerce)/(shop)/cart/page.tsx`.
- Checkout: `app/(private-commerce)/(shop)/checkout/page.tsx`.
- Confirmed payment: `lib/airwallex/components/AirwallexPaymentStatus.tsx`.
- Documentation: `docs/meta-pixel.md`.
