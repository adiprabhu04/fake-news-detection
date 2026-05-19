import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Navbar from '@/components/layout/Navbar'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://truthlens.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'TruthLens — Explainable Misinformation Detection',
    template: '%s | TruthLens',
  },
  description:
    'ML-powered misinformation analysis with word-level explanations. Four models trained on 44,000+ articles with LIME explainability.',
  keywords: [
    'fake news detection', 'misinformation analysis', 'explainable AI',
    'LIME', 'NLP', 'machine learning', 'natural language processing',
  ],
  authors: [{ name: 'Aditya Prabhudessai' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'TruthLens — Explainable Misinformation Detection',
    description: 'ML-powered misinformation analysis with word-level explanations via LIME.',
    type: 'website',
    url: APP_URL,
    siteName: 'TruthLens',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TruthLens — Explainable Misinformation Detection',
    description: 'ML-powered misinformation analysis with LIME explainability.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-background text-foreground antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
