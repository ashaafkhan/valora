import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import { Check, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Valora. Start free, upgrade when you're ready.",
};

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Getting started",
    features: [
      "30 AI messages/month",
      "1 voice input/month",
      "10 email compose/month",
      "1,000 char message limit",
      "Gmail access",
      "Google Calendar access",
    ],
    notIncluded: ["Smart replies", "Priority support"],
    cta: "Get Started Free",
    href: "/login",
    highlight: false,
  },
  {
    name: "Standard",
    price: "₹99",
    oldPrice: "₹199",
    period: "month",
    description: "For individual professionals",
    features: [
      "150 AI messages/month",
      "15 voice inputs/month",
      "50 email compose/month",
      "5,000 char message limit",
      "Full Zara AI (agentic)",
      "Smart reply suggestions",
      "Email support",
      "Gmail + Calendar access",
    ],
    cta: "Upgrade to Standard",
    href: "/billing",
    highlight: true,
    badge: "🔥 Early Access",
  },
  {
    name: "Premium",
    price: "₹499",
    period: "month",
    description: "For power users",
    features: [
      "500 AI messages/month",
      "30 voice inputs/month",
      "150 email compose/month",
      "10,000 char message limit",
      "Everything in Standard",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Upgrade to Premium",
    href: "/billing",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "₹2,999",
    period: "month",
    description: "For teams",
    features: [
      "Unlimited AI messages",
      "Unlimited voice input",
      "Unlimited email compose",
      "Unlimited char limit",
      "Custom integrations",
      "Dedicated support",
      "Team management",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@valorahq.in",
    highlight: false,
  },
];

const FAQ = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.",
  },
  {
    q: "What happens when I hit my AI message limit?",
    a: "You'll see a prompt to upgrade. Your inbox and calendar continue to work normally — only AI features are paused until you upgrade or your cycle resets.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. Valora uses OAuth 2.0 for Gmail and Calendar — we never store your Google password. Email content is processed locally and not sent to third-party AI servers for summarization.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day refund policy for all paid plans. Contact us at billing@valorahq.in within 7 days of your purchase.",
  },
  {
    q: "What is the Early Access offer?",
    a: "During our launch period, Standard plan is available at ₹99/mo instead of ₹199/mo. This price is locked in for as long as you stay subscribed.",
  },
  {
    q: "How does the Enterprise plan work?",
    a: "Enterprise is custom-priced based on team size and requirements. Contact sales@valorahq.in for a demo and custom quote.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] font-sora mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Early Access Banner */}
        <div className="mb-8 px-5 py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3 max-w-2xl mx-auto">
          <Zap className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-[var(--text-primary)]">
            <strong>🔥 Early Access Offer:</strong> Standard plan is ₹99/mo instead of ₹199/mo. Limited time.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
                plan.highlight
                  ? "border-primary/40 bg-primary/5 shadow-xl shadow-primary/10"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-4">
                  <span className="text-[10px] font-bold bg-primary text-white px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{plan.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{plan.description}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                  <span className="text-sm text-[var(--text-muted)]">/{plan.period}</span>
                </div>
                {"oldPrice" in plan && plan.oldPrice && (
                  <div className="mt-1">
                    <span className="text-xs text-[var(--text-muted)] line-through">{plan.oldPrice}/mo</span>
                    <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Save ₹100</span>
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                    : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{item.q}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 text-center p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-xl mx-auto">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Need something custom?</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">Enterprise plans include custom integrations, dedicated support, and unlimited everything.</p>
          <a
            href="mailto:sales@valorahq.in"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            Contact Sales →
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
