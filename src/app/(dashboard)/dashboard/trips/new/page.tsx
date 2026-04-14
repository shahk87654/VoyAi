'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useTripStore } from '@/store/tripStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function NewTripPage() {
  const router = useRouter()
  const draft = useTripStore((s) => s.draft)
  const updateDraft = useTripStore((s) => s.updateDraft)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.destination || !draft.origin || !draft.startDate || !draft.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error('Failed to create trip')
      const { trip } = await res.json()
      toast.success('Trip created!')
      router.push(`/trips/${trip.id}`)
    } catch (error) {
      toast.error('Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Plan Your Trip</h1>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Origin</label>
              <Input
                placeholder="e.g., New York"
                value={draft.origin}
                onChange={(e) =>
                  updateDraft({ origin: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Destination</label>
              <Input
                placeholder="e.g., Paris"
                value={draft.destination}
                onChange={(e) =>
                  updateDraft({ destination: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={draft.startDate}
                onChange={(e) =>
                  updateDraft({ startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={draft.endDate}
                onChange={(e) =>
                  updateDraft({ endDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Number of Travelers
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={draft.travelers}
                onChange={(e) =>
                  updateDraft({ travelers: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Budget</label>
              <Input
                placeholder="e.g., moderate"
                value={draft.budget}
                onChange={(e) =>
                  updateDraft({ budget: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Travel Style (comma-separated)
            </label>
            <Input
              placeholder="e.g., adventure, food, culture"
              value={draft.style.join(', ')}
              onChange={(e) =>
                updateDraft({
                  style: e.target.value
                    .split(',')
                    .map((s) => s.trim()),
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Special Preferences
            </label>
            <Input
              placeholder="Any specific preferences?"
              value={draft.preferences}
              onChange={(e) =>
                updateDraft({ preferences: e.target.value })
              }
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
