# Valora — Setup Guide

## Prerequisites

- **Node.js** 20+ (recommended: use `nvm` or `fnm`)
- **pnpm** 11+ (`npm install -g pnpm`)
- **PostgreSQL** database — [Neon](https://neon.tech) (free tier) recommended
- **Ngrok** (for local webhook testing) — [ngrok.com](https://ngrok.com)

---

## 1. Clone & Install

```bash
git clone https://github.com/valora-hq/valora
cd valora
pnpm install
```

---

## 2. Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in all values:

| Variable | Required | How to Get |
|----------|----------|------------|
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Yes | [Google Cloud Console](https://console.cloud.google.com) — create OAuth 2.0 credentials |
| `AUTH_GOOGLE_SECRET` | Yes | Same as above |
| `DATABASE_URL` | Yes | [Neon](https://neon.tech) — create project, copy connection string |
| `CORSAIR_KEK` | Yes | `openssl rand -hex 32` |
| `CORSAIR_WEBHOOK_SECRET` | Yes | `openssl rand -hex 32` |
| `GROQ_API_KEY` | Yes | [Groq Console](https://console.groq.com) |
| `MEM0_API_KEY` | No | [Mem0](https://app.mem0.ai) — agent memory, optional |

**Google OAuth Scopes needed:**
```
openid, email, profile
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
```

---

## 3. Database

```bash
pnpm db:push    # Push Prisma schema to PostgreSQL
pnpm db:studio  # (Optional) Open Prisma Studio to inspect data
```

---

## 4. Corsair Setup

```bash
pnpm corsair:setup  # Runs @corsair-dev/cli setup wizard
```

This creates the required Corsair database tables and configures the SDK.

---

## 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 6. Webhook Tunneling (for Real-time Features)

To receive real-time Gmail/Calendar push notifications during development:

```bash
# Terminal 1 — Start ngrok
ngrok http 3000

# Terminal 2 — Register webhook URL with Corsair
# Use the ngrok https URL from Terminal 1
pnpm corsair webhook:register --url https://your-ngrok-url.ngrok-free.app/api/webhooks
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server (Turbo) |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Push Prisma schema |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:generate` | Regenerate Prisma client |

---

## Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add
```
