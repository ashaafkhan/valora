'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

function ParticleOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full
                      bg-[radial-gradient(ellipse,rgba(124,58,237,0.25)_0%,transparent_65%)]
                      animate-[orbFloat_14s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full
                      bg-[radial-gradient(ellipse,rgba(99,102,241,0.2)_0%,transparent_65%)]
                      animate-[orbFloat_18s_ease-in-out_infinite_reverse]" />
    </div>
  )
}

export function CTASection() {
  return (
    <section className="relative section-y section-x overflow-hidden">
      <ParticleOrbs />

      {/* Border top/bottom */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[var(--primary)]/10 border border-[var(--primary)]/25 rounded-full px-4 py-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span className="text-xs font-semibold text-[var(--primary)] tracking-wider">Start in 30 seconds</span>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-sora font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
        >
          Ready to own<br />
          <span className="text-gradient">your inbox?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-[var(--text-secondary)] mb-10 max-w-lg mx-auto"
        >
          Connect your Gmail in one click. No credit card required.
          Join 10,000+ professionals who saved 12 hrs/week.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="btn-shimmer group flex items-center gap-2.5 bg-[var(--primary)] text-white
                       font-semibold px-10 py-4 rounded-2xl text-base
                       shadow-[0_0_50px_rgba(124,58,237,0.5)]
                       hover:shadow-[0_0_80px_rgba(124,58,237,0.7)]
                       hover:-translate-y-1 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
            </svg>
            Get Started Free — It's Free
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-10 flex-wrap"
        >
          {[
            { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: 'OAuth 2.0 Secured' },
            { icon: 'M20 6 9 17l-5-5', text: 'No credit card' },
            { icon: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z', text: 'Cancel anytime' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon}/>
              </svg>
              {t.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
