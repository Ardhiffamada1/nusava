# CommerceOS — Fullstack E-Commerce Platform

A production-style modular monolith e-commerce platform demonstrating professional software architecture, strict database transactions, zero-trust backend computations, and an editorial Linear/Stripe-inspired interface.

Built as an engineering portfolio project with **NestJS**, **Next.js 15 (App Router)**, **Prisma ORM**, and **PostgreSQL**.

---

## Architecture & Engineering Invariants

1. **Zero Client Trust:** Pricing calculations, tax computations, shipping fees, line subtotals, and stock deductions are executed strictly on the backend. The frontend sends only intent (variant IDs, quantities, address inputs).
2. **Atomic Stock Locking (`SELECT ... FOR UPDATE`):** Checkout operations execute inside transactional blocks with PostgreSQL row-level locks. Under high concurrency, competing requests are serialized, completely eliminating overselling.
3. **Double-Entry Style Stock Ledger:** Every single inventory mutation writes an immutable `StockMovement` record with previous quantity, delta, and balance after (e.g. `ORDER_PLACED`, `ORDER_CANCELLED`, `MANUAL_ADJUSTMENT`).
4. **Historical Immutability:** `OrderItem` records store frozen snapshots of product title, SKU, variant attributes, and unit price at the time of purchase. Future product updates or deletions never corrupt historical orders.
5. **Single-Restock Cancellation Guarantee:** Order cancellations verify state invariants and restore allocated stock exactly once. Duplicate cancellation requests are rejected with HTTP 400.
6. **Secure Session Cookie Handling:** Authentication operates via HTTP-only, `SameSite=Lax` signed JWT cookies with short 15-minute access token lifespans and 7-day refresh token rotation. Tokens are never exposed to browser `localStorage`.
7. **Premium Visual Realignment (Zero AI-Slop):**
   - **Admin Management Console (`:3001`):** Faithfully replicated after **WiNk** (dashboard with off-white `#F4F4F6` canvas, custom SVG curve with fine vertical drop pin lines, Shop Advisor, Products overview, and live activity stream).
   - **Admin Order List:** Replicated after **Spodut** (floating white card, product thumbnail line items, soft pastel status pills, and clean numbered pagination).
   - **Customer Storefront (`:3000`):** Replicated after **MINDI** (Scandinavian / Japanese studio aesthetic, spaced uppercase wordmark, quiet text-only vertical category navigation, and square `#F7F7F7` photo tiles).

---

## Technology Stack

- **Monorepo:** pnpm workspace
- **Backend API (`apps/api`):** NestJS 11, TypeScript, Passport JWT, bcryptjs, Zod validation pipes, centralized RFC 7807 error filter
- **Database (`packages/database`):** PostgreSQL 16+, Prisma ORM 6+, double-entry audit ledgers
- **Customer Storefront (`apps/storefront`):** Next.js 15 App Router, React 19, Tailwind CSS, TanStack Query v5, Zustand, React Hook Form, Lucide icons
- **Admin Console (`apps/admin`):** Next.js 15 App Router, React 19, high-density data tables, sales velocity charts, manual stock adjustments, CSV reports
- **Shared Contracts (`packages/contracts`):** Universal Zod schemas, TypeScript DTOs, domain enums
- **Shared UI (`packages/ui`):** Currency formatters, date utilities, class merging (`clsx` + `tailwind-merge`)
- **Infrastructure:** Docker Compose (PostgreSQL 16, Redis 7), GitHub Actions CI

---

## Monorepo Layout

```
.
├── apps/
│   ├── api/               # NestJS Modular Monolith API (Port 4000)
│   ├── storefront/        # Customer Storefront (Port 3000)
│   └── admin/             # Admin Management Console (Port 3001)
├── packages/
│   ├── contracts/         # Shared Zod schemas, DTOs & TypeScript types
│   ├── database/          # Prisma schema, migrations & seed script
│   └── ui/                # Shared UI utilities and tokens
├── docker-compose.yml     # PostgreSQL 16 & Redis 7 services
├── pnpm-workspace.yaml
└── README.md
```

---

## Quickstart & Installation

### 1. Prerequisites
- **Node.js:** v20.x or v22.x
- **pnpm:** v10+ or v12+ (`npm install -g pnpm`)
- **PostgreSQL:** Local service or Docker Compose

### 2. Start PostgreSQL via Docker Compose
```bash
docker compose up -d
```
*(Or point `DATABASE_URL` to your existing PostgreSQL instance).*

### 3. Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/commerceos?schema=public"
JWT_SECRET="commerceos-super-secret-jwt-key-for-local-development-must-be-min-32-chars"
JWT_REFRESH_SECRET="commerceos-super-secret-refresh-key-for-local-development-must-be-min-32-chars"
PORT=4000
FRONTEND_STOREFRONT_URL="http://localhost:3000"
FRONTEND_ADMIN_URL="http://localhost:3001"
NODE_ENV="development"
```

### 4. Install Dependencies & Build Packages
```bash
pnpm install
pnpm --filter @commerceos/contracts build
pnpm --filter @commerceos/ui build
```

### 5. Push Database Schema & Seed Realistic Demo Data
```bash
# Push Prisma schema to PostgreSQL
pnpm db:push

# Build database package
pnpm --filter @commerceos/database build

# Populate with 31 products, variants, customers, and demo orders
pnpm db:seed
```

### 6. Start Development Servers (All-in-One)
Cukup jalankan satu perintah di root folder untuk menyalakan API, Storefront, dan Admin secara bersamaan:

```bash
pnpm dev
# atau: npm run dev
```

Ini akan menjalankan:
- **API Server (NestJS):** `http://localhost:4000/api/v1`
- **Customer Storefront (Next.js):** `http://localhost:3000`
- **Admin Management Console (Next.js):** `http://localhost:3001`

