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


## Live follow-up investigation — 2026-10-04

### Deployment evidence

The repair is local commit `2c7a205379767bd2388a6620c5369cfced728fc0` (`fixed pixel hishab`, committed 2026-10-04 10:53 Asia/Dhaka). The working tree was clean before this investigation. No tracking source was changed during the follow-up.

**The currently served affected PDP does not contain the repair.** A fresh public HTTP read of `https://bangbuy.net/products/male-side-bag` returned Next build ID `LTKkCZ5aqVDRTiyWunwj-`. Its MetaPixel module still uses the earlier `isReady` state, `lastTrackedPage` ref, and inline Next Script bootstrap, and emits application PageView only. This structurally matches the preceding `2beec31` / `e01ec6a` implementation. All 15 initial PDP script assets lack `__bangbuyMetaPixel`, `enterfly:meta-checkout`, `enterfly:meta-purchase`, and application ViewContent/AddToCart/InitiateCheckout names. The actual ProductActions RSC props also lack the productCode added by the repair. This is artifact evidence, not an inference from local Git.

The live old Pixel chunk is `https://bangbuy.net/_next/static/chunks/19_u2tfjng5__.js`, SHA-256 `05d98faf596f7762108bfbcc30b303f42549f6ad8c5282f83a78f4fb863c3619`. Exact deployed Git commit remains **unverified**: public build IDs are not commit provenance, and current VPS SSH authentication failed. The September 4 deployment guide documents `/var/www/bangbuy`, Nginx forwarding to one PM2 Next process on port 3000, and historic root ownership. Its later dedicated-user runbook is a conditional migration target, not proof of the current daemon owner. Confirm the current directory, owner, and process before running any deployment command.

### Real affected-product flow

A normal browser UI session selected the available **Black** variant and exercised exactly one cart addition and two checkout entries. The cart was initially empty. The added item persisted through a cart-page reload in Server + Local mode. Buy Now and normal selected-cart checkout both showed server-priced items and totals. Place order was never clicked. The test item was removed after inspection; no paid order or account setting was created or changed.

| Action | Business result observed | Repaired helper | Repaired adapter accepted/queued | Actual Pixel request | Meta receipt |
| --- | --- | --- | --- | --- | --- |
| Select Black | Available stock 10; selected option enabled actions | No action event expected | Not applicable | Not verified | Not verified |
| Add to Cart, quantity 1 | One Black item persisted in authenticated cart | Absent from served action/module | Repair adapter absent | Not verified; external rules may emit events | Not verified |
| Buy Now | Valid server-priced checkout, explicit Black quantity 1 | InitiateCheckout helper absent from served checkout assets | Repair adapter absent | Not verified | Not verified |
| Normal cart checkout | Valid selected-cart checkout with `source=cart` | InitiateCheckout helper absent from served checkout assets | Repair adapter absent | Not verified | Not verified |

Public/current commerce identity: product `cmusafdcp0000fil54ce9a0ap`, catalog code `PRD-00072`, Black variant `cmusafdcv0001fil5s8wgojsk`. Observed merchandise price BDT 1,299 (regular BDT 1,770), quantity 1; checkout subtotal BDT 1,299 + shipping BDT 80 + tax BDT 0 = BDT 1,379. Both checkout entries used that same snapshot. These are business data/UI observations, **not captured Pixel payloads**.

Expected repaired AddToCart payload: `content_ids=["PRD-00072"]`, `content_type="product"`, `contents=[{id:"PRD-00072",quantity:1,item_price:1299}]`, `variant_ids=["cmusafdcv0001fil5s8wgojsk"]`, `currency="BDT"`, `value=1299`, `num_items=1`, and product content_name. Expected InitiateCheckout uses the same item fields and `value=1379`; two distinct successful checkout entries should have distinct action identities. Do not label these expected payloads as observed Meta requests.

