// Feature tier definitions and permissions
export type PlanType = 'FREE' | 'PRO' | 'TEAMS'

export interface FeaturePermissions {
  plan: PlanType
  aiPlansPerMonth: number
  maxSavedTrips: number
  pdfExport: boolean
  sharing: boolean
  collaboration: boolean
  priorityProcessing: boolean
  emailSupport: boolean
  teamSeats: number
  sharedLibrary: boolean
  apiAccess: boolean
  teamAnalytics: boolean
  communitySupport: boolean
}

export const PLAN_FEATURES: Record<PlanType, FeaturePermissions> = {
  FREE: {
    plan: 'FREE',
    aiPlansPerMonth: 3,
    maxSavedTrips: 1,
    pdfExport: false,
    sharing: false,
    collaboration: false,
    priorityProcessing: false,
    emailSupport: false,
    teamSeats: 0,
    sharedLibrary: false,
    apiAccess: false,
    teamAnalytics: false,
    communitySupport: true,
  },
  PRO: {
    plan: 'PRO',
    aiPlansPerMonth: -1, // unlimited
    maxSavedTrips: -1, // unlimited
    pdfExport: true,
    sharing: true,
    collaboration: true,
    priorityProcessing: true,
    emailSupport: true,
    teamSeats: 0,
    sharedLibrary: false,
    apiAccess: false,
    teamAnalytics: false,
    communitySupport: false,
  },
  TEAMS: {
    plan: 'TEAMS',
    aiPlansPerMonth: -1, // unlimited
    maxSavedTrips: -1, // unlimited
    pdfExport: true,
    sharing: true,
    collaboration: true,
    priorityProcessing: true,
    emailSupport: true,
    teamSeats: 5,
    sharedLibrary: true,
    apiAccess: true,
    teamAnalytics: true,
    communitySupport: false,
  },
}

export const PLAN_PRICING = {
  FREE: { price: 0, interval: 'forever', stripePriceId: null },
  PRO: { price: 19, interval: 'month', stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID },
  TEAMS: { price: 49, interval: 'month', stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TEAMS_PRICE_ID },
}

export const PLAN_DESCRIPTIONS = {
  FREE: [
    '3 AI trip plans/month',
    'Flight & hotel search',
    'Basic itinerary view',
    'Save 1 trip',
    'Community support',
  ],
  PRO: [
    'Unlimited trip plans',
    'PDF export & sharing',
    'Priority AI processing',
    'Save unlimited trips',
    'Itinerary collaboration',
    'Email support',
  ],
  TEAMS: [
    'Everything in Pro',
    '5 team seats',
    'Shared trip library',
    'API access',
    'Priority support',
    'Team analytics',
  ],
}
