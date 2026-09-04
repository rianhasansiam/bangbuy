# BangBuy development and deployment guide

This guide documents both the production system observed during a **read-only
audit on 2026-09-04** and the required deployment/recovery procedures. The
audit did not change the VPS, database, DNS, or application code. Commands in
this guide are instructions for an approved maintenance window; they were not
run as part of the audit.

Never copy passwords, API keys, connection strings, private keys, or recovery
credentials into this file. Values shown as `REPLACE_*` are placeholders.

## Production architecture and audited state

The production request path is:

```text
DNS: bangbuy.net / www.bangbuy.net
                 |
                 v
       VPS 187.127.138.53 (UFW: 22, 80, 443 only)
                 |
                 v
         Nginx 1.24.0 :80/:443
                 |
                 v
      Next.js 16.2.12 via PM2 -> :3000
          |              |
          |              +-> local .next image/ISR cache
          |
          +-> Neon PostgreSQL 18.6 over TLS (pooled runtime endpoint)
          +-> ImgBB (uploaded image bytes; database keeps URLs only)
          +-> Airwallex, SSLCommerz, ExchangeRate-API, Google OAuth,
              and the courier-information provider

Browser -> EmailJS (the contact form's notification call is client-side)
```

The VPS is shared with another Next.js application on port 3001, so capacity,
Nginx defaults, firewall changes, and restarts must account for both services.
BangBuy itself is a single App Router monolith: Nginx terminates TLS; Next.js
serves the storefront, admin UI, Route Handlers, authentication, and business
services; Prisma accesses PostgreSQL. There is no Redis, external cache, or
message broker. Durable Airwallex webhook work is stored in PostgreSQL.

### Audited production inventory

| Item | Observed production value on 2026-09-04 |
| --- | --- |
| Host OS | Ubuntu 24.04.4 LTS, Linux 6.8, KVM/x86-64 |
| Host capacity | 2 vCPU, 7.8 GiB RAM, 96 GiB ext4 root disk (about 90 GiB free), no swap |
| Public origin | `https://bangbuy.net`; `www.bangbuy.net` resolves to the same VPS |
| Firewall | UFW enabled; inbound 22/tcp and 80/443 only |
| Application | `/var/www/bangbuy`, Next.js `16.2.12`, one process on port 3000 |
| Process manager | PM2 `7.0.4`, fork mode, Node.js `v22.23.2`, currently running as `root` |
| PM2 boot unit | `pm2-root.service` is enabled but was inactive during the audit while the PM2 daemon was running |
| Database | Managed Neon PostgreSQL `18.6 (c5250a2)`; pooled `DATABASE_URL`, TLS `sslmode=require`; `DIRECT_URL` unset |
| Database software on VPS | No local PostgreSQL server and no `psql`/`pg_dump` client installed |
| Reverse proxy | Nginx `1.24.0`; TLS certificate managed by Certbot |
| Environment file | `/var/www/bangbuy/.env`, owner `root:root`, mode `0600` |
| Application scheduling | No BangBuy user/root crontab and no BangBuy systemd timer found |
| Backups | No BangBuy database/image backup script, directory, log, or timer found |
| Upload storage | ImgBB only; there is no persistent local uploads directory |

The audit found these production differences from the hardened target in this
guide. Resolve them only during an approved change window:

- PM2 and the checkout run as `root`; the target is a dedicated unprivileged
  `bangbuy` account.
- Node listens on all interfaces on port 3000. UFW currently blocks that port,
  but the target command also binds Node to `127.0.0.1`.
- PM2's boot unit needs a controlled reboot/startup test; "enabled but
  inactive" does not prove that the application will return after a reboot.
- Airwallex is enabled in production, but its reconciliation cron job is not
  installed. The FX and SSLCommerz jobs are also absent.
- Logical database backups, ImgBB asset backups, and restore tests are not
  automated.
- Both `bangbuy.net` and `www.bangbuy.net` currently proxy the app even though
  the configured canonical origin is `https://bangbuy.net`; `www` should
  redirect to the canonical host.
- An obsolete enabled Nginx site named `next-app` conflicts with the other
  application's HTTP server name. `nginx -t` succeeds but reports warnings.
- The VPS checkout has uncommitted changes to `package.json` and
  `package-lock.json`; reconcile them before using an in-place Git deployment.

### Deployment, repository, and recovery evidence

This table records a second read-only verification completed on
**2026-09-04 at 09:40:27 UTC**. `Verified` means the value was directly
observed and can be reproduced from the cited evidence. `Observed` records a
state but is not proof of provenance or completeness. `Absent` means the named
audit paths/evidence were searched without finding the artifact. `Not verified`
means the available evidence is insufficient; it must not be interpreted as a
successful check.

