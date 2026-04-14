'use client'

import Link from 'next/link'
import { ArrowRight, Plane, Hotel, Map, Sparkles, Star, CheckCircle2, Globe2, Zap, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-navy-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-navy-900" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">VoyAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-navy-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-navy-300 hover:text-white transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-amber-500 hover:bg-amber-400 text-navy-900 px-4 py-2 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-6">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--navy-300) 1px, transparent 1px), linear-gradient(90deg, var(--navy-300) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-navy-300 mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Powered by Claude AI · Booking.com · Google Flights</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-6xl md:text-8xl font-bold leading-[0.92] tracking-tight mb-8 animate-fade-up">
            Your AI travel
            <br />
            <span className="text-amber-400">agent</span>, always on.
          </h1>

          <p className="text-lg md:text-xl text-navy-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up [animation-delay:100ms]">
            Describe your dream trip. VoyAI searches real flights, finds perfect hotels, and builds a complete day-by-day itinerary — in one conversation.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up [animation-delay:200ms]">
            <Link
              href="/signup"
              className="group flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-navy-900 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              Plan my first trip — free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="group flex items-center gap-2 text-white border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-base px-8 py-4 rounded-xl font-semibold"
            >
              See how it works
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-navy-400 animate-fade-up [animation-delay:300ms]">
            <div className="flex -space-x-2">
              {['A','B','C','D','E'].map((l, i) => (
                <div
                  key={l}
                  className="w-8 h-8 rounded-full border-2 border-navy-950 flex items-center justify-center text-xs font-bold"
                  style={{ background: ['#f59e0b','#10b981','#0ea5e9','#8b5cf6','#f43f5e'][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              <span className="ml-2">Loved by 2,400+ travellers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full mb-4">
              Everything you need
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Plan smarter,<br />travel better.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Plane,
                color: 'sky',
                title: 'Real flight search',
                desc: 'Live prices from 1,200+ airlines via Google Flights data. Compare outbound and return in one search.',
              },
              {
                icon: Hotel,
                color: 'emerald',
                title: 'Hotel discovery',
                desc: 'Booking.com integration with 28M+ properties. Filter by rating, free cancellation, breakfast included.',
              },
              {
                icon: Sparkles,
                color: 'amber',
                title: 'AI itinerary builder',
                desc: 'Claude AI creates day-by-day plans with specific restaurants, activities, tips, and realistic timings.',
              },
              {
                icon: Map,
                color: 'rose',
                title: 'Interactive trip map',
                desc: 'See your entire trip on a Mapbox map. Route visualisation, activity pins, neighbourhood context.',
              },
              {
                icon: Zap,
                color: 'amber',
                title: 'One conversation',
                desc: 'Refine your itinerary through chat. "Make day 2 more relaxed" — VoyAI updates the whole plan.',
              },
              {
                icon: Shield,
                color: 'emerald',
                title: 'Save & export',
                desc: 'Save trips to your account. Export to PDF (Pro). Share a read-only link with travel partners.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
                  color === 'amber'   ? 'bg-amber-500/20'   :
                  color === 'emerald' ? 'bg-emerald-500/20' :
                  color === 'sky'     ? 'bg-sky-500/20'     :
                                        'bg-rose-500/20'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    color === 'amber'   ? 'text-amber-400'   :
                    color === 'emerald' ? 'text-emerald-400' :
                    color === 'sky'     ? 'text-sky-400'     :
                                          'text-rose-400'
                  }`} />
                </div>
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <p className="text-sm text-navy-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA after features */}
          <div className="text-center mt-16">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-navy-900 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 group"
            >
              <Sparkles className="w-4 h-4" />
              Start planning free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-32 px-6 bg-white/5 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Three steps to your trip.</h2>
            <p className="text-navy-400 text-lg">No spreadsheets. No 47 browser tabs. Just describe and go.</p>
          </div>
          <div className="space-y-8">
            {[
              { n: '01', title: 'Describe your trip', desc: 'Tell VoyAI where you want to go, when, how many people, and your vibe. Budget backpacker or 5-star luxury — it adapts.' },
              { n: '02', title: 'Review AI-matched options', desc: 'VoyAI surfaces the best flights and hotels for your criteria. Click to add to your trip. Prices are live, links go direct to Booking.com.' },
              { n: '03', title: 'Get your full itinerary', desc: 'Claude builds a complete day-by-day plan with restaurants, timings, and local tips. Refine through chat. Export as PDF. Travel.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-8 items-start group">
                <div className="flex-shrink-0 w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all">
                  <span className="font-mono text-lg font-bold text-amber-400">{n}</span>
                </div>
                <div className="pt-3">
                  <h3 className="font-semibold text-xl mb-2">{title}</h3>
                  <p className="text-navy-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA after how-it-works */}
          <div className="text-center mt-16">
            <p className="text-slate-300 mb-6 text-lg font-semibold">Ready to plan your next adventure?</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-navy-900 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 group"
            >
              <Sparkles className="w-4 h-4" />
              Create your first itinerary
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Simple pricing.</h2>
            <p className="text-navy-400 text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free', price: '$0', per: 'forever',
                highlight: false,
                features: ['3 AI trip plans per month', 'Flight & hotel search', 'Basic itinerary view', 'Save 1 trip'],
                cta: 'Get started free', href: '/signup',
              },
              {
                name: 'Pro', price: '$19', per: 'per month',
                highlight: true,
                features: ['Unlimited AI trip plans', 'PDF export & sharing', 'Priority AI processing', 'Save unlimited trips', 'Itinerary collaboration'],
                cta: 'Start Pro free trial', href: '/signup?plan=pro',
              },
              {
                name: 'Teams', price: '$49', per: 'per month',
                highlight: false,
                features: ['Everything in Pro', '5 team seats', 'Shared trip library', 'API access', 'Priority support'],
                cta: 'Start Teams free trial', href: '/signup?plan=teams',
              },
            ].map(({ name, price, per, highlight, features, cta, href }) => (
              <div
                key={name}
                className={`relative p-8 rounded-2xl border transition-all duration-300 group ${
                  highlight
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-400 text-navy-900 -translate-y-4 shadow-2xl shadow-amber-500/30'
                    : 'bg-white/5 border-white/10 text-white hover:border-white/30 hover:bg-white/10 hover:-translate-y-1'
                }`}
              >
                {highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-navy-900 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                    🔥 Most popular
                  </div>
                )}
                <div className="mb-8">
                  <div className={`text-sm font-semibold mb-3 uppercase tracking-wider ${highlight ? 'text-navy-700' : 'text-slate-400'}`}>{name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold">{price}</span>
                    <span className={`text-sm ${highlight ? 'text-navy-600' : 'text-navy-400'}`}>/{per}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlight ? 'text-navy-600' : 'text-emerald-400'}`} />
                      <span className={highlight ? 'text-navy-800' : 'text-navy-300'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`block text-center py-3 px-6 rounded-xl font-bold text-sm transition-all group-hover:scale-105 ${
                    highlight
                      ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-lg shadow-navy-900/50'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>

          {/* CTA after pricing */}
          <div className="text-center mt-16">
            <p className="text-slate-300 mb-6 text-lg">All plans come with a free 7-day trial. No credit card required.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-navy-900 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 group"
            >
              <Sparkles className="w-4 h-4" />
              Start my free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-navy-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
              <Globe2 className="w-3 h-3 text-navy-900" />
            </div>
            <span className="text-navy-300 font-medium">VoyAI</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="mailto:hello@voyai.com" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <span>© 2025 VoyAI. Built with ❤️ and Claude AI.</span>
        </div>
      </footer>
    </div>
  )
}
