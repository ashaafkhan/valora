import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import { MapPin, Mail, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Valora. Built in India, for professionals everywhere.",
};

const VALUES = [
  {
    title: "Inbox as interface",
    desc: "Email is the most used professional tool on earth. We believe it deserves to be dramatically better.",
  },
  {
    title: "AI that acts, not just suggests",
    desc: "Zara doesn't just tell you what to do. She actually does it — with your permission.",
  },
  {
    title: "Keyboard-first",
    desc: "Every action in Valora can be done without touching the mouse. Speed is a feature.",
  },
  {
    title: "Privacy by design",
    desc: "We use OAuth 2.0. We never store your passwords. Your email stays yours.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full mb-5">
            <MapPin className="w-3 h-3" /> Built in India
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-4">
            We&apos;re building the command center<br />for your professional life.
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">
            Valora started with a simple frustration: email is broken, and the tools built to fix it make it worse. More tabs, more apps, more context switching.
          </p>
        </div>

        {/* Mission */}
        <div className="p-6 bg-primary/5 border border-primary/15 rounded-2xl mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #0066FF, #7C3AED)" }}>Z</div>
            <span className="text-sm font-bold text-[var(--text-primary)]">Our Mission</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Give every professional a personal AI that handles their email and calendar, so they can focus on work that actually matters. We call her Zara.
          </p>
        </div>

        {/* Story */}
        <div className="prose prose-sm max-w-none mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            We&apos;re a small, focused team building the email client we always wanted to use. Not another clone of Gmail. Not another AI wrapper. A genuinely different approach: an AI-first command center where the AI is an agent, not an autocomplete.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            Valora is built with modern technology — Next.js, Prisma, Groq, and pgvector — and designed with an obsessive attention to speed and polish. Every transition, every shortcut, every interaction is deliberate.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            We&apos;re built in India 🇮🇳, for professionals everywhere.
          </p>
        </div>

        {/* Values */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">What we believe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{v.title}</h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="border-t border-[var(--border)] pt-8 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Get in touch</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">We&apos;d love to hear from you.</p>
          </div>
          <a
            href="mailto:hello@valorahq.in"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Mail className="w-4 h-4" />
            hello@valorahq.in
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
