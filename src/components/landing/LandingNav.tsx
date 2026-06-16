'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useTheme } from 'next-themes'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Metrics', href: '#metrics' },
  { label: 'Pricing', href: '#pricing' },
]

export function LandingNav() {
  const { scrollY } = useScroll()
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const navBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(5,5,7,0)', 'rgba(5,5,7,0.85)']
  )
  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)']
  )
  const navBlur = useTransform(scrollY, [0, 100], [0, 20])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      style={{ backgroundColor: navBg }}
    >
      <motion.div
        className="max-w-6xl mx-auto flex items-center justify-between
                   rounded-2xl px-5 py-3 border"
        style={{
          backgroundColor: useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.03)']),
          borderColor: navBorder,
          backdropFilter: useTransform(navBlur, v => `blur(${v}px)`) as unknown as string,
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 relative flex-shrink-0">
            <Image src="/valora_logo.png" alt="Valora" fill className="object-contain" />
          </div>
          <span className="font-sora text-base font-bold tracking-tight text-[var(--text-primary)]">
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
                       transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
              </svg>
            )}
          </button>

          <Link
            href="/login"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                       transition-colors px-3 py-2 font-medium"
          >
            Sign in
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
      </motion.div>

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
    </motion.header>
  )
}
