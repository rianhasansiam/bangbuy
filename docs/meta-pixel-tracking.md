# Meta Pixel ecommerce tracking

## Confirmed findings

The repository used Next.js 16.2.12 App Router, React 19, npm, Redux Toolkit, and Vitest. Before this repair, `components/analytics/MetaPixel.tsx` was the only `fbq` caller and emitted **PageView only**. Successful cart mutations, product views, checkout preparation, and verified orders had no application-owned ecommerce event delivery. The observed ViewContent in Events Manager therefore cannot be attributed to an explicit ViewContent implementation in this checkout of the code; automatic events, Event Setup Tool rules, or a different deployed build require account/browser inspection.

`app/layout.tsx` installs one Pixel using `NEXT_PUBLIC_META_PIXEL_ID`. The local value is present and numeric. The intended account/dataset and production environment value still require the marketer's verification. No GTM/dataLayer integration, Conversions API implementation, or functioning marketing consent UI/state was found in application source. The existing installation therefore owns direct browser Pixel delivery. Privacy-policy wording alone is not an implemented consent control.

There is no evidence that React replaced a button and caused tracking to fail. These are separate observations:

- **Setup Tool highlighting:** a limitation of account-side visual rules; it is not proof that an application event is missing.
- **Browser emission:** previously missing ecommerce calls are confirmed in source; the repair now follows successful business actions.
- **Meta receipt/reporting:** requires Pixel Helper, network inspection, and Events Manager access. Local mocked tests do not prove receipt.

## Event mapping and values

| Event | Canonical business action | Snapshot / value |
| --- | --- | --- |
| PageView | Initial load and genuine pathname/query navigation | One per navigation; replay/rerender does not duplicate, later return visits count. |
| ViewContent | A valid product detail component is displayed | Parent product and effective price, BDT. Option/quantity changes do not create another view; chosen variants are included on successful cart and checkout actions. |
| AddToCart | A persisted authenticated cart addition succeeds, or a guest addition commits to its existing cart storage | Submitted product/variant and **newly added** quantity; effective unit price × added quantity, BDT. |
| InitiateCheckout | Authenticated checkout receives its first valid nonempty server preview for the checkout entry | Server preview items and displayed currency/total. Buy Now, selected-cart, full-cart, and profile cart use this same destination point. |
| Purchase | A qualifying online checkout's owner reads a server-derived verified payment/order snapshot on the receipt or Airwallex return | Verified SSLCommerz payment amount in BDT, or Airwallex's immutable payment amount/currency and direct payment FX rate. |

Buy Now passes explicit items to checkout and bypasses the cart. It emits InitiateCheckout after valid preparation; it does not fabricate AddToCart, BuyNow, or Purchase on click. Required options, invalid quantity, unavailable stock, rejected requests, and failed checkout previews produce no successful-action event.

Guest-cart stock remains the existing cached/fallback estimate; no new inventory lookup is introduced. Tracking suppresses known unavailable/no-option/over-stock additions and counts the quantity that the local operation actually persisted. Current inventory and explicit options are validated by authenticated cart mutations and checkout. Historical guest/saved records can lack current availability or variant metadata; those inherited records are revalidated at the existing server boundary.

Item prices are numeric **major units**, derived from commerce data. Product-level discounts are already in effective prices. Checkout totals include order promo discount, shipping, and tax using the existing server calculation. Purchase value equals the verified total payment snapshot, including those same components; contents carry effective merchandise unit prices, so contents sum need not equal value after order-level adjustments. Airwallex line prices use the transaction's persisted BDT→payment-currency rate, not a later exchange rate or the storefront's potentially different display currency. No payment logic or totals are changed.

The established Meta/Open Graph mapping is `product:retailer_item_id = product.productCode` in `app/(shop)/products/[slug]/page.tsx`. New events prefer this product code; selected variant IDs are additional context, not substituted catalog IDs. Legacy cached cart records that lack productCode fall back to their known productId until refreshed. Purchase requires a real productCode and suppresses unmappable/deleted product links. Order money and quantity are immutable snapshots; catalog codes come from the existing linked product because orders do not persist a productCode snapshot, so a later catalog code change affects mapping. No external feed configuration was available: the marketer must confirm that feed item IDs use these codes and that `content_type: product` matches its items. If the feed uses group IDs or variant SKUs, coordinate one mapping change across all payloads before catalog campaigns.

### Purchase authority and COD policy

