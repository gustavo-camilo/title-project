# System Architecture

## Overview

TitleSearch Pro is a bilingual SaaS platform built as a Next.js 15 application backed by Supabase (PostgreSQL) for data, authentication, and file storage, with Stripe handling payments. The platform serves three user roles — **Customer**, **Researcher**, and **Admin** — each with dedicated interfaces within the same application.

## System Flow

```
[Customer]                       [Platform]                          [Researcher]
    |                                |                                    |
    |  1. Browse landing page        |                                    |
    |  2. Sign up / Login            |                                    |
    |  3. Buy credits (Stripe)       |                                    |
    |  4. Submit property order      |                                    |
    |          --------------------> |                                    |
    |                                |  5. Deduct 1 credit (atomic)       |
    |                                |  6. Create order record            |
    |                                |  7. Admin assigns researcher       |
    |                                |          ----------------------->  |
    |                                |                                    |
    |                                |  8. Researcher opens checklist     |
    |                                |  9. Researches public records      |
    |                                | 10. Fills standardized template    |
    |                                |          <-----------------------  |
    |                                | 11. Report uploaded to storage     |
    |                                | 12. Admin quality review           |
    |                                | 13. Order marked complete          |
    |  14. Email notification        |                                    |
    | <----------------------------- |                                    |
    |  15. View/download report      |                                    |
```

## Tech Stack Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 15 (App Router) | Server Components reduce client JS bundle. Server Actions provide type-safe mutations. App Router enables nested layouts, streaming, and route groups. Built-in SEO via Metadata API. |
| **Language** | TypeScript | End-to-end type safety. Supabase generates database types automatically. Zod for runtime validation. |
| **Database** | Supabase (PostgreSQL) | Managed Postgres with Row Level Security (authorization at database level). Built-in auth eliminates custom auth code. Real-time subscriptions for live order status. Storage buckets for report PDFs. |
| **Payments** | Stripe | Checkout Sessions handle PCI compliance — no card data touches our servers. Webhooks for reliable payment confirmation. Well-documented, battle-tested. |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS for rapid development. shadcn/ui provides accessible, customizable components (not a dependency — code is copied into project). Dark theme support built-in. |
| **i18n** | next-intl | Best integration with App Router and Server Components. URL-based locale routing (`/en/...`, `/pt/...`) for SEO. ICU message format for plurals. |
| **Email** | Resend + React Email | Transactional emails built as React components. High deliverability. Simple API. |
| **Deployment** | Vercel | Zero-config Next.js deployment. Automatic preview deploys per PR. Edge middleware. Global CDN. |
| **Monitoring** | Sentry | Error tracking with source maps. Performance monitoring. Session replay for debugging. |

## Authentication Flow

```
Browser Request
    |
    v
middleware.ts
    |-- 1. Supabase: Refresh session cookie (@supabase/ssr)
    |-- 2. next-intl: Detect/apply locale (en/pt)
    |-- 3. Auth guards:
    |       - Unauthenticated + /dashboard/* --> redirect to /login
    |       - Unauthenticated + /admin/*     --> redirect to /login
    |       - Authenticated + /login         --> redirect to /dashboard
    |       - Non-admin + /admin/*           --> redirect to /dashboard
    v
App Router renders page
    |-- Server Components: createServerClient() reads cookies
    |-- Client Components: createBrowserClient() for client-side queries
```

**Key points:**
- Cookie-based sessions (HttpOnly, Secure, SameSite=Lax)
- No JWT tokens exposed to JavaScript
- Session refreshed transparently on every request via middleware
- Role stored in `profiles.role` column, checked in middleware AND RLS policies (defense in depth)

## Application Structure (Route Groups)

Next.js App Router route groups organize the app into distinct layout contexts without affecting URL structure:

```
app/[locale]/
    |
    |-- (marketing)/     --> Public pages: landing, pricing, about, blog
    |   layout.tsx       --> Header + Footer, no sidebar
    |
    |-- (auth)/          --> Login, signup, password reset
    |   layout.tsx       --> Centered card layout, minimal chrome
    |
    |-- (dashboard)/     --> Customer area: orders, credits, reports
    |   layout.tsx       --> Sidebar + top bar, requires auth
    |
    |-- (admin)/         --> Admin + Researcher area
    |   layout.tsx       --> Admin sidebar + top bar, requires admin/researcher role
```

## Data Flow: Order Lifecycle

1. **Customer submits order** (Server Action in `src/actions/orders.ts`)
2. Server Action calls Postgres function `create_order_with_credit_deduction()`
3. Postgres function atomically:
   - Locks user row with `SELECT ... FOR UPDATE`
   - Verifies `credit_balance >= 1`
   - Decrements `credit_balance`
   - Inserts `credit_ledger` entry (debit)
   - Inserts `orders` row with status `submitted`
   - Copies active `checklist_templates` into `checklist_items` for this order
4. Server Action sends confirmation email via Resend
5. Admin assigns researcher (updates `orders.researcher_id`, status → `assigned`)
6. Researcher fills checklist items, uploads supporting docs
7. Researcher submits for review (status → `in_review`)
8. Admin reviews, either approves (status → `completed`) or requests revision
9. On completion: report PDF generated/uploaded, customer notified via email
10. Customer views report in dashboard, downloads PDF via signed URL

## Data Flow: Credit Purchase

