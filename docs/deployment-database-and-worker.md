# Database and conversion worker deployment

This is a preparation runbook. Production backup, migration, process changes and delivery activation have not been authorized or performed. Follow the main deployment runbook and [blocker matrix](deployment-blockers.md) for the application, host and two-origin cutover. Tracking remains disabled during the first deployment. Browser Pixel and server CAPI require separate later approval and their own prerequisites; starting a disabled worker does not approve either channel.

## Evidence and limits

On 10 November 2026, disposable PostgreSQL 18.6 at `127.0.0.1:56543` received all 15 repository migrations from an empty database. Guarded status found no pending migrations, failed migrations or checksum mismatches. A Prisma client generated from the prior `5af9e07` schema read and updated a synthetic order after the additive migration; the current client read the same order and a new ancillary outbox relation. This verifies local schema/client compatibility, not a rollback of the production application or its host configuration.

A real custom-format `pg_dump` archive was restored to a different empty disposable database with `pg_restore --single-transaction --exit-on-error`. All 15 migration records/checksums matched. Synthetic user, order, monetary amount and internal outbox records survived the round trip. The archive and JSON proofs were created with mode `0600` under a temporary private directory. No production data was copied.

The focused conversion suites passed 33 tests: 20 unit/controlled HTTP tests and 13 actual PostgreSQL tests. Coverage includes authoritative payment callback/status convergence, concurrent worker claims, savepoint failure isolation, retry/backoff/expiry classification, withdrawal and runtime disablement. One real child process was killed with `SIGKILL` after committing a claim. A new worker process recovered the same event ID and original time after only its synthetic lease was aged, and the disabled runtime suppressed the event without HTTP delivery. The live two-minute lease was not bypassed by an immediate second claim. Seven standalone operations tests verify target guards, redaction, private environment handling and the PM2 declaration. HTTP adapters in tests use intercepted synthetic responses; no event was sent to Meta.

Current SSH authentication failed, so production PostgreSQL version, migration history, database size/backup policy, role permissions, Node binary, PM2 account and current processes remain unverified. Historical documentation identifies `/var/www/bangbuy`, root-owned PM2 7.0.4 under `/root/.pm2`, process name `bangbuy`, and nginx proxying to `127.0.0.1:3000`; these are inventory leads, not current deployment facts. No local PM2 executable was available. The declaration was validated against a temporary Unix socket, and real worker process restart/recovery was tested directly; actual PM2 autorestart, log rotation and host reboot restoration still require operator verification on the confirmed manager.

## Migration shape and compatibility

`20261110000000_marketing_conversion_outbox` creates only `MarketingConsent`, `MarketingOrderConsent` and `MarketingConversionOutbox`, their indexes/checks, and foreign keys to existing orders and new consent records. It changes no existing order/payment/customer columns and performs no historical backfill. Existing Prisma clients do not request the new relations. New optional writes use a PostgreSQL savepoint; an unavailable marketing table or insert failure rolls back to that savepoint so the surrounding order/payment transaction can continue. This fallback preserves commerce, but can lose the optional event and emits only `OPTIONAL_WRITE_UNAVAILABLE`. Deploy the schema before new application code and workers; do not use this fallback as the rollout plan.

The SQL file is intentionally left byte-for-byte unchanged. It contains no enclosing `BEGIN`/`COMMIT`; PostgreSQL statements can leave partial DDL if a later statement fails. Prisma's advisory lock serializes migration runners but is not an enclosing transaction for this file. New foreign keys can briefly acquire locks on the existing order table even though the new tables are empty. Use the approved maintenance window, inspect existing long transactions and agree a lock/statement timeout strategy with the database operator. Do not launch simultaneous migration runners.

The installed Prisma version is **7.9.1**. This repository uses `prisma migrate status` and `prisma migrate deploy`, with `prisma.config.ts` preferring `DIRECT_URL` to bypass pooled session locks. Do not substitute commands from a different major version. `npm ci` runs `postinstall: prisma generate`; explicitly generate again after checking out the final schema if the installation preceded it. `migrate deploy` applies every pending migration, not just the new outbox migration. Any unexpected earlier pending migration or checksum discrepancy must be reviewed before proceeding.

