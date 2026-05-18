export function SkeletonBlock({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} />
}

export function PredictionSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-14" />
          <SkeletonBlock className="h-9 w-24" />
        </div>
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-10" />
        </div>
        <SkeletonBlock className="h-1.5 w-full rounded-full" />
      </div>
      <div className="pt-4 border-t border-line flex justify-between">
        <SkeletonBlock className="h-3 w-10" />
        <SkeletonBlock className="h-3 w-20" />
      </div>
    </div>
  )
}

export function ExplainabilitySkeleton() {
  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-3 w-56" />
        </div>
        <SkeletonBlock className="h-6 w-14 rounded-full" />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
      </div>

      {/* Chart bars */}
      <div className="space-y-3">
        {[80, 65, 55, 45, 38, 30].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className={`h-4`} style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
