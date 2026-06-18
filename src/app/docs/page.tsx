import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { Shield, Zap, Brain, Calendar as CalIcon, Server, Database, Lock, Code } from "lucide-react";

export const metadata = {
  title: "Documentation | Valora",
  description: "Technical documentation and architecture for Valora.",
};

export default function DocsPage() {
  return (
    <main className="relative min-h-screen bg-[var(--background)] overflow-x-hidden selection:bg-primary/30">
      <AnimatedBackground />
      <LandingNav />

      <div className="pt-32 pb-24 max-w-4xl mx-auto px-6 relative z-10">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-sora tracking-tight text-text-primary mb-4">
            Valora Documentation
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            Technical architecture, core concepts, and implementation details for the Valora AI Workflow Command Center.
          </p>
        </div>

        <div className="space-y-16">
          {/* Section: Problem & Solution */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-sora border-b border-border/50 pb-2">
              The Architecture of Focus
            </h2>
            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
              <p>
                The modern knowledge worker's workflow is fractured. Traditional email clients are passive, simply displaying chronological lists of text. Conversely, modern AI assistants lack native context; forcing users to constantly copy-paste emails to get help. 
              </p>
              <p>
                <strong>Valora</strong> solves this by acting as an embedded Chief of Staff. By connecting directly to your Google Workspace via the Corsair SDK, Valora doesn't just read your email—it actively manages it. It classifies incoming emails, detects sensitive information, extracts calendar invites natively, and maintains a long-term vector memory of your preferences.
              </p>
            </div>
          </section>

          {/* Section: Core Systems */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-sora border-b border-border/50 pb-2">
              Core Systems
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard 
                icon={Zap}
                title="Autonomous AI Priority Engine"
                desc="Every incoming email is parsed through Groq (LLaMA-3.3-70b-versatile). The AI analyzes sender, context, and tone to assign a Priority Score and label (Urgent, High, Normal, Low)."
              />
              <FeatureCard 
                icon={Brain}
                title="Persistent Agent Memory"
                desc="Valora uses the Mem0 API combined with pgvector embeddings to give your AI agent permanent memory. It remembers your preferences and applies them to future interactions."
              />
              <FeatureCard 
                icon={CalIcon}
                title="Calendar Intelligence"
                desc="Scans threads for temporal context. With a single click, Valora extracts attendees, parses natural language times into ISO formats, and generates Google Calendar invites natively."
              />
              <FeatureCard 
                icon={Shield}
                title="Data Sovereignty & Security"
                desc="Tokens are AES-encrypted at rest. The 'Danger Zone' utilizes safe, atomic database transactions to sever foreign-key constraints and irreversibly wipe all local data when requested."
              />
            </div>
          </section>

          {/* Section: Tech Stack */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-sora border-b border-border/50 pb-2">
              Technology Stack
            </h2>
            <div className="bg-surface border border-border/60 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3 text-text-primary font-semibold">
                    <Code className="w-4 h-4 text-primary" /> Frontend
                  </div>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li>• Next.js 15 (App Router)</li>
                    <li>• React 19</li>
                    <li>• TailwindCSS</li>
                    <li>• Framer Motion</li>
                    <li>• Zustand State Management</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3 text-text-primary font-semibold">
                    <Server className="w-4 h-4 text-emerald-500" /> Backend
                  </div>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li>• Node.js & tRPC</li>
                    <li>• Prisma ORM v6.19</li>
                    <li>• NextAuth (Auth.js v5)</li>
                    <li>• Corsair Google SDK</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3 text-text-primary font-semibold">
                    <Database className="w-4 h-4 text-purple-500" /> AI & Data
                  </div>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li>• Neon Serverless PostgreSQL</li>
                    <li>• pgvector Embeddings</li>
                    <li>• Groq API (LLaMA 3.3 70B)</li>
                    <li>• Mem0 Memory API</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Getting Started */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-sora border-b border-border/50 pb-2">
              Local Setup
            </h2>
            <div className="bg-[#0D0D12] border border-border/40 rounded-2xl overflow-hidden font-mono text-sm">
              <div className="px-4 py-3 bg-[#15151C] border-b border-border/40 text-text-secondary flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
                <span className="ml-2 text-xs">terminal</span>
              </div>
              <div className="p-6 text-emerald-400/90 leading-loose overflow-x-auto whitespace-pre">
                <span className="text-purple-400">git</span> clone https://github.com/ashaafkhan/valora.git
                <br />
                <span className="text-purple-400">cd</span> valora
                <br />
                <span className="text-purple-400">pnpm</span> install
                <br />
                <span className="text-text-muted"># Configure your .env file with API keys</span>
                <br />
                <span className="text-purple-400">pnpm</span> dlx prisma generate
                <br />
                <span className="text-purple-400">pnpm</span> dlx prisma db push
                <br />
                <span className="text-purple-400">pnpm</span> run dev
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-surface/50 border border-border/50 hover:bg-surface transition-colors">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}
