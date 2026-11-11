# Deployment preparation and controlled release

## Existing-domain public CAPI release — 11 November 2026

The user authorized local changes, GitHub `main` push and an in-place VPS
`git pull` into `/var/www/bangbuy`, using the existing PM2 `bangbuy` app. The
chosen transport is public PageView CAPI on the existing domains; no fresh
catalog hostname is part of this release. Real visitor IP, user agent and
approved public URL were explicitly approved after visitor consent.

The code/build checks are recorded in [verification](deployment-staging-verification.md).
Build in the single application directory with only `bangbuy` stopped; retain
its prior build and protected environment under the private `backup` directory.
Restart the same app with Next listening only on `127.0.0.1:3000` before trusting
Nginx's overwritten `X-Real-IP`. Preserve unrelated PM2 applications. No
database migration, dependency upgrade, DNS change, Nginx rewrite or worker is
needed for this new public channel.

Install a deployment-owned copy of the denied public CAPI manifest with the
exact existing origins and a private signing secret. Keep delivery disabled
until business/source/exact-route review and activation are recorded. Follow
[the new activation contract](tracking-activation.md), not the two-origin
cutover steps retained below. A live event acknowledgement or Events Manager
observation must be recorded separately from successful deployment.

Updated 10 November 2026. The user authorized **building the current code in `/var/www/bangbuy` and restoring only the existing PM2 app `bangbuy`**. Recovery completed with tracking disabled and no DNS, Nginx or database migration changes. Both existing domains returned HTTP 200 afterward. This narrow recovery does not authorize the later two-origin cutover or tracking activation. Those remain subject to [the blocker matrix](deployment-blockers.md).

## Current recovery: one directory and one app

Authorized SSH inspection confirmed the real application directory and PM2 `bangbuy`, ID 0, using `npm start` with Node 22.23.2. It was errored and HTTP returned 502 because `.next` linked into an incomplete old release. The generated Prisma client also linked into that directory. Both links were replaced with real in-place directories; Prisma generation and the production build passed, then only `bangbuy` was restarted. The source revision was `3c8e4dc2788692718f05995e765a7b47a83d8b21`, with build ID `69oEMvtzbwbtGGAob7GU0`.

Post-restoration GET checks passed for English/Bengali home, products, cart, checkout, login and the tracking policy; apex and www home returned 200. Checked private HTML had no Meta bootstrap and retained `no-referrer`; the effective policy reported runtime, Pixel and CAPI disabled. Other PM2 apps retained their PIDs and status. These availability checks did not place a production order, charge a payment or prove provider callbacks or a two-origin migration.

Use `/var/www/bangbuy` as the single application directory. `BANGBUY_RELEASE_ROOT` means **application root**; if the prepared launcher is used, set it to `/var/www/bangbuy` and set `BANGBUY_APP_PROCESS_NAME=bangbuy`. It does not require a releases directory, second checkout, new PM2 app or symlink swap. Keep the existing verified PM2 daemon and startup convention; changing to a prepared ecosystem is not required merely to restore the current app. Leave the optional marketing worker unstarted and CAPI disabled.

Old snapshot/rollback files were preserved in `/var/www/bangbuy/backup/maintenance-20261110T095353Z/previous-deployment.tar.gz`, mode 0600 inside a private directory. Archive contents were compared successfully with the originals and its SHA256 recorded beside it. The original `/var/www/bangbuy-releases` path was removed. An already-open interactive shell's empty working-directory inode was retained inside the private backup rather than terminating the shell. Maintenance backups are excluded through this checkout's local Git exclude file. An archive is historical evidence, not automatic proof of rollback compatibility; use `cd /var/www/bangbuy` in an existing SSH terminal.

Before overwriting dependencies or `.next`, keep only `bangbuy` stopped while its source/build files are changed; the observed app is already errored. Preserve the existing protected environment and persistent uploads. Store backups outside `public` and upload-serving paths, restrict their permissions, and verify they cannot be downloaded. Build in place, require a new `.next/BUILD_ID`, then restart **only `bangbuy`** through the verified existing manager. Check process health, loopback response, both existing domain paths and disabled tracking before reporting restoration complete. Do not run migrations, provision origins, change DNS/Nginx or start a second process as part of this authorization. See [in-place rollback](deployment-rollback.md).

## Observed hosting and remaining access

The initial anonymous DNS/TLS/HTTP discovery, before recovery, found the following. It executed no browser JavaScript, sent no customer cookies and made no Meta delivery request. Later recovery availability and tracking checks are recorded above; the older artifact observations below do not describe the restored build.

