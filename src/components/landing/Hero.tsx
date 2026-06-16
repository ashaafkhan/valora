'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

/* ── Animated background: orbs + particles ───── */
function ParticleField() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 3,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Purple orb top-right */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full
                      bg-[radial-gradient(ellipse,rgba(124,58,237,0.2)_0%,transparent_65%)]
                      animate-[orbFloat_18s_ease-in-out_infinite]" />
      {/* Indigo orb bottom-left */}
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full
                      bg-[radial-gradient(ellipse,rgba(99,102,241,0.15)_0%,transparent_65%)]
                      animate-[orbFloat_22s_ease-in-out_infinite_reverse]" />
      {/* Center ambient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px]
                      bg-[radial-gradient(ellipse,rgba(124,58,237,0.07)_0%,transparent_60%)]" />
      {/* Grid */}
      <div className="absolute inset-0 grid-pattern opacity-60" />
      {/* Stars */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: 0.15 + Math.random() * 0.25,
            animation: `starTwinkle ${p.duration}s ease-in-out infinite ${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Inline Dashboard Mockup ─────────────────── */
function DashboardMockup() {
  const emails = [
    { from: 'Rahul Sharma', initials: 'RS', subject: 'Series A term sheet ready', preview: 'Please review the attached document…', score: 98, priority: 'URGENT', unread: true, color: '#ef4444' },
    { from: 'Priya Mehta', initials: 'PM', subject: 'Design feedback needed', preview: 'Hi, can you check the new flows…', score: 79, priority: 'HIGH', unread: true, color: '#f59e0b' },
    { from: 'GitHub', initials: 'GH', subject: 'PR merged: feat/ai-composer', preview: 'Your pull request was successfully…', score: 42, priority: 'NORMAL', unread: false, color: '#6d28d9' },
    { from: 'Stripe', initials: 'ST', subject: 'Payment received ₹42,000', preview: 'A payment of ₹42,000 has been…', score: 55, priority: 'NORMAL', unread: false, color: '#10b981' },
    { from: 'ProductHunt', initials: 'PH', subject: 'Your product is trending', preview: 'Congratulations! Valora is #3…', score: 30, priority: 'LOW', unread: false, color: '#f59e0b' },
  ]
  const priorityStyles: Record<string, string> = {
    URGENT: 'badge-urgent',
    HIGH: 'badge-high',
    NORMAL: 'badge-normal',
    LOW: 'badge-low',
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#050507] text-[11px] select-none">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06] bg-[#080810]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex items-center gap-2 bg-white/[0.05] border border-white/[0.06] rounded-md px-3 py-1 max-w-[280px] mx-auto">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/>
          </svg>
          <span className="text-[9px] text-white/30 tracking-wide">app.valorahq.in/inbox</span>
        </div>
        <div className="w-16" />
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[160px] border-r border-white/[0.05] bg-[#030305] p-3 flex flex-col gap-1 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-[7px] font-bold text-white">V</div>
            <span className="font-semibold text-[10px] text-white/90 tracking-tight">Valora</span>
          </div>
          {[
            { icon: 'M22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7M2 4h20v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z', label: 'Inbox', active: true, badge: '12' },
            { icon: 'M20 6 9 17l-5-5', label: 'Drafts', active: false },
            { icon: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z', label: 'Sent', active: false },
            { icon: 'M8 2v4M16 2v4M3 10h18M21 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14z', label: 'Calendar', active: false },
          ].map(item => (
            <div key={item.label} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer
              ${item.active ? 'bg-[#7c3aed]/20 text-[#c4b5fd]' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'}`}>
              <div className="flex items-center gap-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                <span className={`text-[10px] font-medium ${item.active ? '' : ''}`}>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[8px] bg-[#7c3aed]/40 text-[#c4b5fd] px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
              )}
            </div>
          ))}
          <div className="mt-auto pt-2 border-t border-white/[0.05]">
            <div className="flex items-center gap-1.5 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[8px] text-white/30">Zara is online</span>
            </div>
          </div>
        </div>

        {/* Email list */}
        <div className="w-[220px] border-r border-white/[0.05] flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05]">
            <span className="text-[10px] font-semibold text-white/80">Inbox</span>
            <button className="text-[8px] bg-[#7c3aed] text-white px-2 py-0.5 rounded-md font-medium">Compose</button>
          </div>
          <div className="flex-1 overflow-hidden">
            {emails.map((email, i) => (
              <div key={i} className={`flex items-start gap-2 px-3 py-2.5 border-b border-white/[0.04] cursor-pointer transition-colors
                ${i === 0 ? 'bg-[#7c3aed]/10 border-l-2 border-l-[#7c3aed]' : 'hover:bg-white/[0.02]'}`}>
                <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  {email.unread && <div className="w-1 h-1 rounded-full bg-[#7c3aed] flex-shrink-0" />}
                  {!email.unread && <div className="w-1 h-1 flex-shrink-0" />}
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0"
                    style={{ background: `${email.color}40` }}>
                    {email.initials}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`text-[9px] truncate ${email.unread ? 'font-semibold text-white/90' : 'text-white/50'}`}>{email.from}</span>
                    <span className={`text-[7px] px-1 py-0.5 rounded font-bold flex-shrink-0 ${priorityStyles[email.priority]}`}>{email.score}</span>
                  </div>
                  <p className={`text-[8px] truncate ${email.unread ? 'text-white/70 font-medium' : 'text-white/35'}`}>{email.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail + Zara */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Email detail top */}
          <div className="flex-1 p-4 border-b border-white/[0.05]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold text-white/90">Rahul Sharma</p>
                <p className="text-[8px] text-white/40">rahul@example.com · 2 min ago</p>
              </div>
              <span className="badge-urgent text-[8px] px-1.5 py-0.5 rounded font-bold">URGENT · 98</span>
            </div>
            <p className="text-[9px] font-semibold text-white/80 mb-2">Series A term sheet ready</p>
            {/* AI Summary */}
            <div className="bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg p-2.5 mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
                </svg>
                <span className="text-[8px] font-semibold text-[#818cf8]">Zara's Summary</span>
              </div>
              <p className="text-[8px] text-white/60 leading-relaxed">Investor has finalized the term sheet for Series A. Action required: sign by EOD Friday.</p>
              <div className="flex gap-1.5 mt-2">
                {['Draft Reply', 'Add to Calendar', 'Mark Urgent'].map(a => (
                  <button key={a} className="text-[7px] px-1.5 py-0.5 rounded bg-white/[0.07] text-white/60 hover:bg-white/10 border border-white/[0.08]">{a}</button>
                ))}
              </div>
            </div>
          </div>
          {/* Zara chat */}
          <div className="flex flex-col h-[140px] bg-[#030305]">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.05]">
              <div className="w-4 h-4 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                  <path d="M12 8V4H8M4 8h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zM9 13v2M15 13v2"/>
                </svg>
              </div>
              <span className="text-[9px] font-semibold text-[#818cf8]">Zara</span>
              <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse ml-auto" />
            </div>
            <div className="flex-1 px-3 py-2 space-y-2 overflow-hidden">
              <div className="flex gap-1.5">
                <div className="text-[8px] bg-[#6366f1]/15 border border-[#6366f1]/20 text-white/70 px-2 py-1.5 rounded-lg rounded-tl-none max-w-[80%] leading-relaxed">
                  Found 3 urgent emails. Want me to draft replies?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="text-[8px] bg-[#7c3aed]/30 border border-[#7c3aed]/30 text-white/80 px-2 py-1.5 rounded-lg rounded-tr-none max-w-[80%]">
                  Yes, and add standup at 9am
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="text-[8px] bg-[#6366f1]/15 border border-[#6366f1]/20 text-white/70 px-2 py-1.5 rounded-lg rounded-tl-none max-w-[80%] leading-relaxed">
                  Done! Drafts ready. Standup added. Kuch aur?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const { scrollY } = useScroll()
  const mockupY = useTransform(scrollY, [0, 500], [0, 80])
  const mockupOpacity = useTransform(scrollY, [0, 400], [1, 0.4])

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-28 pb-16">
      <ParticleField />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-7">
          <div className="inline-flex items-center gap-2 bg-[var(--primary)]/10 border border-[var(--primary)]/25
                          rounded-full px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--primary)] tracking-widest uppercase">
              AI-First Command Center · Meet Zara
            </span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={itemVariants}
          className="font-sora font-extrabold tracking-tight leading-[1.0] mb-7"
          style={{ fontSize: 'clamp(52px, 8vw, 96px)' }}
        >
          <span className="text-[var(--text-primary)]">Gmail. Calendar.</span>
          <br />
          <span className="text-gradient">One Brain.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Valora reads your inbox, drafts replies, and books meetings —
          powered by <span className="text-[var(--text-primary)] font-semibold">Zara</span>, your personal AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/login"
            className="btn-shimmer group flex items-center gap-2 bg-[var(--primary)] text-white
                       font-semibold px-8 py-4 rounded-2xl text-base
                       shadow-[0_0_40px_rgba(124,58,237,0.45)]
                       hover:shadow-[0_0_60px_rgba(124,58,237,0.65)]
                       hover:-translate-y-1 transition-all duration-200"
          >
            Start for free
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <button className="flex items-center gap-2 valora-glass border border-[var(--border-glass)] text-[var(--text-secondary)]
                             hover:text-[var(--text-primary)] font-medium px-8 py-4 rounded-2xl text-base
                             transition-all duration-200 hover:-translate-y-0.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4V8z"/>
            </svg>
            Watch Demo
          </button>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          style={{ y: mockupY, opacity: mockupOpacity }}
          className="relative mx-auto"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Floating cards */}
          <div className="float-card-1 absolute -top-5 -left-8 z-20 hidden md:flex items-center gap-2.5
                           valora-glass border border-[var(--border-glass)] rounded-xl px-3 py-2.5
                           shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">Reply drafted</p>
              <p className="text-[10px] text-[var(--text-muted)]">Re: Series A term sheet</p>
            </div>
          </div>

          <div className="float-card-2 absolute -top-5 -right-8 z-20 hidden md:flex items-center gap-2.5
                           valora-glass border border-[var(--border-glass)] rounded-xl px-3 py-2.5
                           shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4M16 2v4M3 10h18M21 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">Meeting scheduled</p>
              <p className="text-[10px] text-[var(--text-muted)]">Thu 3PM · 6 invitees</p>
            </div>
          </div>

          <div className="float-card-3 absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2.5
                           valora-glass border border-[var(--border-glass)] rounded-xl px-3 py-2.5
                           shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <p className="text-xs font-semibold text-red-400">URGENT · Score 98</p>
            <p className="text-[10px] text-[var(--text-muted)]">Series A review</p>
          </div>

          {/* Main mockup container */}
          <div
            className="relative rounded-2xl overflow-hidden border border-white/[0.08]
                       shadow-[0_60px_160px_rgba(0,0,0,0.7),0_0_80px_rgba(124,58,237,0.15)]"
            style={{ transform: 'perspective(1200px) rotateX(6deg) rotateY(-2deg)', transformOrigin: 'center bottom' }}
          >
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent pointer-events-none z-10" />
            {/* Dashboard */}
            <div className="w-full" style={{ height: '480px' }}>
              <DashboardMockup />
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32
                          bg-gradient-to-t from-[var(--background)] to-transparent z-10 pointer-events-none" />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--text-muted)]"
      >
        <span className="text-[10px] tracking-widest uppercase font-mono">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
