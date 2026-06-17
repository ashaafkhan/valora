import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Valora terms of service — rules for using our platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-2">Terms of Service</h1>
          <p className="text-xs text-[var(--text-muted)] font-mono">Last updated: June 2026 · Valora (valorahq.in)</p>
        </div>

        <div className="space-y-8">
          {[
            {
              title: "1. Acceptance of Terms",
              body: `By creating a Valora account or using the Valora platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not access or use the platform.`,
            },
            {
              title: "2. Eligibility and Account Creation",
              body: `To use Valora, you must log in with a Google account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`,
            },
            {
              title: "3. Use of Services",
              body: `Valora provides productivity tools to manage your inbox and calendar. You agree not to use Valora for any unlawful purpose, to distribute spam, or to violate the intellectual property or privacy rights of others.`,
            },
            {
              title: "4. Data Access & Permissions",
              body: `Valora accesses your Google Calendar and Gmail data through Google OAuth APIs. You explicitly grant Valora permission to read, write, and manage your emails and calendar events on your behalf as required for the application's functions. You can revoke access at any time.`,
            },
            {
              title: "5. Intellectual Property",
              body: `All software, designs, logos, and materials on Valora are the property of Valora or its licensors. You are granted a limited, non-exclusive, non-transferable license to access the platform for personal or internal business use.`,
            },
            {
              title: "6. Limitation of Liability",
              body: `Valora is provided 'as is' without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform, including lost data or service interruptions.`,
            },
            {
              title: "7. Termination of Service",
              body: `We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason. You may also delete your account at any time via the settings panel.`,
            },
            {
              title: "8. Changes to Terms",
              body: `We may modify these Terms of Service from time to time. Your continued use of Valora after changes are posted constitutes your acceptance of the revised Terms.`,
            },
            {
              title: "9. Contact",
              body: `If you have any questions about these Terms, please contact support@valorahq.in`,
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
