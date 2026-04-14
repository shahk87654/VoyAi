'use client'

export function SkeletonLoader() {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-[var(--color-bg-muted)] rounded-lg w-2/3" />
        <div className="h-4 bg-[var(--color-bg-muted)] rounded-lg w-full" />
        <div className="h-4 bg-[var(--color-bg-muted)] rounded-lg w-4/5" />
        <div className="h-10 bg-[var(--color-bg-muted)] rounded-lg w-1/3 mt-6" />
      </div>
    </div>
  )
}

export function FlightCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-[var(--color-bg-muted)] rounded-lg w-1/3" />
        <div className="h-5 bg-[var(--color-bg-muted)] rounded-lg w-20" />
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-8 bg-[var(--color-bg-muted)] rounded-lg w-1/4" />
        <div className="h-6 bg-[var(--color-bg-muted)] rounded-lg w-full" />
        <div className="h-8 bg-[var(--color-bg-muted)] rounded-lg w-1/4" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <div className="h-8 bg-[var(--color-bg-muted)] rounded-lg w-1/4" />
        <div className="h-9 bg-[var(--color-bg-muted)] rounded-lg w-24" />
      </div>
    </div>
  )
}

export function HotelCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden animate-pulse">
      <div className="h-40 bg-[var(--color-bg-muted)]" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-[var(--color-bg-muted)] rounded-lg" />
        <div className="h-4 bg-[var(--color-bg-muted)] rounded-lg w-2/3" />
        <div className="flex gap-2">
          <div className="h-5 bg-[var(--color-bg-muted)] rounded-lg flex-1" />
          <div className="h-5 bg-[var(--color-bg-muted)] rounded-lg flex-1" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <div className="h-8 bg-[var(--color-bg-muted)] rounded-lg w-1/4" />
          <div className="h-9 bg-[var(--color-bg-muted)] rounded-lg w-20" />
        </div>
      </div>
    </div>
  )
}

export function DayItinerarySkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-border)]">
        <div className="w-12 h-12 bg-[var(--color-bg-muted)] rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-[var(--color-bg-muted)] rounded-lg w-1/3" />
          <div className="h-4 bg-[var(--color-bg-muted)] rounded-lg w-1/4" />
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-[var(--color-bg-muted)] rounded-full" />
              {i !== 3 && <div className="w-0.5 h-16 bg-[var(--color-border)] my-2" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--color-bg-muted)] rounded-lg w-1/4" />
              <div className="h-5 bg-[var(--color-bg-muted)] rounded-lg w-1/2" />
              <div className="h-4 bg-[var(--color-bg-muted)] rounded-lg w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