`lib/services/order.service.ts` derives `metaPurchase` from persisted gateway evidence. Eligibility requires an owner, a confirmed fulfillment state, PAID, exactly one successful matching gateway payment, and no unresolved payment review. SSLCommerz requires stored validation ID, transaction identity, paid timestamp, and matching BDT total. Airwallex requires stored SUCCEEDED evidence, transaction identity, paid timestamp, matching base order total, and a valid immutable payment currency/rate/amount. Provider identifiers and raw evidence stay server-side. The browser receives only commerce items, amount/currency, and a stable `purchase:<orderId>` identity.

`lib/payments/core/payment-verification.service.ts` and `payment-status.service.ts` validate SSLCommerz provider data and finalize orders under locks. `lib/airwallex/services/airwallex-payment-verification.service.ts` performs verified Airwallex transitions. `updatePaymentStatus` rejects manual changes for gateway-managed methods. Neither Place Order clicks nor `payment`/`just-placed` URL parameters are payment proof.

Online checkout stores a browser purchase-intent marker only after the order API succeeds and analytics is eligible. Receipt tracking also requires that marker and the logged-in order owner. This prevents historical receipt browsing and administrator receipt views from generating new conversions. Stable order identity plus a Pixel-scoped persistent emitted marker prevent refresh/retry emissions in the same browser. Storage clearing, unavailable storage, another device/browser, blockers, or never returning to the storefront can limit browser conversion coverage; there is no server delivery here.

**COD conversion policy remains undefined.** COD orders are created PENDING/UNPAID and were not tracked as Purchase in this source. The repair does not silently treat an unpaid COD confirmation as payment. The owner/marketer must separately decide whether COD Purchase means accepted order, confirmation, delivery, or collected payment. That decision does not block cart and checkout events.

## Implementation files

- `lib/analytics/ecommerce.ts`: typed commerce snapshots, pure payload construction, catalog mapping, and guest added-quantity calculation.
- `lib/analytics/meta-pixel.ts` and `components/analytics/MetaPixel.tsx`: one direct delivery adapter, standard Pixel bootstrap queue, action/navigation identities, safe failure handling, consent hook, and persistent Purchase/intent markers.
- `features/cart/api.ts`, `components/product/ProductCard.tsx`, PDP `ProductActions.tsx`/`RelatedProducts.tsx`, `ProductsGrid.tsx`, cart/wishlist pages, and checkout page: route every cart/checkout entry through successful-action helpers. Related multi-variant products now use the existing option-selection page instead of an invalid blind guest add; wishlist storage retains variantCount across reloads. Layout and valid purchasing behavior stay intact.
- `components/analytics/ProductView.tsx` and the PDP page: emit one parent-product detail view per navigation.
- Cart, wishlist, checkout, category, brand, and home catalog serializers/types: carry existing productCode through actual commerce data.
- `lib/analytics/order-purchase.ts`, `order-purchase-browser.ts`, `lib/services/order.service.ts`, `features/orders/api.ts`, `features/checkout/api.ts`, the order summary, and `AirwallexPaymentStatus.tsx`: derive verified snapshots, register eligible order intent, and share one owner-only online Purchase delivery function across receipt/return reads.
- Analytics regression suites under `__tests__`: assert standard names, payload values/identifiers, quantities, counts, errors, delayed bootstrap, consent, duplicate actions, and verified order authority without sending real conversions.

## Configuration, initialization, and consent

Set the numeric `NEXT_PUBLIC_META_PIXEL_ID` for the intended Meta dataset before the production build. Blank/invalid configuration disables this implementation safely. Restart development after changes; production public configuration requires a rebuild. There is no CAPI access token or server tracking platform to configure in this repair. No secrets or customer personal data belong in event parameters or debug output.

The supported Meta `fbq` bootstrap queues allowed events while `fbevents.js` loads. No polling, artificial navigation delay, or weakened security headers are needed. Blocked scripts remain blocked. Application analytics failures are swallowed so shopping and payment continue.

The adapter exposes an explicit consent setter for an existing/external consent integration; denial/revocation discards pending application events and prevents purchase-intent registration. The repository has no wired CMP, so the existing installation's default eligibility is preserved. If production has a CMP injected outside this repository, wire its actual state before release; do not replay activity that happened while denied. Consent UI/framework changes are a separate project.

## Browser and marketer verification

Use a staging/test Pixel and sandbox payments for verification. Do not create real paid orders or let mocked tests send production conversions.

