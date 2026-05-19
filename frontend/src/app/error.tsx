'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking in production
    if (process.env.NODE_ENV === 'production') return
    console.error('[TruthLens error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-fake-dim border border-fake-border
                        flex items-center justify-center mx-auto">
          <AlertTriangle size={20} className="text-fake" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-secondary leading-relaxed">
            An unexpected error occurred. You can try again or return to the home page.
          </p>
          {error.digest && (
            <p className="text-xs text-muted font-mono">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex items-center gap-3 justify-center">
          <button onClick={reset} className="btn-primary gap-2">
            <RotateCcw size={14} />
            Try again
          </button>
          <Link href="/" className="btn-ghost">
            Return home
          </Link>
        </div>
      </div>
    </div>
  )
}
