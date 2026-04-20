// React hook for checking user permissions
import { useCallback, useEffect, useState } from 'react'
import {
  PLAN_FEATURES,
  PlanType,
  FeaturePermissions,
} from '@/types/subscription'
import {
  hasFeature,
  canGenerateAIPlan,
  canSaveMoreTrips,
  getFeatureLimitMessage,
  getUpgradeSuggestion,
} from '@/lib/permissions'

interface UserSubscription {
  plan: PlanType
  stripeCustomerId?: string
  aiPlansThisMonth: number
  savedTripsCount: number
  lastResetAt: string
}

export function usePermissions() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch user subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/subscription/status')
        if (!response.ok) throw new Error('Failed to fetch subscription')
        const data = (await response.json()) as UserSubscription
        setSubscription(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setSubscription(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
    // Refresh every 5 minutes
    const interval = setInterval(fetchSubscription, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const plan = subscription?.plan || 'FREE'
  const features = PLAN_FEATURES[plan]

  // Check if user can generate AI plan
  const canGeneratePlan = useCallback((): boolean => {
    if (!subscription) return true
    return canGenerateAIPlan(plan, subscription.aiPlansThisMonth)
  }, [subscription, plan])

  // Check if user can save more trips
  const canSaveTrip = useCallback((): boolean => {
    if (!subscription) return true
    return canSaveMoreTrips(plan, subscription.savedTripsCount)
  }, [subscription, plan])

  // Check if feature is available
  const hasFeatureAccess = useCallback(
    (feature: keyof FeaturePermissions): boolean => {
      return hasFeature(plan, feature as any)
    },
    [plan]
  )

  // Get messages
  const getPlanLimitMessage = useCallback(
    (feature: 'aiPlans' | 'savedTrips'): string => {
      if (!subscription) return ''
      const current =
        feature === 'aiPlans'
          ? subscription.aiPlansThisMonth
          : subscription.savedTripsCount
      return getFeatureLimitMessage(plan, feature, current)
    },
    [subscription, plan]
  )

  const getUpgradeMessage = useCallback(
    (feature: string): { plan: PlanType; message: string } | null => {
      const suggestion = getUpgradeSuggestion(plan, feature)
      return suggestion
    },
    [plan]
  )

  return {
    plan,
    features,
    isLoading,
    error,
    canGeneratePlan,
    canSaveTrip,
    hasFeature: hasFeatureAccess,
    getPlanLimitMessage,
    getUpgradeMessage,
    plansThisMonth: subscription?.aiPlansThisMonth || 0,
    savedTripsCount: subscription?.savedTripsCount || 0,
  }
}

/**
 * Hook to check and handle feature access with automatic upgrade prompts
 */
export function useFeatureGate(feature: keyof FeaturePermissions) {
  const { plan, hasFeature: hasAccess, getUpgradeMessage } = usePermissions()
  const hasFeatureAccess = hasAccess(feature)

  const handleFeatureAttempt = useCallback(
    (callback?: () => void) => {
      if (hasFeatureAccess) {
        callback?.()
        return true
      }

      const suggestion = getUpgradeMessage(feature as string)
      if (suggestion) {
        // Dispatch event for upgrade modal
        window.dispatchEvent(
          new CustomEvent('feature-gate-blocked', {
            detail: {
              feature,
              currentPlan: plan,
              upgradePlan: suggestion.plan,
              message: suggestion.message,
            },
          })
        )
      }
      return false
    },
    [hasFeatureAccess, feature, plan, getUpgradeMessage]
  )

  return {
    hasAccess: hasFeatureAccess,
    plan,
    handleAttempt: handleFeatureAttempt,
  }
}