| Requested evidence | Status | Audited value and accurate conclusion |
| --- | --- | --- |
| Exact Git commit serving `bangbuy.net` | **Not verified** | Nginx routes the domain to the PM2 process whose working directory is `/var/www/bangbuy`. That checkout's `main` `HEAD` is `c34efdfffb852368f474256abdc664ff1b908b9c` (`fixed some Ui issues`, committed 2026-08-25 02:14:57 +06:00), but tracked `package.json` and `package-lock.json` are modified. `.next/BUILD_ID` is `cKUzaXslGoz2jgPXNlDOW` with mtime 2026-08-24 20:16:25 UTC, but no release/commit provenance file was found in `.next`. Therefore the SHA is the **current checkout HEAD/candidate**, not a provable deployed-build SHA. |
| Production Git tag or release | **Tag verified; no release; tag does not match live checkout** | The remote annotated tag [`bangbuy-production-2026-08-25`](https://github.com/rianhasansiam/bangbuy/tree/bangbuy-production-2026-08-25) has tag object `914c6614ecf67be3cf7dc149bc5e6e1c5082677f` and resolves to commit `328786b3d6580640243949c92c313370291963ef`. That commit is one commit ahead of the live checkout. The live checkout has no fetched local tag, and the [GitHub Releases page](https://github.com/rianhasansiam/bangbuy/releases) reports no releases. Do not use this tag as proof of the current deployed build. |
| Repository visibility and remote `main` | **Verified; security mismatch** | The origin described as private is currently [shown by GitHub as Public](https://github.com/rianhasansiam/bangbuy), and an anonymous `git ls-remote` succeeds. At audit time remote `main` was `9855b42776ce1b203aa5da5e2d834685e27f4c19`; the live checkout is its ancestor and is two commits behind. If public access is unintended, change visibility through an approved repository-owner action and rotate every credential that may ever have been committed. |
| Private repository matches the live website | **Not confirmed** | The Git states do not match: remote `main` is two commits ahead, the production tag is one commit ahead, and the live worktree is dirty. The two later committed changes affect only `.env.example` and `development_guide.md`, so no later application-source delta was found; that still does not prove the build came from the checkout. The build is not commit-stamped, so visual/HTTP similarity cannot prove source equivalence. A clean, immutable tagged checkout plus a commit-stamped build/deployment record is required for confirmation. |
| Complete PostgreSQL backup | **Absent in the audited VPS scope; provider backup not verified** | `psql`, `pg_dump`, and `pg_restore` are absent. No `/var/backups/bangbuy`, backup/off-site helper, backup log, BangBuy cron/timer, or matching dump/SQL/asset archive was found under `/var/backups`, `/var/www`, `/root`, `/opt`, or `/srv`. Neon snapshot/PITR status could not be audited without control-plane access. No current backup can be confirmed as complete. |
| Backup date, size, and checksum | **Unavailable** | No verified backup file exists in the audited scope, so there is no truthful date, byte size, or SHA-256 value to report. Record these from `stat` and `sha256sum` after the first successful section 12 backup; never substitute the audit date. |
| Restoration command | **Documented; not executed for a current backup** | With the five `PG*` variables set to an isolated, explicitly empty direct database, use `pg_restore --exit-on-error --single-transaction --no-owner --no-privileges --dbname="$PGDATABASE" /var/backups/bangbuy/bangbuy_YYYYMMDDTHHMMSSZ.dump` after its SHA-256 passes. The full procedure is in section 13. Never point this command at production. |
| Successful clean-database restore test | **Not verified; no evidence found** | No dump, isolated restore database, restore-test log, or application smoke-test record was found. `pg_restore --list` would prove only archive readability, not a successful restoration. Do not claim a tested backup until the section 13 procedure completes against an empty database and its validation record is retained. |

The current facts therefore do **not** support confirmation that a particular
Git commit/tag exactly produced the running `.next` build, that the requested
repository is private or matches the live source, or that a complete and
clean-restore-tested PostgreSQL backup exists. Closing those gaps requires
approved changes; none were made during either audit.

### Capacity and server requirements

The repository contains no load-test-derived hardware minimum. For one
BangBuy process with managed PostgreSQL, use this initial operational baseline
and revise it from CPU, memory, latency, and build measurements:

| Resource | Minimum starting point | Recommended for this shared build host |
| --- | --- | --- |
| CPU | 2 vCPU | 4 vCPU if builds run on-host or traffic grows |
| RAM | 4 GiB | 8 GiB plus 2-4 GiB swap for build-spike protection |
| Disk | 40 GiB SSD | 80+ GiB SSD, with alerts at 70% and 85% usage |
| Network | Stable outbound HTTPS and low-latency PostgreSQL access | 1 Gbps port and provider/network monitoring |
| Architecture | x86-64 or ARM64 supported by Node and Sharp | x86-64 matches the audited host |

Disk capacity must include the source tree, `node_modules`, `.next` runtime
cache, Nginx/PM2 logs, temporary build space, and the local backup retention
window. The application build needs database access and outbound HTTPS (the
root layout downloads a Google font). The 32 MiB upload limit requires at
least a 40 MiB Nginx body limit. Keep only one application instance until
in-memory rate limits, Next.js cache/tag invalidation, Server Action encryption
keys, and version-skew handling are shared across instances.

Use one process-management option only. PM2 is the production manager and the
primary runbook below; systemd is retained as a migration alternative.

Unless a section explicitly switches to `bangbuy`, run administrative commands
from a separate sudo-capable login. `sudo -iu bangbuy` opens a subshell; run
`exit` when that application-account task is complete.

## 1. Required versions and host packages

### Version baseline

| Component | Repository compatibility | Exact production baseline |
| --- | --- | --- |
| Node.js | `^20.19`, `^22.12`, or `>=24.0` | `v22.23.2` |
| npm | Lockfile version 3 support | `12.0.2` |
| PostgreSQL server | Prisma supports PostgreSQL 16-18 for this repository | Neon PostgreSQL `18.6 (c5250a2)` |
| PostgreSQL client tools | Same major as, or newer than, the server | PostgreSQL 18.x `psql`, `pg_dump`, and `pg_restore` |
| PM2 | Process manager; not an app dependency | `7.0.4`, one fork-mode instance |
| Nginx | Supported Ubuntu package | `1.24.0` on Ubuntu 24.04 |
| Application framework | Pinned by the lockfile | Next.js `16.2.12`, React `19.2.4`, Prisma `7.9.1` |

Next.js 16 itself permits Node `>=20.9`, but Prisma 7.9.1 has the stricter
Node range shown above. Node 20.9 through 20.18 therefore does **not** satisfy
the complete dependency tree, and the Node 20 release line is now end-of-life
despite appearing in Prisma's engine range. Do not deploy any EOL or non-LTS
release. Production is standardized on the exact Node `v22.23.2` runtime
recorded above. Test dependency installation and the full build before any
planned runtime upgrade; do not silently move the production major version.

Recheck the official [Node.js release status](https://nodejs.org/en/about/previous-releases),
[PostgreSQL version policy](https://www.postgresql.org/support/versioning/),
and [Prisma database support](https://www.prisma.io/docs/orm/v7/reference/supported-databases)
when refreshing the server image.

The schema uses PostgreSQL-specific JSONB, GIN indexes, transactions, and row
locking. SQLite or MySQL are not substitutes. No optional PostgreSQL extension
is required by the checked-in migrations.

### Host packages

Production uses managed Neon PostgreSQL, so install the PostgreSQL 18 client
tools but do not install or expose a local PostgreSQL server. Ubuntu 24.04 may
require the PostgreSQL Global Development Group (PGDG) package repository for
`postgresql-client-18`. Use the PostgreSQL project's signed repository setup,
not an unverified package source:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates build-essential nginx \
  certbot python3-certbot-nginx cron logrotate postgresql-common \
  libnginx-mod-http-geoip2 geoipupdate file
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
sudo apt update
sudo apt install -y postgresql-client-18
```

The PGDG setup command and package name come from the
[official PostgreSQL Ubuntu instructions](https://www.postgresql.org/download/linux/ubuntu/).
Review the repository URL/key fingerprint under the organization's package
policy before approving a new host.

The audited VPS does not yet have these client tools. A PostgreSQL 18.x client
can dump PostgreSQL 18.6; an older-major `pg_dump` cannot. Pinning the server's
minor patch is controlled by Neon, so record and retest the observed version
after provider maintenance.

Install the exact Node runtime from a trusted distribution channel or an
organization-managed image. The audited server uses NVM; the unprivileged NVM
pin is shown after the application account is created in section 2. A
system-wide Node installation is also valid, but it must provide the same exact
versions and the process-manager unit must use its verified absolute paths.
Verify all effective tools before continuing:

```bash
node --version
npm --version
psql --version
nginx -v
command -v node
command -v npm
```

If the Node or npm paths are not `/usr/bin/node` and `/usr/bin/npm`, substitute
the output of `command -v` in the systemd unit later in this guide. The exact
equality checks in the deployment commands are guards for this production pin,
not a runtime installer.

## 2. Application account and source checkout

Run the application as an unprivileged account. The account must own the
application directory and the `.next` directory because Next.js writes its
runtime image/ISR cache there.

```bash
sudo adduser --disabled-password --gecos "" bangbuy
sudo install -d -o bangbuy -g bangbuy -m 0750 /var/www/bangbuy
sudo -iu bangbuy
git clone REPLACE_REPOSITORY_URL /var/www/bangbuy
cd /var/www/bangbuy
git status --short
exit
```

For a private repository, use a read-only deploy key or the organization’s
artifact pipeline. Do not place a personal access token in the clone URL or in
shell history.

The audited server uses NVM. If NVM has already been installed for `bangbuy`
from a reviewed, pinned NVM release, install the exact production runtime and
manager as that account:

```bash
sudo -iu bangbuy
. /home/bangbuy/.nvm/nvm.sh
nvm install 22.23.2
nvm alias default 22.23.2
nvm use 22.23.2
npm install --global npm@12.0.2 pm2@7.0.4
node --version
npm --version
pm2 --version
exit
```

Do not install NVM with an unreviewed `curl | sh` command. If the organization
uses a system-wide Node package instead, keep the version pin and substitute
the verified absolute binary paths throughout the PM2/systemd setup.

## 3. Install dependencies

The repository uses npm and commits `package-lock.json`. Always install the
locked dependency graph:

```bash
sudo -iu bangbuy
cd /var/www/bangbuy
test "$(node --version)" = "v22.23.2"
test "$(npm --version)" = "12.0.2"
npm ci --include=dev
exit
```

`npm ci --include=dev` intentionally installs development dependencies because
TypeScript, Tailwind, and other build tools are needed by `next build`. It also
runs the checked-in `postinstall` command, `prisma generate`. Do not use
`npm install` during a deployment because it can rewrite the lockfile and
select different versions.

Keep optional dependencies installed. Self-hosted `next/image` uses `sharp`,
which is pinned through the package overrides.

## 4. Production environment

The audited runtime file is `/var/www/bangbuy/.env`, owned by `root:root` with
mode `0600`. That matches the current root-run PM2 process but will become
unreadable after moving the process to the required unprivileged account.

The hardened target keeps the authoritative file outside the Git checkout at
`/etc/bangbuy/production.env`, owned by `root:bangbuy` with mode `0640`, and
exposes it to Next.js through the ignored `/var/www/bangbuy/.env` symlink.
This prevents the service account from editing the authoritative file. Because
the service account owns the current checkout, it could still replace the
symlink; verify the link before every build/start and separate deploy/runtime
ownership in a future versioned-release design.

For a **new installation only**, fail if the target or link already exists:

```bash
sudo install -d -o root -g bangbuy -m 0750 /etc/bangbuy
if sudo test -e /etc/bangbuy/production.env; then
  echo 'Refusing to overwrite the production environment' >&2
  exit 1
fi
sudo install -o root -g bangbuy -m 0640 /dev/null \
  /etc/bangbuy/production.env
sudoedit /etc/bangbuy/production.env

if sudo test -e /var/www/bangbuy/.env || sudo test -L /var/www/bangbuy/.env; then
  echo 'Refusing to replace the runtime environment path' >&2
  exit 1
fi
sudo ln -s /etc/bangbuy/production.env /var/www/bangbuy/.env
sudo stat -L -c '%n owner=%U group=%G mode=%a' /var/www/bangbuy/.env
```

The audited host already has a regular `.env`; do not use the new-installation
block there. During an approved maintenance window, stop BangBuy, copy the
existing file to `/etc/bangbuy/production.env.new` with `root:bangbuy`/`0640`,
compare it with `cmp --silent`, atomically rename it to `production.env`, move
the original to a root-only rollback path under `/etc/bangbuy`, create the
symlink, verify it with `readlink -f` and `stat -L`, then restart and test the
app. If any check fails, stop the app and restore the untouched rollback file
to `/var/www/bangbuy/.env`. Retire the duplicate only through the approved
secret-destruction procedure after the new setup and encrypted off-host copy
are verified.

Retain the `.env` symlink even when systemd starts the app because Prisma and
other maintenance commands run outside the service unit. The systemd unit may
also reference the same canonical file with
`EnvironmentFile=/etc/bangbuy/production.env`; both paths must resolve to that
one file. Do not maintain two copies that can drift or print the file while
loading it into an interactive shell.

Before distributing or publishing the repository, inspect `.env.example` for
old commented credential values. The current template contains
credential-looking commented examples; treat any value that was ever real as
compromised, rotate it at the provider, and remove it from Git history through
the repository owner’s credential-remediation process. Commenting out a secret
does not make it safe.

At minimum, review these settings:

```dotenv
NODE_ENV=production

DATABASE_URL="postgresql://APP_USER:URL_ENCODED_PASSWORD@NEON_POOLER_HOST/APP_DATABASE?sslmode=verify-full"
# Explicit direct/session endpoint for migrations, dumps, and restores.
DIRECT_URL="postgresql://APP_USER:URL_ENCODED_PASSWORD@NEON_DIRECT_HOST/APP_DATABASE?sslmode=verify-full"

SITE_URL=https://bangbuy.net
NEXT_PUBLIC_SITE_URL=https://bangbuy.net
AUTH_URL=https://bangbuy.net
AUTH_SECRET=
ALLOW_DEMO_SEED=false

AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

CUSTOMER_INFO_CHECKER_API=
IMGBB_API_KEY=

SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
SSLCOMMERZ_IS_LIVE=false
PAYMENT_RECONCILIATION_SECRET=

AIRWALLEX_ENABLED=false
AIRWALLEX_ENV=sandbox
AIRWALLEX_CLIENT_ID=
AIRWALLEX_API_KEY=
AIRWALLEX_WEBHOOK_SECRET=
AIRWALLEX_SANDBOX_API_BASE_URL=https://api.sandbox.airwallex.com
AIRWALLEX_PRODUCTION_API_BASE_URL=https://api.airwallex.com
AIRWALLEX_HTTP_TIMEOUT_MS=10000
AIRWALLEX_WEBHOOK_TOLERANCE_SECONDS=300
AIRWALLEX_RECONCILIATION_SECRET=
AIRWALLEX_RETURN_URL=https://bangbuy.net/orders/payment-return

EXCHANGE_RATE_API_KEY=
EXCHANGE_RATE_REFRESH_HOURS=6
CRON_SECRET=
CURRENCY_DEBUG_SECRET=

# The section 9 Nginx GeoIP2 config creates and overwrites this header.
GEO_COUNTRY_HEADER=X-BangBuy-Country
# DEV_COUNTRY is development-only and must be unset in production.
```

Generate independent secrets; never reuse `AUTH_SECRET` for a scheduler or
payment endpoint:

```bash
openssl rand -hex 32  # AUTH_SECRET
openssl rand -hex 32  # CRON_SECRET
openssl rand -hex 32  # PAYMENT_RECONCILIATION_SECRET
openssl rand -hex 32  # AIRWALLEX_RECONCILIATION_SECRET
```

`AUTH_SECRET` is mandatory for every production deployment; paste its generated
value before the first build. Paste each scheduler secret before enabling its
corresponding feature. Never leave a documented placeholder string as a real
secret. An enabled Airwallex reconciliation secret and the SSLCommerz
reconciliation secret must each be at least 32 characters; the commands above
produce 64.

Important environment rules:

- URL-encode special characters in database usernames and passwords. Use the
  Neon pooled endpoint only for application runtime traffic and the direct
  endpoint for Prisma CLI, `pg_dump`, and `pg_restore`. Use
  `sslmode=verify-full`. The audited runtime URL still says `sslmode=require`;
  application code currently upgrades that mode, but operational tools should
  not depend on driver-specific alias behavior.
- `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, and `AUTH_URL` must use the final HTTPS
  origin and contain no path, query, fragment, or trailing application path.
- Every `NEXT_PUBLIC_*` value is embedded into browser bundles by
  `npm run build`. Changing one requires a rebuild, not only a restart.
- Server variables are loaded at runtime, but database-backed pages are also
  prerendered during this project’s build. The database and required build
  variables must therefore be available while `npm run build` runs.
- The root layout uses `next/font/google`, so the build host also needs outbound
  HTTPS access to download the configured Google font unless the project is
  changed to self-host that font.
- Do not put `PORT` in `.env`; Next.js reads it before loading env files. Pass
  `--port` to `next start` or set `PORT` in PM2/systemd.
- Set `SSLCOMMERZ_IS_LIVE=true` only with live credentials and verified public
  callbacks. Set `AIRWALLEX_ENABLED=true` only after all Airwallex credentials,
  the webhook secret, reconciliation secret, production environment, and
  return URL are configured.
- When Airwallex is enabled, configure its dashboard webhook destination as
  `https://bangbuy.net/api/payments/airwallex/webhook`. SSLCommerz callback
  URLs are generated from `SITE_URL`, so that origin must be publicly reachable.
- If Google sign-in is enabled, register
  `https://bangbuy.net/api/auth/callback/google` as an authorized redirect URI.
- Never print production configuration with `cat`, `env`, `pm2 env`, or command
  tracing in tickets or CI logs. Inspect metadata with `stat` and validate only
  the names/presence of required variables.
- `.env` is not a backup. Keep an encrypted, access-controlled master copy in
  a team password manager or secrets system, separate from database and image
  backups. Record who can read or rotate each secret.
- Preserve `AUTH_SECRET` during ordinary deployments; rotating it signs out
  all users. Use independent random values for cron and both reconciliation
  secrets, and rotate exposed credentials immediately.
- VPS login credentials are not application environment variables. Use named
  sudo-capable operator accounts and SSH keys, keep break-glass credentials in
  the password manager, and rotate any password disclosed through chat,
  tickets, or shell history during an approved maintenance window.

## 5. PostgreSQL topology and access

### Production: managed Neon PostgreSQL

Production uses a Neon PostgreSQL `18.6` server; PostgreSQL is not installed on
the VPS. `DATABASE_URL` is the pooled application connection and `DIRECT_URL`
must be the direct/session connection used by migrations and operational
tools. Both use TLS with full certificate/hostname verification. Keep the
application role non-superuser and scoped to the application database/schema.

The audited environment has no explicit `DIRECT_URL`; `prisma.config.ts`
currently derives Neon's direct hostname by removing `-pooler`. Set the
explicit value so migrations, backups, restoration, and provider changes do not
depend on that Neon-specific fallback. Restrict database access by provider
role/network controls where available, and monitor connection count and query
latency.

### Optional self-managed PostgreSQL

Enable PostgreSQL, create a non-superuser login, and make it the owner of a
dedicated database:

```bash
sudo apt install -y postgresql-18
sudo systemctl enable --now postgresql
sudo -u postgres createuser --pwprompt bangbuy
sudo -u postgres createdb --owner=bangbuy --encoding=UTF8 \
  --template=template0 bangbuy
sudo -u postgres psql -c '\l+ bangbuy'
```

The application role must own the database/schema so Prisma can create and
alter objects, but it must not be a PostgreSQL superuser. Bind PostgreSQL to
loopback only when Nginx, Node, and PostgreSQL share a host. Do not expose port
5432 through the public firewall.

Test the application connection without printing the password:

```bash
sudo -iu bangbuy
psql "postgresql://bangbuy@127.0.0.1:5432/bangbuy?sslmode=disable" \
  --password -c "SELECT current_database(), current_user;"
exit
```

### Pooler and migration rules

`DATABASE_URL` is the runtime connection. If it uses PgBouncer or another
transaction-pooling endpoint, set `DIRECT_URL` to a direct/session connection
for Prisma CLI migrations. Migration advisory locks are session-scoped and
must not run through a transaction pooler.

`prisma.config.ts` automatically converts a Neon `-pooler` hostname to its
direct Neon hostname when `DIRECT_URL` is absent. For every other provider,
set `DIRECT_URL` explicitly. Restrict both database endpoints to the server’s
network identity where the provider supports an allowlist.

## 6. Generate Prisma Client and apply migrations

Use the committed migration history in production:

```bash
sudo -iu bangbuy
cd /var/www/bangbuy
npx prisma generate
npx prisma migrate status
exit
```

Review that informational status output. Pending migrations are expected and
may make the command exit with status 1. After confirming that there is no
failed, modified, or divergent history, deploy and verify again:

```bash
sudo -iu bangbuy
cd /var/www/bangbuy
npx prisma migrate deploy
npx prisma migrate status
exit
```

The first status check may report pending migrations; that is expected on a new
release. The final status must report that the database schema is up to date.
Stop if Prisma reports a failed migration, a checksum mismatch, or histories
that differ between the repository and database. `migrate status` compares
migration history; it does not prove that no one altered schema objects by hand.

Production safety rules:

- Take a verified backup immediately before applying new migrations.
- Use `prisma migrate deploy`, never `prisma migrate dev`, `prisma db push`, or
  `prisma migrate reset`, against production.
- Never edit a migration that has already been applied.
- Several checked-in migrations create non-concurrent indexes or rewrite
  payment/order data. On a populated database these operations can take locks
  or run for a meaningful time; inspect pending SQL and schedule a maintenance
  window before deploying a large migration.
- `prisma migrate deploy` does not generate the client, which is why generation
  is an explicit step even though `npm ci` normally ran it already.
- `prisma.config.ts` names `prisma/seed.ts` as a seed command, but that file is
  not present in this repository. Do not run `npx prisma db seed` in production.
  `ALLOW_DEMO_SEED` must remain `false`.

## 7. Exact production validation and build commands

Run the checks before replacing the live process:

```bash
sudo -iu bangbuy
cd /var/www/bangbuy
npx prisma validate
npx prisma generate
npm run lint
npx tsc --noEmit
npm test
npm run build
exit
```

The production build output includes `.next`. Because this project does not set
`output: "standalone"`, retain the full release directory, `node_modules`,
`public`, configuration, and package metadata, and start it with the package
script rather than trying to run `.next/standalone/server.js`:

```bash
sudo -iu bangbuy
cd /var/www/bangbuy
npm run start -- --hostname 127.0.0.1 --port 3000
exit
```

Stop this foreground smoke test with `Ctrl+C` after confirming that it starts.
The loopback binding is intentional: only Nginx should reach the Node port.

## 8. Process management

### Option A: PM2

This is the manager actually used in production. The audit found PM2 `7.0.4`
running `npm start` from `/var/www/bangbuy` as one `root`-owned fork on Node
`v22.23.2`. The `pm2-root.service` unit is enabled but was inactive while the
daemon and application were online. Treat the following as the target
migration to an unprivileged `bangbuy` account, not as proof that the current
boot configuration is healthy.

On a new host, section 2 installs PM2 under the pinned `bangbuy` NVM runtime.
Start and save the application as that account:

```bash
sudo -iu bangbuy
. /home/bangbuy/.nvm/nvm.sh
test "$(node --version)" = "v22.23.2"
test "$(npm --version)" = "12.0.2"
test "$(pm2 --version)" = "7.0.4"
cd /var/www/bangbuy
pm2 start npm --name bangbuy --cwd /var/www/bangbuy \
  --kill-timeout 30000 -- \
  start -- --hostname 127.0.0.1 --port 3000
pm2 save
pm2 status
pm2 logs bangbuy --lines 100 --nostream
pm2 startup systemd
exit
```

#### Migrate the audited root-owned PM2 process

Do not run the new-host start block while root's BangBuy process owns port
3000. The root PM2 daemon also manages the unrelated port-3001 application, so
do **not** disable or kill all of `pm2-root`. During an approved maintenance
window:

```bash
# Read-only preflight as root; preserve the other application's PM2 entry.
pm2 list
pm2 show bangbuy
sudo -iu bangbuy bash -lc \
  '. /home/bangbuy/.nvm/nvm.sh && node --version && npm --version && pm2 --version'

# First reconcile the audited dirty checkout with its owner; never discard it.
if test -n "$(git -C /var/www/bangbuy status --porcelain)"; then
  echo 'Resolve the existing production changes before PM2 migration' >&2
  exit 1
fi
# Complete the section 4 environment migration before changing ownership.
test "$(readlink -f /var/www/bangbuy/.env)" = \
  /etc/bangbuy/production.env
chown -R -- bangbuy:bangbuy /var/www/bangbuy
sudo -u bangbuy test -w /var/www/bangbuy

pm2 stop bangbuy
if ss -ltnp | grep -q ':3000 '; then
  echo 'Port 3000 is still in use; restarting the original process' >&2
  pm2 restart bangbuy
  exit 1
fi

sudo -iu bangbuy bash -lc '
  set -eo pipefail
  . /home/bangbuy/.nvm/nvm.sh
  cd /var/www/bangbuy
  pm2 start npm --name bangbuy --cwd /var/www/bangbuy \
    --kill-timeout 30000 -- \
    start -- --hostname 127.0.0.1 --port 3000
  pm2 save
  pm2 startup systemd
'
```

Run the exact privileged startup command printed by the final command. Verify
`pm2-bangbuy.service`, the loopback listener, public HTTPS, login, admin, and a
database-backed page. If verification fails, delete only the user-owned
BangBuy entry and run root's `pm2 restart bangbuy` to roll back.

Only after the new service passes verification, remove BangBuy from the root
PM2 saved process list while leaving the other application intact:

```bash
pm2 delete bangbuy
pm2 save
pm2 list
sudo systemctl status pm2-bangbuy --no-pager
```

Keep `pm2-root.service` while it owns any unrelated application. Schedule a
separate migration for that application before retiring the root PM2 daemon.

Enable resurrection after reboot by executing the exact privileged command
printed by `pm2 startup` from the separate sudo-capable login. The printed
command includes the correct PATH, service account, and home directory; do not
replace it with a guessed command. Then verify the generated unit:

```bash
# Run the exact sudo command printed above first, then:
sudo -iu bangbuy bash -lc '. /home/bangbuy/.nvm/nvm.sh && pm2 save'
sudo systemctl status pm2-bangbuy --no-pager
```

Routine controls are:

```bash
sudo -iu bangbuy bash -lc \
  '. /home/bangbuy/.nvm/nvm.sh && pm2 restart bangbuy --update-env'
sudo -iu bangbuy bash -lc \
  '. /home/bangbuy/.nvm/nvm.sh && pm2 stop bangbuy'
sudo -iu bangbuy bash -lc \
  '. /home/bangbuy/.nvm/nvm.sh && pm2 start bangbuy'
sudo -iu bangbuy bash -lc \
  '. /home/bangbuy/.nvm/nvm.sh && pm2 logs bangbuy --lines 200'
```

Keep a single PM2 instance in fork mode. This application has an in-process
rate limiter and a filesystem/in-memory Next.js cache. PM2 cluster mode or
multiple servers require a shared rate-limit/cache design, coordinated cache
tag invalidation, a common Server Action encryption key, and version-skew-safe
deployments.

### Option B: systemd

Systemd is not the current application process manager. Use this alternative
only after disabling/removing BangBuy from PM2 so two copies cannot bind the
same port. If PM2 is not used, open `/etc/systemd/system/bangbuy.service` with
`sudoedit` and add:

```ini
[Unit]
Description=BangBuy Next.js application
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=bangbuy
Group=bangbuy
WorkingDirectory=/var/www/bangbuy
EnvironmentFile=/etc/bangbuy/production.env
Environment=PATH=/home/bangbuy/.nvm/versions/node/v22.23.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
ExecStart=/home/bangbuy/.nvm/versions/node/v22.23.2/bin/npm run start -- --hostname 127.0.0.1 --port 3000
Restart=on-failure
RestartSec=5
TimeoutStopSec=30
KillSignal=SIGTERM
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
```

The unit reads the root-managed environment file directly. Retain the section 4
`.env` symlink for Prisma/build commands outside the unit; PM2 also relies on
that symlink. Both references point to the same canonical file. Do not duplicate
literal secrets in the unit. The shown paths match the section 2 NVM pin; if a
system-wide runtime is used, replace both `PATH` and `ExecStart` with its
verified absolute paths.

Enable and inspect the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bangbuy
sudo systemctl status bangbuy --no-pager
sudo journalctl -u bangbuy -n 100 --no-pager
```

Routine controls are:

```bash
sudo systemctl restart bangbuy
sudo systemctl stop bangbuy
sudo systemctl start bangbuy
sudo journalctl -u bangbuy -f
```

The 30-second stop timeout allows in-flight requests to drain on `SIGTERM`.

## 9. Nginx reverse proxy

The production country source is the local GeoLite2 database. Keep its
directive in the Nginx `http` context, preferably in
`/etc/nginx/conf.d/00-bangbuy-geoip.conf` (files in `conf.d` are already
included from the audited `/etc/nginx/nginx.conf`):

```nginx
# Avoid logging query strings from OAuth/payment callbacks.
log_format bangbuy_privacy
    '$remote_addr [$time_iso8601] '
    '"$request_method $uri $server_protocol" $status $body_bytes_sent '
    'rt=$request_time urt=$upstream_response_time';

geoip2 /var/lib/GeoIP/GeoLite2-Country.mmdb {
    auto_reload 1h;
    $bangbuy_country_code country iso_code;
}
```

The host-package section installs the module and updater. Put the MaxMind
account/license details and `EditionIDs GeoLite2-Country` in `/etc/GeoIP.conf`,
then provision the database without exposing those values:

```bash
sudoedit /etc/GeoIP.conf
sudo chown root:root /etc/GeoIP.conf
sudo chmod 600 /etc/GeoIP.conf
sudo geoipupdate
sudo test -r /var/lib/GeoIP/GeoLite2-Country.mmdb
ls -l /etc/nginx/modules-enabled/*geoip2*
sudo nginx -t
```

Maintain the licensed database with the scheduled task in section 11. Do not
commit the database, license key, or updater configuration to Git.

The following is the **complete target BangBuy virtual-host configuration** for
the audited Nginx 1.24 direct-origin topology. It makes `bangbuy.net` canonical,
redirects `www`, preserves App Router streaming, overwrites spoofable proxy
headers, and proxies every application path to the loopback Node listener. Do
not serve `/_next` from a hand-written filesystem alias.

```nginx
# /etc/nginx/sites-available/bangbuy

# These two catch-all blocks must exist only once on this shared VPS. If a
# different enabled site already owns default_server, keep them there instead.
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    ssl_reject_handshake on;
}

server {
    listen 80;
    listen [::]:80;
    server_name bangbuy.net www.bangbuy.net;
    return 308 https://bangbuy.net$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.bangbuy.net;

    ssl_certificate /etc/letsencrypt/live/bangbuy.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bangbuy.net/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 308 https://bangbuy.net$request_uri;
}

server {
    # Nginx 1.24 syntax; newer Nginx may prefer separate `http2 on;`.
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name bangbuy.net;
    server_tokens off;

    ssl_certificate /etc/letsencrypt/live/bangbuy.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bangbuy.net/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    access_log /var/log/nginx/bangbuy.access.log bangbuy_privacy;
    error_log  /var/log/nginx/bangbuy.error.log;

    # The application accepts images up to 32 MiB. Allow multipart overhead.
    client_max_body_size 40m;
    client_body_timeout 60s;

    # Enable only after completing the TLS/renewal gate in section 10.
    # add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;

        # Overwrite, rather than append, an untrusted client-supplied value.
        # The application treats the first X-Forwarded-For address as client IP.
        proxy_set_header X-Forwarded-For $remote_addr;

        # Clear visitor-controlled provider headers. Only the local GeoIP2
        # result is trusted because GEO_COUNTRY_HEADER=X-BangBuy-Country.
        proxy_set_header CF-IPCountry "";
        proxy_set_header X-Vercel-IP-Country "";
        proxy_set_header CloudFront-Viewer-Country "";
        proxy_set_header X-BangBuy-Country $bangbuy_country_code;
        proxy_set_header Connection "";
        proxy_hide_header X-Powered-By;

        # Preserve App Router streaming/Suspense responses.
        proxy_buffering off;
        proxy_request_buffering on;

        proxy_connect_timeout 10s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

This configuration assumes visitors reach Nginx directly, which DNS did during
the audit. If a CDN is introduced, do not blindly keep it: restrict direct
origin access, configure Nginx real-IP handling only for the CDN's published
IP ranges, and define exactly one trusted country-header source.

If the certificate already exists, enable the site and validate the complete
effective configuration before reloading. On a first deployment, use the HTTP
bootstrap sequence in section 10 before installing the final TLS blocks.

```bash
sudo ln -s /etc/nginx/sites-available/bangbuy \
  /etc/nginx/sites-enabled/bangbuy
sudo nginx -t
sudo nginx -T | less
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

Use `ln -s` only when the link is absent. On this shared VPS, list all enabled
sites before changing defaults, and resolve the audited duplicate `next-app`
server-name warning without touching the other application's valid site.
Keep port 3000 closed publicly; allow only restricted SSH, HTTP, and HTTPS at
the host/cloud firewall.

If Cloudflare or another CDN is later placed in front of Nginx, `$remote_addr`
initially identifies the CDN edge. Configure Nginx real-IP handling **only**
for the provider's current published IP ranges, restrict direct origin access,
and then continue to pass the overwritten `$remote_addr`. Never trust an
arbitrary incoming `X-Forwarded-For` or country header. For BangBuy's supported
country-detection topologies, follow
[`docs/currency-exchange-rates-vps.md`](docs/currency-exchange-rates-vps.md).

Do not add a generic Nginx `proxy_cache` for HTML, RSC, `/api`, `/admin`, auth,
cart, checkout, profile, wishlist, or order traffic. Those responses may be
private or user-specific, and the application already owns Next.js cache
invalidation.

## 10. TLS/SSL with Let’s Encrypt

The audited certificate named `bangbuy.net` is an ECDSA Let's Encrypt
certificate covering `bangbuy.net` and `www.bangbuy.net`. At audit time it was
valid until **2026-10-29 14:11:19 UTC**. `certbot.timer` was enabled and active;
renewal still needs monitoring because a timer existing is not proof that a
future renewal will succeed.

Before requesting or replacing a certificate:

1. Point both names' `A` records to `187.127.138.53`; publish an `AAAA` record
   only if IPv6 is configured and tested end to end.
2. Confirm `curl -I http://bangbuy.net` and `curl -I http://www.bangbuy.net`
   reach this Nginx host.
3. Permit TCP ports 80 and 443 in both the cloud firewall and host firewall.
4. If a CDN proxy is enabled, ensure its validation mode permits the ACME
   challenge or temporarily use DNS-only mode.

For a first installation, temporarily enable only the two non-TLS section 9
blocks (the port-80 catch-all and the `bangbuy.net`/`www` port-80 redirect),
without either port-443 block. Validate Nginx and request one certificate
containing both names:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d bangbuy.net -d www.bangbuy.net --redirect
sudo nginx -t
sudo systemctl reload nginx
```

After Certbot creates the certificate, replace its generated site content with
the complete, reviewed section 9 configuration, then validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Both HTTP and HTTPS `www.bangbuy.net` must return
`308 https://bangbuy.net$request_uri`; never proxy both hostnames to the app.
`SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_URL`, OAuth redirects, and payment
callbacks/webhooks must all use `https://bangbuy.net`.

Test renewal and inspect the installed timer:

```bash
sudo certbot renew --dry-run
systemctl list-timers --all | grep certbot
sudo certbot certificates
```

After HTTPS is working, verify that the environment uses the same canonical
HTTPS origin. Section 4 sets that value before the first build, so no rebuild
is normally needed here. If any `NEXT_PUBLIC_*` value changed, use the stopped,
in-place deployment sequence later in this guide; never overwrite a live `.next`
directory.

The final configuration leaves one-year HSTS commented. After HTTPS, both
redirects, the renewal dry run, and the rollback path are verified, uncomment
that line, run `nginx -t`, and reload. Do not add `includeSubDomains` until
every subdomain is permanently HTTPS. Never copy certificate private keys into
the repository or application directory; the private key remains under
`/etc/letsencrypt/live/bangbuy.net/` and must be readable only by privileged
Nginx processes.

## 11. Scheduled tasks

BangBuy does not run an in-process scheduler. Linux cron must call the protected
HTTP endpoints so the task uses the live application’s validation, locking,
provider clients, and cache invalidation.

**Audited status:** Ubuntu's `cron` service is enabled and active, but no
BangBuy crontab or systemd timer is installed. Airwallex is enabled in the
production environment, so the missing one-minute Airwallex recovery job is an
operational gap. SSLCommerz is currently disabled, so leave its job disabled
until that gateway is deliberately enabled. The configured FX freshness
interval is six hours, but the audit did not expose or validate provider secret
values. Installing a job changes production behavior: validate its secret and
endpoint manually, confirm provider expectations, and obtain change approval
before enabling it.

| Task | Endpoint | Suggested interval | Required when |
| --- | --- | --- | --- |
| Exchange rates | `POST /api/internal/exchange-rates/refresh` | Every 6 hours | Multi-currency/FX is enabled |
| SSLCommerz recovery | `POST /api/payments/sslcommerz/reconcile` | Every 5 minutes | SSLCommerz is enabled |
| Airwallex event/payment recovery | `POST /api/payments/airwallex/reconcile` | Every minute | Airwallex is enabled |

All three expect `Authorization: Bearer <dedicated-secret>`. Map
`CRON_SECRET` to the exchange-rate job, `PAYMENT_RECONCILIATION_SECRET` to the
SSLCommerz job, and `AIRWALLEX_RECONCILIATION_SECRET` to the Airwallex job.
Payment endpoints accept POST only. A successful exchange-rate response
contains six currency rows; provider/database failure returns 503 and retains
the last good rates. SSLCommerz examines a bounded batch of payment attempts
stale for at least ten minutes. Airwallex drains durable webhook work before
reconciling a bounded payment batch.

Keep bearer values out of the crontab and process arguments. Create one
root-managed curl configuration file for each enabled task:

```bash
sudo systemctl enable --now cron
sudo install -d -o bangbuy -g bangbuy -m 0700 /var/log/bangbuy
sudo install -d -o root -g bangbuy -m 0750 /etc/bangbuy/cron
# Repeat these three commands for each enabled filename in the table below.
sudoedit /etc/bangbuy/cron/TASK_NAME.curl
sudo chown root:bangbuy /etc/bangbuy/cron/TASK_NAME.curl
sudo chmod 0640 /etc/bangbuy/cron/TASK_NAME.curl
```

Each file uses this format, with the one exact URL and matching secret from the
table below. Never paste a real value into this guide:

```text
url = "REPLACE_ENDPOINT_URL"
request = "POST"
header = "Authorization: Bearer REPLACE_DEDICATED_SECRET"
connect-timeout = 5
max-time = 50
retry = 2
proto = "=https"
fail
silent
show-error
output = "/dev/null"
```

| Protected file | Endpoint URL | Matching application variable |
| --- | --- | --- |
| `exchange-rates.curl` | `https://bangbuy.net/api/internal/exchange-rates/refresh` | `CRON_SECRET` |
| `sslcommerz-reconcile.curl` | `https://bangbuy.net/api/payments/sslcommerz/reconcile` | `PAYMENT_RECONCILIATION_SECRET` |
| `airwallex-reconcile.curl` | `https://bangbuy.net/api/payments/airwallex/reconcile` | `AIRWALLEX_RECONCILIATION_SECRET` |

Test an enabled file as the scheduler account. The header remains inside the
protected file and does not appear in `ps` output:

```bash
sudo -u bangbuy /usr/bin/curl \
  --config /etc/bangbuy/cron/airwallex-reconcile.curl
```

Expect 2xx for a working task. A missing/wrong credential must return 401; an
unconfigured provider can return 503. Rotate the application variable and curl
file together, then restart the application and retest.

Install only the crontab lines for enabled features. Production uses UTC, so
these expressions run in UTC:

```cron
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin

0 */6 * * * /usr/bin/flock --nonblock /run/lock/bangbuy-exchange-rates.lock /usr/bin/curl --config /etc/bangbuy/cron/exchange-rates.curl >> /var/log/bangbuy/exchange-rates.log 2>&1
*/5 * * * * /usr/bin/flock --nonblock /run/lock/bangbuy-sslcommerz.lock /usr/bin/curl --config /etc/bangbuy/cron/sslcommerz-reconcile.curl >> /var/log/bangbuy/sslcommerz-reconcile.log 2>&1
* * * * * /usr/bin/flock --nonblock /run/lock/bangbuy-airwallex.lock /usr/bin/curl --config /etc/bangbuy/cron/airwallex-reconcile.curl >> /var/log/bangbuy/airwallex-reconcile.log 2>&1
```

Open the target crontab with `sudo -u bangbuy -H crontab -e`; never pipe an
unreviewed file into `crontab`.

These expressions use the cron daemon's local timezone. Check it with
`timedatectl`; the audited host reports `Etc/UTC`. The three application jobs
are interval-based, while the daily backup time in section 12 is 02:30 UTC.

Confirm the installed crontab and protected-file metadata without printing file
contents:

```bash
sudo -u bangbuy -H crontab -l
sudo stat -c '%n owner=%U group=%G mode=%a' /etc/bangbuy/cron/*.curl
```

Provision a weekly GeoLite2 update separately as root after the manual
`geoipupdate` succeeds. Create `/etc/cron.d/bangbuy-geoip` with:

```cron
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
17 3 * * 3 root /usr/bin/geoipupdate && /usr/sbin/nginx -t && /usr/bin/systemctl reload nginx
```

Set that file to `root:root` mode `0644`, verify the first manual run, and alert
when the database age exceeds eight days. At audit time only Certbot's renewal
timer was present; the GeoIP update, three application jobs, and backup job were
absent.

Review execution with:

```bash
sudo -u bangbuy tail -n 100 /var/log/bangbuy/exchange-rates.log
sudo -u bangbuy tail -n 100 /var/log/bangbuy/sslcommerz-reconcile.log
sudo -u bangbuy tail -n 100 /var/log/bangbuy/airwallex-reconcile.log
sudo journalctl -u cron --since "8 hours ago" --no-pager
```

Prevent cron and PM2 logs from filling the disk. Open
`/etc/logrotate.d/bangbuy` with `sudoedit` and add:

```text
/var/log/bangbuy/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    su bangbuy bangbuy
    create 0600 bangbuy bangbuy
}

/home/bangbuy/.pm2/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    su bangbuy bangbuy
    create 0600 bangbuy bangbuy
}
```

The PM2 stanza is harmless when systemd is selected and no matching files
exist. Check the policy without forcing a rotation:

```bash
sudo logrotate --debug /etc/logrotate.d/bangbuy
```

On distributions using `crond`, inspect `journalctl -u crond` instead of the
`cron` unit.

## 12. PostgreSQL backup procedure

**Audited status:** production is Neon PostgreSQL 18.6, while the VPS has no
PostgreSQL client, backup directory, backup script, backup log, or scheduled
backup. Treat the database as currently lacking a verified independent logical
backup until a dump is created, copied off-host, and test-restored. Enable Neon
point-in-time recovery/provider snapshots when the account plan supports them,
but also keep an independent logical dump outside Neon.

A database backup does not contain `.env`, payment secrets, repository files,
or the underlying images stored by ImgBB; database rows contain only their
hosted URLs. Back those assets/configurations up through their respective
providers.

Never write `.dump`, `.sql`, or checksum files into the Git checkout. Database
exports can contain customer, order, authentication, and payment metadata and
can be committed accidentally because this repository does not currently
ignore those extensions. Use `/var/backups/bangbuy` with restrictive
permissions and encrypted off-host storage.

### Completeness boundary and backup evidence record

The section 12 `pg_dump` command has no schema/table filters, so a successful
archive is a logical dump of all dumpable schema and data in the selected
BangBuy application database, including large objects. It is **not** a complete
PostgreSQL cluster or complete application-disaster-recovery set:

- `--no-owner --no-privileges` deliberately omits original ownership and ACLs;
- cluster-global roles and tablespaces require a separately protected globals
  record or provider-specific recreation procedure;
- Neon project, branch, network, and PITR configuration belongs to the provider
  control plane; and
- environment secrets, Git releases, and ImgBB image bytes are separate assets.

Call a dump a **complete logical backup of the BangBuy application database**
only after the command exits successfully, its local and off-site SHA-256/byte
size match, and the exact archive passes the clean-database restore test in
section 13. Until then call it a backup candidate. For every backup, retain an
immutable evidence record outside the Git checkout containing:

| Evidence field | Required value |
| --- | --- |
| Source | Neon project/branch/database identifiers and PostgreSQL version, without credentials |
| Release | Proven deployed Git SHA/tag, or explicitly `UNVERIFIED` |
| Dump | Backup ID, basename, custom format, start/end UTC, exact `pg_dump` version and exit status |
| Integrity | Exact byte count, SHA-256, local verification, off-site object/version ID, encryption/retention, and remote verification |
| Contents | `pg_restore --list` result and expected migration/schema inventory |
| Restore test | Test ID/date, explicitly empty target identity, exact command, exit status, validations, smoke-test result, operator, and approver |

The current evidence values remain `backup ID: NONE FOUND`, `date: N/A`,
`size: N/A`, `SHA-256: N/A`, and `clean restore: NOT VERIFIED`. These are audit
results, not placeholders for a successful backup.

### Authentication for unattended dumps

Open `/home/bangbuy/.pgpass` with `sudoedit` and add the production **direct**
Neon endpoint (never the `-pooler` hostname):

```text
NEON_DIRECT_HOST:5432:APP_DATABASE:APP_USER:REPLACE_DATABASE_PASSWORD
```

Then restrict it:

```bash
sudo chown bangbuy:bangbuy /home/bangbuy/.pgpass
sudo chmod 600 /home/bangbuy/.pgpass
sudo install -d -o bangbuy -g bangbuy -m 0700 /var/backups/bangbuy
```

Escape literal `:` and `\` characters in `.pgpass` with a backslash. Obtain the
host, database, and user from the protected `DIRECT_URL`/Neon console without
copying the URL into shell history. Do not put `DATABASE_URL`, `DIRECT_URL`, or
a password on a command line where it can appear in process listings.

### Manual backup

Set the non-secret connection coordinates from the direct Neon endpoint and
verify that `pg_dump` is major version 18 or newer. The password is read from
`.pgpass`. Create a custom-format, compressed, portable dump:

```bash
sudo -iu bangbuy
set -euo pipefail
umask 077
export PGHOST=NEON_DIRECT_HOST
export PGPORT=5432
export PGDATABASE=APP_DATABASE
export PGUSER=APP_USER
export PGSSLMODE=verify-full

pg_dump_major=$(pg_dump --version | sed -nE \
  's/^pg_dump \(PostgreSQL\) ([0-9]+).*/\1/p')
if [[ ! "$pg_dump_major" =~ ^[0-9]+$ ]] || (( pg_dump_major < 18 )); then
  echo 'PostgreSQL 18 or newer pg_dump is required' >&2
  exit 1
fi
backup_dir=/var/backups/bangbuy
backup_name="bangbuy_$(date -u +%Y%m%dT%H%M%SZ).dump"
backup_file="${backup_dir}/${backup_name}"
pg_dump --no-password --lock-wait-timeout=30s \
  --format=custom --compress=9 \
  --no-owner --no-privileges --file="$backup_file"
pg_restore --list "$backup_file" >/dev/null
(
  cd "$backup_dir"
  sha256sum -- "$backup_name" > "${backup_name}.sha256"
  sha256sum --check "${backup_name}.sha256"
)
ls -lh "$backup_file" "${backup_file}.sha256"
unset PGHOST PGPORT PGDATABASE PGUSER PGSSLMODE
exit
```

`pg_dump` takes a transactionally consistent logical snapshot while the app is
running. The successful `pg_restore --list` check proves that the archive can
be read, not that every row restores correctly; perform regular test restores.

Copy backups off the VPS to encrypted object storage or another failure domain.
A reasonable starting retention policy is 14 daily, 8 weekly, and 12 monthly
copies. Enable provider-side versioning/object lock where appropriate, monitor
backup age and size, and alert on a failed job. A backup that exists only on
the application server is not a disaster-recovery backup.

Run `pg_dump` against the direct/session endpoint, never the transaction
pooler. For this order/payment workload, provider point-in-time recovery is
strongly recommended; daily logical dumps alone can lose up to a day of
transactions.

### Automated daily database backup

Open a new root-owned executable with
`sudoedit /usr/local/sbin/bangbuy-backup`, then add:

```bash
#!/usr/bin/env bash
set -euo pipefail
umask 077

lock_file=/run/lock/bangbuy-backup.lock
exec 9>"$lock_file"
if ! /usr/bin/flock --nonblock 9; then
  echo "A BangBuy backup is already running" >&2
  exit 75
fi

backup_dir=/var/backups/bangbuy
stamp=$(date -u +%Y%m%dT%H%M%SZ)
final_file="${backup_dir}/bangbuy_${stamp}.dump"
partial_file="${final_file}.partial"
final_name="${final_file##*/}"
db_host=NEON_DIRECT_HOST
db_port=5432
db_name=APP_DATABASE
db_user=APP_USER
export PGSSLMODE=verify-full

pg_dump_major=$(/usr/bin/pg_dump --version | /usr/bin/sed -nE \
  's/^pg_dump \(PostgreSQL\) ([0-9]+).*/\1/p')
if [[ ! "$pg_dump_major" =~ ^[0-9]+$ ]] || (( pg_dump_major < 18 )); then
  echo "PostgreSQL 18 or newer pg_dump is required" >&2
  exit 1
fi

cleanup() {
  rm -f -- "$partial_file"
}
trap cleanup EXIT

/usr/bin/pg_dump --host="$db_host" --port="$db_port" --username="$db_user" \
  --dbname="$db_name" --no-password --lock-wait-timeout=30s \
  --format=custom --compress=9 \
  --no-owner --no-privileges --file="$partial_file"
/usr/bin/pg_restore --list "$partial_file" >/dev/null
mv -- "$partial_file" "$final_file"
(
  cd -- "$backup_dir"
  /usr/bin/sha256sum -- "$final_name" > "${final_name}.sha256"
  /usr/bin/sha256sum --check "${final_name}.sha256"
)

# This organization-owned helper must upload both files, verify the remote
# checksum, and exit nonzero if the off-site copy is not durable and readable.
offsite_helper=/usr/local/sbin/bangbuy-offsite-copy
test -x "$offsite_helper"
"$offsite_helper" "$final_file" "${final_file}.sha256"

# Local rolling window is applied only after off-site verification succeeds.
/usr/bin/find "$backup_dir" -maxdepth 1 -type f \
  -name 'bangbuy_*.dump' -mtime +14 -delete
/usr/bin/find "$backup_dir" -maxdepth 1 -type f \
  -name 'bangbuy_*.dump.sha256' -mtime +14 -delete
```

Install it without allowing the application account to modify the executable:

```bash
sudo chown root:bangbuy /usr/local/sbin/bangbuy-backup
sudo chmod 0750 /usr/local/sbin/bangbuy-backup
sudo -iu bangbuy /usr/local/sbin/bangbuy-backup
```

Replace the four `db_*` placeholders from the protected direct Neon connection
metadata and use the absolute path of the PostgreSQL 18 (or newer) `pg_dump`
binary. If the provider does not expose a logical-dump connection or
database-creation privileges, use its snapshot/PITR workflow and test that
workflow, while retaining an independent export whenever possible.

`/usr/local/sbin/bangbuy-offsite-copy` is an operations integration point, not
a file in this repository. Implement it for the approved backup provider with
encrypted transport/storage and remote checksum verification before scheduling
the job. Configure cron-failure and backup-age alerts; without that successful
off-site step, this is only a local copy, not disaster recovery.

After the manual run succeeds, add this to the `bangbuy` crontab:

```cron
30 2 * * * /usr/local/sbin/bangbuy-backup >> /var/log/bangbuy/backup.log 2>&1
```

The script’s delete commands are intentionally restricted to
`/var/backups/bangbuy` and the `bangbuy_*.dump[.sha256]` patterns. Change both
retention commands together if the naming scheme changes.

## 13. PostgreSQL restoration procedure

Practice this procedure on a separate database at least monthly. Never make
the first restore test during an incident, and never restore directly over the
only production copy.

For production, create an explicitly **empty database** in an isolated Neon
branch/project and use its direct endpoint. A normal child branch copies its
parent's schema and data, so the inherited production database is not an empty
`pg_restore` target; create a new empty database inside the isolated branch or
use a separate empty project. Do not point restore commands at a pooled or
production hostname. Keep the original production branch and dump unchanged
until validation and business sign-off are complete. See Neon's
[database/branch behavior](https://neon.com/docs/manage/databases) when
provisioning the target.

Restore only archives produced by a trusted backup pipeline. A PostgreSQL
archive can contain definitions that execute code during restoration, so do
not run `pg_restore` on an untrusted dump.

### Verify and restore into a new database

1. Select a backup, verify its checksum, and inspect its table of contents:

   ```bash
   sudo -iu bangbuy
   cd /var/backups/bangbuy
   sha256sum --check bangbuy_YYYYMMDDTHHMMSSZ.dump.sha256
   pg_restore --list bangbuy_YYYYMMDDTHHMMSSZ.dump | less
   exit
   ```

2. In the Neon control plane, create an isolated branch/project, then add a new
   empty database such as `bangbuy_restore_YYYYMMDD`; do not select the copied
   production database. Record its direct host, database, and recovery role in
   the password manager. If testing on a self-managed PostgreSQL host, the
   equivalent local command is:

   ```bash
   sudo -u postgres createdb --owner=bangbuy --encoding=UTF8 \
     --template=template0 bangbuy_restore_YYYYMMDD
   ```

   Do not run that local `sudo -u postgres` command against Neon.

3. Ensure `.pgpass` has a line for the isolated target, set its non-secret
   direct connection coordinates, then restore atomically:

   ```bash
   sudo -iu bangbuy
   export PGHOST=RESTORE_NEON_DIRECT_HOST
   export PGPORT=5432
   export PGDATABASE=bangbuy_restore_YYYYMMDD
   export PGUSER=RESTORE_APP_USER
   export PGSSLMODE=verify-full
   psql -X -v ON_ERROR_STOP=1 -Atc \
     "SELECT current_database(), current_user, current_setting('server_version');"
   object_count=$(psql -X -v ON_ERROR_STOP=1 -Atc \
     "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S','f');")
   test "$object_count" -eq 0
   pg_restore --exit-on-error \
      --single-transaction --no-owner --no-privileges \
      --dbname="$PGDATABASE" \
      /var/backups/bangbuy/bangbuy_YYYYMMDDTHHMMSSZ.dump
   exit
   ```

4. Validate the restored database before any switchover:

   ```bash
   sudo -iu bangbuy
   export PGHOST=RESTORE_NEON_DIRECT_HOST
   export PGPORT=5432
   export PGDATABASE=bangbuy_restore_YYYYMMDD
   export PGUSER=RESTORE_APP_USER
   export PGSSLMODE=verify-full
   psql -X -c 'SELECT COUNT(*) AS users FROM "User";'
   psql -X -c 'SELECT COUNT(*) AS orders FROM "Order";'
   psql -X -c 'SELECT "migration_name", "finished_at" FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 5;'
   psql -X -c 'ANALYZE;'
   unset PGHOST PGPORT PGDATABASE PGUSER PGSSLMODE
   exit
   ```

5. Check migration compatibility from the application directory. Override
   both URLs in a temporary subshell so a lingering production `DIRECT_URL`
   cannot be used by mistake. The prompted value is not written to shell
   history:

   ```bash
   sudo -iu bangbuy
   cd /var/www/bangbuy
   (
     read -rsp "Restore database URL: " BANGBUY_RESTORE_DATABASE_URL
     echo
     export DATABASE_URL="$BANGBUY_RESTORE_DATABASE_URL"
     export DIRECT_URL="$BANGBUY_RESTORE_DATABASE_URL"
     npx prisma migrate status
   )
   exit
   ```

6. Point a non-production app process at the restored database and smoke-test
   login, catalog reads, order history, and admin reports. Only after validation
   should an incident runbook stop cron/application writes, update the
   production database URL, apply any migrations newer than the backup, and
   restart the app.

### Restoring a plain SQL dump

The custom archive above is preferred because it can be listed and selectively
restored. If an existing backup is a trusted plain `.sql` file created by
`pg_dump --format=plain` without `--create`, do not pass it to `pg_restore`.
Verify its separately stored checksum, create a new empty database as in step 2,
then replay it with `psql` and stop on the first SQL error:

```bash
sudo -iu bangbuy
cd /var/backups/bangbuy
export PGHOST=RESTORE_NEON_DIRECT_HOST
export PGPORT=5432
export PGDATABASE=bangbuy_restore_YYYYMMDD
export PGUSER=RESTORE_APP_USER
export PGSSLMODE=verify-full
sha256sum --check bangbuy_YYYYMMDDTHHMMSSZ.sql.sha256
psql -X --set=ON_ERROR_STOP=on \
  --single-transaction --file=bangbuy_YYYYMMDDTHHMMSSZ.sql
unset PGHOST PGPORT PGDATABASE PGUSER PGSSLMODE
exit
```

If the SQL was produced by `pg_dumpall`, includes `CREATE DATABASE`, or requires
commands that cannot run inside a transaction, inspect its provenance and
contents and write a separate tested recovery plan; do not remove the safety
flags during an incident by guesswork. Apply the same row-count, migration, and
application smoke tests used for the custom archive.

For a full cluster disaster, first provision a compatible PostgreSQL server,
recreate the non-superuser `bangbuy` role and an empty owned database, restore
the selected dump, restore secrets separately, run `prisma migrate status`,
then use `prisma migrate deploy` only if the deployed code contains migrations
newer than the backup. Preserve the original dump throughout recovery.

## 14. Image and uploaded-file backup and recovery

BangBuy has **no persistent local uploads directory**. `/api/upload` accepts an
authenticated image of at most 32 MiB, buffers it, and forwards it to ImgBB.
PostgreSQL stores hosted URLs, not image bytes. ImgBB's returned deletion URL
is not persisted. Consequently:

- a PostgreSQL dump restores references but not the image objects;
- backing up `/var/www/bangbuy` does not back up uploaded images;
- `.next/cache` is disposable and must not be treated as an asset backup; and
- Git already protects the small, release-owned `public/` assets, so restore
  those by deploying the verified Git commit.

**Audited status:** no image manifest, downloaded object set, off-site copy, or
asset-restore test was found on the VPS.

### Asset backup scope

Inventory every ImgBB URL referenced by these fields: `User.image`,
`Category.image`, `Category.ogImage`, `Brand.logo`, `Brand.ogImage`,
`Manufacturer.logo`, `Product.ogImage`, image-text entries in
`Product.descriptionBlocks`, `ProductVariant.image`, `ProductImage.url`,
`OrderItem.productImage`, `Testimonial.image`, and `Banner.image`. Order-item
snapshots matter even when a catalog image has since changed.

The download procedure below deliberately accepts only the audited ImgBB object
host, `i.ibb.co`; it must not become a general-purpose URL fetcher. Before each
backup-policy review, export the same fields without the host filter, group by
hostname, and account for every result. OAuth avatars and other third-party
references may be recoverable from their source rather than owned by BangBuy;
any organization-owned object on another host needs a separately approved,
host-restricted backup procedure.

An asset archive and its database dump must share one backup ID and one
consistent catalog state. Stop image-changing application/cron writes, create
the database dump, export this manifest before resuming writes, then perform
the slower downloads after service resumes. A no-maintenance alternative is to
restore the exact dump into an isolated database and export the manifest from
that restore. Never pair a live manifest captured later with an unrelated dump.

With the section 12 direct Neon connection variables exported, create a
deduplicated URL manifest. Set `backup_id` to the timestamp already present in
the paired `bangbuy_<timestamp>.dump` filename. The output contains no image
bytes and must stay beside the protected backup, not in the Git checkout:

```bash
sudo -iu bangbuy
set -euo pipefail
umask 077
export PGHOST=NEON_DIRECT_HOST
export PGPORT=5432
export PGDATABASE=APP_DATABASE
export PGUSER=APP_USER
export PGSSLMODE=verify-full

backup_id=REPLACE_WITH_MATCHING_DATABASE_DUMP_TIMESTAMP
if [[ ! "$backup_id" =~ ^[0-9]{8}T[0-9]{6}Z$ ]]; then
  echo 'backup_id must be a UTC dump timestamp such as 20260904T023000Z' >&2
  exit 1
fi
test -f "/var/backups/bangbuy/bangbuy_${backup_id}.dump"
asset_dir="/var/backups/bangbuy/assets_${backup_id}"
test ! -e "$asset_dir"
install -d -m 0700 "$asset_dir/objects"

psql -X -v ON_ERROR_STOP=1 -At <<'SQL' > "$asset_dir/imgbb-urls.txt"
WITH image_urls(url) AS (
  SELECT "image" FROM "User"
  UNION ALL SELECT "image" FROM "Category"
  UNION ALL SELECT "ogImage" FROM "Category"
  UNION ALL SELECT "logo" FROM "Brand"
  UNION ALL SELECT "ogImage" FROM "Brand"
  UNION ALL SELECT "logo" FROM "Manufacturer"
  UNION ALL SELECT "ogImage" FROM "Product"
  UNION ALL SELECT "image" FROM "ProductVariant"
  UNION ALL SELECT "url" FROM "ProductImage"
  UNION ALL SELECT "productImage" FROM "OrderItem"
  UNION ALL SELECT "image" FROM "Testimonial"
  UNION ALL SELECT "image" FROM "Banner"
  UNION ALL
  SELECT block ->> 'imageUrl'
  FROM "Product" AS product
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE
      WHEN jsonb_typeof(product."descriptionBlocks") = 'array'
        THEN product."descriptionBlocks"
      ELSE '[]'::jsonb
    END
  ) AS block
)
SELECT DISTINCT url
FROM image_urls
WHERE url LIKE 'https://i.ibb.co/%'
ORDER BY url;
SQL

wc -l "$asset_dir/imgbb-urls.txt"

# Writes may resume after this manifest is safely captured. Download from the
# fixed manifest, not from another live database query.
printf 'object_key\tsha256\tbytes\tmime_type\turl\n' > "$asset_dir/index.tsv"
while IFS= read -r url; do
  url_key=$(printf '%s' "$url" | sha256sum | awk '{print $1}')
  partial_file="$asset_dir/${url_key}.partial"
  case "$url" in
    https://i.ibb.co/*) ;;
    *) echo "Refusing unexpected asset URL: $url" >&2; exit 1 ;;
  esac
  curl --proto '=https' --tlsv1.2 --fail \
    --retry 3 --connect-timeout 10 \
    --max-time 120 --max-filesize 41943040 \
    --output "$partial_file" "$url"
  test "$(stat -c '%s' "$partial_file")" -le 41943040
  mime_type=$(file --brief --mime-type "$partial_file")
  case "$mime_type" in
    image/jpeg|image/png|image/webp|image/gif|image/bmp|image/tiff|image/avif) ;;
    *) echo "Unexpected content type for $url" >&2; exit 1 ;;
  esac
  checksum=$(sha256sum "$partial_file" | awk '{print $1}')
  object_key="$checksum"
  object_file="$asset_dir/objects/$object_key"
  if test -e "$object_file"; then
    cmp --silent "$partial_file" "$object_file"
    rm -f -- "$partial_file"
  else
    mv -- "$partial_file" "$object_file"
  fi
  bytes=$(stat -c '%s' "$object_file")
  printf '%s\t%s\t%s\t%s\t%s\n' \
    "$object_key" "$checksum" "$bytes" "$mime_type" "$url" \
    >> "$asset_dir/index.tsv"
done < "$asset_dir/imgbb-urls.txt"

expected=$(wc -l < "$asset_dir/imgbb-urls.txt")
indexed=$(tail -n +2 "$asset_dir/index.tsv" | wc -l)
test "$expected" -eq "$indexed"

archive="/var/backups/bangbuy/bangbuy_assets_${backup_id}.tar.gz"
test ! -e "$archive"
tar -C "/var/backups/bangbuy" -czf "$archive" "assets_${backup_id}"
archive_dir=${archive%/*}
archive_name=${archive##*/}
(
  cd "$archive_dir"
  sha256sum -- "$archive_name" > "${archive_name}.sha256"
  sha256sum --check "${archive_name}.sha256"
)

offsite_helper=/usr/local/sbin/bangbuy-offsite-copy
test -x "$offsite_helper"
"$offsite_helper" "$archive" "${archive}.sha256"

# Delete only the verified staging tree; keep 14 days of local archives.
case "$asset_dir" in
  /var/backups/bangbuy/assets_*) find "$asset_dir" -depth -delete ;;
  *) echo "Refusing unsafe staging cleanup: $asset_dir" >&2; exit 1 ;;
