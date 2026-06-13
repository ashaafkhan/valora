'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export function LandingNav() {
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 80], ['rgba(8,8,8,0)', 'rgba(8,8,8,0.9)'])
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)'])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl"
      style={{ backgroundColor: navBg, borderBottom: '1px solid', borderColor: navBorder }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 relative">
            <Image src="/valora_logo.png" alt="Valora" fill className="object-contain" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-text-primary">
            Valora
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'Privacy'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ','-')}`}
               className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login"
            className="hidden sm:block text-sm text-text-secondary hover:text-text-primary transition-colors">
            Sign in
          </Link>
          <Link href="/login"
            className="btn-shimmer relative text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-xl
                       shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]
                       transition-all duration-200 hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
