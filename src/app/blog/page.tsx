import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { type Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on productivity, AI, and email from the Valora team.",
};

const POSTS = [
  {
    slug: "why-email-is-broken",
    title: "Why email is broken (and how AI fixes it)",
    date: "June 10, 2026",
    readTime: "5 min read",
    excerpt:
      "Email was invented in 1971. It hasn't fundamentally changed since. Here's why that's a problem, and how Zara changes the equation.",
    category: "Product",
    categoryColor: "bg-primary/8 text-primary",
  },
  {
    slug: "keyboard-shortcuts-guide",
    title: "The complete Valora keyboard shortcuts guide",
    date: "May 28, 2026",
    readTime: "3 min read",
    excerpt:
      "Everything you need to know to navigate Valora at the speed of thought. From G I to ?, we cover all 22 shortcuts.",
    category: "Guide",
    categoryColor: "bg-success/8 text-success",
  },
  {
    slug: "ai-email-privacy",
    title: "How we protect your email privacy with AI",
    date: "May 15, 2026",
    readTime: "7 min read",
    excerpt:
      "OAuth 2.0, local processing, and zero password storage. Here's exactly how we keep your email safe while powering AI features.",
    category: "Security",
    categoryColor: "bg-amber-500/8 text-amber-600",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <LandingNav />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-sora mb-3">Blog</h1>
          <p className="text-lg text-[var(--text-muted)]">Insights on productivity, AI, and email.</p>
        </div>

        <div className="space-y-5">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col sm:flex-row gap-5 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${post.categoryColor}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{post.date} · {post.readTime}</span>
                </div>
                <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{post.excerpt}</p>
              </div>
              <div className="flex items-center sm:items-start pt-0 sm:pt-1">
                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 p-6 bg-primary/5 border border-primary/15 rounded-2xl text-center">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Subscribe to our newsletter</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">Get new posts and product updates in your inbox.</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-primary/50 transition-colors"
            />
            <button className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
