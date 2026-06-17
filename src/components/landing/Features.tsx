'use client'
import { motion } from 'framer-motion'

const FEATURES = [
  {
    title: 'Smart Reply',
    desc: 'AI drafts context-aware replies in your writing style before you even open the thread.',
    icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
    wide: false,
    demo: (
      <div className="mt-4 space-y-2">
        {['Re: Series A Review', 'Re: Design Feedback'].map((s, i) => (
          <div key={i} className="flex items-center gap-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-xs text-[var(--text-secondary)]">{s}</span>
            <span className="ml-auto text-[10px] font-mono text-[var(--primary)]">drafting…</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Shield Mode',
    desc: 'Sensitive content like account numbers and passwords are blurred until you choose to reveal them.',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    wide: false,
    demo: (
      <div className="mt-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] p-3 font-mono text-xs text-[var(--text-muted)] space-y-1.5">
        <p>Account: <span className="blur-sm select-none bg-[var(--border)] rounded px-1">4521 •••• ••••</span></p>
        <p>Password: <span className="blur-sm select-none bg-[var(--border)] rounded px-1">•••••••••</span></p>
        <div className="flex items-center gap-1.5 mt-2 text-[var(--primary)]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" /></svg>
          <span className="text-[10px]">Reveal</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Smart Compose',
    desc: 'Type your intent in plain language. Zara writes the full professional email for you.',
    icon: 'M3 5h12M9 3v2M7.5 21H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3m-9 8.5h10m0 0-3-3m3 3-3 3',
    wide: false,
    demo: (
      <div className="mt-4">
        <div className="rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] p-3">
          <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Your intent:</p>
          <p className="text-xs text-[var(--text-secondary)] mb-2.5">"Follow up with Ananya about the Q3 report"</p>
          <div className="h-px bg-[var(--border)] mb-2.5" />
          <p className="text-[10px] text-[var(--primary)] mb-1">Zara wrote:</p>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">Hi Ananya, Just following up on the Q3 report — could you share the latest version when you get a chance?…</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Send Later',
    desc: 'Schedule emails to send at the perfect time. Zara even suggests the optimal send window.',
    icon: 'M12 2a10 10 0 1 0 10 10h-2M12 2a10 10 0 0 1 10 10M12 2v4M12 12l4-4',
    wide: false,
    demo: (
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {['9:00 AM', 'Tomorrow', 'Mon 9AM', 'Best time', 'Custom', '+'].map((t, i) => (
          <button key={i} className={`text-[10px] rounded-lg border px-2 py-1.5 font-medium transition-colors
            ${i === 3
              ? 'bg-[var(--primary)]/20 border-[var(--primary)]/30 text-[var(--primary)]'
              : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/30'
            }`}>
            {t}
          </button>
        ))}
      </div>
    ),
  },
  {
    title: 'Lightning Search',
    desc: 'Full-text vector search across your entire inbox. Find anything in under 50 milliseconds.',
    icon: 'M21 21l-4.34-4.34M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    wide: true,
    demo: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-3 py-2.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.34-4.34" />
          </svg>
          <span className="text-sm text-[var(--text-muted)]">investor term sheet</span>
          <span className="ml-auto font-mono text-[10px] text-green-400">47ms</span>
        </div>
        <div className="space-y-1.5">
          {['Rahul Sharma · Series A term sheet ready…', 'Angel Investor · Pre-money valuation terms…', 'Legal Team · Term sheet signature required…'].map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors cursor-pointer">
              <div className="w-6 h-6 rounded-md bg-[var(--primary)]/15 flex items-center justify-center text-[9px] font-bold text-[var(--primary)]">{i + 1}</div>
              <span className="text-[10px] text-[var(--text-secondary)] truncate">{r}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Keyboard First',
    desc: 'Every action is one keystroke away. Never lift your hands from the keyboard again.',
    icon: 'M17 17H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2zM13 13v-2M11 13v-2M7 13v-2',
    wide: false,
    demo: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[['G I', 'Inbox'], ['G D', 'Drafts'], ['?', 'Help'], ['J K', 'Navigate'], ['R', 'Reply'], ['Cmd K', 'Command']].map(([k, v]) => (
          <div key={k} className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <kbd className="text-[10px] bg-[var(--primary)]/15 border-[var(--primary)]/20 text-[var(--primary)]">{k}</kbd>
            <span className="text-[9px] text-[var(--text-muted)]">{v}</span>
          </div>
        ))}
      </div>
    ),
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

export function Features() {
  return (
    <section className="section-y section-x bg-[var(--surface)]/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[var(--primary)] mb-5">
            <span className="w-4 h-px bg-[var(--primary)]" />
            CAPABILITIES
            <span className="w-4 h-px bg-[var(--primary)]" />
          </span>
          <h2 className="font-sora text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1]">
            Full Gmail control.<br />
            <span className="text-gradient">Zero compromise.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Everything you need to command your inbox — and nothing you don't.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className={`card-lift group relative rounded-2xl border border-[var(--border)]
                          bg-[var(--surface)] p-6 overflow-hidden
                          ${f.wide ? 'md:col-span-2' : ''}`}
            >
              {/* Subtle top-left glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                              bg-[radial-gradient(ellipse_at_0%_0%,rgba(0,102,255,0.08)_0%,transparent_60%)]
                              pointer-events-none" />

              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/20
                                flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-sora text-base font-bold text-[var(--text-primary)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                {f.demo}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
