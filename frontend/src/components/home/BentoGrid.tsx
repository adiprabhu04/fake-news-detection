'use client'

import { motion } from 'framer-motion'
import { Brain, Globe, BarChart2, Zap, Shield } from 'lucide-react'

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.07 },
})

/* ── Mini LIME bar mockup for hero card ── */
const BARS = [
  { word: 'sources say',  pct: 82, dir: 'fake' },
  { word: 'claim',        pct: 71, dir: 'fake' },
  { word: 'allegedly',   pct: 58, dir: 'fake' },
  { word: 'Reuters',     pct: 74, dir: 'real' },
  { word: 'confirmed',   pct: 52, dir: 'real' },
]

function MiniLimeBar({ word, pct, dir }: { word: string; pct: number; dir: string }) {
  const color = dir === 'fake' ? '#EF4444' : '#22C55E'
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="text-secondary w-20 truncate font-mono">{word}</span>
      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color, opacity: 0.75 }}
        />
      </div>
      <span className="text-muted w-7 text-right">{pct}%</span>
    </div>
  )
}

const MODELS = [
  { label: 'Logistic Regression', tag: 'Classical' },
  { label: 'Random Forest',       tag: 'Classical' },
  { label: 'Naive Bayes',         tag: 'Classical' },
  { label: 'LSTM',                tag: 'Deep Learning' },
]

export default function BentoGrid() {
  return (
    <section className="section pb-28">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="label-xs mb-8"
      >
        Capabilities
      </motion.p>

      {/* 3-col bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-min">

        {/* Card 1 — Explainable AI (hero, 2 cols) */}
        <motion.div
          {...fadeUp(0)}
          className="bento-card md:col-span-2 flex flex-col gap-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="w-8 h-8 bg-accent-dim border border-accent-border rounded-lg
                              flex items-center justify-center mb-3">
                <BarChart2 size={15} className="text-accent" />
              </div>
              <h3 className="text-foreground text-sm font-semibold mb-1">Explainable AI</h3>
              <p className="text-muted text-xs leading-relaxed max-w-xs">
                LIME explanations surface which words drove each verdict.
                No black boxes — ever.
              </p>
            </div>
            <span className="badge-accent shrink-0">LIME</span>
          </div>

          {/* Mini visualization */}
          <div className="bg-background rounded-xl p-4 border border-line space-y-2.5">
            <p className="label-xs mb-3">Feature importance</p>
            {BARS.map(b => <MiniLimeBar key={b.word} {...b} />)}
          </div>
        </motion.div>

        {/* Card 2 — Accuracy stat */}
        <motion.div {...fadeUp(1)} className="bento-card flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 bg-real-dim border border-real-border rounded-lg
                            flex items-center justify-center mb-3">
              <Shield size={15} className="text-real" />
            </div>
            <p className="label-xs mb-2">LSTM accuracy</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-foreground tracking-tighter leading-none mb-1">
              97.9%
            </p>
            <p className="text-muted text-xs">
              44,000+ ISOT dataset articles
            </p>
          </div>
        </motion.div>

        {/* Card 3 — Multi-model */}
        <motion.div {...fadeUp(2)} className="bento-card flex flex-col gap-4">
          <div>
            <div className="w-8 h-8 bg-accent-dim border border-accent-border rounded-lg
                            flex items-center justify-center mb-3">
              <Brain size={15} className="text-accent" />
            </div>
            <h3 className="text-foreground text-sm font-semibold mb-1">Multi-Model Analysis</h3>
            <p className="text-muted text-xs leading-relaxed">
              Switch between four models per request. Compare outputs instantly.
            </p>
          </div>
          <div className="space-y-1.5">
            {MODELS.map(m => (
              <div key={m.label}
                className="flex items-center justify-between px-3 py-2
                           bg-background rounded-lg border border-line text-xs"
              >
                <span className="text-secondary">{m.label}</span>
                <span className="text-muted">{m.tag}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 4 — URL Scraping */}
        <motion.div {...fadeUp(3)} className="bento-card flex flex-col gap-4">
          <div>
            <div className="w-8 h-8 bg-accent-dim border border-accent-border rounded-lg
                            flex items-center justify-center mb-3">
              <Globe size={15} className="text-accent" />
            </div>
            <h3 className="text-foreground text-sm font-semibold mb-1">URL Scraping</h3>
            <p className="text-muted text-xs leading-relaxed">
              Paste any article URL. We fetch, parse, and analyze the content automatically.
            </p>
          </div>
          {/* URL input mockup */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-background
                          border border-line rounded-xl text-xs text-muted font-mono">
            <Globe size={11} className="shrink-0" />
            <span className="truncate">https://example.com/news/article</span>
          </div>
        </motion.div>

        {/* Card 5 — API-first */}
        <motion.div {...fadeUp(4)} className="bento-card flex flex-col gap-4">
          <div>
            <div className="w-8 h-8 bg-accent-dim border border-accent-border rounded-lg
                            flex items-center justify-center mb-3">
              <Zap size={15} className="text-accent" />
            </div>
            <h3 className="text-foreground text-sm font-semibold mb-1">API-First</h3>
            <p className="text-muted text-xs leading-relaxed">
              FastAPI backend with clean JSON endpoints. Integrate or extend in minutes.
            </p>
          </div>
          {/* Code snippet */}
          <div className="bg-background rounded-xl p-3 border border-line font-mono text-[11px]
                          leading-relaxed overflow-hidden">
            <p><span className="text-muted">POST</span> <span className="text-accent">/predict</span></p>
            <p className="text-muted">{'{'}</p>
            <p className="pl-3">
              <span className="text-secondary">"text"</span>
              <span className="text-muted">: </span>
              <span className="text-real">"…"</span><span className="text-muted">,</span>
            </p>
            <p className="pl-3">
              <span className="text-secondary">"model"</span>
              <span className="text-muted">: </span>
              <span className="text-real">"random_forest"</span>
            </p>
            <p className="text-muted">{'}'}</p>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
