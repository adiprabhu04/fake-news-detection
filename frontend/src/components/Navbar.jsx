import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { path: '/', label: 'Home' },
  { path: '/analyze', label: 'Analyzer' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="text-primary text-sm font-semibold tracking-tight">TruthLens</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors duration-100 ${
                pathname === path
                  ? 'text-primary bg-bg-elevated'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/adiprabhu04/fake-news-detection"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 flex items-center gap-1.5 text-secondary hover:text-primary text-sm px-3 py-1.5 rounded-md border border-line hover:border-strong transition-colors duration-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
