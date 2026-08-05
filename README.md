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
---

### Step 4 — Apply database migrations

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
