'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Globe2, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
    <div className="min-h-screen bg-navy-950 flex">
      <div className="flex-1 flex flex-col justify-center px-8 py-16 max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-navy-900" />
          </div>
          <span className="font-display text-xl font-bold text-white">VoyAI</span>
        </Link>

        <h1 className="font-display text-4xl font-bold text-white mb-2">Plan with AI.</h1>
        <p className="text-navy-400 text-base mb-10">Free account. No credit card needed.</p>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl py-3 px-4 text-sm font-medium transition-all mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-navy-400 mb-1.5">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-navy-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all"
              placeholder="Aisha Khan"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-navy-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-400 mb-1.5">Password (8+ characters)</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-navy-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-navy-900 font-semibold rounded-xl py-3 text-sm transition-all mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-navy-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/70 via-navy-950/30 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-3xl font-bold text-white leading-tight mb-3">
            "From idea to booked flights in under 5 minutes. Mind blown."
          </p>
          <p className="text-navy-300 text-sm">— Marcus T., London</p>
        </div>
      </div>
    </div>
  )
}
