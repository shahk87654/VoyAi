'use client'

import Link from 'next/link'
import { ArrowRight, Plane, Hotel, Map, Sparkles, Star, CheckCircle2, Globe2, Zap, Shield, MessageSquare, Palette } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-lg bg-slate-950/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Globe2 className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">VoyAI</span>
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-500/30"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 sm:pt-40 sm:pb-32">
        <div className="max-w-5xl mx-auto text-center relative z-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-slate-300 mb-8 backdrop-blur-sm hover:bg-white/15 transition-all">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Powered by Claude 3.5 · Real-time flight & hotel search</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-6 tracking-tight">
            Your AI travel
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">agent</span>, always on.
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Describe your dream trip. VoyAI searches real flights, finds perfect hotels, and builds a complete day-by-day itinerary — all in one conversation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/signup"
              className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5" />
              Plan my trip — free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="group flex items-center gap-2 text-white border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all px-8 py-4 rounded-xl font-semibold backdrop-blur-sm"
            >
              How it works
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  { bg: '#f59e0b', l: '👩' },
                  { bg: '#10b981', l: '👨' },
                  { bg: '#0ea5e9', l: '👩' },
                  { bg: '#8b5cf6', l: '👨' },
                  { bg: '#f43f5e', l: '👩' },
                ].map(({ bg, l }, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-slate-950 flex items-center justify-center text-lg font-medium flex-shrink-0"
                    style={{ background: bg }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-slate-400">Loved by 2,400+ travellers worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Feature Cards */}
      <section id="features" className="py-20 sm:py-32 px-6 relative z-20">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
              Everything you need
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Plan smarter,
              <br />
              travel better.
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From search to itinerary, every step is optimized for your perfect trip.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Plane,
                color: 'sky',
                title: 'Real flight search',
                desc: 'Live prices from 1,200+ airlines. Compare flights, set price alerts, find the perfect flight.',
              },
              {
                icon: Hotel,
                color: 'emerald',
                title: 'Smart hotel discovery',
                desc: '28M+ properties from Booking.com. Filter by rating, cancellation policy, breakfast included.',
              },
              {
                icon: Sparkles,
                color: 'amber',
                title: 'AI itinerary builder',
                desc: 'Claude creates personalized day-by-day plans with restaurants, activities, tips & timings.',
              },
              {
                icon: Map,
                color: 'rose',
                title: 'Interactive trip map',
                desc: 'Visualize your entire trip on a map. See routes, activities, and neighbourhood context.',
              },
              {
                icon: MessageSquare,
                color: 'blue',
                title: 'Natural refinement',
                desc: '"Make day 2 more relaxed" — chat with AI to refine your entire itinerary on the fly.',
              },
              {
                icon: Shield,
                color: 'emerald',
                title: 'Save & share',
                desc: 'Save trips to your account. Export to PDF. Share read-only links with travel partners.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="group p-6 sm:p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-amber-500/30 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all ${
                  color === 'amber'   ? 'bg-amber-500/15 group-hover:bg-amber-500/25' :
                  color === 'emerald' ? 'bg-emerald-500/15 group-hover:bg-emerald-500/25' :
                  color === 'sky'     ? 'bg-sky-500/15 group-hover:bg-sky-500/25' :
                  color === 'rose'    ? 'bg-rose-500/15 group-hover:bg-rose-500/25' :
                                        'bg-blue-500/15 group-hover:bg-blue-500/25'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    color === 'amber'   ? 'text-amber-400' :
                    color === 'emerald' ? 'text-emerald-400' :
                    color === 'sky'     ? 'text-sky-400' :
                    color === 'rose'    ? 'text-rose-400' :
                                          'text-blue-400'
                  }`} />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-white">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 group"
            >
              <Sparkles className="w-5 h-5" />
              Start planning free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-32 px-6 relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
              Three simple steps
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6">
              From description to adventure.
            </h2>
            <p className="text-slate-400 text-lg">
              No spreadsheets. No endless browser tabs. Just describe and go.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8 mb-12">
            {[
              { n: '01', title: 'Describe your trip', desc: 'Tell VoyAI where you want to go, when, for how long. Budget backpacker or luxury traveller — we adapt to your style.' },
              { n: '02', title: 'Review smart options', desc: 'We surface the best flights and hotels matching your criteria. Live prices, direct booking links to partners.' },
              { n: '03', title: 'Get your itinerary', desc: 'Claude builds a complete day-by-day plan with restaurants, timings, and local tips. Refine via chat. Export. Travel.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-6 sm:gap-8 items-start group">
                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center group-hover:border-amber-400/40 group-hover:bg-amber-500/30 transition-all">
                  <span className="font-mono text-lg sm:text-xl font-bold text-amber-400">{n}</span>
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-xl mb-2 text-white">{title}</h3>
                  <p className="text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-slate-300 mb-6 text-base">Ready to plan your next adventure?</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 group"
            >
              <Sparkles className="w-5 h-5" />
              Create your first itinerary
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-32 px-6 relative z-20">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
              Simple & transparent
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6">
              Simple pricing.
            </h2>
            <p className="text-slate-400 text-lg">
              Start free. Upgrade when you need more.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: 'Free',
                price: '$0',
                per: 'forever',
                highlight: false,
                features: ['3 AI trip plans/month', 'Flight & hotel search', 'Basic itinerary view', 'Save 1 trip', 'Community support'],
                cta: 'Get started free',
                href: '/signup',
              },
              {
                name: 'Pro',
                price: '$19',
                per: 'per month',
                highlight: true,
                features: ['Unlimited trip plans', 'PDF export & sharing', 'Priority AI processing', 'Save unlimited trips', 'Itinerary collaboration', 'Email support'],
                cta: 'Start Pro free trial',
                href: '/signup?plan=pro',
              },
              {
                name: 'Teams',
                price: '$49',
                per: 'per month',
                highlight: false,
                features: ['Everything in Pro', '5 team seats', 'Shared trip library', 'API access', 'Priority support', 'Team analytics'],
                cta: 'Start Teams free trial',
                href: '/signup?plan=teams',
              },
            ].map(({ name, price, per, highlight, features, cta, href }) => (
              <div
                key={name}
                className={`relative p-8 rounded-2xl border transition-all duration-300 group ${
                  highlight
                    ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 border-amber-400 text-slate-950 -translate-y-4 shadow-2xl shadow-amber-500/40'
                    : 'bg-white/5 border-white/10 text-white hover:border-white/30 hover:bg-white/10 hover:-translate-y-1'
                }`}
              >
                {highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-950 text-amber-400 text-xs font-bold px-4 py-2 rounded-full border border-amber-500/30 whitespace-nowrap flex items-center gap-1.5">
                    🔥 Most popular
                  </div>
                )}
                <div className="mb-8">
                  <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${highlight ? 'text-slate-700' : 'text-slate-400'}`}>
                    {name}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold">{price}</span>
                    <span className={`text-sm ${highlight ? 'text-slate-700' : 'text-slate-400'}`}>/{per}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${highlight ? 'text-slate-700' : 'text-emerald-400'}`} />
                      <span className={highlight ? 'text-slate-800' : 'text-slate-300'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`block text-center py-3 px-6 rounded-xl font-bold text-sm transition-all group-hover:scale-105 ${
                    highlight
                      ? 'bg-slate-950 text-white hover:bg-slate-900 shadow-lg shadow-slate-950/50'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-slate-400 mb-6 text-base">All plans come with 7-day free trial. No credit card required.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 group"
            >
              <Sparkles className="w-5 h-5" />
              Start your free trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-32 px-6 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
            Loved by travellers
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-12">
            Real trips, real love.
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: "From idea to booked flights in under 5 minutes. Mind blown.",
                author: "Marcus T.",
                location: "London",
                rating: 5,
              },
              {
                quote: "Finally, a travel planner that actually understands what I want. Not generic.",
                author: "Sarah M.",
                location: "Sydney",
                rating: 5,
              },
            ].map(({ quote, author, location, rating }) => (
              <div key={quote} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-lg font-semibold mb-6 italic">"{quote}"</p>
                <div>
                  <p className="font-semibold text-white">{author}</p>
                  <p className="text-sm text-slate-400">{location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Globe2 className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <p className="text-white font-semibold">VoyAI</p>
              <p className="text-xs text-slate-500">Your AI Travel Agent</p>
            </div>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms</Link>
            <Link href="mailto:hello@voyai.com" className="text-slate-400 hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-slate-500">© 2026 VoyAI. Built with ❤️ and Claude AI.</p>
        </div>
      </footer>
    </div>
  )
}
