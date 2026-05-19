export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="section py-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-accent rounded-md flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="text-secondary text-sm font-medium">TruthLens</span>
          </div>
          <p className="text-muted text-xs">
            Built by{' '}
            <a
              href="https://github.com/adiprabhu04"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-foreground transition-colors"
            >
              Aditya Prabhudessai
            </a>
          </p>
        </div>
        <p className="text-[11px] text-muted leading-relaxed max-w-2xl">
          TruthLens provides ML-based analysis and heuristic signals. Results should not be
          treated as definitive factual verification.
        </p>
      </div>
    </footer>
  )
}
