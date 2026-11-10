# Meta tracking isolation decision

Status: implementation decision, 10 November 2026. Delivery remains denied until the documented infrastructure, content, business and data-source approvals are supplied. No production deployment or account approval is part of this change.

## Baseline and discrepancy record

The application is Next.js 16.2.12, React 19, Auth.js 5, Redux Toolkit, Prisma 7 and PostgreSQL. The customer journey remains the commerce contract: server-priced guest and account checkout, exact variants, selected and full carts, Buy now preserving the cart, inventory reservations, immutable currency snapshots and verified payment transitions. `app/(shop)/layout.tsx` was absent at baseline; `app/layout.tsx` was the single persistent root.

The existing global root installs Pixel and a noscript image. `lib/analytics/meta-pixel.ts` defaults consent to true and has no route, source, content or business approval policy. Private receipts and payment returns can initialize that adapter. `app/providers.tsx` hydrates private sessions and browser cart/wishlist state everywhere. `Navbar.tsx` renders account information. The proxy consults profile locale, excludes APIs and supplies no host separation. No CSP, working consent interface, CAPI, outbox, runnable marketing worker or `.env.example` exists. Prior tracking documents describe historical repairs and tests, not present approval or verified live delivery.

The privacy contract restricts guest contact data to fulfillment and support and rejects marketing profiling (`app/(shop)/privacy-policy/page.tsx`, guest checkout section). Consent must be withdrawable. A numeric Pixel ID supplies neither approval nor consent. There is no evidence that Next.js is incompatible with Pixel. Account restrictions, business eligibility, automatic Events Manager rules and any externally injected tags require separate operator verification.

## Threat model and selected boundary

An executed third-party script can read origin storage, DOM and readable cookies and make authenticated same-origin requests. HttpOnly cookies alone do not prevent those requests. Multiple root layouts replace the JavaScript document during navigation; they do not sandbox first-party origin data.

Use both genuine Next.js root-document separation and separately configured storefront and commerce origins. Keep one modular monolith and database. Omit the common `app/layout.tsx`. Public and private roots each own html/body and provider composition. The existing locale proxy retains public paths. Full navigation crosses origins and tracking eligibility contexts; application cleanup after private rendering is insufficient.

Public documents use anonymous catalog state and a public navigation bar. No session hydration, account information, cart history, checkout data or review composition appears there. Product/variant/quantity choices cross through validated minimal shopping handoffs and are persisted on the untracked commerce origin before further navigation. Existing private cart hydration and login merging remain authoritative. Server boundaries revalidate all choices.

The public host exposes only explicitly enumerated anonymous read APIs and public consent/preferences endpoints. It must not proxy private APIs, accept credentialed CORS to commerce, or broaden cookie Domain. Authentication and scoped guest-order cookies remain host-only. Host checks execute before route handlers and are duplicated in the reverse-proxy configuration. Private documents exclude Meta script, image and connection destinations and use no-referrer protection. Payment destinations remain permitted by the private CSP.

If distinct hosts, deployment approval or legacy-state migration readiness are absent, commerce continues without marketing. Never load Pixel on a same-origin fallback deployment.

## Policy and event boundary

One typed, default-deny policy is shared by browser and server delivery. Runtime enablement, business and source approval, exact route/content/event/field approval, current versioned consent, active isolation and strict payload validation must all pass. Unknown classifications and policy versions are denied. No existing approval is inferred from a previous emitter or Pixel ID. Search and free text remain denied.

Only an explicitly imported public browser adapter downloads Pixel after policy and consent pass. Legacy commerce interaction helpers become first-party projections with no SDK import. Private Purchase and InitiateCheckout never justify an SDK on private pages. Automatic configuration is disabled using documented controls; account-managed automatic events and advanced matching must also be disabled and reviewed externally. Supported controls and documentation access are recorded in the runbook without claiming unverifiable account settings.

Consent starts unknown and records granted, denied or revoked with version and timestamp. Withdrawal stops dispatch, clears application marketing storage, suppresses unsent server records, revokes SDK consent and replaces a loaded document. Tabs and BFCache restoration revalidate. Nothing queues before consent, and no pre-consent event is replayed. Runtime policy is re-read rather than depending solely on a build-time public flag.

## Authoritative conversions

Airwallex webhook processing and authorized status reconciliation already converge in `applyAuthoritativeAirwallexPayment`. The successful, non-review transaction is the logical Purchase source. Retained SSLCommerz uses its verified success transaction. Reservation, launch, receipt rendering and return query flags are not payment success. Preserve the existing state machines.

Use an opaque event UUID and a unique business-conversion key in a PostgreSQL transactional outbox. Save original occurrence time and immutable verified payment amount/currency, including tax and delivery after promotions. Provider calls occur outside commerce transactions. Optional marketing writes must use savepoints so a failed insert cannot poison the enclosing commerce transaction.

COD defaults to internal OrderPlaced only: the current ordinary administrative PAID mutation is not a dedicated evidence-backed collection contract. Do not report COD Purchase or reinterpret it as collected revenue. An alternative definition requires separate explicit approval.

CAPI is separately disabled by default. A runnable leased worker rechecks consent, policy, runtime kill switch, expiry and approved matching fields before delivery; retries retain identity/time and use bounded backoff. Delivery is durable at least once with deduplication controls. No contact, account, IP, user-agent or attribution data is automatically exported. If required website source URL or matching fields cannot be truthfully supplied under an approved projection, retain a blocked/suppressed record instead of inventing values. Marketing failure never prevents payment or order access.

## Migration and release gates

Before tracking, retain an untracked legacy commerce origin for existing sessions, guest-order cookies and carts. Do not silently migrate bearer credentials or use parent-domain cookies. Provide explicit minimal cart transfer where needed, keep historical guest receipt links usable on their original host, then separately approve the public host after storage/cookie cleanup and private-API isolation checks. No DNS or production migrations run during implementation.

Verification must cover policy decisions, real document/host navigation, SDK-loading and outbound network behavior with a synthetic intercepted SDK, private build/import boundaries, consent revocation and BFCache/tabs, commerce regressions, transactional conversion deduplication, worker races and fail-soft behavior. Production builds and tests are not evidence of Events Manager acceptance or live delivery. Report implementation, passed checks, infrastructure, outstanding approvals and live verification separately.