esac
find /var/backups/bangbuy -maxdepth 1 -type f \
  -name 'bangbuy_assets_*.tar.gz' -mtime +14 -delete
find /var/backups/bangbuy -maxdepth 1 -type f \
  -name 'bangbuy_assets_*.tar.gz.sha256' -mtime +14 -delete
unset PGHOST PGPORT PGDATABASE PGUSER PGSSLMODE
exit
```

The commands intentionally stop on a missing source object; do not call an
incomplete run successful. Add this procedure to a root-owned wrapper with
`set -euo pipefail` and run it daily after the database dump. Copy the archive
and checksum to encrypted, versioned object storage in a different failure
domain, verify the remote object size/checksum, then apply the same 14 daily,
8 weekly, and 12 monthly retention policy. Monitor manifest count, failed
downloads, backup age, and off-site copy status.

Long term, prefer account-owned S3-compatible storage with versioning/object
lock and documented lifecycle policies over relying on a third-party image URL
as the sole copy. Never store an ImgBB/API key in the manifest or archive.

### Asset recovery test

Quarterly, restore one archive into an isolated staging bucket, verify every
file against `index.tsv`, and serve a sample of each image type. If the
recovered objects use a new hostname, add that exact HTTPS hostname to
`next.config.ts` `images.remotePatterns`, rebuild, and test staging before any
database URL rewrite. Preserve the original URL-to-object-key mapping.

There is no automated in-place image restore in the application today. During
an incident, upload recovered objects to controlled storage, generate an old
URL to new URL mapping, update a staging database first, and verify storefront,
admin, order-history, and PDF image rendering. Apply reviewed, table-specific
updates to production only after a fresh database backup; never run a blanket
string replacement over every text/JSON column.

## 15. Administrator account recovery

There is no administrator seed/bootstrap command and no forgot-password token
flow. Registration creates a `USER`; normal role changes require a working
administrator. The service prevents demotion of the final administrator, but
it cannot help when that account's login is lost.

Use this recovery order:

1. If any administrator can still log in, use **Admin -> Users** to promote a
   second, identity-verified account. No direct database access is needed.
2. If all admin access is lost, take and verify a database backup, obtain
   incident/change approval, and choose an existing account whose owner has
   been verified out of band and can already sign in. If necessary, register a
   new account through the normal application flow first.
3. Connect to the **direct** production database using PostgreSQL 18 `psql` and
   the protected `.pgpass` setup from section 12. Do not expose Neon or port
   5432 publicly and do not launch Prisma Studio on a public interface.
   First print the target identity and stop unless the database, role, server
   version, and direct hostname exactly match the approved production change:

   ```bash
   sudo -iu bangbuy
   export PGHOST=NEON_DIRECT_HOST
   export PGPORT=5432
   export PGDATABASE=APP_DATABASE
   export PGUSER=RECOVERY_DB_ROLE
   export PGSSLMODE=verify-full
   psql -X -v ON_ERROR_STOP=1 -Atc \
     "SELECT current_database(), current_user, current_setting('server_version'), inet_server_addr();"
   psql -X
   ```

   Resolve and compare `PGHOST` with the direct endpoint recorded in the
   password manager; `inet_server_addr()` alone does not identify the Neon
   branch. Keep this shell open for the following transaction.

4. Lock and inspect the exact account before changing one row in that `psql`
   session:

   ```sql
   \set ON_ERROR_STOP on
   \prompt 'Exact lower-case recovery email: ' target_email

   BEGIN;
   SELECT "id", "email", "provider", "role"
   FROM "User"
   WHERE "email" = :'target_email'
   FOR UPDATE;
   ```

   Continue only if exactly the intended account is returned. Otherwise run
   `ROLLBACK;` and investigate.

5. Promote only that account and inspect the returned identity:

   ```sql
   UPDATE "User"
   SET "role" = 'ADMIN'::"Role", "updatedAt" = CURRENT_TIMESTAMP
   WHERE "email" = :'target_email'
     AND "role" = 'USER'::"Role"
   RETURNING "id", "email", "role";
   ```

   Type `COMMIT;` only when the returned account is correct. Use `ROLLBACK;`
   for an empty or unexpected result.

   After either outcome, leave `psql` and clear the connection coordinates:

   ```text
   \q
   unset PGHOST PGPORT PGDATABASE PGUSER PGSSLMODE
   exit
   ```

6. Sign out and sign back in so the Auth.js JWT receives the new role. Verify
   the `/admin` area, create/confirm a second controlled administrator, and
   remove temporary privilege through the UI only after permanent access is
   proven.

Direct SQL bypasses the application's best-effort admin activity log. Record
the approver, operator, time, reason, target user ID, backup ID, SQL result, and
post-recovery checks in the external incident record. Never promote every user,
insert a hand-built user, store a plaintext password, or perform an unreviewed
production `UPDATE`. If the original problem is a lost credential password,
recover access through a separately verified account as above; implementing a
tokenized password-reset feature is safer than manually inventing password
hashes during an incident.

## 16. Routine deployment/update runbook

The following is a safe, simple in-place update with a maintenance window.
It assumes the section 8 migration to the dedicated `bangbuy` OS account and
its PM2 home has been completed. If the audited root-owned PM2 process is still
in use, complete that controlled migration first; do not run these
PM2 commands against a second, empty PM2 daemon while the
root-owned application keeps serving traffic.

Stop and drain the selected process first, then take the rollback backup so no
order or payment write can commit between the snapshot and the migration. Keep
the app stopped before replacing `node_modules` or `.next`; both are read by
the running server.

1. Stop exactly one selected process manager and wait for it to report stopped:

   ```bash
   sudo -iu bangbuy bash -lc \
     '. /home/bangbuy/.nvm/nvm.sh && pm2 stop bangbuy && pm2 status'
   # Or, for the systemd option:
   sudo systemctl stop bangbuy
   sudo systemctl status bangbuy --no-pager
   ```

2. Take the pre-deployment backup and do not continue unless it succeeds:

   ```bash
   # Section 12's script uses the managed Neon direct endpoint:
   sudo -iu bangbuy /usr/local/sbin/bangbuy-backup
   # For managed PostgreSQL, a completed provider snapshot/PITR restore point
   # may be used instead when that is the tested backup path.
   ```

3. Install and validate the tested release as `bangbuy`:

   ```bash
   sudo -iu bangbuy
   set -euo pipefail
   cd /var/www/bangbuy

   if test -n "$(git status --porcelain)"; then
     echo 'Refusing deployment from a dirty production checkout' >&2
     exit 1
   fi
   git fetch --prune --tags
   git checkout REPLACE_TESTED_RELEASE_TAG_OR_COMMIT
   test "$(node --version)" = "v22.23.2"
   test "$(npm --version)" = "12.0.2"
   npm ci --include=dev
   npx prisma validate
   npx prisma generate

   npm run lint
   npx tsc --noEmit
   npm test

   npx prisma migrate deploy
   npx prisma migrate status
   npm run build
   exit
   ```

4. Start exactly one selected process manager only after all commands succeed:

   ```bash
   sudo -iu bangbuy bash -lc \
     '. /home/bangbuy/.nvm/nvm.sh && pm2 restart bangbuy --update-env'
   # Or, for the systemd option:
   sudo systemctl start bangbuy
   ```

Scheduled HTTP calls cannot write while the app is stopped; they may record
temporary connection failures in cron logs. Keep the window short so payment
providers do not exhaust their webhook retry policy.

If the backup or a pre-migration check fails, do not migrate. Repair or roll
back the checkout/dependency install and rebuild a consistent release. If a
failure occurs after migration starts, do not blindly start the old release;
first confirm schema compatibility, then either repair forward or execute the
tested database-restore incident plan. Preserve the rollback backup throughout.

For a migration that removes/renames columns or otherwise cannot coexist with
the previous application version, schedule maintenance and stop the app plus
write-producing cron tasks before migration. Prefer expand/migrate/contract
releases so the previous and new versions can overlap safely.

Do not start the process if `npm run build` failed. Investigate first; the
checked-out source and `.next` artifact may now represent different releases.
For zero-downtime requirements, build into versioned release directories and
switch a `current` symlink only after all checks pass; do not run `npm ci` or
`next build` over a directory serving live traffic.

## 17. Post-deployment verification

There is currently no dedicated health endpoint. Use several checks rather
than treating one cached page as proof of health:

```bash
# Node listener is private and responding.
curl -fsS -o /dev/null http://127.0.0.1:3000/robots.txt

