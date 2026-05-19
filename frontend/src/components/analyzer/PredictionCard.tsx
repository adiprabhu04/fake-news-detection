'use client'

import { useEffect, useState } from 'react'
import { Copy, CheckCheck } from 'lucide-react'
import type { PredictResponse } from '@/lib/types'

interface Props {
  result: PredictResponse
}

const MODEL_LABELS: Record<string, string> = {
  random_forest:       'Random Forest',
  logistic_regression: 'Logistic Regression',
  naive_bayes:         'Naive Bayes',
  lstm:                'LSTM Neural Network',
}

export default function PredictionCard({ result }: Props) {
  const { prediction, confidence, model_used } = result
  const isFake = prediction === 'Fake'
  const pct = Math.round(confidence * 100)

  const R = 38
  const CIRC = 2 * Math.PI * R
  const [dash, setDash] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDash(confidence * CIRC), 150)
    return () => clearTimeout(t)
  }, [confidence, CIRC])

  const ringColor = isFake ? '#EF4444' : '#22C55E'
  const badgeClass = isFake ? 'badge-fake' : 'badge-real'
  const labelColor = isFake ? 'text-fake' : 'text-real'

  function handleCopy() {
    navigator.clipboard.writeText(
      `TruthLens Analysis\nVerdict: ${prediction}\nConfidence: ${pct}%\nModel: ${MODEL_LABELS[model_used] ?? model_used}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="label-xs">Verdict</p>
          <p className={`text-4xl font-bold tracking-tight ${labelColor}`}>{prediction}</p>
          <span className={`badge ${badgeClass} mt-1`}>
            {pct}% confidence
          </span>
        </div>

        {/* Circular ring */}
        <div className="relative shrink-0 w-24 h-24">
          <svg width="96" height="96" className="-rotate-90">
            <circle
              cx="48" cy="48" r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            <circle
              cx="48" cy="48" r={R}
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - dash}
              style={{ transition: 'stroke-dashoffset 0.85s cubic-bezier(0.22,1,0.36,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${labelColor}`}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="label-xs">Confidence score</span>
          <span className="text-xs text-secondary font-mono">{(confidence).toFixed(4)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: ringColor,
            }}
          />
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-surface-elevated rounded-lg px-3 py-2.5 space-y-0.5">
          <p className="label-xs">Model</p>
          <p className="text-foreground font-medium truncate">
            {MODEL_LABELS[model_used] ?? model_used}
          </p>
        </div>
        <div className="bg-surface-elevated rounded-lg px-3 py-2.5 space-y-0.5">
          <p className="label-xs">Classification</p>
          <p className={`font-semibold ${labelColor}`}>{prediction} News</p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-line flex items-center justify-between">
        <span className="text-xs text-muted">TruthLens v2.0</span>
        <button
          onClick={handleCopy}
          className="btn-icon gap-1.5 text-xs px-2.5 h-7 rounded-md flex items-center"
        >
          {copied ? <CheckCheck size={13} className="text-real" /> : <Copy size={13} />}
          <span className={copied ? 'text-real' : 'text-secondary'}>
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>
    </div>
  )
}
