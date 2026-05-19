import axios from 'axios'
import type { PredictResponse, ExplainResponse, AnalyzeUrlResponse } from './types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
})

export const healthCheck = () =>
  api.get<{ status: string; models_loaded: number }>('/health', { timeout: 5_000 })

export const getModels = () => api.get('/models')

export const predict = (text: string, model: string) =>
  api.post<PredictResponse>('/predict', { text, model })

export const explain = (
  text: string,
  model: string,
  method = 'lime',
  num_features = 12,
) => api.post<ExplainResponse>('/explain', { text, model, method, num_features })

export const analyzeUrl = (url: string, model: string) =>
  api.post<AnalyzeUrlResponse>('/analyze-url', { url, model })

export default api
