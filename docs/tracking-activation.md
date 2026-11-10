# Production release and tracking activation

This is an operator checklist, not authorization to change production. The [blocker matrix](deployment-blockers.md), [environment checklist](deployment-environment.md), [customer migration](customer-state-migration.md), [deployment runbook](deployment-runbook.md) and [database and worker operations](deployment-database-and-worker.md) govern different prerequisites.

## Stage 1 Infrastructure and commerce

1. Resolve the two existing commerce origins (`bangbuy.net` and `www.bangbuy.net`). Preserve each origin's carts, session, guest-order cookies, bookmarks and payment returns. Strict two-origin mode currently accepts one commerce host; do not install a vhost configuration that strands the other. Document and test the compatibility solution first.
2. Obtain current VPS/process/Nginx inventory and a verified backup/restore rehearsal. Approve the exact release artifact and rollback plan. Do not modify other VPS applications.
3. Choose and provision an approved fresh public hostname, then validate DNS, IPv4/IPv6, TLS renewal, known-host routing and loopback-only upstream access in staging. Keep both existing commerce origins untracked.
4. Apply the approved additive migration through the repository's explicit migration connection, generate Prisma and build the release. Follow the safe schema/application order in the database runbook. Never reset or seed production; retain additive tables during application rollback.
5. Keep `META_ENVIRONMENT=disabled`, `META_RUNTIME_ENABLED=false`, `META_PIXEL_ENABLED=false`, `META_CAPI_ENABLED=false` and `TRACKING_ISOLATION_READY=false`. Keep the manifest delivery/isolation flags false and its approvals denied. The optional worker may remain stopped; it must never deliver externally at this stage.
6. Verify health/liveness, restarts, host-only secure cookies, CSRF, private CSP/no-referrer, direct/private links, account/cart merge, Buy now and selected cart, locales, old and new guest receipts, provider callbacks/status/retry, concurrent replay and rollback. Remove old global tracking artifacts on all private served releases.
7. Record production execution separately from local/staging evidence. Stop and roll back if any old-customer compatibility check fails. Stage 1 is currently **not executed** and blocked by the external inventory and dual-origin compatibility issue.

## Stage 2 Review and enable one channel

Complete an explicit approval record identifying the channel, dataset, exact routes, events, approved fields, content IDs, actual document fingerprints, source/referrer and matching scope, reviewer references/expiry and activation window. Business/source approval in the manifest is internal evidence, not a provider approval workflow. The dataset owner separately records actual Meta restrictions and automatic settings.

Use `npm run tracking:review-context -- --url <exact approved public URL>` to collect a blocked-network candidate. It does not grant consent or approve the page. A changed document or product set needs a fresh review. Do not use the tool to sanitize a private URL into a public source.

Before production activation, complete an explicitly permitted integration using a **distinct non-production dataset** with allowed test data. Record request attempted, API response, actual visibility in the intended dataset and provider deduplication separately. A `test_event_code` alone is not isolation. No such external integration was executed in this phase.

### Browser Pixel activation

Only after explicit authorization, the release operator sets the following in the protected environment of each application process and applies the approved process restart procedure:

```dotenv
META_ENVIRONMENT=production
META_RUNTIME_ENABLED=true
META_PIXEL_ENABLED=true
META_CAPI_ENABLED=false
TRACKING_ISOLATION_READY=true
```

The reviewed manifest must separately have `runtimeEnabled:true`, `pixelEnabled:true`, `capiEnabled:false`, `isolationReady:true` and all applicable approvals. Its approved `source.pixelId` must match the selected production `NEXT_PUBLIC_META_PIXEL_ID`. `NODE_ENV` must be `production`. These settings do not authorize every route or event. Keep browser Purchase and InitiateCheckout excluded; private pages never load Pixel. No AddToCart is externally reported merely because a customer clicked a public handoff link.

Observe one permitted event in the intended production dataset using permitted data and document its opaque ID and actual context. Until that observation, report configuration/attempt status only, not “Meta Pixel active.”

### Optional CAPI activation

Review and authorize CAPI separately. Starting from Stage 1, CAPI-only activation requires the following in **both the application and worker protected environments**:

```dotenv
NODE_ENV=production
META_ENVIRONMENT=production
META_RUNTIME_ENABLED=true
TRACKING_ISOLATION_READY=true
META_CAPI_ENABLED=true
META_PIXEL_ENABLED=false
```

Application enablement is necessary for consent capture and enqueue; enabling only the worker is insufficient. Each process must select the same approved production destination and current policy. The manifest must separately set `runtimeEnabled:true`, `isolationReady:true`, `capiEnabled:true`, `pixelEnabled:false` and contain the reviewed server route/event/field/matching approvals. Current consent, valid private destination credentials and a supported Graph version remain prerequisites. Keep Pixel false unless it was separately authorized. Start only the dedicated worker with approved paths/user/environment; retain original event IDs and occurrence times across retries.

Do not replay historical, pre-consent, suppressed, expired or unapproved records. Runtime enablement does not make existing records eligible. New private commerce normally lacks valid `_fbp`/`_fbc`; do not manufacture a match or substitute a landing URL. Guests remain excluded and `codDefinition` remains `disabled`. OrderPlaced is internal only.

## Immediate disable

Run as the policy file owner from the approved release directory, with `META_POLICY_FILE` already supplied by the protected operational environment:

```sh
npm run tracking:disable -- --policy-file "$META_POLICY_FILE"
```

This local command atomically replaces that manifest with `runtimeEnabled:false`, preserving all other decisions. It never loads `.env`, contacts Meta or prints the file contents. Run it for **every distinct app/worker manifest copy**; confirm every process sees the disabled effective policy. Avoid concurrent policy edits. The absolute regular-file target must be owned by the executing user and its directory writable.

Also set `META_RUNTIME_ENABLED=false`, `META_PIXEL_ENABLED=false`, `META_CAPI_ENABLED=false`, `META_ENVIRONMENT=disabled` in the protected process environment and use the approved process-manager stop/restart procedure. Stop only the dedicated marketing worker; never `pm2 stop all`, delete orders or reverse the schema.

Current public documents poll policy every five seconds and recheck before dispatch and after SDK loading; workers recheck before sending each record. Revoke consent and replace/reload an already active document to remove its executed SDK. A file change cannot recall an already-sent request, and polling is not instantaneous. Acknowledged requests do not become eligible for replay after a later grant.

Exercise the disable command and process stop on staging before any activation. Confirm subsequent browser/server attempts cease, commerce remains available, old guest receipts still work and the stopped worker does not resume when its host restarts. Keep the manifest denied through rollback.
