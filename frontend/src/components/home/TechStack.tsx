'use client'

import { motion } from 'framer-motion'

const STACK = [
  {
    label: 'Models',
    items: [
      'Logistic Regression',
      'Random Forest',
      'Naive Bayes',
      'LSTM (Keras / TF)',
    ],
  },
  {
    label: 'Explainability',
    items: [
      'LIME Text Explainer',
      'SHAP LinearExplainer',
      'SHAP TreeExplainer',
      'Word-level Highlights',
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      'FastAPI + Uvicorn',
      'Next.js 15 + TypeScript',
      'TF-IDF Vectorizer',
      'Docker + Render',
    ],
  },
]

export default function TechStack() {
  return (
    <section className="section pb-28">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="card p-8"
      >
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-foreground text-lg font-semibold mb-1 tracking-tight">
              Tech Stack
            </h2>
            <p className="text-secondary text-sm">
              Full-stack · API-driven · Deployment-ready
            </p>
          </div>
          <a
            href="/analyze"
            className="btn-primary"
          >
            Try it now
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STACK.map(({ label, items }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
            >
              <p className="label-xs mb-3">{label}</p>
              <div className="space-y-1.5">
                {items.map(item => (
                  <div
                    key={item}
                    className="px-3 py-2 bg-surface-elevated rounded-lg
                               text-secondary text-sm border border-line"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