Effective public Pixel ID `1396304422710398` is present in live HTML/RSC/inline bootstrap and in the loaded Meta dataset-configuration script. The browser loaded `fbevents.js` and the matching signals/config script; the initial console inspection exposed no warnings/errors. No consent UI or GTM installation was observed in the affected page/public application assets. Actual main-world consent/queue state, complete network payloads/counts, and rule firing were not available through the connected browser tooling; its asset inventory is not a complete network recorder. Main-world SDK state must not be inferred from an isolated read-only DOM evaluator. The current Events Manager login did not expose the intended dataset, so no test receipt was confirmed.

Observed action counts: 1 legitimate successful cart addition, 1 Buy Now checkout entry, 1 normal cart checkout entry. **Tracking-request/event-receipt counts remain unverified**, not zero by assumption. The only explicit event name in served application tracking is PageView; configured external event names below are separate evidence.

### Confirmed overlapping/misassigned Meta configuration

A read-only download of Meta's public `https://connect.facebook.net/signals/config/1396304422710398` contains 42 ACTIVE Event Setup Tool rules: ViewContent 34, AddToCart 3, InitiateCheckout 1, AddPaymentInfo 2, Search 1, SubmitApplication 1. It also enables ESTRuleEngine, InferredEvents, and AutomaticMatching. No Purchase rule appears in this downloaded rules array. These are configuration counts, not received-event counts.

| Configured condition value | Configured event | Rule ID | Marketer review |
| --- | --- | --- | --- |
| `add to cart` | ViewContent | `28375500845454352` | Misassigned business action; overlaps repaired successful cart tracking. |
| `increase quantity` | AddToCart | `2161586941420481` | Quantity change is not a confirmed new cart addition. |
| `buy now` | InitiateCheckout | `1627530462301698` | Click rule can precede valid checkout and overlap destination tracking. |
| `show black variant image` | ViewContent | `1847510059928627` | Image/variant interaction differs from one parent-product view per navigation. |
| `black available color xh black` | ViewContent | `2054929958477375` | Option-selection overlap. |
| `view male side bag` | ViewContent | `1756671182229675` | Review overlap with repaired product-detail view policy. |
| `decrease quantity` | ViewContent | `1117981157433394` | Quantity change is not a new product-detail navigation. |

The public rule configuration supports a concrete explanation for unexpected event naming, but does not prove which rule matched a tested click. The marketer should inspect these rule IDs and disable only overlapping/misassigned rules in coordination with verified release of application tracking. No external rules were changed. Visual Setup Tool highlighting remains independent of application event delivery; no button redesign, DOM-selector tracking, or Pixel reinstall is warranted by this evidence.

### Build/environment result

Production-mode `@next/env` loading found DATABASE_URL, AUTH_SECRET, AUTH_URL, SITE_URL, NEXT_PUBLIC_SITE_URL, and NEXT_PUBLIC_META_PIXEL_ID present; DIRECT_URL absent. The intended numeric public Pixel ID matches `1396304422710398`. No tracking feature flag exists. No NEXT_PUBLIC secret/token/password/private-key configuration was found. Credentials and connection strings were not printed. The installed Next environment guide confirms direct NEXT_PUBLIC references are frozen into browser code by `next build`; changing runtime environment alone cannot repair an already compiled browser ID.

The actual local configured database on loopback port 15432 failed TCP connection and read-only SELECT 1 with ECONNREFUSED. The README's known SSH tunnel requires VPS authentication, which the available SSH credentials could not satisfy. Do not interpret the historic Neon topology in the older guide as the current database configuration.

A safe production build was then completed with **only** DATABASE_URL/DIRECT_URL overridden to a disposable loopback PostgreSQL 18.6 restore of the tracked September 4 backup. All 11 migration names/checksums matched current source; no migration or fabricated product data was introduced. `npm run build` exited 0: compilation, TypeScript, page-data collection, and all 113 static generation tasks completed. Local build ID: `qpyv0ksiPkGWNOuBblJos`; client chunk `1z-lm-yo1rrjz.js` contains the intended public ID, repair runtime, and standard event names. The disposable database, credentials, and private restore files were cleaned up afterward.

