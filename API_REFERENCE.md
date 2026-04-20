# VoyAI Paywall API Reference

Quick reference guide for all paywall-related API endpoints and integration points.

## 📋 Table of Contents
1. [Subscription Management](#subscription-management)
2. [Feature Integration](#feature-integration)
3. [Collaboration](#collaboration)
4. [Stripe Webhooks](#stripe-webhooks)
5. [React Hooks](#react-hooks)
6. [Permission Utilities](#permission-utilities)

---

## Subscription Management

### GET `/api/subscription/status`
Get current user's subscription and usage data.

**Request:**
```bash
GET /api/subscription/status
Authorization: Bearer {supabase_token}
```

**Response:**
```json
{
  "plan": "PRO",
  "email": "user@example.com",
  "aiPlansThisMonth": 5,
  "savedTripsCount": 3,
  "lastResetAt": "2026-04-01T00:00:00.000Z"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized (no auth token)

---

### POST `/api/subscription/usage`
Track feature usage and enforce limits.

**Request:**
```bash
POST /api/subscription/usage
Authorization: Bearer {supabase_token}
Content-Type: application/json

{
  "action": "trip_generation",  // or "trip_save"
  "metadata": {
    "destination": "Bali",
    "travelers": 2
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "remaining": 2,
  "limit": 3
}
```

**Response (Limit Exceeded):**
```json
{
  "success": false,
  "error": "Monthly limit exceeded",
  "remaining": 0,
  "limit": 3
}
```

**Status Codes:**
- 200: Usage tracked
- 429: Limit exceeded
- 401: Unauthorized

---

### POST `/api/subscription/checkout`
Create a Stripe checkout session.

**Request:**
```bash
POST /api/subscription/checkout
Authorization: Bearer {supabase_token}
Content-Type: application/json

{
  "plan": "PRO"  // or "TEAMS"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_abc123...",
  "url": "https://checkout.stripe.com/pay/cs_test_abc123..."
}
```

**Status Codes:**
- 200: Session created
- 400: Invalid plan
- 401: Unauthorized
- 500: Stripe error

---

## Feature Integration

### POST `/api/ai/plan`
Generate AI trip with subscription limits enforced.

**Request:**
```bash
POST /api/ai/plan
Authorization: Bearer {supabase_token}
Content-Type: application/json

{
  "destination": "Paris",
  "origin": "San Francisco",
  "startDate": "2026-06-01",
  "endDate": "2026-06-08",
  "travelers": 2,
  "budget": "moderate",
  "style": ["culture", "food"],
  "preferences": "museums and cafes"
}
```

**Response:**
```json
{
  "itinerary": {
    "days": [...]
  }
}
```

**Status Codes:**
- 200: Plan generated
- 403: Plan limit exceeded (Free users: 3/month)
- 429: Rate limited
- 401: Unauthorized

**Error Response (Limit):**
```json
{
  "error": "You've reached your monthly AI planning limit for your FREE plan. Upgrade to Pro for unlimited plans."
}
```

---

### POST `/api/trips`
Save trip with subscription limits enforced.

**Request:**
```bash
POST /api/trips
Authorization: Bearer {supabase_token}
Content-Type: application/json

{
  "title": "Paris Getaway",
  "destination": "Paris",
  "origin": "San Francisco",
  "startDate": "2026-06-01",
  "endDate": "2026-06-08",
  "travelers": 2,
  "budget": "moderate",
  "style": ["culture", "food"],
  "aiItinerary": {...}
}
```

**Response:**
```json
{
  "trip": {
    "id": "trip_abc123",
    "title": "Paris Getaway",
    "status": "DRAFT"
  }
}
```

**Status Codes:**
- 201: Trip created
- 403: Trip save limit exceeded (Free users: 5/month)
- 401: Unauthorized

---

### GET `/api/export/pdf?tripId={tripId}`
Export trip as PDF (Pro/Teams only).

**Request:**
```bash
GET /api/export/pdf?tripId=trip_abc123
Authorization: Bearer {supabase_token}
```

**Response:**
```html
<!DOCTYPE html>
<!-- HTML document with styled itinerary -->
```

**Status Codes:**
- 200: HTML returned (can be printed as PDF)
- 403: Pro feature not available
- 404: Trip not found
- 401: Unauthorized

**Error Response:**
```json
{
  "error": "PDF export is a Pro feature. Upgrade to export itineraries."
}
```

---

## Trip Sharing

### POST `/api/trips/share`
Create shareable link for trip (Pro/Teams only).

**Request:**
```bash
POST /api/trips/share
Authorization: Bearer {supabase_token}
Content-Type: application/json

{
  "tripId": "trip_abc123",
  "expiresIn": 7  // days (optional, default 7)
}
```

**Response:**
```json
{
  "shareUrl": "http://localhost:3000/shared/trips/abc123def456...",
  "shareToken": "abc123def456...",
  "expiresAt": "2026-04-27T12:34:56.000Z"
}
```

**Status Codes:**
- 200: Share link created
- 403: Pro feature not available
- 404: Trip not found
- 401: Unauthorized

---

### GET `/api/trips/share?token={shareToken}`
Get shared trip by token (public endpoint).

**Request:**
```bash
GET /api/trips/share?token=abc123def456...
```

**Response:**
```json
{
  "trip": {
    "id": "trip_abc123",
    "title": "Paris Getaway",
    "days": [...],
    "flights": [...],
    "hotels": [...]
  },
  "sharedBy": "user@example.com",
  "expiresAt": "2026-04-27T12:34:56.000Z"
}
```

**Status Codes:**
- 200: Shared trip found
- 404: Token not found or expired
- 410: Share link expired

---

### DELETE `/api/trips/share`
Revoke share link.

**Request:**
```bash
DELETE /api/trips/share
Authorization: Bearer {supabase_token}
Content-Type: application/json

{
  "shareToken": "abc123def456..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Share link revoked"
}
```

**Status Codes:**
- 200: Share revoked
- 404: Share link not found
- 403: Not authorized
- 401: Unauthorized

---

## Collaboration

### POST `/api/trips/[id]/collaborators`
Add collaborator to trip (Pro/Teams only).

**Request:**
```bash
POST /api/trips/abc123/collaborators
Authorization: Bearer {supabase_token}
Content-Type: application/json

{
  "userId": "user_xyz789",
  "role": "editor"  // or "viewer"
}
```

**Response:**
```json
{
  "id": "collab_abc123",
  "tripId": "trip_abc123",
  "userId": "user_xyz789",
  "role": "editor",
  "addedAt": "2026-04-20T12:34:56.000Z"
}
```

**Status Codes:**
- 201: Collaborator added
- 403: Pro feature not available
- 404: Trip not found
- 401: Unauthorized

---

### GET `/api/trips/[id]/collaborators`
List trip collaborators.

**Request:**
```bash
GET /api/trips/abc123/collaborators
Authorization: Bearer {supabase_token}
```

**Response:**
```json
{
  "collaborators": [
    {
      "id": "collab_abc123",
      "userId": "user_xyz789",
      "email": "collaborator@example.com",
      "role": "editor",
      "addedAt": "2026-04-20T12:34:56.000Z"
    }
  ]
}
```

**Status Codes:**
- 200: List returned
- 404: Trip not found
- 401: Unauthorized

---

### DELETE `/api/trips/[id]/collaborators?userId={userId}`
Remove collaborator.

**Request:**
```bash
DELETE /api/trips/abc123/collaborators?userId=user_xyz789
Authorization: Bearer {supabase_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Collaborator removed"
}
```

**Status Codes:**
- 200: Removed
- 404: Collaborator not found
- 403: Not authorized
- 401: Unauthorized

---

## Stripe Webhooks

### POST `/api/stripe/webhook`
Receives events from Stripe (called automatically by Stripe).

**Events Handled:**
- `checkout.session.completed` - User upgraded
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled

**What Happens:**
- Updates user `plan` field in database
- Sets `stripeCustomerId` and `stripeSubId`
- Resets monthly limits on downgrade

---

## React Hooks

### `usePermissions()`
Query user permissions and subscription status.

**Usage:**
```typescript
import { usePermissions } from '@/hooks/usePermissions'

export function MyComponent() {
  const {
    plan,                    // "FREE" | "PRO" | "TEAMS"
    features,               // Feature permissions object
    canGeneratePlan,        // () => boolean
    canSaveTrip,            // () => boolean
    hasFeature,             // (feature: string) => boolean
    getPlanLimitMessage,    // (feature: string) => string
    isLoading,
    error
  } = usePermissions()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <p>Your plan: {plan}</p>
      {!canGeneratePlan() && (
        <p>You've reached your monthly limit</p>
      )}
    </div>
  )
}
```

---

### `useFeatureGate(feature: string)`
Check if specific feature is available.

**Usage:**
```typescript
import { useFeatureGate } from '@/hooks/usePermissions'

export function PdfExportButton() {
  const { hasAccess, plan, message } = useFeatureGate('pdfExport')

  if (!hasAccess) {
    return (
      <button disabled title={message}>
        PDF Export (Pro only)
      </button>
    )
  }

  return (
    <button onClick={handleExport}>
      Export as PDF ✓
    </button>
  )
}
```

---

## Permission Utilities

### `hasFeature(plan: Plan, feature: string): boolean`
Check if plan has feature.

**Usage:**
```typescript
import { hasFeature } from '@/lib/permissions'

const hasPdfExport = hasFeature('PRO', 'pdfExport')  // true
const hasCollabs = hasFeature('FREE', 'collaboration')  // false
```

---

### `canGenerateAIPlan(plan: Plan, plansGeneratedThisMonth: number): boolean`
Check if user can generate another AI plan.

**Usage:**
```typescript
import { canGenerateAIPlan } from '@/lib/permissions'

const user = await prisma.user.findUnique(...)
const canGenerate = canGenerateAIPlan(user.plan, user.tripsThisMonth)

if (!canGenerate) {
  return res.status(403).json({ error: 'Plan limit reached' })
}
```

---

### `canSaveMoreTrips(plan: Plan, tripsSaved: number): boolean`
Check if user can save another trip.

**Usage:**
```typescript
import { canSaveMoreTrips } from '@/lib/permissions'

const user = await prisma.user.findUnique(...)
const canSave = canSaveMoreTrips(user.plan, user.tripsThisMonth)

if (!canSave) {
  return res.status(403).json({ error: 'Trip save limit reached' })
}
```

---

## Error Handling

All endpoints follow this error format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

---

## Rate Limiting

- **AI Planning**: 10 requests/hour (Redis-based)
- **Stripe Webhooks**: Not limited (trusted Stripe source)
- **Public Endpoints**: No rate limit

---

## Authentication

All protected endpoints require:
```bash
Authorization: Bearer {supabase_access_token}
```

Obtain token:
```typescript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

---

**Last Updated**: April 20, 2026
**Status**: Production Ready
**Questions**: See PAYWALL_COMPLETE.md or STRIPE_SETUP.md
