# Internationalization (i18n) Guide

## Overview

TitleSearch Pro supports two languages:
- **English (en)** — Primary language
- **Portuguese (pt)** — For Brazilian investors

We use [next-intl](https://next-intl-docs.vercel.app/) for internationalization, which provides:
- URL-based locale routing (`/en/dashboard`, `/pt/dashboard`)
- Server Component support (translations in RSC without client JS)
- ICU message format (plurals, interpolation, dates, numbers)
- Type-safe translation keys

## URL Structure

```
titlesearchpro.com/en/           → English landing page
titlesearchpro.com/pt/           → Portuguese landing page
titlesearchpro.com/en/dashboard  → English dashboard
titlesearchpro.com/pt/dashboard  → Portuguese dashboard
titlesearchpro.com/en/pricing    → English pricing
titlesearchpro.com/pt/pricing    → Portuguese pricing
```

The locale prefix is required on all routes. The default locale (`en`) can optionally be configured as unprefixed.

## Configuration

### Locale Routing (`src/i18n/routing.ts`)

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pt'],
  defaultLocale: 'en',
});
```

### Request Config (`src/i18n/request.ts`)

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

### Navigation Helpers (`src/i18n/navigation.ts`)

```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

Always use these navigation helpers instead of Next.js's built-in `Link`, `redirect`, `usePathname`, and `useRouter` to ensure locale-aware routing.

### Middleware Integration (`middleware.ts`)

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

// Chain with Supabase middleware
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Refresh Supabase session
  // 2. Apply next-intl locale detection
  // 3. Auth guards
}
```

## Translation Files

### Location

```
messages/
  en.json    → English translations
  pt.json    → Portuguese translations
```

### Structure

Translation files are organized by page/feature namespace:

```json
{
  "common": {
    "appName": "TitleSearch Pro",
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "search": "Search",
    "download": "Download",
    "viewDetails": "View Details"
  },
  "nav": {
    "home": "Home",
    "howItWorks": "How It Works",
    "pricing": "Pricing",
    "about": "About",
    "blog": "Blog",
    "login": "Log In",
    "signup": "Get Started",
    "dashboard": "Dashboard",
    "orders": "Orders",
    "credits": "Credits",
    "profile": "Profile",
    "logout": "Log Out"
  },
  "landing": {
    "hero": {
      "title": "Know What You're Buying Before the Auction",
      "subtitle": "Comprehensive title search reports for tax deed and foreclosure properties. All liens, judgments, and encumbrances — in one report.",
      "cta": "Start Your First Search",
      "trustBadge1": "{count} Reports Delivered",
      "trustBadge2": "24-48 Hour Turnaround"
    },
    "problem": {
      "title": "Buying Auction Properties Without Research Is Like Driving Blindfolded",
      "description": "Hidden liens can turn a great deal into a financial disaster."
    },
    "howItWorks": {
      "title": "How It Works",
      "step1Title": "Submit Property Details",
      "step1Description": "Enter the property address, county, and parcel ID.",
      "step2Title": "We Research Everything",
      "step2Description": "Our team searches all county records, tax databases, and court filings.",
      "step3Title": "Receive Your Report",
      "step3Description": "Get a comprehensive title report delivered in 24-48 hours."
    },
    "features": {
      "title": "What We Search",
      "mortgages": "Existing Mortgages",
      "irsLiens": "IRS Liens",
      "hoaLiens": "HOA Liens",
      "taxDebt": "Property Tax Debt",
      "mechanicsLiens": "Mechanic's Liens",
      "codeViolations": "Code Violations",
      "judgments": "Judgments Against Owner",
      "lisPendens": "Lis Pendens"
    }
  },
  "pricing": {
    "title": "Simple, Credit-Based Pricing",
    "subtitle": "Buy credits. Use them anytime. No subscriptions.",
    "perCredit": "per credit",
    "savings": "Save {percent}%",
    "mostPopular": "Most Popular",
    "buyNow": "Buy Now",
    "credits": "{count, plural, one {# credit} other {# credits}}"
  },
  "auth": {
    "login": {
      "title": "Welcome Back",
      "email": "Email",
      "password": "Password",
      "submit": "Log In",
      "forgotPassword": "Forgot password?",
      "noAccount": "Don't have an account?",
      "signUpLink": "Sign up"
    },
    "signup": {
      "title": "Create Your Account",
      "fullName": "Full Name",
      "email": "Email",
      "password": "Password",
      "submit": "Create Account",
      "hasAccount": "Already have an account?",
      "loginLink": "Log in"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "creditBalance": "Credit Balance",
    "recentOrders": "Recent Orders",
    "noOrders": "No orders yet. Submit your first property search!",
    "newOrder": "New Order",
    "buyCredits": "Buy Credits"
  },
  "orders": {
    "title": "My Orders",
    "new": {
      "title": "New Property Search",
      "propertyAddress": "Property Address",
      "city": "City",
      "state": "State",
      "zip": "ZIP Code",
      "county": "County",
      "parcelId": "Parcel ID / Folio Number",
      "auctionType": "Auction Type",
      "auctionDate": "Auction Date",
      "notes": "Additional Notes",
      "submit": "Submit Order (1 Credit)",
      "insufficientCredits": "Insufficient credits. Please purchase more."
    },
    "status": {
      "submitted": "Submitted",
      "assigned": "Assigned",
      "in_progress": "In Progress",
      "in_review": "Under Review",
      "completed": "Completed",
      "revision_requested": "In Progress",
      "cancelled": "Cancelled"
    }
  },
  "report": {
    "title": "Title Search Report",
    "executiveSummary": "Executive Summary",
    "riskLevel": "Risk Level",
    "findings": "Detailed Findings",
    "researcherNotes": "Researcher Notes",
    "downloadPdf": "Download PDF",
    "risk": {
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "critical": "Critical"
    },
    "status": {
      "found": "Found",
      "clear": "Clear",
      "not_applicable": "N/A"
    }
  },
  "faq": {
    "title": "Frequently Asked Questions",
    "q1": "What is a title search?",
    "a1": "A title search is a thorough examination of public records to determine the legal ownership of a property and identify any liens, encumbrances, or other issues that could affect the title.",
    "q2": "How long does a report take?",
    "a2": "Standard reports are delivered within 24-48 hours. Rush reports (coming soon) will be delivered within 4-8 hours.",
    "q3": "What happens if liens are found?",
    "a3": "Our report details every lien found, including the type, amount, and recording information. We recommend consulting with a real estate attorney to understand how the liens affect your potential purchase.",
    "q4": "Is this the same as title insurance?",
    "a4": "No. Our reports are informational research tools. Title insurance is a separate product that protects you financially against title defects. We recommend both — our report for due diligence before the auction, and title insurance after purchase.",
    "q5": "Do credits expire?",
    "a5": "Credits are valid for 12 months from the date of purchase.",
    "q6": "Can I get a refund?",
    "a6": "Unused credits are refundable within 30 days of purchase. Credits that have been used for submitted orders are non-refundable."
  }
}
```

### Portuguese File (`messages/pt.json`)

Same structure with Portuguese translations:

```json
{
  "common": {
    "appName": "TitleSearch Pro",
    "loading": "Carregando...",
    "error": "Ocorreu um erro",
    "save": "Salvar",
    "cancel": "Cancelar",
    "back": "Voltar",
    "next": "Proximo",
    "submit": "Enviar",
    "search": "Buscar",
    "download": "Baixar",
    "viewDetails": "Ver Detalhes"
  },
  "nav": {
    "home": "Inicio",
    "howItWorks": "Como Funciona",
    "pricing": "Precos",
    "about": "Sobre",
    "blog": "Blog",
    "login": "Entrar",
    "signup": "Comecar",
    "dashboard": "Painel",
    "orders": "Pedidos",
    "credits": "Creditos",
    "profile": "Perfil",
    "logout": "Sair"
  },
  "landing": {
    "hero": {
      "title": "Saiba o Que Voce Esta Comprando Antes do Leilao",
      "subtitle": "Relatorios completos de pesquisa de titulo para imoveis de leilao fiscal e execucao hipotecaria. Todos os onus, julgamentos e gravames — em um unico relatorio.",
      "cta": "Comece Sua Primeira Pesquisa",
      "trustBadge1": "{count} Relatorios Entregues",
      "trustBadge2": "Entrega em 24-48 Horas"
    }
  }
}
```

(Full Portuguese translation file will be completed during development.)

## Using Translations

### In Server Components

```typescript
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <button>{t('cta')}</button>
    </section>
  );
}
```

### In Client Components

```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function CreditBalance() {
  const t = useTranslations('dashboard');

  return <h2>{t('creditBalance')}</h2>;
}
```

### With ICU Message Format (Plurals, Numbers)

```typescript
const t = useTranslations('pricing');

