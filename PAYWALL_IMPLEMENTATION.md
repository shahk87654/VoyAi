# Paywall & Subscription System - Implementation Complete

Complete paywall and permissions system for VoyAI with 3 tier plans.

## ✅ What's Built

### 1. **Plan Definitions** (`src/types/subscription.ts`)
- Free, Pro, Teams tiers with feature matrix
- Pricing and description data
- TypeScript interfaces for type safety

### 2. **Permission Utilities** (`src/lib/permissions.ts`)
- `hasFeature()` - Check if feature available for plan
- `canGenerateAIPlan()` - Check monthly AI plan limit
- `canSaveMoreTrips()` - Check trip save limit
- `getFeatureLimitMessage()` - User-friendly quota messages
- `getUpgradeSuggestion()` - Smart upgrade recommendations
- `shouldResetMonthlyLimit()` - Auto-reset monthly counters

### 3. **React Hooks** (`src/hooks/usePermissions.ts`)
- `usePermissions()` - Access user's subscription state
- `useFeatureGate()` - Gate features behind paywall
- Includes query caching and error handling

### 4. **API Routes**

#### `/api/subscription/status` - Query user subscription
```
GET - Returns plan, email, usage counts, reset date
```

#### `/api/subscription/usage` - Track plan usage
```
POST /api/subscription/usage
Body: { type: 'trip_generation' | 'trip_save' }
Returns: Success or 429 (limit reached)
```

#### `/api/subscription/checkout` - Initiate Stripe checkout
```
POST /api/subscription/checkout
Body: { plan: 'PRO' | 'TEAMS' }
Returns: Stripe session URL
```

### 5. **UI Components**

#### `FeatureGate` - Gate features behind paywall
```tsx
<FeatureGate feature="pdfExport">
  <YourComponent />
</FeatureGate>
```

#### `UpgradeButton` - Redirect to checkout
```tsx
<UpgradeButton plan="PRO" />
```

#### `UsageIndicator` - Show user's quota usage
```tsx
<UsageIndicator />
```

#### `PricingCards` - Display all plans
```tsx
<PricingCards />
```

#### `PlanComparison` - Feature comparison table
```tsx
<PlanComparison />
```

### 6. **Pro Features**

#### `ExportPDFButton` - PDF export (gate: pdfExport)
```tsx
<ExportPDFButton tripId={id} tripTitle={title} />
```

#### `ShareTrip` - Public sharing (gate: sharing)
```tsx
<ShareTrip tripId={id} tripTitle={title} />
```

#### `TripCollaboration` - Team editing (gate: collaboration)
```tsx
<TripCollaboration tripId={id} currentCollaborators={[...]} />
```

#### `FreeTrialWarning` - Low quota alert
```tsx
<FreeTrialWarning />
```

## 🎯 Plan Features

### Free ($0/forever)
- ✓ 3 AI trip plans/month
- ✓ Flight & hotel search
- ✓ Basic itinerary view
- ✓ Save 1 trip
- ✓ Community support
- ✗ PDF export, sharing, collaboration, API, analytics

### Pro ($19/month) 🔥
- ✓ Unlimited AI trip plans
- ✓ Unlimited saved trips
- ✓ PDF export & sharing
- ✓ Priority AI processing
- ✓ Itinerary collaboration
- ✓ Email support
- ✗ Team seats, API, analytics

### Teams ($49/month)
- ✓ Everything in Pro
- ✓ 5 team seats
- ✓ Shared trip library
- ✓ API access
- ✓ Priority support
- ✓ Team analytics

## 📋 Feature Matrix

| Feature | Free | Pro | Teams |
|---------|------|-----|-------|
| AI plans/month | 3 | ∞ | ∞ |
| Saved trips | 1 | ∞ | ∞ |
| PDF export | ✗ | ✓ | ✓ |
| Sharing | ✗ | ✓ | ✓ |
| Collaboration | ✗ | ✓ | ✓ |
| Priority processing | ✗ | ✓ | ✓ |
| Email support | ✗ | ✓ | ✓ |
| Team seats | 0 | 0 | 5 |
| Shared library | ✗ | ✗ | ✓ |
| API access | ✗ | ✗ | ✓ |
| Team analytics | ✗ | ✗ | ✓ |

## 🔧 Integration Checklist

Ready to integrate into app:

- [ ] **AI Trip Planner** - Add usage check before generating
  - File: `src/app/api/ai/plan/route.ts`
  - Check: Can user generate plan? (limit)
  
- [ ] **Trip Saver** - Add usage check before saving
  - File: `src/app/api/trips/route.ts`
  - Check: Can user save trip? (limit)

- [ ] **Trip Builder Page** - Add Pro features
  - File: `src/app/(dashboard)/builder/page.tsx`
  - Add: Export, Share, Collaboration buttons

- [ ] **Settings Page** - Add pricing & upgrade
  - File: `src/app/(dashboard)/settings/page.tsx`
  - Add: PricingCards, PlanComparison, UsageIndicator