## Local-only operations tool

`scripts/deploy/database-ops.mjs` supports `plan`, `status`, `backup` and `restore-validation`. It reads only explicit `DATABASE_OPERATIONS_URL`; it never reads application `.env`, `DATABASE_URL`, `DIRECT_URL` or inherited libpq destination settings. It refuses non-loopback hosts, the documented production tunnel port `15432`, and database names outside `bangbuy_*test` / `bangbuy_*restore_validation`. These guards reduce accidental targeting; they do not prove an arbitrary loopback listener is local, so use a disposable instance you created and verified. This tool deliberately cannot perform production operations.

All actions default to a dry run. Execution additionally requires the exact redacted target string. Set `BANGBUY_PG_BIN` to the absolute directory of an appropriate PostgreSQL client installation when it is absent from `PATH`:

```sh
export DATABASE_OPERATIONS_URL='postgresql://test_user@127.0.0.1:56543/bangbuy_deployment_test'
node scripts/deploy/database-ops.mjs status
node scripts/deploy/database-ops.mjs status --execute --confirm-target '127.0.0.1:56543/bangbuy_deployment_test'
node scripts/deploy/database-ops.mjs backup --archive /absolute/private/synthetic.dump --execute --confirm-target '127.0.0.1:56543/bangbuy_deployment_test'
export DATABASE_OPERATIONS_URL='postgresql://test_user@127.0.0.1:56543/bangbuy_deployment_restore_validation'
node scripts/deploy/database-ops.mjs restore-validation --archive /absolute/private/synthetic.dump --execute --confirm-target '127.0.0.1:56543/bangbuy_deployment_restore_validation'
```

Create the source and empty destination independently on the disposable server; the tool creates or drops no database. Backup refuses overwrite, validates the archive table of contents and records its SHA-256, size and migration history in a private manifest. Restore validation requires the manifest/hash, a different destination ending `_restore_validation`, and an empty destination. It restores inside a transaction and then checks applied migration history/checksums. It does not certify arbitrary application data invariants: separately inspect synthetic cart/order/payment/stock fixtures and required extension/role compatibility. A nonzero result is `completed:false`; it never falsely promises the preceding operation was undone.

Run the guards without a database, and opt into real synthetic integration only with the dedicated local fixture:

```sh
node --test tests/deployment-operations.mjs
MARKETING_TEST_DATABASE_URL=postgresql://test_user@127.0.0.1:56543/bangbuy_marketing_test npm test -- __tests__/marketing-outbox-database.test.ts __tests__/marketing-conversions.test.ts
```

The test runner deletes synthetic orders/outbox rows in `bangbuy_marketing_test`. Do not run another suite or application against that same database concurrently. It never falls back to the application database URL.

## Approved production backup and status procedure

The following commands are a manual operator procedure after separate production authorization and current read-only inventory. They were not executed here. Confirm the actual database hostname/port/name/role, direct connection, server/client versions, free space, encrypted backup location, retention and restoration permissions. Use the existing protected secret mechanism; do not copy credentials into the repository, terminal history, PM2 declarations or reports.

In a private shell owned by the confirmed deployment account, load a reviewed **shell-compatible** owner-only environment file outside the release tree. It must supply `DATABASE_URL`, `DIRECT_URL` and libpq `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSFILE` (or the existing equivalent protected credential mechanism), with the libpq destination matching `DIRECT_URL`. `PGPASSFILE` must be owner-only. Do not source an arbitrary dotenv file as shell code. Disable shell tracing. The release, Node and backup paths below must already be confirmed absolute paths:

