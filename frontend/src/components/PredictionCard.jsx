import { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="btn-icon"
      title="Copy result"
    >
      {copied ? <Check size={13} className="text-real" /> : <Copy size={13} />}
    </button>
  )
}

export default function PredictionCard({ prediction, confidence, model_used }) {
  const isFake = prediction === 'Fake'
  const pct = Math.round(confidence * 100)
  const [barWidth, setBarWidth] = useState(0)

  // Delay the bar animation so CSS transition actually fires
  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 80)
    return () => clearTimeout(t)
  }, [pct])

  const strength =
    pct >= 95 ? 'Very high' : pct >= 85 ? 'High' : pct >= 70 ? 'Moderate' : 'Low'

  const copyText = `Verdict: ${prediction} (${pct}% confidence)\nModel: ${model_used}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`card p-6 ${isFake ? 'border-fake/30' : 'border-real/30'}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="label-xs mb-2">Verdict</p>
          <p className={`text-4xl font-bold tracking-tight leading-none ${isFake ? 'text-fake' : 'text-real'}`}>
            {prediction}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={isFake ? 'badge-fake' : 'badge-real'}>
            {isFake ? 'Misinformation' : 'Credible'}
          </span>
          <CopyButton text={copyText} />
        </div>
      </div>

      {/* Confidence meter */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-secondary text-xs">{strength} confidence</span>
          <span className="font-mono text-xs text-primary font-semibold tabular-nums">{pct}%</span>
        </div>
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isFake ? 'bg-fake' : 'bg-real'}`}
            style={{
              width: `${barWidth}%`,
              transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      </div>

      {/* Probability breakdown */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-bg-elevated rounded-lg px-3 py-2 text-center">
          <p className="text-fake text-sm font-semibold tabular-nums">
            {isFake ? pct : 100 - pct}%
          </p>
          <p className="text-dim text-xs mt-0.5">Fake prob.</p>
        </div>
        <div className="flex-1 bg-bg-elevated rounded-lg px-3 py-2 text-center">
          <p className="text-real text-sm font-semibold tabular-nums">
            {isFake ? 100 - pct : pct}%
          </p>
          <p className="text-dim text-xs mt-0.5">Real prob.</p>
        </div>
      </div>

      {/* Meta */}
      <div className="pt-4 border-t border-line flex items-center justify-between">
        <span className="text-dim text-xs">Model</span>
        <span className="text-secondary text-xs font-medium font-mono">{model_used}</span>
      </div>
    </motion.div>
  )
}
