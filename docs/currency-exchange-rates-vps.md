# Currency exchange-rate refresh on a Linux VPS

The storefront never calls the FX provider. A Linux cron job calls the
protected Next.js route every six hours, and customer requests read the last
valid database snapshot. Provider or refresh failures retain stale rows.
At four scheduled checks per day this is about 120 checks per month; fresh
snapshot short-circuiting can reduce provider calls further.

## 1. Configure production environment variables

From the application directory on the VPS, generate a dedicated scheduler
secret and edit the environment file used by the existing PM2 process:

```bash
cd /var/www/bangbuy
openssl rand -hex 32
nano .env
```

Add the generated value and the ExchangeRate-API key. Do not commit either
secret and do not prefix them with `NEXT_PUBLIC_`:

```dotenv
EXCHANGE_RATE_API_KEY=replace-with-provider-key
EXCHANGE_RATE_REFRESH_HOURS=6
# Cloudflare -> Nginx topology; see the trusted-header section below.
GEO_COUNTRY_HEADER=CF-IPCountry
# Optional while diagnosing production country detection. Use a different
# generated value from CRON_SECRET and remove/rotate it after diagnosis.
CURRENCY_DEBUG_SECRET=replace-with-generated-64-hex-character-secret
CRON_SECRET=replace-with-generated-64-hex-character-secret
```

If `DATABASE_URL` points at PgBouncer, also provide the provider's direct
PostgreSQL URL for Prisma CLI operations:

```dotenv
DIRECT_URL=postgresql://USER:PASSWORD@DIRECT_HOST/DATABASE?sslmode=require
```

The Prisma configuration automatically derives Neon's direct hostname when
`DATABASE_URL` is a Neon `-pooler` URL and `DIRECT_URL` is omitted. Other
providers should set `DIRECT_URL` explicitly. Session-level migration advisory
locks are not safe through a transaction pooler.

Use the real deployment directory if it is not `/var/www/bangbuy`. Restrict
the file to the account that runs the application:

```bash
chmod 600 .env
```

## 2. Deploy the additive migration and application

Run the normal production install, migration, and build. `migrate deploy`
does not reset the database or delete existing product/order data.

```bash
cd /var/www/bangbuy
npm ci
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
npm run build
```

Stop before `migrate deploy` if `migrate status` reports that database and
repository migration histories differ. Reconcile the pre-existing migration
name/checksum with the deployment owner first; do not use `migrate reset`, edit
an applied migration, or mark either of these new migrations as applied by
hand. Resolve unrelated drift before applying the additive currency migrations.

Find the existing PM2 application name, then restart that same process while
reloading its environment. The expected name below is `bangbuy`:

```bash
pm2 list
pm2 restart bangbuy --update-env
pm2 save
pm2 logs bangbuy --lines 100
```

If `pm2 list` shows a different name, substitute it for `bangbuy`; do not
start a duplicate process.

## 3. Verify the protected endpoint manually

Load the secret into the current shell without printing it, call the endpoint,
then remove it from the shell environment:

```bash
cd /var/www/bangbuy
read -rsp "CRON secret: " BANGBUY_CRON_SECRET
echo
curl -i -fsS -H "Authorization: Bearer ${BANGBUY_CRON_SECRET}" https://YOUR_DOMAIN/api/internal/exchange-rates/refresh
unset BANGBUY_CRON_SECRET
```

A successful response is HTTP 200 with `count: 6`. A missing or incorrect
Bearer credential returns HTTP 401. A provider/database failure returns HTTP
503 and leaves the last valid rows unchanged.

Verify the database snapshot with `psql`. Read the production database URL
without placing it in shell history, then remove it from the shell:

