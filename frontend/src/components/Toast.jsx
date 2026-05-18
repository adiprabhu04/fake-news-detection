import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const COLORS = {
  success: 'text-real border-real/20 bg-real-dim',
  error: 'text-fake border-fake/20 bg-fake-dim',
  info: 'text-accent border-accent/20 bg-accent-dim',
}

function ToastItem({ id, message, type, onDismiss }) {
  const Icon = ICONS[type] || Info
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl
                  backdrop-blur-xl bg-bg-card/90 max-w-sm ${COLORS[type]}`}
    >
      <Icon size={15} className="shrink-0" />
      <p className="text-sm text-primary flex-1">{message}</p>
      <button onClick={() => onDismiss(id)} className="btn-icon -mr-1 w-6 h-6">
        <X size={12} />
      </button>
    </motion.div>
  )
}

export default function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
