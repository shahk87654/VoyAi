'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { GeneratedItinerary, TripPlanRequest } from '@/types/ai'
import toast from 'react-hot-toast'

interface Props {
  onItineraryGenerated: (itinerary: GeneratedItinerary) => void
  request: TripPlanRequest
}

export function PlannerChat({ onItineraryGenerated, request }: Props) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [progress, setProgress] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const generatePlan = useCallback(async () => {
    setIsStreaming(true)
    setStreamedText('')
    setProgress(0)
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              // Parse final accumulated JSON
              try {
                const parsed = JSON.parse(accumulated) as GeneratedItinerary
                onItineraryGenerated(parsed)
                toast.success('Itinerary generated successfully!')
              } catch {
                toast.error('Failed to parse itinerary. Please try again.')
              }
              return
            }
            try {
              const { text } = JSON.parse(data)
              accumulated += text
              setStreamedText(accumulated)
              // Rough progress estimation
              setProgress(Math.min(95, Math.floor(accumulated.length / 80)))
            } catch {}
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error(error.message ?? 'Planning failed')
      }
    } finally {
      setIsStreaming(false)
      setProgress(0)
    }
  }, [request, onItineraryGenerated])

  return (
    <div className="space-y-4">
      {isStreaming && (
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>VoyAI is building your itinerary...</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {streamedText.slice(-120)}
          </p>
        </div>
      )}

      <Button
        onClick={
          isStreaming ? () => abortRef.current?.abort() : generatePlan
        }
        size="lg"
        variant={isStreaming ? 'destructive' : 'default'}
        className="w-full"
      >
        {isStreaming ? 'Stop generating' : 'Generate AI Itinerary'}
      </Button>
    </div>
  )
}