| Observation | Evidence and limit |
| --- | --- |
| `bangbuy.net` A `187.127.138.53`; `www.bangbuy.net` CNAME `bangbuy.net`, resolving to the same IPv4; no AAAA observed | Current public DNS observation. A shared IP/CNAME does not make browser origins or storage shared. |
| Both `https://bangbuy.net/en` and `https://www.bangbuy.net/en` return 200 | Both are legacy commerce origins. There is no observed canonical-host redirect between them. Apex `/en/cart` also returns 200. |
| HTTP apex redirects to HTTPS; HTTPS `/` redirects to `/en` | Existing locale entry behavior, not proof of authenticated or payment journeys. |
| Certificate covers apex and www; Let’s Encrypt YE1, valid 1 October–30 December 2026 | Current public TLS certificate observation. Actual certificate files/renewal configuration require host access. A fresh catalog host needs its own approved certificate coverage. |
| Response identifies Nginx 1.24.0 (Ubuntu) and Next.js; sampled HTML is private/no-store | Initial public response headers. Later authorized SSH inspection confirmed the application directory, PM2 app and Node version above; the operator must retain the current proxy/listener inventory separately. |
| Anonymous samples returned no Set-Cookie; `/sw.js` and `/service-worker.js` returned 404 | Does not establish existing session/cart/order-cookie attributes or absence of other/currently registered workers. Use the state audit procedure below. |
| Live HTML contains a `facebook.com/tr` reference and a first-party script contains legacy Pixel bootstrap strings | The live artifact differs from the new isolation build. These are static artifact observations, not proof of any actual Meta event or dataset receipt. |

The initial BatchMode SSH attempt failed with `Permission denied (publickey,password)` and executed no remote command. The user subsequently supplied authorized access, enabling the current inspection above. Retain strict host verification and do not use unrelated upload credentials. The earlier access failure is historical, not a statement that the current authorized session is unavailable.

Historical [October implementation notes](meta-pixel-tracking.md) identify `/var/www/bangbuy`, root-owned PM2 7.0.4 under `/root/.pm2`, process `bangbuy` (then ID 0), `/etc/nginx/sites-enabled/bangbuy` linked to its sites-available file, and loopback upstream `127.0.0.1:3000`. They also recorded a dirty checkout/build mismatch. These are **inventory leads only**. Do not assume current IDs, user, paths, listeners, Node binary, environment-loading mechanism or a clean rollback artifact.

Before any release, the operator must record a redacted inventory of the specific BangBuy Nginx vhost/include chain, exact hostnames/listeners, TLS and upload paths, PM2 owner/daemon PID/socket, process name/cwd/Node binary/arguments, release SHA/dirty state and actually served build ID. Inspect existing environment **key presence and provenance only**, not secret values. Confirm application/worker database identity, backups and payment callbacks separately. Do not publish `pm2 jlist`, `/proc/*/environ`, full Nginx configuration, `.env`, cookies or request logs: these can contain secrets. Invoking PM2 with the wrong account/`PM2_HOME` can create another daemon; verify the existing daemon first.

## Host decision and customer-state blocker

Preserve both existing legacy hosts as untracked commerce until a separately reviewed and tested per-host compatibility/migration deployment exists. **Do not cut over this strict two-origin release while either host's carts, sessions, guest receipts, checkout bookmarks and payment returns remain unproven.** The current classifier accepts one commerce origin; configuring only apex would reject www. A redirect, CNAME or broader cookie Domain does not transfer host-local storage or host-only authorization. Do not widen the classifier or copy customer/attribution credentials as an operational shortcut.

The candidate [origin input](../deploy/nginx/bangbuy-origins.example.json) retains `https://bangbuy.net` as the proposed primary commerce origin and explicitly lists www as unresolved legacy commerce. Its public origin is deliberately `null`: the owner must choose a genuinely fresh hostname, inspect its history and provision it only in a separately authorized release. Do not rename the apex or repurpose www as the catalog. The current A record is an inventory clue, not authorization to add a new DNS record or proof that the VPS currently accepts that host. No additional application server is proposed; both origins use the existing modular Next.js application after compatibility is resolved.

Follow [customer-state migration](customer-state-migration.md) for both hosts and [environment settings](deployment-environment.md). Preserve `AUTH_SECRET` and existing host-only cookie scope; keep `AUTH_URL`, `SITE_URL` and `NEXT_PUBLIC_SITE_URL` on the retained commerce origin. The shared site URL helper creates SSLCommerz callbacks/redirects as well as metadata. Set `AIRWALLEX_RETURN_URL` explicitly to the retained commerce payment-return path; do not use its development default. Test same-browser guest access after all payment return paths on each legacy host before signing off.

## Prepared assets and trust boundary

