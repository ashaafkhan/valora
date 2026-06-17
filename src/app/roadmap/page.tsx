import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import { Check, Clock, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "See what Valora is building next. Public product roadmap.",
};

const ROADMAP = {
  planned: [
    { title: "Mobile app (iOS + Android)", desc: "Native mobile experience for Valora", priority: "high" },
    { title: "Multi-account Gmail support", desc: "Switch between multiple Gmail accounts", priority: "high" },
    { title: "Outlook integration", desc: "Microsoft 365 and Outlook.com support", priority: "medium" },
    { title: "Slack integration", desc: "Get Valora summaries in Slack", priority: "medium" },
    { title: "Send later", desc: "Schedule emails to be sent at the right time", priority: "medium" },
    { title: "AI follow-up reminders", desc: "Zara reminds you to follow up on emails", priority: "low" },
  ],
  inProgress: [
    { title: "Voice commands for Zara", desc: "Speak to Zara instead of typing", priority: "high" },
    { title: "Weekly digest reports", desc: "Email yourself a weekly AI summary", priority: "medium" },
    { title: "Browser extension", desc: "Compose from anywhere in your browser", priority: "medium" },
  ],
  done: [
    { title: "Gmail integration", desc: "Read, send, archive, star, label emails" },
    { title: "Google Calendar", desc: "Full calendar sync and event management" },
    { title: "AI priority inbox", desc: "Automatic Urgent/High/Normal/Low scoring" },
    { title: "Keyboard shortcuts", desc: "Superhuman-grade keyboard navigation" },
    { title: "Multi-session Zara chat", desc: "Persistent AI conversations with context" },
    { title: "Vector search", desc: "Semantic search across all emails" },
  ],
};

const priorityColors = {
  high: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  medium: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  low: "bg-slate-100 text-slate-500 dark:bg-slate-900/20 dark:text-slate-400",
};

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-3">Product Roadmap</h1>
          <p className="text-lg text-[var(--text-muted)]">What we're building, what's in progress, and what's done.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Planned */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-[var(--text-muted)]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Planned</h2>
            </div>
            <div className="space-y-3">
              {ROADMAP.planned.map((item) => (
                <div key={item.title} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary">In Progress</h2>
            </div>
            <div className="space-y-3">
              {ROADMAP.inProgress.map((item) => (
                <div key={item.title} className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse mt-1.5 flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Done */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-4 h-4 text-success" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-success">Done</h2>
            </div>
            <div className="space-y-3">
              {ROADMAP.done.map((item) => (
                <div key={item.title} className="p-4 bg-success/5 border border-success/20 rounded-xl">
                  <div className="flex items-start gap-2 mb-1">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-6">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Have a feature request?{" "}
            <a href="mailto:hello@valorahq.in" className="text-primary hover:underline">
              Let us know →
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
