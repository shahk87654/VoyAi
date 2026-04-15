'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Clock, Wallet, MapPin, Navigation2, Calendar, Users, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'

interface TripDetails {
  destination: string
  days: number
  travelers: number
  startDate: string
  budget: string
  interests: string[]
}

const interests = ['Beach', 'Culture', 'Food', 'Adventure', 'Shopping', 'Nightlife', 'Nature', 'History']

const interestIcons: Record<string, React.ReactNode> = {
  'Beach': '🏖️',
  'Culture': '🎭',
  'Food': '🍽️',
  'Adventure': '🏔️',
  'Shopping': '🛍️',
  'Nightlife': '🌙',
  'Nature': '🌲',
  'History': '📚',
}

export default function TripBuilderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TripDetails>({
    destination: '',
    days: 3,
    travelers: 1,
    startDate: '',
    budget: 'medium',
    interests: [],
  })

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async () => {
    if (!formData.destination || !formData.startDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Generating your perfect itinerary with AI...')
    
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
        return
      }

      // Calculate end date based on duration
      const startDate = new Date(formData.startDate)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + formData.days)

      // Call AI planning endpoint
      const aiResponse = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: formData.destination,
          origin: 'San Francisco',
          startDate: formData.startDate,
          endDate: endDate.toISOString().split('T')[0],
          travelers: formData.travelers,
          budget: formData.budget,
          style: formData.interests,
        }),
      })

      if (!aiResponse.ok) {
        const error = await aiResponse.json()
        console.error('AI API Error:', aiResponse.status, error)
        throw new Error(error.error || error.details || 'Failed to generate itinerary')
      }

      // Read the streaming response
      const reader = aiResponse.body?.getReader()
      const decoder = new TextDecoder()
      let itineraryText = ''
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                itineraryText += parsed.text || ''
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Extract JSON from the response text
      let itinerary = {}
      try {
        const jsonMatch = itineraryText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          itinerary = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error('Failed to parse itinerary JSON:', e)
      }

      // Save trip with generated itinerary
      const tripResponse = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${formData.destination} Trip`,
          destination: formData.destination,
          origin: 'San Francisco',
          startDate: formData.startDate,
          endDate: endDate.toISOString().split('T')[0],
          travelers: formData.travelers,
          budget: formData.budget,
          style: formData.interests,
          aiItinerary: itinerary,
        }),
      })

      if (!tripResponse.ok) {
        throw new Error('Failed to save trip')
      }

      const { trip } = await tripResponse.json()
      
      toast.dismiss(loadingToast)
      toast.success('Trip created! Redirecting...')
      
      // Redirect to the new trip
      setTimeout(() => {
        router.push(`/dashboard/trips/${trip.id}`)
      }, 1000)
    } catch (error) {
      toast.dismiss(loadingToast)
      const message = error instanceof Error ? error.message : 'Failed to create trip'
      toast.error(message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-[var(--color-text)] flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-[var(--color-accent)]/10">
            <Sparkles className="w-8 h-8 text-[var(--color-accent)]" />
          </div>
          Plan Your Trip
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg">Step <span className="font-bold text-[var(--color-accent)]">{step}</span> of <span className="font-bold">3</span> • Let's create your perfect itinerary</p>
      </div>

      {/* Enhanced Progress Bar with Steps */}
      <div className="mb-12">
        <div className="flex gap-3 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 flex gap-2 items-center">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all duration-300 ${
                s <= step
                  ? 'bg-[var(--color-accent)] text-white shadow-md'
                  : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  s < step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide">
          {step === 1 && 'Destination & Dates'}
          {step === 2 && 'Budget Range'}
          {step === 3 && 'Your Interests'}
        </div>
      </div>

      {/* Step 1: Destination & Dates */}
      {step === 1 && (
        <Card className="rounded-2xl p-8 border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg animate-in fade-in-50 duration-300">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-[var(--color-accent)]" />
                Where would you like to go? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                placeholder="e.g., Tokyo, Paris, Bali..."
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:bg-[var(--color-surface)] transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <Clock size={16} className="text-[var(--color-accent)]" />
                When does your trip start? <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:bg-[var(--color-surface)] transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-[var(--color-accent)]" />
                  Duration (days)
                </label>
                <div className="flex items-center gap-4 bg-[var(--color-bg)] rounded-xl p-3 border border-[var(--color-border)]">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, days: Math.max(1, prev.days - 1) }))}
                    className="w-10 h-10 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white transition-all duration-200 font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-2xl font-display font-bold text-[var(--color-text)]">{formData.days}</span>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, days: prev.days + 1 }))}
                    className="w-10 h-10 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white transition-all duration-200 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Users size={16} className="text-[var(--color-accent)]" />
                  Number of travelers
                </label>
                <div className="flex items-center gap-4 bg-[var(--color-bg)] rounded-xl p-3 border border-[var(--color-border)]">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                    className="w-10 h-10 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white transition-all duration-200 font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-2xl font-display font-bold text-[var(--color-text)]">{formData.travelers}</span>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, travelers: prev.travelers + 1 }))}
                    className="w-10 h-10 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white transition-all duration-200 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Budget */}
      {step === 2 && (
        <Card className="rounded-2xl p-8 border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg animate-in fade-in-50 duration-300">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
              <Wallet size={16} className="text-[var(--color-accent)]" />
              What's your budget?
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'budget', label: 'Budget', icon: '$', desc: 'Backpacker' },
                { key: 'medium', label: 'Medium', icon: '$$', desc: 'Comfortable' },
                { key: 'luxury', label: 'Luxury', icon: '$$$', desc: 'Premium' }
              ].map(budget => (
                <button
                  key={budget.key}
                  onClick={() => setFormData(prev => ({ ...prev, budget: budget.key }))}
                  className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    formData.budget === budget.key
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-md'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  <div className="text-2xl mb-2">{budget.icon}</div>
                  <div className="font-display font-bold text-[var(--color-text)] mb-1">{budget.label}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{budget.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Interests */}
      {step === 3 && (
        <Card className="rounded-2xl p-8 border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg animate-in fade-in-50 duration-300">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
              <Navigation2 size={16} className="text-[var(--color-accent)]" />
              What are you interested in?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    formData.interests.includes(interest)
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-md'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  <div className="text-2xl mb-2">{interestIcons[interest]}</div>
                  <div className="text-sm font-semibold">{interest}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-10">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-3 bg-[var(--color-bg)] text-[var(--color-text)] rounded-xl font-medium border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-bg-muted)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 px-6 py-3 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:bg-amber-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:bg-amber-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Itinerary
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
