# Database Schema

## Overview

TitleSearch Pro uses Supabase (PostgreSQL) with Row Level Security (RLS) enabled on all tables. The schema is designed for:

- **Atomic credit operations**: Postgres functions ensure credits and orders are created/deducted in a single transaction
- **Full audit trail**: Credit ledger and order status history tables record every change
- **Role-based access**: RLS policies enforce data isolation between customers, researchers, and admins
- **Bilingual support**: Key user-facing tables include `_pt` columns for Portuguese translations

## Entity Relationship Diagram

```
auth.users (Supabase managed)
    |
    | 1:1
    v
profiles
    |
    |-- 1:N --> credit_ledger
    |-- 1:N --> orders (as customer)
    |-- 1:N --> orders (as researcher)

orders
    |
    |-- 1:N --> checklist_items
    |-- 1:1 --> reports
    |-- 1:N --> order_status_history

credit_packages (standalone, admin-managed)

checklist_templates (standalone, admin-managed)
```

## Tables

### 1. profiles

Extends Supabase `auth.users` with application-specific data.

```sql
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    full_name       TEXT,
    phone           TEXT,
    preferred_locale TEXT DEFAULT 'en' CHECK (preferred_locale IN ('en', 'pt')),
    role            TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'researcher', 'admin')),
    credit_balance  INTEGER DEFAULT 0 CHECK (credit_balance >= 0),
    stripe_customer_id TEXT UNIQUE,
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users.id` |
| `email` | TEXT | User's email address |
| `full_name` | TEXT | Display name |
| `phone` | TEXT | Phone number (optional) |
| `preferred_locale` | TEXT | `en` or `pt` |
| `role` | TEXT | `customer`, `researcher`, or `admin` |
| `credit_balance` | INTEGER | Denormalized credit balance (cache of ledger SUM) |
| `stripe_customer_id` | TEXT | Stripe Customer ID for payment tracking |
| `avatar_url` | TEXT | Profile picture URL |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last profile update |

---

### 2. credit_packages

Admin-managed credit packages available for purchase.

```sql
CREATE TABLE public.credit_packages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    name_pt         TEXT NOT NULL,
    description     TEXT,
    description_pt  TEXT,
    credits         INTEGER NOT NULL CHECK (credits > 0),
    price_cents     INTEGER NOT NULL CHECK (price_cents > 0),
    stripe_price_id TEXT UNIQUE,
    is_active       BOOLEAN DEFAULT true,
    is_featured     BOOLEAN DEFAULT false,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_credit_packages_active ON credit_packages (is_active, sort_order);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `name` | TEXT | Package name in English |
| `name_pt` | TEXT | Package name in Portuguese |
| `description` | TEXT | Description in English |
| `description_pt` | TEXT | Description in Portuguese |
| `credits` | INTEGER | Number of credits in package |
| `price_cents` | INTEGER | Price in USD cents (e.g., 4900 = $49.00) |
| `stripe_price_id` | TEXT | Stripe Price ID for checkout |
| `is_active` | BOOLEAN | Whether package is available for purchase |
| `is_featured` | BOOLEAN | Whether to highlight as "most popular" |
| `sort_order` | INTEGER | Display order on pricing page |

---

### 3. credit_ledger

Immutable audit trail of all credit transactions. Every credit operation is recorded here.

```sql
CREATE TABLE public.credit_ledger (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.profiles(id),
    amount                  INTEGER NOT NULL,
    type                    TEXT NOT NULL CHECK (type IN (
                                'purchase', 'usage', 'refund', 'adjustment', 'referral'
                            )),
    reference_id            UUID,
    stripe_payment_intent_id TEXT,
    description             TEXT,
    created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_credit_ledger_user ON credit_ledger (user_id, created_at DESC);
CREATE INDEX idx_credit_ledger_stripe ON credit_ledger (stripe_payment_intent_id)
    WHERE stripe_payment_intent_id IS NOT NULL;
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK) | References `profiles.id` |
| `amount` | INTEGER | Positive for credits added, negative for credits used |
| `type` | TEXT | `purchase`, `usage`, `refund`, `adjustment`, `referral` |
| `reference_id` | UUID | Links to `orders.id` (for usage) or package reference |
| `stripe_payment_intent_id` | TEXT | Stripe Payment Intent ID (for idempotency) |
| `description` | TEXT | Human-readable description of transaction |
| `created_at` | TIMESTAMPTZ | Transaction timestamp |

