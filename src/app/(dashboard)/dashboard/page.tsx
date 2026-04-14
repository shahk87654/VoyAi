'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Sparkles, MapPin, Calendar, Users, Zap, ArrowRight, Lightbulb, Clock, Globe, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Trip {
  id: string
  destination: string
  days: number
  travelers: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        // Fetch trips from database (when available)
        // For now, just show empty state
        setTrips([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Traveler'

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[var(--color-accent)]/20 via-[var(--color-accent)]/5 to-transparent border border-[var(--color-accent)]/30 backdrop-blur-sm">
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;utf8,<svg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M0 0h40v40H0z%22 fill=%22%23000%22 fill-opacity=%22.05%22/%></svg>')] pointer-events-none" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div>
              <p className="text-[var(--color-accent)] font-semibold text-sm uppercase tracking-wider mb-2">Good to see you again! 🌍</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--color-text)] mb-3">
                Welcome back, {firstName}
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
                Plan your next adventure with AI-powered personalization. Your trips are waiting to be explored.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-6xl">✨</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Trips */}
        <div className="group p-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:shadow-lg transition-all duration-300 hover:bg-white/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-semibold mb-2">Total Trips</p>
              <p className="text-4xl font-display font-bold text-[var(--color-text)]">{trips.length}</p>
            </div>
            <div className="p-3 bg-[var(--color-accent)]/10 group-hover:bg-[var(--color-accent)]/20 rounded-xl transition-colors">
              <MapPin className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">All your planned adventures</p>
        </div>

        {/* Destinations */}
        <div className="group p-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 hover:bg-white/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-semibold mb-2">Destinations</p>
              <p className="text-4xl font-display font-bold text-[var(--color-text)]">0</p>
            </div>
            <div className="p-3 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-xl transition-colors">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">Unique places visited</p>
        </div>

        {/* Days Planned */}
        <div className="group p-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 hover:bg-white/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-semibold mb-2">Days Planned</p>
              <p className="text-4xl font-display font-bold text-[var(--color-text)]">0</p>
            </div>
            <div className="p-3 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-xl transition-colors">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">Total travel duration</p>
        </div>

        {/* Travelers */}
        <div className="group p-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-rose-500/50 hover:shadow-lg transition-all duration-300 hover:bg-white/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-semibold mb-2">Travelers</p>
              <p className="text-4xl font-display font-bold text-[var(--color-text)]">0</p>
            </div>
            <div className="p-3 bg-rose-500/10 group-hover:bg-rose-500/20 rounded-xl transition-colors">
              <Users className="w-6 h-6 text-rose-400" />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">Friends & family joined</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Create Trip */}
        <Link href="/builder" className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-[var(--color-accent)]/30 to-amber-600/10 border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/60 transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[var(--color-accent)]/20 group-hover:bg-[var(--color-accent)]/30 rounded-xl transition-colors">
                <Sparkles className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="font-semibold text-lg text-[var(--color-text)] mb-2">Plan a New Trip</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Start your AI-powered journey with just a description</p>
          </div>
        </Link>

        {/* View Trips */}
        <Link href="/dashboard/trips" className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/20 group-hover:bg-blue-500/30 rounded-xl transition-colors">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="font-semibold text-lg text-[var(--color-text)] mb-2">View My Trips</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Browse and manage all your saved itineraries</p>
          </div>
        </Link>
      </div>

      {/* Empty State / Call to Action */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm p-8 sm:p-12 lg:p-16">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;utf8,<svg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22><g fill=%22none%22 fill-rule=%22evenodd%22><g fill=%22%23000%22 fill-opacity=%22.05%22><path d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/></g></g></svg>')] pointer-events-none" />
        
        <div className="relative text-center">
          <div className="inline-block mb-6">
            <div className="text-6xl sm:text-7xl animate-bounce">🚀</div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[var(--color-text)] mb-4">
            Ready to start planning?
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto leading-relaxed">
            No trips yet? Let VoyAI create the perfect itinerary for you. Just tell it where you want to go, when, and your travel style.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/builder"
              className="group flex items-center gap-2 bg-gradient-to-r from-[var(--color-accent)] to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-5 h-5" />
              Create Your First Trip
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center gap-2 text-[var(--color-accent)] border-2 border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/60 px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:bg-[var(--color-accent)]/5">
              <Lightbulb className="w-5 h-5" />
              Learn More
            </button>
          </div>

          {/* Features preview */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '✈️', text: 'Real-time flight search' },
              { icon: '🏨', text: 'Best hotel deals' },
              { icon: '🗺️', text: 'AI itineraries' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--color-accent)]/30 transition-colors text-sm text-[var(--color-text-muted)]">
                <span className="text-xl mr-2">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help & Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)] mb-1">Quick Start</h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">New to VoyAI? Learn how to create your first itinerary in 5 minutes.</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)] mb-1">Upgrade to Pro</h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">Unlock unlimited trips, PDF export, and priority AI processing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
