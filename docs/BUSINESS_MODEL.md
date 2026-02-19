# Business Model

## Revenue Model

TitleSearch Pro operates on a **prepaid credit system**. Customers purchase credits in advance, and each property title search consumes 1 credit. This model provides:

- **Predictable revenue**: Cash collected upfront before service delivery
- **Low friction**: No per-transaction payment processing after initial purchase
- **Volume incentives**: Bulk packages encourage larger purchases
- **Simplicity**: Clear pricing, no hidden fees, no subscriptions to cancel

## Credit Packages

| Package | Credits | Price (USD) | Per Credit | Savings | Target Customer |
|---------|---------|-------------|------------|---------|-----------------|
| **Starter** | 1 | $49 | $49.00 | — | First-time buyers, one-off research |
| **Explorer** | 5 | $199 | $39.80 | 19% | Occasional investors, 1-2 auctions/month |
| **Professional** | 15 | $525 | $35.00 | 29% | Active investors, 3-5 auctions/month |
| **Enterprise** | 50 | $1,500 | $30.00 | 39% | Wholesalers, investment firms, power users |

### Pricing Rationale

- **Starter at $49**: Low enough to be an impulse purchase for someone facing a $10K+ auction. Covers researcher cost with margin.
- **Volume discounts**: Up to 39% off incentivizes bulk purchases and customer retention.
- **No subscription**: Auction investors buy irregularly. Credits suit their sporadic purchasing patterns better than monthly subscriptions.

## Unit Economics

### Cost Per Report (Estimated)

| Cost Component | Estimated Cost | Notes |
|----------------|---------------|-------|
| Researcher time | $15-20 | 45-90 min per property at $15-20/hr |
| Platform/infra | $1-2 | Supabase, Vercel, email costs amortized |
| Payment processing | $1.50-2 | Stripe: 2.9% + $0.30 per transaction |
| **Total cost per report** | **$18-24** | |

### Margins

| Package | Revenue/Credit | Cost/Credit | Gross Margin |
|---------|---------------|-------------|-------------|
| Starter | $49.00 | ~$22 | ~55% |
| Explorer | $39.80 | ~$22 | ~45% |
| Professional | $35.00 | ~$22 | ~37% |
| Enterprise | $30.00 | ~$22 | ~27% |

**Blended gross margin target**: 40-50% (weighted toward Starter and Explorer packages)

## Credit Policies

### Expiration
- Credits are valid for **12 months** from the date of purchase
- 30-day email reminder before expiration
- Expired credits cannot be reinstated

### Refunds
- **Unused credits**: Full refund available within 30 days of purchase
- **Partially used packages**: Remaining unused credits refundable within 30 days at the per-credit rate of the package
- **Used credits**: Non-refundable once a research order is submitted
- **Cancelled orders**: If an order is cancelled before researcher assignment, the credit is automatically refunded to the customer's balance

### Credit Ledger
Every credit transaction is recorded in an immutable ledger for full audit trail:

| Transaction Type | Amount | Trigger |
|-----------------|--------|---------|
| `purchase` | +N credits | Successful Stripe payment |
| `usage` | -1 credit | Order submitted |
| `refund` | +1 credit | Order cancelled before assignment |
| `adjustment` | +/- N | Admin manual adjustment (with reason) |
| `referral` | +1 credit | Referee completes first purchase |

## Payment Processing

- **Provider**: Stripe
- **Method**: Stripe Checkout Sessions (hosted payment page)
- **Currencies**: USD only (initial launch)
- **Payment methods**: Credit/debit cards, Apple Pay, Google Pay (via Stripe)
- **Webhook**: `checkout.session.completed` triggers credit fulfillment
- **Idempotency**: Stripe event IDs stored to prevent duplicate credit grants

## Upsell Opportunities

### Rush Delivery (Phase 2)
- **Cost**: 2 credits instead of 1
- **Turnaround**: 4-8 hours instead of 24-48 hours
- **Target**: Investors with auction deadlines

### Extended Search (Phase 2)
- **Cost**: 2 credits instead of 1
- **Includes**: Municipal lien search (water, sewer, utilities), bankruptcy search (PACER), easement analysis
- **Target**: Cautious buyers wanting maximum coverage

### Ongoing Monitoring (Phase 3)
- **Cost**: Subscription model (separate from credits)
- **Service**: Monthly monitoring of owned properties for new liens/encumbrances
- **Target**: Investors with portfolios of rental properties

### Bulk API Access (Phase 3)
- **Cost**: Custom pricing
- **Service**: API access for title companies and investment firms to submit batch orders
- **Target**: B2B customers, title companies

## Competitive Landscape

| Competitor Type | Typical Price | Turnaround | Our Advantage |
|----------------|--------------|------------|---------------|
| Title company (full report) | $150-350 | 3-7 days | Faster, cheaper, focused on auction buyers |
| Online title search services | $50-100 | 1-3 days | Bilingual, auction-specific, standardized format |
| DIY (county websites) | Free (time cost) | 2-4 hours/property | No expertise needed, comprehensive, reliable |
| Attorney title opinion | $200-500 | 5-10 days | Not a substitute, but sufficient for initial due diligence |

**Key differentiator**: We are the only bilingual (EN/PT) title search service specifically designed for auction property due diligence, with standardized reports and fast turnaround.

## Revenue Projections (Conservative)

### Month 1-3 (Launch)
- 50-100 credits sold/month
- Revenue: $2,500-$5,000/month
- Focus: Florida market, organic + paid ads

### Month 4-6 (Growth)
- 200-500 credits sold/month
- Revenue: $8,000-$20,000/month
- Focus: Expand to TX, CA, GA; referral program active

### Month 7-12 (Scale)
- 500-1,500 credits sold/month
- Revenue: $20,000-$60,000/month
- Focus: Nationwide coverage, rush delivery, B2B API

### Key Metrics to Track
- **MRR** (Monthly Recurring Revenue): Credit sales per month
- **CAC** (Customer Acquisition Cost): Ad spend / new customers
- **LTV** (Lifetime Value): Average credits purchased per customer lifetime
- **LTV:CAC ratio**: Target 3:1 or higher
- **Churn**: % of customers who don't repurchase within 6 months
- **Turnaround time**: Average hours from order to delivery
- **Customer satisfaction**: NPS score, report quality ratings
