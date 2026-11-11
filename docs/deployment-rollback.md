# Deployment rollback and tracking shutdown

For the existing-domain public CAPI channel selected on 11 November, stop
delivery with `META_PUBLIC_CAPI_ENABLED=false` and the approved app restart, or
run `npm run tracking:disable -- --policy-file` with the explicit absolute
`META_PUBLIC_CAPI_POLICY_FILE` path. Preserve `META_PIXEL_ENABLED=false` and
`META_TRACKING_MODE=server-only`; this mode denies the legacy browser/order
policy independently. No database restore or worker action is needed for this
public PageView channel. Process restart invalidates active grants and requires
fresh visitor consent. See [the current contract](tracking-activation.md).

The 11 November deployment backup is
`/var/www/bangbuy/backup/capi-deployment-20261111T084538Z`. It retains the prior
compiled build `o1Un88f11e6voepMO5vuC`, environment and PM2 dump; source was
`3c8e4dc`. The failed first build automatically restored that compiled artifact
and HTTP 200 before the corrected build was retried. The active build is
`n-4AgKJxU_8uWyeUFikFo` from application/build-fix commits `1e32452` / `4ef4f9b`.
Keep recovery snapshots excluded from source checks; do not remove the backup
exclusion or point Next's normal build output at a saved tree. This recovery
proof does not establish a database restore or provider-payment test.

Updated 10 November 2026. The authorized in-place build/restoration completed in `/var/www/bangbuy`; only PM2 `bangbuy` was restarted. Prisma generation and the production build passed, PM2 reported online, both existing domains returned 200 and the effective tracking policy remained disabled. No DNS, Nginx or database migration change was performed. See the [deployment record](deployment-runbook.md) for build identity and evidence; the later origin cutover remains subject to [the blocker matrix](deployment-blockers.md).

## One-directory recovery

Keep `/var/www/bangbuy` as the single real application directory and `bangbuy` as the sole BangBuy PM2 app. `BANGBUY_RELEASE_ROOT` means that application root; it does not imply a second checkout or live-directory symlink. Preserve prior source/build files as protected backup archives, then restore them into the same directory if recovery is required. Do not switch the live path to `/var/www/bangbuy-releases`, create another BangBuy PM2 app or start the optional marketing worker. Other VPS applications remain separate and unchanged.

The obsolete `/var/www/bangbuy-releases` path was removed after its contents were archived and compared with the originals. The private archive and SHA256 proof are under `/var/www/bangbuy/backup/maintenance-20261110T095353Z`; an empty working-directory inode was preserved there for an already-open shell. `.next` and the generated Prisma client are now real directories within the application. The backup is private and Git-excluded; its existence alone does not establish compatibility or a runnable rollback.

For an in-place rollback, keep only `bangbuy` stopped while restoring source, dependencies and `.next`; do not let a running Next process read partially replaced assets. Preserve the current protected environment, persistent uploads and databases. Validate the restored artifact's `.next/BUILD_ID`, dependency/runtime compatibility and disabled marketing configuration, then restart only `bangbuy` through the verified existing daemon and check both legacy hosts. If no compatible build is available, retain the backup and diagnose/build in the same directory rather than claiming an archive restore has recovered service. No DNS, Nginx change or database migration is part of the present recovery authorization.

## Stop optional delivery first

For unintended delivery, consent/policy failure or isolation uncertainty, disable runtime through the authorized operator. The prepared command atomically writes `runtimeEnabled:false` while preserving every other manifest decision:

```sh
npm run tracking:disable -- --policy-file /absolute/protected/meta-policy.json
```

Use the confirmed application release, protected regular policy file and existing account; never substitute an unrelated file or publish its contents. Verify the policy response is disabled on both origins and that application polling and the worker observe it. Stop only the confirmed marketing worker if it cannot read the disabled policy. Do not restart all PM2 processes or alter unrelated apps. The command is an operational mutation requiring the corresponding incident/release authority, not something performed by this preparation.

Disabling cannot retract previously sent provider events. The application quarantines/reloads an already loaded public SDK document on policy/consent/context invalidation; verify actual browser behavior and no new delivery. Keep private pages SDK-free throughout. Preserve redacted event IDs and failure codes for diagnosis; do not log customer fields, credentials, URLs containing order IDs or full outbox payloads. Never retry a denied event under a fabricated identity/source.

## Before the release