- [ ] **Trip Planner Alerts** - Show quota warnings
  - File: `src/components/ai/PlannerChat.tsx`
  - Add: FreeTrialWarning component

- [ ] **PDF Export Route** - Implement export
  - Create: `src/app/api/export/pdf/route.ts`
  - Uses: Mapbox static images API

- [ ] **Share Route** - Public trip sharing
  - Create: `src/app/api/trips/share/route.ts`
  - Generate: Shareable token, public page

- [ ] **Collaborate Route** - Team editing
  - Create: `src/app/api/trips/collaborate/route.ts`
  - Add: User to trip collaborators

- [ ] **Stripe Webhooks** - Handle subscription events
  - File: `src/app/api/stripe/webhook/route.ts`
  - Events: checkout.session.completed, customer.subscription.updated

- [ ] **Configure Stripe** - Set up products & prices
  - Dashboard: https://dashboard.stripe.com/products
  - Create: PRO price ($19/month), TEAMS price ($49/month)
  - Set env: `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`, `NEXT_PUBLIC_STRIPE_TEAMS_PRICE_ID`

## 🚀 Quick Start

1. **Update `.env.local`:**
```bash
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_TEAMS_PRICE_ID=price_yyy
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Add to Trip Planner:**
```tsx
// In /api/ai/plan/route.ts
const usage = await fetch('/api/subscription/usage', {
  method: 'POST',
  body: JSON.stringify({ type: 'trip_generation' })
})
if (!usage.ok) return Response.json({error: 'Limit'}, {status: 429})
```

3. **Add to Settings:**
```tsx
import { PricingCards } from '@/components/paywall/PricingCards'

<PricingCards />
```

4. **Gate Features:**
```tsx
import { FeatureGate, ExportPDFButton } from '@/components/paywall/*'

<FeatureGate feature="pdfExport">
  <ExportPDFButton tripId={id} tripTitle={title} />
</FeatureGate>
```

## 📊 Data Flow

```
User Action (e.g., Generate Trip)
    ↓
Check: usePermissions().canGeneratePlan()
    ↓
Call: /api/subscription/usage
    ↓
    → If limit reached (429) → Show upgrade prompt
    → If limit OK → Proceed, increment counter
    ↓
User sees result
```

## 🔐 Security

- ✅ All routes require Supabase auth
- ✅ Stripe customer ID stored server-side
- ✅ Usage counts tracked per user in database
- ✅ Monthly resets automatic
- ✅ No client-side token handling

## 💰 Revenue Model

**Free → Pro Conversion:**
- Free users hit 3 plan/month limit in ~1 week
- Triggered by FreeTrialWarning component
- Direct upgrade button in constraint message

**Pro → Teams Expansion:**
- Pro users need team features
- Teams CTAs in collaboration features
- Shows seats/library benefits

**Predictable Revenue:**
- Monthly subscriptions (Stripe manages)
- Track MRR (Monthly Recurring Revenue)
- Upgrade/downgrade handled by Stripe

## 📈 Monitoring

Track with Stripe dashboard:
- MRR (Monthly Recurring Revenue)
- Active subscriptions by plan
- Churn rate
- Customer acquisition cost

Track in app:
- Free → Pro conversion rate
- Feature usage (PDF exports, shares, collaborations)
- Average team size
- API usage for Teams tier

## 📝 Files Created

```
src/
├── types/subscription.ts                 [Plan definitions]
├── lib/permissions.ts                    [Permission utilities]
├── hooks/usePermissions.ts               [React hook]
├── app/api/subscription/
│   ├── status/route.ts                   [Get subscription]
│   ├── usage/route.ts                    [Track usage]
│   └── checkout/route.ts                 [Stripe checkout]
└── components/paywall/
    ├── FeatureGate.tsx                   [Gate components]
    ├── PricingCards.tsx                  [Pricing UI]
    └── ProFeatures.tsx                   [Pro features]

PAYWALL_SETUP.md                          [Setup guide]
```

## ⚠️ Next: Pending Implementation

1. **Stripe Webhook Handler** - Process subscription events
2. **PDF Export Route** - Generate itinerary PDFs
3. **Trip Share Route** - Public sharing with tokens
4. **Collaboration Routes** - Team editing
5. **Integration with existing endpoints** - Usage checks
6. **Configure Stripe Products** - CLI or dashboard setup

## Quick Commands

```bash
# Check subscription status
curl http://localhost:3000/api/subscription/status \
  -H "Cookie: sb-access-token=..."

# Track usage
curl http://localhost:3000/api/subscription/usage \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"trip_generation"}'

# Start checkout
curl http://localhost:3000/api/subscription/checkout \
  -X POST \
  -d '{"plan":"PRO"}'
```

---

**Status**: ✅ Infrastructure complete, ready for feature integration

**Owner**: VoyAI team
**Created**: April 16, 2026
**Last Updated**: April 16, 2026