```bash
read -rsp "DATABASE_URL: " BANGBUY_DATABASE_URL
echo
psql "$BANGBUY_DATABASE_URL" -c "SELECT \"baseCurrency\", \"currency\", \"rate\", \"fetchedAt\" FROM \"ExchangeRate\" WHERE \"baseCurrency\" = 'BDT' ORDER BY \"currency\";"
psql "$BANGBUY_DATABASE_URL" -c "SELECT count(*) AS supported_rows FROM \"ExchangeRate\" WHERE \"baseCurrency\" = 'BDT' AND \"currency\" IN ('BDT', 'AUD', 'EUR', 'GBP', 'USD', 'CNY');"
psql "$BANGBUY_DATABASE_URL" -c "SELECT \"rate\" FROM \"ExchangeRate\" WHERE \"baseCurrency\" = 'BDT' AND \"currency\" = 'BDT';"
unset BANGBUY_DATABASE_URL
```

The count must be `6`, and the BDT identity rate must be `1.0000000000`.

## Trusted visitor-country header

The request resolver checks trusted sources in this order:

```text
development only: DEV_COUNTRY
Cloudflare:        CF-IPCountry
configured proxy: GEO_COUNTRY_HEADER
fallback:          no detected country (BDT)
```

When no custom header is configured, the existing Vercel and CloudFront
platform headers remain available after Cloudflare. When a custom header is
configured, unrelated platform headers are deliberately ignored so they cannot
outrank the proxy-owned value.

Choose exactly one of the following production topologies. Do not combine the
Cloudflare forwarding block with the direct-Nginx GeoIP2 block.

### Cloudflare -> Nginx -> Next.js

In Cloudflare, confirm that every web-serving DNS record is **Proxied** (orange
cloud) and that **Network -> IP Geolocation** is on. The **Add visitor location
headers** Managed Transform is also supported. Protect the origin so only
Cloudflare can reach HTTP/HTTPS, using a current Cloudflare IP allowlist,
Cloudflare Tunnel, or Authenticated Origin Pulls. Otherwise a direct client can
forge `CF-IPCountry`.

Make the trusted source explicit in the production environment:

```dotenv
GEO_COUNTRY_HEADER=CF-IPCountry
```

Nginx normally forwards request headers, but this explicit block prevents a
direct-Nginx configuration from accidentally deleting the Cloudflare value:

```nginx
proxy_set_header CF-IPCountry $http_cf_ipcountry;
proxy_set_header X-Vercel-IP-Country "";
proxy_set_header CloudFront-Viewer-Country "";
proxy_set_header X-BangBuy-Country "";
proxy_pass http://127.0.0.1:3000;
```

Do not use `proxy_set_header CF-IPCountry "";` in this topology. GeoIP2 is not
needed for currency detection because Cloudflare already supplies the visitor's
two-letter country code. If Nginx also restores the original visitor IP for
logging or rate limiting, trust `CF-Connecting-IP` only from Cloudflare's
published source ranges.

Also confirm that no Cloudflare **Cache Everything** or equivalent cache rule
overrides the application's private/no-store policy for storefront HTML or RSC
responses. Static assets and canonical catalog data may remain cached.

### Direct visitor -> Nginx GeoIP2 -> Next.js

A plain Nginx/VPS installation does not discover a country by itself. Install
and maintain an Nginx GeoIP2 country database, then set a private header name:

```dotenv
GEO_COUNTRY_HEADER=X-BangBuy-Country
```

At the public proxy boundary, always remove any inbound value and overwrite it
from trusted GeoIP data before proxying to Next.js. Never forward a visitor's
own `X-BangBuy-Country` value. A missing, malformed, sentinel, or unsupported
country deliberately falls back to BDT. Restart PM2 with `--update-env` after
changing this setting.

The proxy must remove client-controlled platform/custom headers and overwrite
only its own GeoIP-derived value. A representative `location` block is:

```nginx
proxy_set_header CF-IPCountry "";
proxy_set_header X-Vercel-IP-Country "";
proxy_set_header CloudFront-Viewer-Country "";
proxy_set_header X-BangBuy-Country $bangbuy_country_code;
proxy_pass http://127.0.0.1:3000;
```

`$bangbuy_country_code` must be populated by the installed Nginx GeoIP2 module
from a maintained country database. Validate the Nginx configuration with
`sudo nginx -t` before reloading it. If GeoIP2 is not installed and configured,
do not forward any country header; the application will intentionally use BDT.