*(Atau jika ingin menjalankan per layanan secara terpisah):*
```bash
pnpm dev:api         # Port 4000
pnpm dev:storefront  # Port 3000
pnpm dev:admin       # Port 3001
```

---

## Demo Accounts & Credentials

The seed script initializes pre-configured accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@commerceos.dev` | `Admin12345!` | Full access to Admin Console (:3001), stock adjustment, order fulfillment, CSV exports |
| **Customer 1** | `customer@commerceos.dev` | `Customer12345!` | Pre-saved address, order history, active cart (:3000) |
| **Customer 2** | `marcus.chen@example.com` | `Customer12345!` | Pre-saved address, order history (:3000) |

*(Both storefront and admin login screens include a convenient one-click "Fill Demo Credentials" button).*

---

## Key User Journeys

### 1. Customer Storefront (`http://localhost:3000`)
- **Homepage:** Editorial hero, curated categories (Apparel, Leather Goods, Workspace, Audio, Ceramics), new arrivals.
- **Product Catalog (`/products`):** Faceted category filters, search input, price sorting (`price_asc`, `price_desc`, `newest`), pagination synchronized with URL Search Params.
- **Product Detail (`/products/[slug]`):** Thumbnail gallery, variant pills with live price updates and real-time stock cues, quantity stepper, add-to-bag drawer.
- **Cart Drawer & Page (`/cart`):** Live subtotal calculation, free delivery progress indicator ($150 threshold), stock availability checks.
- **Transactional Checkout (`/checkout`):** Address selection, shipping method, Cash on Delivery or Manual Bank Transfer (Demo), order placement.
- **Customer Account (`/account`):** Order history, item snapshots, real-time shipment status, order cancellation with instant inventory restoration.

### 2. Admin Management Console (`http://localhost:3001`)
- **Overview Dashboard (`/`):** Gross revenue KPIs, 14-day sales velocity bar graph, low-stock threshold alerts, recent transactions table.
- **Products Management (`/products`):** Multi-variant SKU tracking, create product modal, soft archive actions.
- **Inventory Ledger (`/inventory`):** Stock levels table, manual stock adjustment dialog, immutable double-entry `StockMovement` audit ledger.
- **Order Operations (`/orders`):** Status filtering (`CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`), demo payment settlement (`PENDING` $\rightarrow$ `PAID` / `REFUNDED`), cancellation & restock trigger.
- **Customers Directory (`/customers`):** Customer order frequency, lifetime commercial spend, address records.
- **Reports & Export (`/reports`):** One-click streaming RFC 4180 CSV export for Orders, Inventory, and Products.
- **Audit Logs (`/audit`):** Administrative action trace ledger.

---

## REST API Specification

All API routes are served under prefix `/api/v1`:

### Authentication & Users
- `POST /api/v1/auth/register` — Register customer account
- `POST /api/v1/auth/login` — Sign in & issue secure HTTP-only cookies
- `POST /api/v1/auth/logout` — Clear auth cookies
- `POST /api/v1/auth/refresh` — Rotate refresh tokens
- `GET /api/v1/auth/me` — Authenticated user profile
- `GET /api/v1/users/addresses` — User address book
- `POST /api/v1/users/addresses` — Save new address

### Catalog & Categories
- `GET /api/v1/categories` — Category hierarchy tree
- `GET /api/v1/products` — Filtered catalog listing with pagination & search
- `GET /api/v1/products/:slugOrId` — Product details with variant inventory
- `POST /api/v1/products` — Create product & variants *(Admin)*
- `PUT /api/v1/products/:id` — Update product *(Admin)*
- `DELETE /api/v1/products/:id` — Archive product *(Admin)*

### Cart & Checkout
- `GET /api/v1/cart` — Active shopping cart
- `POST /api/v1/cart/items` — Add variant to cart with stock validation
- `PATCH /api/v1/cart/items/:id` — Update line quantity
- `DELETE /api/v1/cart/items/:id` — Remove line item
- `POST /api/v1/cart/validate` — Pre-checkout stock verification
- `POST /api/v1/checkout` — Atomic transaction checkout with row locks

### Orders & Inventory
- `GET /api/v1/orders` — Orders list (Customer orders or Admin workbench)
- `GET /api/v1/orders/:id` — Order detail with frozen snapshots
- `PATCH /api/v1/orders/:id/status` — Transition fulfillment status *(Admin)*
- `POST /api/v1/orders/:id/cancel` — Cancel order & atomically restock
- `PATCH /api/v1/orders/:id/payment` — Update demo payment status *(Admin)*
- `GET /api/v1/inventory` — Warehouse stock levels *(Admin)*
- `POST /api/v1/inventory/adjust` — Manual stock adjustment *(Admin)*
- `GET /api/v1/inventory/movements` — Stock movement audit ledger *(Admin)*

### Analytics & Reports
- `GET /api/v1/analytics/overview` — Dashboard summary metrics *(Admin)*
- `GET /api/v1/analytics/sales-trend` — 14-day sales volume *(Admin)*
- `GET /api/v1/reports/export-csv` — Streaming CSV export *(Admin)*
- `GET /api/v1/customers` — Customer directory *(Admin)*
- `GET /api/v1/audit-logs` — Administrative audit trail *(Admin)*

---

## Production Build Verification

Verify that the entire monorepo compiles without errors:

```bash
# Build contracts, database, ui, api, storefront, and admin
pnpm build
```

---

## License

MIT License. Designed and engineered as a high-standard engineering portfolio project.
