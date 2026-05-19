'use client'

import { useState, useCallback } from 'react'
import type { ToastItem } from '@/lib/types'

let _id = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback(
    (message: string, type: ToastItem['type'] = 'info', duration = 4000) => {
      const id = ++_id
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
      return id
    },
    [],
  )

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}
