import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Search, Zap, Shield, BarChart2, Globe } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'Multi-Model Analysis',
    desc: 'Choose from Logistic Regression, Random Forest, Naive Bayes, or an LSTM neural network.',
  },
  {
    icon: Search,
    title: 'Explainable AI',
    desc: 'LIME explanations surface which words drove each verdict. No black boxes, ever.',
  },
  {
    icon: Globe,
    title: 'URL Scraping',
    desc: 'Paste any article URL. We fetch, parse, and analyze the content automatically.',
  },
  {
    icon: Shield,
    title: '97%+ Accuracy',
    desc: 'Trained on 44,000+ labeled news articles from the ISOT fake news dataset.',
  },
  {
    icon: BarChart2,
    title: 'Confidence Scoring',
    desc: 'Calibrated probability output — not just a binary label.',
  },
  {
    icon: Zap,
    title: 'API-First',
    desc: 'FastAPI backend with clean JSON endpoints, ready for integration or extension.',
  },
]

const STATS = [
  { value: '44K+', label: 'Training articles' },
  { value: '97.9%', label: 'LSTM accuracy' },
  { value: '4', label: 'Models' },
  { value: '<1s', label: 'Inference time' },
]

const STACK = [
  {
    label: 'Models',
    items: ['Logistic Regression', 'Random Forest', 'Naive Bayes', 'LSTM (Keras)'],
  },
  {
    label: 'Explainability',
    items: ['LIME Text Explainer', 'SHAP (Linear + Tree)', 'Word Highlighting', 'Confidence Intervals'],
  },
  {
    label: 'Infrastructure',
    items: ['FastAPI + Uvicorn', 'React + Vite + Tailwind', 'TF-IDF Vectorizer', 'Docker + Render'],
  },
]

const DEMO_LINES = [
  { delay: 0,   text: '→  Analyzing article…',                                          color: 'text-dim' },
  { delay: 0.4, text: '   Preprocessing text (NLTK + TF-IDF)',                          color: 'text-dim' },
  { delay: 0.8, text: '   Running Random Forest classifier…',                            color: 'text-dim' },
  { delay: 1.2, text: '',                                                                color: '' },
  { delay: 1.4, text: '✓  Prediction:  FAKE  (97.3% confidence)',                       color: 'text-fake' },
  { delay: 1.7, text: '✓  LIME explanation ready (12 features)',                         color: 'text-real' },
  { delay: 2.0, text: '',                                                                color: '' },
  { delay: 2.1, text: '   Top fake signals: "claim" (+0.18), "sources say" (+0.14)',    color: 'text-secondary' },
  { delay: 2.4, text: '   Top real signals: "Reuters" (-0.31)',                          color: 'text-secondary' },
]

function TerminalDemo() {
  return (
    <div className="relative">
      {/* Accent glow */}
      <div
        className="absolute -inset-8 -z-10 opacity-[0.07] blur-3xl rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 55% 50%, #6366f1 0%, transparent 70%)' }}
      />

      <div className="card p-0 overflow-hidden">
        {/* Terminal chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-line bg-bg-elevated">
          {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map((c, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${c} opacity-60`} />
          ))}
          <span className="ml-2 text-dim text-xs font-mono">TruthLens API — POST /predict</span>
        </div>

        {/* Terminal body */}
        <div className="p-5 font-mono text-xs space-y-1 min-h-[220px]">
          {DEMO_LINES.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: line.delay + 0.5, duration: 0.3 }}
              className={line.color || 'text-transparent'}
            >
              {line.text || ' '}
            </motion.p>
          ))}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'steps(1)' }}
            className="inline-block w-2 h-3.5 bg-accent align-bottom ml-0.5"
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-bg"
    >
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-36 pb-20 overflow-hidden">
        {/* Subtle background grid on hero only */}
        <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />
        {/* Fade the grid at the bottom */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-dim border border-accent-border rounded-full text-accent text-xs font-medium mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              Explainable AI · Misinformation Research
            </div>

            <h1 className="text-5xl font-bold text-primary leading-[1.1] tracking-[-0.025em] mb-6">
              Detect fake news.
              <br />
              <span className="text-secondary font-semibold">Understand why.</span>
            </h1>

            <p className="text-secondary text-lg leading-relaxed mb-9 max-w-lg">
              TruthLens goes beyond a binary label — it shows exactly which words
              triggered a misinformation flag, powered by LIME on four ML models
              trained on 44,000+ labeled articles.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/analyze" className="btn-primary text-base px-6 py-3">
                Analyze an article
                <ArrowRight size={16} />
              </Link>
              <a
                href="https://github.com/adiprabhu04/fake-news-detection"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-base py-3"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>

          {/* Right: terminal demo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          >
            <TerminalDemo />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line border border-line rounded-xl overflow-hidden"
        >
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-bg-card px-6 py-6 flex flex-col gap-1"
            >
              <span className="text-2xl font-bold text-primary tracking-tight">{value}</span>
              <span className="text-dim text-xs">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="label-xs mb-8"
        >
          Capabilities
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
              className="card p-5 hover:border-strong transition-colors duration-200 group"
            >
              <div className="w-8 h-8 bg-accent-dim border border-accent-border rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Icon size={15} className="text-accent" />
              </div>
              <h3 className="text-primary text-sm font-semibold mb-1.5">{title}</h3>
              <p className="text-dim text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="card p-8"
        >
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-primary text-lg font-semibold mb-1">Tech Stack</h2>
              <p className="text-secondary text-sm">Full-stack · API-driven · Deployment-ready</p>
            </div>
            <Link to="/analyze" className="btn-primary">
              Try it now <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STACK.map(({ label, items }) => (
              <div key={label}>
                <p className="label-xs mb-3">{label}</p>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item} className="px-3 py-2 bg-bg-elevated rounded-lg text-secondary text-sm border border-line">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-accent rounded-md flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="text-secondary text-sm font-medium">TruthLens</span>
          </div>
          <p className="text-dim text-xs">
            Built by{' '}
            <a
              href="https://github.com/adiprabhu04"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors"
            >
              Aditya Prabhudessai
            </a>
          </p>
        </div>
      </footer>
    </motion.div>
  )
}
