'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import TerminalDemo from '@/components/ui/TerminalDemo'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut', delay },
})

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="section relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── Left: copy ──────────────────── */}
          <div className="space-y-7">
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-3 py-1
                              bg-accent-dim border border-accent-border
                              rounded-full text-accent text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
                Explainable AI · Misinformation Research
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.08)} className="space-y-3">
              <h1 className="text-[3.25rem] md:text-[3.75rem] font-bold text-foreground
                             leading-[1.05] tracking-[-0.03em]">
                Detect{' '}
                <span className="relative inline-block">
                  misinformation
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent/40 rounded" />
                </span>
                .<br />
                <span className="text-secondary font-semibold">Understand why.</span>
              </h1>
            </motion.div>

            <motion.p
              {...fadeUp(0.16)}
              className="text-secondary text-lg leading-relaxed max-w-[480px]"
            >
              TruthLens goes beyond a binary label — it shows exactly which words
              triggered a misinformation flag, powered by LIME on four ML models
              trained on 44,000+ labeled articles.
            </motion.p>

            <motion.div {...fadeUp(0.22)} className="flex items-center gap-3 flex-wrap">
              <Link href="/analyze" className="btn-primary text-base px-6 py-3">
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
            </motion.div>
          </div>

          {/* ── Right: terminal ─────────────── */}
          <motion.div {...fadeUp(0.18)}>
            <TerminalDemo />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
