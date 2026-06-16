'use client'
import { motion } from 'framer-motion'

const STEPS = [
  {
    step: '01',
    icon: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z',
    title: 'Connect in 30 seconds',
    desc: 'Sign in with Google. Valora gets secure OAuth 2.0 access to your Gmail and Google Calendar — no passwords stored, ever.',
    color: '#7c3aed',
  },
  {
    step: '02',
    icon: 'M12 8V4H8M4 8h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zM9 13v2M15 13v2',
    title: 'Meet Zara, your AI',
    desc: 'Zara reads your inbox, learns your writing style, and starts prioritising, summarising, and drafting replies immediately.',
    color: '#6366f1',
  },
  {
    step: '03',
    icon: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
    title: 'Command, don\'t click',
    desc: 'Type naturally. "Reply to Rahul about the term sheet." "Schedule a standup for tomorrow 9AM." Zara does the rest.',
    color: '#7c3aed',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-y section-x">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[var(--primary)] mb-5">
            <span className="w-4 h-px bg-[var(--primary)]" />
            HOW IT WORKS
            <span className="w-4 h-px bg-[var(--primary)]" />
          </span>
          <h2 className="font-sora text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1]">
            Built for how you<br />
            <span className="text-gradient">actually work.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Three steps from sign-up to inbox command. No setup wizards, no onboarding docs.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid md:grid-cols-3 gap-6 relative"
        >
          {/* Connecting dashes (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(33%+24px)] right-[calc(33%+24px)] h-px">
            <svg width="100%" height="2" className="overflow-visible">
              <line x1="0" y1="1" x2="100%" y2="1"
                stroke="rgba(124,58,237,0.3)" strokeWidth="1"
                strokeDasharray="6 4"
                className="animated-dash"
              />
            </svg>
          </div>

          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="card-lift group relative rounded-2xl border border-[var(--border)]
                         bg-[var(--surface)] p-7 overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                              bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.07)_0%,transparent_70%)]
                              pointer-events-none" />

              <div className="relative z-10">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: `${s.color}1a`, border: `1px solid ${s.color}30` }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon}/>
                    </svg>
                  </div>
                  <span className="font-sora text-4xl font-extrabold text-[var(--border-strong)]">{s.step}</span>
                </div>

                <h3 className="font-sora text-lg font-bold text-[var(--text-primary)] mb-3">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>

                {/* Mini demo for each step */}
                {i === 0 && (
                  <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)]">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm font-bold">G</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">Continue with Google</p>
                      <p className="text-[10px] text-[var(--text-muted)]">OAuth 2.0 · Read-only access</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                )}
                {i === 1 && (
                  <div className="mt-5 space-y-2">
                    {['Reading 127 emails…', 'Learning your tone…', 'Zara is ready!'].map((t, j) => (
                      <motion.div key={j} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: 0.3 + j * 0.2 }}
                        className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                          style={{ background: j === 2 ? '#10b981' : `${s.color}20` }}>
                          {j === 2
                            ? <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                            : <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                          }
                        </div>
                        {t}
                      </motion.div>
                    ))}
                  </div>
                )}
                {i === 2 && (
                  <div className="mt-5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] px-3 py-2.5">
                    <p className="text-[10px] text-[var(--text-muted)] mb-1">You said:</p>
                    <p className="text-xs text-[var(--text-secondary)] italic mb-2">"Reply to Rahul and book a call for Friday 3PM"</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-[10px] text-green-400 font-medium">Done · 2 actions completed</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
