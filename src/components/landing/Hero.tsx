'use client'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

/* ── Animated background: orbs + particles ───── */
function ParticleField({ isLight }: { isLight: boolean }) {
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
      <div className={`absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full transition-all duration-300
                      ${isLight 
                        ? 'bg-[radial-gradient(ellipse,rgba(0,102,255,0.04)_0%,transparent_65%)]' 
                        : 'bg-[radial-gradient(ellipse,rgba(0,102,255,0.2)_0%,transparent_65%)]'}
                      animate-[orbFloat_18s_ease-in-out_infinite]`} />
      {/* Indigo orb bottom-left */}
      <div className={`absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full transition-all duration-300
                      ${isLight 
                        ? 'bg-[radial-gradient(ellipse,rgba(99,102,241,0.03)_0%,transparent_65%)]' 
                        : 'bg-[radial-gradient(ellipse,rgba(99,102,241,0.15)_0%,transparent_65%)]'}
                      animate-[orbFloat_22s_ease-in-out_infinite_reverse]`} />
      {/* Center ambient */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] transition-all duration-300
                      ${isLight 
                        ? 'bg-[radial-gradient(ellipse,rgba(0,102,255,0.02)_0%,transparent_60%)]' 
                        : 'bg-[radial-gradient(ellipse,rgba(0,102,255,0.07)_0%,transparent_60%)]'}`} />
      {/* Grid */}
      <div className={`absolute inset-0 grid-pattern transition-opacity duration-300 ${isLight ? 'opacity-20' : 'opacity-60'}`} />
      {/* Stars */}
      {!isLight && particles.map(p => (
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
function DashboardMockup({ isLight }: { isLight: boolean }) {
  const [activeTab, setActiveTab] = useState<'inbox' | 'drafts' | 'sent' | 'calendar'>('inbox')
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0)
  const [selectedDraftId, setSelectedDraftId] = useState<number>(101)
  const [selectedSentId, setSelectedSentId] = useState<number>(201)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(17)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  interface Email {
    id: number
    from: string
    initials: string
    email: string
    time: string
    subject: string
    preview: string
    score: number
    priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
    unread: boolean
    color: string
    summary: string
    body: string
  }

  const [inboxEmails, setInboxEmails] = useState<Email[]>([
    {
      id: 1,
      from: 'Rahul Sharma',
      initials: 'RS',
      email: 'rahul@example.com',
      time: '2 min ago',
      subject: 'Series A term sheet ready',
      preview: 'Please review the attached document…',
      score: 98,
      priority: 'URGENT',
      unread: true,
      color: '#ef4444',
      summary: 'Investor has finalized the term sheet for Series A. Action required: sign by EOD Friday.',
      body: 'Hey, hope you are doing well. Our legal team and lead investors have finalized the Series A term sheet. Everything is set. Please review the attached document and sign it by EOD Friday so we can wire the funds next week.'
    },
    {
      id: 2,
      from: 'Google Calendar',
      initials: 'GC',
      email: 'calendar-notification@google.com',
      time: '15 min ago',
      subject: 'Meeting is scheduled',
      preview: 'You have been invited to: Valora Sync…',
      score: 92,
      priority: 'HIGH',
      unread: true,
      color: '#0066ff',
      summary: 'Valora Sync scheduled with the product and engineering teams at 3:00 PM today. 6 invitees.',
      body: 'Hi, a new meeting has been scheduled in your Google Calendar.\n\nEvent: Valora Weekly Product & Engineering Sync\nTime: 3:00 PM - 3:45 PM (GMT+5:30)\nInvitees: Rahul, Zara, Amit, Sneha, and 2 others.'
    },
    {
      id: 3,
      from: 'GitHub',
      initials: 'GH',
      email: 'noreply@github.com',
      time: '1 hour ago',
      subject: 'PR merged: valora',
      preview: 'Your pull request #128 has been…',
      score: 42,
      priority: 'NORMAL',
      unread: false,
      color: '#111115',
      summary: "Pull request #128 'feat/ai-composer' was successfully merged into main.",
      body: "GitHub Pull Request #128 Merged:\nBranch: feat/ai-composer -> main\nAuthor: Mohammed Ashaaf Khan\nReviewers: rahul-sharma (Approved)\n\nAll tests passed. Automatic deployment to staging is complete."
    },
    {
      id: 4,
      from: 'Stripe',
      initials: 'ST',
      email: 'billing@stripe.com',
      time: '3 hours ago',
      subject: 'Payment received ₹42,000',
      preview: 'A payment of ₹42,000 has been…',
      score: 55,
      priority: 'NORMAL',
      unread: false,
      color: '#10b981',
      summary: 'Successful payment of ₹42,000 received from client Rohan Kapoor for custom plan.',
      body: 'Stripe Payment Success\n\nAmount: ₹42,000.00 INR\nStatus: Paid\nCustomer: Rohan Kapoor\nDescription: Valora Pro License - Annual Plan'
    },
    {
      id: 5,
      from: 'ProductHunt',
      initials: 'PH',
      email: 'daily@producthunt.com',
      time: '5 hours ago',
      subject: 'Your product is trending',
      preview: 'Congratulations! Valora is #3…',
      score: 30,
      priority: 'LOW',
      unread: false,
      color: '#ea580c',
      summary: 'Valora is currently ranked #3 Product of the Day on Product Hunt.',
      body: 'Hey Hunter!\n\nWhat a launch! Valora is currently trending at #3 Product of the Day with 420 upvotes and 84 comments. Keep sharing!'
    }
  ])

  const [drafts, setDrafts] = useState([
    {
      id: 101,
      to: 'Rahul Sharma',
      email: 'rahul@example.com',
      subject: 'Re: Series A term sheet ready',
      preview: 'Draft: Hi Rahul, looked over the term sheet...',
      body: "Hi Rahul,\n\nI have reviewed the Series A term sheet and it looks solid. I am ready to sign. I'll execute the document via DocuSign today. Let's schedule a call tomorrow if we need to align on wiring instructions.",
      time: 'Drafted 1 min ago'
    },
    {
      id: 102,
      to: 'Google Calendar',
      email: 'calendar-notification@google.com',
      subject: 'Re: Meeting is scheduled',
      preview: 'Draft: Yes, I will attend the Valora Sync...',
      body: "Hi team,\n\nI confirm my attendance for the Valora Weekly Product & Engineering Sync at 3:00 PM. Looking forward to it.",
      time: 'Drafted 5 min ago'
    }
  ])

  const [sentEmails, setSentEmails] = useState([
    {
      id: 201,
      to: 'hr@valorahq.in',
      subject: 'Onboarding complete',
      preview: 'I have finished setting up my workspace...',
      body: "Hello,\n\nJust wanted to let you know I have successfully onboarded and set up my Valora Workspace. Zara is functioning perfectly.",
      time: 'Sent yesterday'
    }
  ])

  const [zaraChat, setZaraChat] = useState<Array<{ sender: 'zara' | 'user', message: string }>>([
    { sender: 'zara', message: 'Found 3 urgent emails. Want me to draft replies?' },
    { sender: 'user', message: 'Yes, and add standup at 9am' },
    { sender: 'zara', message: 'Done! Drafts ready. Standup added. Kuch aur?' }
  ])
  const [chatInput, setChatInput] = useState('')

  const handleSendDraft = (draftId: number) => {
    const draftToSend = drafts.find(d => d.id === draftId)
    if (draftToSend) {
      setSentEmails(prev => [
        {
          id: draftToSend.id,
          to: draftToSend.to,
          subject: draftToSend.subject,
          preview: draftToSend.preview,
          body: draftToSend.body,
          time: 'Just now'
        },
        ...prev
      ])
      setDrafts(prev => prev.filter(d => d.id !== draftId))
      if (selectedDraftId === draftId) {
        const remaining = drafts.filter(d => d.id !== draftId)
        const firstRemaining = remaining[0]
        if (firstRemaining) {
          setSelectedDraftId(firstRemaining.id)
        }
      }
      setToastMessage(`Draft sent to ${draftToSend.to}!`)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleSendChatMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg = text.trim()
    setZaraChat(prev => [...prev, { sender: 'user', message: userMsg }])
    setChatInput('')

    setTimeout(() => {
      let response = "I'm on it! Let me know if there's anything else you need."
      const lower = userMsg.toLowerCase()
      if (lower.includes('draft') || lower.includes('reply')) {
        response = "I've drafted a reply for you in the Drafts folder. Go ahead and review it!"
      } else if (lower.includes('calendar') || lower.includes('meeting') || lower.includes('standup') || lower.includes('schedule')) {
        response = "Got it, scheduled the meeting on your Calendar folder for today."
      } else if (lower.includes('send') && (lower.includes('draft') || lower.includes('rahul') || lower.includes('all'))) {
        const first = drafts[0]
        if (first) {
          handleSendDraft(first.id)
          response = `Sent! Draft to ${first.to} has been successfully delivered and logged in Sent folder.`
        } else {
          response = "No active drafts to send right now."
        }
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        response = "Hey! How can I help you manage your inbox and schedule today?"
      } else if (lower.includes('status') || lower.includes('work')) {
        response = "All systems operational. Connected to Gmail, Outlook, Stripe, and GitHub."
      }
      setZaraChat(prev => [...prev, { sender: 'zara', message: response }])
    }, 1000)
  }

  const handleDraftReplyFromEmail = (email: Email) => {
    const newDraftId = Date.now()
    const newDraft = {
      id: newDraftId,
      to: email.from,
      email: email.email,
      subject: `Re: ${email.subject}`,
      preview: `Draft: Hi ${email.from.split(' ')[0]}, thanks for the update...`,
      body: `Hi ${email.from.split(' ')[0]},\n\nThanks for reaching out about "${email.subject}". I received your message and will follow up shortly. Let me know if you need anything else in the meantime!`,
      time: 'Drafted just now'
    }
    setDrafts(prev => [newDraft, ...prev])
    setSelectedDraftId(newDraftId)
    setActiveTab('drafts')
    setToastMessage(`Draft generated for ${email.from}!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleAddCalendarFromEmail = (email: Email) => {
    setSelectedCalendarDay(17)
    setActiveTab('calendar')
    setToastMessage(`Added event from "${email.subject}" to calendar!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const priorityStyles: Record<string, string> = {
    URGENT: 'badge-urgent',
    HIGH: 'badge-high',
    NORMAL: 'badge-normal',
    LOW: 'badge-low',
  }

  const calendarEvents: Record<number, Array<{ time: string, title: string, color: string }>> = {
    17: [
      { time: '09:00 AM - 09:30 AM', title: 'Standup with Zara', color: '#0066ff' },
      { time: '03:00 PM - 03:45 PM', title: 'Valora Sync (Weekly)', color: '#0066ff' },
      { time: '06:00 PM - 07:00 PM', title: 'Review Term Sheet', color: '#ef4444' }
    ],
    18: [
      { time: '11:00 AM - 12:00 PM', title: 'Stripe Billing Setup', color: '#10b981' },
      { time: '02:00 PM - 03:00 PM', title: 'GitHub PR Review', color: '#333333' }
    ],
    19: [
      { time: '04:00 PM - 05:00 PM', title: 'Product Hunt Launch Prep', color: '#ea580c' }
    ]
  }

  const handleSelectEmail = (index: number) => {
    setSelectedEmailIndex(index)
    setInboxEmails(prev => prev.map((email, idx) => idx === index ? { ...email, unread: false } : email))
  }

  return (
    <div className={`w-full h-full flex flex-col text-[11px] select-none relative transition-colors duration-300 ${isLight ? 'bg-[#fdfbf7]' : 'bg-[#050507]'}`}>
      {/* Top bar */}
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b transition-colors duration-300 ${isLight ? 'border-black/[0.05] bg-[#f7f0e4]' : 'border-white/[0.06] bg-[#080810]'}`}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className={`flex-1 flex items-center gap-2 border rounded-md px-3 py-1 max-w-[280px] mx-auto transition-colors duration-300 ${isLight ? 'bg-black/[0.03] border-black/[0.05]' : 'bg-white/[0.05] border-white/[0.06]'}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.34-4.34" />
          </svg>
          <span className={`text-[9px] tracking-wide transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/30'}`}>app.valorahq.in/inbox</span>
        </div>
        <div className="w-16" />
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`w-[160px] border-r p-3 flex flex-col gap-1 flex-shrink-0 transition-colors duration-300 ${isLight ? 'border-black/[0.05] bg-[#f5ede0]' : 'border-white/[0.05] bg-[#030305]'}`}>
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0066ff] to-[#3b82f6] flex items-center justify-center text-[7px] font-bold text-white">V</div>
            <span className={`font-semibold text-[10px] tracking-tight transition-colors duration-300 ${isLight ? 'text-black/80' : 'text-white/90'}`}>Valora</span>
          </div>
          {[
            { icon: 'M22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7M2 4h20v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z', label: 'Inbox', badge: inboxEmails.filter(e => e.unread).length.toString() },
            { icon: 'M20 6 9 17l-5-5', label: 'Drafts', badge: drafts.length > 0 ? drafts.length.toString() : undefined },
            { icon: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z', label: 'Sent' },
            { icon: 'M8 2v4M16 2v4M3 10h18M21 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14z', label: 'Calendar' },
          ].map(item => {
            const isTabActive = activeTab === item.label.toLowerCase()
            return (
              <div
                key={item.label}
                onClick={() => setActiveTab(item.label.toLowerCase() as any)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors
                  ${isTabActive 
                    ? (isLight ? 'bg-[#0066ff]/10 text-[#0066ff] font-semibold' : 'bg-[#0066ff]/20 text-[#60a5fa]') 
                    : (isLight ? 'text-black/60 hover:bg-black/[0.04] hover:text-black/95' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70')}`}
              >
                <div className="flex items-center gap-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
                {item.badge && item.badge !== '0' && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${isLight ? 'bg-[#0066ff]/10 text-[#0066ff]' : 'bg-[#0066ff]/35 text-[#60a5fa]'}`}>{item.badge}</span>
                )}
              </div>
            )
          })}
          <div className={`mt-auto pt-2 border-t transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
            <div className="flex items-center gap-1.5 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className={`text-[8px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/30'}`}>Zara is online</span>
            </div>
          </div>
        </div>

        {/* Middle column: content depends on activeTab */}
        <div className={`w-[220px] border-r flex flex-col flex-shrink-0 transition-colors duration-300 ${isLight ? 'border-black/[0.05] bg-[#faf5ec]' : 'border-white/[0.05] bg-[#06060c]'}`}>
          {activeTab === 'inbox' && (
            <>
              <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
                <span className={`text-[10px] font-semibold ${isLight ? 'text-black/80' : 'text-white/80'}`}>Inbox</span>
                <button
                  onClick={() => {
                    const newDraftId = Date.now()
                    setDrafts(prev => [{
                      id: newDraftId,
                      to: 'new@example.com',
                      email: 'new@example.com',
                      subject: 'New Message',
                      preview: 'Draft: Write something here...',
                      body: 'Hi there,\n\n...',
                      time: 'Drafted just now'
                    }, ...prev])
                    setSelectedDraftId(newDraftId)
                    setActiveTab('drafts')
                  }}
                  className="text-[8px] bg-[#0066ff] text-white px-2 py-0.5 rounded-md font-medium hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Compose
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {inboxEmails.map((email, i) => {
                  const isSelected = i === selectedEmailIndex
                  return (
                    <div
                      key={email.id}
                      onClick={() => handleSelectEmail(i)}
                      className={`flex items-start gap-2 px-3 py-2.5 border-b cursor-pointer transition-colors
                        ${isSelected 
                          ? 'bg-[#0066ff]/10 border-l-2 border-l-[#0066ff]' 
                          : isLight ? 'border-black/[0.03] hover:bg-black/[0.015]' : 'border-white/[0.04] hover:bg-white/[0.02]'}`}
                    >
                      <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                        {email.unread ? (
                          <div className="w-1 h-1 rounded-full bg-[#0066ff] flex-shrink-0" />
                        ) : (
                          <div className="w-1 h-1 flex-shrink-0" />
                        )}
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0 transition-colors"
                          style={{ 
                            background: isLight ? `${email.color}15` : `${email.color}35`, 
                            color: isLight ? email.color : '#ffffff' 
                          }}
                        >
                          {email.initials}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-[9px] truncate transition-colors duration-300 ${email.unread ? (isLight ? 'font-semibold text-black/90' : 'font-semibold text-white/90') : (isLight ? 'text-black/50' : 'text-white/50')}`}>
                            {email.from}
                          </span>
                          <span className={`text-[7px] px-1 py-0.5 rounded font-bold flex-shrink-0 ${priorityStyles[email.priority]}`}>
                            {email.score}
                          </span>
                        </div>
                        <p className={`text-[8px] truncate transition-colors duration-300 ${email.unread ? (isLight ? 'text-black/70 font-medium' : 'text-white/70 font-medium') : (isLight ? 'text-black/35' : 'text-white/35')}`}>
                          {email.subject}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {activeTab === 'drafts' && (
            <>
              <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
                <span className={`text-[10px] font-semibold ${isLight ? 'text-black/80' : 'text-white/80'}`}>Drafts</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {drafts.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-full text-[9px] p-4 text-center ${isLight ? 'text-black/30' : 'text-white/30'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30 mb-1">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    No drafts ready
                  </div>
                ) : (
                  drafts.map((draft) => {
                    const isSelected = draft.id === selectedDraftId
                    return (
                      <div
                        key={draft.id}
                        onClick={() => setSelectedDraftId(draft.id)}
                        className={`flex items-start gap-2 px-3 py-2.5 border-b cursor-pointer transition-colors
                          ${isSelected 
                            ? 'bg-[#0066ff]/10 border-l-2 border-l-[#0066ff]' 
                            : isLight ? 'border-black/[0.03] hover:bg-black/[0.015]' : 'border-white/[0.04] hover:bg-white/[0.02]'}`}
                      >
                        <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0 transition-colors ${isLight ? 'bg-black/[0.05] text-black/60' : 'bg-white/[0.08] text-white'}`}>
                            D
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-[9px] font-semibold truncate transition-colors duration-300 ${isLight ? 'text-black/80' : 'text-white/80'}`}>
                              To: {draft.to}
                            </span>
                            <span className={`text-[7px] flex-shrink-0 transition-colors duration-300 ${isLight ? 'text-black/30' : 'text-white/30'}`}>Zara draft</span>
                          </div>
                          <p className={`text-[8px] truncate transition-colors duration-300 ${isLight ? 'text-black/60' : 'text-white/60'}`}>{draft.subject}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}

          {activeTab === 'sent' && (
            <>
              <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
                <span className={`text-[10px] font-semibold ${isLight ? 'text-black/80' : 'text-white/80'}`}>Sent</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {sentEmails.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-full text-[9px] p-4 text-center ${isLight ? 'text-black/30' : 'text-white/30'}`}>
                    No sent emails
                  </div>
                ) : (
                  sentEmails.map((sent) => {
                    const isSelected = sent.id === selectedSentId
                    return (
                      <div
                        key={sent.id}
                        onClick={() => setSelectedSentId(sent.id)}
                        className={`flex items-start gap-2 px-3 py-2.5 border-b cursor-pointer transition-colors
                          ${isSelected 
                            ? 'bg-[#0066ff]/10 border-l-2 border-l-[#0066ff]' 
                            : isLight ? 'border-black/[0.03] hover:bg-black/[0.015]' : 'border-white/[0.04] hover:bg-white/[0.02]'}`}
                      >
                        <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0 transition-colors ${isLight ? 'bg-black/[0.05] text-black/60' : 'bg-white/[0.08] text-white'}`}>
                            S
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-[9px] font-semibold truncate transition-colors duration-300 ${isLight ? 'text-black/80' : 'text-white/80'}`}>
                              To: {sent.to}
                            </span>
                            <span className={`text-[7px] flex-shrink-0 transition-colors duration-300 ${isLight ? 'text-black/30' : 'text-white/30'}`}>{sent.time}</span>
                          </div>
                          <p className={`text-[8px] truncate transition-colors duration-300 ${isLight ? 'text-black/60' : 'text-white/60'}`}>{sent.subject}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}

          {activeTab === 'calendar' && (
            <>
              <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
                <span className={`text-[10px] font-semibold ${isLight ? 'text-black/80' : 'text-white/80'}`}>Calendar Grid</span>
                <span className={`text-[8px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/40'}`}>June 2026</span>
              </div>
              <div className="flex-1 p-2.5 flex flex-col justify-start">
                <div className={`grid grid-cols-7 gap-1 text-center text-[7px] font-semibold mb-1 transition-colors duration-300 ${isLight ? 'text-black/30' : 'text-white/30'}`}>
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  <div className="h-4" />
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1
                    const isSelected = day === selectedCalendarDay
                    const isToday = day === 17
                    const hasEvents = !!calendarEvents[day]
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedCalendarDay(day)}
                        className={`h-4.5 w-full rounded flex flex-col items-center justify-center text-[8px] transition-colors relative cursor-pointer
                          ${isSelected 
                            ? 'bg-[#0066ff] text-white font-bold' 
                            : isToday 
                              ? (isLight ? 'border border-[#0066ff] text-[#0066ff] font-semibold' : 'border border-[#0066ff] text-[#60a5fa]') 
                              : isLight ? 'hover:bg-black/[0.04] text-black/70' : 'hover:bg-white/[0.05] text-white/70'}`}
                      >
                        <span>{day}</span>
                        {hasEvents && !isSelected && (
                          <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#0066ff]" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className={`mt-4 border rounded-lg p-2 transition-colors duration-300 ${isLight ? 'bg-black/[0.01] border-black/[0.05]' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                  <p className={`text-[7.5px] font-mono uppercase tracking-wider mb-1 transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/40'}`}>Quick Actions</p>
                  <button
                    onClick={() => {
                      setToastMessage("Synced with Google Calendar!")
                      setTimeout(() => setToastMessage(null), 3000)
                    }}
                    className="w-full text-left text-[8px] text-[#0066ff] hover:underline flex items-center gap-1 py-1 cursor-pointer"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    Sync Calendar Now
                  </button>
                  <button
                    onClick={() => {
                      setToastMessage(`Added Standup to June ${selectedCalendarDay}!`)
                      setTimeout(() => setToastMessage(null), 3000)
                    }}
                    className={`w-full text-left text-[8px] hover:underline flex items-center gap-1 py-1 cursor-pointer ${isLight ? 'text-black/60 hover:text-black' : 'text-white/60 hover:text-white'}`}
                  >
                    + Add standup event
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail + Zara: Right panel */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${isLight ? 'bg-[#fdfbf7]' : 'bg-[#030306]'}`}>
          {activeTab === 'inbox' && (
            <>
              {(() => {
                const email = inboxEmails[selectedEmailIndex]
                if (!email) return <div className={`flex-1 flex items-center justify-center text-[9px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Select an email</div>
                return (
                  <div className={`flex-1 p-3 border-b overflow-y-auto custom-scrollbar flex flex-col justify-between transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className={`text-[10px] font-semibold transition-colors duration-300 ${isLight ? 'text-black/90' : 'text-white/90'}`}>{email.from}</p>
                          <p className={`text-[8px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/40'}`}>{email.email} · {email.time}</p>
                        </div>
                        <span className={`${priorityStyles[email.priority]} text-[7px] px-1.5 py-0.5 rounded font-bold`}>
                          {email.priority} · {email.score}
                        </span>
                      </div>
                      <p className={`text-[9px] font-semibold transition-colors duration-300 ${isLight ? 'text-black/80' : 'text-white/80'}`}>{email.subject}</p>
                      <p className={`text-[8.5px] leading-relaxed whitespace-pre-line mb-3 border p-2 rounded-lg transition-colors duration-300 ${isLight ? 'bg-black/[0.01] border-black/[0.04] text-black/75' : 'bg-white/[0.01] border-white/[0.02] text-white/60'}`}>
                        {email.body}
                      </p>
                    </div>

                    {/* AI Summary Card */}
                    <div className={`border rounded-lg p-2 mt-auto transition-colors duration-300 ${isLight ? 'bg-[#0066ff]/5 border-[#0066ff]/15' : 'bg-[#0066ff]/10 border-[#0066ff]/20'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                        </svg>
                        <span className="text-[8px] font-semibold text-[#60a5fa]">Zara's Summary</span>
                      </div>
                      <p className={`text-[8px] leading-relaxed transition-colors duration-300 ${isLight ? 'text-black/70' : 'text-white/70'}`}>{email.summary}</p>
                      <div className="flex gap-1.5 mt-2">
                        <button
                          onClick={() => handleDraftReplyFromEmail(email)}
                          className={`text-[7.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${isLight ? 'bg-black/[0.03] text-black/60 hover:bg-black/5 hover:text-black border-black/[0.06]' : 'bg-white/[0.07] text-white/60 hover:bg-white/10 hover:text-white border-white/[0.08]'}`}
                        >
                          Draft Reply
                        </button>
                        <button
                          onClick={() => handleAddCalendarFromEmail(email)}
                          className={`text-[7.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${isLight ? 'bg-black/[0.03] text-black/60 hover:bg-black/5 hover:text-black border-black/[0.06]' : 'bg-white/[0.07] text-white/60 hover:bg-white/10 hover:text-white border-white/[0.08]'}`}
                        >
                          Add to Calendar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Zara chat */}
              <div className={`flex flex-col h-[130px] border-t transition-colors duration-300 ${isLight ? 'bg-[#f5ede0] border-black/[0.05]' : 'bg-[#040408] border-white/[0.05]'}`}>
                <div className={`flex items-center gap-2 px-3 py-1.5 border-b transition-colors duration-300 ${isLight ? 'border-black/[0.05] bg-[#faf5ec]' : 'border-white/[0.05] bg-[#06060c]'}`}>
                  <div className="w-4 h-4 rounded-full bg-[#0066ff]/20 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                      <path d="M12 8V4H8M4 8h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zM9 13v2M15 13v2" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-semibold text-[#60a5fa]">Zara AI Agent</span>
                  <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse ml-auto" />
                </div>
                <div className={`flex-1 px-3 py-1.5 space-y-1.5 overflow-y-auto custom-scrollbar text-[8.5px] transition-colors duration-300 ${isLight ? 'bg-[#fdfbf7]' : 'bg-transparent'}`}>
                  {zaraChat.map((chat, idx) => {
                    const isUser = chat.sender === 'user'
                    return (
                      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`px-2 py-1 rounded-lg max-w-[85%] leading-relaxed border transition-colors duration-300
                            ${isUser
                              ? (isLight ? 'bg-[#0066ff] text-white border-transparent rounded-tr-none' : 'bg-[#0066ff]/20 border-[#0066ff]/30 text-white/95 rounded-tr-none')
                              : (isLight ? 'bg-black/[0.03] border-black/[0.05] text-black/85 rounded-tl-none' : 'bg-white/[0.03] border-white/[0.06] text-white/70 rounded-tl-none')}`}
                        >
                          {chat.message}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className={`p-1.5 border-t flex gap-1.5 transition-colors duration-300 ${isLight ? 'border-black/[0.05] bg-[#fdfbf7]' : 'border-white/[0.05] bg-[#030306]'}`}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendChatMessage(chatInput)
                      }
                    }}
                    placeholder="Ask Zara to draft, reply, schedule..."
                    className={`flex-1 border rounded px-2 py-1 text-[8.5px] focus:outline-none transition-colors duration-300 ${isLight ? 'bg-black/[0.02] border-black/[0.08] text-black focus:border-[#0066ff]/40 placeholder-black/30' : 'bg-white/[0.04] border-white/[0.06] text-white focus:border-[#0066ff]/50 placeholder-white/20'}`}
                  />
                  <button
                    onClick={() => handleSendChatMessage(chatInput)}
                    className="bg-[#0066ff] hover:bg-blue-600 text-white px-2.5 py-0.5 rounded text-[8px] font-semibold transition-colors cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'drafts' && (
            <>
              {(() => {
                const draft = drafts.find(d => d.id === selectedDraftId)
                if (!draft) return <div className={`flex-1 flex items-center justify-center text-[9px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Select a draft</div>
                return (
                  <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col gap-2">
                      <div className={`border-b pb-2 transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
                        <p className={`text-[8.5px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/40'}`}>To: <span className={`transition-colors duration-300 ${isLight ? 'text-black/80' : 'text-white/80'}`}>{draft.to} ({draft.email})</span></p>
                        <p className={`text-[8.5px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/40'}`}>Subject: <span className={`transition-colors duration-300 ${isLight ? 'text-black/80' : 'text-white/80'}`}>{draft.subject}</span></p>
                      </div>
                      <div className={`text-[9px] leading-relaxed font-mono whitespace-pre-line border p-3 rounded-lg min-h-[140px] focus:outline-none transition-colors duration-300 ${isLight ? 'bg-black/[0.01] border-black/[0.06] text-black/85 focus:border-[#0066ff]/30' : 'bg-white/[0.01] border-white/[0.05] text-white/85 focus:border-white/10'}`} contentEditable={true} suppressContentEditableWarning={true}>
                        {draft.body}
                      </div>
                    </div>

                    <div className={`border rounded-lg p-2 mt-4 flex items-center justify-between transition-colors duration-300 ${isLight ? 'bg-[#0066ff]/5 border-[#0066ff]/15' : 'bg-[#0066ff]/10 border-[#0066ff]/20'}`}>
                      <div>
                        <p className="text-[8px] font-semibold text-[#60a5fa] flex items-center gap-1">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          Ready to Send
                        </p>
                        <p className={`text-[7.5px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/50'}`}>Reviewed and verified by Zara</p>
                      </div>
                      <button
                        onClick={() => handleSendDraft(draft.id)}
                        className="text-[8px] bg-[#0066ff] hover:bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-md shadow-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        Send Draft
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })()}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {(() => {
                const sent = sentEmails.find(s => s.id === selectedSentId)
                if (!sent) return <div className={`flex-1 flex items-center justify-center text-[9px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Select a sent message</div>
                return (
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className={`border-b pb-2 mb-3 transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
                      <p className={`text-[9px] font-semibold transition-colors duration-300 ${isLight ? 'text-black/90' : 'text-white/90'}`}>To: {sent.to}</p>
                      <p className={`text-[8px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/40'}`}>{sent.time}</p>
                    </div>
                    <p className={`text-[9.5px] font-semibold transition-colors duration-300 ${isLight ? 'text-black/90' : 'text-white/90'}`}>{sent.subject}</p>
                    <div className={`text-[9px] leading-relaxed whitespace-pre-line border p-3 rounded-lg flex-1 transition-colors duration-300 ${isLight ? 'bg-black/[0.01] border-black/[0.04] text-black/75' : 'bg-white/[0.01] border-white/[0.02] text-white/70'}`}>
                      {sent.body}
                    </div>
                  </div>
                )
              })()}
            </>
          )}

          {activeTab === 'calendar' && (
            <>
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col">
                <div className={`border-b pb-2 mb-3 transition-colors duration-300 ${isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'}`}>
                  <h3 className={`text-[10px] font-semibold transition-colors duration-300 ${isLight ? 'text-black/95' : 'text-white/95'}`}>Events: June {selectedCalendarDay}, 2026</h3>
                  <p className={`text-[8px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/40'}`}>Schedule details and priority tasks</p>
                </div>
                <div className="flex-1 space-y-2">
                  {!calendarEvents[selectedCalendarDay] || calendarEvents[selectedCalendarDay].length === 0 ? (
                    <div className={`h-32 flex flex-col items-center justify-center text-[9.5px] border border-dashed rounded-xl transition-colors duration-300 ${isLight ? 'border-black/[0.08] text-black/30' : 'border-white/[0.05] text-white/30'}`}>
                      No events scheduled for today
                    </div>
                  ) : (
                    calendarEvents[selectedCalendarDay].map((event, idx) => (
                      <div key={idx} className={`border rounded-lg p-2.5 flex items-center justify-between transition-colors duration-300 ${isLight ? 'bg-black/[0.01] border-black/[0.04] hover:bg-black/[0.02]' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.03]'}`}>
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: event.color }} />
                          <div className="min-w-0">
                            <p className={`text-[9px] font-medium truncate transition-colors duration-300 ${isLight ? 'text-black/85' : 'text-white/80'}`}>{event.title}</p>
                            <p className={`text-[8px] transition-colors duration-300 ${isLight ? 'text-black/40' : 'text-white/40'}`}>{event.time}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setToastMessage(`Details for: ${event.title}`)
                            setTimeout(() => setToastMessage(null), 3000)
                          }}
                          className="text-[7.5px] text-[#60a5fa] hover:underline flex-shrink-0 cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#0066ff] text-white text-[8.5px] font-semibold px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Hero() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLight = mounted && theme === 'light'

  const { scrollY } = useScroll()
  const mockupY = useTransform(scrollY, [0, 500], [0, 80])
  const mockupOpacity = useTransform(scrollY, [0, 400], [1, 0.4])

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-28 pb-16">
      <ParticleField isLight={isLight} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >

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
          Visualise your AI assistant side by side. Calendar, inbox, emails, templates and analytics synced in real time.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/login"
            className="group flex items-center gap-2 bg-[var(--text-primary)] text-[var(--background)]
                       font-semibold px-8 py-4 rounded-2xl text-base
                       shadow-[0_0_30px_rgba(255,255,255,0.15)]
                       hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]
                       hover:-translate-y-1 transition-all duration-200"
          >
            Try standard edition
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a href="#pricing" className="flex items-center gap-2 valora-glass border border-[var(--border-glass)] text-[var(--text-secondary)]
                             hover:text-[var(--text-primary)] font-medium px-8 py-4 rounded-2xl text-base
                             transition-all duration-200 hover:-translate-y-0.5">
            Buy pro license
          </a>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          style={{ y: mockupY, opacity: mockupOpacity }}
          className="relative mx-auto"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
        >
          {/* Floating badges & animated connection lines */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-visible hidden lg:block">
            {/* SVG lines */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 102, 255, 0.35))' }}>
              <defs>
                <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path d="M 80,-40 Q 150,-10 250,40" fill="none" stroke="url(#line-grad)" strokeWidth="1.5" strokeDasharray="6 4" className="animated-dash" />
              <path d="M 850,-40 Q 780,-10 680,40" fill="none" stroke="url(#line-grad)" strokeWidth="1.5" strokeDasharray="6 4" className="animated-dash" />
              <path d="M -80,180 Q 20,180 120,160" fill="none" stroke="url(#line-grad)" strokeWidth="1.5" strokeDasharray="6 4" className="animated-dash" />
              <path d="M 1000,200 Q 900,190 800,160" fill="none" stroke="url(#line-grad)" strokeWidth="1.5" strokeDasharray="6 4" className="animated-dash" />
              <path d="M -40,360 Q 40,340 140,300" fill="none" stroke="url(#line-grad)" strokeWidth="1.5" strokeDasharray="6 4" className="animated-dash" />
              <path d="M 960,340 Q 880,330 780,280" fill="none" stroke="url(#line-grad)" strokeWidth="1.5" strokeDasharray="6 4" className="animated-dash" />
            </svg>

            {/* Badges */}
            <div className={`absolute -top-12 left-[8%] flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-semibold transition-all duration-300 pointer-events-auto
              ${isLight 
                ? 'border-black/[0.06] bg-white/70 text-black/80 shadow-[0_4px_15px_rgba(0,102,255,0.06)]' 
                : 'border-white/[0.08] bg-black/60 text-white/90 shadow-[0_0_15px_rgba(0,102,255,0.15)]'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Gmail
            </div>
            <div className={`absolute -top-12 right-[8%] flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-semibold transition-all duration-300 pointer-events-auto
              ${isLight 
                ? 'border-black/[0.06] bg-white/70 text-black/80 shadow-[0_4px_15px_rgba(0,102,255,0.06)]' 
                : 'border-white/[0.08] bg-black/60 text-white/90 shadow-[0_0_15px_rgba(0,102,255,0.15)]'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Outlook
            </div>
            <div className={`absolute top-[180px] -left-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-semibold transition-all duration-300 pointer-events-auto
              ${isLight 
                ? 'border-black/[0.06] bg-white/70 text-black/80 shadow-[0_4px_15px_rgba(0,102,255,0.06)]' 
                : 'border-white/[0.08] bg-black/60 text-white/90 shadow-[0_0_15px_rgba(0,102,255,0.15)]'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Proton
            </div>
            <div className={`absolute top-[200px] -right-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-semibold transition-all duration-300 pointer-events-auto
              ${isLight 
                ? 'border-black/[0.06] bg-white/70 text-black/80 shadow-[0_4px_15px_rgba(0,102,255,0.06)]' 
                : 'border-white/[0.08] bg-black/60 text-white/90 shadow-[0_0_15px_rgba(0,102,255,0.15)]'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              Yandex
            </div>
            <div className={`absolute bottom-[100px] -left-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-semibold transition-all duration-300 pointer-events-auto
              ${isLight 
                ? 'border-black/[0.06] bg-white/70 text-black/80 shadow-[0_4px_15px_rgba(0,102,255,0.06)]' 
                : 'border-white/[0.08] bg-black/60 text-white/90 shadow-[0_0_15px_rgba(0,102,255,0.15)]'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Apple Mail
            </div>
            <div className={`absolute bottom-[120px] -right-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-semibold transition-all duration-300 pointer-events-auto
              ${isLight 
                ? 'border-black/[0.06] bg-white/70 text-black/80 shadow-[0_4px_15px_rgba(0,102,255,0.06)]' 
                : 'border-white/[0.08] bg-black/60 text-white/90 shadow-[0_0_15px_rgba(0,102,255,0.15)]'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Live Mail
            </div>
          </div>

          {/* Floating cards */}
          <div className={`float-card-1 absolute -top-5 -left-8 z-20 hidden md:flex items-center gap-2.5
                           valora-glass border border-[var(--border-glass)] rounded-xl px-3 py-2.5 transition-all duration-300
                           ${isLight ? 'shadow-[0_12px_36px_rgba(0,0,0,0.06)]' : 'shadow-[0_20px_60px_rgba(0,0,0,0.4)]'}`}>
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">Reply drafted</p>
              <p className="text-[10px] text-[var(--text-muted)]">Re: Series A term sheet</p>
            </div>
          </div>

          <div className={`float-card-2 absolute -top-5 -right-8 z-20 hidden md:flex items-center gap-2.5
                           valora-glass border border-[var(--border-glass)] rounded-xl px-3 py-2.5 transition-all duration-300
                           ${isLight ? 'shadow-[0_12px_36px_rgba(0,0,0,0.06)]' : 'shadow-[0_20px_60px_rgba(0,0,0,0.4)]'}`}>
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4M16 2v4M3 10h18M21 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">Meeting scheduled</p>
              <p className="text-[10px] text-[var(--text-muted)]">Thu 3PM · 6 invitees</p>
            </div>
          </div>

          <div className={`float-card-3 absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2.5
                           valora-glass border border-[var(--border-glass)] rounded-xl px-3 py-2.5 transition-all duration-300
                           ${isLight ? 'shadow-[0_12px_36px_rgba(0,0,0,0.06)]' : 'shadow-[0_20px_60px_rgba(0,0,0,0.4)]'}`}>
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <p className="text-xs font-semibold text-red-400">URGENT · Score 98</p>
            <p className="text-[10px] text-[var(--text-muted)]">Series A review</p>
          </div>

          {/* Main mockup container */}
          <div
            className={`relative rounded-2xl overflow-hidden border transition-all duration-300
                       ${isLight 
                         ? 'shadow-[0_15px_45px_rgba(0,0,0,0.05),0_0_30px_rgba(0,102,255,0.02)] border-black/[0.05]' 
                         : 'shadow-[0_60px_160px_rgba(0,0,0,0.7),0_0_80px_rgba(0,102,255,0.15)] border-white/[0.08]'}`}
            style={{ transform: 'perspective(1200px) rotateX(6deg) rotateY(-2deg)', transformOrigin: 'center bottom' }}
          >
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent pointer-events-none z-10" />
            {/* Dashboard */}
            <div className="w-full" style={{ height: '480px' }}>
              <DashboardMockup isLight={isLight} />
            </div>
          </div>

          {/* Bottom fade */}
          <div className={`absolute bottom-0 left-0 right-0 h-10 z-10 pointer-events-none bg-gradient-to-t
                          ${isLight ? 'from-[#fdf8f0]' : 'from-[#050507]'} to-transparent`} />
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
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
