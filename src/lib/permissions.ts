// Permission checking utilities
import { PlanType, PLAN_FEATURES, FeaturePermissions } from '@/types/subscription'

/**
 * Check if a feature is available for a given plan
 */
export function hasFeature(
  plan: PlanType,
  feature: keyof FeaturePermissions
): boolean {
  // @ts-ignore - checking if feature key exists
  const value = PLAN_FEATURES[plan][feature]

  // Boolean features
  if (typeof value === 'boolean') {
    return value
  }

  // Numeric features (unlimited = -1)
  if (typeof value === 'number' && feature !== 'plan') {
    return value !== 0 // Has feature if > 0 or unlimited (-1)
  }

  return false
}

/**
 * Check if user can generate more AI plans this month
 */
export function canGenerateAIPlan(
  plan: PlanType,
  plansGeneratedThisMonth: number
): boolean {
  const limit = PLAN_FEATURES[plan].aiPlansPerMonth
  if (limit === -1) return true // unlimited
  return plansGeneratedThisMonth < limit
}

/**
 * Check if user can save more trips
 */
export function canSaveMoreTrips(
  plan: PlanType,
  tripsSaved: number
): boolean {
  const limit = PLAN_FEATURES[plan].maxSavedTrips
  if (limit === -1) return true // unlimited
  return tripsSaved < limit
}

/**
 * Get readable limit message for a feature
 */
export function getFeatureLimitMessage(
  plan: PlanType,
  feature: 'aiPlans' | 'savedTrips',
  current: number
): string {
  if (feature === 'aiPlans') {
    const limit = PLAN_FEATURES[plan].aiPlansPerMonth
    if (limit === -1) return 'Unlimited AI trip plans'
    return `${limit} AI trip plans per month (${current}/${limit} used)`
  }

  if (feature === 'savedTrips') {
    const limit = PLAN_FEATURES[plan].maxSavedTrips
    if (limit === -1) return 'Unlimited saved trips'
    return `${limit} saved trips (${current}/${limit} used)`
  }

  return ''
}

/**
 * Get upgrade suggestion for unavailable feature
 */
export function getUpgradeSuggestion(
  currentPlan: PlanType,
  feature: string
): { plan: PlanType; message: string } | null {
  if (currentPlan === 'TEAMS') return null // Already on highest tier

  const upgradeTo = currentPlan === 'FREE' ? 'PRO' : 'TEAMS'
  const messages: Record<string, Record<PlanType, string>> = {
    pdfExport: {
      FREE: 'Upgrade to Pro to export trips as PDF',
      PRO: 'Upgrade to Teams for advanced export options',
      TEAMS: '',
    },
    sharing: {
      FREE: 'Upgrade to Pro to share trips with others',
      PRO: 'Upgrade to Teams for team sharing',
      TEAMS: '',
    },
    collaboration: {
      FREE: 'Upgrade to Pro to collaborate on trips',
      PRO: 'Upgrade to Teams for team collaboration',
      TEAMS: '',
    },
    apiAccess: {
      FREE: 'Upgrade to Teams for API access',
      PRO: 'Upgrade to Teams for API access',
      TEAMS: '',
    },
    teamAnalytics: {
      FREE: 'Upgrade to Teams for team analytics',
      PRO: 'Upgrade to Teams for team analytics',
      TEAMS: '',
    },
  }

  return {
    plan: upgradeTo as PlanType,
    message: messages[feature]?.[currentPlan] || `Upgrade to ${upgradeTo} for this feature`,
  }
}

/**
 * Check if plan supports team collaboration
 */
export function isTeamPlan(plan: PlanType): boolean {
  return plan === 'TEAMS'
}

/**
 * Check if plan is paid
 */
export function isPaidPlan(plan: PlanType): boolean {
  return plan !== 'FREE'
}

/**
 * Calculate reset date for monthly limits
 */
export function getNextResetDate(lastResetAt: Date): Date {
  const next = new Date(lastResetAt)
  next.setMonth(next.getMonth() + 1)
  return next
}

/**
 * Check if monthly limit should be reset
 */
export function shouldResetMonthlyLimit(lastResetAt: Date): boolean {
  return new Date() >= getNextResetDate(lastResetAt)
}
