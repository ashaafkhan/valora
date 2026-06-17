'use client'
import { motion } from 'framer-motion'

function CalendarMockup() {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const dates = [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, null, null],
  ]
  const events: Record<number, { label: string; color: string }[]> = {
    9: [{ label: 'Standup', color: '#0066ff' }],
    15: [{ label: 'Investor call', color: '#ef4444' }, { label: 'Design review', color: '#6366f1' }],
    17: [{ label: 'Team sync', color: '#10b981' }],
    22: [{ label: 'Demo day', color: '#f59e0b' }],
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.3)]">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">June 2025</h4>
          <p className="text-xs text-[var(--text-muted)]">4 events this week</p>
        </div>
        <div className="flex gap-1.5">
          <button className="w-7 h-7 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button className="w-7 h-7 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-4 pt-3 pb-1">
        {days.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="px-4 pb-4 space-y-1">
        {dates.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((d, di) => (
              <div key={di} className={`relative min-h-[36px] rounded-lg p-1 text-center
                ${d === 15 ? 'bg-[var(--primary)]/15 border border-[var(--primary)]/25' : ''}
                ${d && d !== 15 ? 'hover:bg-[var(--surface-hover)] transition-colors cursor-pointer' : ''}
              `}>
                {d && (
                  <>
                    <span className={`text-[11px] font-medium leading-none
                      ${d === 15 ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                      {d}
                    </span>
                    {events[d] && (
                      <div className="mt-1 space-y-0.5">
                        {events[d].map((e, i) => (
                          <div key={i} className="text-[7px] truncate rounded px-0.5 py-px font-medium text-white"
                            style={{ background: e.color + 'cc' }}>
                            {e.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div className="border-t border-[var(--border)] px-5 py-4 space-y-3">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Upcoming</p>
        {[
          { title: 'Investor Call', time: 'Jun 15 · 3:00 PM', dot: '#ef4444', fromEmail: true },
          { title: 'Team Standup', time: 'Daily · 9:00 AM', dot: '#0066ff', fromEmail: false },
          { title: 'Demo Day', time: 'Jun 22 · 10:00 AM', dot: '#f59e0b', fromEmail: true },
        ].map((e, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.dot }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{e.title}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{e.time}</p>
            </div>
            {e.fromEmail && (
              <span className="text-[9px] text-[var(--primary)] border border-[var(--primary)]/25 bg-[var(--primary)]/10 rounded px-1.5 py-0.5 font-medium">
                from email
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Floating add card */}
      <div className="mx-4 mb-4 flex items-center gap-2.5 rounded-xl border border-[var(--primary)]/25
                      bg-[var(--primary)]/8 px-3 py-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
        </svg>
        <p className="text-xs text-[var(--text-secondary)] flex-1">
          <span className="font-semibold text-[var(--primary)]">Zara</span> detected a meeting request in your email
        </p>
        <button className="text-[10px] font-semibold text-[var(--primary)] hover:underline">Add</button>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: 'M22 9V7h-2V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8M14 14l8 8m-8 0 8-8', text: 'Smart meeting detection from emails' },
  { icon: 'M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01', text: 'One-click scheduling for all attendees' },
  { icon: 'M12 2a10 10 0 1 0 10 10h-2M12 2a10 10 0 0 1 10 10M12 2v4M12 12l4-4', text: 'Conflict detection and auto-rescheduling' },
  { icon: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z', text: 'Morning digest — your day at a glance' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

export function CalendarFeature() {
  return (
    <section className="section-y section-x bg-[var(--surface)]/30">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left — Calendar mockup */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <CalendarMockup />
        </motion.div>

        {/* Right — Text */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[var(--primary)] mb-5">
              <span className="w-4 h-px bg-[var(--primary)]" />
              CALENDAR
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="font-sora text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-6"
          >
            Your schedule,<br />
            <span className="text-gradient">always in view.</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-base text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md">
            Zara reads your emails for meeting requests and auto-fills your calendar.
            One command schedules for everyone — no back and forth.
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


        </motion.div>
      </div>
    </section>
  )
}
