# API Reference

## Overview

TitleSearch Pro uses **Server Actions** for all authenticated mutations and **Route Handlers** only for webhooks and file operations that require raw HTTP access. This document covers all server-side endpoints.

## Server Actions

Server Actions are co-located in `src/actions/` and called directly from React components. They handle input validation, authentication, authorization, and database operations.

### Authentication Actions (`src/actions/auth.ts`)

#### `signUp`

Creates a new user account.

```typescript
async function signUp(formData: FormData): Promise<ActionResult>

// Input (via FormData)
{
  email: string       // Valid email address
  password: string    // Minimum 8 characters
  fullName: string    // User's display name
  locale: 'en' | 'pt' // Preferred language
}

// Success: Redirect to /dashboard
// Error: { error: string }
```

**Flow**:
1. Validate input with Zod
2. Call `supabase.auth.signUp()` with email and password
3. Profile created automatically via database trigger (`handle_new_user`)
4. Send welcome email via Resend
5. Redirect to dashboard

#### `signIn`

Authenticates an existing user.

```typescript
async function signIn(formData: FormData): Promise<ActionResult>

// Input
{
  email: string
  password: string
}

// Success: Redirect to /dashboard (or /admin for admin users)
// Error: { error: string }
```

#### `signOut`

Logs out the current user.

```typescript
async function signOut(): Promise<void>

// Clears Supabase session cookie
// Redirects to landing page
```

#### `resetPassword`

Sends a password reset email.

```typescript
async function resetPassword(formData: FormData): Promise<ActionResult>

// Input
{
  email: string
}

// Success: { message: "Check your email for a reset link" }
// Error: { error: string }
```

#### `updatePassword`

Sets a new password (from reset link).

```typescript
async function updatePassword(formData: FormData): Promise<ActionResult>

// Input
{
  password: string    // New password, minimum 8 characters
}

// Success: Redirect to /dashboard
// Error: { error: string }
```

---

### Credit Actions (`src/actions/credits.ts`)

#### `createCheckoutSession`

Creates a Stripe Checkout Session for purchasing credits.

```typescript
async function createCheckoutSession(packageId: string): Promise<{ url: string }>

// Input
packageId: string  // UUID of the credit_packages row

// Success: Returns Stripe Checkout URL for redirect
// Error: { error: string }
```

**Flow**:
1. Verify user is authenticated
2. Fetch credit package from database
3. Get or create Stripe Customer for user
4. Create Stripe Checkout Session with:
   - `mode: 'payment'`
   - `line_items: [{ price: package.stripe_price_id, quantity: 1 }]`
   - `metadata: { user_id, package_id, credits }`
   - `success_url: /dashboard/credits?success=true`
   - `cancel_url: /dashboard/credits?cancelled=true`
5. Return checkout URL

#### `getCreditBalance`

Returns the current user's credit balance.

```typescript
async function getCreditBalance(): Promise<{ balance: number }>

// Returns
{
  balance: number  // Current credit balance
}
```

#### `getCreditHistory`

Returns the user's credit transaction history.

```typescript
async function getCreditHistory(
  page?: number,
  limit?: number
): Promise<{ transactions: CreditLedgerEntry[], total: number }>

// Returns paginated list of credit_ledger entries for the current user
```

---

### Order Actions (`src/actions/orders.ts`)

#### `createOrder`

Submits a new property research order (deducts 1 credit).

```typescript
async function createOrder(formData: FormData): Promise<ActionResult>

// Input
{
  propertyAddress: string   // Street address
  propertyCity: string      // City
  propertyState: string     // 2-letter state abbreviation
  propertyZip?: string      // ZIP code (optional)
  propertyCounty: string    // County name
  parcelId?: string         // Parcel/folio number (optional)
  auctionType?: 'tax_deed' | 'foreclosure' | 'other'
  auctionDate?: string      // ISO date string (optional)
  customerNotes?: string    // Additional notes (max 2000 chars)
}

// Success: Redirect to /dashboard/orders/[new-order-id]
// Error: { error: string } (e.g., "Insufficient credits")
```

**Flow**:
1. Validate input with Zod
2. Verify user is authenticated
3. Call Postgres function `create_order_with_credit_deduction()` which atomically:
   - Checks and deducts 1 credit
   - Creates the order
   - Records ledger entry
   - Creates checklist items from templates
4. Send order confirmation email via Resend
5. Redirect to order detail page

#### `getOrders`

Returns the current user's orders.

```typescript
async function getOrders(filters?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{ orders: Order[], total: number }>
```

#### `getOrder`

Returns a single order by ID (with authorization check).

```typescript
async function getOrder(orderId: string): Promise<Order | null>
```

#### `cancelOrder`

Cancels an order (only if status is `submitted` and not yet assigned).

```typescript
async function cancelOrder(orderId: string): Promise<ActionResult>

// Flow:
// 1. Verify order exists and belongs to current user
// 2. Verify order status is 'submitted'
// 3. Refund 1 credit to user's balance
// 4. Update order status to 'cancelled'
// 5. Record status history and ledger entries
```

---

### Report Actions (`src/actions/reports.ts`)

#### `getReport`

Returns the report for a specific order.

```typescript
async function getReport(orderId: string): Promise<Report | null>

// Returns report data including findings JSONB, or null if not yet completed
```

#### `createOrUpdateReport` (Researcher only)

