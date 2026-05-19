'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trash2, Link2, FileText } from 'lucide-react'
import type { HistoryItem } from '@/lib/types'

interface Props {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onClear: () => void
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function AnalysisHistory({ items, onSelect, onClear }: Props) {
  if (items.length === 0) return null

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-muted" />
          <span className="text-xs font-medium text-secondary">Recent analyses</span>
        </div>
        <button
          onClick={onClear}
          className="btn-icon h-6 w-6 text-muted hover:text-fake"
          title="Clear history"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {items.slice(0, 5).map(item => {
            const isFake = item.prediction === 'Fake'
            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12, scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={() => onSelect(item)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent
                           hover:bg-surface-elevated hover:border-line transition-all text-left group"
              >
                {item.tab === 'url'
                  ? <Link2 size={12} className="shrink-0 text-muted" />
                  : <FileText size={12} className="shrink-0 text-muted" />
                }
                <span className="flex-1 text-xs text-secondary truncate group-hover:text-foreground transition-colors">
                  {item.preview}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isFake ? '#EF4444' : '#22C55E' }}
                  >
                    {item.prediction}
                  </span>
                  <span className="text-xs text-muted font-mono">{Math.round(item.confidence * 100)}%</span>
                  <span className="text-xs text-muted">{timeAgo(item.ts)}</span>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
