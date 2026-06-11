# Valora

### "Command your inbox. Own your time."

**The AI-native command center for Gmail and Google Calendar.**

Valora is a Superhuman-grade productivity app — built for professionals who refuse to let their inbox run their life. Powered by Corsair integrations and a production-grade AI agent.

🌐 [valorahq.in](https://valorahq.in) 

---

## Features

- **🤖 AI Priority Inbox** — LLM-powered email classification (urgent/high/normal/low)
- **⌨️ Keyboard-first** — Full command palette + vim-like shortcuts
- **📅 Unified command center** — Gmail + Google Calendar in one workspace
- **🧠 AI Agent** — Chat with your inbox, schedule meetings, draft replies
- **🔔 Real-time webhooks** — Corsair push notifications, no polling
- **🔍 Lightning search** — pgvector semantic search under 1 second
- **🛡️ Security Shield** — Auto-filter bank/OTP/sensitive emails
- **🌙 Dark mode first** — Premium dark UI with light mode toggle

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + Radix UI |
| Database | PostgreSQL (Neon) + pgvector |
| Auth | NextAuth.js v5 (Google OAuth) |
| AI | Groq (llama-3.3-70b) + Mem0 |
| Email/Calendar | Corsair SDK |
| ORM | Prisma |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 11+
- PostgreSQL database (Neon recommended)

### Setup

```bash
# 1. Clone
git clone https://github.com/valora-hq/valora
cd valora

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
# Fill in all values in .env

# 4. Push database schema
pnpm db:push

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Required Environment Variables

| Variable | Where to get it |
|----------|----------------|
| `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` | [console.cloud.google.com](https://console.cloud.google.com) |
| `DATABASE_URL` | [neon.tech](https://neon.tech) |
| `CORSAIR_KEK` | [corsair.dev](https://corsair.dev) |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `MEM0_API_KEY` | [app.mem0.ai](https://app.mem0.ai) (optional) |

See `.env.example` for the full list.

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, tech decisions, data flows
- [CORSAIR_FEATURES.md](./CORSAIR_FEATURES.md) — All Corsair integrations used

---

## Scripts

```bash
pnpm dev          # Start dev server (turbo)
pnpm build        # Production build
pnpm db:push      # Push Prisma schema to database
pnpm db:studio    # Open Prisma Studio
pnpm typecheck    # TypeScript type check
pnpm lint         # ESLint
```

---

## License

Open source — MIT License.

Built at a hackathon with ❤️ and ☕ | Powered by [Corsair](https://corsair.dev)