Creates or updates a report for an assigned order.

```typescript
async function createOrUpdateReport(
  orderId: string,
  data: {
    executiveSummary: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    findings: Record<string, CategoryFindings>
    researcherNotes?: string
  }
): Promise<ActionResult>
```

#### `uploadReportPdf` (Researcher only)

Uploads a PDF version of the report.

```typescript
async function uploadReportPdf(
  orderId: string,
  formData: FormData // contains 'file' field
): Promise<ActionResult>
```

#### `submitForReview` (Researcher only)

Marks an order as ready for admin review.

```typescript
async function submitForReview(orderId: string): Promise<ActionResult>

// Changes order status from 'in_progress' to 'in_review'
```

---

### Admin Actions (`src/actions/admin.ts`)

#### `assignResearcher`

Assigns a researcher to an order.

```typescript
async function assignResearcher(
  orderId: string,
  researcherId: string
): Promise<ActionResult>

// Changes order status to 'assigned'
// Sends notification email to researcher
```

#### `approveReport`

Approves a completed report and delivers it to the customer.

```typescript
async function approveReport(orderId: string): Promise<ActionResult>

// Changes order status to 'completed'
// Sends "report ready" email to customer
```

#### `requestRevision`

Sends a report back to the researcher for corrections.

```typescript
async function requestRevision(
  orderId: string,
  notes: string
): Promise<ActionResult>

// Changes order status to 'revision_requested'
// Notifies researcher via email
```

#### `adjustCredits`

Manually adjusts a user's credit balance (with audit trail).

```typescript
async function adjustCredits(
  userId: string,
  amount: number,  // positive or negative
  reason: string
): Promise<ActionResult>

// Records adjustment in credit_ledger with admin's user ID
```

#### `updateUserRole`

Changes a user's role.

```typescript
async function updateUserRole(
  userId: string,
  role: 'customer' | 'researcher' | 'admin'
): Promise<ActionResult>
```

---

### Profile Actions (`src/actions/profile.ts`)

#### `updateProfile`

Updates the current user's profile.

```typescript
async function updateProfile(formData: FormData): Promise<ActionResult>

// Input
{
  fullName?: string
  phone?: string
  preferredLocale?: 'en' | 'pt'
}
```

---

## Route Handlers

Route Handlers handle HTTP requests that require raw access (webhooks, file downloads, auth callbacks).

### Stripe Webhook (`src/app/api/webhooks/stripe/route.ts`)

```
POST /api/webhooks/stripe
```

Handles Stripe webhook events for payment processing.

**Headers**:
- `stripe-signature`: Webhook signature from Stripe

**Events handled**:
- `checkout.session.completed`: Customer completed a credit purchase
  - Extracts `user_id`, `credits`, and payment intent from session metadata
  - Calls `add_credits()` Postgres function
  - Idempotent: skips if payment intent already processed

**Security**:
- Verifies Stripe signature using `STRIPE_WEBHOOK_SECRET`
- Uses Supabase service-role client (not user session)
- Returns 200 OK even for unhandled event types (prevents Stripe retries)

**Response**:
- `200`: Event processed successfully
- `400`: Invalid signature or malformed request

---

### Auth Callback (`src/app/api/auth/callback/route.ts`)

```
GET /api/auth/callback?code=...
```

Handles Supabase Auth callback after email confirmation or OAuth.

**Flow**:
1. Extract `code` from query parameters
2. Exchange code for session using `supabase.auth.exchangeCodeForSession(code)`
3. Redirect to `/dashboard`

---

### Report Download (`src/app/api/reports/[id]/download/route.ts`)

```
GET /api/reports/:id/download
```

Generates a signed URL for downloading a report PDF.

**Authorization**: User must be the order's customer, the assigned researcher, or an admin.

**Flow**:
1. Verify user authentication
2. Fetch report and associated order
3. Verify user authorization (RLS + explicit check)
4. Generate signed URL from Supabase Storage (60-second expiry)
5. Redirect to signed URL

**Response**:
- `302`: Redirect to signed download URL
- `401`: Not authenticated
- `403`: Not authorized to access this report
- `404`: Report not found or no PDF uploaded

---

## Error Response Format

All Server Actions return a consistent error format:

```typescript
type ActionResult = {
  success: true
  data?: any
} | {
  success: false
  error: string
  fieldErrors?: Record<string, string[]>  // For form validation errors
}
```

## Rate Limits

| Endpoint / Action | Limit | Window |
|-------------------|-------|--------|
| `signIn`, `signUp` | 5 | 1 minute |
| `resetPassword` | 3 | 15 minutes |
| `createOrder` | 10 | 1 hour |
| `createCheckoutSession` | 3 | 1 hour |
| `/api/webhooks/stripe` | 100 | 1 minute |

## Authentication Requirements

| Action/Route | Auth Required | Role Required |
|-------------|---------------|---------------|
| `signUp`, `signIn`, `resetPassword` | No | — |
| `createOrder`, `getOrders`, `getCreditBalance` | Yes | `customer` |
| `createOrUpdateReport`, `submitForReview` | Yes | `researcher` |
| `assignResearcher`, `approveReport`, `adjustCredits` | Yes | `admin` |
| `updateProfile`, `signOut` | Yes | Any |
| `/api/webhooks/stripe` | No (signature-verified) | — |
| `/api/reports/[id]/download` | Yes | Owner, researcher, or admin |
