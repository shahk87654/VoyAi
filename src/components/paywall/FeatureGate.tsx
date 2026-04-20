'use client'

import { usePermissions } from '@/hooks/usePermissions'
import { useState } from 'react'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Wrapper component to gate features behind a paywall
 * Shows upgrade prompt if feature isn't available
 */
export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { plan, hasFeature: hasFeatureAccess, getUpgradeMessage } =
    usePermissions()
  const hasAccess = hasFeatureAccess(feature as any)

  if (hasAccess) {
    return <>{children}</>
  }

  const suggestion = getUpgradeMessage(feature)

  return (
    fallback || (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Feature Locked</h3>
            <p className="text-sm text-amber-800 mt-1">
              {suggestion?.message || `This feature is not available on your ${plan} plan.`}
            </p>
            {suggestion && (
              <Link href="/dashboard/settings?tab=billing">
                <Button
                  size="sm"
                  variant="default"
                  className="mt-3 bg-amber-600 hover:bg-amber-700"
                >
                  Upgrade to {suggestion.plan}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  )
}

/**
 * Upgrade button - redirects to checkout if not on plan
 */
interface UpgradeButtonProps {
  plan: 'PRO' | 'TEAMS'
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'lg' | 'default'
}

export function UpgradeButton({
  plan,
  className,
  variant = 'default',
  size = 'default',
}: UpgradeButtonProps) {
  const { plan: currentPlan } = usePermissions()
  const [loading, setLoading] = useState(false)

  // Hide button if already on this plan or higher
  if (
    currentPlan === plan ||
    (currentPlan === 'TEAMS' && plan === 'PRO')
  ) {
    return null
  }

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: window.location.href,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? 'Loading...' : `Upgrade to ${plan}`}
    </Button>
  )
}

/**
 * Display current plan usage
 */
interface UsageIndicatorProps {
  className?: string
}

export function UsageIndicator({ className }: UsageIndicatorProps) {
  const { plan, plansThisMonth, savedTripsCount, getPlanLimitMessage } =
    usePermissions()

  return (
    <div className={className}>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">AI Trip Plans</span>
            <span className="text-slate-500">
              {getPlanLimitMessage('aiPlans')}
            </span>
          </div>
          <UsageBar current={plansThisMonth} plan={plan} type="aiPlans" />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">Saved Trips</span>
            <span className="text-slate-500">
              {getPlanLimitMessage('savedTrips')}
            </span>
          </div>
          <UsageBar current={savedTripsCount} plan={plan} type="savedTrips" />
        </div>
      </div>
    </div>
  )
}

/**
 * Visual usage bar
 */
interface UsageBarProps {
  current: number
  plan: string
  type: 'aiPlans' | 'savedTrips'
}

function UsageBar({ current, plan, type }: UsageBarProps) {
  // Determine max based on plan
  const limits: Record<string, Record<string, number>> = {
    FREE: { aiPlans: 3, savedTrips: 1 },
    PRO: { aiPlans: 999, savedTrips: 999 },
  }

  const max = limits[plan]?.[type] || 999
  const percentage = max === 999 ? 100 : (current / max) * 100
  const isMax = current >= max

  return (
    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all ${
          isMax ? 'bg-red-500' : 'bg-amber-500'
        }`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}