| Asset | Responsibility |
| --- | --- |
| [Nginx renderer](../scripts/deploy/render-nginx.mjs) and [origin input](../deploy/nginx/bangbuy-origins.example.json) | Produce a new private review file; never install or reload it. Require selected fresh HTTPS host, explicit certificate/upload paths and loopback upstream. Reject known legacy hosts as the catalog. |
| [Application PM2 ecosystem](../deploy/pm2/bangbuy-app.config.cjs) | One explicitly named existing-manager process, no new daemon or system service, no credentials serialized in the definition. `.config.cjs` is intentional PM2 ecosystem naming. |
| [Application launcher](../scripts/deploy/app-launcher.mjs) and [protected environment loader](../scripts/deploy/protected-env.mjs) | Read a regular owner-only file outside the release, never print it, and start Next on `127.0.0.1` at the confirmed port. Remove inherited marketing settings; omitted delivery gates are explicitly false so stale PM2/release dotenv values cannot enable them. Production debug remains false. |
| [GET-only host checks](../scripts/deploy/healthcheck.mjs) | Ten checks of disabled policy, runtime origins, private-page redirect, private API absence/CSRF denial, private CSP and bootstrap absence. No new application health endpoint. This is bounded application liveness, not database or business readiness. |
| [Database/worker procedure](deployment-database-and-worker.md) | Migration status, backup/restore proof, additive rollout, controlled worker and partial-failure recovery. Its local operations tool rejects production targets. |

The renderer changes only exact BangBuy host blocks and adds no global default server. It overwrites forwarded host/protocol/client address, clears `Forwarded`, and targets only loopback. The application derives external origin from an exact configured Host, never arbitrary incoming forwarded headers. Confirm the listener is not publicly reachable, the existing firewall is preserved and only the trusted local proxy can reach it. No credentialed CORS, `Origin` rewriting or cookie Domain broadening is allowed. Do not enable `AUTH_TRUST_HOST` on an otherwise exposed listener.

Public API access is limited to anonymous catalog reads, language, policy and consent; public private-API requests are 404. The application blocks public-origin calls into private APIs and moves private pages to commerce before rendering. Private pages retain no-store/no-referrer and restrictive CSP, including the existing approved payment/map functionality but excluding Meta scripts and connections. Payment callback exceptions remain the existing narrowly validated routes; do not add general cross-origin exceptions. Locale/currency and approved anonymous consent preferences remain distinct from session, cart and receipt state. Consent is origin scoped and must never be copied to authorize the other host.

Access logs contain only bounded route class, request method and status, including HTTP redirects. Candidate host blocks discard Nginx request-context error output rather than logging private URLs; use bounded application health checks and redacted service codes for these hosts. Review the existing included proxy logs, application/process logs, monitoring/CDN configuration and retention before cutover; do not claim this candidate sanitizes other writers. Existing protected first-party payment audit records remain separate from marketing and proxy logs. Keep other VPS applications and their logs/configuration unchanged.

## Review and local/staging verification

Copy the origin JSON to a private task directory and replace only confirmed values. `/CONFIRM/` paths and the historical port/upload directory are not evidence of actual host configuration. Generate a new review file:

```sh
node scripts/deploy/render-nginx.mjs --config /absolute/private/origins.json --output /absolute/private/bangbuy-candidate.conf
node --test tests/deployment-host-assets.mjs tests/deployment-operations.mjs
```

The renderer refuses the unresolved checked-in example and refuses `/etc/` output; it writes a new file only. No local Nginx binary was available, so **actual `nginx -t` has not been performed**. An operator must inspect the candidate within the confirmed existing Nginx include context and run syntax validation before any later authorized reload. `map`/`log_format` belong in the HTTP context. Never replace the complete shared Nginx configuration or remove the existing combined apex/www vhost while compatibility is blocked. Review existing upload alias limits, renewal, compression, rate limits and security settings and preserve necessary behavior when merging the final candidate.

The application ecosystem requires these confirmed metadata values: `BANGBUY_RELEASE_ROOT=/var/www/bangbuy`, `BANGBUY_APP_PROCESS_NAME=bangbuy`, `BANGBUY_NODE_BINARY`, `BANGBUY_APP_ENV_FILE`, `BANGBUY_APP_LOG_DIRECTORY`, `BANGBUY_APP_PORT` and the existing account's `PM2_HOME`. The root variable names the one in-place application directory. Paths must be absolute; the RPC socket must exist. Its socket guard prevents accidental initialization but does not authenticate a stale socket or prove the correct daemon. The private file contains the complete approved runtime configuration and explicit disabled flags from [the checklist](deployment-environment.md), with mode `0600` and the actual service owner. Do not source an arbitrary dotenv file as shell code.

Use a separate clean manager-invocation shell containing only reviewed nonsecret process metadata and the existing manager's required runtime settings. PM2 can retain inherited shell variables even when the ecosystem file contains only paths. Do not reuse a migration shell with exported database/provider credentials for PM2 start/save operations; application secrets belong in the protected file loaded inside the child process.

