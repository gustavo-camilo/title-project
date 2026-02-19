# Development Roadmap

## Overview

TitleSearch Pro is built in 7 phases, progressing from foundation to full-featured platform. Each phase builds on the previous one, and the platform is functional and deployable after Phase 3.

## Phase 1: Foundation (Week 1)

**Goal**: Project scaffolding, authentication, and core layouts.

### Tasks

- [ ] Initialize Next.js 15 project with TypeScript and App Router
- [ ] Install and configure Tailwind CSS + shadcn/ui
- [ ] Set up next-intl with `[locale]` prefix routing (en, pt)
- [ ] Create base translation files (`messages/en.json`, `messages/pt.json`)
- [ ] Create Supabase project and configure environment variables
- [ ] Write all database migrations (tables, functions, RLS policies)
- [ ] Run migrations via Supabase CLI
- [ ] Implement Supabase Auth integration:
  - [ ] Server client (`src/lib/supabase/server.ts`)
  - [ ] Browser client (`src/lib/supabase/client.ts`)
  - [ ] Admin/service-role client (`src/lib/supabase/admin.ts`)
  - [ ] Middleware session refresh (`src/lib/supabase/middleware.ts`)
- [ ] Build combined middleware (`middleware.ts`): Supabase session + next-intl + auth guards
- [ ] Create route group layouts:
  - [ ] `(marketing)` layout: Header + Footer
  - [ ] `(auth)` layout: Centered card
  - [ ] `(dashboard)` layout: Sidebar + top bar
  - [ ] `(admin)` layout: Admin sidebar + top bar
- [ ] Implement auth pages: login, signup, forgot password, reset password
- [ ] Create auth callback route handler (`/api/auth/callback`)
- [ ] Build locale switcher component (EN/PT toggle)
- [ ] Set up ESLint + Prettier configuration
- [ ] Configure Husky + lint-staged for pre-commit hooks

### Deliverables
- Running Next.js app with working authentication
- Users can sign up, log in, and see role-appropriate dashboard shells
- Bilingual routing works (`/en/...`, `/pt/...`)

---

## Phase 2: Landing Page (Week 1-2)

**Goal**: Public-facing marketing pages with bilingual content and SEO.

### Tasks

- [ ] Build landing page sections:
  - [ ] Navigation bar (logo, links, locale switcher, CTA buttons)
  - [ ] Hero section (headline, subheadline, CTA, trust badges)
  - [ ] Problem/agitation section (risks of buying without research)
  - [ ] How It Works (3-step process)
  - [ ] What We Search (8 lien type cards with icons)
  - [ ] Sample report preview (redacted example)
  - [ ] Pricing section (4 credit packages)
  - [ ] Testimonials (customer quotes)
  - [ ] FAQ (expandable accordion)
  - [ ] Final CTA (email capture + button)
  - [ ] Footer (links, social, locale switcher)
- [ ] Translate all landing page content to Portuguese
- [ ] Implement responsive design (mobile-first)
- [ ] Add SEO metadata for all pages (title, description, Open Graph, Twitter cards)
- [ ] Build pricing page (standalone, detailed comparison)
- [ ] Build about page
- [ ] Build contact page
- [ ] Set up blog infrastructure (MDX-based or Supabase-backed)
- [ ] Create dark theme with orange/gold accent colors

### Deliverables
- Fully functional bilingual landing page
- Responsive design working on all devices
- SEO-optimized with proper metadata
- Blog ready for content

---

## Phase 3: Payment System (Week 2)

**Goal**: Stripe integration, credit purchases, and balance management.

### Tasks

- [ ] Create Stripe account and configure products/prices for each credit package
- [ ] Implement Stripe client (`src/lib/stripe/client.ts`)
- [ ] Build Server Action: `createCheckoutSession` in `src/actions/credits.ts`
- [ ] Build Stripe webhook handler (`/api/webhooks/stripe/route.ts`):
  - [ ] Signature verification
  - [ ] Idempotency check
  - [ ] Credit fulfillment (update balance + insert ledger entry)
- [ ] Build customer credits page:
  - [ ] Current balance display
  - [ ] Package selection (buy more credits)
  - [ ] Transaction history (credit ledger)
- [ ] Build credit balance component for dashboard sidebar
- [ ] Implement Stripe Customer creation on signup
- [ ] Add success/cancel redirect pages after Stripe Checkout
- [ ] Test full payment flow in Stripe test mode
- [ ] Seed credit packages into database

### Deliverables
- Customers can purchase credits via Stripe
- Credit balance updates in real-time after payment
- Full transaction history visible to customers
- **Platform is minimally viable after this phase**

---

## Phase 4: Order System (Week 2-3)

**Goal**: Property research order submission and tracking.

### Tasks

- [ ] Build new order form (`/dashboard/orders/new`):
  - [ ] Property address fields (address, city, state, ZIP, county)
  - [ ] Parcel ID (optional)
  - [ ] Auction type selector (tax deed, foreclosure, other)
  - [ ] Auction date picker (optional)
  - [ ] Customer notes field
  - [ ] Credit balance check before submission
- [ ] Implement Zod validation schemas for order form
- [ ] Implement Postgres function `create_order_with_credit_deduction()`
- [ ] Build Server Action: `createOrder` in `src/actions/orders.ts`
- [ ] Build customer order list page (`/dashboard/orders`):
  - [ ] Order cards with status badges
  - [ ] Filtering by status
  - [ ] Search by property address
- [ ] Build order detail page (`/dashboard/orders/[id]`):
  - [ ] Property information
  - [ ] Order status timeline
  - [ ] Report viewer (when complete)
- [ ] Set up Resend for transactional emails
- [ ] Build email templates (React Email):
  - [ ] Order confirmation
  - [ ] Report ready notification
  - [ ] Welcome email
