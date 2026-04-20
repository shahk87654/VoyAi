'use client'

import { useState } from 'react'
import { FileDown, Share2, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureGate } from '@/components/paywall/FeatureGate'
import { usePermissions } from '@/hooks/usePermissions'

/**
 * PDF Export Button - Gate behind Pro feature
 */
interface ExportPDFProps {
  tripId: string
  tripTitle: string
  onExport?: () => void
}

export function ExportPDFButton({
  tripId,
  tripTitle,
  onExport,
}: ExportPDFProps) {
  const { hasFeature } = usePermissions()
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${tripTitle}-itinerary.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onExport?.()
    } catch (error) {
      console.error('PDF export error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FeatureGate feature="pdfExport">
      <Button
        onClick={handleExport}
        disabled={loading}
        size="sm"
        variant="outline"
      >
        <FileDown className="h-4 w-4 mr-2" />
        {loading ? 'Exporting...' : 'Export PDF'}
      </Button>
    </FeatureGate>
  )
}

/**
 * Share Trip - Gate behind Pro feature
 */
interface ShareTripProps {
  tripId: string
  tripTitle: string
}

export function ShareTrip({ tripId, tripTitle }: ShareTripProps) {
  const { hasFeature } = usePermissions()
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerateLink = async () => {
    try {
      const response = await fetch('/api/trips/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      })

      if (!response.ok) throw new Error('Share failed')

      const { token } = await response.json()
      const url = `${window.location.origin}/shared/trips/${token}`
      setShareUrl(url)
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <FeatureGate feature="sharing">
      <div className="space-y-3">
        <Button
          onClick={handleGenerateLink}
          disabled={!!shareUrl}
          size="sm"
          className="w-full"
        >
          <Share2 className="h-4 w-4 mr-2" />
          {shareUrl ? 'Link Generated' : 'Generate Share Link'}
        </Button>

        {shareUrl && (
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm"
            />
            <Button onClick={handleCopyLink} size="sm">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}

/**
 * Trip Collaboration - Gate behind Pro feature
 */
interface CollaborationProps {
  tripId: string
  currentCollaborators?: Array<{ id: string; email: string; role: string }>
}

export function TripCollaboration({
  tripId,
  currentCollaborators = [],
}: CollaborationProps) {
  const { hasFeature } = usePermissions()
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!inviteEmail) return

    setLoading(true)
    try {
      const response = await fetch('/api/trips/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          collaboratorEmail: inviteEmail,
          role: 'editor',
        }),
      })

      if (!response.ok) throw new Error('Invite failed')

      setInviteEmail('')
      // Refresh collaborators list
      window.location.reload()
    } catch (error) {
      console.error('Collaboration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FeatureGate feature="collaboration">
      <div className="space-y-4">
        {/* Current Collaborators */}
        {currentCollaborators.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-slate-900">
              Collaborators
            </h4>
            <div className="space-y-2">
              {currentCollaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded"
                >
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-700">{collab.email}</span>
                  <span className="ml-auto text-xs text-slate-500">
                    {collab.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Collaborator */}
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="collaborator@example.com"
            className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm"
          />
          <Button
            onClick={handleInvite}
            disabled={!inviteEmail || loading}
            size="sm"
          >
            {loading ? 'Inviting...' : 'Invite'}
          </Button>
        </div>
      </div>
    </FeatureGate>
  )
}

/**
 * Usage warning for free tier
 */
export function FreeTrialWarning() {
  const { plan, plansThisMonth, getPlanLimitMessage } = usePermissions()

  if (plan !== 'FREE') return null

  const tripsLimit = 3
  const remaining = tripsLimit - plansThisMonth

  if (remaining > 1) return null

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-amber-900 text-sm">
          {remaining === 1
            ? 'Last free trip plan available!'
            : 'Monthly limit reached'}
        </h4>
        <p className="text-sm text-amber-800 mt-1">
          {getPlanLimitMessage('aiPlans')}. Upgrade to Pro for unlimited trip
          planning.
        </p>
      </div>
    </div>
  )
}