The archive does not contain male-side-bag. This successful build verifies code/schema compatibility with real archived catalog data, **not current production database access or affected-product execution**. Do not deploy this archive-built local artifact as current production catalog data; rebuild with the verified release environment and current intended database.

Regression command `npm test -- __tests__/meta-pixel-*.test.ts __tests__/order-purchase.test.ts`: exit 0, **6 suites / 107 tests passed**. There is no new code defect reproduced and no new regression test required. The earlier full-suite baseline UI assertion and lint warnings are recorded above; resolve or explicitly disposition the baseline test before release, without redesigning buttons for the Setup Tool.

### Exact read-only production checks

These commands are for the authorized VPS operator; they were not executed successfully against production in this investigation. The documented directory/account are historical evidence and must be confirmed. Keep all credentials in protected server environment files. Do not run unfiltered `pm2 env`, print connection strings, or dump whole environment objects.

```bash
# Read-only after an authorized operator authenticates to the documented VPS.
# This task could not authenticate: root@187.127.138.53 was denied.
ssh root@187.127.138.53

# These paths are documented September 4 observations, not confirmed current state.
test -d /var/www/bangbuy || { echo "Documented application directory is absent; locate the configured cwd first"; exit 1; }
cd /var/www/bangbuy
git rev-parse HEAD
git status --short
test -f .next/BUILD_ID && cat .next/BUILD_ID
test -f .next/BUILD_ID && stat .next/BUILD_ID

# Run under the account that owns the EXISTING PM2 daemon. Do not initialize a new daemon.
# Historical daemon home was /root/.pm2; if migrated, confirm its current home before this command.
test -S "${PM2_HOME:-$HOME/.pm2}/rpc.sock" || { echo "No existing PM2 daemon at this account/home; inspect current owner before proceeding"; exit 1; }
pm2 jlist | node -e 'let raw="";process.stdin.on("data",x=>raw+=x);process.stdin.on("end",()=>{for(const p of JSON.parse(raw)){if(p.pm2_env.pm_cwd==="/var/www/bangbuy")console.log(JSON.stringify({id:p.pm_id,name:p.name,status:p.pm2_env.status,cwd:p.pm2_env.pm_cwd,execPath:p.pm2_env.pm_exec_path,startedAt:p.pm2_env.pm_uptime}));}})'

# Validate the same production-mode load order as Next build, while suppressing env values.
NODE_ENV=production node <<'NODE'
const {loadEnvConfig}=require("@next/env");
loadEnvConfig(process.cwd(),false,{info:()=>{},error:()=>{}});
for(const key of ["DATABASE_URL","AUTH_SECRET","AUTH_URL","SITE_URL","NEXT_PUBLIC_SITE_URL","NEXT_PUBLIC_META_PIXEL_ID"])
 console.log(key+": "+(process.env[key]?.trim()?"present":"absent"));
console.log("Pixel ID matches intended dataset:",process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()==="1396304422710398");
console.log("Public secret-like keys:",Object.keys(process.env).filter(x=>x.startsWith("NEXT_PUBLIC_")&&/TOKEN|SECRET|PASSWORD|PRIVATE/i.test(x)));
NODE

# Check only the DB's health in a read-only transaction; never print credentials or URLs.
NODE_ENV=production node <<'NODE'
const {loadEnvConfig}=require("@next/env");const {Client}=require("pg");
loadEnvConfig(process.cwd(),false,{info:()=>{},error:()=>{}});
(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000});try{await c.connect();await c.query("BEGIN READ ONLY");await c.query("SELECT 1");await c.query("ROLLBACK");console.log("DB SELECT 1 passed");}catch(e){console.log("DB SELECT 1 failed:",e.code||e.name);process.exitCode=1;}finally{await c.end().catch(()=>{});}})();
NODE

# Source configuration + deployment artifacts are separate evidence.
# Presence of marker strings proves candidate artifact content, not exact source SHA.
rg -l '__bangbuyMetaPixel|enterfly:meta-checkout' .next/static/chunks
# Compare chunk SHA-256 hashes with bytes actually fetched by the live product browser.
# Do not treat checkout HEAD or .next/BUILD_ID alone as proven build-commit provenance.
```

