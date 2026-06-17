import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import { Shield, Lock, Eye, Server, AlertTriangle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Security",
  description: "How Valora keeps your email and data safe.",
};

const PRACTICES = [
  {
    icon: Lock,
    title: "OAuth 2.0 Authentication",
    desc: "We never ask for or store your Gmail password. We use Google's OAuth 2.0 flow to obtain time-limited access tokens. You can revoke access at any time from your Google account.",
    color: "text-primary",
    bg: "bg-primary/8",
  },
  {
    icon: Shield,
    title: "Encrypted Transport",
    desc: "All data between your browser and Valora's servers is encrypted via TLS 1.3. Your tokens are stored encrypted at rest using AES-256.",
    color: "text-success",
    bg: "bg-success/8",
  },
  {
    icon: Eye,
    title: "Minimum Permissions",
    desc: "Valora requests only the permissions it needs. We never read emails from folders you haven't connected, and we never access contacts or Drive.",
    color: "text-amber-500",
    bg: "bg-amber-500/8",
  },
  {
    icon: Server,
    title: "AI Processing",
    desc: "When Zara processes emails, only relevant content is sent to AI models. We do not use your email data to train AI. Email content is never stored in plaintext in our AI logs.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/8",
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-3">Security</h1>
          <p className="text-lg text-[var(--text-muted)]">
            How we keep your email and data safe.
          </p>
        </div>

        {/* Security practices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {PRACTICES.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                <div className={`w-9 h-9 rounded-xl ${p.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${p.color}`} />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">{p.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* What we access */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">What permissions we use</h2>
          <div className="space-y-2">
            {[
              { scope: "gmail.readonly", purpose: "Read your emails for display and AI analysis" },
              { scope: "gmail.send", purpose: "Send emails when you explicitly ask Zara to" },
              { scope: "gmail.modify", purpose: "Archive, star, and label your emails" },
              { scope: "calendar", purpose: "Read and create calendar events" },
            ].map((item) => (
              <div key={item.scope} className="flex items-start gap-3 p-3 bg-[var(--surface-hover)] rounded-xl">
                <code className="text-xs font-mono text-primary bg-primary/8 px-2 py-1 rounded flex-shrink-0 mt-0.5">
                  {item.scope}
                </code>
                <span className="text-xs text-[var(--text-secondary)]">{item.purpose}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Responsible disclosure */}
        <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Responsible Disclosure</h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
            If you discover a security vulnerability in Valora, please report it to us privately. We'll acknowledge your report within 48 hours and work to fix the issue promptly.
          </p>
          <a
            href="mailto:security@valorahq.in"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Mail className="w-4 h-4" />
            security@valorahq.in
          </a>
        </div>

        <div className="text-xs text-[var(--text-muted)] text-center">
          Last updated: June 2026 · Questions? <a href="mailto:security@valorahq.in" className="text-primary hover:underline">Contact us</a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
