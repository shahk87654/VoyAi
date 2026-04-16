'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Globe2, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const passwordStrength = {
    length: password.length >= 8,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Account created! Check your email to confirm.')
      router.push('/login')
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 py-12 sm:py-16 lg:py-24 relative z-10">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Globe2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-white block">VoyAI</span>
              <span className="text-xs text-slate-400">Your AI Travel Agent</span>
            </div>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Start exploring.</h1>
            <p className="text-slate-400 text-sm sm:text-base">Create an account and let AI plan your perfect trip.</p>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-200 group mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-500">or sign up with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 hover:bg-white/7 border border-white/15 hover:border-white/25 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
                placeholder="Aisha Khan"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 hover:bg-white/7 border border-white/15 hover:border-white/25 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/7 border border-white/15 hover:border-white/25 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${passwordStrength.length ? 'bg-green-500' : 'bg-slate-600'}`} />
                    <span className={`${passwordStrength.length ? 'text-slate-400' : 'text-slate-500'}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${passwordStrength.mixed ? 'bg-green-500' : 'bg-slate-600'}`} />
                    <span className={`${passwordStrength.mixed ? 'text-slate-400' : 'text-slate-500'}`}>
                      Mix of uppercase & lowercase
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !passwordStrength.length || !passwordStrength.mixed}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3 px-4 text-sm transition-all duration-200 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-400 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold">
              Sign in
            </Link>
          </p>

          {/* Features List */}
          <div className="mt-12 pt-8 border-t border-white/10 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What you get:</p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                AI-powered trip planning
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Flight & hotel search
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Day-by-day itineraries
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Hero Content (Desktop) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center px-12 relative z-10">
        <div className="max-w-lg">
          <h2 className="font-display text-5xl font-bold text-white mb-6 leading-tight">
            Your next adventure starts here.
          </h2>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Let AI handle the research. We'll find the best flights, hotels, and activities so you can focus on the experience.
          </p>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 font-semibold">✓</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">No credit card required</h3>
                <p className="text-sm text-slate-400">Start planning for free with full access to search and planning tools.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 font-semibold">✓</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Instant itineraries</h3>
                <p className="text-sm text-slate-400">Get AI-generated itineraries in seconds, tailored to your preferences.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 font-semibold">✓</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">One-click booking</h3>
                <p className="text-sm text-slate-400">Found something you love? Book directly from your itinerary.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

