import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import { Zap, Brain, Shield, Keyboard, BookOpen, MessageSquare, Calendar, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description: "Discover how Valora's AI-powered features help you command your inbox and own your time.",
};

const FEATURES = [
  {
    icon: Zap,
    title: "AI Priority Inbox",
    description: "Automatic email classification into Urgent, High, Normal, and Low priority. Never miss what matters.",
    gradient: "from-red-500/10 to-orange-500/10",
    iconColor: "text-red-500",
  },
  {
    icon: Brain,
    title: "Zara — AI Copilot",
    description: "Multi-turn AI that reads, drafts, and sends emails on your behalf. Ask Zara anything.",
    gradient: "from-blue-500/10 to-violet-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Calendar,
    title: "Calendar Intelligence",
    description: "Schedule meetings from email context. Detect meeting requests and auto-create events.",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Shield,
    title: "Security Shield",
    description: "Automatically detects sensitive content — OTPs, bank details, medical info — and alerts you.",
    gradient: "from-amber-500/10 to-yellow-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Keyboard,
    title: "Keyboard-First",
    description: "Superhuman-grade shortcuts for power users. Navigate your entire inbox without touching the mouse.",
    gradient: "from-slate-500/10 to-zinc-500/10",
    iconColor: "text-slate-500",
  },
  {
    icon: BookOpen,
    title: "Digest",
    description: "Daily AI-generated summary of your most important emails. Start every morning informed.",
    gradient: "from-purple-500/10 to-indigo-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: MessageSquare,
    title: "Smart Compose",
    description: "AI that autocompletes your sentences and improves your writing tone in real-time.",
    gradient: "from-cyan-500/10 to-teal-500/10",
    iconColor: "text-cyan-500",
  },
  {
    icon: Brain,
    title: "Multi-Session AI Chat",
    description: "Multiple persistent conversations with Zara. Pick up where you left off, anytime.",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-indigo-500",
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/8 border border-primary/15 px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" />
            Everything you need
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] font-sora mb-4">
            Built for inbox zero.<br />
            <span className="text-primary">And beyond.</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Valora combines Gmail, Google Calendar, and AI into one command center. Here's what makes it different.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 card-lift"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} border border-current/10 flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Get Started Free
            <Zap className="w-4 h-4" />
          </a>
          <p className="text-xs text-[var(--text-muted)] mt-3">No credit card required</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
