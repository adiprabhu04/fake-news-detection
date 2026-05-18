import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { ChevronDown, Info } from 'lucide-react'

const FAKE_COLOR = '#ef4444'
const REAL_COLOR = '#22c55e'

// ---------------------------------------------------------------------------
// Summary generator
// ---------------------------------------------------------------------------
function buildSummary(prediction, confidence, word_importance) {
  if (!prediction || !word_importance?.length) return null

  const pct = Math.round(confidence * 100)
  const strength = pct >= 95 ? 'very strong' : pct >= 85 ? 'strong' : pct >= 70 ? 'moderate' : 'weak'
  const isFake = prediction === 'Fake'

  const topFake = word_importance.filter(w => w.direction === 'fake').slice(0, 2)
  const topReal = word_importance.filter(w => w.direction === 'real').slice(0, 2)

  const fakeTerms = topFake.map(w => `"${w.word}"`).join(' and ')
  const realTerms = topReal.map(w => `"${w.word}"`).join(' and ')

  const parts = []
  if (isFake) {
    parts.push(`This article has ${strength} misinformation signals (${pct}% confidence).`)
    if (fakeTerms) parts.push(`Key fake indicators: ${fakeTerms}.`)
    if (realTerms) parts.push(`Credibility signals detected: ${realTerms}.`)
  } else {
    parts.push(`This article has ${strength} credibility signals (${pct}% confidence).`)
    if (realTerms) parts.push(`Key real indicators: ${realTerms}.`)
    if (fakeTerms) parts.push(`Some ambiguous signals: ${fakeTerms}.`)
  }

  return parts.join(' ')
}

