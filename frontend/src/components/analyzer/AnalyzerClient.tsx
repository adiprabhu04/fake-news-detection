'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Link2, FileText, Play, X, Globe, AlignLeft, Clock, AlertCircle } from 'lucide-react'

import ModelSelector from '@/components/ui/ModelSelector'
import PredictionCard from '@/components/analyzer/PredictionCard'
import ContextSignals from '@/components/analyzer/ContextSignals'
import ExplainabilityPanel from '@/components/analyzer/ExplainabilityPanel'
import AnalysisHistory from '@/components/analyzer/AnalysisHistory'
import {
  PredictionSkeleton,
  ContextSignalsSkeleton,
  ExplainabilitySkeleton,
} from '@/components/ui/SkeletonLoader'
import ToastContainer from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { predict, explain, analyzeUrl, healthCheck } from '@/lib/api'
import type { ModelId, PredictResponse, ExplainResponse, ArticleData, HistoryItem } from '@/lib/types'

const SAMPLE_TEXT =
  'The President signed a sweeping executive order today aimed at overhauling the country\'s immigration system. The order, which was met with immediate legal challenges from advocacy groups, directs federal agencies to expedite deportation proceedings for undocumented immigrants who have been in the country for fewer than two years. White House officials defended the action as a necessary step to secure the border and reduce strain on the immigration court system, which currently faces a backlog of more than three million cases. Critics, however, argue the move circumvents congressional authority and violates due-process protections established by the Supreme Court.'

const LOAD_STAGES = [
  { ms: 0,    text: 'Preprocessing text…' },
  { ms: 700,  text: 'Generating TF-IDF embeddings…' },
  { ms: 1400, text: 'Running classifier…' },
  { ms: 2100, text: 'Generating LIME explanations…' },
]

const MAX_WORDS = 5000
const MAX_CHARS = 30_000

type Tab = 'text' | 'url'

