import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronRight } from 'lucide-react'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function AnalysisHistory({ history, onRestore }) {
  if (!history.length) return null

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={13} className="text-dim" />
        <p className="label-xs">Recent Analyses</p>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {history.map((item, i) => {
            const isFake = item.prediction === 'Fake'
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onRestore(item)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl
                           bg-bg-card border border-line
                           hover:border-strong hover:bg-bg-hover
                           transition-colors duration-150 text-left group"
              >
                {/* Verdict dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${isFake ? 'bg-fake' : 'bg-real'}`} />

                {/* Preview text */}
                <p className="text-secondary text-xs truncate flex-1 group-hover:text-primary transition-colors">
                  {item.preview}
                </p>

                {/* Verdict badge */}
                <span className={`text-xs font-semibold tabular-nums shrink-0 ${isFake ? 'text-fake' : 'text-real'}`}>
                  {item.prediction} {Math.round(item.confidence * 100)}%
                </span>

                <span className="text-muted text-xs shrink-0 hidden sm:block">{timeAgo(item.ts)}</span>
                <ChevronRight size={12} className="text-muted shrink-0 group-hover:text-secondary transition-colors" />
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
