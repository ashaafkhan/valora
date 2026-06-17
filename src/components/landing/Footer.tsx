'use client'
import Link from 'next/link'
import Image from 'next/image'

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
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

const SOCIAL_LINKS = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com/valora_hq',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.766l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/valora_hq/',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-12 h-12 relative flex-shrink-0 rounded-lg overflow-hidden bg-primary/5 border border-primary/10 flex items-center justify-center p-1.5">
                <Image src="/valora_logo.png" alt="Valora" fill className="object-contain logo-adaptive transition-all duration-300" />
              </div>
              <span className="font-sora text-2xl font-bold text-[var(--text-primary)]">Valora</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs mb-6">
              Valora helps you command your inbox and own your time.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]
                             flex items-center justify-center text-[var(--text-muted)]
                             hover:text-[var(--primary)] hover:border-[var(--primary)]/40
                             hover:bg-[var(--primary)]/5 transition-all duration-200"
                >
                  {s.icon}
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

        {/* Bottom strip */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)] font-mono">
            &copy; 2026 Valora
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Command your inbox. Own your time.
          </p>
        </div>
      </div>
    </footer>
  )
}