- [ ] Implement order cancellation (refund credit if before assignment)

### Deliverables
- Customers can submit property research orders (1 credit each)
- Order tracking with status updates
- Email notifications for key events
- Order cancellation with credit refund

---

## Phase 5: Admin & Researcher Dashboard (Week 3-4)

**Goal**: Internal tools for managing orders, researchers, and reports.

### Tasks

- [ ] Build admin overview dashboard (`/admin`):
  - [ ] Key metrics cards (orders today, pending, revenue, avg turnaround)
  - [ ] Orders by status chart
  - [ ] Recent activity feed
- [ ] Build admin order management (`/admin/orders`):
  - [ ] Filterable/sortable table (status, date, researcher, customer)
  - [ ] Bulk researcher assignment
  - [ ] Status change controls
- [ ] Build admin order detail page (`/admin/orders/[id]`):
  - [ ] Full order info + customer info
  - [ ] Researcher assignment dropdown
  - [ ] Checklist progress view
  - [ ] Report review controls (approve / request revision)
- [ ] Build user management page (`/admin/users`):
  - [ ] User list with role, balance, order count
  - [ ] Role assignment (promote to researcher)
  - [ ] Manual credit adjustment (with reason)
- [ ] Build researcher queue page (`/researcher`):
  - [ ] Assigned orders sorted by priority/date
  - [ ] Status indicators (not started, in progress, submitted)
- [ ] Build researcher workspace (`/researcher/[orderId]`):
  - [ ] Property information header
  - [ ] Interactive checklist (checkbox + notes + source URL per item)
  - [ ] File upload for supporting documents
  - [ ] "Submit for Review" button
  - [ ] Timer for tracking research time (internal metric)
- [ ] Build report creation flow:
  - [ ] Executive summary editor
  - [ ] Risk level selector
  - [ ] Per-category findings form
  - [ ] PDF generation and upload to Supabase Storage
- [ ] Build secure report download route (`/api/reports/[id]/download`):
  - [ ] Generate signed URL
  - [ ] Verify user authorization
  - [ ] Short expiry (60 seconds)
- [ ] Implement Supabase Real-time for live order status updates

### Deliverables
- Admins can manage all orders, users, and researchers
- Researchers have a guided workspace with checklists
- Reports are generated, reviewed, and delivered
- Full order lifecycle from submission to delivery

---

## Phase 6: Polish & Launch (Week 4)

**Goal**: Testing, optimization, security audit, and production deployment.

### Tasks

- [ ] Write unit tests (Vitest):
  - [ ] Zod validation schemas
  - [ ] Utility functions
  - [ ] Credit balance calculations
- [ ] Write E2E tests (Playwright):
  - [ ] Signup → login flow
  - [ ] Credit purchase flow (Stripe test mode)
  - [ ] Order submission flow
  - [ ] Report viewing flow
  - [ ] Locale switching
- [ ] Performance optimization:
  - [ ] Image optimization (next/image, WebP/AVIF)
  - [ ] Lazy loading for below-fold content
  - [ ] Static generation for marketing pages
  - [ ] Bundle analysis and code splitting
- [ ] Security audit:
  - [ ] Verify all RLS policies work correctly
  - [ ] Test authorization edge cases (access other users' orders)
  - [ ] Verify webhook signature validation
  - [ ] Check for XSS, CSRF, injection vulnerabilities
  - [ ] Verify rate limiting works
- [ ] Final bilingual content review (native speaker review)
- [ ] Set up custom domain
- [ ] Configure Sentry for error tracking
- [ ] Set up Vercel Analytics or PostHog
- [ ] Create Terms of Service and Privacy Policy pages
- [ ] Configure Stripe for live mode
- [ ] Deploy to production on Vercel
- [ ] Set up uptime monitoring

### Deliverables
- Production-ready application
- Test coverage on critical paths
- Performance optimized
- Security audited
- Live and accepting customers

---

## Phase 7: Post-Launch Iteration (Ongoing)

**Goal**: Growth features, customer feedback, and continuous improvement.

### Month 1 Post-Launch
- [ ] Collect customer feedback (in-app survey after first report)
- [ ] Fix bugs and UX issues based on feedback
- [ ] Publish first 4 blog posts (SEO)
- [ ] Launch Google Ads and Facebook Ads campaigns
- [ ] Implement basic analytics dashboard (admin)

### Month 2-3 Post-Launch
- [ ] Implement referral program (give 1, get 1)
- [ ] Add rush delivery option (2 credits, 4-8 hour turnaround)
- [ ] Add extended search option (2 credits, includes PACER + municipal liens)
- [ ] Build email marketing automation (welcome sequence, re-engagement)
- [ ] Expand content marketing (YouTube, blog)

### Month 4-6 Post-Launch
- [ ] Investigate county record API integrations (automate where possible)
- [ ] Build bulk order upload (CSV import for power users)
- [ ] Add Google OAuth signup option
- [ ] Implement NPS surveys
- [ ] Consider mobile app (React Native)

### Month 7-12 Post-Launch
- [ ] Launch ongoing monitoring subscription service
- [ ] Build B2B API for title companies and investment firms
- [ ] Expand international (consider Canadian, UK markets)
- [ ] Hire additional researchers to scale capacity
- [ ] Explore AI-assisted research (automated county record parsing)

---

## Technical Debt Backlog

Items to address as the platform matures:

- [ ] Comprehensive test coverage (target 80%+)
- [ ] Database query optimization and indexing review
- [ ] CDN caching strategy for static assets
- [ ] Implement database connection pooling (Supabase built-in)
- [ ] Add structured logging
- [ ] Implement feature flags for gradual rollouts
- [ ] Database read replicas if query volume increases
- [ ] Consider edge computing for latency-sensitive routes
