'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Settings, Compass, Plus, LayoutDashboard, MapPin, Zap, Menu, X } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
        } else {
          setUser(user)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-[var(--color-bg)]" />
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/trips', label: 'My Trips', icon: MapPin },
    { href: '/builder', label: 'Plan Trip', icon: Plus },
  ]

  return (
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface)] border-r border-[var(--color-border)] flex-col shadow-lg">
        <SidebarContent navItems={navItems} pathname={pathname} handleLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shadow-lg transform transition-transform duration-300 z-50 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent navItems={navItems} pathname={pathname} handleLogout={handleLogout} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface)] border-b border-[var(--color-border)] px-4 flex items-center justify-between shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-accent)] to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--color-accent)]">VoyAI</span>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="w-full h-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navItems, pathname, handleLogout, onNavigate }: any) => (
  <>
    {/* Logo */}
    <div className="p-6 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent)] to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold text-[var(--color-accent)]">VoyAI</h1>
      </div>
    </div>

    {/* Nav Items */}
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map(({ href, label, icon: Icon }: any) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
              isActive
                ? 'bg-gradient-to-r from-[var(--color-accent)] to-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent)]/10'
            }`}
          >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              <Icon size={20} />
            </div>
            <span className="text-sm font-semibold">{label}</span>
            {isActive && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l" />
            )}
          </Link>
        )
      })}
    </nav>

    {/* Upgrade Section */}
    <div className="p-4 border-t border-[var(--color-border)]">
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-[var(--color-accent)]/30 rounded-xl p-4 mb-4 text-center hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wide">Pro Plan</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">Unlock AI-powered trip planning</p>
        <button className="w-full px-3 py-2 bg-gradient-to-r from-[var(--color-accent)] to-amber-600 text-white rounded-lg font-semibold text-xs hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95">
          Upgrade Now
        </button>
      </div>

      {/* Settings & Logout */}
      <div className="space-y-2">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/settings'
              ? 'bg-gradient-to-r from-[var(--color-accent)] to-amber-500 text-white shadow-lg'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent)]/10'
          }`}
        >
          <Settings size={20} />
          <span className="text-sm font-semibold">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 font-semibold text-sm"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </>
)

export default DashboardLayout
