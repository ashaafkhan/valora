# Valora — AI Command Center for Gmail & Calendar

> Command your inbox. Own your time.

**valorahq.in** | [Live Demo](https://valorahq.in) | [Setup Guide](./SETUP.md)

Valora is an open-source, Superhuman-grade email and calendar command center.
Built with Next.js, Postgres, and Corsair. AI-powered with Groq and memory via Mem0.

## Features

- 🤖 **AI Agent** — Natural language email & calendar control with persistent memory
- ⚡ **Priority Inbox** — LLM-powered email scoring (Urgent → Low)
- 🛡️ **Security Shield** — Auto-detect and blur sensitive emails (OTPs, bank details)
- ⌨️ **Keyboard-first** — Every action has a shortcut. ⌘K command palette.
- 🔍 **Lightning Search** — pgvector semantic search across all emails in <500ms
- 📡 **Real-time** — Corsair webhooks, no polling ever
- 📅 **Unified** — Email + Calendar in one command center

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

## Setup

See [SETUP.md](./SETUP.md) for complete setup instructions.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, tech decisions, data flows
- [CORSAIR_FEATURES.md](./CORSAIR_FEATURES.md) — All Corsair integrations used

## Scripts

```bash
pnpm dev          # Start dev server (turbo)
pnpm build        # Production build
pnpm typecheck    # TypeScript type check
pnpm lint         # ESLint
pnpm db:push      # Push Prisma schema to database
pnpm db:studio    # Open Prisma Studio
```

## License

Open source — MIT License.

Built at a hackathon with ❤️ and ☕ | Powered by [Corsair](https://corsair.dev)