Record the prior deployable artifact hash, lockfile, schema/client compatibility, build ID actually served, protected environment revision, explicit BangBuy PM2 owner/home/name/Node/listener and the exact Nginx files/includes changed. The directory and PM2 ID were confirmed on 10 November, but do not prove a prior build's source provenance; the October record reported checkout/build mismatch. Keep a verified source/build backup archive that can be restored into `/var/www/bangbuy` rather than relying on `git checkout` in a dirty live directory. No second active directory or symlink swap is required. Retain customer-state and database backup/restore evidence, upload configuration and certificate paths separately with their normal access controls.

Maintain both legacy origins without unsafe redirects, cookie Domain changes or shared credential CORS. A deployment that rejects www cannot be considered recoverable merely because apex loads. Define the maximum disruption/recovery time and who can revert each component. Record Nginx syntax validation and selected process rollback commands using actual confirmed paths before approving deployment.

## Application and proxy rollback

Trigger rollback for missing/wrong customer state, unauthorized receipt access, payment-return failure, private API exposure, wrong served build/configuration, failed health checks or material commerce failures. Tracking remains disabled during every step.

1. Pause the release and preserve the bounded failure report. Ensure the optional worker cannot deliver; do not delete or replay its outbox as an emergency shortcut. Keep the previous and failed artifacts available for diagnosis.
2. For a future release that actually changes proxy configuration, restore only its **known-good BangBuy-only** proxy files through the separately authorized procedure. Restore the prior application artifact/private environment revision into the same `/var/www/bangbuy` directory with only `bangbuy` stopped; no second checkout or symlink swap. The present build/restoration authorizes no proxy change. Coordinate any later origin rollback with the pretested host compatibility plan so no public document serves private state. Do not remove or repurpose a legacy hostname, install a global default vhost, change unrelated site includes, rotate session secrets or broaden cookies/CORS.
3. Run the confirmed Nginx binary's syntax test before an authorized reload. Reload only after validation. Use the named BangBuy PM2 process and existing daemon/account; never `restart all`, `kill` the shared daemon or initialize another `PM2_HOME`. The prepared ecosystem is an eventual release candidate, not proof the historical process can already be replaced. Confirm the actual served build ID matches the rollback artifact after the selected process changes.
4. Verify apex **and** www with existing synthetic cart/session/guest-order fixtures and payment sandbox bookmarks, plus locale, stock/pricing, Buy now, checkout, order access and authoritative payment status. Check no-store/no-referrer/private CSP, expected private API denial and absence of Meta requests. Preserve bounded service/DB status without customer row data. Do not clear browser cookies/local storage to make a failing preservation check pass.
5. Keep the fresh catalog host untracked. If reverting to an older artifact that contained legacy Meta bootstrap, explicitly remove/disable that sender in a reviewed rollback artifact before serving it; returning the old code without its own kill switch can reintroduce delivery. Verify actual network absence instead of assuming the new policy endpoint controls old code.

No automated destructive restore command is supplied. The application root and PM2 app are now confirmed, but the operator must attach the exact compatible archive, environment revision, restore exclusions and timing before restoring files in place. Use the [GET-only checker](../scripts/deploy/healthcheck.mjs) for a configured two-origin artifact; the current origin-unconfigured recovery or a legacy rollback may intentionally lack that contract, so check actual process/HTTP health and disabled delivery separately rather than treating a failed two-origin check as a completed recovery.

## Database and worker recovery

The migration adds ancillary consent/outbox tables and preserves existing commerce columns. Prefer rolling back the application while retaining the additive tables and their records, after the documented old-client compatibility check. Stopping optional delivery does not require dropping tables, deleting consent, clearing outbox rows or rewriting the immutable migration checksum. Do not run `migrate reset` or blindly mark failed migrations applied.

Follow [database and worker operations](deployment-database-and-worker.md) for partial DDL failure, migration bookkeeping, worker lease recovery and restore validation. A production database restore is a separate incident decision: a backup predates later orders/payments/stock changes and can lose them. Identify the approved recovery point, stop conflicting writers through the established incident process, reconcile provider-confirmed payments and later orders, and validate the restored target before resuming commerce. No production backup or restoration was tested in this workspace; the successful dump/restore proof used only synthetic disposable data.

After recovery, keep all tracking flags disabled. Retry release or activation only after the specific failure is explained, the blocker matrix updated and the corresponding new release/channel authorization recorded.
