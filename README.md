# BangBuy

A Bangladesh-focused, mobile-first e-commerce storefront and administration platform.

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling & UI | Tailwind CSS 4, Radix UI / shadcn, Framer Motion, Lucide |
| State Management | Redux Toolkit 2 |
| Authentication | Auth.js (NextAuth) v5, Google OAuth, Credentials, bcryptjs |
| Validation | Zod 4 |
| Database | PostgreSQL, Prisma 7, `@prisma/adapter-pg` |
| Payments | SSLCommerz, Airwallex |
| Email | EmailJS (browser SDK) |
| Image Uploads | VPS filesystem, Nginx, Sharp; restricted SSH for local development |
| PDF Generation | jsPDF + jsPDF AutoTable |
| Package Manager | npm |

---

## Installation Guide

### Prerequisites

- **Node.js** `>= 20.9.0`
- **PostgreSQL** database (local or remote)
- **npm** (comes with Node.js)

---

### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd bangbuy
```

---

### Step 2 — Install dependencies

```bash
npm ci
```

> This also runs `prisma generate` automatically via the `postinstall` script.

---

### Step 3 — Set up environment variables

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac / Linux:**
```bash
cp .env.example .env

```

To enable Meta Pixel, set `NEXT_PUBLIC_META_PIXEL_ID` in `.env` to the numeric
Pixel ID from Meta Events Manager. Leaving it blank disables tracking; invalid
IDs are also ignored. The integration sends `PageView` events on the initial
load and when the pathname or query string changes, with a noscript fallback
for browsers with JavaScript disabled.

Restart the development server after changing the ID. For production, set the
variable in your hosting environment before building, then rebuild and redeploy
when it changes. Verify events in Meta Events Manager's Test Events view.

---

### Step 4 — Apply database migrations

Use a separate development database for this step. When connected to the VPS
production database through the tunnel described below, skip development
migrations, resets, and seeding.

```bash
npx prisma migrate dev
```

> For production environments, use `npx prisma migrate deploy` instead.

---

### Step 5 — Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

### Connect local development to the VPS database

PostgreSQL on the VPS listens on its own loopback interface. On your computer,
start an SSH tunnel before starting Next.js:

```bash
npm run db:tunnel
npm run dev
```

The tunnel authenticates with your SSH key or prompts for the VPS SSH password,
then runs in the background. It forwards local `127.0.0.1:15432` to PostgreSQL
on the VPS at `127.0.0.1:5432`. Start it again after a reboot or disconnection.
An existing tunnel already listening on port `15432` can be reused.

Set the local `.env` connection to:

```dotenv
DATABASE_URL="postgresql://myapp:<URL-encoded-password>@127.0.0.1:15432/bangbuy_db"
```

Replace the password placeholder with the real database password, encoding
special characters (`?` becomes `%3F`). If `DIRECT_URL` is set, use the same
local tunnel connection. Fully restart `npm run dev` after changing either URL
so Prisma creates a new connection pool.

This connection accesses **production data**; local app writes affect the live
store. The production VPS `.env` continues to use port `5432` directly.

In development, ImgBB requests to `/_next/image` use BangBuy's production image
optimizer and cache. This avoids downloading large ImgBB originals over the
local connection, which can exceed Next.js's seven-second fetch timeout. Local
assets and other image hosts still use the local optimizer. The image rewrite
is disabled in production builds.

### Upload photos to your VPS from local development

`UPLOAD_DIR` is a filesystem path on the machine running Next.js. The Linux
path `/var/www/uploads/bangbuy` cannot store files on a VPS when Next.js is
running on your Mac. Select SSH storage in `.env.development.local` to send
optimized images to the VPS and return the same public URLs used in production:

```dotenv
UPLOAD_STORAGE="ssh"
UPLOAD_SSH_HOST="187.127.138.53"
UPLOAD_SSH_USER="bangbuy-upload"
UPLOAD_SSH_KEY="/absolute/path/to/.ssh/bangbuy_upload_ed25519"
# UPLOAD_SSH_PORT="22"
```

Keep the shared upload settings in `.env`:

```dotenv
UPLOAD_DIR="/var/www/uploads/bangbuy"
UPLOAD_PUBLIC_URL="https://bangbuy.net/uploads"
MAX_UPLOAD_SIZE_MB="5"
```

Restart `npm run dev` after changing these settings. The SSH key must be usable
without a password prompt, and the VPS host key must already be verified in
your SSH `known_hosts`. A connection failure displays
**Upload storage is unavailable. Please try again later.** beneath the uploader.
Deleting an uploaded image uses the same storage connection.

Forms select the directory automatically under `UPLOAD_DIR`:

| Image | Directory |
|---|---|
| Banners, carousels, deals, promotions | `banners/` |
| Product primary, gallery, variant, description, and social images | `products/` |
| Category and subcategory images, including social previews | `categories/` |
| Profile and testimonial avatars | `users/` |
| Brand/manufacturer logos and social images | `other/` |

These assignments apply to new uploads. Existing image URLs retain their paths.

The VPS uses a dedicated `bangbuy-upload` account with write access to the
upload directory. Install [scripts/upload-storage.py](scripts/upload-storage.py)
as `/usr/local/lib/bangbuy/upload-storage.py`, owned by root. Its public SSH key
entry in that account's `authorized_keys` must start with:

```text
restrict,command="/usr/bin/python3 /usr/local/lib/bangbuy/upload-storage.py --root /var/www/uploads/bangbuy" ssh-ed25519 <public-key> bangbuy-development-upload
```

This key can run the upload helper only. The helper validates paths, publishes
complete images atomically, and times out stalled requests. The upload account
and the production Next.js process must both be able to write to the upload
directory; Nginx needs read access. Production defaults to filesystem storage
when `UPLOAD_STORAGE` is unset, so it does not need the development SSH key.

In the HTTPS Nginx server block, allow the 5 MB image limit plus multipart
overhead and serve the persistent directory:

```nginx
client_max_body_size 6m;

