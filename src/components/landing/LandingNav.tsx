'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Metrics', href: '#metrics' },
  { label: 'Pricing', href: '#pricing' },
]

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isLight = mounted && theme === 'light'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-colors duration-300
        ${scrolled 
          ? (isLight ? 'bg-[#fdf8f0]/80 backdrop-blur-md shadow-sm' : 'bg-[#050507]/80 backdrop-blur-md shadow-sm') 
          : 'bg-transparent'}`}
    >
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3 border transition-all duration-300
          ${scrolled 
            ? (isLight ? 'border-black/[0.06] bg-white/40' : 'border-white/[0.06] bg-white/[0.02]') 
            : 'border-transparent bg-transparent'}`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-11 h-11 relative flex-shrink-0">
            <Image src="/valora_logo.png" alt="Valora" fill className="object-contain logo-adaptive transition-all duration-300" />
          </div>
          <span className="font-sora text-2xl font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap">
            Valora
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(item => (
            <a
              key={item.label}
              href={item.href}
              className="px-3.5 py-2 rounded-xl text-sm text-[var(--text-secondary)]
                         hover:text-[var(--text-primary)] hover:bg-white/[0.05]
                         transition-all duration-200 font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--surface)]
                       flex items-center justify-center text-[var(--text-secondary)]
                       hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]
                       transition-all duration-200 cursor-pointer"
            aria-label="Toggle theme"
          >
            {isLight ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            )}
          </button>

          <Link
            href="/docs"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                       transition-colors px-3 py-2 font-medium"
          >
            Docs
          </Link>
          <Link
            href="/login"
            className="btn-shimmer relative text-sm font-semibold bg-[var(--primary)] text-white
                       px-5 py-2.5 rounded-xl
                       shadow-[0_0_20px_rgba(0,102,255,0.35)]
                       hover:shadow-[0_0_35px_rgba(0,102,255,0.55)]
                       hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-2 mx-4 valora-glass rounded-2xl p-4 border border-[var(--border)]"
        >
          {NAV_LINKS.map(item => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm text-[var(--text-secondary)]
                         hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-all"
            >
              {item.label}
            </a>
          ))}
          <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
            <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium text-[var(--text-secondary)]">Sign in</Link>
            <Link href="/login" className="flex-1 text-center py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold">Get Started</Link>
          </div>
        </motion.div>
      )}
    </header>
  )
}
