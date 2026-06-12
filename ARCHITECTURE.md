# Valora — Architecture Overview

> "Command your inbox. Own your time."
> **Domain:** valorahq.in | **Version:** 1.0.0

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  Next.js 15 App Router · Tailwind CSS · shadcn/ui               │
│  Zustand (state) · TanStack Query (server state)                │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTPS / WebSocket
┌─────────────────▼───────────────────────────────────────────────┐
│                     NEXT.JS API ROUTES + tRPC                    │
│  /api/auth  /api/gmail  /api/calendar  /api/agent  /api/search  │
│  /api/webhooks  /api/ai  /api/user                              │
└────┬────────────┬──────────────┬──────────────┬─────────────────┘
     │            │              │              │
┌────▼───┐  ┌────▼────┐  ┌──────▼──────┐  ┌───▼──────────────┐
│Corsair │  │Postgres │  │   Groq AI   │  │   Ngrok Tunnel   │
│  SDK   │  │+ pgvector│  │  (llama-3) │  │  (Webhooks)      │
│  API   │  │  (Neon)  │  │  + Mem0    │  │                  │
└────┬───┘  └─────────┘  └─────────────┘  └──────────────────┘
     │
┌────▼───────────────────────────────┐
│           CORSAIR PLATFORM         │
│  Gmail API   ·   Calendar API      │
│  Webhooks    ·   OAuth Proxy       │
│  Sync Layer  ·   Entity Store      │
└────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 15** (App Router) | Server components, API routes, SSR/RSC |
| Styling | **Tailwind CSS v4 + Radix UI** | Rapid, consistent dark UI with primitives |
| State | **Zustand** | Lightweight, keyboard-driven app state |
| Server State | **TanStack Query v5 + tRPC** | Type-safe API, caching, optimistic updates |
| Database | **PostgreSQL (Neon)** | Serverless Postgres, free tier, pgvector support |
| Vector Search | **pgvector** | Lightning-fast local semantic email search |
| Auth | **NextAuth.js v5 (Auth.js)** | Google OAuth with Prisma adapter |
| AI Model | **Groq (llama-3.3-70b-versatile)** | Ultra-fast inference for email prioritization |
| Memory | **Mem0** | Persistent agent memory across sessions |
| Realtime | **Corsair SDK Webhooks** | Push new emails/events to app |
| ORM | **Prisma** | Type-safe DB queries, pgvector support |
| Validation | **Zod** | Runtime schema validation on all API routes |
| Animations | **Framer Motion** | Micro-animations for premium feel |

---

## Key Design Decisions

### 1. Corsair SDK (not direct Google API calls)
All Gmail and Calendar interactions go through the **Corsair SDK** (`@corsair-dev/gmail`, `@corsair-dev/googlecalendar`). This provides:
- Unified OAuth proxy — users connect once, Corsair handles token refresh
- Built-in webhook infrastructure
- Entity sync and caching layer

### 2. tRPC over REST
Internal API calls use tRPC for end-to-end type safety between the Next.js server and React client. External webhook endpoints remain as plain Next.js API routes.

### 3. Groq over Anthropic (for hackathon speed)
Groq's llama-3.3-70b-versatile provides sub-second inference, critical for real-time email prioritization. The AI layer is abstracted so models can be swapped.

### 4. Prisma output to `generated/prisma`
The Prisma client is generated to `generated/prisma` (not `node_modules`) to keep the generated code inspectable and version-controlled where needed.

### 5. Dark Mode First
The app defaults to dark mode via the `dark` class on `<html>`. A light mode toggle is provided as a user preference, stored in the `User.theme` DB column.

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Sign-in page
│   │   └── onboarding/page.tsx      # 3-step connect flow
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Shell with sidebar
│   │   ├── inbox/page.tsx           # Email command center
│   │   ├── calendar/page.tsx        # Calendar view
│   │   ├── agent/page.tsx           # AI agent chat
│   │   ├── search/page.tsx          # Advanced search
│   │   └── settings/page.tsx        # User settings
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── webhooks/
│   │   │   ├── gmail/route.ts       # Corsair → Gmail push
│   │   │   └── calendar/route.ts    # Corsair → Calendar push
│   │   └── trpc/[trpc]/route.ts
│   ├── layout.tsx                   # Root layout (fonts, metadata)
│   └── page.tsx                     # Root redirect
├── components/
│   ├── inbox/                       # Email UI components
│   ├── calendar/                    # Calendar UI components
│   ├── agent/                       # AI agent chat components
│   └── shared/                      # Sidebar, CommandPalette, etc.
├── lib/
│   ├── ai.ts                        # Groq AI client
│   ├── gmail.ts                     # Gmail integration via Corsair
│   ├── calendar.ts                  # Calendar integration via Corsair
│   ├── security.ts                  # Sensitive content detection
│   ├── shortcuts.ts                 # Keyboard shortcut registry
│   ├── vectors.ts                   # Vector search engine (pgvector + Groq)
│   ├── mem0.ts                      # Memory client
│   ├── agent-tools.ts               # AI agent tool implementations
│   └── api-handler.ts               # Error handling wrapper for routes
├── server/
│   ├── auth.ts                      # NextAuth config
│   ├── db.ts                        # Prisma client
│   ├── corsair.ts                   # Corsair SDK client
│   └── api/                         # tRPC routers
├── store/
│   ├── emailStore.ts                # Zustand email state
│   ├── calendarStore.ts
│   └── agentStore.ts
├── hooks/
│   ├── useKeyboard.ts
│   ├── useCommandPalette.ts
│   ├── useEmailSync.ts
│   ├── useEmailMutations.ts            # Optimistic archive/star/read
│   └── useAgentChat.ts
├── styles/
│   └── globals.css                  # Valora design system
└── types/
    └── index.ts
```

---

## Data Flow

### Email Sync Flow
```
User connects Gmail via Corsair OAuth
  → Corsair syncs existing emails to entity store
  → Webhook registered for new email events
  → New email arrives → Corsair pushes to /api/webhooks/gmail
  → Webhook handler: stores in DB, runs AI prioritization, embeds for vector search
  → Frontend: TanStack Query cache invalidated → UI updates
```

### AI Priority Flow
```
Email received
  → Extract: sender, subject, body preview, labels
  → Groq API: classify priority (urgent/high/normal/low) + reason
  → Store: priorityScore (0-100) + priorityLabel in DB
  → Security Shield: detect sensitive content (bank/OTP/medical)
  → UI: render PriorityBadge + ShieldBadge
```

---

## Environment Variables

See `.env.example` for full list. Critical vars:

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | NextAuth session encryption |
| `AUTH_GOOGLE_ID/SECRET` | Google OAuth credentials |
| `DATABASE_URL` | Neon PostgreSQL connection |
| `CORSAIR_KEK` | Corsair key encryption key |
| `GROQ_API_KEY` | Groq AI inference |
| `MEM0_API_KEY` | Agent memory (optional) |

---

*Last updated: Stage 16 — Performance, Optimization & Code Quality*
