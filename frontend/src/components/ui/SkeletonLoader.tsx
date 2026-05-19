'use client'

import type { CSSProperties } from 'react'

interface BlockProps {
  className?: string
  style?: CSSProperties
}

export function SkeletonBlock({ className = '', style }: BlockProps) {
  return <div className={`skeleton ${className}`} style={style} />
}

export function PredictionSkeleton() {
  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-3 w-14" />
          <SkeletonBlock className="h-10 w-24" />
        </div>
        <SkeletonBlock className="w-24 h-24 rounded-full shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-3 w-10" />
        </div>
        <SkeletonBlock className="h-1.5 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SkeletonBlock className="h-14 rounded-lg" />
        <SkeletonBlock className="h-14 rounded-lg" />
      </div>
      <div className="pt-3 border-t border-line flex justify-between">
        <SkeletonBlock className="h-3 w-10" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
  )
}

export function ContextSignalsSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-3.5 w-32" />
          <SkeletonBlock className="h-2.5 w-44" />
        </div>
        <SkeletonBlock className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-1.5">
        {[0, 1, 2, 3].map(i => (
          <SkeletonBlock key={i} className="h-8 w-full rounded-lg" />
        ))}
      </div>
      <SkeletonBlock className="h-2.5 w-full" />
    </div>
  )
}

export function ExplainabilitySkeleton() {
  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-3 w-64" />
        </div>
        <SkeletonBlock className="h-6 w-14 rounded-full" />
      </div>
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
      </div>
      <div className="space-y-3">
        {[85, 72, 60, 50, 42, 35, 28].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock className="h-3 w-20 shrink-0" />
            <SkeletonBlock className="h-2 flex-1" style={{ maxWidth: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