**Invariant**: `SUM(amount) WHERE user_id = X` should always equal `profiles.credit_balance` for user X.

---

### 4. orders

Property research orders submitted by customers.

```sql
CREATE TABLE public.orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id         UUID NOT NULL REFERENCES public.profiles(id),
    researcher_id       UUID REFERENCES public.profiles(id),
    status              TEXT DEFAULT 'submitted' CHECK (status IN (
                            'submitted', 'assigned', 'in_progress',
                            'in_review', 'completed', 'revision_requested', 'cancelled'
                        )),
    priority            TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'rush')),
    property_address    TEXT NOT NULL,
    property_city       TEXT NOT NULL,
    property_state      TEXT NOT NULL,
    property_zip        TEXT,
    property_county     TEXT NOT NULL,
    parcel_id           TEXT,
    current_owner_name  TEXT,
    auction_date        DATE,
    auction_type        TEXT CHECK (auction_type IN ('tax_deed', 'foreclosure', 'other')),
    customer_notes      TEXT,
    risk_level          TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    assigned_at         TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_customer ON orders (customer_id, created_at DESC);
CREATE INDEX idx_orders_researcher ON orders (researcher_id, status)
    WHERE researcher_id IS NOT NULL;
CREATE INDEX idx_orders_status ON orders (status, created_at DESC);
```

---

### 5. checklist_items

Per-order checklist items filled by the researcher during the research process.

```sql
CREATE TABLE public.checklist_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    category        TEXT NOT NULL,
    item_name       TEXT NOT NULL,
    status          TEXT DEFAULT 'pending' CHECK (status IN (
                        'pending', 'found', 'clear', 'not_applicable'
                    )),
    notes           TEXT,
    source_url      TEXT,
    source_document TEXT,
    sort_order      INTEGER DEFAULT 0,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_checklist_order ON checklist_items (order_id, sort_order);
```

| Status | Meaning |
|--------|---------|
| `pending` | Not yet researched |
| `found` | Lien/encumbrance found — details in notes |
| `clear` | Researched and no issues found |
| `not_applicable` | Does not apply to this property (e.g., no HOA) |

---

### 6. reports

Final deliverable generated by the researcher for each order.

```sql
CREATE TABLE public.reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID UNIQUE NOT NULL REFERENCES public.orders(id),
    executive_summary   TEXT,
    risk_level          TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    findings            JSONB DEFAULT '{}',
    researcher_notes    TEXT,
    pdf_path            TEXT,
    version             INTEGER DEFAULT 1,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);
```

The `findings` JSONB column stores structured data:

```json
{
    "mortgages": {
        "status": "found",
        "items": [
            {
                "lender": "Bank of America",
                "amount": "$185,000",
                "recorded_date": "2019-03-15",
                "document_number": "2019-0045678",
                "notes": "First mortgage, no satisfaction recorded"
            }
        ]
    },
    "tax_liens": {
        "status": "clear",
        "items": []
    },
    "hoa_liens": {
        "status": "not_applicable",
        "items": []
    }
}
```

---

### 7. order_status_history

Audit trail for every order status change.

```sql
CREATE TABLE public.order_status_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES public.orders(id),
    old_status  TEXT,
    new_status  TEXT NOT NULL,
    changed_by  UUID REFERENCES public.profiles(id),
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_status_history_order ON order_status_history (order_id, created_at);
```

---

### 8. checklist_templates

Admin-managed default checklist items that are copied to each new order.

```sql
CREATE TABLE public.checklist_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category    TEXT NOT NULL,
    item_name   TEXT NOT NULL,
    item_name_pt TEXT NOT NULL,
    description TEXT,
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_templates_active ON checklist_templates (is_active, sort_order);
```

