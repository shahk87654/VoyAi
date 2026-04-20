# Paywall & Permissions System Setup

Complete guide to implementing feature tiers and permissions in VoyAI.

## Overview

VoyAI has three subscription tiers:

| Plan | Price | Key Features |
|------|-------|--------------|
| **Free** | $0/forever | 3 AI plans/month, 1 saved trip |
| **Pro** | $19/month | Unlimited plans, PDF export, sharing, collaboration |
| **Teams** | $49/month | Pro features + 5 seats, shared library, API access, analytics |

## Implementation Guide

### 1. Check User Permissions in Components

#### Simple Feature Check
```tsx
import { usePermissions } from '@/hooks/usePermissions'

export function ItineraryView() {
  const { hasFeature } = usePermissions()
  
  return (
    <div>
      {hasFeature('pdfExport') && (
        <button>Export PDF</button>
      )}
    </div>
  )
}
```

#### With Upgrade Prompt
```tsx
import { FeatureGate } from '@/components/paywall/FeatureGate'

export function TripBuilder() {
  return (
    <FeatureGate feature="collaboration">
      <CollaborationPanel />
    </FeatureGate>
  )
}
```

#### Template:
```tsx
<FeatureGate 
  feature="featureName"
  fallback={<div>Upgrade to Pro for this feature</div>}
>
  <YourComponent />
</FeatureGate>
```

### 2. Gate API Actions

When user attempts an action that requires a plan limit check:

```tsx
// In trip planner after generating itinerary
const response = await fetch('/api/subscription/usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'trip_generation' }),
})

if (!response.ok) {
  // Handle 429 (limit reached) or other errors
  const { error, limit, used } = await response.json()
  showUpgradeModal(error, limit, used)
  return
}

// Proceed with creating trip
```

### 3. Display Usage

Show users their remaining quota:

```tsx
import { UsageIndicator } from '@/components/paywall/FeatureGate'

export function Dashboard() {
  return (
    <div>
      <UsageIndicator className="mb-6" />
      {/* Rest of dashboard */}
    </div>
  )
}
```

Shows:
- AI Plans: 2/3 used (resets monthly)
- Saved Trips: 1/1 used

### 4. Add Upgrade Buttons

Place upgrade CTAs strategically:

```tsx
import { UpgradeButton } from '@/components/paywall/FeatureGate'

// In settings page
<UpgradeButton plan="PRO" variant="default" />

// In feature context
<UpgradeButton 
  plan="TEAMS" 
  variant="outline"
  className="w-full"
/>
```

### 5. Use Pro Features

#### PDF Export
```tsx
import { ExportPDFButton } from '@/components/paywall/ProFeatures'

<ExportPDFButton 
  tripId={tripId}
  tripTitle={trip.title}
  onExport={() => console.log('Exported!')}
/>
```

#### Share Trip
```tsx
import { ShareTrip } from '@/components/paywall/ProFeatures'

<ShareTrip tripId={tripId} tripTitle={trip.title} />
```

#### Collaboration
```tsx
import { TripCollaboration } from '@/components/paywall/ProFeatures'

<TripCollaboration 
  tripId={tripId}
  currentCollaborators={trip.collaborators}
/>
```

#### Low Quota Warning
```tsx
import { FreeTrialWarning } from '@/components/paywall/ProFeatures'

<FreeTrialWarning />
```

## API Endpoints

### GET `/api/subscription/status`
Get user's current subscription status

Response:
```json
{
  "plan": "FREE|PRO|TEAMS",
  "email": "user@example.com",
  "aiPlansThisMonth": 2,
  "savedTripsCount": 1,
  "lastResetAt": "2024-01-15T00:00:00Z"
}
```

### POST `/api/subscription/usage`
Track usage when user performs action

Request:
```json
{
  "type": "trip_generation|trip_save"
}
```

Response (Success):
```json
{
  "success": true,
  "type": "trip_generation",
  "newCount": 3,
  "limit": 3
}
```

Response (Limit Exceeded - 429):
```json
{
  "error": "Monthly AI plan limit reached",
  "plan": "FREE",
  "limit": 3,
  "used": 3,
  "resetDate": "2024-02-15T00:00:00Z"
}
```

### POST `/api/subscription/checkout`
Initiate Stripe checkout for upgrade

Request:
```json
{
  "plan": "PRO|TEAMS",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

Response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

## Integration Steps

### Step 1: Update AI Trip Planner
In `/src/app/api/ai/plan/route.ts`:

```tsx
// After generating itinerary
const usage = await fetch('/api/subscription/usage', {
  method: 'POST',
  body: JSON.stringify({ type: 'trip_generation' }),
})

