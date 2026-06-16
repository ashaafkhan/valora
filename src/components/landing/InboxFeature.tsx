'use client'
import { motion } from 'framer-motion'

/* Inline email/chat mockup for the right panel */
function InboxMockup() {
  const messages = [
    { from: 'Zara', text: 'I found 3 urgent emails. Want me to draft replies to all?', isZara: true },
    { from: 'You', text: 'Yes please, and move newsletters to a folder', isZara: false },
    { from: 'Zara', text: 'Done. 3 drafts saved. Newsletters archived. Kuch aur chahiye?', isZara: true },
  ]

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.3)]">
      {/* Green header bar */}
      <div className="bg-gradient-to-r from-[#0066ff] to-[#6366f1] px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8M4 8h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zM9 13v2M15 13v2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Zara</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            <span className="text-[10px] text-white/70">Online · processing your inbox</span>
          </div>
        </div>
      </div>

      {/* Email list */}
      <div className="border-b border-[var(--border)]">
        {[
          { from: 'Rahul Sharma', subject: 'Series A term sheet is ready', badge: 'URGENT', badgeClass: 'badge-urgent', unread: true },
          { from: 'Priya Mehta', subject: 'Design feedback on latest screens', badge: 'HIGH', badgeClass: 'badge-high', unread: true },
          { from: 'GitHub Notifications', subject: 'PR merged: feat/ai-summarizer', badge: 'NORMAL', badgeClass: 'badge-normal', unread: false },
        ].map((e, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0
            ${i === 0 ? 'bg-[var(--primary)]/5' : 'hover:bg-[var(--surface-hover)] transition-colors'}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.unread ? 'bg-[var(--primary)]' : 'bg-transparent'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate ${e.unread ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{e.from}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${e.badgeClass}`}>{e.badge}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{e.subject}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat messages */}
      <div className="p-4 space-y-3">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: m.isZara ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className={`flex ${m.isZara ? '' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
              ${m.isZara
                ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--text-secondary)] rounded-tl-none'
                : 'bg-[var(--primary)] text-white rounded-tr-none'
              }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
        {/* Typing indicator */}
        <div className="flex gap-1.5 items-center px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z', text: 'Smart AI Priority Engine — score 0-100' },
  { icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z', text: 'Auto-draft replies in your own tone' },
  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: 'Shield Mode — blurs sensitive content' },
  { icon: 'M21 21l-4.34-4.34M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', text: 'Sub-50ms vector search across all mail' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

export function InboxFeature() {
  return (
    <section id="features" className="section-y section-x">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left — Text */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest
                             uppercase text-[var(--primary)] mb-5">
              <span className="w-4 h-px bg-[var(--primary)]" />
              AI INBOX
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="font-sora text-4xl md:text-5xl font-extrabold tracking-tight
                       text-[var(--text-primary)] leading-[1.1] mb-6"
          >
            Your inbox<br />
            <span className="text-gradient">answers back.</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-base text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md">
            Zara reads every email, assigns a priority score from 0–100, and drafts
            intelligent replies — all before you open your inbox.
          </motion.p>

          <motion.ul variants={containerVariants} className="space-y-4 mb-8">
            {FEATURES.map((f, i) => (
              <motion.li key={i} variants={itemVariants} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/20
                                flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </div>
                <span className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.text}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.a
            variants={itemVariants}
            href="#features"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]
                       hover:gap-3 transition-all duration-200"
          >
            See inbox features
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.a>
        </motion.div>

        {/* Right — Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <InboxMockup />
        </motion.div>
      </div>
    </section>
  )
}
