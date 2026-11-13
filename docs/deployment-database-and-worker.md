# Database deployment and retired tracking data

The repository retains historical migrations and adds `20261112000000_remove_meta_tracking`. No live database operation is performed by source changes. Confirm the exact target, migration history, restorable backup and approved maintenance window before a deployment.

## Tracking removal migration

The new migration drops `MarketingConversionOutbox`, `MarketingOrderConsent` and `MarketingConsent` in dependency order. Their stored tracking/consent records are permanently deleted. Existing commerce tables and their records remain intact. The previous creation migration stays unchanged so existing migration checksums and fresh installations remain valid.

Stop any previously deployed conversion worker and remove its saved process-manager restart entry before applying the migration. Deploy the application without tracking hooks; do not serve an older tracking-dependent artifact against the removed tables. Remove obsolete worker credentials/configuration privately during deployment. The repository no longer provides a worker launcher or process declaration.

Prisma 7 uses the repository's `prisma.config.ts`, which prefers `DIRECT_URL` for direct migration access. Generate the client from the final schema. `prisma migrate deploy` applies every pending migration, so review all earlier pending migrations and any checksum discrepancies first. Do not run simultaneous migration runners.

## Guarded local operations

`scripts/deploy/database-ops.mjs` supports `plan`, `status`, `backup` and `restore-validation`. It reads only explicit `DATABASE_OPERATIONS_URL`; it never falls back to application `.env`, `DATABASE_URL`, `DIRECT_URL` or inherited libpq destinations. It accepts named disposable loopback databases and refuses production tunnel port 15432. Independently verify the listener you created; a loopback address alone does not prove isolation.

Actions default to dry run. Execution also requires the exact redacted target. Set `BANGBUY_PG_BIN` to an absolute PostgreSQL client directory if those binaries are absent from PATH.

```sh
export DATABASE_OPERATIONS_URL='postgresql://test_user@127.0.0.1:56543/bangbuy_deployment_test'
node scripts/deploy/database-ops.mjs status
node scripts/deploy/database-ops.mjs status --execute --confirm-target '127.0.0.1:56543/bangbuy_deployment_test'
node scripts/deploy/database-ops.mjs backup --archive /absolute/private/synthetic.dump --execute --confirm-target '127.0.0.1:56543/bangbuy_deployment_test'
export DATABASE_OPERATIONS_URL='postgresql://test_user@127.0.0.1:56543/bangbuy_deployment_restore_validation'
node scripts/deploy/database-ops.mjs restore-validation --archive /absolute/private/synthetic.dump --execute --confirm-target '127.0.0.1:56543/bangbuy_deployment_restore_validation'
```

The restore target must be a different empty disposable database. The tool verifies archive identity/hash and restored migration history; it cannot perform production operations. Reports omit connection credentials and raw database failures. Backups and proof files are private, created without overwrite. Preserve them under normal access controls.

## Deployment and recovery

1. Back up the exact approved database through the existing operator procedure. Rehearse restoration into an isolated target and verify migration names/checksums, commerce row counts, ownership/access metadata, stock, totals/currencies and referential integrity without exporting customer values.
2. Reconfirm the production connection privately after any local rehearsal. Stop the retired worker, review pending SQL, permissions and locking, and use the existing controlled migration procedure. No development reset or seeding belongs on production.
3. Verify migration completion and absence of the three retired tables. Start the compatible application and validate order creation, guest receipt access, payment verification/reconciliation and stock updates. Record the artifact and migration revisions.
4. If migration fails, stop rollout and inspect private Prisma logs, `_prisma_migrations` status and actual table/constraint state. Preserve SQL checksums. Do not blindly rerun DDL, mark a failed migration applied or run `migrate reset`. Prepare a recovery from the actual partially applied state.

A production restore can lose later orders/payments/stock changes and requires an incident recovery point, stopped conflicting writers and reconciliation with provider-confirmed payments. Prefer validating a separate restored database before switching an approved connection. Do not restore the whole commerce database solely to recover deleted optional tracking data.

Follow the [deployment runbook](deployment-runbook.md) and [rollback procedure](deployment-rollback.md). Local validation and backup rehearsals do not establish production backup, process or provider health.
