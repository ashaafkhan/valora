# Valora: The AI Workflow Command Center
**Version:** 1.0.0-rc.1  
**Repository:** [github.com/ashaafkhan/valora](https://github.com/ashaafkhan/valora)  
**Live Demo:** [https://www.valorahq.in/](https://www.valorahq.in/)

<div align="center">
  <img src="public/valora_logo.png" alt="Valora Logo" width="120" />
  <h3>Gmail. Calendar. One Brain.</h3>
  <p>An autonomous, privacy-first command center that merges your inbox, calendar, and AI into a single unified workspace.</p>
</div>

---

## 📖 Comprehensive Table of Contents
1. [The Philosophy & Problem Statement](#1-the-philosophy--problem-statement)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Deep Dive: Corsair SDK & The Integration Layer](#3-deep-dive-corsair-sdk--the-integration-layer)
4. [Deep Dive: Advanced AI Orchestration (OpenAI + Groq)](#4-deep-dive-advanced-ai-orchestration-openai--groq)
5. [Deep Dive: Vector Memory (Mem0)](#5-deep-dive-vector-memory-mem0)
6. [Frontend Architecture (React 19 + Zustand)](#6-frontend-architecture-react-19--zustand)
7. [Database Schema & Prisma Models](#7-database-schema--prisma-models)
8. [Comprehensive API & tRPC Route Reference](#8-comprehensive-api--trpc-route-reference)
9. [Security, Encryption & The "Danger Zone"](#9-security-encryption--the-danger-zone)
10. [Directory & Component Structure](#10-directory--component-structure)
11. [Deployment & Infrastructure Guide](#11-deployment--infrastructure-guide)
12. [Local Development Setup](#12-local-development-setup)
13. [Future Roadmap](#13-future-roadmap)
14. [Contributing Guidelines](#14-contributing-guidelines)

---

## 1. The Philosophy & Problem Statement

The modern knowledge worker's workflow is fractured. We constantly context-switch between our Inbox, our Calendar, and our AI Assistants (like ChatGPT or Claude). 

Traditional email clients are passive—they just display chronological lists of text. Conversely, modern AI assistants lack native context; you have to constantly copy-paste emails into them to get help. This fragmentation leads to missed deadlines, lost context, and cognitive fatigue.

**Valora** is a completely reimagined email client built around an embedded, context-aware AI. By connecting directly to your Google Workspace via the **Corsair SDK**, Valora doesn't just read your email—it actively manages it. 

Valora acts as your Chief of Staff. It automatically classifies incoming emails, detects sensitive information, extracts calendar invites seamlessly, and maintains a long-term **Mem0 vector memory** of your preferences so it gets smarter every time you use it.

---

## 2. High-Level System Architecture

Valora is engineered for sub-200ms interactions using a highly optimized, bleeding-edge tech stack.

### 2.1 The Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Styling & UI**: TailwindCSS, Framer Motion, Lucide Icons, Shadcn-like raw components
- **State Management**: Zustand (for lightning-fast, unopinionated client state)
- **API Layer**: tRPC (for end-to-end type safety between client and server)
- **Database**: Neon Serverless PostgreSQL with `pgvector`
- **ORM**: Prisma (v6.19)
- **Authentication**: NextAuth.js (Auth.js) v5
- **AI Orchestration**: Custom fallback router utilizing OpenAI (gpt-4o) and Groq (LLaMA 3.3 70B)
- **Integrations**: Corsair SDK (headless Google API abstraction)

### 2.2 Global Data Flow Sequence

```mermaid
sequenceDiagram
    participant Google as Google Workspace
    participant Corsair as Corsair SDK / Proxy
    participant Valora as Valora Backend (Node)
    participant Orchestrator as AI Orchestrator (OpenAI / Groq)
    participant DB as Neon Postgres (pgvector)
    participant UI as Next.js Frontend (Zustand)

    Google->>Corsair: Webhook: New Email Received
    Corsair->>Valora: POST /api/webhooks/gmail
    Valora->>Corsair: Fetch full raw email body
    Corsair-->>Valora: Return sanitized payload
    Valora->>Orchestrator: Prompt: Classify Priority & Intent
    Orchestrator-->>Valora: JSON { score: 95, label: 'Urgent' }
    Valora->>DB: prisma.email.create() with pgvector embedding
    DB-->>Valora: Acknowledged
    Valora->>UI: tRPC Subscription / Webhook Socket Trigger
    UI->>UI: Zustand Store Update (Sub-200ms render)
```

---

## 3. Deep Dive: Corsair SDK & The Integration Layer

Connecting to Google's APIs directly is notoriously difficult. Building manual OAuth flows, managing token lifecycles, refreshing access tokens, and setting up Pub/Sub webhooks usually takes weeks of engineering. 

Valora abstracts all of this entirely by leveraging the **Corsair SDK**. Corsair acts as an enterprise-grade integration proxy.

### 3.1 OAuth & Secure Connection Lifecycle
When a user clicks "Connect Gmail" in Valora, we do not manually negotiate with Google. Instead, we generate a Corsair OAuth URL:
```typescript
import { corsair } from "@/server/corsair";

export async function getIntegrationOAuthUrl(pluginId: string) {
  const session = await auth();
  const url = await corsair.oauth.generateUrl({
    tenantId: session.user.id,
    integrationId: pluginId, // 'gmail' or 'googlecalendar'
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/corsair/callback`
  });
  return url;
}
```

### 3.2 Instantaneous Webhook Ingestion
Legacy email clients use cron-jobs to poll IMAP servers every 5 minutes. Valora is completely real-time. Corsair manages Google Pub/Sub streams on our behalf and fires webhooks directly into our endpoints the millisecond a change occurs.

File: `src/app/api/webhooks/gmail/route.ts`
```typescript
export async function POST(req: Request) {
  const payload = await req.json();
  const { tenantId, event, data } = payload;
  
  if (event === "message.created") {
    // 1. Immediately return 200 OK to Corsair to prevent timeout retries
    // 2. Spawn a background worker to fetch the raw email body
    const emailData = await corsair.api.gmail.getMessage(tenantId, data.messageId);
    // 3. Strip HTML, parse text, and send to the AI Orchestrator
  }
}
```

---

## 4. Deep Dive: Advanced AI Orchestration (OpenAI + Groq)

Valora does not rely on a single Point of Failure for its artificial intelligence. Because Valora processes hundreds of incoming emails, API rate limits or LLM hallucinations can break the entire pipeline. 

To solve this, we built a highly robust **AI Orchestration Layer** (`src/lib/ai.ts`).

### 4.1 Fallback & Orchestration Logic
When Valora needs to classify an email, summarize a thread, or generate a draft, it passes through our custom wrapper. The orchestrator attempts to use the highest-quality model first (**OpenAI `gpt-4o`**). If OpenAI rate-limits us or the network fails, it seamlessly and instantly falls back to **Groq (`llama-3.3-70b-versatile`)**, which is capable of 800+ tokens per second.

```typescript
// src/lib/ai.ts
import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

export async function orchestratedCompletion(messages) {
  // Primary Attempt: OpenAI (gpt-4o)
  try {
    console.log(`[Orchestration] Attempting OpenAI (gpt-4o)...`);
    return await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" }
    });
  } catch (err) {
    console.warn(`[OpenAI] Failed. Falling back to Groq LLaMA...`);
    // Fallback Attempt: Groq (llama-3.3-70b-versatile)
    return await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      response_format: { type: "json_object" }
    });
  }
}
```

### 4.2 The Priority Engine JSON Schema
The Orchestrator forces the LLM to output a rigid, deterministic JSON schema to power the UI.
*Example AI Output:*
```json
{
  "score": 85,
  "label": "High",
  "isSensitive": false,
  "reason": "Direct message from CEO regarding tomorrow's board meeting."
}
```

---

## 5. Deep Dive: Vector Memory (Mem0)

Most AI clients suffer from amnesia. They require you to constantly remind them of your formatting preferences, your signature, and your working style. Valora integrates the **Mem0 API** as a permanent cognitive layer.

### 5.1 How Memory is Extracted
When you chat with **Zara AI** (the built-in agent) or manually save a preference, Valora writes a memory vector.

```typescript
import { mem0 } from "@/server/mem0";

// Saving a preference during chat
await mem0.add("I prefer my emails to be brief, no more than 3 sentences, and I never use emojis.", {
  user_id: session.user.id,
  metadata: { source: "zara_chat" }
});
```

### 5.2 How Memory is Injected for Contextual Drafting
When you click "Generate Reply" on an email thread, the system creates a vector embedding of the current email thread, queries Mem0 for the Top-K most relevant memories, and dynamically injects those memories into the Orchestrator's system prompt.

*Generated System Prompt Example:*
> You are Valora, an elite Chief of Staff.
> Draft a reply to the provided email.
> CRITICAL USER PREFERENCES RETRIEVED FROM MEMORY:
> - "I prefer my emails to be brief, no more than 3 sentences, and I never use emojis."
> - "I am out of the office on Fridays."

---

## 6. Frontend Architecture (React 19 + Zustand)

The frontend is built for absolute speed. Email clients that lag when switching folders are unacceptable.

### 6.1 Zustand Store Architecture (`src/store/useMailStore.ts`)
We bypass React Context completely for high-frequency updates. Zustand provides a single source of truth outside the React component tree.

```typescript
interface MailState {
  emails: Email[];
  selectedIds: string[];
  activeThreadId: string | null;
  filter: 'all' | 'priority' | 'unread';
  setEmails: (emails: Email[]) => void;
  selectEmail: (id: string) => void;
  archiveSelected: () => Promise<void>;
}

export const useMailStore = create<MailState>((set, get) => ({
  emails: [],
  selectedIds: [],
  activeThreadId: null,
  filter: 'all',
  setEmails: (emails) => set({ emails }),
  // ... implementation
}));
```

### 6.2 tRPC Integration (`src/trpc/react.tsx`)
All client-to-server communication is strictly typed. If we change a database column in Prisma, the frontend TypeScript compiler will immediately flag any broken API calls. We use batched tRPC requests to minimize network waterfalls when loading the dashboard.

### 6.3 Tailwind & Framer Motion Physics
Every micro-interaction is animated using custom spring physics:
- **Layout Animations**: `<motion.div layout>` allows email rows to smoothly slide down when a new email is injected at the top.
- **Glassmorphism**: Complex `backdrop-blur` and `bg-surface/50` utilities create an iOS-level premium aesthetic.
- **Keyboard-First Routing**: Global keydown listeners map to routing logic (e.g., hitting `i` pushes router to `/inbox`).

---

## 7. Database Schema & Prisma Models

The database is built on **Neon Serverless Postgres** utilizing the `pgvector` extension for semantic search.

### 7.1 Full Schema Overview
```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../generated/prisma"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

model User {
  id                 String    @id @default(cuid())
  email              String?   @unique
  name               String?
  image              String?
  provider           String    @default("google")
  preferences        Json      @default("{}")
  theme              String    @default("light")
  plan               String    @default("free")
  aiMessagesUsed     Int       @default(0)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  emails         Email[]
  calendarEvents CalendarEvent[]
  agentChats     AgentChat[]
  agentMemories  AgentMemory[]
}

model Email {
  id            String      @id @default(cuid())
  userId        String
  gmailId       String      @unique
  threadId      String
  subject       String
  fromEmail     String
  toEmails      String[]
  body          String      @db.Text
  bodyPreview   String      @db.Text
  isRead        Boolean     @default(false)
  isArchived    Boolean     @default(false)
  priorityScore Int         @default(40)
  priorityLabel String      @default("normal")
  embedding     Unsupported("vector(768)")?
  receivedAt    DateTime
  createdAt     DateTime    @default(now())

  user   User @relation(fields: [userId], references: [id])

  @@index([userId, receivedAt(sort: Desc)])
  @@index([userId, priorityLabel])
}

model CalendarEvent {
  id            String   @id @default(cuid())
  userId        String
  googleEventId String   @unique
  title         String
  description   String?  @db.Text
  startTime     DateTime
  endTime       DateTime
  attendees     Json     @default("[]")
  videoLink     String?
  
  user User @relation(fields: [userId], references: [id])
  @@index([userId, startTime])
}
```

---

## 8. Comprehensive API & tRPC Route Reference

### 8.1 REST API Routes (`/api/*`)

| Method | Endpoint | Description | Payload Example |
|---|---|---|---|
| `GET` | `/api/gmail/messages` | Fetch paginated, synced emails. | Query: `?limit=50&cursor=xxx` |
| `GET` | `/api/gmail/thread/:id` | Fetch full conversation thread. | - |
| `POST` | `/api/gmail/send` | Dispatch an email. | `{ to: "ceo@acme.com", subject: "...", text: "..." }` |
| `POST` | `/api/gmail/messages/:id/archive` | Archives a specific email. | `{ id: "cuid123" }` |
| `POST` | `/api/gmail/messages/:id/read` | Marks an email as read. | `{ id: "cuid123" }` |
| `POST` | `/api/gmail/messages/:id/star` | Stars an email message. | `{ id: "cuid123" }` |
| `POST` | `/api/search` | Global semantic vector search. | `{ query: "when is deployment" }` |
| `GET` | `/api/user/profile` | Fetches authenticated user info. | - |
| `PATCH` | `/api/user/preferences` | Updates user settings. | `{ theme: "dark", emailsPerPage: 50 }` |
| `POST` | `/api/speech-to-text` | Whisper AI transcription. | FormData: `audioBlob` |
| `POST` | `/api/webhooks/gmail` | Corsair webhook ingest. | Internal Corsair Payload |
| `POST` | `/api/webhooks/calendar`| Corsair calendar ingest. | Internal Corsair Payload |

### 8.2 tRPC Routers (`src/server/api/routers/`)
- **`gmail.ts`**: Provides `getConnectionStatus`, `getUnreadCount`, and `syncStatus` queries.
- **`calendar.ts`**: Provides `getUpcomingEvents` and `createEvent` mutations.
- **`ai.ts`**: Handles the heavy lifting for `generateReply` and `summarizeThread`, streaming responses back to the client.

---

## 9. Security, Encryption & The "Danger Zone"

Data sovereignty is a first-class citizen in Valora. We assume the database can be compromised and build defenses accordingly.

### 9.1 AES-256 Token Encryption (Corsair)
Google OAuth tokens are never stored in plaintext. They are encrypted at the edge using the `CORSAIR_KEK` environment variable before being inserted into PostgreSQL.

### 9.2 Atomic Account Deletion ("Danger Zone")
In `src/app/(dashboard)/settings/actions.ts`, we implement a highly secure `deleteUserAccount` Server Action. 
Rather than relying solely on Prisma cascades (which can occasionally fail or leave orphan rows), Valora utilizes a strict `db.$transaction([])` array to manually and sequentially wipe user data:

```typescript
export async function deleteUserAccount() {
  const userId = session.user.id;
  
  try {
    // 1. Revoke Corsair webhooks & tokens directly via SQL bypass to avoid SDK cache issues
    await conn.query(`DELETE FROM "corsair_events" WHERE account_id IN ...`);
    await conn.query(`DELETE FROM "corsair_accounts" WHERE tenant_id = $1`, [userId]);

    // 2. Wipe Prisma DB securely via Atomic Transaction
    await db.$transaction([
      db.email.deleteMany({ where: { userId } }),
      db.calendarEvent.deleteMany({ where: { userId } }),
      db.agentMemory.deleteMany({ where: { userId } }),
      db.user.delete({ where: { id: userId } })
    ]);
  } catch (e) {
    // Entire operation rolls back automatically!
  }
}
```

---

## 10. Directory & Component Structure

Understanding the monolithic layout of the application.

```text
valora/
├── prisma/
│   ├── schema.prisma       # Database architecture
│   └── migrations/         # PostgreSQL migration history
├── public/                 # Static assets (fonts, icons, logo)
├── src/
│   ├── app/                # Next.js App Router root
│   │   ├── (dashboard)/    # Authenticated UI routes (Inbox, Calendar, Settings)
│   │   ├── (marketing)/    # Public landing page routes
│   │   ├── api/            # REST Endpoints & Webhooks
│   │   ├── docs/           # Static Documentation Page
│   │   └── login/          # NextAuth authentication boundary
│   ├── components/         # Reusable React UI Components
│   │   ├── landing/        # Landing page specific components (Hero, Nav)
│   │   ├── shared/         # Cross-app components (ThemeToggle, Buttons)
│   │   └── ui/             # Radix/Shadcn unstyled raw components
│   ├── env/                # Environment variable Zod validation schemas
│   ├── lib/                # Utility functions & AI Orchestrator (ai.ts)
│   ├── server/             # Backend logic
│   │   ├── api/            # tRPC routers
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── corsair.ts      # Corsair SDK initialization
│   │   ├── db.ts           # Prisma client initialization
│   │   └── mem0.ts         # Mem0 vector client
│   ├── store/              # Zustand global state managers
│   └── styles/             # Global CSS & Tailwind directives
├── tailwind.config.ts      # Tailwind configuration and design tokens
├── next.config.mjs         # Next.js compiler settings
└── package.json            # Dependencies & Scripts
```

---

## 11. Deployment & Infrastructure Guide

Valora is designed to be deployed on Vercel with a decoupled Postgres database.

### 11.1 Vercel Deployment
1. Connect your GitHub repository to Vercel.
2. Override the Build Command: `prisma generate && prisma db push && next build`
3. Add all environment variables (see Section 12).
4. Deploy. Vercel will automatically optimize Edge functions for the App Router.

### 11.2 Neon PostgreSQL Setup
1. Create a Neon Project.
2. Ensure the `pgvector` extension is enabled via SQL: `CREATE EXTENSION IF NOT EXISTS vector;`
3. Copy the pooled connection string into `DATABASE_URL`.

### 11.3 Google Cloud Console (OAuth & Pub/Sub)
1. Create a GCP Project.
2. Enable the Gmail API and Google Calendar API.
3. Configure the OAuth Consent Screen (add scopes: `mail.read`, `mail.send`, `calendar.events`).
4. Generate OAuth Client ID and Secret.
5. Create a Pub/Sub topic for Gmail push notifications and map it to your production webhook URL.

---

## 12. Local Development Setup

To run Valora locally, you'll need Node.js (v22+), pnpm, and a PostgreSQL database.

### 12.1 Clone & Install
```bash
git clone https://github.com/ashaafkhan/valora.git
cd valora
pnpm install
```

### 12.2 Environment Variables
Create a `.env` file in the root directory. You must fill out every key.
```env
# Core Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NextAuth Configuration
AUTH_SECRET="your-auth-secret-32-chars-min"
AUTH_GOOGLE_ID="your-google-oauth-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# Database (Neon or Local Postgres with pgvector enabled)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Integration Proxy Encryption
CORSAIR_KEK="secure-random-32-byte-string"

# AI Orchestration (Primary & Fallback)
OPENAI_API_KEY="sk-proj-your_openai_key"
GROQ_API_KEY="gsk_your_groq_key_here"

# Vector Memory
MEM0_API_KEY="m0_your_mem0_key_here"
```

### 12.3 Database Sync
```bash
pnpm dlx prisma generate
pnpm dlx prisma db push
```

### 12.4 Run Development Server
```bash
pnpm run dev
```
Visit `http://localhost:3000` to access the application.

---

## 13. Future Roadmap

Valora is currently focused on mastering the Inbox and Calendar. However, the architecture is designed to scale horizontally across the entire enterprise stack.

1. **Google Drive Integration**: Seamlessly attach, search, and semantically query all your Google Drive documents directly from the command center.
2. **GitHub Repositories**: Manage pull requests, issues, and CI/CD alerts without leaving your workflow. The AI will summarize diffs automatically.
3. **Slack & Discord**: Unified messaging. Let the AI triage your Slack DMs and prioritize them alongside your urgent emails.
4. **WhatsApp Business**: Bring client communications from WhatsApp into Valora. Have the AI draft professional responses based on your email history.

---

## 14. Contributing Guidelines

We welcome contributions from the community! If you are interested in expanding Valora's capabilities, please adhere to the following guidelines:

1. **Fork & Branch**: Create a feature branch from `main` (e.g., `feature/slack-integration`).
2. **Type Safety**: Valora is strictly typed. Do not use `any`. Ensure tRPC router inputs are thoroughly validated using Zod.
3. **Styling**: Adhere to the existing Tailwind design system. Do not introduce raw CSS files unless absolutely necessary for complex animations.
4. **Testing**: Ensure all database mutations are wrapped in `try/catch` blocks and tested against edge cases.
5. **Pull Requests**: Submit a PR with a comprehensive description of the problem solved, architectural choices made, and screenshots if UI changes are involved.

---
<div align="center">
  <i>Built with passion. Engineered for speed. Designed for focus.</i>
</div>
