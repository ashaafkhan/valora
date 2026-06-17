import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Valora uses cookies and how to manage them.",
};

const COOKIE_TYPES = [
  {
    name: "Essential cookies",
    purpose: "Required for the app to function. These include session tokens and authentication cookies.",
    canDisable: false,
    examples: ["next-auth.session-token", "next-auth.csrf-token"],
  },
  {
    name: "Preference cookies",
    purpose: "Remember your settings, such as your selected theme (light or dark mode).",
    canDisable: false,
    examples: ["valora-theme"],
  },
  {
    name: "Analytics cookies",
    purpose: "Help us understand how you use Valora so we can improve the product. We use Plausible Analytics, which is privacy-preserving and does not use third-party tracking cookies.",
    canDisable: true,
    examples: [],
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-3">Cookie Policy</h1>
          <p className="text-sm text-[var(--text-muted)]">Last updated: June 2026</p>
        </div>

        <div className="prose prose-sm max-w-none mb-8">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            This policy explains what cookies Valora uses, why, and how you can manage them. By using Valora, you consent to the use of essential and preference cookies.
          </p>
        </div>

        <div className="space-y-5 mb-10">
          {COOKIE_TYPES.map((type) => (
            <div key={type.name} className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">{type.name}</h2>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  type.canDisable ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                }`}>
                  {type.canDisable ? "Optional" : "Required"}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">{type.purpose}</p>
              {type.examples.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {type.examples.map((e) => (
                    <code key={e} className="text-[10px] font-mono bg-[var(--surface-hover)] border border-[var(--border)] px-2 py-1 rounded text-[var(--text-muted)]">
                      {e}
                    </code>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">How to manage cookies</h2>
          <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              You can manage cookies in your browser settings:
            </p>
            <ul className="space-y-2">
              {[
                { browser: "Chrome", url: "chrome://settings/cookies" },
                { browser: "Firefox", url: "about:preferences#privacy" },
                { browser: "Safari", url: "Safari → Settings → Privacy" },
                { browser: "Edge", url: "edge://settings/privacy" },
              ].map((b) => (
                <li key={b.browser} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-[var(--text-primary)] w-16">{b.browser}</span>
                  <code className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-hover)] px-2 py-0.5 rounded">
                    {b.url}
                  </code>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Note: Disabling essential cookies will prevent you from logging in to Valora.
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Questions? <a href="mailto:privacy@valorahq.in" className="text-primary hover:underline">privacy@valorahq.in</a>
        </p>
      </div>
      <Footer />
    </main>
  );
}