# Nginx, TLS, routing, and the storefront all respond.
curl -fsS -o /dev/null https://bangbuy.net/
curl -I https://bangbuy.net/robots.txt
curl -I https://www.bangbuy.net/

# Database migration history is reachable and current.
sudo -iu bangbuy bash -lc \
  '. /home/bangbuy/.nvm/nvm.sh && cd /var/www/bangbuy && npx prisma migrate status'

# Process and proxy logs.
sudo -iu bangbuy bash -lc \
  '. /home/bangbuy/.nvm/nvm.sh && pm2 status'
sudo -iu bangbuy bash -lc \
  '. /home/bangbuy/.nvm/nvm.sh && pm2 logs bangbuy --lines 100 --nostream'
# Or: sudo systemctl status bangbuy --no-pager
sudo tail -n 100 /var/log/nginx/bangbuy.error.log
```

Also verify:

- HTTP redirects to HTTPS, and the certificate covers every served hostname.
- `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_URL`, OAuth redirect URIs, payment
  callbacks/webhooks, and Airwallex’s return URL all use the same public origin.
- Registration/login, an authenticated admin page, image upload, checkout, and
  each enabled payment sandbox flow work before switching gateways live.
- Each enabled scheduler returns success and later appears in cron/application
  logs without exposing credentials.
- A new off-site database backup exists, passes its checksum, and is visible to
  backup monitoring.
- A new image archive has the same object count as its URL manifest, passes its
  checksum, and exists in off-site storage.
- At least two controlled administrator accounts can sign in; no temporary
  recovery privilege remains.
- Only ports 22 (as required), 80, and 443 are publicly reachable; Node 3000 and
  PostgreSQL 5432 are private.

For the project’s cache/SEO behavior and CDN restrictions, also read
[`docs/seo-performance-architecture.md`](docs/seo-performance-architecture.md).
