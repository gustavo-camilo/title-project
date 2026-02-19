# Security & Compliance

## Overview

TitleSearch Pro handles sensitive financial transactions (credit card payments) and private property research data. This document outlines the security measures, data protection policies, and legal compliance requirements for the platform.

## Payment Security

### Stripe PCI DSS Compliance

- **No card data on our servers**: All payment processing uses Stripe Checkout Sessions — customers enter card details on Stripe's hosted payment page, not on our platform
- **PCI DSS Level 1**: Stripe is a certified PCI DSS Level 1 Service Provider (the highest level of certification)
- **Our responsibility**: Maintain secure integration practices (use HTTPS, validate webhook signatures, keep Stripe SDK updated)

### Webhook Security

- **Signature verification**: Every incoming Stripe webhook is verified using `stripe.webhooks.constructEvent()` with the webhook signing secret
- **Idempotency**: Stripe event IDs are stored in the database; duplicate events are silently ignored to prevent double credit grants
- **Service-role client**: Webhook handlers use the Supabase service-role client (not the user's session) since webhooks originate from Stripe, not from an authenticated user
- **IP filtering** (optional): Restrict webhook endpoint to Stripe's IP ranges for additional security

### Secure Payment Flow

```
Customer clicks "Buy Credits"
    |
    v
Server Action creates Stripe Checkout Session
(with package metadata: user_id, credits, package_id)
    |
    v
Customer redirected to Stripe-hosted payment page
(Card data NEVER touches our servers)
    |
    v
Payment succeeds → Stripe sends webhook
    |
    v
/api/webhooks/stripe/route.ts:
  1. Verify webhook signature
  2. Check idempotency (skip if event already processed)
  3. Use service-role Supabase client
  4. Atomically: update credit_balance + insert ledger entry
  5. Return 200 OK
```

## Authentication

### Supabase Auth

- **Method**: Email/password authentication with optional Google OAuth
- **Session management**: Cookie-based sessions using `@supabase/ssr`
  - `HttpOnly`: Cookies cannot be accessed by JavaScript (prevents XSS token theft)
  - `Secure`: Cookies only sent over HTTPS
  - `SameSite=Lax`: Prevents CSRF attacks on most endpoints
- **Session refresh**: Middleware automatically refreshes expired sessions on every request
- **Password requirements**: Minimum 8 characters (enforced by Supabase)

### Multi-Layer Authorization

Authorization is enforced at **three levels** (defense in depth):

| Layer | Implementation | Purpose |
|-------|---------------|---------|
| **Middleware** | `middleware.ts` | Route-level access control (redirect unauthenticated users, block non-admins from /admin) |
| **Server Actions** | Role checks in each action | Business logic authorization (verify user owns the order, has sufficient credits) |
| **Database (RLS)** | Row Level Security policies | Data-level access control (users can only SELECT/UPDATE their own rows) |

Even if a bug bypasses middleware or Server Action checks, RLS policies at the database level prevent unauthorized data access.

## Row Level Security (RLS) Policies

### Profiles Table
```sql
-- Users can only read their own profile
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile (except role and credit_balance)
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );
```

### Orders Table
```sql
-- Customers see their own orders
CREATE POLICY "customer_select_orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Researchers see their assigned orders
CREATE POLICY "researcher_select_orders" ON orders
  FOR SELECT USING (auth.uid() = researcher_id);

-- Admins see all orders
CREATE POLICY "admin_select_orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );
```

### Reports Table
```sql
-- Users can view reports for their own orders
CREATE POLICY "customer_select_reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = reports.order_id
      AND orders.customer_id = (SELECT auth.uid())
    )
  );

-- Researchers can view/edit reports for their assigned orders
CREATE POLICY "researcher_manage_reports" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = reports.order_id
      AND orders.researcher_id = (SELECT auth.uid())
    )
  );
```

**Performance note**: Using `(SELECT auth.uid())` instead of bare `auth.uid()` wraps it in a subquery, preventing PostgreSQL from re-evaluating the function for every row.

## Input Validation

### Zod Schemas

All user inputs are validated server-side using Zod schemas before any database mutation:

```typescript
// Example: Order creation schema
const createOrderSchema = z.object({
  propertyAddress: z.string().min(5).max(500),
  propertyCity: z.string().min(1).max(100),
  propertyState: z.string().length(2),  // US state abbreviation
  propertyCounty: z.string().min(1).max(100),
  parcelId: z.string().max(50).optional(),
  auctionType: z.enum(['tax_deed', 'foreclosure', 'other']).optional(),
  customerNotes: z.string().max(2000).optional(),
});
```

### Validation Rules
- **All Server Actions**: Validate input with Zod before processing
- **Parameterized queries**: Supabase client uses parameterized queries (no raw SQL concatenation)
- **File uploads**: Validate file type (PDF, JPEG, PNG only), size (max 10MB), and scan for malicious content
- **Rich text**: No rich text/HTML input fields — plain text only to prevent XSS

## Rate Limiting

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| Login / Signup | 5 requests | 1 minute | Prevent brute-force attacks |
| Password reset | 3 requests | 15 minutes | Prevent email flooding |
| Order creation | 10 requests | 1 hour | Prevent accidental duplicate orders |
| Credit purchase | 3 requests | 1 hour | Prevent payment fraud |
| API webhooks | 100 requests | 1 minute | Allow Stripe retry behavior |

**Implementation**: Middleware-based rate limiting using Upstash Redis (serverless, compatible with Vercel Edge) or in-memory for MVP.

## Data Protection

### Data Classification

| Data Type | Sensitivity | Storage | Access |
|-----------|------------|---------|--------|
| User email/password | High | Supabase Auth (hashed) | System only |
| User profile (name, phone) | Medium | Supabase `profiles` table | User + Admin |
| Credit card data | Critical | Stripe (never on our servers) | Stripe only |
| Order details (property addresses) | Medium | Supabase `orders` table | Customer + Researcher + Admin |
| Research reports | Medium-High | Supabase Storage (private bucket) | Customer + Researcher + Admin |
| Credit balance/transactions | Medium | Supabase `credit_ledger` table | User + Admin |

### Encryption
- **In transit**: All data encrypted via TLS 1.3 (HTTPS enforced by Vercel)
- **At rest**: Supabase encrypts all data at rest using AES-256
- **Backups**: Supabase automated daily backups (encrypted)

### Data Retention
- **User accounts**: Retained until user requests deletion
- **Order data**: Retained for 7 years (tax/legal compliance)
- **Reports**: Retained for 3 years after delivery
- **Credit ledger**: Retained for 7 years (financial records)
- **Server logs**: Retained for 90 days

### Data Deletion (Right to Erasure)
- Users can request account deletion via support
- On deletion: profile anonymized, personal data removed, orders retained with anonymized customer_id for financial records
- Stripe customer data deleted via Stripe API

## HTTPS & Transport Security

- **Vercel**: Automatically provisions and renews SSL/TLS certificates for all domains
- **HSTS**: Strict-Transport-Security header enabled
- **All API calls**: Over HTTPS (Supabase, Stripe, Resend)
- **No mixed content**: All resources loaded over HTTPS

## Environment Variables & Secrets

- **Never committed**: `.env.local` is in `.gitignore`
- **Template provided**: `.env.local.example` documents all required variables (without values)
- **Vercel secrets**: Production secrets stored in Vercel's encrypted environment variable storage
- **Rotation**: Stripe API keys and Supabase service-role keys should be rotated periodically
- **Least privilege**: Frontend only has access to `NEXT_PUBLIC_*` variables (anon key, publishable key)

## Legal Disclaimers

### Terms of Service (Key Points)

1. **Informational only**: Reports are for informational purposes only and do not constitute legal advice
2. **Not title insurance**: TitleSearch Pro reports are not a substitute for title insurance. We recommend consulting with a qualified attorney and obtaining title insurance before completing any real estate purchase
3. **Best-effort research**: We research publicly available records. We cannot guarantee completeness, as some liens may not be recorded or may be in systems we don't have access to
4. **No liability**: TitleSearch Pro is not liable for decisions made based on our reports
5. **Credit policy**: Credits are non-refundable once used (order submitted). Unused credits refundable within 30 days of purchase

### Privacy Policy (Key Points)

1. **Data collected**: Name, email, phone, property addresses submitted for research
2. **Data usage**: To provide title search services, send transactional emails, improve the platform
3. **Data sharing**: We do not sell personal data. Data shared only with: Supabase (hosting), Stripe (payments), Resend (email)
4. **Cookies**: Session cookies (functional, required) + analytics cookies (optional, consent-based)
5. **CCPA compliance**: California residents can request data disclosure and deletion
6. **GDPR**: If serving EU residents, additional rights apply (not primary market but prepared)

## Security Monitoring

### Error Tracking
- **Sentry**: Captures all unhandled errors with stack traces and user context
- **Alerts**: Email/Slack notifications for error spikes

### Audit Logging
- **Order status changes**: Every status change recorded in `order_status_history` with who made the change
- **Credit transactions**: Every credit operation recorded in `credit_ledger` with type and reference
- **Admin actions**: All admin operations (user management, credit adjustments) logged with admin user ID and reason

### Incident Response
1. **Detection**: Sentry alerts, Supabase monitoring, user reports
2. **Assessment**: Determine scope, affected users, data exposure
3. **Containment**: Disable affected features, revoke compromised keys
4. **Remediation**: Fix vulnerability, rotate secrets, patch deployment
5. **Notification**: Notify affected users within 72 hours if personal data was exposed
6. **Post-mortem**: Document incident, update security measures