Also compare the live build ID `LTKkCZ5aqVDRTiyWunwj-` and the live chunk SHA above with the selected running process's actual `.next` directory. Inspect any existing release/deployment manifest tying that artifact to a Git SHA. Matching checkout HEAD alone is insufficient. Record the source SHA, `.next/BUILD_ID`, and client chunk hashes together for the next release; no new public version endpoint is necessary for this repair.

### Deployment preparation — commands require explicit approval

1. Confirm the current Nginx upstream, BangBuy process owner/name/id/cwd, and clean release checkout. The VPS hosts another application; operate only on the confirmed BangBuy service. Use `development_guide.md` section 16 only after its dedicated-user assumption has been verified. If production still uses historic root PM2, do not blindly initialize another user's daemon or perform an unrelated service-account migration as part of this Pixel release.
2. Plan the existing maintenance-window/rollback procedure. Save a recoverable previous source/artifact/environment record and the normal backup. Stop only the confirmed BangBuy process before replacing an in-place node_modules/.next. For a separate release directory, use only an already established release-switch procedure; none is verified by this investigation.
3. In the confirmed release directory as its current application owner, fetch/select clean repair SHA `2c7a205379767bd2388a6620c5369cfced728fc0` after reviewing any production-only source changes. Do not reset or overwrite a dirty checkout. Run the repository's existing install/validation commands:

   ```bash
   git fetch --prune --tags
   git checkout 2c7a205379767bd2388a6620c5369cfced728fc0
   npm ci --include=dev
   npx prisma validate
   npx prisma generate
   npx prisma migrate status
   npm run lint
   npx tsc --noEmit
   npm test
   npm run build
   ```

   The repair contains no schema migration. Apply no migration merely to release Pixel tracking; separately review any migration-status drift. Set the verified intended NEXT_PUBLIC_META_PIXEL_ID and available database/auth configuration **before** build, using protected environment configuration. Never substitute the isolated backup build or hide real database failures. The full-suite baseline failure must have an explicit reviewed disposition before proceeding.
4. Record source SHA/build ID/client hashes. Confirm the built client contains the repair markers and intended ID. After successful gates and **only with release approval**, start/restart the existing selected BangBuy service using its confirmed manager. For PM2, the established command is `pm2 restart CONFIRMED_BANGBUY_PROCESS_ID --update-env` under the existing daemon's owner; replace the placeholder with the read-only verified ID. Do not restart all processes. No deployment/restart was performed here.
5. Open the live affected page and verify the browser fetches the new recorded artifact, rather than the old chunk above. Confirm normal cart behavior and checkout; then separately confirm Meta receipt and duplicates with the marketer.

### Remaining browser/account verification

Use Chrome DevTools Network with Preserve log or Meta Pixel Helper on the intended live/staging dataset. Filter `fbevents.js`, `signals/config`, and `facebook.com/tr` requests; inspect GET parameters **or POST form data**, response/failure state, `id`, `ev`, `eid`/eventID, contents, IDs, quantity, currency, and value. Never export an unredacted HAR containing session cookies, identifiers, profile fields, or tokens. Network issuance or HTTP success alone does not prove Events Manager processed an event.

In Events Manager Test Events for **dataset 1396304422710398**, open the affected product through the test interface, choose an available variant, add quantity 1 successfully, and start Buy Now and normal cart checkout as distinct attempts. Expected repaired event counts: one AddToCart per successful addition; one InitiateCheckout per valid checkout entry, with no handler/destination duplicate; one ViewContent per product navigation. Selection/quantity changes alone do not create these business-action conversions. Correlate browser event identities/payloads with received events, verify catalog IDs, and review the specific overlapping rules above. Do not place real orders or call fbq manually to manufacture test conversions. Keep browser issuance, Meta receipt, and post-release production validation recorded separately.
