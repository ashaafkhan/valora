'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

function AnimatedBar({ height, delay = 0, active = false }: { height: number; delay?: number; active?: boolean }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex items-end justify-center" style={{ height: 80 }}>
      <motion.div
        initial={{ height: 0 }}
        animate={inView ? { height: `${height}%` } : { height: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`w-7 rounded-t-lg ${active ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
        style={{ minHeight: 4 }}
      />
    </div>
  )
}

const BARS = [
  [40, 55, 65, 45, 80, 60, 90], // Mon-Sun email volumes (percentages)
]

const STATS_DATA = [
  { value: 127, suffix: '', label: 'Emails / hour', color: 'text-gradient' },
  { value: 24, suffix: 's', prefix: '2.', label: 'Avg reply time', color: 'text-green-400' },
  { value: 0, suffix: '', label: 'Missed meetings', color: 'text-gradient' },
  { value: 12, suffix: '', label: 'Hours saved / wk', color: 'text-gradient' },
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
    { label: 'NORMAL', pct: 43, color: '#7c3aed' },
    { label: 'LOW', pct: 17, color: '#3f3f46' },
  ]

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

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${v}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-full rounded-t-md ${i === 4 ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[9px] text-[var(--text-muted)]">{days[i]}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Priority breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Top sender table */}
            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wider">Top Senders</p>
              {[
                { name: 'Rahul Sharma', count: 24, score: 92 },
                { name: 'GitHub', count: 18, score: 40 },
                { name: 'Stripe', count: 12, score: 55 },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[9px] font-bold text-[var(--primary)]">
                    {s.name[0]}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] flex-1">{s.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{s.count} emails</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                    ${s.score > 80 ? 'badge-urgent' : s.score > 50 ? 'badge-high' : 'badge-normal'}`}>
                    {s.score}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