```sh
set -euo pipefail
set +x
umask 077
: "${BANGBUY_RELEASE_ROOT:?confirmed release directory required}"
: "${BANGBUY_NODE_BINARY:?confirmed Node binary required}"
: "${BANGBUY_MIGRATION_ENV_FILE:?reviewed private shell environment required}"
: "${BANGBUY_BACKUP_ARCHIVE:?new absolute private archive path required}"
. "$BANGBUY_MIGRATION_ENV_FILE"
: "${DATABASE_URL:?}" "${DIRECT_URL:?}" "${PGHOST:?}" "${PGPORT:?}" "${PGDATABASE:?}" "${PGUSER:?}" "${PGPASSFILE:?}"
export DATABASE_URL DIRECT_URL PGHOST PGPORT PGDATABASE PGUSER PGPASSFILE
cd "$BANGBUY_RELEASE_ROOT"
psql -X --set=ON_ERROR_STOP=1 --command 'SELECT current_database(), current_user, inet_server_addr(), inet_server_port(), version();'
if "$BANGBUY_NODE_BINARY" node_modules/prisma/build/index.js migrate status; then
  printf '%s\n' 'Migration history reports up to date; review the output before continuing.'
else
  printf '%s\n' 'Nonzero status: operator must distinguish reviewed pending migrations from failure before any next step.' >&2
fi
psql -X --set=ON_ERROR_STOP=1 --command 'SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY migration_name;'
"$BANGBUY_NODE_BINARY" --input-type=module -e "import {migrationFileChecksums} from './scripts/deploy/database-ops.mjs'; console.info(JSON.stringify(migrationFileChecksums()))"
pg_dump --version
pg_restore --version
```

Stop here for manual review. Compare the displayed database identity to the separately approved target and each applied database checksum to its local SQL checksum. Prisma `migrate status` exits nonzero for expected pending migrations as well as failures; the conditional preserves the diagnostic instead of aborting solely because the outbox migration is pending. Only an explicitly reviewed list of expected pending migrations may proceed. Failed/unexpected migrations, checksum differences, connectivity errors, or wrong identity stop this procedure before backup/mutation. Migration output can identify a database hostname/name; retain it only in the private deployment record. Configure a verified destination SSL mode and trust root appropriate to the real database; do not weaken its current transport security for these commands. Confirm the dump utility supports the server major version.

Use a new archive path in the protected backup directory. Preserve its hash and table of contents, then copy/encrypt it through the existing approved off-host backup process. Do not claim that a local file alone satisfies disaster recovery:

```sh
test ! -e "$BANGBUY_BACKUP_ARCHIVE"
test ! -e "$BANGBUY_BACKUP_ARCHIVE.sha256"
test ! -e "$BANGBUY_BACKUP_ARCHIVE.toc"
pg_dump --format=custom --no-owner --no-acl --file "$BANGBUY_BACKUP_ARCHIVE"
chmod 600 "$BANGBUY_BACKUP_ARCHIVE"
pg_restore --list "$BANGBUY_BACKUP_ARCHIVE" > "$BANGBUY_BACKUP_ARCHIVE.toc"
sha256sum "$BANGBUY_BACKUP_ARCHIVE" > "$BANGBUY_BACKUP_ARCHIVE.sha256"
```

Custom `pg_dump` provides a consistent logical snapshot of one database. It does not provide point-in-time recovery, subsequent orders, database cluster roles/global settings, uploaded product files, object storage, TLS material or application secret files. Inventory and protect those through the existing backup policy. Record snapshot time and approved recovery-point objective. A backup is not validated until restored and checked under the real server extensions/role requirements in a separate controlled validation database. A production-data validation restore contains customer information and requires the same access/retention controls as the source.

For that separately approved validation restore, set libpq destination variables to the **different, newly created empty validation database**. Independently recheck its identity and emptiness; never reuse the production destination. `--no-owner --no-acl` requires the operator to reapply the intended runtime privileges after restoration. Run:

