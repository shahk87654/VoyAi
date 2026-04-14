'use client'

import { useState, useEffect } from 'react'
import { Plane, Plus, Trash2, Bell, TrendingDown, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'

interface FlightAlert {
  id: string
  origin: string
  destination: string
  targetPrice: number
  email: string
  departureDate?: string
  isActive: boolean
  createdAt: string
}

export default function FlightAlertsPage() {
  const [alerts, setAlerts] = useState<FlightAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [newAlert, setNewAlert] = useState({
    origin: '',
    destination: '',
    targetPrice: '',
    departureDate: '',
  })
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
        fetchAlerts(user.email)
      }
    }
    fetchUser()
  }, [])

  const fetchAlerts = async (email: string) => {
    try {
      const res = await fetch(`/api/alerts/flights?email=${email}`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAlert.origin || !newAlert.destination || !newAlert.targetPrice) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const res = await fetch('/api/alerts/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAlert,
          email: userEmail,
          targetPrice: parseFloat(newAlert.targetPrice),
        }),
      })

      if (res.ok) {
        const newData = await res.json()
        setAlerts([newData, ...alerts])
        setNewAlert({ origin: '', destination: '', targetPrice: '', departureDate: '' })
        toast.success('Price alert created!')
      }
    } catch (error) {
      toast.error('Failed to create alert')
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await fetch('/api/alerts/flights', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      })
      setAlerts(alerts.filter((a) => a.id !== alertId))
      toast.success('Alert deleted')
    } catch (error) {
      toast.error('Failed to delete alert')
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent border border-blue-500/30 backdrop-blur-sm">
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Bell className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">🔔 Price Alerts</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-text)]">
                Never Miss a Deal
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)]">
            Get notified when flight prices drop below your target price.
          </p>
        </div>
      </div>

      {/* Create New Alert */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Alert
        </h2>

        <form onSubmit={handleCreateAlert} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">From (IATA)</label>
            <input
              type="text"
              placeholder="LAX"
              value={newAlert.origin}
              onChange={(e) => setNewAlert({ ...newAlert, origin: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-blue-500 focus:outline-none"
              maxLength="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">To (IATA)</label>
            <input
              type="text"
              placeholder="NYC"
              value={newAlert.destination}
              onChange={(e) => setNewAlert({ ...newAlert, destination: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-blue-500 focus:outline-none"
              maxLength="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Target Price ($)</label>
            <input
              type="number"
              placeholder="200"
              value={newAlert.targetPrice}
              onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-blue-500 focus:outline-none"
              min="10"
              step="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Departure (Optional)</label>
            <input
              type="date"
              value={newAlert.departureDate}
              onChange={(e) => setNewAlert({ ...newAlert, departureDate: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="lg:col-span-4 sm:col-span-2 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            Create Alert
          </button>
        </form>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">Your Alerts ({alerts.length})</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bell className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
              <p className="text-[var(--color-text-muted)]">Loading alerts...</p>
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center justify-center py-12 rounded-2xl border-2 border-dashed border-[var(--color-border)]">
            <div className="text-center">
              <Plane className="w-12 h-12 text-[var(--color-text-muted)]/30 mx-auto mb-3" />
              <p className="text-[var(--color-text-muted)]">No price alerts yet. Create one above!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-[var(--color-text)]">{alert.origin}</span>
                      <Plane className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-[var(--color-text)]">{alert.destination}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="w-4 h-4 text-blue-400" />
                    <span className="text-[var(--color-text-muted)]">Target: </span>
                    <span className="font-semibold text-[var(--color-accent)]">${alert.targetPrice}</span>
                  </div>
                  {alert.departureDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-[var(--color-text-muted)]">
                        {new Date(alert.departureDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
