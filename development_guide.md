# BangBuy development and deployment guide

This guide describes a production deployment of BangBuy as a single Next.js
Node.js process behind Nginx, with PostgreSQL as the database. Commands assume
Ubuntu 24.04 or another systemd-based Debian/Ubuntu server. Replace every
`example.com`, username, password, and path before running the commands.

The reference layout is:

```text
Internet -> Nginx :80/:443 -> Next.js 127.0.0.1:3000 -> PostgreSQL
                                      |
                                      +-> ImgBB, payment providers, FX provider
```

Use one process-management option only: PM2 or systemd. The PM2 examples are
the primary path because the existing operations notes use PM2; a systemd
alternative is included below.

Unless a section explicitly switches to `bangbuy`, run administrative commands
from a separate sudo-capable login. `sudo -iu bangbuy` opens a subshell; run
`exit` when that application-account task is complete.

## 1. Required versions and host packages

### Version baseline

| Component | Required for this repository | Production recommendation |
| --- | --- | --- |
| Node.js | `^20.19`, `^22.12`, or `>=24.0` | Use the current Node 24 LTS release in production. The repository has also been checked locally with `22.22.2`. |
| npm | A version that supports lockfile v3 | Use the npm bundled with the selected Node release; `npm 10+` is suitable. |
| PostgreSQL | PostgreSQL `16` through `18` | Use the latest minor release of one supported major. PostgreSQL 16 is the conservative baseline; use the same major version, or a newer client, for `pg_dump` and `pg_restore`. |
| Nginx | A currently supported distribution package | Use the Ubuntu package and keep security updates enabled. |

Next.js 16 itself permits Node `>=20.9`, but Prisma 7.9.1 has the stricter
Node range shown above. Node 20.9 through 20.18 therefore does **not** satisfy
the complete dependency tree, and the Node 20 release line is now end-of-life
despite appearing in Prisma's engine range. Do not deploy any EOL or non-LTS
release. Node 24 LTS is preferred for a new host so it has a longer remaining
support window than Node 22.

