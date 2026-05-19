export type ModelId = 'random_forest' | 'logistic_regression' | 'naive_bayes' | 'lstm'

export interface PredictResponse {
  prediction: 'Fake' | 'Real'
  confidence: number
  model_used: string
}

export interface WordImportance {
  word: string
  score: number
  direction: 'fake' | 'real'
}

export interface HighlightToken {
  word: string
  score: number
  direction: 'fake' | 'real' | 'neutral'
}

export interface ExplainResponse {
  word_importance: WordImportance[]
  fake_indicators: WordImportance[]
  real_indicators: WordImportance[]
  highlighted_text: HighlightToken[]
  summary?: string
  method: string
}

export interface ArticleData {
  title: string
  text: string
  url: string
  word_count: number
}

export interface AnalyzeUrlResponse extends PredictResponse {
  article: ArticleData
}

export interface HistoryItem {
  id: number
  ts: number
  prediction: 'Fake' | 'Real'
  confidence: number
  model_used: string
  preview: string
  tab: 'text' | 'url'
  text: string
  url: string
  model: string
  _pred: PredictResponse
  _exp: ExplainResponse
  _article: ArticleData | null
}

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}
