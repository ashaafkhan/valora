'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    badge: 'Get Started',
    badgeColor: 'text-[var(--text-muted)] bg-[var(--surface-hover)] border-[var(--border)]',
    desc: 'Perfect for trying out Valora.',
    features: [
      '30 AI email summaries / month',
      '15 email composes / month',
      '5 voice messages / month',
      'Basic priority scoring',
      'Gmail sync',
      'Command palette',
    ],
    cta: 'Try standard edition',
    ctaClass: 'border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5',
    recommended: false,
    href: '/login',
  },
  {
    name: 'Pro',
    price: { monthly: 129, annual: 79 },
    badge: 'Popular',
    badgeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/25',
    desc: 'For professionals who live in their inbox.',
    features: [
      '150 AI messages / month',
      '50 email composes / month',
      '15 voice messages / month',
      'Smart reply drafting',
      'Full calendar integration',
      'Shield Mode',
    ],
    cta: 'Buy pro license',
    ctaClass: 'border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10',
    recommended: false,
    href: '/login',
  },
  {
    name: 'Pro Max',
    price: { monthly: 499, annual: 299 },
    badge: 'Best Value',
    badgeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/25',
    desc: 'Ultimate productivity for power users.',
    features: [
      '500 AI messages / month',
      '150 email composes / month',
      '30 voice messages / month',
      'Everything in Pro',
      'Priority support',
      'Analytics dashboard',
    ],
    cta: 'Buy pro max license',
    ctaClass: 'btn-shimmer bg-[var(--primary)] text-white shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:shadow-[0_0_50px_rgba(0,102,255,0.6)]',
    recommended: true,
    href: '/login',
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', annual: 'Custom' },
    badge: 'For Teams',
    badgeColor: 'text-[var(--text-secondary)] bg-[var(--surface-hover)] border-[var(--border)]',
    desc: 'Shared intelligence for your whole team.',
    features: [
      'Unlimited AI messages',
      'Unlimited email composes',
      'Unlimited voice messages',
      'Team shared inbox',
      'Custom integrations',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    ctaClass: 'border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5',
    recommended: false,
    href: 'mailto:ashaaf92@gmail.com',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="section-y section-x bg-[var(--surface)]/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[var(--primary)] mb-5">
            <span className="w-4 h-px bg-[var(--primary)]" />
            PRICING
            <span className="w-4 h-px bg-[var(--primary)]" />
          </span>
          <h2 className="font-sora text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1]">
            Simple, transparent<br />
            <span className="text-gradient">pricing.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-md mx-auto">
            Start free. Scale when you're ready. Cancel anytime — no questions asked.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium transition-colors ${!annual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-11 h-6 rounded-full border transition-all duration-300
                ${annual ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-[var(--surface-hover)] border-[var(--border)]'}`}
              aria-label="Toggle annual billing"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300
                ${annual ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${annual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
              Annual
            </span>
            {annual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/25 px-2 py-0.5 rounded-full"
              >
                Save 40%
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 items-start"
        >
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className={`relative rounded-2xl border bg-[var(--surface)] p-7 overflow-hidden
                ${plan.recommended
                  ? 'border-[var(--primary)]/40 shadow-[0_0_60px_rgba(0,102,255,0.15)] pricing-recommended md:-mt-4'
                  : 'border-[var(--border)]'
                }`}
            >
              {/* Recommended top gradient strip */}
              {plan.recommended && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" />
              )}

              {/* Badge */}
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border mb-5 ${plan.badgeColor}`}>
                {plan.recommended && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mr-1.5 animate-pulse" />}
                {plan.badge}
              </div>

              <h3 className="font-sora text-xl font-bold text-[var(--text-primary)] mb-1">{plan.name}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-5">{plan.desc}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-semibold text-[var(--text-secondary)]">₹</span>
                <motion.span
                  key={annual ? 'annual' : 'monthly'}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-sora text-5xl font-extrabold text-[var(--text-primary)]"
                >
                  {annual ? plan.price.annual : plan.price.monthly}
                </motion.span>
                <span className="text-sm text-[var(--text-muted)]">/mo</span>
              </div>

              {/* CTA */}
              <Link
                href={plan.href === '/login' ? `/login?callbackUrl=/billing?plan=${plan.name.toLowerCase()}` : plan.href}
                className={`block text-center text-sm font-semibold py-3 rounded-xl mb-7 
                            transition-all duration-200 hover:-translate-y-0.5 ${plan.ctaClass}`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <div className="pt-6 border-t border-[var(--border)]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
                  {i === 2 ? 'Everything in Pro, plus:' : "What's included:"}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                        ${plan.recommended ? 'bg-[var(--primary)]/20' : 'bg-[var(--surface-hover)]'}`}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                          stroke={plan.recommended ? 'var(--primary)' : 'var(--text-muted)'}
                          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-[var(--text-muted)] mt-8"
        >
          All plans include SSL encryption, OAuth 2.0 security, and GDPR compliance.
          <br />No credit card required for free plan.
        </motion.p>
      </div>
    </section>
  )
}
