'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

// ── heuristic data ────────────────────────────────────────────────────────────

const SENSATIONAL_PHRASES = [
  'breaking', 'shocking', 'secret', 'exposed', 'unbelievable',
  'here we go', 'bombshell', 'explosive', 'scandal', 'cover-up',
  "they don't want you to know", 'wake up sheeple', 'mainstream media lies',
  'deep state', 'they are hiding', 'urgent', 'must see', 'watch before deleted',
]

const TRUSTED_DOMAINS = [
  'reuters.com',
  'apnews.com',
  'bbc.com',
  'bbc.co.uk',
  'nytimes.com',
  'theguardian.com',
  'bloomberg.com',
  'whitehouse.gov',
  'blog.google',
  'npr.org',
  'wsj.com',
  'washingtonpost.com',
  'economist.com',
  'ft.com',
  'nature.com',
  'science.org',
]

// ── types ─────────────────────────────────────────────────────────────────────

type Status = 'positive' | 'warning' | 'neutral'

interface Signal {
  id: string
  label: string
  status: Status
}

interface Props {
  /** The article text that was analyzed */
  text: string
  /** The URL if URL mode was used, empty string otherwise */
  url: string
  tab: 'text' | 'url'
}

// ── helpers ───────────────────────────────────────────────────────────────────

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function countAllCapsWords(text: string): number {
  return (text.match(/\b[A-Z]{4,}\b/g) ?? []).length
}

// ── signal computation ────────────────────────────────────────────────────────

function computeSignals(text: string, url: string, tab: 'text' | 'url'): Signal[] {
  const lower = text.toLowerCase()
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const signals: Signal[] = []

  // 1. Sensational language
  const hasSensationalPhrase = SENSATIONAL_PHRASES.some(p => lower.includes(p))
  // All-caps phrase: 3+ consecutive words all-caps (e.g. "THEY ARE HIDING THIS")
  const hasAllCapsPhrase = /\b(?:[A-Z]{3,}\s+){2,}[A-Z]{3,}\b/.test(text)
  if (hasSensationalPhrase || hasAllCapsPhrase) {
    signals.push({ id: 'sensational', label: 'Sensational language detected', status: 'warning' })
  } else {
    signals.push({ id: 'sensational', label: 'No sensational language detected', status: 'positive' })
  }

  // 2. Source link present (URL mode only)
  if (tab === 'url' && url.trim()) {
    signals.push({ id: 'source', label: 'Source URL analyzed', status: 'positive' })

    // 3. Trusted domain check (only meaningful when we have a URL)
    const hostname = extractHostname(url)
    const isTrusted =
      hostname.length > 0 &&
      TRUSTED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))

    signals.push({
      id: 'domain',
      label: isTrusted ? 'Recognized credible source' : 'Source credibility unverified',
      status: isTrusted ? 'positive' : 'warning',
    })
  }

  // 4. Article length
  if (wordCount > 0 && wordCount < 80) {
    signals.push({ id: 'length', label: 'Very short article — low context available', status: 'warning' })
  } else if (wordCount >= 80) {
    signals.push({ id: 'length', label: `Article length adequate (${wordCount} words)`, status: 'positive' })
  }

  // 5. Emotional intensity
  const exclamations = (text.match(/!/g) ?? []).length
  const questions = (text.match(/\?/g) ?? []).length
  // emoji detection via unicode ranges
  const emojiCount = (text.match(/\p{Emoji_Presentation}/gu) ?? []).length
  const allCapsCount = countAllCapsWords(text)
  const allCapsFraction = wordCount > 0 ? allCapsCount / wordCount : 0

  const highIntensity =
    exclamations > 3 ||
    questions > 4 ||
    emojiCount > 2 ||
    (allCapsFraction > 0.08 && wordCount > 20)

  if (highIntensity) {
    signals.push({ id: 'intensity', label: 'High emotional intensity in writing style', status: 'warning' })
  } else {
    signals.push({ id: 'intensity', label: 'Measured writing tone', status: 'positive' })
  }

  return signals
}

// ── sub-components ────────────────────────────────────────────────────────────

const ICON = {
  positive: CheckCircle2,
  warning:  AlertTriangle,
  neutral:  Info,
} as const

const COLOR: Record<Status, string> = {
  positive: '#22C55E',
  warning:  '#F59E0B',
  neutral:  '#71717A',
}

const BG: Record<Status, string> = {
  positive: 'rgba(34,197,94,0.08)',
  warning:  'rgba(245,158,11,0.08)',
  neutral:  'rgba(113,113,122,0.06)',
}

const BORDER: Record<Status, string> = {
  positive: 'rgba(34,197,94,0.2)',
  warning:  'rgba(245,158,11,0.2)',
  neutral:  'rgba(255,255,255,0.06)',
}

function SignalRow({ signal, index }: { signal: Signal; index: number }) {
  const Icon = ICON[signal.status]
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25, ease: 'easeOut' }}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
      style={{
        backgroundColor: BG[signal.status],
        border: `1px solid ${BORDER[signal.status]}`,
      }}
    >
      <Icon
        size={13}
        strokeWidth={2.2}
        style={{ color: COLOR[signal.status], flexShrink: 0 }}
      />
      <span className="text-xs text-secondary leading-snug">{signal.label}</span>
    </motion.div>
  )
}

// ── main export ───────────────────────────────────────────────────────────────

export default function ContextSignals({ text, url, tab }: Props) {
  const signals = useMemo(
    () => computeSignals(text, url, tab),
    [text, url, tab],
  )

  const positiveCount = signals.filter(s => s.status === 'positive').length
  const warningCount  = signals.filter(s => s.status === 'warning').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
      className="card p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">Context Signals</h3>
          <p className="text-xs text-muted">Heuristic credibility indicators</p>
        </div>
        <div className="flex items-center gap-1.5">
          {warningCount > 0 && (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full border"
              style={{
                color: '#F59E0B',
                backgroundColor: 'rgba(245,158,11,0.1)',
                borderColor: 'rgba(245,158,11,0.25)',
              }}
            >
              {warningCount} caution
            </span>
          )}
          {positiveCount > 0 && (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full border"
              style={{
                color: '#22C55E',
                backgroundColor: 'rgba(34,197,94,0.08)',
                borderColor: 'rgba(34,197,94,0.2)',
              }}
            >
              {positiveCount} positive
            </span>
          )}
        </div>
      </div>

      {/* Signal rows */}
      <div className="space-y-1.5">
        {signals.map((s, i) => (
          <SignalRow key={s.id} signal={s} index={i} />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted leading-relaxed border-t border-line pt-3">
        Signals are heuristic indicators and not definitive fact verification.
      </p>
    </motion.div>
  )
}
