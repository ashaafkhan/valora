import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "See what's new in Valora. Every update, improvement, and new feature.",
};

const CHANGELOG = [
  {
    version: "v2.0",
    date: "June 2026",
    title: "Full Revamp",
    highlights: [
      "Zara AI copilot with multi-turn chat sessions",
      "Light mode as default theme",
      "Digest — smart email intelligence hub",
      "Razorpay billing integration",
      "AI compose features (autocomplete, grammar, tone)",
      "Redesigned sidebar with keyboard-first navigation",
      "Smart reply suggestions below emails",
      "Email Insights panel in thread view",
      "Daily digest summary powered by Zara",
      "All static pages (features, pricing, blog, etc.)",
    ],
    type: "major",
  },
  {
    version: "v1.1",
    date: "May 2026",
    title: "AI Improvements",
    highlights: [
      "Zara now confirms before sending emails or creating events",
      "Priority inbox improved with better scoring",
      "Security shield for OTP and bank details detection",
      "Calendar quick-create from email context",
      "Keyboard shortcut cheat sheet",
    ],
    type: "minor",
  },
  {
    version: "v1.0",
    date: "April 2026",
    title: "Initial Launch",
    highlights: [
      "Gmail integration (read, send, archive, star, label)",
      "AI priority inbox — Urgent/High/Normal/Low",
      "Google Calendar sync (view, create, update, delete)",
      "AI agent backend with Groq llama-3.3-70b",
      "Vector search across emails (pgvector)",
      "Keyboard shortcuts for inbox navigation",
      "Settings: theme, AI toggles",
    ],
    type: "launch",
  },
];

const typeStyles = {
  major: { dot: "bg-primary", badge: "bg-primary/10 text-primary border-primary/20", label: "Major" },
  minor: { dot: "bg-success", badge: "bg-success/10 text-success border-success/20", label: "Minor" },
  launch: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Launch" },
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-3">Changelog</h1>
          <p className="text-lg text-[var(--text-muted)]">Every update to Valora, documented.</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-[var(--border)]" />

          <div className="space-y-10">
            {CHANGELOG.map((entry) => {
              const style = typeStyles[entry.type as keyof typeof typeStyles];
              return (
                <div key={entry.version} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full ${style.dot} border-4 border-[var(--background)] shadow-sm`} />

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{entry.version}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] font-mono">{entry.date}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{entry.title}</h2>
                    <ul className="space-y-2">
                      {entry.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="text-[var(--text-muted)] mt-1.5">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
