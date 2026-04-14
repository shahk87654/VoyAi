'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Zap, Check, Crown, Users, LogOut, Mail, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'

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
        setPlan('FREE')
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

  const plans: Plan[] = [
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      features: ['Unlimited AI planning', 'PDF export', 'Priority support', 'Save up to 10 trips'],
      id: 'PRO',
    },
    {
      name: 'Teams',
      price: '$49',
      period: '/month',
      features: ['Everything in Pro', 'Up to 5 team members', 'Team management', 'Advanced analytics'],
      id: 'TEAMS',
      popular: true,
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-text)] mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-[var(--color-text-muted)]">Manage your account and subscription</p>
      </div>

      {/* Account Section */}
      <Card className="rounded-2xl p-6 sm:p-8 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <Mail size={24} className="text-[var(--color-accent)]" />
          Account Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-semibold mb-2 uppercase tracking-wide">Email Address</p>
            <p className="text-base sm:text-lg text-[var(--color-text)] font-medium break-all">{user?.email || 'Loading...'}</p>
          </div>
          <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-semibold mb-2 uppercase tracking-wide">Member Since</p>
            <p className="text-base sm:text-lg text-[var(--color-text)] font-medium flex items-center gap-2">
              <Calendar size={18} className="text-[var(--color-accent)]" />
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      {/* Current Plan */}
      <Card className="rounded-2xl p-6 sm:p-8 border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg-muted)] shadow-md hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <Zap size={24} className="text-[var(--color-accent)]" />
          Your Current Plan
        </h2>
        <div className="bg-[var(--color-bg)] rounded-xl p-6 border-2 border-dashed border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text)] mb-1">Free Plan</h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">Upgrade to unlock premium features and create unlimited trips</p>
            </div>
            <div className="px-4 py-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full font-semibold text-xs sm:text-sm flex-shrink-0">Current</div>
          </div>
        </div>
      </Card>

      {/* Upgrade Options */}
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <Crown size={24} className="text-[var(--color-accent)]" />
          Upgrade Your Plan
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan: Plan) => {
            const tierColor = plan.id === 'PRO' ? 'blue' : 'purple'
            const isPro = plan.id === 'PRO'
            const isTeams = plan.id === 'TEAMS'
            
            return (
              <Card
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden border-2 p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  plan.popular
                    ? `border-[var(--color-accent)] bg-gradient-to-br from-[var(--color-accent)]/10 via-[var(--color-surface)] to-[var(--color-surface)] shadow-lg`
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-amber-400 to-transparent" />
                )}
                
                {plan.popular && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1 px-4 py-1.5 bg-[var(--color-accent)] text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                    <Crown size={12} />
                    Most Popular
                  </div>
                )}
                
                <div className={`mb-8 ${plan.popular ? 'pt-6' : 'pt-0'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {isPro && <span className="text-3xl">⭐</span>}
                    {isTeams && <span className="text-3xl">👥</span>}
                    <h3 className="text-2xl font-display font-bold text-[var(--color-text)]">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display font-bold text-[var(--color-accent)]">{plan.price}</span>
                    <span className="text-[var(--color-text-muted)]">{plan.period}</span>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-6 mb-8">
                  <ul className="space-y-4">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Check size={18} className="text-emerald-500 font-bold" />
                        </div>
                        <span className="text-[var(--color-text-muted)] text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading || plan.id === 'FREE'}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 ${
                    plan.popular
                      ? 'bg-[var(--color-accent)] text-white hover:bg-amber-600 shadow-lg'
                      : 'bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Upgrade to {plan.name}
                    </>
                  )}
                </button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQ / Info */}
      <Card className="rounded-2xl p-8 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Need Help?</h3>
        <p className="text-[var(--color-text-muted)] text-sm mb-4">All plans include access to our AI trip planner and the ability to save your favorite itineraries. Premium plans unlock additional features like PDF exports, priority support, and team collaboration.</p>
        <a href="mailto:support@voyai.com" className="inline-flex items-center gap-2 text-[var(--color-accent)] hover:text-amber-600 font-semibold transition-colors">
          Contact Support
          <Zap size={16} />
        </a>
      </Card>
    </div>
  )
}
