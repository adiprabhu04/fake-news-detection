const MODELS = [
  { id: 'random_forest',       label: 'Random Forest',       tag: 'Classical' },
  { id: 'logistic_regression', label: 'Logistic Regression', tag: 'Classical' },
  { id: 'naive_bayes',         label: 'Naive Bayes',         tag: 'Classical' },
  { id: 'lstm',                label: 'LSTM',                tag: 'Deep Learning' },
]

export default function ModelSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-dim text-xs font-medium">Model</span>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none bg-bg-elevated border border-line rounded-lg
                     pl-3 pr-8 py-1.5 text-primary text-sm
                     focus:outline-none focus:border-accent/50
                     transition-colors duration-150 cursor-pointer"
        >
          {MODELS.map(m => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dim"
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