if (!usage.ok) {
  return Response.json(
    { error: 'Plan limit reached' },
    { status: 429 }
  )
}

// Continue with trip creation
```

### Step 2: Update Trip Saver
In `/src/app/api/trips/route.ts`:

```tsx
// Before saving trip
const usage = await fetch('/api/subscription/usage', {
  method: 'POST',
  body: JSON.stringify({ type: 'trip_save' }),
})

if (!usage.ok) {
  return Response.json(
    { error: 'Trip save limit reached' },
    { status: 429 }
  )
}
```

### Step 3: Update Settings Page
In `src/app/(dashboard)/settings/page.tsx`:

```tsx
import { PricingCards, PlanComparison } from '@/components/paywall/PricingCards'
import { UsageIndicator } from '@/components/paywall/FeatureGate'

export default function SettingsPage() {
  return (
    <div>
      <UsageIndicator />
      <PricingCards />
      <PlanComparison />
    </div>
  )
}
```

### Step 4: Update Trip Builder
In `src/app/(dashboard)/builder/page.tsx`:

```tsx
import { FreeTrialWarning } from '@/components/paywall/ProFeatures'
import { ExportPDFButton, ShareTrip } from '@/components/paywall/ProFeatures'

export default function BuilderPage() {
  return (
    <div>
      <FreeTrialWarning />
      
      {/* Trip builder UI */}
      
      <ExportPDFButton tripId={tripId} tripTitle={trip.title} />
      <ShareTrip tripId={tripId} tripTitle={trip.title} />
    </div>
  )
}
```

## Environment Variables

Add to `.env.local`:

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1234...  # From Stripe dashboard
NEXT_PUBLIC_STRIPE_TEAMS_PRICE_ID=price_5678...
STRIPE_SECRET_KEY=sk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Features Gated by Plan

### Free Tier
- 3 AI trip plans per month
- Save 1 trip
- Flight & hotel search
- Basic itinerary view only (read-only)
- Community support (email to support@)

### Pro Tier
- ✓ Unlimited AI trip plans
- ✓ Unlimited saved trips
- ✓ PDF export (uses Mapbox static images)
- ✓ Trip sharing (public link with token)
- ✓ Itinerary collaboration (invite others)
- ✓ Priority AI processing
- ✓ Email support

### Teams Tier
- ✓ Everything in Pro
- ✓ 5 team seats
- ✓ Shared trip library
- ✓ API access for integrations
- ✓ Priority support (phone + email)
- ✓ Team analytics & usage reports

## Monthly Reset

User's `tripsThisMonth` counter resets on the same day each month:
- If reset date has passed, counter resets on next API call
- Handled automatically in `/api/subscription/status`

## Testing Locally

### Simulate Different Plans
```tsx
// In dev console
localStorage.setItem('debugPlan', 'PRO')

// Reset
localStorage.removeItem('debugPlan')
```

### Test Stripe Checkout
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

## Monitoring

Track these metrics:
- Total users by plan
- Conversion rate (Free → Pro)
- Monthly active users by plan
- Feature usage (PDF exports, shares, collaborations)
- Churn rate

## Troubleshooting

**"Permission denied" in console?**
- Check user is logged in with Supabase
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set

**Stripe checkout not working?**
- Verify `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` is correct
- Check Stripe API keys are valid
- Ensure webhook is configured

**Usage limits not enforcing?**
- Make sure API calls to `/api/subscription/usage` are made BEFORE creating trips
- Check query order - should validate BEFORE saving to DB

## Next Steps

1. ✅ Permission system built
2. ✅ API routes for subscription management
3. ⏳ Integrate into AI planner (gate trip generation)
4. ⏳ Integrate into trip saver (gate trip save)
5. ⏳ Add PDF export route (`/api/export/pdf`)
6. ⏳ Add trip sharing routes (`/api/trips/share`)
7. ⏳ Add collaboration routes (`/api/trips/collaborate`)
8. ⏳ Update settings page with pricing cards
9. ⏳ Connect Stripe webhooks for subscription updates

---

**Files Created:**
- `src/types/subscription.ts` - Plan definitions
- `src/lib/permissions.ts` - Permission utilities
- `src/hooks/usePermissions.ts` - React hook
- `src/app/api/subscription/status/route.ts` - Get subscription
- `src/app/api/subscription/usage/route.ts` - Track usage
- `src/app/api/subscription/checkout/route.ts` - Stripe checkout
- `src/components/paywall/FeatureGate.tsx` - Gate components
- `src/components/paywall/PricingCards.tsx` - Pricing UI
- `src/components/paywall/ProFeatures.tsx` - Pro feature components
