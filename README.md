# TitleSearch Pro

Bilingual (EN/PT) real estate title search aggregation platform for auction buyers, investors, and wholesalers.

## The Problem

Buying real estate at auction is high-risk. Properties are sold "as-is," and hidden liens, tax debts, and encumbrances can turn a great deal into a financial disaster. Currently, buyers must manually search across **dozens** of county websites, tax collectors, court records, and federal databases — a process that takes hours per property and is easy to get wrong.

## The Solution

TitleSearch Pro consolidates property title research into a single platform. Customers submit a property address, and our research team delivers a comprehensive lien and title report covering all critical encumbrances — in 24-48 hours.

## What We Research

| Category | Description |
|----------|-------------|
| **Existing Mortgages** | Open mortgages, assignments, satisfaction status |
| **IRS Liens** | Federal and state tax liens against the property or owner |
| **HOA Liens** | Homeowners association unpaid dues and assessments |
| **Property Tax Debt** | Delinquent property taxes, tax certificates, special assessments |
| **Mechanic's Liens** | Contractor liens for unpaid construction/renovation work |
| **Code Violations** | Municipal code enforcement actions, open permits, unsafe structure orders |
| **Judgments Against Owner** | County and federal court judgments attached to the property |
| **Lis Pendens** | Pending lawsuits that may affect title or ownership |

## Business Model

**Credit-based**: Customers purchase credits, and each property research costs 1 credit.

| Package | Credits | Price | Per Credit | Savings |
|---------|---------|-------|------------|---------|
| Starter | 1 | $49 | $49.00 | — |
| Explorer | 5 | $199 | $39.80 | 19% |
| Professional | 15 | $525 | $35.00 | 29% |
| Enterprise | 50 | $1,500 | $30.00 | 39% |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database & Auth | Supabase (PostgreSQL, Auth, Storage, Real-time) |
| Payments | Stripe (Checkout Sessions, Webhooks) |
| Styling | Tailwind CSS + shadcn/ui |
| Internationalization | next-intl (English + Portuguese) |
| Email | Resend + React Email |
| Deployment | Vercel |
| Monitoring | Sentry |

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm or pnpm
- Supabase account
- Stripe account

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd title-project

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase, Stripe, and Resend credentials

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

See [`.env.local.example`](.env.local.example) for all required environment variables.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design, tech decisions, data flow |
| [Business Model](docs/BUSINESS_MODEL.md) | Credit system, pricing, revenue model |
| [Target Audience](docs/TARGET_AUDIENCE.md) | Buyer personas, market analysis |
| [Marketing Strategy](docs/MARKETING_STRATEGY.md) | Brand, content, SEO, referrals |
| [Advertising Strategy](docs/ADVERTISING_STRATEGY.md) | Paid channels, budget, KPIs |
| [Security & Compliance](docs/SECURITY_COMPLIANCE.md) | Payment security, auth, data protection |
| [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md) | Phased build plan, milestones |
| [Database Schema](docs/DATABASE_SCHEMA.md) | Tables, RLS policies, functions |
| [API Reference](docs/API_REFERENCE.md) | Server Actions, endpoints |
| [Research Workflow](docs/RESEARCH_WORKFLOW.md) | Order lifecycle, checklists |
| [i18n Guide](docs/I18N_GUIDE.md) | Translation setup, adding locales |

## Related

Inspired by [O Cacador de Titulos](https://lp.ocacadordetitulos.com/links) (The Title Hunter) — a Brazilian real estate auction education platform.

## License

Proprietary. All rights reserved.