### Inspect the deployed trust boundary

The repository does not contain the live Nginx or PM2 configuration. Inspect
the effective configuration on the VPS without printing unrelated environment
secrets:

```bash
sudo nginx -T 2>&1 | grep -Ein 'server_name|proxy_pass_request_headers|proxy_set_header[[:space:]]+(CF-IPCountry|X-BangBuy-Country|X-Vercel-IP-Country|CloudFront-Viewer-Country)|geoip2|real_ip_header|set_real_ip_from|proxy_cache'
pm2 list
pm2 env PM2_PROCESS_ID | grep -E '^(NODE_ENV|GEO_COUNTRY_HEADER|DEV_COUNTRY):'
```

For Cloudflare production, `NODE_ENV` must be `production`, `DEV_COUNTRY` must
be absent, `GEO_COUNTRY_HEADER` should be `CF-IPCountry`, and the effective
Nginx application location must not delete that header or disable request-header
forwarding. Restart the existing PM2 process with `--update-env` after changing
the environment.

## Protected country diagnostic

`GET /api/debug/country` is open only in development. In every other
environment it requires `Authorization: Bearer <CURRENCY_DEBUG_SECRET>` and
fails closed when the secret is unset. The response is private/no-store and
contains only normalized country observations, the detected country, its mapped
currency, and the effective storefront currency/source. It never returns IPs,
cookies, authorization, Cloudflare Ray data, full headers, or secrets.

Call it in production without placing the secret in shell history:

```bash
read -rsp "Currency debug secret: " BANGBUY_CURRENCY_DEBUG_SECRET
echo
curl -fsS -H "Authorization: Bearer ${BANGBUY_CURRENCY_DEBUG_SECRET}" https://YOUR_DOMAIN/api/debug/country
unset BANGBUY_CURRENCY_DEBUG_SECRET
```

If `headers.cfIpCountry.countryCode` is correct but `detectedCountry` is not,
inspect `GEO_COUNTRY_HEADER` and header precedence. If `detectedCountry` and
`mappedCurrency` are correct but `resolvedCurrency` differs, check
`resolutionSource`: a validated `currency` cookie intentionally wins, while a
missing/corrupt foreign exchange-rate row safely downgrades the storefront to
BDT. Disable or rotate `CURRENCY_DEBUG_SECRET` after diagnosis.

## 4. Add the six-hour cron job

Edit the crontab for the same Linux account that can reach the public app URL:

```bash
crontab -e
```

Add these lines, replacing the domain and secret. `CRON_TZ` makes the schedule
explicit even when the VPS uses UTC:

```cron
CRON_TZ=Asia/Dhaka
0 */6 * * * curl --max-time 30 --retry 2 -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_DOMAIN/api/internal/exchange-rates/refresh >> /var/log/bangbuy-exchange-rates.log 2>&1
```

Cron runs at 00:00, 06:00, 12:00, and 18:00 in the configured timezone. The
secret is visible to users allowed to read this account's crontab; keep that
account and its crontab private. If it cannot write `/var/log`, use a protected
application-owned log path instead.

Confirm the installed entry and secure the log:

```bash
crontab -l
sudo touch /var/log/bangbuy-exchange-rates.log
sudo chown "$(id -un)":"$(id -gn)" /var/log/bangbuy-exchange-rates.log
chmod 600 /var/log/bangbuy-exchange-rates.log
```

## 5. Verify cron execution

After a scheduled run, check both cron and application logs:

```bash
tail -n 50 /var/log/bangbuy-exchange-rates.log
pm2 logs bangbuy --lines 100 --nostream
journalctl -u cron --since "8 hours ago" --no-pager
```

On distributions using `crond`, use this final command instead:

```bash
journalctl -u crond --since "8 hours ago" --no-pager
```

The PM2 log should show `refresh started` and `refresh succeeded`. On failure it
shows only a sanitized reason plus `stale rates retained`; it never logs the
provider key or cron secret. Re-run the database query above and confirm that
`fetchedAt` advanced after a successful scheduled refresh.
