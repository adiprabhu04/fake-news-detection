'use client'

import { motion } from 'framer-motion'

const LINES = [
  { delay: 0.3,  text: '→  Analyzing article…',                                      color: 'text-muted' },
  { delay: 0.7,  text: '   Preprocessing text (NLTK + TF-IDF)',                       color: 'text-muted' },
  { delay: 1.1,  text: '   Running Random Forest classifier…',                         color: 'text-muted' },
  { delay: 1.5,  text: '',                                                              color: '' },
  { delay: 1.7,  text: '✓  Prediction:  FAKE  (97.3% confidence)',                    color: 'text-fake' },
  { delay: 2.0,  text: '✓  LIME explanation ready  (12 features)',                    color: 'text-real' },
  { delay: 2.3,  text: '',                                                              color: '' },
  { delay: 2.4,  text: '   Top fake signals:  "claim" (+0.18)  "sources say" (+0.14)', color: 'text-secondary' },
  { delay: 2.7,  text: '   Top real signals:  "Reuters" (−0.31)',                      color: 'text-secondary' },
]

export default function TerminalDemo() {
  return (
    <div className="relative">
      {/* Accent glow behind card */}
      <div
        className="absolute -inset-10 -z-10 pointer-events-none opacity-[0.06]"
        style={{
          background: 'radial-gradient(ellipse at 55% 50%, #8B5CF6 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="card p-0 overflow-hidden">
        {/* Chrome bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-line bg-surface-elevated">
          {['#EF4444', '#F59E0B', '#22C55E'].map((c, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full opacity-70"
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="ml-2 text-muted text-xs font-mono">
            TruthLens API — POST /predict
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-5 font-mono text-xs leading-[1.8] min-h-[220px]">
          {LINES.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: line.delay, duration: 0.3 }}
              className={line.color || 'invisible'}
            >
              {line.text || '​'}
            </motion.p>
          ))}

          {/* Blinking cursor — keyframe snap (no CSS steps needed) */}
          <motion.span
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.45, 0.5, 0.95],
            }}
            className="inline-block w-[7px] h-[14px] bg-accent align-text-bottom ml-0.5"
          />
        </div>
      </div>
    </div>
  )
}
