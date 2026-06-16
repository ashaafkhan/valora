'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Roadmap', href: '/roadmap' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/30">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image src="/valora_logo.png" alt="Valora" fill className="object-contain" />
              </div>
              <span className="font-sora text-lg font-bold text-[var(--text-primary)]">Valora</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs mb-6">
              Command your inbox. Own your time. Powered by Zara — your personal AI that sends
              emails, books meetings, and finds anything.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.766l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', href: 'https://twitter.com/valorahq', label: 'X / Twitter' },
                { icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22', href: 'https://github.com/valorahq', label: 'GitHub' },
                { icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', href: 'https://linkedin.com/company/valorahq', label: 'LinkedIn' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--surface)]
                             flex items-center justify-center text-[var(--text-muted)]
                             hover:text-[var(--text-primary)] hover:border-[var(--primary)]/40
                             hover:bg-[var(--primary)]/5 transition-all duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">{group}</p>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 mb-8 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] w-fit">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-[var(--text-muted)]">All systems operational</span>
          <span className="text-xs text-[var(--text-muted)]">·</span>
          <span className="text-xs text-[var(--primary)]">99.9% uptime</span>
        </div>

        {/* Bottom strip */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)] font-mono">
            &copy; 2025 Valora · Built in India
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Command your inbox. Own your time.
          </p>
        </div>
      </div>
    </footer>
  )
}
