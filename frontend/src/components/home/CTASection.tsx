'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="section pb-28">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-accent/20
                   bg-surface px-8 py-14 text-center"
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, #8B5CF6 0%, transparent 65%)',
          }}
        />

        <div className="relative space-y-5">
          <p className="label-xs">Ready to analyze</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            See the{' '}
            <span className="text-accent">AI reasoning</span>
            <br />
            behind every verdict.
          </h2>
          <p className="text-secondary text-base max-w-md mx-auto leading-relaxed">
            Paste any article or URL and get a prediction with full word-level
            explainability in seconds.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <Link href="/analyze" className="btn-primary text-base px-7 py-3">
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
        </div>
      </motion.div>
    </section>
  )
}
