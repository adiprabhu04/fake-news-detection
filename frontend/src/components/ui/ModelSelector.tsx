'use client'

import { ChevronDown } from 'lucide-react'
import type { ModelId } from '@/lib/types'

const MODELS: { id: ModelId; label: string; tag: string }[] = [
  { id: 'random_forest',       label: 'Random Forest',        tag: 'Classical' },
  { id: 'logistic_regression', label: 'Logistic Regression',  tag: 'Classical' },
  { id: 'naive_bayes',         label: 'Naive Bayes',          tag: 'Classical' },
  { id: 'lstm',                label: 'LSTM Neural Network',  tag: 'Deep Learning' },
]

interface Props {
  value: ModelId
  onChange: (id: ModelId) => void
  disabled?: boolean
}

export default function ModelSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={e => onChange(e.target.value as ModelId)}
        disabled={disabled}
        className="w-full input-field appearance-none pr-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {MODELS.map(m => (
          <option key={m.id} value={m.id}>
            {m.label} ({m.tag})
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  )
}
