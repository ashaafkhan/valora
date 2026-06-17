import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const POSTS: Record<string, { title: string; date: string; readTime: string; category: string; content: string }> = {
  "why-email-is-broken": {
    title: "Why email is broken (and how AI fixes it)",
    date: "June 10, 2026",
    readTime: "5 min read",
    category: "Product",
    content: `Email was invented in 1971. The protocol — SMTP — was standardized in 1982. And despite being the backbone of professional communication, email has barely changed in 40 years.

We get more of it every day. The average professional receives 121 emails per day. Studies show we spend 28% of our workweek managing email. That's over 11 hours a week, for the average knowledge worker.

**The problem isn't the volume. It's the tooling.**

Gmail is a brilliant search engine wrapped in a mediocre organizer. Outlook is a calendar with an email problem. The "productivity" tools built on top of email — Superhuman, HEY, Spark — are all solving the same problem: make email slightly less bad.

None of them ask the fundamental question: what if email had a brain?

**Enter Zara.**

Zara is Valora's AI copilot. She doesn't just read your email and suggest actions. She acts on them. She can:

- Read your inbox and summarize what matters
- Draft a reply in your voice based on context
- Schedule a meeting with the right people at the right time
- Send the reply, after you approve it

The key word is "approve." Zara never acts without your permission. Every email she sends, every event she creates — she shows you first and asks.

This is the future of email. Not a smarter filter. Not a better UI. An AI that does the work.

**How Valora is different**

Valora combines Gmail, Google Calendar, and Zara into one command center. No tab switching. No context loss. One keyboard shortcut away from anything you need.

We built it in India. We built it because we were frustrated. And we built it because we believe the next generation of productivity tools will be AI-native, not AI-bolted-on.

Try Valora. Your inbox deserves better.`,
  },
  "keyboard-shortcuts-guide": {
    title: "The complete Valora keyboard shortcuts guide",
    date: "May 28, 2026",
    readTime: "3 min read",
    category: "Guide",
    content: `Valora is built keyboard-first. Every action, every navigation, every feature is accessible without touching the mouse. Here's the complete reference.

**Global shortcuts**

- \`Ctrl+K\` — Open command palette (search anything)
- \`?\` — Show/hide keyboard shortcuts cheat sheet
- \`G I\` — Go to Inbox
- \`G C\` — Go to Calendar
- \`G A\` — Go to Zara
- \`G D\` — Go to Digest
- \`G S\` — Go to Settings
- \`G B\` — Go to Billing

**Inbox shortcuts**

- \`C\` — Compose new email
- \`E\` — Archive selected email
- \`R\` — Toggle read/unread
- \`*\` — Star/unstar email
- \`J\` — Next email
- \`K\` — Previous email
- \`X\` — Select email
- \`Enter\` — Open selected email
- \`Esc\` — Close / deselect

**Compose shortcuts**

- \`Ctrl+Enter\` — Send email
- \`Tab\` — Accept AI autocomplete suggestion
- \`Esc\` — Close compose

**Calendar shortcuts**

- \`T\` — Go to today
- \`D\` — Day view
- \`W\` — Week view
- \`M\` — Month view
- \`N\` — Create new event

**Tip:** Press \`?\` at any time to see the full cheat sheet inside the app.`,
  },
  "ai-email-privacy": {
    title: "How we protect your email privacy with AI",
    date: "May 15, 2026",
    readTime: "7 min read",
    category: "Security",
    content: `When you give an AI access to your email, you're trusting it with some of the most sensitive information in your life. Business deals. Personal conversations. Financial records. Medical updates.

We take that seriously. Here's exactly how Valora protects your privacy.

**OAuth 2.0 — no passwords stored**

Valora never asks for your Gmail password. We use Google's OAuth 2.0 — the same protocol used by every reputable app. When you connect your Gmail, Google gives us a time-limited access token. We store that token (encrypted), not your password. You can revoke access at any time from your Google account settings.

**What we access**

We request the minimum permissions necessary:
- \`gmail.readonly\` — read your emails
- \`gmail.send\` — send emails (only when you explicitly ask Zara to send)
- \`gmail.modify\` — archive, star, label emails
- \`calendar\` — read and modify your calendar

**AI processing**

Our AI features use Groq's Llama-3.3-70b model. When Zara processes your emails, only the relevant content (not your entire inbox) is sent to the AI model. We do not use your data to train AI models.

**Security Shield**

Valora's Security Shield automatically detects sensitive content in emails — OTPs, bank account details, passwords, medical information. These are flagged in the UI but never stored in plaintext or sent to AI services.

**Database security**

Your email metadata is stored in a PostgreSQL database with encrypted connections. Embedding vectors (for semantic search) contain only the semantic meaning of emails, not the original content.

**Your rights**

You can delete your account and all associated data at any time from Settings → Account → Delete Account. We process deletion requests immediately.

Questions? Email us at privacy@valorahq.in.`,
  },
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return {};
  return { title: post.title, description: post.content.substring(0, 160) };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  const paragraphs = post.content.split("\n\n").filter(Boolean);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/8 text-primary">{post.category}</span>
            <span className="text-xs text-[var(--text-muted)]">{post.date} · {post.readTime}</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-sora leading-tight">{post.title}</h1>
        </div>

        <div className="border-t border-[var(--border)] pt-8 space-y-4">
          {paragraphs.map((para, i) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return (
                <h2 key={i} className="text-lg font-bold text-[var(--text-primary)] mt-6">
                  {para.replace(/\*\*/g, "")}
                </h2>
              );
            }
            if (para.startsWith("- ")) {
              const items = para.split("\n").filter((l) => l.startsWith("- "));
              return (
                <ul key={i} className="space-y-2">
                  {items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="text-primary mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: item.substring(2).replace(/`([^`]+)`/g, '<code class="bg-surface-hover px-1.5 py-0.5 rounded text-xs font-mono">$1</code>') }} />
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: para.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, '<code class="bg-surface-hover px-1.5 py-0.5 rounded text-xs font-mono">$1</code>') }}
              />
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Try Valora for free
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
