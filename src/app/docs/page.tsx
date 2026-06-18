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

          {/* Section: Architecture Deep Dive */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-sora border-b border-border/50 pb-2">
              Architecture Deep Dive
            </h2>
            
            {/* ASCII Diagram */}
            <div className="bg-[#0D0D12] border border-border/40 rounded-2xl p-6 font-mono text-sm text-emerald-400/90 overflow-x-auto whitespace-pre leading-snug">
{`   [Google Workspace]
           │ (Webhooks)
           ▼
    ┌──────────────┐
    │ Corsair SDK  │
    └──────┬───────┘
           │ (Raw Payload)
           ▼
    ┌──────────────┐       (Context)      ┌──────────────┐
    │ Valora Core  │ ◄──────────────────► │ Mem0 Vector  │
    │  (Next.js)   │                      │   Memory     │
    └──────┬───────┘                      └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ Groq (LLaMA) │ (800+ tokens/sec Classification)
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Zustand UI  │ (Sub-200ms Client Sync)
    └──────────────┘`}
            </div>

            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4 pt-4">
              <p>
                <strong>1. Ingestion Layer:</strong> We use Corsair's headless Google API abstraction to ingest webhooks instantaneously. Unlike legacy polling systems, Valora knows about a new email the millisecond Google receives it.
              </p>
              <p>
                <strong>2. Inference & Classification:</strong> Raw payloads are sanitized and sent to our Groq API endpoints. Using LLaMA-3.3-70b-versatile, the system achieves 800+ tokens/second inference to classify the urgency and intent of the email before it ever renders on the client.
              </p>
              <p>
                <strong>3. Vector Storage:</strong> Processed emails and calendar events are converted into high-dimensional vector embeddings and stored in Neon PostgreSQL using the <code>pgvector</code> extension. This enables true semantic search (e.g., searching "when are we deploying" actually finds the email about "release scheduled for Friday").
              </p>
              <p>
                <strong>4. Real-time Client Sync:</strong> The frontend bypasses traditional React render cycles for heavy lists by heavily leveraging Zustand and tRPC subscriptions, ensuring sub-200ms UI interactions.
              </p>
            </div>
          </section>

          {/* Section: Future Roadmap */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-sora border-b border-border/50 pb-2">
              Future Roadmap: The Unified Workspace
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard 
                icon={Database}
                title="Google Drive Integration"
                desc="Seamlessly attach, search, and semantically query all your Google Drive documents directly from the command center."
              />
              <FeatureCard 
                icon={Code}
                title="GitHub Repositories"
                desc="Manage pull requests, issues, and CI/CD alerts without leaving your workflow. The AI will summarize diffs automatically."
              />
              <FeatureCard 
                icon={Zap}
                title="Slack & Discord"
                desc="Unified messaging. Let the AI triage your Slack DMs and prioritize them alongside your urgent emails."
              />
              <FeatureCard 
                icon={Server}
                title="WhatsApp Business"
                desc="Bring client communications from WhatsApp into Valora. Have the AI draft professional responses based on your email history."
              />
            </div>
          </section>

          {/* Section: API Reference */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-sora border-b border-border/50 pb-2">
              REST API Reference
            </h2>
            <div className="space-y-4">
              <ApiEndpoint 
                method="GET" 
                path="/api/gmail/messages"
                desc="Fetch all synced emails for the authenticated user."
              />
              <ApiEndpoint 
                method="GET" 
                path="/api/gmail/thread/:id"
                desc="Retrieve a full email thread and its messages."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/gmail/send"
                desc="Send a new email or reply. Body requires { to, subject, text, threadId? }."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/gmail/messages/:id/archive"
                desc="Archive an email message."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/gmail/messages/:id/read"
                desc="Mark an email as read."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/gmail/messages/:id/star"
                desc="Toggle the starred state of an email."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/search"
                desc="Perform a semantic vector search across emails, calendar events, and memory using pgvector."
              />
              <ApiEndpoint 
                method="GET" 
                path="/api/user/profile"
                desc="Fetch the authenticated user's profile and plan details."
              />
              <ApiEndpoint 
                method="PATCH" 
                path="/api/user/preferences"
                desc="Update user preferences (theme, emailsPerPage, notifications)."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/speech-to-text"
                desc="Upload an audio blob to transcribe speech via Groq Whisper API."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/webhooks/gmail"
                desc="Corsair webhook listener for real-time Gmail inbox changes."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/webhooks/calendar"
                desc="Corsair webhook listener for real-time Google Calendar updates."
              />
              <ApiEndpoint 
                method="GET" 
                path="/api/trpc/:batch"
                desc="Batched tRPC endpoint for type-safe client-server state sync."
              />
              <ApiEndpoint 
                method="POST" 
                path="/api/search/corsair"
                desc="Query the Corsair unified search index across all connected integrations."
              />
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

function ApiEndpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const methodColor = 
    method === "GET" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
    method === "POST" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
    method === "PATCH" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
    "text-purple-400 bg-purple-400/10 border-purple-400/20";

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl border border-border/40 bg-surface/30 hover:bg-surface/60 transition-colors">
      <div className={`px-2.5 py-1 rounded-md border text-xs font-bold tracking-wider font-mono shrink-0 ${methodColor}`}>
        {method}
      </div>
      <div className="font-mono text-sm text-text-primary font-medium shrink-0">
        {path}
      </div>
      <div className="text-sm text-text-secondary md:ml-auto">
        {desc}
      </div>
    </div>
  );
}