// ---------------------------------------------------------------------------
// Word highlighter
// ---------------------------------------------------------------------------
function WordHighlighter({ tokens, maxWords = 150 }) {
  const visible = tokens.slice(0, maxWords)
  const hasMore = tokens.length > maxWords

  return (
    <div>
      <div className="flex flex-wrap gap-x-1 gap-y-0.5 leading-[1.9]">
        {visible.map((t, i) => {
          const abs = Math.abs(t.score)
          const intensity = Math.min(abs * 8 + 0.06, 0.9)

          const bg =
            t.direction === 'fake'
              ? `rgba(239,68,68,${intensity * 0.3})`
              : t.direction === 'real'
              ? `rgba(34,197,94,${intensity * 0.3})`
              : 'transparent'

          const underlineColor =
            t.direction === 'fake'
              ? `rgba(239,68,68,${Math.min(intensity * 0.9, 0.8)})`
              : t.direction === 'real'
              ? `rgba(34,197,94,${Math.min(intensity * 0.9, 0.8)})`
              : 'transparent'

          const isHighlighted = t.direction !== 'neutral'

          return (
            <span
              key={i}
              className="px-0.5 rounded-[3px] text-[13px] text-primary cursor-default"
              style={{
                backgroundColor: bg,
                borderBottom: isHighlighted ? `2px solid ${underlineColor}` : undefined,
                transition: 'background-color 0.15s',
              }}
              title={isHighlighted ? `${t.direction} signal · score ${t.score > 0 ? '+' : ''}${t.score.toFixed(4)}` : undefined}
            >
              {t.word}
            </span>
          )
        })}
      </div>
      {hasMore && (
        <p className="text-dim text-xs mt-2">
          Showing first {maxWords} of {tokens.length} tokens
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Custom chart tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-bg-card border border-strong rounded-lg px-3 py-2.5 text-xs shadow-2xl">
      <p className="text-primary font-semibold mb-1">"{d.word}"</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.direction === 'fake' ? FAKE_COLOR : REAL_COLOR }} />
        <span className={d.direction === 'fake' ? 'text-fake' : 'text-real'}>{d.direction}</span>
        <span className="text-dim">·</span>
        <span className="text-secondary font-mono">{d.abs_score.toFixed(4)}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Methodology expandable section
// ---------------------------------------------------------------------------
function Methodology() {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-line pt-4">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 text-secondary hover:text-primary text-xs transition-colors"
      >
        <Info size={12} />
        How this works
        <ChevronDown
          size={12}
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2 text-xs text-dim leading-relaxed">
              <p>
                <span className="text-secondary font-medium">LIME</span> (Local Interpretable Model-agnostic Explanations)
                creates {300} random perturbations of the input text by masking words, runs each through the model,
                and fits a linear surrogate to estimate each word's contribution.
              </p>
              <p>
                Positive scores (red) push the model toward <span className="text-fake">Fake</span>.
                Negative scores (green) push toward <span className="text-real">Real</span>.
                Bar length encodes magnitude of influence.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ExplainabilityPanel({ explanation, prediction, confidence }) {
  const {
    word_importance = [],
    fake_indicators = [],
    real_indicators = [],
    highlighted_text = [],
    summary,
  } = explanation

  const chartData = [...word_importance]
    .map(d => ({
      ...d,
      abs_score: Math.abs(d.score),
      display: d.word.length > 13 ? d.word.slice(0, 12) + '…' : d.word,
    }))
    .sort((a, b) => b.abs_score - a.abs_score)
    .slice(0, 12)

  const generatedSummary = buildSummary(prediction, confidence, word_importance) || summary

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card p-6 space-y-7"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-primary text-sm font-semibold">Explainability Dashboard</h3>
          <p className="text-dim text-xs mt-0.5">LIME · local interpretable model-agnostic explanations</p>
        </div>
        <span className="badge-accent">LIME</span>
      </div>

      {/* Analysis summary */}
      {generatedSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-bg-elevated rounded-xl p-4 border border-line"
        >
          <p className="label-xs mb-2">Analysis Summary</p>
          <p className="text-secondary text-sm leading-relaxed">{generatedSummary}</p>
        </motion.div>
      )}

      {/* Feature importance chart */}
      <div>
        <p className="label-xs mb-4">Feature Importance</p>
        <ResponsiveContainer width="100%" height={chartData.length * 28 + 16}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fill: '#52525b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => v.toFixed(2)}
            />
            <YAxis
              type="category"
              dataKey="display"
              tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              width={94}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.08)" />
            <Bar dataKey="abs_score" radius={[0, 3, 3, 0]} maxBarSize={18} animationDuration={600}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.direction === 'fake' ? FAKE_COLOR : REAL_COLOR}
                  fillOpacity={0.72}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex gap-5 mt-2.5">
          {[['fake', FAKE_COLOR, 'Fake signal'], ['real', REAL_COLOR, 'Real signal']].map(([, color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color, opacity: 0.72 }} />
              <span className="text-dim text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Word-level highlights */}
      {highlighted_text.length > 0 && (
        <div>
          <p className="label-xs mb-3">Article Highlights</p>
          <div className="bg-bg-elevated rounded-xl p-4 max-h-56 overflow-y-auto border border-line">
            <WordHighlighter tokens={highlighted_text} />
          </div>
          <p className="text-dim text-xs mt-2">Hover highlighted words to see their contribution score</p>
        </div>
      )}

      {/* Signal lists */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Fake Indicators',
            items: fake_indicators,
            textColor: 'text-fake',
            bg: 'bg-fake-dim',
            score_color: 'text-fake',
          },
          {
            label: 'Real Indicators',
            items: real_indicators,
            textColor: 'text-real',
            bg: 'bg-real-dim',
            score_color: 'text-real',
          },
        ].map(({ label, items, textColor, bg, score_color }) => (
          <div key={label}>
            <p className={`text-xs font-medium mb-2.5 uppercase tracking-widest ${textColor}`}>{label}</p>
            <div className="space-y-1.5">
              {items.length === 0 ? (
                <p className="text-muted text-xs italic pl-1">None detected</p>
              ) : (
                items.slice(0, 6).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center justify-between px-3 py-1.5 ${bg} rounded-lg`}
                  >
                    <span className="text-primary text-xs truncate mr-2 font-medium">{item.word}</span>
                    <span className={`font-mono text-xs ${score_color} tabular-nums`}>
                      {item.score.toFixed(3)}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <Methodology />
    </motion.div>
  )
}
