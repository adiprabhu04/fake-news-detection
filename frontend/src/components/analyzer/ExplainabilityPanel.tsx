'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Info } from 'lucide-react'
import type { ExplainResponse, HighlightToken } from '@/lib/types'

interface Props {
  data: ExplainResponse
}

function FeatureBar({ word, score, direction, index }: { word: string; score: number; direction: 'fake' | 'real'; index: number }) {
  const absScore = Math.abs(score)
  const maxPct = 85
  const pct = Math.min(absScore * 300, maxPct)
  const isFake = direction === 'fake'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
      className="flex items-center gap-3 group"
    >
      <span className="text-xs font-mono text-secondary w-24 shrink-0 truncate text-right">
        {word}
      </span>
      <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.04 + 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundColor: isFake ? '#EF4444' : '#22C55E' }}
        />
      </div>
      <span
        className="text-xs font-mono w-14 shrink-0 text-right"
        style={{ color: isFake ? '#EF4444' : '#22C55E' }}
      >
        {isFake ? '+' : '−'}{absScore.toFixed(3)}
      </span>
    </motion.div>
  )
}

function WordHighlight({ token }: { token: HighlightToken }) {
  const [show, setShow] = useState(false)

  if (token.direction === 'neutral') {
    return <span className="text-secondary">{token.word}{' '}</span>
  }

  const isFake = token.direction === 'fake'
  return (
    <>
      {/* position:relative on an inline span creates a valid containing block for the tooltip */}
      <span className="relative" style={{ display: 'inline' }}>
        <span
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          className="cursor-default px-0.5 rounded-sm"
          style={{
            backgroundColor: isFake ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
            color: isFake ? '#EF4444' : '#22C55E',
            textDecorationLine: 'underline',
            textDecorationStyle: 'dotted',
            textDecorationColor: isFake ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)',
            textUnderlineOffset: '3px',
          }}
        >
          {token.word}
        </span>
        {show && (
          <span
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-xs font-mono whitespace-nowrap z-50 pointer-events-none border"
            style={{
              backgroundColor: '#191919',
              borderColor: 'rgba(255,255,255,0.1)',
              color: isFake ? '#EF4444' : '#22C55E',
            }}
          >
            {isFake ? '+' : '−'}{Math.abs(token.score).toFixed(3)}
          </span>
        )}
      </span>
      {' '}
    </>
  )
}

export default function ExplainabilityPanel({ data }: Props) {
  const [methodOpen, setMethodOpen] = useState(false)

  const topFeatures = data.word_importance.slice(0, 10)
  const fakeIndicators = data.fake_indicators.slice(0, 4)
  const realIndicators = data.real_indicators.slice(0, 4)

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Explainability Analysis</h3>
          <p className="text-xs text-muted">
            Feature importance via {data.method.toUpperCase()} — how each word influenced the prediction
          </p>
        </div>
        <span className="badge badge-accent shrink-0">{data.method.toUpperCase()}</span>
      </div>

      {/* Summary */}
      {data.summary && (
        <p className="text-sm text-secondary leading-relaxed border-l-2 border-accent/40 pl-3">
          {data.summary}
        </p>
      )}

      {/* Feature importance bars */}
      <div className="space-y-3">
        <p className="label-xs">Top feature weights</p>
        <div className="space-y-2.5">
          {topFeatures.map((f, i) => (
            <FeatureBar key={f.word} {...f} index={i} />
          ))}
        </div>
      </div>

      {/* Indicator chips */}
      {(fakeIndicators.length > 0 || realIndicators.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {fakeIndicators.length > 0 && (
            <div className="space-y-2">
              <p className="label-xs" style={{ color: 'rgba(239,68,68,0.7)' }}>Fake signals</p>
              <div className="flex flex-wrap gap-1.5">
                {fakeIndicators.map(f => (
                  <span
                    key={f.word}
                    className="px-2 py-0.5 rounded-md text-xs font-mono border"
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.08)',
                      borderColor: 'rgba(239,68,68,0.2)',
                      color: '#EF4444',
                    }}
                  >
                    {f.word}
                  </span>
                ))}
              </div>
            </div>
          )}
          {realIndicators.length > 0 && (
            <div className="space-y-2">
              <p className="label-xs" style={{ color: 'rgba(34,197,94,0.7)' }}>Real signals</p>
              <div className="flex flex-wrap gap-1.5">
                {realIndicators.map(f => (
                  <span
                    key={f.word}
                    className="px-2 py-0.5 rounded-md text-xs font-mono border"
                    style={{
                      backgroundColor: 'rgba(34,197,94,0.08)',
                      borderColor: 'rgba(34,197,94,0.2)',
                      color: '#22C55E',
                    }}
                  >
                    {f.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Word highlights */}
      {data.highlighted_text && data.highlighted_text.length > 0 && (
        <div className="space-y-2">
          <p className="label-xs">Highlighted text</p>
          <p
            className="text-sm leading-relaxed p-3 rounded-lg border border-line bg-surface-elevated break-words overflow-hidden"
            style={{ overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal' }}
          >
            {data.highlighted_text.map((token, i) => (
              <WordHighlight key={i} token={token} />
            ))}
          </p>
        </div>
      )}

      {/* Methodology accordion */}
      <div className="border-t border-line pt-4">
        <button
          onClick={() => setMethodOpen(v => !v)}
          className="flex items-center gap-2 text-xs text-muted hover:text-secondary transition-colors w-full text-left"
        >
          <Info size={12} />
          <span>How this works</span>
          <ChevronDown
            size={12}
            className={`ml-auto transition-transform duration-200 ${methodOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {methodOpen && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 text-xs text-muted leading-relaxed"
          >
            LIME (Local Interpretable Model-agnostic Explanations) perturbs the input text by
            randomly masking words and observing how the model's prediction changes. Words that
            most influence the prediction receive higher importance scores. Positive scores (red)
            push toward Fake; negative scores (green) push toward Real.
          </motion.p>
        )}
      </div>
    </div>
  )
}
