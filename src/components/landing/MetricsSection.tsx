'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const STATS_DATA = [
  { value: 177, suffix: '', prefix: '', label: 'Total Emails' },
  { value: 4, suffix: 'h', prefix: '2.', label: 'Response Time' },
  { value: 0, suffix: '', prefix: '', label: 'Unread Count' },
  { value: 12, suffix: '', prefix: '', label: 'Streak' },
]

function CountUp({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = (to / 1500) * 16
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to])
  return <span ref={ref}>{prefix}{count}{suffix}</span>
}

export function MetricsSection() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const volumes = [42, 58, 70, 48, 85, 35, 20]
  const priorities = [
    { label: 'URGENT', pct: 12, color: '#ef4444' },
    { label: 'HIGH', pct: 28, color: '#f59e0b' },
    { label: 'NORMAL', pct: 43, color: '#0066ff' },
    { label: 'LOW', pct: 17, color: '#52525b' },
  ]
  const activityHeights = [8, 12, 16, 22, 32, 45, 60, 75, 88, 96, 100, 96, 88, 75, 60, 45, 32, 22, 16, 12, 8]

  return (
    <section id="metrics" className="section-y section-x">
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
            ANALYTICS
            <span className="w-4 h-px bg-[var(--primary)]" />
          </span>
          <h2 className="font-sora text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1]">
            Every metric<br />
            <span className="text-gradient">at a glance.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Valora tracks your email performance, response times, and productivity gains in real time.
          </p>
        </motion.div>

        {/* Big stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {STATS_DATA.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
            >
              <div className="font-sora text-4xl font-extrabold text-gradient mb-2">
                <CountUp to={s.value} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Email Volume & Top Senders */}
          <div className="space-y-6">
            {/* Email Volume Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Email Volume</p>
                <span className="text-xs text-[var(--text-muted)]">This week</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-6">Daily emails processed by Zara</p>
              
              {/* Bar chart */}
              <div className="flex items-end justify-between gap-2 h-24">
                {volumes.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${v}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
                      className={`w-full rounded-t-md ${i === 4 ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
                      style={{ minHeight: 4 }}
                    />
                    <span className="text-[9px] text-[var(--text-muted)]">{days[i]}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Senders Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-4 uppercase tracking-wider">Top Senders</p>
              <div className="space-y-1">
                {[
                  { name: 'Rahul Sharma', count: 24, score: 92 },
                  { name: 'GitHub', count: 18, score: 40 },
                  { name: 'Stripe', count: 12, score: 55 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0">
                    <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[9px] font-bold text-[var(--primary)]">
                      {s.name[0]}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] flex-1">{s.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] mr-2">{s.count} emails</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                      ${s.score > 80 ? 'badge-urgent' : s.score > 50 ? 'badge-high' : 'badge-normal'}`}>
                      {s.score}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Priority Breakdown & Email Activity Bell Curve */}
          <div className="space-y-6">
            {/* Priority Breakdown Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Priority Breakdown</p>
              <p className="text-xs text-[var(--text-muted)] mb-6">How Zara categorises your inbox</p>
              <div className="space-y-4">
                {priorities.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">{p.label}</span>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{p.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                        className="h-full rounded-full"
                        style={{ background: p.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Email Activity Card (Bell Curve) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Email Activity</p>
                <span className="text-xs text-[var(--text-muted)]">Hourly Peak</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-6">Zara response distribution pattern</p>
              
              {/* Bell Curve Vertical Bars */}
              <div className="flex items-end justify-between gap-1 h-24 mt-4">
                {activityHeights.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] as const }}
                      className={`w-full rounded-t ${i >= 7 && i <= 13 ? 'bg-[var(--primary)]' : 'bg-[var(--border-strong)] opacity-40'}`}
                      style={{ minHeight: 2 }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