export default function AnalyzerClient() {
  const [tab, setTab] = useState<Tab>('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [model, setModel] = useState<ModelId>('random_forest')
  const [loading, setLoading] = useState(false)
  const [loadStage, setLoadStage] = useState('')
  const [sampleGlow, setSampleGlow] = useState(false)

  const [predResult, setPredResult] = useState<PredictResponse | null>(null)
  const [expResult, setExpResult] = useState<ExplainResponse | null>(null)
  const [articleData, setArticleData] = useState<ArticleData | null>(null)

  const [history, setHistory] = useState<HistoryItem[]>([])
  const historyLoaded = useRef(false)
  // null = checking, true = online, false = offline
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  const { toasts, toast, dismiss } = useToast()

  // Ping backend health on mount
  useEffect(() => {
    let cancelled = false
    healthCheck()
      .then(() => { if (!cancelled) setApiOnline(true) })
      .catch(() => { if (!cancelled) setApiOnline(false) })
    return () => { cancelled = true }
  }, [])

  // Hydration-safe localStorage load
  useEffect(() => {
    if (historyLoaded.current) return
    historyLoaded.current = true
    try {
      const stored = localStorage.getItem('truthlens-history')
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist history
  useEffect(() => {
    if (!historyLoaded.current) return
    try { localStorage.setItem('truthlens-history', JSON.stringify(history)) } catch {}
  }, [history])

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function startStages() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    LOAD_STAGES.forEach(s => {
      timers.current.push(setTimeout(() => setLoadStage(s.text), s.ms))
    })
  }

  function stopStages() {
    timers.current.forEach(clearTimeout)
    setLoadStage('')
  }

  function insertSample() {
    setText(SAMPLE_TEXT)
    setSampleGlow(true)
    setTimeout(() => setSampleGlow(false), 1200)
  }

  function clearAll() {
    setPredResult(null)
    setExpResult(null)
    setArticleData(null)
    setText('')
    setUrl('')
  }

  function extractErrorMessage(err: unknown): string {
    const axiosErr = err as { response?: { data?: { detail?: unknown }; status?: number } }
    if (!axiosErr.response) return 'Backend unreachable. Is the FastAPI server running?'

    const detail = axiosErr.response.data?.detail
    if (Array.isArray(detail)) return 'Invalid request — please check your input.'
    if (typeof detail === 'string' && detail.length > 0) return detail

    const status = axiosErr.response.status
    if (status === 429) return 'Too many requests. Please wait a moment.'
    if (status != null && status >= 500) return 'Something went wrong while analyzing the URL.'
    return 'An unexpected error occurred.'
  }

  // Derived input state
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
  const isOverLimit = wordCount > MAX_WORDS || text.length > MAX_CHARS
  const isNearLimit = !isOverLimit && wordCount > MAX_WORDS * 0.85
  const urlIsValid = url.trim().startsWith('http://') || url.trim().startsWith('https://')

  const canAnalyze = !loading && !isOverLimit && (
    tab === 'text'
      ? wordCount >= 20
      : url.trim().length > 0 && urlIsValid
  )

  async function handleAnalyze() {
    const input = tab === 'text' ? text.trim() : url.trim()
    if (!input) {
      toast(tab === 'text' ? 'Paste some article text first.' : 'Enter a URL to analyze.', 'info')
      return
    }
    if (tab === 'text' && wordCount < 20) {
      toast('Text too short — at least 20 words required for reliable analysis.', 'info')
      return
    }
    if (tab === 'url' && !urlIsValid) {
      toast('Enter a full URL starting with http:// or https://', 'info')
      return
    }

    setPredResult(null)
    setExpResult(null)
    setArticleData(null)
    setLoading(true)
    startStages()

    try {
      if (tab === 'url') {
        const { data } = await analyzeUrl(input, model)
        setPredResult({ prediction: data.prediction, confidence: data.confidence, model_used: data.model_used })
        setArticleData(data.article)

        const expRes = await explain(data.article.text, model)
        setExpResult(expRes.data)

        pushHistory({
          prediction: data.prediction,
          confidence: data.confidence,
          model_used: data.model_used,
          preview: data.article.title || input,
          tab: 'url',
          inputText: data.article.text,
          inputUrl: input,
          pred: { prediction: data.prediction, confidence: data.confidence, model_used: data.model_used },
          exp: expRes.data,
          article: data.article,
        })
      } else {
        const [predRes, expRes] = await Promise.all([
          predict(input, model),
          explain(input, model),
        ])
        setPredResult(predRes.data)
        setExpResult(expRes.data)

        pushHistory({
          prediction: predRes.data.prediction,
          confidence: predRes.data.confidence,
          model_used: predRes.data.model_used,
          preview: input.slice(0, 70) + (input.length > 70 ? '…' : ''),
          tab: 'text',
          inputText: input,
          inputUrl: '',
          pred: predRes.data,
          exp: expRes.data,
          article: null,
        })
      }

      toast('Analysis complete.', 'success')
    } catch (err: unknown) {
      toast(extractErrorMessage(err), 'error')
    } finally {
      setLoading(false)
      stopStages()
    }
  }

  function pushHistory(item: {
    prediction: 'Fake' | 'Real'
    confidence: number
    model_used: string
    preview: string
    tab: Tab
    inputText: string
    inputUrl: string
    pred: PredictResponse
    exp: ExplainResponse
    article: ArticleData | null
  }) {
    const h: HistoryItem = {
      id: Date.now(),
      ts: Date.now(),
      prediction: item.prediction,
      confidence: item.confidence,
      model_used: item.model_used,
      preview: item.preview,
      tab: item.tab,
      text: item.inputText,
      url: item.inputUrl,
      model: model,
      _pred: item.pred,
      _exp: item.exp,
      _article: item.article,
    }
    setHistory(prev => [h, ...prev].slice(0, 20))
  }

  function restoreHistory(item: HistoryItem) {
    setTab(item.tab)
    setText(item.text)
    setUrl(item.url)
    setModel(item.model as ModelId)
    setPredResult(item._pred)
    setExpResult(item._exp)
    setArticleData(item._article)
    toast('Previous analysis restored.', 'info')
  }

  function clearHistory() {
    setHistory([])
    try { localStorage.removeItem('truthlens-history') } catch {}
    toast('History cleared.', 'info')
  }

  const hasResult = predResult !== null

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8">

        {/* Page header */}
        <div className="space-y-2">
          <span className="badge badge-accent">Analyzer</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Article Analyzer</h1>
          <p className="text-secondary text-sm max-w-xl leading-relaxed">
            Submit article text or a URL. The model outputs a classification with confidence
            score and word-level attribution showing which signals influenced the prediction.
          </p>
        </div>

        {/* Backend offline banner */}
        <AnimatePresence>
          {apiOnline === false && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl border"
              style={{
                backgroundColor: 'rgba(239,68,68,0.06)',
                borderColor: 'rgba(239,68,68,0.2)',
              }}
            >
              <AlertCircle size={14} className="text-fake shrink-0" />
              <p className="text-sm text-secondary">
                Analysis service currently unavailable.{' '}
                <span className="text-muted text-xs">
                  Start the FastAPI backend to enable predictions.
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* Left — input panel */}
          <div className="space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface-elevated rounded-xl border border-line w-fit">
              {(['text', 'url'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === t
                      ? 'bg-surface text-foreground shadow-sm border border-line'
                      : 'text-muted hover:text-secondary'
                  }`}
                >
                  {t === 'text' ? <FileText size={12} /> : <Link2 size={12} />}
                  {t === 'text' ? 'Article Text' : 'URL'}
                </button>
              ))}
            </div>

            {/* Input area */}
            <AnimatePresence mode="wait">
              {tab === 'text' ? (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={e => {
                        // Allow typing; only warn via counter — don't hard-clamp
                        setText(e.target.value.slice(0, MAX_CHARS + 500))
                      }}
                      placeholder="Paste article text here…"
                      disabled={loading}
                      rows={12}
                      className={[
                        'input-field w-full resize-none leading-relaxed transition-all duration-300',
                        sampleGlow ? 'ring-1 ring-accent/40 border-accent/30' : '',
                        isOverLimit ? 'border-fake/40 focus:border-fake/60 focus:ring-fake/15' : '',
                      ].join(' ')}
                    />
                    {text && (
                      <button
                        onClick={() => setText('')}
                        className="absolute top-2.5 right-2.5 btn-icon w-6 h-6"
                        aria-label="Clear text"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Word counter row */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={insertSample}
                      disabled={loading}
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors disabled:opacity-40"
                    >
                      <Sparkles size={11} />
                      Insert sample article
                    </button>
                    <div className="flex items-center gap-2">
                      {isOverLimit && (
                        <span className="text-xs text-fake">Exceeds {MAX_WORDS.toLocaleString()} word limit</span>
                      )}
                      {isNearLimit && !isOverLimit && (
                        <span className="text-xs" style={{ color: '#F59E0B' }}>
                          Approaching limit
                        </span>
                      )}
                      <span
                        className="text-xs font-mono transition-colors"
                        style={{
                          color: isOverLimit ? '#EF4444' : isNearLimit ? '#F59E0B' : '#71717A',
                        }}
                      >
                        {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="url"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <Globe
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                    />
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      disabled={loading}
                      className={[
                        'input-field w-full pl-8',
                        url.trim().length > 0 && !urlIsValid
                          ? 'border-fake/40 focus:border-fake/60 focus:ring-fake/15'
                          : '',
                      ].join(' ')}
                    />
                    {url && (
                      <button
                        onClick={() => setUrl('')}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 btn-icon w-6 h-6"
                        aria-label="Clear URL"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {url.trim().length > 0 && !urlIsValid ? (
                    <p className="text-xs text-fake">URL must start with http:// or https://</p>
                  ) : (
                    <p className="text-xs text-muted">
                      Article content will be extracted and analyzed automatically.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Model selector + run */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1 space-y-1.5">
                <label className="label-xs">Model</label>
                <ModelSelector value={model} onChange={setModel} disabled={loading} />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="btn-primary h-10 px-5 flex items-center justify-center gap-2 sm:shrink-0 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Play size={13} />
                    Analyze
                  </>
                )}
              </button>
            </div>

            {/* Loading stage message */}
            <AnimatePresence>
              {loading && loadStage && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/15"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot shrink-0" />
                  <span className="text-xs text-accent font-mono">{loadStage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extracted article preview (URL mode) */}
            <AnimatePresence>
              {articleData && tab === 'url' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="card p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <AlignLeft size={12} className="text-muted" />
                    <span className="label-xs">Extracted article</span>
                  </div>
                  {articleData.title && (
                    <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                      {articleData.title}
                    </p>
                  )}
                  <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                    {articleData.text.slice(0, 300)}…
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-xs text-muted font-mono">
                      {articleData.word_count.toLocaleString()} words
                    </span>
                    {articleData.url && (
                      <a
                        href={articleData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline truncate max-w-[200px] sm:max-w-[280px]"
                      >
                        {articleData.url}
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History */}
            <AnalysisHistory
              items={history}
              onSelect={restoreHistory}
              onClear={clearHistory}
            />
          </div>

          {/* Right — results panel */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <PredictionSkeleton />
                  <ContextSignalsSkeleton />
                  <ExplainabilitySkeleton />
                </motion.div>
              ) : hasResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  <PredictionCard result={predResult!} />
                  <ContextSignals
                    text={articleData?.text ?? text}
                    url={url}
                    tab={tab}
                  />
                  {expResult && <ExplainabilityPanel data={expResult} />}
                  <button
                    onClick={clearAll}
                    className="btn-ghost w-full text-xs text-muted justify-center"
                  >
                    Clear results
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px] border-dashed"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Clock size={18} className="text-accent/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-secondary">No analysis yet</p>
                    <p className="text-xs text-muted leading-relaxed max-w-[200px]">
                      Submit text or a URL to see the model output here.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-muted leading-relaxed border-t border-line pt-6 max-w-2xl">
          TruthLens provides ML-based predictions and heuristic signals. Results should not be treated
          as definitive factual verification. Always cross-reference with primary sources.
        </p>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  )
}
