'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Zap, Check, Crown, Users, LogOut, Mail, Calendar, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { PricingCards } from '@/components/paywall/PricingCards'
import { PLAN_FEATURES } from '@/types/subscription'

interface Plan {
  name: string
  price: string
  period: string
  features: string[]
  id: string
  popular?: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>('FREE')
  const [loading, setLoading] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        // Fetch subscription details
        const res = await fetch('/api/subscription/status')
        const data = await res.json()
        setSubscriptionData(data)
        setPlan(data.plan || 'FREE')
      } catch (error) {
        toast.error('Failed to load settings')
      }
    }
    fetchUser()
  }, [])

  const handleUpgrade = async (newPlan: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Failed to start upgrade')
    } finally {
      setLoading(false)
    }
  }

  const currentPlanFeatures = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]
  const aiPlansRemaining = currentPlanFeatures?.aiPlansPerMonth && currentPlanFeatures.aiPlansPerMonth > 0
    ? Math.max(0, currentPlanFeatures.aiPlansPerMonth - (subscriptionData?.aiPlansThisMonth || 0))
    : Infinity
  const tripsRemaining = currentPlanFeatures?.maxSavedTrips && currentPlanFeatures.maxSavedTrips > 0
    ? Math.max(0, currentPlanFeatures.maxSavedTrips - (subscriptionData?.savedTripsCount || 0))
    : Infinity

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-white/60">Manage your account and subscription</p>
      </div>

      {/* Account Section */}
      <Card className="rounded-2xl p-6 sm:p-8 border-white/10 bg-white/5 shadow-md hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <Mail size={24} className="text-amber-500" />
          Account Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs sm:text-sm text-white/60 font-semibold mb-2 uppercase tracking-wide">Email Address</p>
            <p className="text-base sm:text-lg text-white font-medium break-all">{user?.email || 'Loading...'}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs sm:text-sm text-white/60 font-semibold mb-2 uppercase tracking-wide">Member Since</p>
            <p className="text-base sm:text-lg text-white font-medium flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" />
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      {/* Current Plan */}
      <Card className="rounded-2xl p-6 sm:p-8 border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-md hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <Zap size={24} className="text-amber-500" />
          Your Current Plan
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-1">
                {plan === 'FREE' && 'Free Plan'}
                {plan === 'PRO' && '⭐ Pro Plan'}
                {plan === 'TEAMS' && '👥 Teams Plan'}
              </h3>
              <p className="text-xs sm:text-sm text-white/60">
                {plan === 'FREE' && 'Upgrade to unlock premium features and create unlimited trips'}
                {plan === 'PRO' && 'You have unlimited AI planning and trip saving'}
                {plan === 'TEAMS' && 'Team collaboration and advanced analytics included'}
              </p>
            </div>
            <div className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full font-semibold text-xs sm:text-sm flex-shrink-0 border border-amber-500/20">
              Current
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        {subscriptionData && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-2">AI Plans This Month</p>
              <p className="text-2xl font-bold text-white">
                {subscriptionData.aiPlansThisMonth || 0}
                <span className="text-xs text-white/60 ml-1">
                  / {currentPlanFeatures?.aiPlansPerMonth === -1 ? '∞' : currentPlanFeatures?.aiPlansPerMonth}
                </span>
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-2">Trips Saved</p>
              <p className="text-2xl font-bold text-white">
                {subscriptionData.savedTripsCount || 0}
                <span className="text-xs text-white/60 ml-1">
                  / {currentPlanFeatures?.maxSavedTrips === -1 ? '∞' : currentPlanFeatures?.maxSavedTrips}
                </span>
              </p>
            </div>
          </div>
        )}

        {plan === 'FREE' && subscriptionData && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 items-start">
            <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">Your free trial is active</p>
              <p className="text-white/70 text-xs mt-1">
                You have {aiPlansRemaining === Infinity ? 'unlimited' : aiPlansRemaining} AI plans and {tripsRemaining === Infinity ? 'unlimited' : tripsRemaining} trip saves remaining this month.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Upgrade Options */}
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <Crown size={24} className="text-amber-500" />
          {plan === 'FREE' ? 'Upgrade Your Plan' : 'Your Plan'}
        </h2>
        <PricingCards />
      </div>

      {/* FAQ / Info */}
      <Card className="rounded-2xl p-8 border-white/10 bg-white/5 hover:bg-white/10 transition-all">
        <h3 className="font-display font-bold text-lg text-white mb-4">Need Help?</h3>
        <p className="text-white/60 text-sm mb-4">All plans include access to our AI trip planner and the ability to save your favorite itineraries. Premium plans unlock additional features like PDF exports, priority support, and team collaboration.</p>
        <a href="mailto:support@voyai.com" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-semibold transition-colors">
          Contact Support
          <ArrowRight size={16} />
        </a>
      </Card>
    </div>
  )
}
