# Deployment checks and unresolved dependencies

Updated 12 November 2026. Tracking removal is a repository change. No live deployment, process stop, database migration or customer-state operation is established by these edits.

| Concern | Required evidence before the corresponding deployment |
| --- | --- |
| Release identity and manager | Confirm current application directory, named process, manager account/socket, Node binary, listener and served build. Preserve a compatible rollback artifact. Historical host details are inventory leads, not current evidence. |
| Retired worker and tracking-table removal | Confirm any deployed conversion worker is stopped and removed from saved restart configuration; back up the exact database; review `20261112000000_remove_meta_tracking` before applying it. It deletes only retired tracking data. |
| Existing apex/www customer state | Keep both legacy hosts usable. Before any later origin split, test each host's cart, session, guest receipt and payment return independently. Redirects do not migrate host-only credentials. |
| Optional catalog/commerce separation | A selected HTTPS catalog host, certificate, strict host routing and legacy-host compatibility are prerequisites. Tracking removal does not require this cutover. |
| Authentication and payment URLs | Preserve protected secrets and existing callback origins. Confirm sandbox launch, delayed callback, cancellation, retry and reconciliation using the actual proxy boundary. |
| Database compatibility | Verify pending migrations/checksums, restorable backup, permissions, lock window and generated client. Preserve immutable migration history. |
| Local checks versus live health | Capture type/lint/catalog/build results for the final artifact, then verify actual served pages, assets, security headers, API isolation and customer journeys after deployment. Local checks do not prove provider callback reachability. |

Use the [deployment runbook](deployment-runbook.md), [environment checklist](deployment-environment.md), [database procedure](deployment-database-and-worker.md), [staging checks](deployment-staging-verification.md) and [rollback procedure](deployment-rollback.md). No independent account, DNS or provider configuration is changed by source cleanup.
