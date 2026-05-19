'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import type { ToastItem } from '@/lib/types'

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info }

const STYLES: Record<ToastItem['type'], string> = {
  success: 'text-real border-real/20',
  error: 'text-fake border-fake/20',
  info: 'text-accent border-accent-border',
}

interface ItemProps extends ToastItem {
  onDismiss: (id: number) => void
}

function ToastNotification({ id, message, type, onDismiss }: ItemProps) {
  const Icon = ICONS[type]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl
                  bg-surface/90 backdrop-blur-xl max-w-sm ${STYLES[type]}`}
    >
      <Icon size={15} className="shrink-0" />
      <p className="text-sm text-foreground flex-1 leading-snug">{message}</p>
      <button onClick={() => onDismiss(id)} className="btn-icon w-6 h-6 -mr-1 shrink-0">
        <X size={12} />
      </button>
    </motion.div>
  )
}

interface ContainerProps {
  toasts: ToastItem[]
  dismiss: (id: number) => void
}

export default function ToastContainer({ toasts, dismiss }: ContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastNotification {...t} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
