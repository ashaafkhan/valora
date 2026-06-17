import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import { Mail, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the team building the future of email at Valora.",
};

const VALUES = [
  { emoji: "⚡", title: "Move fast", desc: "We ship weekly. No process for process's sake." },
  { emoji: "🔍", title: "Obsess over details", desc: "Polish is a feature. Good enough isn't." },
  { emoji: "🤝", title: "Be direct", desc: "No politics. No hierarchy. Just good work." },
  { emoji: "🌏", title: "Remote-first", desc: "Async by default. Results, not hours." },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-4">Work at Valora</h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">
            We're a small, ambitious team building the email client we always wanted. If that sounds exciting, we'd love to hear from you.
          </p>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5">How we work</h2>
          <div className="grid grid-cols-2 gap-3">
            {VALUES.map((v) => (
              <div key={v.title} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <div className="text-2xl mb-2">{v.emoji}</div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{v.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* No open roles */}
        <div className="text-center p-12 bg-[var(--surface)] border border-[var(--border)] rounded-2xl mb-8">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">No open roles right now</h2>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
            We don't have any positions open at the moment, but we're always interested in exceptional people.
          </p>
        </div>

        {/* Spontaneous */}
        <div className="p-6 bg-primary/5 border border-primary/15 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Send us a spontaneous application</h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            If you love email, productivity, and AI, and you believe you can make Valora better — reach out. Tell us who you are and what you'd build.
          </p>
          <a
            href="mailto:careers@valorahq.in"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-4 h-4" />
            careers@valorahq.in
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
