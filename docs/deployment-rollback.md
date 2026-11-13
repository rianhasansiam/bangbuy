# Application deployment rollback

Tracking removal does not perform a live deployment. Prepare recovery using the actual current BangBuy application directory, named process, existing manager account/socket and a verified compatible artifact. Keep source, dependencies and build assets together with their build ID and protected configuration revision.

## Before release

Preserve private database/upload backups and a deployable artifact. Define the recovery point, restore exclusions and acceptable interruption. Keep both legacy apex and www origins usable; retain host-only session/guest cookies and existing payment callbacks. Do not rotate session secrets, broaden cookies/CORS or change unrelated applications during recovery.

Stop any previously deployed conversion worker and remove its saved restart configuration before applying the tracking-table removal migration. Reverting application code must not restart a retired sender. Older artifacts that depend on the deleted tracking tables are not database-compatible rollback targets.

## Application and proxy recovery

1. Pause the release and retain a bounded failure report plus the failed and previous artifacts. Trigger recovery for lost cart/session/guest access, unauthorized receipt access, failed payment return, private API exposure, wrong served build/configuration or material stock/payment failures.
2. Stop only the named BangBuy process before replacing its source/dependencies/build in the existing application directory. Preserve persistent uploads, database contents and protected configuration. Do not create a second manager or restart all applications.
3. If the release changed Nginx, restore only the reviewed BangBuy files and run the confirmed Nginx syntax test before an authorized reload. Coordinate origin changes with the tested legacy-host compatibility plan.
4. Start the verified compatible application through the existing manager. Check the actual served build ID, both legacy hosts, cart/checkout/login, guest receipt authorization, prices/stock, language and authoritative payment status. Preserve restricted CSP, no-store/no-referrer on private pages and private API isolation.

An older artifact may contain removed tracking integrations. Prepare and verify a compatible rollback artifact that preserves removal before serving it. Check actual browser assets/network behavior; no removed API endpoint can control an old artifact.

## Database recovery

`20261112000000_remove_meta_tracking` permanently drops the three retired tracking tables. Applied migration history remains intact. Do not edit old checksums, run `migrate reset`, blindly mark a failed migration applied or recreate tracking data to recover commerce.

A production database restore is a separate incident decision because it can lose later orders, payments and stock changes. Choose the approved recovery point, stop conflicting writers, reconcile provider-confirmed payments and later orders, and validate referential integrity before resuming commerce. Follow the [database procedure](deployment-database-and-worker.md) for target guards and partial-migration diagnosis.
