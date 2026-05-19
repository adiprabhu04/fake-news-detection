'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/analyze', label: 'Analyzer' },
]

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const DiamondIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="white" fillOpacity="0.9" />
  </svg>
)

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      aria-label="Site navigation"
      className={cn(
        'fixed top-0 inset-x-0 z-50 h-14 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-line'
          : 'bg-transparent',
      )}
    >
      <div className="section h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="TruthLens home"
        >
          <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center shrink-0
                          group-hover:bg-accent-hover transition-colors duration-150">
            <DiamondIcon />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            TruthLens
          </span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors duration-100',
                pathname === href
                  ? 'text-foreground bg-surface'
                  : 'text-secondary hover:text-foreground',
              )}
            >
              {label}
            </Link>
          ))}

          <a
            href="https://github.com/adiprabhu04/fake-news-detection"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
            className={cn(
              'ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
              'text-secondary hover:text-foreground',
              'border border-line hover:border-accent/40',
              'transition-all duration-150',
            )}
          >
            <GithubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