// Uses ICU plural syntax
t('credits', { count: 5 }); // "5 credits"
t('credits', { count: 1 }); // "1 credit"

// With percentage
t('savings', { percent: 19 }); // "Save 19%"
```

### With Dynamic Values

```typescript
const t = useTranslations('landing.hero');

t('trustBadge1', { count: 500 }); // "500 Reports Delivered"
```

## Locale Switcher Component

```typescript
'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div>
      <button
        onClick={() => switchLocale('en')}
        disabled={locale === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale('pt')}
        disabled={locale === 'pt'}
      >
        PT
      </button>
    </div>
  );
}
```

## Adding a New Translation Key

1. Add the key to `messages/en.json` under the appropriate namespace
2. Add the Portuguese translation to `messages/pt.json`
3. Use the key in your component with `useTranslations('namespace')`
4. TypeScript will warn if you use a key that doesn't exist (with proper setup)

## Adding a New Language (Future)

1. Create `messages/[locale].json` with all translated keys
2. Add the locale to `src/i18n/routing.ts`:
   ```typescript
   export const routing = defineRouting({
     locales: ['en', 'pt', 'es'],  // Add new locale
     defaultLocale: 'en',
   });
   ```
3. Update `middleware.ts` if needed
4. Add the new locale option to the locale switcher component
5. Translate all user-facing database content (credit package names, checklist templates)

## Translation Best Practices

1. **Always use namespaces**: Group translations by page/feature (`landing.hero.title`, not just `heroTitle`)
2. **Use ICU format for dynamic content**: Plurals, numbers, dates should use ICU message syntax
3. **Keep keys descriptive**: `auth.login.forgotPassword` not `auth.fp`
4. **Don't concatenate translations**: Use full sentences with interpolation, not `t('hello') + name`
5. **Test both languages**: Always verify the layout works with both English and Portuguese text (Portuguese tends to be longer)
6. **Database content**: User-facing database fields (package names, checklist items) have `_pt` suffix columns for Portuguese versions