```sh
psql -X --set=ON_ERROR_STOP=1 --command 'SELECT current_database(), current_user, inet_server_addr(), inet_server_port();'
psql -X --set=ON_ERROR_STOP=1 --command "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema');"
sha256sum --check "$BANGBUY_BACKUP_ARCHIVE.sha256"
pg_restore --dbname "$PGDATABASE" --single-transaction --exit-on-error --no-owner --no-acl "$BANGBUY_BACKUP_ARCHIVE"
```

Inspect restored migration names/checksums, order/payment/item counts, guest ownership/access metadata, stock reservations, totals/currencies, and referential integrity without exporting row-level customer values. Check that the intended application role can read/write necessary commerce tables, and the worker can access only its required tables. Preserve a redacted restore report. Reset all database environment variables back to the approved **production** connection and independently recheck identity before the migration step below; never infer the target from an earlier terminal command.

## Migration rollout and partial failure

After a successful, recoverable backup and final approved diff/status review, generate the release client and apply pending migrations once from the confirmed release directory using explicit protected runtime/direct URLs:

```sh
"$BANGBUY_NODE_BINARY" node_modules/prisma/build/index.js generate
if "$BANGBUY_NODE_BINARY" node_modules/prisma/build/index.js migrate status; then
  printf '%s\n' 'Review the up-to-date history before deployment.'
else
  printf '%s\n' 'Review required: expected pending migrations and errors both return nonzero.' >&2
fi
```

Stop at this checkpoint and classify the output. Proceed to the separate mutation block only after confirming the approved target and exact expected pending list, with no failed migration, unexpected baseline, checksum discrepancy or connection failure. Do not mask the result with `|| true` or treat every nonzero status as permission to deploy:

```sh
"$BANGBUY_NODE_BINARY" node_modules/prisma/build/index.js migrate deploy
"$BANGBUY_NODE_BINARY" node_modules/prisma/build/index.js migrate status
```

These are production mutations; do not run them during read-only preparation. Keep the old application running only if its currently applied migration baseline and compatibility have been reviewed; a maintenance window may still be required for the broader two-origin cutover. Release the disabled application after the schema succeeds, validate commerce, then start the disabled worker after its private configuration validates. Check `_prisma_migrations`, new tables/indexes/constraints and worker status. Retain the previous release and private configuration for rollback.

If deployment fails mid-migration, leave all tracking off and stop rollout. Keep the Prisma error/private migration log, inspect `_prisma_migrations.finished_at`, `rolled_back_at`, and the exact tables/indexes/constraints that exist. Do not edit the SQL checksum, blindly rerun DDL, run `migrate reset`, or mark the migration applied just to clear the error. An operator must compare actual objects against the immutable migration and prepare one reviewed recovery:

- Complete and verify the missing DDL, preserving existing data, before `prisma migrate resolve --applied 20261110000000_marketing_conversion_outbox` is justified.
- Or, only if the new objects are proven unused and their removal is separately authorized, undo the precise partial additions, preserve the failure evidence, and use `prisma migrate resolve --rolled-back 20261110000000_marketing_conversion_outbox` before a reviewed retry.

Those resolve commands change migration bookkeeping, not schema; neither repairs missing DDL. They are not automated here. Prefer a reviewed forward repair if any application/consent/outbox data exists. A broader baseline mismatch or earlier failed migration requires its own analysis. Emergency restore of production is a separate incident action described below.

## Existing-manager worker configuration

Reconfirm the running PM2 user, live `PM2_HOME`/daemon socket, absolute Node binary and application release before invoking PM2. Run through that account's existing daemon; do not create a second root/user PM2 daemon or new systemd service. The checked-in [worker declaration](../deploy/pm2/marketing-worker.config.cjs) requires absolute `BANGBUY_RELEASE_ROOT`, `BANGBUY_NODE_BINARY`, `BANGBUY_WORKER_ENV_FILE`, `BANGBUY_WORKER_LOG_DIRECTORY` and `PM2_HOME`. Confirm its socket is live and owned by the intended account; the template's socket existence check alone cannot prove daemon identity. No current PM2 ID is hardcoded.

