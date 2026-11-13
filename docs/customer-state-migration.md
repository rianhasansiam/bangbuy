# Customer state migration before origin separation

Status: prepared on 10 November 2026; production migration **not executed**. Read together with [deployment blockers](deployment-blockers.md) and the [staging report](deployment-staging-verification.md).

## Confirmed legacy origins and the blocking decision

Public DNS/HTTPS discovery on 10 November found that `https://bangbuy.net/en` and `https://www.bangbuy.net/en` both return 200, rather than redirecting to one canonical hostname. `www` is a DNS CNAME to the apex, but that does not combine browser origins. Both resolve to the existing VPS, `187.127.138.53`. An anonymous apex `/en/cart` also returns 200. These observations establish current reachability, not access to any customer's session or cart.

Preserve **both** existing origins as commerce entry points until their compatibility plan is implemented and tested. Prefer a fresh, operator-approved catalog hostname for `STOREFRONT_ORIGIN`. Do not choose a production hostname solely from this document. Keep private customer state on its existing commerce origin.

**Current blocker:** `lib/security/surfaces.ts` accepts one `COMMERCE_ORIGIN` and one `STOREFRONT_ORIGIN`. Once separation is configured, the other legacy hostname is unknown and receives 421. The current proxy example is therefore not sufficient for the discovered live topology. A reviewed compatibility change or equivalent infrastructure/application plan must preserve each old host's own cart, session, receipt and callback behavior. No broad alias acceptance or canonical redirect has been implemented by this preparation task. Production origin separation is blocked until the chosen solution is tested.

A redirect from `www` to apex cannot copy localStorage or host-only cookies. A compatibility proxy must also retain the original browser origin and satisfy application host validation; changing only an Nginx upstream does not solve this blocker. Do not weaken host checks as a shortcut.

## State and compatibility requirements

| Customer state or entry | Required behavior | Acceptance evidence |
| --- | --- | --- |
| Existing guest cart on each legacy host | Leave `enterfly:cart:v1` at its original browser origin. Continue loading it from commerce; retain quantities and variants, then revalidate stock/prices. Do not clear storage globally. | Independently warm apex and `www` profiles before cutover; after rollout, each cart remains usable without exporting private data to catalog. |
| Wishlist and saved items | Preserve `enterfly:wishlist:v1` and `enterfly:saved-for-later:v1` with the same origin. | Existing items still appear; restore-to-cart works and unavailable items fail clearly. |
| Signed-in account | Preserve server data, session signing configuration and host-only cookie behavior. Keep authentication/callback URLs on the reviewed commerce origin and preserve a safe checkout `callbackUrl`. Do not copy session cookies between hosts. | Existing sessions on each legacy host work under the compatibility plan; fresh credentials/OAuth sign-in returns to the intended cart or selected checkout. |
| Guest order cookies and bookmarked receipts | Keep original order routes and `bangbuy-guest-checkout` / `bangbuy-guest-order-*` cookies on their original host. Never put bearer credentials in URLs, exports or cross-origin messaging. | A pre-cutover receipt bookmark opens in the original browser and another tab; an unrelated browser remains denied. Test apex and `www` separately. |
| Selected-cart checkout | Preserve `buy=productId:quantity:variantId,…`, `source=cart` and normalized `promo` through locale, login and navigation. Revalidate every item server-side. | Only selected lines are purchased and removed; unselected lines remain. Test an already-open pre-cutover checkout as well as a new checkout. |
| Buy now | Preserve its product/variant/quantity checkout selection. Successful Buy now must leave the existing cart intact. | Existing and new Buy now flows pass; stale stock produces a recoverable error rather than an incorrect order. |
| Locale and old links | Retain `/en/...`, `/bn/...`, legacy unprefixed locale resolution and product-slug redirects. Preserve safe query/hash during language changes; never expose checkout drafts to catalog. | Locale switches preserve product/checkout context; historical product and receipt URLs still resolve correctly. |
| Existing checkout attempts | Preserve idempotency behavior and the private draft needed for an uncertain submit. Do not replay a request merely because the document changed. | Retried unchanged requests return the same logical order; changed inputs with a reused key are rejected. |
| Payment return, webhook and polling | Retain original HTTPS return/callback/webhook URLs and provider verification configuration while outstanding payments can return. Status endpoints remain authorized. Do not infer payment from query flags. | Sandbox hosted launch, cancellation, failure, delayed success, browser return, webhook retry and authorized polling settle the same original order once. |
| Payment retries | Keep the reserved order accessible on its original host; retry secure payment on that order when allowed. Never create another order solely to compensate for a missing browser redirect. | Failed hosted launch can resume payment; repeated observations do not double-debit stock or apply an order transition more than once. |

