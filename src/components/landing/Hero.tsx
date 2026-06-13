'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/motion'

const HEADLINE_WORDS_1 = ['COMMAND', 'YOUR', 'INBOX.']
const HEADLINE_WORDS_2 = ['OWN', 'YOUR', 'TIME.']

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8"
      >
        <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
        <span className="text-xs font-semibold text-primary tracking-wide uppercase">
          AI-First Command Center
        </span>
      </motion.div>

      <motion.h1
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] uppercase mb-8 max-w-5xl"
      >
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {HEADLINE_WORDS_1.map((word, i) => (
            <motion.span key={i} variants={staggerItem}
              className={word === 'INBOX.' ? 'text-gradient' : 'text-text-primary'}>
              {word}
            </motion.span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {HEADLINE_WORDS_2.map((word, i) => (
            <motion.span key={i} variants={staggerItem} className="text-text-primary">
              {word}
            </motion.span>
          ))}
        </div>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-mono"
      >
        Gmail and Calendar reimagined. Priority inbox, AI drafting, smart scheduling
        — all keyboard-first. Built for people who move fast.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-20"
      >
        <Link href="/login"
          className="btn-shimmer group flex items-center gap-2 bg-primary text-white font-semibold
                     px-8 py-4 rounded-2xl text-base
                     shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.7)]
                     hover:-translate-y-1 transition-all duration-200">
          Start for free
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <a href="#features"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-base font-medium">
          See how it works
          <span className="text-text-muted">&darr;</span>
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl mx-auto"
      >
        <div className="relative valora-glass rounded-2xl border border-white/[0.06] overflow-hidden
                        shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_60px_rgba(124,58,237,0.15)]">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.04] bg-white/[0.02]">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="ml-4 flex-1 h-6 bg-white/[0.04] rounded-md" />
          </div>
          <div className="flex h-64 md:h-96">
            <div className="w-14 border-r border-white/[0.04] flex flex-col items-center py-4 gap-4">
              {['📥','📅','🔍','🤖'].map((icon, i) => (
                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                  ${i === 0 ? 'bg-primary/30' : 'hover:bg-white/[0.04]'}`}>
                  {icon}
                </div>
              ))}
            </div>
            <div className="flex-1 p-3 space-y-1 overflow-hidden border-r border-white/[0.04]">
              {[
                { from: 'Alex Johnson', subj: 'Re: Q4 Budget Review', tag: 'HIGH', dot: true },
                { from: 'Sarah Chen', subj: 'Design feedback needed', tag: 'NORMAL', dot: true },
                { from: 'GitHub', subj: 'Your PR was merged', tag: 'LOW', dot: false },
                { from: 'Stripe', subj: 'Payment received $2,400', tag: 'HIGH', dot: false },
              ].map((email, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                    ${i === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/[0.03]'}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0
                    ${email.dot ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/40 to-indigo-500/40
                                  flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {email.from[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary truncate">{email.from}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono
                        ${email.tag === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                          email.tag === 'NORMAL' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-zinc-700 text-zinc-400'}`}>
                        {email.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted truncate">{email.subj}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="hidden md:block flex-1 p-4">
              <div className="text-xs text-text-muted font-mono mb-3">RE: Q4 BUDGET REVIEW</div>
              <div className="space-y-3">
                <div className="h-3 bg-white/[0.06] rounded-full w-full" />
                <div className="h-3 bg-white/[0.06] rounded-full w-4/5" />
                <div className="h-3 bg-white/[0.06] rounded-full w-full" />
                <div className="h-3 bg-white/[0.06] rounded-full w-3/5" />
              </div>
              <div className="mt-4 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                <span className="text-xs">&#x2728;</span>
                <span className="text-xs text-primary font-mono">AI Summary ready</span>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2
                     valora-glass rounded-xl px-3 py-2 border border-white/[0.08]"
        >
          <span className="text-xs text-text-secondary font-mono">Press</span>
          <kbd>&#x2318;K</kbd>
          <span className="text-xs text-text-secondary font-mono">to command</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2
                     valora-glass rounded-xl px-3 py-2 border border-white/[0.08]"
        >
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-text-secondary font-mono">47ms search</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
