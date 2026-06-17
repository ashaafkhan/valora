import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import { Download, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Press",
  description: "Press kit, media assets, and contact information for Valora.",
};

const FACTS = [
  { label: "Founded", value: "2026" },
  { label: "Headquarters", value: "India" },
  { label: "Category", value: "Productivity / AI" },
  { label: "Stage", value: "Early Access" },
  { label: "Pricing", value: "Freemium (₹99/mo+)" },
  { label: "Integrations", value: "Gmail + Google Calendar" },
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-3">Press</h1>
          <p className="text-lg text-[var(--text-muted)]">
            Resources for journalists, bloggers, and creators writing about Valora.
          </p>
        </div>

        {/* About blurb */}
        <div className="mb-8 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">About Valora (boilerplate)</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Valora is an AI-native email and calendar command center that combines Gmail, Google Calendar, and Zara — an agentic AI — into one keyboard-first interface. Built in India, Valora helps professionals manage their inbox with AI-powered priority scoring, multi-turn AI conversations, and smart compose features. Valora is available on the web with plans starting free.
          </p>
          <button className="mt-3 text-xs text-primary hover:underline">
            Copy to clipboard
          </button>
        </div>

        {/* Key facts */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Key Facts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FACTS.map((f) => (
              <div key={f.label} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{f.label}</p>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Press Kit */}
        <div className="mb-8 p-6 bg-primary/5 border border-primary/15 rounded-2xl">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">Press Kit</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Logos, screenshots, and brand guidelines for media use.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            Download Press Kit (coming soon)
          </button>
        </div>

        {/* Media contact */}
        <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">Media Contact</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            For interview requests, product questions, or media inquiries:
          </p>
          <a
            href="mailto:press@valorahq.in"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Mail className="w-4 h-4" />
            press@valorahq.in
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