If commerce must move, keep the legacy origins available for old receipts and guest carts. An explicit minimal cart selection migration would need its own reviewed implementation, customer choice and server-side validation. **That export/import flow is not implemented.** Account sign-in on a new host does not migrate a guest-order bearer cookie. Do not retire old receipt access until a complete alternative is proven.

## Audit before assigning a new origin

The deployment owner must inventory existing origins and representative warm profiles locally, without collecting customers' stored values. The privacy reviewer must resolve every unknown storage class and parent-domain cookie before approval. Check both apex and `www`, and the proposed fresh catalog host. A fresh hostname can still receive a parent-domain cookie; DNS freshness alone is insufficient.

1. Record only categories and counts for localStorage, sessionStorage, IndexedDB, cookies, CacheStorage and service-worker registrations. Review host-only/parent-domain, Secure, HttpOnly, SameSite, path and expiry attributes locally. Retain the authentication/guest signing configuration without publishing secrets.
2. Check legacy key families: `enterfly:cart:*`, `enterfly:wishlist:*`, `enterfly:saved-for-later:*`, `enterfly:order:*`, and `bangbuy:locale-draft:*`. Checkout drafts can contain delivery data. The browser auditor reads known key names only; counts are not proof of a clean migration.
3. Review any registered service worker, its script/scope, offline responses and update behavior. Review CacheStorage contents locally for private HTML/API responses. Do not upload bodies, URLs with identifiers or request headers. Public `/sw.js` and `/service-worker.js` returning 404 does **not** establish that no old worker remains registered.
4. Review browser HTTP cache, CDN and reverse-proxy caches separately. Verify private pages/APIs are never served from shared caches. Check an offline/warm session and previously open tabs; response headers on a fresh request cannot erase old cached responses.
5. Do not issue a blanket `Clear-Site-Data`, remove all cookies/storage, or unregister workers while they may preserve carts/receipts. Any targeted cleanup needs a reviewed retention/compatibility plan first. Preserve legacy host access while customer state remains there.
6. Complete the audit and warm-profile compatibility checks before changing production host routing. Audit success alone does not establish that old carts, sessions, receipts and callbacks remain usable.

### Read-only browser auditor

`scripts/audit-browser-state.mts` attaches to an operator-supplied **loopback** Chrome debugger and inspects exactly one already-open tab on the exact requested origin. It does not navigate, read local/session storage values, open IndexedDB records/cache bodies, erase state or close the browser. Cookie values are handled only by the local browser protocol and never printed; output aggregates categories and attributes, including HttpOnly presence. Unknown names are withheld too. No report is sent to the application or a third party.

Use only an authorized operator-controlled test/profile browser. Do not expose the debugging endpoint to the network. The tool does not discover or take over arbitrary customer profiles.

```sh
npm run migration:audit-browser -- \
  --cdp http://127.0.0.1:9222 \
  --origin https://bangbuy.net \
  --role commerce
```

Repeat in a separate invocation for `https://www.bangbuy.net` and the approved catalog origin. Open exactly one matching tab; the tool refuses ambiguous targets. Full cookie enumeration across unknown path scopes, HTTP disk caches, CDN caches and other profiles remain manual checks. A report always says `approvalGranted: false`; zero counts are not a readiness certificate.

Where a debugger connection is unavailable, generate a DevTools expression and run it locally in the desired existing document:

```sh
npm run --silent migration:audit-browser -- --snippet
```

This expression returns only storage/worker/cache/database counts. It cannot see HttpOnly cookies; review those separately in the browser's local storage inspector without copying their values. Do not paste arbitrary scripts supplied by an external page.

## Rollout and rollback hold points

Before origin separation, deployment/application owners must resolve the dual-legacy-host blocker, obtain backup/rollback evidence, and run the warm-profile acceptance matrix above against the candidate stack. Test both legacy hosts as distinct origins. Keep existing provider callbacks reachable throughout the test and rollout. A local synthetic profile cannot establish migration safety for real warm profiles.

After deploying an explicitly authorized release, verify guest/account orders, old bookmarks, login callbacks, pending-payment returns and rollback on the real hosts. Record failures before allowing traffic cutover. Keep the existing application/data recovery path available.