The worker must run under a confirmed nonroot identity with the required database grants. If the existing PM2 daemon is root-owned, the declaration requires explicit confirmed nonzero numeric `BANGBUY_WORKER_UID` and `BANGBUY_WORKER_GID` and passes them through PM2's documented `uid`/`gid` fields. It otherwise uses the existing nonroot manager's identity and refuses a conflicting supplied UID/GID. No account is created and no identity is guessed. Confirm supplementary groups, release/module readability, policy readability and private environment/log ownership for the actual child identity before starting it. Keep these files and database grants separate from unrelated VPS applications. Root remains capable of reading child secrets; this is not isolation from the host administrator. Privilege dropping and permissions were not exercised on the unverified production manager and remain release prerequisites.

The worker runs TypeScript through release-local `tsx` and uses `dotenv` to read its protected file. Both are now runtime dependencies with unchanged locked versions, along with the generated Prisma client and PostgreSQL adapter. Use the full installation for build, client generation, migration CLI and tests; a reviewed post-build production prune can retain the launcher runtime packages. An actual pruned release installation was not exercised during preparation, so validate the final artifact and local module resolution before deployment. Do not install global substitutes or let PM2 resolve a different release's modules. The preflight below checks local resolution.

Create the external private worker file from [the disabled example](../deploy/pm2/marketing-worker.env.example); assign its real runtime database URL privately. It must be a regular file owned by the nonroot worker UID, mode `0600`, outside the release directory and at most 128 KiB. Its missing runtime/server flags default false. The launcher removes inherited tracking/database configuration, loads this file internally and pins `DOTENV_CONFIG_PATH` to it. It never loads app `.env`. The Pixel flag is always false for this server process. PM2 stores only the file path in its declaration, not the file's credentials. Use private logs owned by that worker identity and review the existing daemon's saved-environment permissions as well.

Invoke the manager from a separate clean shell with only confirmed nonsecret PM2/BangBuy metadata. PM2 may otherwise persist secrets inherited from the caller's environment. Do not reuse the production migration shell or export the worker file before PM2 startup; the launcher loads those values only inside the child process.

After paths and a live manager are confirmed, export any required `BANGBUY_WORKER_UID`/`BANGBUY_WORKER_GID` as the operator-confirmed nonzero values. Validate the launcher as the actual worker identity without database access, validate the declaration as the existing manager's owner before any PM2 invocation, and read grouped worker status as the worker identity. If these are different accounts, use the host's existing approved identity-switch mechanism; do not run the direct worker CLI as root simply because the manager is root-owned:

```sh
cd "$BANGBUY_RELEASE_ROOT"
export BANGBUY_RELEASE_ROOT BANGBUY_NODE_BINARY BANGBUY_WORKER_ENV_FILE BANGBUY_WORKER_LOG_DIRECTORY PM2_HOME
"$BANGBUY_NODE_BINARY" -e "require.resolve('tsx'); require.resolve('dotenv'); require.resolve('@prisma/adapter-pg')"
"$BANGBUY_NODE_BINARY" scripts/deploy/worker-launcher.mjs --validate
"$BANGBUY_NODE_BINARY" -e "require('./deploy/pm2/marketing-worker.config.cjs')"
"$BANGBUY_NODE_BINARY" --conditions=react-server --import tsx scripts/deploy/worker-launcher.mjs --status
```

Starting or restarting the production worker requires the separately authorized deployment step, using the confirmed installed PM2 executable:

```sh
pm2 start deploy/pm2/marketing-worker.config.cjs --only bangbuy-marketing-worker
pm2 describe bangbuy-marketing-worker
pm2 logs bangbuy-marketing-worker --lines 20 --nostream
```

The declaration uses one fork, automatic restart, a 5-second restart delay, at most 10 unstable restarts, one record per batch, a 5-second polling interval and a 30-second stop grace period. HTTP timeout is 10 seconds; a hung database can still exhaust the stop grace and leave a recoverable two-minute lease. In the disabled stage, eligible pending/retry rows are terminally suppressed rather than delivered; do not introduce historical rows to test startup. Verify host log files/directories and any PM2 saved process dump are private. Use the existing approved rotation/retention mechanism; this template installs none. Do not run `pm2 save` or change startup/reboot settings without checking the existing deployment convention and reviewing every process that would be persisted.

