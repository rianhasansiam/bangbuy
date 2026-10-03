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
| Image Uploads | ImgBB |
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
npm run dev
