import type { Metadata } from 'next'
import AnalyzerShell from './AnalyzerShell'

export const metadata: Metadata = {
  title: 'Article Analyzer',
  description: 'Analyze news articles for misinformation using AI with LIME explainability.',
}

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-background pt-14">
      <AnalyzerShell />
    </div>
  )
}
