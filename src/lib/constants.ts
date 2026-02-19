export const CREDIT_PACKAGES = [
  {
    id: "starter",
    credits: 1,
    priceCents: 4900,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  },
  {
    id: "explorer",
    credits: 5,
    priceCents: 19900,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_EXPLORER,
  },
  {
    id: "professional",
    credits: 15,
    priceCents: 52500,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL,
  },
  {
    id: "enterprise",
    credits: 50,
    priceCents: 150000,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE,
  },
] as const;

export const ORDER_STATUSES = [
  "submitted",
  "assigned",
  "in_progress",
  "in_review",
  "completed",
  "revision_requested",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SEARCH_CATEGORIES = [
  "mortgages",
  "irs_liens",
  "hoa_liens",
  "property_tax",
  "mechanics_liens",
  "code_violations",
  "judgments",
  "lis_pendens",
] as const;

export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];