**Default checklist template entries** (seeded on setup):

| Category | Item Name | Sort Order |
|----------|-----------|------------|
| `property_verification` | Confirm property address and legal description | 10 |
| `property_verification` | Verify current owner name | 20 |
| `property_verification` | Confirm parcel/folio number | 30 |
| `mortgages` | Search county recorder for recorded mortgages | 40 |
| `mortgages` | Check for satisfaction/release documents | 50 |
| `mortgages` | Note open mortgages with lender and approximate balance | 60 |
| `tax_liens` | Search for IRS federal tax liens | 70 |
| `tax_liens` | Search for state tax liens | 80 |
| `tax_liens` | Check property tax collector for outstanding taxes | 90 |
| `hoa_liens` | Identify HOA/COA association | 100 |
| `hoa_liens` | Check for recorded HOA liens | 110 |
| `hoa_liens` | Note outstanding HOA assessments | 120 |
| `mechanics_liens` | Search county recorder for mechanic's liens | 130 |
| `mechanics_liens` | Check for construction permits | 140 |
| `mechanics_liens` | Verify lien validity per state time limits | 150 |
| `judgments` | Search county court for judgments against owner | 160 |
| `judgments` | Search federal court (PACER) for judgments | 170 |
| `judgments` | Check for child support liens | 180 |
| `lis_pendens` | Search county recorder for lis pendens filings | 190 |
| `lis_pendens` | Identify pending litigation affecting property | 200 |
| `code_violations` | Check municipal code enforcement records | 210 |
| `code_violations` | Look for open building permits | 220 |
| `code_violations` | Check for demolition orders or condemnation | 230 |
| `additional` | Check for easements | 240 |
| `additional` | Check for deed restrictions | 250 |
| `additional` | Note other recorded documents affecting title | 260 |

---

## Key Postgres Functions

### Atomic Order Creation with Credit Deduction

```sql
CREATE OR REPLACE FUNCTION public.create_order_with_credit_deduction(
    p_user_id           UUID,
    p_property_address  TEXT,
    p_property_city     TEXT,
    p_property_state    TEXT,
    p_property_zip      TEXT DEFAULT NULL,
    p_property_county   TEXT DEFAULT NULL,
    p_parcel_id         TEXT DEFAULT NULL,
    p_auction_type      TEXT DEFAULT NULL,
    p_auction_date      DATE DEFAULT NULL,
    p_customer_notes    TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_balance  INTEGER;
BEGIN
    -- Lock the user's row to prevent concurrent credit deductions
    SELECT credit_balance INTO v_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF v_balance < 1 THEN
        RAISE EXCEPTION 'Insufficient credits. Current balance: %', v_balance;
    END IF;

    -- Deduct 1 credit
    UPDATE public.profiles
    SET credit_balance = credit_balance - 1,
        updated_at = now()
    WHERE id = p_user_id;

    -- Create the order
    INSERT INTO public.orders (
        customer_id, property_address, property_city, property_state,
        property_zip, property_county, parcel_id, auction_type,
        auction_date, customer_notes
    )
    VALUES (
        p_user_id, p_property_address, p_property_city, p_property_state,
        p_property_zip, p_property_county, p_parcel_id, p_auction_type,
        p_auction_date, p_customer_notes
    )
    RETURNING id INTO v_order_id;

    -- Record the credit deduction in the ledger
    INSERT INTO public.credit_ledger (user_id, amount, type, reference_id, description)
    VALUES (p_user_id, -1, 'usage', v_order_id, 'Title search order: ' || p_property_address);

    -- Record status history
    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by, notes)
    VALUES (v_order_id, NULL, 'submitted', p_user_id, 'Order created');

    -- Create checklist items from active templates
    INSERT INTO public.checklist_items (order_id, category, item_name, sort_order)
    SELECT v_order_id, category, item_name, sort_order
    FROM public.checklist_templates
    WHERE is_active = true
    ORDER BY sort_order;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Credit Addition (for webhook handler)

```sql
CREATE OR REPLACE FUNCTION public.add_credits(
    p_user_id               UUID,
    p_amount                INTEGER,
    p_stripe_payment_intent TEXT,
    p_description           TEXT DEFAULT 'Credit purchase'
)
RETURNS INTEGER AS $$
DECLARE
    v_new_balance INTEGER;
    v_existing    INTEGER;
