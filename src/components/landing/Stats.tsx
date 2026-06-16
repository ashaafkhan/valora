'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

function CountUp({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const step = (to / duration) * 16
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to])

  return <span ref={ref}>{prefix}{count}{suffix}</span>
}

const STATS = [
  { value: 127, suffix: '', label: 'Emails processed / hour', icon: 'M22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7M2 4h20v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z' },
  { value: 24, suffix: 's', prefix: '2.', label: 'Average reply drafted', icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' },
  { value: 0, suffix: '', label: 'Missed meetings', icon: 'M8 2v4M16 2v4M3 10h18M21 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14z' },
  { value: 12, suffix: '', label: 'Hours saved / week', icon: 'M12 2a10 10 0 1 0 10 10h-2M12 2a10 10 0 0 1 10 10M12 2v4M12 12l4-4' },
]

export function Stats() {
  return (
    <section className="py-14 px-6 border-y border-[var(--border)]">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`flex flex-col items-center py-6 px-4 text-center
              ${i < 3 ? 'border-r border-[var(--border)]' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20
                            flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={s.icon}/>
              </svg>
            </div>
            <div className="font-sora text-3xl md:text-4xl font-extrabold text-gradient mb-1">
              <CountUp to={s.value} suffix={s.suffix} prefix={s.prefix} />
            </div>
            <div className="text-xs text-[var(--text-muted)] font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