After the operator has confirmed metadata, inspect the ecosystem without invoking PM2 or starting the application:

```sh
"$BANGBUY_NODE_BINARY" -e "require('./deploy/pm2/bangbuy-app.config.cjs')"
```

Use the verified deployment account and existing Node/PM2 binaries. For a later origin-configured release, build-time public origins must match server origins; retain the artifact hash/build ID, dependency lock, private configuration revision and a protected rollback archive restored into the same application directory if needed. The current authorization covered only the completed in-place recovery above. Do not use `pm2 restart all`, create another manager/app or introduce a new systemd/container stack. The existing npm-start process was retained; the prepared ecosystem and its future switch still require separate verification.

Build with the required development dependencies present; do not prune before Prisma generation, type checks and the production build finish. `dotenv` and `tsx` are runtime dependencies for the protected-environment application launcher and TypeScript worker. Any later production pruning/packaging must retain those packages, the generated Prisma client/runtime, built Next assets and required launcher/worker source. The actual VPS packaging/PM2 installation remains unverified; check the prepared artifact under the confirmed Node version before changing the live process.

Run GET-only checks against the approved **staging** pair after that environment is independently available:

```sh
node scripts/deploy/healthcheck.mjs --public-origin "$STOREFRONT_ORIGIN" --commerce-origin "$COMMERCE_ORIGIN"
```

It performs no login, checkout mutation, cookie transfer or JavaScript execution. A success does not prove database health, payment verification, guest ownership or SDK behavior. Use the disposable-database HTTPS browser journey, state auditor, DB/worker tests and provider sandbox procedure in [staging verification](deployment-staging-verification.md). The current local production artifact passed the real two-host HTTPS journey plus these ten host checks. No production customer data or Meta delivery was used. Standalone host-asset tests also cover environment inheritance, private-file guards, loopback start, existing-socket ecosystem, renderer injection/host/log rules and negative health conditions.

## Stage 1: authorized commerce release with tracking disabled

This two-origin release remains a future procedure, separate from the currently authorized in-place build/restoration. **Do not execute its migrations, DNS/proxy changes or worker startup under the recovery authorization.** Clear dual-host state compatibility, backup/restore, provider sandbox and specific release-authorization blockers first. Record named owner, approved host/config/artifact revisions, maintenance window, abort criteria and [rollback](deployment-rollback.md).

1. Preserve a verified prior artifact as a protected archive, its environment revision and the exact BangBuy Nginx vhost/includes. Restore into the same `/var/www/bangbuy` directory if rollback is needed; do not introduce a second live checkout or symlink swap. Resolve dirty checkout/served-build discrepancies before designating the rollback artifact. Protect uploads, database and TLS configuration through their existing backup systems.
2. Complete the reviewed additive migration procedure once using the approved direct connection and immutable SQL. Confirm migration status and required runtime permissions before new code or worker.
3. Set `META_ENVIRONMENT=disabled`, `META_RUNTIME_ENABLED=false`, `META_PIXEL_ENABLED=false`, `META_CAPI_ENABLED=false`, `TRACKING_ISOLATION_READY=false`, `META_DEBUG=false` and disabled manifest gates in application and worker configuration. Confirm the actual current policy response is denied. Keep guest external delivery and COD Purchase excluded.
4. Only after separate deployment authorization, provision the selected fresh origin/TLS and merge reviewed BangBuy-only proxy rules without breaking either legacy host. Validate Nginx syntax; update only the confirmed BangBuy PM2 process through its existing daemon. Keep the legacy compatibility plan and rollback reachable throughout. A strict single-commerce-origin cutover is prohibited while the alias blocker remains.
5. Verify actual served build identity, both-host state restoration, locale, catalog/variant/handoff/cart/Buy now, selected/full checkout, login merge, guest receipt authorization and payment sandbox return/status convergence. Check DB/migration and disabled worker status, zero unintended Meta network, private CSP/API/storage isolation and bounded logs. Local test evidence alone cannot replace this deployed-environment evidence.

Abort on lost guest/cart/session access, wrong host/config/build, failed migration or authorization, unintended delivery, private API/SDK exposure, wrong payment return, or unexplained payment/stock failures. Keep tracking disabled and follow the rollback plan. Document Stage 1 results before considering Stage 2.

## Stage 2: separately authorized channel activation

Use [tracking activation](tracking-activation.md) after all provider/account, truthful content/source/matching, consent and exact document-approval blockers are independently closed. Approve Pixel and CAPI separately. No successful deployment, local fixture, configured Pixel ID, test-event code or internal policy flag establishes dataset permission, provider acceptance, visibility or deduplication. Keep optional CAPI off if a lawful truthful private source context is unavailable. Record actual request, API response, intended-dataset visibility and deduplication evidence separately; none was produced in this preparation phase.