location /uploads/ {
    alias /var/www/uploads/bangbuy/;
    autoindex off;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options "nosniff" always;
}
```

Run `nginx -t` before reloading Nginx. Without the size directive, Nginx can
reject images over its default request limit before the app receives them.
Verify the storage code with:

```bash
npx vitest run __tests__/upload-service.test.ts __tests__/upload-ssh-storage.test.ts
python3 -m unittest discover -s scripts/tests -p 'test_upload_storage.py'
```

---

## Other Useful Commands

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Run all tests (Vitest)
npm test

# Run tests in watch mode
npm run test:watch

# Production build
npm run build

# Start production server
npm start

# Check migration status
npx prisma migrate status

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## File Structure

```
bangbuy/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages (login, register)
│   ├── (shop)/                 # Public storefront pages
│   ├── admin/                  # Admin panel pages
│   ├── api/                    # API Route Handlers
│   ├── generated/              # Auto-generated Prisma client
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── providers.tsx           # Global providers (Redux, Auth, etc.)
│   ├── robots.ts               # SEO robots config
│   └── sitemap.ts              # Dynamic sitemap
│
├── components/                 # Shared React components
│   ├── layout/                 # Navbar, footer, site chrome
│   ├── product/                # Product card, gallery, etc.
│   ├── policy/                 # Policy page components
│   ├── seo/                    # JSON-LD, meta helpers
│   └── ui/                     # Base UI primitives (buttons, modals, etc.)
│
├── features/                   # Client API adapters (per domain)
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── products/
│   ├── wishlist/
│   ├── profile/
│   ├── reviews/
│   ├── upload/
│   ├── admin-products/
│   ├── admin-orders/
│   ├── admin-users/
│   ├── admin-dashboard/
│   └── ...                     # Other admin feature adapters
│
├── lib/                        # Server-only utilities and services
│   ├── services/               # Core business logic (Prisma orchestration)
│   ├── auth/                   # Auth.js config, session helpers, guards
│   ├── api/                    # Response contracts, handler wrappers
│   ├── cache/                  # Cache tags and invalidation helpers
│   ├── validations/            # Shared Zod schemas
│   ├── airwallex/              # Airwallex payment integration
│   ├── payments/               # Payment utilities
│   ├── orders/                 # Order utilities
│   ├── seo/                    # SEO construction helpers
│   ├── catalog/                # Catalog helpers
│   ├── reports/                # PDF report generation
│   ├── db/                     # Database client setup
│   ├── motion/                 # Framer Motion animation presets
│   ├── money.ts                # Decimal/money helpers
│   └── utils.ts                # General utilities
│
├── store/                      # Redux store
│   ├── index.ts                # Store setup
│   └── slices/                 # Redux slices (cart, wishlist, admin domains)
│
├── hooks/                      # Custom React hooks
│
├── prisma/
│   ├── schema.prisma           # Database schema (28 models)
│   └── migrations/             # SQL migration history
│
├── public/                     # Static assets (logos, images)
├── docs/                       # Architecture documentation
├── proxy.ts                    # Catalog URL canonicalization proxy
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── vitest.config.mts           # Vitest test configuration
├── .env.example                # Environment variable template
└── package.json                # Project dependencies and scripts
```


npm run db:tunnel
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate

npm run dev
