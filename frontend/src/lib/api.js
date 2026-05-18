import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 45_000,
  headers: { 'Content-Type': 'application/json' },
})

export const getModels = () => api.get('/models')

export const predict = (text, model) =>
  api.post('/predict', { text, model })

export const explain = (text, model, method = 'lime', num_features = 10) =>
  api.post('/explain', { text, model, method, num_features })

export const analyzeUrl = (url, model) =>
  api.post('/analyze-url', { url, model })

export default api
