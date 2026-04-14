'use client'

import React, { ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-rose-500/80 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-[var(--color-text)] mb-2">
              Something went wrong
            </h1>
            <p className="text-[var(--color-text-muted)] mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
