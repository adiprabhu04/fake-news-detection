import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, AlertCircle, Link2, FileText, RotateCcw } from 'lucide-react'

import { predict, explain, analyzeUrl } from '../lib/api'
import ModelSelector from '../components/ModelSelector'
import PredictionCard from '../components/PredictionCard'
import ExplainabilityPanel from '../components/ExplainabilityPanel'
import { PredictionSkeleton, ExplainabilitySkeleton } from '../components/SkeletonLoader'
import AnalysisHistory from '../components/AnalysisHistory'
import ToastContainer from '../components/Toast'
import { useToast } from '../hooks/useToast'

const TABS = [
  { id: 'text', label: 'Paste Text', icon: FileText },
  { id: 'url', label: 'Article URL', icon: Link2 },
]

const SAMPLE_TEXT =
  `The President signed a sweeping executive order today aimed at overhauling the country's immigration system. ` +
  `The order, which was met with immediate legal challenges from advocacy groups, directs federal agencies to ` +
  `expedite deportation proceedings for undocumented immigrants who have been in the country for fewer than two years. ` +
  `White House officials defended the action as a necessary step to secure the border and reduce strain on the immigration ` +
  `court system, which currently faces a backlog of more than three million cases. Critics, however, argue the move ` +
  `circumvents congressional authority and violates due-process protections established by the Supreme Court.`

let _historyId = 0

// ---------------------------------------------------------------------------