1. **Customer clicks "Buy Credits"** on pricing page or dashboard
2. Server Action creates Stripe Checkout Session with:
   - `line_items`: the selected credit package (Stripe Price ID)
   - `metadata`: `{ user_id, package_id, credits }`
   - `success_url` / `cancel_url`
3. Customer redirected to Stripe-hosted checkout page
4. After payment, Stripe sends `checkout.session.completed` webhook to `/api/webhooks/stripe`
5. Webhook handler:
   - Verifies Stripe signature
   - Checks idempotency (skip if event already processed)
   - Uses Supabase **service-role client** (not user session)
   - Atomically: updates `profiles.credit_balance`, inserts `credit_ledger` entry (credit)
6. Customer redirected to success page, balance updated in real-time

## File Storage

- **Bucket**: `reports` (private)
- **Path structure**: `reports/{order_id}/{filename}`
- **Access**: Signed URLs with 60-second expiry, generated server-side
- **Types**: PDF reports, supporting document scans
- RLS on storage ensures only the order's customer, assigned researcher, and admins can access files

## Folder Structure

```
title-project/
|-- README.md
|-- .env.local.example
|-- .gitignore
|-- next.config.ts
|-- tailwind.config.ts
|-- tsconfig.json
|-- package.json
|-- middleware.ts                    # Supabase session + next-intl + auth guards
|
|-- docs/                           # Project documentation
|
|-- messages/                       # i18n translation files
|   |-- en.json
|   |-- pt.json
|
|-- public/                         # Static assets
|   |-- images/
|
|-- supabase/
|   |-- config.toml
|   |-- seed.sql
|   |-- migrations/
|       |-- 00001_create_profiles.sql
|       |-- 00002_create_credit_packages.sql
|       |-- 00003_create_credit_ledger.sql
|       |-- 00004_create_orders.sql
|       |-- 00005_create_checklist_items.sql
|       |-- 00006_create_reports.sql
|       |-- 00007_create_order_status_history.sql
|       |-- 00008_create_checklist_templates.sql
|       |-- 00009_rls_policies.sql
|       |-- 00010_functions.sql
|
|-- src/
    |-- i18n/
    |   |-- routing.ts              # Locale config (en, pt)
    |   |-- request.ts              # Request-scoped locale
    |   |-- navigation.ts           # Typed navigation helpers
    |
    |-- lib/
    |   |-- supabase/
    |   |   |-- client.ts           # Browser client
    |   |   |-- server.ts           # Server client (cookie-based)
    |   |   |-- admin.ts            # Service-role client (webhooks)
    |   |   |-- middleware.ts        # Session refresh helper
    |   |-- stripe/
    |   |   |-- client.ts           # Stripe instance
    |   |   |-- config.ts           # Price IDs, package config
    |   |-- email/
    |   |   |-- send.ts             # Resend wrapper
    |   |   |-- templates/          # React Email templates
    |   |-- utils/
    |   |   |-- cn.ts               # Tailwind class merge
    |   |   |-- format-currency.ts
    |   |   |-- format-date.ts
    |   |   |-- constants.ts
    |   |-- validators/
    |       |-- order.ts            # Zod schemas
    |       |-- auth.ts
    |       |-- profile.ts
    |
    |-- types/
    |   |-- database.ts             # Supabase generated types
    |   |-- order.ts
    |   |-- credit.ts
    |   |-- report.ts
    |
    |-- components/
    |   |-- ui/                     # shadcn/ui components
    |   |-- layout/                 # Header, footer, sidebar, locale switcher
    |   |-- landing/                # Hero, features, pricing, FAQ, etc.
    |   |-- dashboard/              # Customer dashboard components
    |   |-- admin/                  # Admin/researcher components
    |   |-- shared/                 # Loading spinners, error boundaries
    |
    |-- app/
    |   |-- [locale]/
    |   |   |-- layout.tsx          # Root locale layout
    |   |   |-- (marketing)/        # Public pages
    |   |   |-- (auth)/             # Login, signup
    |   |   |-- (dashboard)/        # Customer area
    |   |   |-- (admin)/            # Admin + researcher area
    |   |-- api/
    |       |-- webhooks/stripe/route.ts
    |       |-- auth/callback/route.ts
    |       |-- reports/[id]/download/route.ts
    |
    |-- actions/                    # Server Actions
        |-- auth.ts
        |-- orders.ts
        |-- credits.ts
        |-- reports.ts
        |-- admin.ts
        |-- profile.ts
```

## Key Technical Decisions

1. **Server Actions over API Routes**: All authenticated mutations use Server Actions for type safety, automatic form state, and co-location. API Routes are reserved for webhooks (Stripe) and auth callbacks (Supabase) which need raw request access.

2. **Double-entry credit ledger**: Every credit transaction (purchase, usage, refund, adjustment) is recorded as a row in `credit_ledger`. The `profiles.credit_balance` column is a denormalized cache, kept in sync atomically via Postgres functions.

3. **Postgres function for order creation**: Wrapping credit deduction + order creation in a single `SECURITY DEFINER` function with `FOR UPDATE` row locking prevents race conditions.

4. **`(SELECT auth.uid())` in RLS**: Wrapping `auth.uid()` in a subquery prevents PostgreSQL from re-evaluating it for every row, significantly improving RLS performance on large tables.

5. **Private storage with signed URLs**: Report PDFs are stored in a private Supabase Storage bucket. Download links are short-lived signed URLs (60s expiry) generated server-side, ensuring only authorized users can access files.