Verify the actual manager restarts this worker after a controlled crash using only a synthetic staging database and no real external delivery. Confirm grouped status, unchanged event ID/time, exclusion during the live lease, recovery after expiry, and no duplicate in-flight claims. The local process smoke validates those persistence properties but does not replace this manager/host verification. Do not test a destructive crash on the shared web process or run multiple workers merely to test concurrency against live customers.

## Runtime stop and rollback

First atomically disable the shared policy, then stop the worker through the confirmed manager. The emergency helper validates the owned regular policy file and writes `runtimeEnabled:false` atomically:

```sh
npm run tracking:disable -- --policy-file /absolute/confirmed/shared-policy.json
pm2 stop bangbuy-marketing-worker
```

Check every application/worker instance observes the same disabled file and verify private-page CSP/SDK isolation. This stops new dispatches after their runtime checks; it cannot recall an already accepted request. Delivery is at least once: a crash after provider acceptance and before durable acknowledgement may resend the same UUID/time, which supports provider deduplication. Do not claim exactly-once delivery.

For application rollback, keep tracking disabled and the worker stopped, restore the previous **compatible** release/configuration through the existing PM2/nginx release procedure, then verify commerce/auth/payment callbacks. Retain the three additive tables and migration record. Do not drop them or reset delivered/revoked/expired states. Rolling back the former single-origin application is a separate privacy/traffic decision: its old Pixel configuration must remain off, and its URLs/auth/payment callbacks must be compatible with the current two-origin cutover. A database-compatible old client alone does not establish that whole-system rollback.

A production database restore is an incident action only after explicit authorization and an agreed recovery point. Stop or drain all confirmed writers and worker processes and handle provider callbacks/queued jobs according to the incident plan; stopping nginx alone does not stop background writers. Preserve a fresh forensic backup and determine which orders/payments arrived after the snapshot before overwriting anything. Prefer restoration to a separate database, validate it, and switch the approved connection under controlled downtime. Never silently erase later commerce records to undo this additive migration. Reconcile provider settlements and stock before reopening traffic. Cluster roles, uploads and other omitted assets need their own recovery procedures.

## Delivery eligibility after deployment

Leave `META_ENVIRONMENT=disabled`, `META_RUNTIME_ENABLED=false`, `META_CAPI_ENABLED=false` and the shared policy runtime flag false in stage 1. Later CAPI approval requires current route/product/context manifests, registered-user consent on the actual commerce origin, truthful source URL, individually approved user agent and at least one real approved `fbp`/`fbc`, private credentials and a supported explicitly chosen Graph version. Staging additionally requires a distinct test Pixel and test-event code. A fresh commerce origin normally has no attribution cookie; private conversion delivery therefore remains blocked. Do not transfer public cookies or fabricate identifiers to make a test pass.

Guest orders remain internal OrderPlaced only under the existing privacy contract. COD Purchase is disabled. AddToCart committed on the private surface is not externally reported. Enabling CAPI does not enable browser Pixel, guest profiling, historical backfill, reset of terminal states, or manual replay. Investigate fixed failure codes with redacted grouped status; never print raw payloads, matching values, source URLs, credentials or provider response bodies.

Primary references: [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html), [PostgreSQL pg_restore](https://www.postgresql.org/docs/current/app-pgrestore.html), [Prisma v7 deployment workflow](https://github.com/prisma/web/blob/main/apps/docs/content/docs/orm/v7/prisma-migrate/workflows/development-and-production.mdx), [Prisma failed-migration recovery](https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing), and [PM2 ecosystem attributes including uid/gid](https://pm2.keymetrics.io/docs/usage/application-declaration/). Use the installed version's help before adapting operational commands.