1. Developer: build with the intended test Pixel ID, open DevTools Network with **Preserve log**, and install Meta Pixel Helper. Confirm one `fbevents.js` bootstrap and one intended Pixel initialization; inspect request destination ID, `ev`, content IDs, contents quantities/item prices, currency, value, `num_items`, and event identity. Use a browser configuration where consent allows this test.
2. Marketer: open the intended dataset's Events Manager **Test Events**, then open the staging page from that tool. Confirm product detail PageView/ViewContent and correlate browser requests with events received by the intended dataset.
3. Test representative simple/default-variant and multi-variant products on desktop/mobile. Change selection before submission and while a request is pending; verify the completed action's submitted variant/quantity. Add quantity >1 with a discounted price. Two independent additions of the same product must produce two AddToCart events. Missing options, out-of-stock, failed requests, and stock-capped zero additions must produce none.
4. Test Buy Now and ordinary/selected/profile cart checkout. Confirm exactly one InitiateCheckout after a valid preview, none after failed preparation, and no duplicated handler+destination event. Promo or delivery-zone changes within the same checkout do not begin another attempt. Leave checkout and start a genuine later attempt to verify a new event.
5. In sandbox only, complete SSLCommerz and Airwallex and check verified online Purchase with the same order event identity. Refresh/reopen the qualifying receipt in the same browser: no additional Purchase. Open a historical receipt with no eligible checkout marker or another customer's receipt as admin: no Purchase. Failed/pending/review-held payments and COD should produce none under the current policy.
6. Test delayed script loading, blocked requests, blank configuration, denied/revoked consent, and analytics exceptions. Shopping, navigation, and order handling must still work. Check the console for actual script/config/CSP errors; account-side blocking and privacy controls remain separate from application emission.

Review overlapping Event Setup Tool/automatic-event rules for **ViewContent, AddToCart, InitiateCheckout, and Purchase** on affected products and checkout pages. Compare names, triggers, Pixel IDs, and counts. Disable only overlapping rules when the application implementation is ready and verified. Keep unrelated valid events and the intended Pixel. If production injects GTM or another Pixel/CAPI integration, reconcile that ownership and the shared identity before rollout; no external rules or accounts were changed here.

## Rollout and validation stages

- [ ] Developer: review changes, verify environment ID, run automated tests, lint, TypeScript, and production build; record exact results.
- [ ] Developer + marketer: verify **browser emission** on staging across the representative flows above.
- [ ] Marketer: verify **Meta receipt** in the intended dataset's Test Events, catalog ID/type matching, and overlapping-rule removal.
- [ ] Owner/marketer: record the separate COD Purchase policy and any externally managed CMP/GTM/CAPI configuration.
- [ ] Developer: release only after the normal deployment approval; this task does not deploy.
- [ ] Developer + marketer: separately verify **production** browser emissions, received events, and duplicates after release.

Local validation recorded on 2026-10-04:

| Check | Exact result |
| --- | --- |
| Six new analytics/purchase regression suites | 107 tests passed, with mocked delivery/requests. Actual product handlers, checkout/receipt effects, and payload/delivery boundaries are exercised. |
| `npm test` | Exit 1: 509 passed, 1 failed; 36 files passed, 1 failed. The sole failure is the existing mobile-button height assertion in `__tests__/product-card-responsive.test.ts:91`. An isolated run against the original `HEAD` ProductCard reproduced the identical failure; its expected `h-10`/`h-11` classes were already replaced with `py-2`. UI classes were preserved. |
| `npx tsc --noEmit` | Exit 0. |
| `npm run lint` | Exit 0: 0 errors, 3 existing unused-variable warnings (`TeamSection`, `cardBackground`, `_`). |
| `npm run build` | Exit 1: compilation and build TypeScript passed; page-data collection failed for `/products/[slug]` with Prisma P1001 because the configured database at `127.0.0.1:15432` was unreachable. Restore the normal development database/tunnel and rerun the build before release. |
| `git diff --check` | Exit 0. |

**Browser emission:** not verified in an actual storefront browser; regression tests intercept the Pixel queue and network boundaries. **Meta receipt:** not verified. **Production:** not deployed or verified. No external rules were changed and no real paid orders were created. These stages must be completed separately using the checklist above.

## Official Meta references

Verified against official Meta pages on 2026-10-04. The browser research tool returned HTTP 429; a normal HTTPS read of the same official pages succeeded, including the deduplication page updated 2026-06-28.

- [Meta Pixel API reference](https://developers.facebook.com/docs/meta-pixel/reference/): standard event names and parameter requirements, including Purchase value/currency and content identifier/type rules.
- [Handling Duplicate Pixel and Conversions API Events](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/): browser `eventID` is the fourth argument; pair it with server `event_id`, identical event/event_name, and the same Pixel within Meta's documented 48-hour deduplication window. Browser-only duplicates still need application suppression.

CAPI is absent here and was not introduced. A future CAPI project must validate orders server-side, preserve consent/secret isolation, use the same normalized payload and action identity as browser delivery, and verify both target the intended dataset.