export default function Analyzer() {
  const { toasts, toast, dismiss } = useToast()

  const [tab, setTab] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [model, setModel] = useState('random_forest')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [prediction, setPrediction] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [article, setArticle] = useState(null)

  const [history, setHistory] = useState([])

  const resultsRef = useRef(null)

  const canSubmit = tab === 'text' ? text.trim().length >= 50 : url.trim().length > 10

  const reset = () => {
    setError(null)
    setPrediction(null)
    setExplanation(null)
    setArticle(null)
  }

  const handleAnalyze = async () => {
    reset()
    setLoading(true)

    try {
      let predResult, expResult, articleData

      if (tab === 'url') {
        const { data } = await analyzeUrl(url.trim(), model)
        predResult = { prediction: data.prediction, confidence: data.confidence, model_used: data.model_used }
        articleData = data.article
        const { data: expData } = await explain(data.article.text, model)
        expResult = expData
      } else {
        const [predRes, expRes] = await Promise.all([
          predict(text.trim(), model),
          explain(text.trim(), model),
        ])
        predResult = predRes.data
        expResult = expRes.data
      }

      setPrediction(predResult)
      setExplanation(expResult)
      if (articleData) setArticle(articleData)

      // Add to history
      const preview = tab === 'url'
        ? articleData?.title || url
        : text.trim().slice(0, 80) + (text.length > 80 ? '…' : '')

      setHistory(prev => [
        {
          id: ++_historyId,
          ts: Date.now(),
          prediction: predResult.prediction,
          confidence: predResult.confidence,
          model_used: predResult.model_used,
          preview,
          // store raw input for restore
          tab,
          text: tab === 'text' ? text.trim() : '',
          url: tab === 'url' ? url.trim() : '',
          model,
          // store results for immediate restore
          _pred: predResult,
          _exp: expResult,
          _article: articleData || null,
        },
        ...prev,
      ].slice(0, 8))

      toast(
        `Classified as ${predResult.prediction} · ${Math.round(predResult.confidence * 100)}% confidence`,
        predResult.prediction === 'Fake' ? 'error' : 'success',
      )

      // Smooth scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)

    } catch (err) {
      const msg = err.response?.data?.detail
      const errText = typeof msg === 'string' ? msg : 'Analysis failed — is the backend running?'
      setError(errText)
      toast(errText, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = (item) => {
    setTab(item.tab)
    setText(item.text)
    setUrl(item.url)
    setModel(item.model)
    setPrediction(item._pred)
    setExplanation(item._exp)
    setArticle(item._article)
    setError(null)
    toast('Restored previous analysis', 'info')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inputText = tab === 'text' ? text : (article?.text || '')

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen bg-bg pt-14"
      >
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            <h1 className="text-2xl font-semibold text-primary mb-1.5 tracking-tight">
              Article Analyzer
            </h1>
            <p className="text-secondary text-sm">
              Paste text or a URL — get a verdict with word-level explainability.
            </p>
          </motion.div>

          {/* ── Input card ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="card p-6 mb-6"
          >
            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-bg-elevated rounded-lg p-1 w-fit mb-6 border border-line">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); reset() }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium
                              transition-colors duration-150 ${
                    tab === id
                      ? 'bg-accent text-white'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Input area */}
            <AnimatePresence mode="wait">
              {tab === 'text' ? (
                <motion.div
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="relative"
                >
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Paste the article text here (minimum 50 characters)…"
                    rows={8}
                    className="input-base resize-none font-sans leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-3">
                    <span className={`text-xs font-mono tabular-nums ${text.length < 50 ? 'text-muted' : 'text-secondary'}`}>
                      {text.length}
                    </span>
                    {text.length === 0 && (
                      <button
                        onClick={() => setText(SAMPLE_TEXT)}
                        className="text-xs text-accent hover:text-accent-hover transition-colors"
                      >
                        Try sample
                      </button>
                    )}
                    {text.length > 0 && (
                      <button
                        onClick={() => { setText(''); reset() }}
                        className="btn-icon w-5 h-5"
                        title="Clear"
                      >
                        <RotateCcw size={11} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="url"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canSubmit && handleAnalyze()}
                    placeholder="https://example.com/news/article"
                    className="input-base"
                    autoFocus
                  />
                  <p className="text-dim text-xs mt-2">
                    We'll fetch and extract the article text automatically
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <ModelSelector value={model} onChange={setModel} />
              <button
                onClick={handleAnalyze}
                disabled={loading || !canSubmit}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  'Analyze Article'
                )}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-fake-dim border border-fake-border rounded-xl"
                >
                  <AlertCircle size={14} className="text-fake mt-0.5 shrink-0" />
                  <p className="text-fake text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Results ────────────────────────────────── */}
          <div ref={resultsRef}>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6"
                >
                  <div className="space-y-4">
                    <PredictionSkeleton />
                  </div>
                  <ExplainabilitySkeleton />
                </motion.div>
              )}

              {!loading && prediction && explanation && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6"
                >
                  {/* Left column */}
                  <div className="space-y-4">
                    <PredictionCard {...prediction} />

                    {/* Article info card */}
                    {article && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card p-4"
                      >
                        <p className="label-xs mb-2">Scraped Article</p>
                        <p className="text-primary text-sm font-medium leading-snug mb-1.5 line-clamp-2">
                          {article.title}
                        </p>
                        <p className="text-dim text-xs">{article.word_count.toLocaleString()} words extracted</p>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-accent text-xs hover:text-accent-hover transition-colors"
                        >
                          <Link2 size={10} />
                          View original
                        </a>
                      </motion.div>
                    )}

                    {/* Reading guide */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                      className="card p-4"
                    >
                      <p className="label-xs mb-3">How to read this</p>
                      <div className="space-y-2.5 text-xs text-secondary leading-relaxed">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-fake mt-1 shrink-0" />
                          <p><span className="text-fake font-medium">Red</span> bars/highlights — push toward Fake</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-real mt-1 shrink-0" />
                          <p><span className="text-real font-medium">Green</span> bars/highlights — push toward Real</p>
                        </div>
                        <p className="text-dim pl-4">Bar length = strength of influence</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right column */}
                  <ExplainabilityPanel
                    explanation={explanation}
                    prediction={prediction.prediction}
                    confidence={prediction.confidence}
                    text={inputText}
                  />
                </motion.div>
              )}

              {/* Empty state */}
              {!loading && !prediction && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-14 h-14 bg-bg-elevated rounded-2xl border border-line flex items-center justify-center mb-4">
                    <FileText size={22} className="text-muted" />
                  </div>
                  <p className="text-secondary text-sm mb-1 font-medium">No analysis yet</p>
                  <p className="text-dim text-xs">Enter article text or a URL above to get started</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── History ─────────────────────────────────── */}
          <AnalysisHistory history={history} onRestore={handleRestore} />

        </div>
      </motion.div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  )
}
