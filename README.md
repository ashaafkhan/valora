# Valora: The AI Workflow Command Center

<div align="center">
  <img src="public/valora_logo.png" alt="Valora Logo" width="120" />
  <h3>Gmail. Calendar. One Brain.</h3>
  <p>An autonomous, privacy-first command center that merges your inbox, calendar, and AI into a single unified workspace.</p>
</div>

---

## 📖 The Problem

The modern knowledge worker's workflow is fractured. We constantly context-switch between our Inbox, our Calendar, and our AI Assistants (like ChatGPT or Claude). 

Traditional email clients are passive—they just display chronological lists of text. Conversely, modern AI assistants lack native context; you have to constantly copy-paste emails into them to get help. This fragmentation leads to missed deadlines, lost context, and cognitive fatigue.

## 🚀 The Valora Solution

**Valora** is a completely reimagined email client built around an embedded, context-aware AI. By connecting directly to your Google Workspace via the **Corsair SDK**, Valora doesn't just read your email—it actively manages it. 

Valora acts as your Chief of Staff. It automatically classifies incoming emails, detects sensitive information, extracts calendar invites seamlessly, and maintains a long-term **Mem0 vector memory** of your preferences so it gets smarter every time you use it.

---

## ✨ World-Class Features

### ⚡ 1. Autonomous AI Priority Engine
Traditional inboxes sort by time. Valora sorts by **impact**. Every incoming email is instantly intercepted by our integration layer and parsed through **Groq (LLaMA-3.3-70b-versatile)**. The AI analyzes the sender, context, and tone to assign a Priority Score (0-100) and label (`Urgent`, `High`, `Normal`, `Low`). 

### 🧠 2. Persistent Agent Memory (Mem0)
Most AI clients suffer from amnesia. Valora uses the **Mem0 API** combined with `pgvector` embeddings to give your AI agent permanent memory. If you tell Valora "I prefer brief replies" or "Always CC my manager on legal emails", the agent permanently stores this context and automatically applies it to future draft generations.

### 📅 3. One-Click Calendar Intelligence
Valora bridges the gap between communication and scheduling. The AI scans email threads for temporal context ("Let's meet next Tuesday at 3 PM EST"). With a single click, Valora extracts the attendees, parses the natural language time into ISO formats, and creates a Google Calendar invite natively.

### 🛡️ 4. Security Shield & Danger Zone Architecture
We take data sovereignty seriously.
- **Encrypted Tokens**: Google OAuth tokens are AES-encrypted at rest.
- **Local Processing Pipeline**: Email fetching and routing is handled entirely on your deployed Node.js server.
- **Surgical Deletion**: Our "Danger Zone" utilizes safe, atomic database transactions (`db.$transaction`) to manually sever foreign-key constraints and irreversibly wipe all local data when an account is deleted.

---

## 🛠️ Technical Architecture

Valora is engineered for sub-200ms interactions using a highly optimized, bleeding-edge tech stack.

### The Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Styling & UI**: TailwindCSS, Framer Motion, Lucide Icons
- **State Management**: Zustand (for lightning-fast, unopinionated client state)
- **API Layer**: tRPC (for end-to-end type safety between client and server)
- **Database**: Neon Serverless PostgreSQL with `pgvector`
- **ORM**: Prisma (v6.19)
- **Authentication**: NextAuth.js (Auth.js) v5
- **AI Inference**: Groq API (LLaMA 3.3 70B) for 800+ tokens/sec generation
- **Integrations**: Corsair SDK (headless Google API abstraction)

### The Data Flow
1. **Ingest**: Incoming Gmail webhooks trigger the Corsair proxy.
2. **Process**: Valora fetches the raw payload, sanitizes it, and sends the stripped body preview to Groq for classification.
3. **Embed**: The email metadata is converted into high-dimensional vectors and stored in Postgres via Prisma.
4. **Serve**: The frontend fetches data securely via tRPC, utilizing Zustand to bypass React's render lifecycle for heavy list updates.

---

## 💡 The "Small Things" That Matter

When building Valora, we focused heavily on the micro-interactions that make software feel *premium*:
- **Framer Motion Micro-Animations**: Every hover state, tab switch, and modal open is governed by custom spring physics for a fluid, native app feel.
- **Glassmorphism & Theming**: A perfectly calibrated Light/Dark mode toggle that seamlessly swaps aesthetic tokens without flashing.
- **Keyboard-First Design**: Power users can navigate the entire inbox, open threads, and archive emails using Vim-style keyboard bindings (`j` to move down, `k` to move up, `c` to compose, `e` to archive).
- **Graceful Error Handling**: Our database cascades and Server Actions are fortified with robust `try/catch` logic and atomic rollbacks, ensuring the UI never crashes during data mutations.

---

## 🏃‍♂️ Getting Started (Local Development)

To run Valora locally, you'll need Node.js (v22+), pnpm, and a PostgreSQL database.

### 1. Clone & Install
```bash
git clone https://github.com/ashaafkhan/valora.git
cd valora
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the root directory. You will need API keys for Google OAuth, Neon (Postgres), Groq, and Mem0.
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
DATABASE_URL="postgresql://user:pass@host/db"
CORSAIR_KEK="your-corsair-encryption-key"
GROQ_API_KEY="your-groq-key"
MEM0_API_KEY="your-mem0-key"
```

### 3. Database Sync & Run
```bash
pnpm dlx prisma generate
pnpm dlx prisma db push
pnpm run dev
```

Visit `http://localhost:3000` to access the Command Center.

---
<div align="center">
  <i>Built with passion. Engineered for speed. Designed for focus.</i>
</div>
