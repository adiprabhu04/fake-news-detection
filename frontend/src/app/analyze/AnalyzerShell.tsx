'use client'

import dynamic from 'next/dynamic'

// Dynamic import with ssr:false is only allowed inside a Client Component.
// This shell exists solely to host that constraint while keeping page.tsx a
// Server Component (required for metadata export).
const AnalyzerClient = dynamic(
  () => import('@/components/analyzer/AnalyzerClient'),
  { ssr: false },
)

export default function AnalyzerShell() {
  return <AnalyzerClient />
}
