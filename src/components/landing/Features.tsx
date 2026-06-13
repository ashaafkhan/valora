'use client'
import { motion } from 'framer-motion'
import { Inbox, Zap, Shield, Calendar, Keyboard, BrainCircuit } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/motion'

const FEATURES = [
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: 'AI Priority Engine',
    desc: 'Every email scored 0–100. Critical gets surfaced instantly. Newsletters buried automatically.',
    wide: true,
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Shield Mode',
    desc: 'Sensitive emails (bank details, passwords) are detected and blurred until you choose to reveal.',
    wide: false,
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Smart Scheduling',
    desc: 'AI finds open slots across attendee calendars. One click to send.',
    wide: false,
  },
  {
    icon: <Keyboard className="w-6 h-6" />,
    title: 'Keyboard First',
    desc: 'Every action has a shortcut. Navigate your entire inbox without touching the mouse.',
    wide: false,
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Sub-1s Search',
    desc: 'Vector search across your entire inbox. Results in under 50ms.',
    wide: false,
  },
  {
    icon: <Inbox className="w-6 h-6" />,
    title: 'Unified Dashboard',
    desc: 'Gmail and Calendar in one command center. Zero context switching.',
    wide: true,
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
            Capabilities
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 text-text-primary">
            Built for how you actually work
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className={`card-lift valora-glass rounded-2xl p-6 border border-white/[0.06] cursor-default
                ${f.wide ? 'md:col-span-2' : 'md:col-span-1'}`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20
                              flex items-center justify-center text-primary mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
