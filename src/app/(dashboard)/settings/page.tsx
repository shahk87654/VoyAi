'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Zap, Check, Crown, Users, LogOut, Mail, Calendar, ArrowRight } from 'lucide-react'
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
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-1">Free Plan</h3>
              <p className="text-xs sm:text-sm text-white/60">Upgrade to unlock premium features and create unlimited trips</p>
            </div>
            <div className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full font-semibold text-xs sm:text-sm flex-shrink-0 border border-amber-500/20">Current</div>
          </div>
        </div>
      </Card>

      {/* Upgrade Options */}
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <Crown size={24} className="text-amber-500" />
          Upgrade Your Plan
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan: Plan) => {
            const isPro = plan.id === 'PRO'
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden border p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'border-amber-400 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-2xl shadow-amber-500/40 -translate-y-2'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-950 text-amber-400 text-xs font-bold px-4 py-2 rounded-full border border-amber-500/30 flex items-center gap-1.5 whitespace-nowrap">
                    🔥 Most Popular
                  </div>
                )}
                
                {/* Plan Name & Icon */}
                <div className="mb-8 pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    {isPro ? <span className="text-3xl">⭐</span> : <span className="text-3xl">👥</span>}
                    <h3 className="text-2xl font-display font-bold">{plan.name}</h3>
                  </div>
                  
                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-5xl font-display font-bold ${plan.popular ? 'text-slate-950' : 'text-amber-500'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? 'text-slate-700' : 'text-white/60'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm ${plan.popular ? 'text-slate-700' : 'text-white/50'}`}>
                    Billed monthly or annually
                  </p>
                </div>

                {/* Divider */}
                <div className={`my-8 ${plan.popular ? 'border-slate-700' : 'border-white/10'} border-t`} />

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-slate-700' : 'text-emerald-400'}`} />
                      <span className={`text-sm leading-relaxed ${plan.popular ? 'text-slate-800' : 'text-white/70'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading || plan.id === 'FREE'}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? 'bg-slate-950 text-white hover:bg-slate-900 shadow-lg shadow-slate-950/50 hover:shadow-slate-950/70 hover:scale-105'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Upgrade to {plan.name}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
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
