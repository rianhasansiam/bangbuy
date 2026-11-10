# Deployment rollback and tracking shutdown

This is a reviewed preparation procedure for a later authorized release. No production shutdown, rollback, DNS change, restore or process operation was executed. Current SSH access, previous served artifact provenance and dual apex/www state compatibility remain unresolved; see [the blocker matrix](deployment-blockers.md) and [deployment runbook](deployment-runbook.md). Do not begin Stage 1 without a usable, verified rollback path.

## Stop optional delivery first

For unintended delivery, consent/policy failure or isolation uncertainty, disable runtime through the authorized operator. The prepared command atomically writes `runtimeEnabled:false` while preserving every other manifest decision:

```sh
npm run tracking:disable -- --policy-file /absolute/protected/meta-policy.json
```

Use the confirmed application release, protected regular policy file and existing account; never substitute an unrelated file or publish its contents. Verify the policy response is disabled on both origins and that application polling and the worker observe it. Stop only the confirmed marketing worker if it cannot read the disabled policy. Do not restart all PM2 processes or alter unrelated apps. The command is an operational mutation requiring the corresponding incident/release authority, not something performed by this preparation.

Disabling cannot retract previously sent provider events. The application quarantines/reloads an already loaded public SDK document on policy/consent/context invalidation; verify actual browser behavior and no new delivery. Keep private pages SDK-free throughout. Preserve redacted event IDs and failure codes for diagnosis; do not log customer fields, credentials, URLs containing order IDs or full outbox payloads. Never retry a denied event under a fabricated identity/source.

## Before the release

Record the prior deployable artifact hash, lockfile, schema/client compatibility, build ID actually served, protected environment revision, explicit BangBuy PM2 owner/home/name/Node/listener and the exact Nginx files/includes changed. Historical `/var/www/bangbuy` and PM2 ID 0 are insufficient; the October record reported checkout/build mismatch. Keep an independently runnable prior artifact rather than relying on `git checkout` in a dirty live directory. Retain customer-state and database backup/restore evidence, upload configuration and certificate paths separately with their normal access controls.

Maintain both legacy origins without unsafe redirects, cookie Domain changes or shared credential CORS. A deployment that rejects www cannot be considered recoverable merely because apex loads. Define the maximum disruption/recovery time and who can revert each component. Record Nginx syntax validation and selected process rollback commands using actual confirmed paths before approving deployment.

## Application and proxy rollback

Trigger rollback for missing/wrong customer state, unauthorized receipt access, payment-return failure, private API exposure, wrong served build/configuration, failed health checks or material commerce failures. Tracking remains disabled during every step.

1. Pause the release and preserve the bounded failure report. Ensure the optional worker cannot deliver; do not delete or replay its outbox as an emergency shortcut. Keep the previous and failed artifacts available for diagnosis.
2. Restore the **known-good BangBuy-only** proxy configuration and prior application artifact/private environment revision using the verified existing process manager. Coordinate ordering with the pretested host compatibility plan so no public document serves private state. Do not remove or repurpose a legacy hostname, install a global default vhost, change unrelated site includes, rotate session secrets or broaden cookies/CORS.
3. Run the confirmed Nginx binary's syntax test before an authorized reload. Reload only after validation. Use the named BangBuy PM2 process and existing daemon/account; never `restart all`, `kill` the shared daemon or initialize another `PM2_HOME`. The prepared ecosystem is an eventual release candidate, not proof the historical process can already be replaced. Confirm the actual served build ID matches the rollback artifact after the selected process changes.
4. Verify apex **and** www with existing synthetic cart/session/guest-order fixtures and payment sandbox bookmarks, plus locale, stock/pricing, Buy now, checkout, order access and authoritative payment status. Check no-store/no-referrer/private CSP, expected private API denial and absence of Meta requests. Preserve bounded service/DB status without customer row data. Do not clear browser cookies/local storage to make a failing preservation check pass.
5. Keep the fresh catalog host untracked. If reverting to an older artifact that contained legacy Meta bootstrap, explicitly remove/disable that sender in a reviewed rollback artifact before serving it; returning the old code without its own kill switch can reintroduce delivery. Verify actual network absence instead of assuming the new policy endpoint controls old code.

No automated production restore or fixed unverified shell command is supplied: actual manager, artifact and Nginx paths are not yet verified. The operator must attach those exact reviewed commands and rollback timing to the release record. Use the [GET-only checker](../scripts/deploy/healthcheck.mjs) for the new two-origin artifact; a legacy rollback may intentionally lack its endpoints, so validate that rollback with its separately agreed health contract rather than calling it healthy from a failed new-endpoint test.

## Database and worker recovery

The migration adds ancillary consent/outbox tables and preserves existing commerce columns. Prefer rolling back the application while retaining the additive tables and their records, after the documented old-client compatibility check. Stopping optional delivery does not require dropping tables, deleting consent, clearing outbox rows or rewriting the immutable migration checksum. Do not run `migrate reset` or blindly mark failed migrations applied.

Follow [database and worker operations](deployment-database-and-worker.md) for partial DDL failure, migration bookkeeping, worker lease recovery and restore validation. A production database restore is a separate incident decision: a backup predates later orders/payments/stock changes and can lose them. Identify the approved recovery point, stop conflicting writers through the established incident process, reconcile provider-confirmed payments and later orders, and validate the restored target before resuming commerce. No production backup or restoration was tested in this workspace; the successful dump/restore proof used only synthetic disposable data.

After recovery, keep all tracking flags disabled. Retry release or activation only after the specific failure is explained, the blocker matrix updated and the corresponding new release/channel authorization recorded.
