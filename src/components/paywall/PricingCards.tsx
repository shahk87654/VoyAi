'use client'

import { useState } from 'react'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UpgradeButton } from '@/components/paywall/FeatureGate'
import Link from 'next/link'
import {
  PLAN_FEATURES,
  PLAN_PRICING,
  PLAN_DESCRIPTIONS,
} from '@/types/subscription'

/**
 * Pricing cards showing all available plans
 */
export function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 py-12">
      {/* Free Plan */}
      <PricingCard
        plan="FREE"
        price={0}
        description="Perfect for planning personal trips"
        highlighted={false}
      />

      {/* Pro Plan */}
      <PricingCard
        plan="PRO"
        price={19}
        period="/month"
        description="Unlimited trips with professional features"
        highlighted={true}
      />

      {/* Teams Plan */}
      <PricingCard
        plan="TEAMS"
        price={49}
        period="/month"
        description="Everything in Pro plus team collaboration"
        highlighted={false}
      />
    </div>
  )
}

interface PricingCardProps {
  plan: 'FREE' | 'PRO' | 'TEAMS'
  price: number
  period?: string
  description: string
  highlighted?: boolean
}

function PricingCard({
  plan,
  price,
  period = '/forever',
  description,
  highlighted = false,
}: PricingCardProps) {
  const features = PLAN_DESCRIPTIONS[plan]
  const stripePriceId = PLAN_PRICING[plan].stripePriceId

  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        highlighted
          ? 'md:scale-105 border-2 border-amber-500 shadow-lg'
          : 'border border-slate-200'
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 text-center text-sm font-semibold">
          🔥 Most Popular
        </div>
      )}

      <div className={`p-6 ${highlighted ? 'pt-12' : ''}`}>
        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan}</h3>

        {/* Price */}
        <div className="mb-4">
          <span className="text-4xl font-bold text-slate-900">${price}</span>
          <span className="text-slate-600 ml-2">{period}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-6">{description}</p>

        {/* CTA Button */}
        <div className="mb-6">
          {plan === 'FREE' ? (
            <Link href="/auth/signup" className="w-full inline-block">
              <Button
                variant="outline"
                className="w-full"
              >
                Get Started Free
              </Button>
            </Link>
          ) : (
            <UpgradeButton plan={plan} className="w-full" />
          )}
        </div>

        {/* Features */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/**
 * Comparison table showing all features across plans
 */
export function PlanComparison() {
  const allFeatures: Array<{
    name: string
    key: keyof typeof PLAN_FEATURES['FREE']
  }> = [
    { name: 'AI Trip Plans', key: 'aiPlansPerMonth' },
    { name: 'Saved Trips', key: 'maxSavedTrips' },
    { name: 'PDF Export', key: 'pdfExport' },
    { name: 'Trip Sharing', key: 'sharing' },
    { name: 'Collaboration', key: 'collaboration' },
    { name: 'Priority Processing', key: 'priorityProcessing' },
    { name: 'Email Support', key: 'emailSupport' },
    { name: 'Team Seats', key: 'teamSeats' },
    { name: 'Shared Library', key: 'sharedLibrary' },
    { name: 'API Access', key: 'apiAccess' },
    { name: 'Team Analytics', key: 'teamAnalytics' },
  ]

  return (
    <div className="overflow-x-auto py-8">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
              Feature
            </th>
            {(['FREE', 'PRO', 'TEAMS'] as const).map((plan) => (
              <th
                key={plan}
                className="px-4 py-3 text-center text-sm font-semibold text-slate-900"
              >
                {plan}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature) => (
            <tr
              key={feature.key}
              className="border-b border-slate-200 hover:bg-slate-50"
            >
              <td className="px-4 py-3 text-sm font-medium text-slate-700">
                {feature.name}
              </td>
              {(['FREE', 'PRO', 'TEAMS'] as const).map((plan) => (
                <td
                  key={plan}
                  className="px-4 py-3 text-center text-sm text-slate-600"
                >
                  <FeatureCell
                    value={PLAN_FEATURES[plan][feature.key]}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FeatureCell({ value }: { value: any }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-emerald-500 mx-auto" />
    ) : (
      <span className="text-slate-400">—</span>
    )
  }

  if (typeof value === 'number') {
    if (value === -1) return <span className="font-medium">Unlimited</span>
    if (value === 0) return <span className="text-slate-400">—</span>
    return <span className="font-medium">{value}</span>
  }

  return <span>{value}</span>
}
