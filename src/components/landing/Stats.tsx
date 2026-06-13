'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const end = to
    const duration = 1500
    const step = (end / duration) * 16
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to])

  return <span ref={ref}>{count}{suffix}</span>
}

const STATS = [
  { value: 47, suffix: 'ms', label: 'Search latency' },
  { value: 100, suffix: '%', label: 'Keyboard navigable' },
  { value: 99, suffix: '.9%', label: 'Uptime SLA' },
  { value: 3, suffix: 'x', label: 'Faster than Gmail' },
]

export function Stats() {
  return (
    <section className="py-16 px-6 border-y border-white/[0.04]">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="font-display text-4xl md:text-5xl font-bold text-gradient">
              <CountUp to={s.value} suffix={s.suffix} />
            </div>
            <div className="text-sm text-text-muted mt-1 font-mono">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
