import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Valora privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-2">Privacy Policy</h1>
          <p className="text-xs text-[var(--text-muted)] font-mono">Last updated: June 2026 · Valora (valorahq.in)</p>
        </div>

        <div className="space-y-8">
          {[
            {
              title: "1. What We Collect",
              body: `Valora collects only what is necessary to provide its service: your Google account profile (name, email, profile picture) for authentication, and Gmail and Google Calendar data that you explicitly authorize through Google OAuth. We do not collect passwords or payment information.`,
            },
            {
              title: "2. How We Use Your Data",
              body: `Your Gmail and Calendar data is used solely to power Valora's core features: displaying your inbox, sending emails on your behalf (only when you explicitly request it), managing calendar events, and providing AI-powered priority scoring. We do not sell, share, or monetize your personal data.`,
            },
            {
              title: "3. Data Storage",
              body: `Email metadata and calendar events are stored in an encrypted PostgreSQL database hosted on Neon.tech. Google OAuth tokens are encrypted at rest using AES-256. Raw email body content is stored only for the purpose of local search and AI processing — it is never shared with third parties.`,
            },
            {
              title: "4. AI Processing",
              body: `Valora uses Groq (llama-3.3-70b-versatile) to score email priority. Only the email subject, sender, and a short preview (≤300 characters) are sent to the AI model — never the full email body. AI-generated results are stored locally and never shared.`,
            },
            {
              title: "5. Third-Party Services",
              body: `Valora integrates with: Google (OAuth, Gmail, Calendar), Groq (AI inference), Mem0 (optional persistent agent memory), and Vercel (hosting). Each service operates under its own privacy policy. Corsair is used as an integration middleware and never stores your email content.`,
            },
            {
              title: "6. Data Retention",
              body: `You can delete your Valora account at any time from Settings → Danger Zone. Upon deletion, all locally stored emails, calendar events, and agent memory associated with your account are permanently deleted within 30 days.`,
            },
            {
              title: "7. Your Rights",
              body: `You may request access to, correction of, or deletion of your personal data at any time by contacting us. You can revoke Valora's access to your Google account at any time via myaccount.google.com/permissions.`,
            },
            {
              title: "8. Contact",
              body: `For privacy-related questions, contact: privacy@valorahq.in`,
            },
          ].map(({ title, body }) => (
            <section key={title} className="border-t border-[var(--border)] pt-6">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">{title}</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