Recheck the official [Node.js release status](https://nodejs.org/en/about/previous-releases),
[PostgreSQL version policy](https://www.postgresql.org/support/versioning/),
and [Prisma database support](https://www.prisma.io/docs/orm/v7/reference/supported-databases)
when refreshing the server image.

The schema uses PostgreSQL-specific JSONB, GIN indexes, transactions, and row
locking. SQLite or MySQL are not substitutes. No optional PostgreSQL extension
is required by the checked-in migrations.

### Host packages

Install the packages appropriate for the server. If PostgreSQL is managed by a
cloud provider, install only the PostgreSQL client locally.

```bash
sudo apt update
sudo apt install -y git curl ca-certificates build-essential nginx \
  postgresql-16 postgresql-client-16 certbot python3-certbot-nginx \
  cron logrotate
```

The `postgresql-client-16` example is correct for PostgreSQL 16. If the server
is PostgreSQL 17 or 18, install a `pg_dump` client of the same or newer major
version (from the PostgreSQL package repository when the distribution does not
ship it). An older `pg_dump` refuses to dump a newer server.

Install a supported Node release from a trusted distribution channel or an
organization-managed image. For a systemd service, a system-wide installation
whose binaries resolve to `/usr/bin/node` and `/usr/bin/npm` is simplest.
Verify the effective versions before continuing:

```bash
node --version
npm --version
psql --version
nginx -v
command -v node
command -v npm
```

If the Node or npm paths are not `/usr/bin/node` and `/usr/bin/npm`, substitute
the output of `command -v` in the systemd unit later in this guide.

## 2. Application account and source checkout

Run the application as an unprivileged account. The account must own the
application directory and the `.next` directory because Next.js writes its
runtime image/ISR cache there.

```bash
sudo adduser --disabled-password --gecos "" bangbuy
sudo install -d -o bangbuy -g bangbuy -m 0750 /var/www/bangbuy
sudo -iu bangbuy
git clone <repository-url> /var/www/bangbuy
cd /var/www/bangbuy
git status --short
exit
```

For a private repository, use a read-only deploy key or the organization’s
artifact pipeline. Do not place a personal access token in the clone URL or in
shell history.

## 3. Install dependencies

The repository uses npm and commits `package-lock.json`. Always install the
locked dependency graph:

```bash
sudo -iu bangbuy
cd /var/www/bangbuy
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

On the first deployment, create the production file from the template, edit
every value for the production environment, and restrict it to the service
account. If `.env` already exists, edit it in place instead of copying over it:

```bash
sudo -iu bangbuy
cd /var/www/bangbuy
if [ ! -e .env ]; then
  cp .env.example .env
fi
chmod 600 .env
vi .env
exit
```

Before distributing or publishing the repository, inspect `.env.example` for
old commented credential values. The current template contains
credential-looking commented examples; treat any value that was ever real as
compromised, rotate it at the provider, and remove it from Git history through
the repository owner’s credential-remediation process. Commenting out a secret
does not make it safe.

At minimum, review these settings:

```dotenv
NODE_ENV=production

DATABASE_URL="postgresql://bangbuy:URL_ENCODED_PASSWORD@127.0.0.1:5432/bangbuy?schema=public&sslmode=disable"
# Required when DATABASE_URL uses PgBouncer or another transaction pooler.
# DIRECT_URL="postgresql://bangbuy:URL_ENCODED_PASSWORD@db.example.com:5432/bangbuy?schema=public&sslmode=verify-full"

SITE_URL=https://example.com
NEXT_PUBLIC_SITE_URL=https://example.com
AUTH_URL=https://example.com
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
AIRWALLEX_RETURN_URL=https://example.com/orders/payment-return

EXCHANGE_RATE_API_KEY=
EXCHANGE_RATE_REFRESH_HOURS=6
CRON_SECRET=

# Leave blank unless a trusted proxy creates and overwrites this header.
GEO_COUNTRY_HEADER=
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

- URL-encode special characters in database usernames and passwords. A local
  loopback database can use `sslmode=disable`; use `sslmode=verify-full` and
  the provider’s trusted CA path for a remote production database.
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
  `https://example.com/api/payments/airwallex/webhook`. SSLCommerz callback
  URLs are generated from `SITE_URL`, so that origin must be publicly reachable.
- If Google sign-in is enabled, register
  `https://example.com/api/auth/callback/google` as an authorized redirect URI.
- `.env` is not a backup. Keep an encrypted copy of production configuration
  in a password manager or secrets system, separate from database backups.

## 5. Create and secure PostgreSQL

### Local PostgreSQL

Enable PostgreSQL, create a non-superuser login, and make it the owner of a
dedicated database:

```bash
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

### Managed PostgreSQL and poolers

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

## 7. Validate and build the release

Run the checks before replacing the live process:

```bash
sudo -iu bangbuy
cd /var/www/bangbuy
npm run lint
npx tsc --noEmit
npm test
npm run build
exit
```

The production artifact is `.next`. This project does not set
`output: "standalone"`, so start it with the package script rather than trying
to run `.next/standalone/server.js`:

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

Install PM2 once, as an administrator, then run the application commands as
the `bangbuy` account:

```bash
sudo npm install --global pm2
sudo -iu bangbuy
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

Enable resurrection after reboot by executing the exact privileged command
printed by `pm2 startup` from the separate sudo-capable login. The printed
command includes the correct PATH, service account, and home directory; do not
replace it with a guessed command. Then verify the generated unit:

```bash
# Run the exact sudo command printed above first, then:
sudo -iu bangbuy pm2 save
sudo systemctl status pm2-bangbuy --no-pager
```

Routine controls are:

```bash
sudo -iu bangbuy pm2 restart bangbuy --update-env
sudo -iu bangbuy pm2 stop bangbuy
sudo -iu bangbuy pm2 start bangbuy
sudo -iu bangbuy pm2 logs bangbuy --lines 200
```

Keep a single PM2 instance in fork mode. This application has an in-process
rate limiter and a filesystem/in-memory Next.js cache. PM2 cluster mode or
multiple servers require a shared rate-limit/cache design, coordinated cache
tag invalidation, a common Server Action encryption key, and version-skew-safe
deployments.

### Option B: systemd

If PM2 is not used, open `/etc/systemd/system/bangbuy.service` with `sudoedit`
and add:

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
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3000
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

Next.js loads `/var/www/bangbuy/.env` because `WorkingDirectory` points at the
application. Do not duplicate secrets in the unit. If npm is installed at a
different absolute path, update `ExecStart`.

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

Create `/etc/nginx/sites-available/bangbuy` with this initial HTTP
configuration. It deliberately proxies all paths to Next.js; do not serve
`/_next` from a hand-written filesystem alias.

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}

server {
    listen 80;
    listen [::]:80;
    # This guide uses one canonical public origin.
    server_name example.com;

    access_log /var/log/nginx/bangbuy.access.log;
    error_log  /var/log/nginx/bangbuy.error.log;

    # The application accepts images up to 32 MiB. Allow multipart overhead.
    client_max_body_size 40m;

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

        # Do not trust visitor-controlled country headers.
        proxy_set_header CF-IPCountry "";
        proxy_set_header X-Vercel-IP-Country "";
        proxy_set_header CloudFront-Viewer-Country "";
        proxy_set_header X-BangBuy-Country "";

        # Preserve App Router streaming/Suspense responses.
        proxy_buffering off;
        proxy_request_buffering on;

        proxy_connect_timeout 10s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

Enable the site and remove the distribution default if it is still enabled:

```bash
sudo ln -s /etc/nginx/sites-available/bangbuy \
  /etc/nginx/sites-enabled/bangbuy
if [ -L /etc/nginx/sites-enabled/default ]; then
  readlink -f /etc/nginx/sites-enabled/default
  sudo unlink /etc/nginx/sites-enabled/default
fi
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

Before removing the default site, confirm the exact symlink shown above is the
one being removed. Keep port 3000 closed publicly; allow only SSH, HTTP, and
HTTPS at the host/cloud firewall.

If Cloudflare or another CDN is in front of Nginx, `$remote_addr` initially
identifies the CDN edge. Configure Nginx real-IP handling **only** for the
provider’s current published IP ranges, restrict direct origin access, and
then continue to pass the overwritten `$remote_addr`. Never trust an arbitrary
incoming `X-Forwarded-For` or country header. For BangBuy’s two supported
country-detection topologies, follow
[`docs/currency-exchange-rates-vps.md`](docs/currency-exchange-rates-vps.md).

Do not add a generic Nginx `proxy_cache` for HTML, RSC, `/api`, `/admin`, auth,
cart, checkout, profile, wishlist, or order traffic. Those responses may be
private or user-specific, and the application already owns Next.js cache
invalidation.

## 10. TLS/SSL with Let’s Encrypt

Before requesting a certificate:

1. Point the domain’s `A`/`AAAA` records to the server.
2. Confirm `curl -I http://example.com` reaches this Nginx host.
3. Permit TCP ports 80 and 443 in both the cloud firewall and host firewall.
4. If a CDN proxy is enabled, ensure its validation mode permits the ACME
   challenge or temporarily use DNS-only mode.

Request the certificate for the canonical origin and let Certbot add HTTPS plus
the HTTP redirect:

```bash
sudo certbot --nginx -d example.com --redirect
sudo nginx -t
sudo systemctl reload nginx
```

After Certbot has created the TLS server, reject unmatched TLS handshakes by
adding this separate default block to the site file:

```nginx
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    ssl_reject_handshake on;
}
```

Validate and reload after adding the block:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

If `www.example.com` is required, add its DNS record and include it in the
certificate request, but configure its HTTP and HTTPS server blocks to return
`308 https://example.com$request_uri`; never proxy both hostnames to the app.
`AUTH_URL` and the application's origin checks expect one canonical host.

Test renewal and inspect the installed timer:

```bash
sudo certbot renew --dry-run
systemctl list-timers --all | grep certbot
```

After HTTPS is working, verify that the environment uses the same canonical
HTTPS origin. Section 4 sets that value before the first build, so no rebuild
is normally needed here. If any `NEXT_PUBLIC_*` value changed, use the stopped,
in-place deployment sequence in section 14; never overwrite a live `.next`
directory.

Do not enable HSTS until HTTPS and renewal have been verified for every served
subdomain. When ready, add this inside the TLS `server` block and reload Nginx:

```nginx
add_header Strict-Transport-Security "max-age=31536000" always;
```

Add `includeSubDomains` only when every subdomain is permanently HTTPS. Never
copy certificate private keys into the repository or application directory.

## 11. Scheduled tasks

BangBuy does not run an in-process scheduler. Linux cron must call the protected
HTTP endpoints so the task uses the live application’s validation, locking,
provider clients, and cache invalidation.

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

Enable cron and create its protected output directory before installing the
every-minute job:

```bash
sudo systemctl enable --now cron
sudo install -d -o bangbuy -g bangbuy -m 0700 /var/log/bangbuy
sudo -u bangbuy -H crontab -e
```

Install only the lines for enabled features and replace all secrets/domains:

```cron
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin

0 */6 * * * curl --connect-timeout 5 --max-time 50 --retry 2 -fsS -X POST -H "Authorization: Bearer REPLACE_FX_SECRET" https://example.com/api/internal/exchange-rates/refresh >> /var/log/bangbuy/exchange-rates.log 2>&1
*/5 * * * * curl --connect-timeout 5 --max-time 50 --retry 2 -fsS -X POST -H "Authorization: Bearer REPLACE_SSLCOMMERZ_SECRET" https://example.com/api/payments/sslcommerz/reconcile >> /var/log/bangbuy/sslcommerz-reconcile.log 2>&1
* * * * * curl --connect-timeout 5 --max-time 50 --retry 2 -fsS -X POST -H "Authorization: Bearer REPLACE_AIRWALLEX_SECRET" https://example.com/api/payments/airwallex/reconcile >> /var/log/bangbuy/airwallex-reconcile.log 2>&1
```

These expressions use the cron daemon's local timezone. Check it with
`timedatectl`; the three application jobs are interval-based, while the daily
backup time in section 12 is 02:30 in that timezone.

Confirm the installed crontab:

```bash
sudo -u bangbuy -H crontab -l
```

The secrets are readable by anyone who can inspect this account’s crontab, so
restrict access to the account. For stronger separation, place each header in
a root-managed curl configuration file readable by the scheduler instead of
embedding it in the crontab.

Test each enabled endpoint manually before waiting for cron:

```bash
read -rsp "Scheduler secret: " BANGBUY_SCHEDULER_SECRET; echo
curl -i -fsS -X POST \
  -H "Authorization: Bearer ${BANGBUY_SCHEDULER_SECRET}" \
  https://example.com/api/internal/exchange-rates/refresh
unset BANGBUY_SCHEDULER_SECRET
```

Use the corresponding endpoint and secret for each payment provider. Missing
or incorrect credentials must return 401. An unconfigured payment task may
return 503. Review execution with:

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

A database backup does not contain `.env`, payment secrets, repository files,
or the underlying images stored by ImgBB; database rows contain only their
hosted URLs. Back those assets/configurations up through their respective
providers.

Never write `.dump`, `.sql`, or checksum files into the Git checkout. Database
exports can contain customer, order, authentication, and payment metadata and
can be committed accidentally because this repository does not currently
ignore those extensions. Use `/var/backups/bangbuy` with restrictive
permissions and encrypted off-host storage.

### Authentication for unattended dumps

For a local database, open `/home/bangbuy/.pgpass` with `sudoedit` and add:

```text
127.0.0.1:5432:*:bangbuy:REPLACE_WITH_DATABASE_PASSWORD
```

Then restrict it:

```bash
sudo chown bangbuy:bangbuy /home/bangbuy/.pgpass
sudo chmod 600 /home/bangbuy/.pgpass
sudo install -d -o bangbuy -g bangbuy -m 0700 /var/backups/bangbuy
```

Escape literal `:` and `\` characters in `.pgpass` with a backslash. For a
managed database, use its hostname, port, user, SSL requirements, and a
provider secret mechanism instead. Do not put `DATABASE_URL` on a command line
where it can appear in process listings.

### Manual backup

The commands below target the local PostgreSQL 16 example. For a managed
database, replace host, port, database, and user with its **direct/session**
endpoint, update `.pgpass`, and verify `pg_dump --version` is at least as new as
the server. Create a custom-format, compressed, portable dump:

```bash
sudo -iu bangbuy
backup_dir=/var/backups/bangbuy
backup_name="bangbuy_$(date -u +%Y%m%dT%H%M%SZ).dump"
backup_file="${backup_dir}/${backup_name}"
pg_dump --host=127.0.0.1 --port=5432 --username=bangbuy \
  --dbname=bangbuy --format=custom --compress=9 \
  --no-owner --no-privileges --file="$backup_file"
pg_restore --list "$backup_file" >/dev/null
(
  cd "$backup_dir"
  sha256sum -- "$backup_name" > "${backup_name}.sha256"
)
ls -lh "$backup_file" "${backup_file}.sha256"
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

For a managed database, run `pg_dump` against its direct/session endpoint, not
a transaction-pooling endpoint. For this order/payment workload, also enable
the provider's continuous WAL archiving or point-in-time recovery when
available; daily logical dumps alone can lose up to a day of transactions.

### Automated daily backup

Open a new root-owned executable with
`sudoedit /usr/local/sbin/bangbuy-backup`, then add:

```bash
#!/usr/bin/env bash
set -euo pipefail
umask 077

backup_dir=/var/backups/bangbuy
stamp=$(date -u +%Y%m%dT%H%M%SZ)
final_file="${backup_dir}/bangbuy_${stamp}.dump"
partial_file="${final_file}.partial"
final_name="${final_file##*/}"
db_host=127.0.0.1
db_port=5432
db_name=bangbuy
db_user=bangbuy

cleanup() {
  rm -f -- "$partial_file"
}
trap cleanup EXIT

/usr/bin/pg_dump --host="$db_host" --port="$db_port" --username="$db_user" \
  --dbname="$db_name" --format=custom --compress=9 \
  --no-owner --no-privileges --file="$partial_file"
/usr/bin/pg_restore --list "$partial_file" >/dev/null
mv -- "$partial_file" "$final_file"
(
  cd -- "$backup_dir"
  /usr/bin/sha256sum -- "$final_name" > "${final_name}.sha256"
)

# Local rolling window; off-site storage enforces longer retention.
/usr/bin/find "$backup_dir" -type f -name 'bangbuy_*.dump' -mtime +14 -delete
/usr/bin/find "$backup_dir" -type f -name 'bangbuy_*.dump.sha256' -mtime +14 -delete
```

Install it without allowing the application account to modify the executable:

```bash
sudo chown root:bangbuy /usr/local/sbin/bangbuy-backup
sudo chmod 0750 /usr/local/sbin/bangbuy-backup
sudo -iu bangbuy /usr/local/sbin/bangbuy-backup
```

For a managed database, edit the four `db_*` values to its direct endpoint and
use the absolute path of the matching/newer `pg_dump` binary. If the provider
does not expose a logical-dump connection or database-creation privileges, use
its automated snapshot/PITR restore workflow instead and test that workflow.

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

2. Create a fresh target. The name `bangbuy_restore_YYYYMMDD` makes accidental
   production targeting less likely:

   ```bash
   sudo -u postgres createdb --owner=bangbuy --encoding=UTF8 \
     --template=template0 bangbuy_restore_YYYYMMDD
   ```

   On managed PostgreSQL, create a separate restore database or temporary
   instance through the provider control plane instead; do not run local
   `sudo -u postgres` commands against a managed service.

3. Ensure `.pgpass` has an entry for the new database, then restore atomically:

   ```bash
   sudo -iu bangbuy
   pg_restore --host=127.0.0.1 --port=5432 --username=bangbuy \
     --dbname=bangbuy_restore_YYYYMMDD --exit-on-error \
     --single-transaction --no-owner --no-privileges \
     /var/backups/bangbuy/bangbuy_YYYYMMDDTHHMMSSZ.dump
   exit
   ```

4. Validate the restored database before any switchover:

   ```bash
   sudo -iu bangbuy
   psql --host=127.0.0.1 --port=5432 --username=bangbuy \
     --dbname=bangbuy_restore_YYYYMMDD \
     -c 'SELECT COUNT(*) AS users FROM "User";'
   psql --host=127.0.0.1 --port=5432 --username=bangbuy \
     --dbname=bangbuy_restore_YYYYMMDD \
     -c 'SELECT COUNT(*) AS orders FROM "Order";'
   psql --host=127.0.0.1 --port=5432 --username=bangbuy \
     --dbname=bangbuy_restore_YYYYMMDD \
     -c 'SELECT "migration_name", "finished_at" FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 5;'
   psql --host=127.0.0.1 --port=5432 --username=bangbuy \
     --dbname=bangbuy_restore_YYYYMMDD -c 'ANALYZE;'
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
sha256sum --check bangbuy_YYYYMMDDTHHMMSSZ.sql.sha256
psql --host=127.0.0.1 --port=5432 --username=bangbuy \
  --dbname=bangbuy_restore_YYYYMMDD --set=ON_ERROR_STOP=on \
  --single-transaction --file=bangbuy_YYYYMMDDTHHMMSSZ.sql
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

## 14. Routine deployment/update runbook

The following is a safe, simple in-place update with a maintenance window.
Stop and drain the selected process first, then take the rollback backup so no
order or payment write can commit between the snapshot and the migration. Keep
the app stopped before replacing `node_modules` or `.next`; both are read by
the running server.

1. Stop exactly one selected process manager and wait for it to report stopped:

   ```bash
   sudo -iu bangbuy pm2 stop bangbuy
   sudo -iu bangbuy pm2 status
   # Or, for the systemd option:
   sudo systemctl stop bangbuy
   sudo systemctl status bangbuy --no-pager
   ```

2. Take the pre-deployment backup and do not continue unless it succeeds:

   ```bash
   # Local PostgreSQL, or a script adapted to the managed direct endpoint:
   sudo -iu bangbuy /usr/local/sbin/bangbuy-backup
   # For managed PostgreSQL, a completed provider snapshot/PITR restore point
   # may be used instead when that is the tested backup path.
   ```

3. Install and validate the tested release as `bangbuy`:

   ```bash
   sudo -iu bangbuy
   cd /var/www/bangbuy

   git fetch --prune --tags
   git checkout <tested-release-tag-or-commit>
   npm ci --include=dev
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
   sudo -iu bangbuy pm2 restart bangbuy --update-env
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

## 15. Post-deployment verification

There is currently no dedicated health endpoint. Use several checks rather
than treating one cached page as proof of health:

```bash
# Node listener is private and responding.
curl -fsS -o /dev/null http://127.0.0.1:3000/robots.txt

# Nginx, TLS, routing, and the storefront all respond.
curl -fsS -o /dev/null https://example.com/
curl -I https://example.com/robots.txt

# Database migration history is reachable and current.
sudo -u bangbuy -H sh -c \
  'cd /var/www/bangbuy && npx prisma migrate status'

# Process and proxy logs.
sudo -iu bangbuy pm2 status
sudo -iu bangbuy pm2 logs bangbuy --lines 100 --nostream
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
- Only ports 22 (as required), 80, and 443 are publicly reachable; Node 3000 and
  PostgreSQL 5432 are private.

For the project’s cache/SEO behavior and CDN restrictions, also read
[`docs/seo-performance-architecture.md`](docs/seo-performance-architecture.md).
