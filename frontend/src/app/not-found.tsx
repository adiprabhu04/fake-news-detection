import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-line
                        flex items-center justify-center mx-auto">
          <Search size={20} className="text-muted" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted font-mono uppercase tracking-widest">404</p>
          <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
          <p className="text-sm text-secondary leading-relaxed">
            This page does not exist or has been moved.
          </p>
        </div>

        <Link href="/" className="btn-primary inline-flex">
          Return home
        </Link>
      </div>
    </div>
  )
}