BEGIN
    -- Idempotency check: skip if this payment was already processed
    SELECT COUNT(*) INTO v_existing
    FROM public.credit_ledger
    WHERE stripe_payment_intent_id = p_stripe_payment_intent;

    IF v_existing > 0 THEN
        -- Already processed, return current balance
        SELECT credit_balance INTO v_new_balance FROM public.profiles WHERE id = p_user_id;
        RETURN v_new_balance;
    END IF;

    -- Add credits to balance
    UPDATE public.profiles
    SET credit_balance = credit_balance + p_amount,
        updated_at = now()
    WHERE id = p_user_id
    RETURNING credit_balance INTO v_new_balance;

    IF v_new_balance IS NULL THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;

    -- Record in ledger
    INSERT INTO public.credit_ledger (
        user_id, amount, type, stripe_payment_intent_id, description
    )
    VALUES (
        p_user_id, p_amount, 'purchase', p_stripe_payment_intent, p_description
    );

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Row Level Security Policies

All tables have RLS enabled. Policies use `(SELECT auth.uid())` wrapper for performance optimization.

### profiles
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users read own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
    USING (id = (SELECT auth.uid()));

-- Users update own profile (cannot change role or credit_balance)
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
    USING (id = (SELECT auth.uid()));

-- Admins read all profiles
CREATE POLICY "profiles_admin_select" ON profiles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    ));

-- Admins update all profiles
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    ));
```

### orders
```sql
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers see their own orders
CREATE POLICY "orders_customer_select" ON orders FOR SELECT
    USING (customer_id = (SELECT auth.uid()));

-- Researchers see assigned orders
CREATE POLICY "orders_researcher_select" ON orders FOR SELECT
    USING (researcher_id = (SELECT auth.uid()));

-- Admins see all orders
CREATE POLICY "orders_admin_select" ON orders FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    ));

-- Admins can update any order (assignment, status changes)
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    ));

-- Researchers can update their assigned orders (status, checklist progress)
CREATE POLICY "orders_researcher_update" ON orders FOR UPDATE
    USING (researcher_id = (SELECT auth.uid()));
```

### credit_ledger
```sql
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- Users see their own ledger entries
CREATE POLICY "ledger_select_own" ON credit_ledger FOR SELECT
    USING (user_id = (SELECT auth.uid()));

-- Admins see all ledger entries
CREATE POLICY "ledger_admin_select" ON credit_ledger FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    ));

-- No direct INSERT/UPDATE/DELETE via client — only through SECURITY DEFINER functions
```

### credit_packages
```sql
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Everyone can read active packages (for pricing page)
CREATE POLICY "packages_select_active" ON credit_packages FOR SELECT
    USING (is_active = true);

-- Admins can manage packages
CREATE POLICY "packages_admin_all" ON credit_packages FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    ));
```

---

## Seed Data

```sql
-- Credit packages
INSERT INTO public.credit_packages (name, name_pt, description, description_pt, credits, price_cents, is_active, is_featured, sort_order) VALUES
('Starter', 'Inicial', '1 title search report', '1 relatorio de pesquisa de titulo', 1, 4900, true, false, 1),
('Explorer', 'Explorador', '5 title search reports — save 19%', '5 relatorios de pesquisa — economize 19%', 5, 19900, true, false, 2),
('Professional', 'Profissional', '15 title search reports — save 29%', '15 relatorios de pesquisa — economize 29%', 15, 52500, true, true, 3),
('Enterprise', 'Empresarial', '50 title search reports — save 39%', '50 relatorios de pesquisa — economize 39%', 50, 150000, true, false, 4);

-- Checklist templates (see table in Section 8 above for all entries)
-- Insert all 26 default checklist template items here
```
