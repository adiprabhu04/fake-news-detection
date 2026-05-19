'use client'

import { motion } from 'framer-motion'

const STATS = [
  { value: '44K+',  label: 'Training articles' },
  { value: '97.9%', label: 'LSTM accuracy' },
  { value: '4',     label: 'ML models' },
  { value: '<1s',   label: 'Inference time' },
]

export default function StatsSection() {
  return (
    <section className="section pb-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="grid grid-cols-2 md:grid-cols-4
                   divide-x divide-y md:divide-y-0 divide-line
                   border border-line rounded-2xl overflow-hidden"
      >
        {STATS.map(({ value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-surface px-7 py-6 flex flex-col gap-1"
          >
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {value}
            </span>
            <span className="text-muted text-xs">{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
