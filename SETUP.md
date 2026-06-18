# Valora Infrastructure & Setup Guide

This guide is intended for DevOps engineers, open-source contributors, and developers deploying Valora to a production environment. 
It covers everything from required system dependencies to environment variable validation, database migration, and edge deployment configurations.

---

## 1. Prerequisites

Before attempting to run Valora locally, ensure your system meets the following strict requirements:
- **Node.js**: `v22.x` or higher (we utilize modern crypto APIs and fetch standards).
- **Package Manager**: `pnpm` (v11+). npm and yarn lockfiles are deliberately `.gitignore`d to prevent version drift.
- **Database**: PostgreSQL 15+ with the `pgvector` extension natively installed. (We strongly recommend using Neon Serverless Postgres for immediate compatibility).
- **OS**: macOS, Linux, or WSL2 for Windows.

---

## 2. Global Environment Variable Configuration

Create a `.env` file in the root directory. Valora uses `zod` inside `src/env.js` to strictly validate these variables at boot time. If any are missing or malformed, the Node process will hard-crash to prevent insecure deployments.

### 2.1 Core Application
```env
# The absolute URL where Valora is hosted. No trailing slash.
# For local dev: http://localhost:3000
# For prod: https://valora.app
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2.2 NextAuth (Authentication Boundary)
```env
# A cryptographically secure 32+ character string. 
# Generate via: `openssl rand -base64 32`
AUTH_SECRET="secure-random-32-byte-string"

# Google Cloud Console OAuth Credentials
# Must have scopes: openid, profile, email
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-client-secret"
```

### 2.3 Database Configuration
```env
# Full connection string for PostgreSQL.
# Neon example: postgresql://[user]:[password]@[endpoint].aws.neon.tech/neondb?sslmode=require
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
```

### 2.4 Integration & Encryption (Corsair)
```env
# AES-256 Key used to encrypt Google OAuth tokens at rest in Postgres.
# MUST BE EXACTLY 32 CHARACTERS OR BASE64. Do NOT lose this or all users will disconnect.
CORSAIR_KEK="secure-random-32-byte-string-exactly"
```

### 2.5 Artificial Intelligence & ML
```env
# Primary reasoning model (gpt-4o)
OPENAI_API_KEY="sk-proj-your_openai_key"

# Fallback Classification Engine & Whisper AI
GROQ_API_KEY="gsk_your_groq_key_here"

# Vector Memory Persistence
MEM0_API_KEY="m0_your_mem0_key_here"
```

---

## 3. Database Initialization & Prisma Migrations

Valora uses Prisma (v6.19) as its ORM. The database requires the `pgvector` extension.

### 3.1 Initializing the Schema
If you are running Valora for the first time on a fresh database:
```bash
# 1. Download dependencies
pnpm install

# 2. Generate the Prisma Client types locally
pnpm dlx prisma generate

# 3. Push the schema to your Postgres instance (creates tables and vector indexes)
pnpm dlx prisma db push
```

*Note: We use `prisma db push` during hackathons/rapid prototyping. For enterprise production, transition to `prisma migrate dev` to manage explicit SQL migration files.*

### 3.2 Seeding
Currently, Valora is a multi-tenant SaaS application. It does not require a complex global seed script. Users and preferences are dynamically created the moment they sign in via Google OAuth.

---

## 4. Running the Development Server

Start the local Next.js server with Turbopack for rapid HMR (Hot Module Replacement):
```bash
pnpm run dev
```

You should see:
```text
Ready in 1250ms
  ➜  Local:   http://localhost:3000
```
Visit the URL. The `LandingNav` and NextAuth boundaries will initialize.

---

## 5. Vercel Production Deployment Guide

Deploying Valora to production requires specific Vercel configurations due to our heavy use of Node.js background workers and Prisma.

### 5.1 Project Setup
1. Import your GitHub repository into Vercel.
2. Select **Next.js** as the framework.

### 5.2 Build Command Override
Vercel caches `node_modules` aggressively. To ensure the Prisma client is generated with the exact database schema during deployment, override the build command:
- **Build Command**: `prisma generate && prisma db push && next build`
- **Install Command**: `pnpm install`

### 5.3 Edge vs Serverless Functions
By default, Next.js App Router API endpoints deploy as Serverless Functions (Node.js). 
- Ensure that your Vercel Project Settings limit Function execution time to at least 30 seconds to allow the Groq AI priority engine time to process bulk email payloads during initial user syncing.
- Ensure the Vercel region (e.g., `iad1` Washington D.C.) matches your Neon Database region to ensure ultra-low latency between compute and database.

### 5.4 Environment Variables
Copy all variables from Section 2 into Vercel's Environment Variables dashboard.
**CRITICAL**: Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://valora.app`), otherwise Corsair webhooks will fail to reach your server.

---

## 6. Troubleshooting Common Issues

### 6.1 `Error: P2003 Foreign key constraint failed`
This occurs when the "Danger Zone" account deletion or manual DB manipulation is done out of order. Ensure you always delete `Email` and `CalendarEvent` rows *before* deleting the parent `User` row, as they do not possess `onDelete: Cascade` modifiers for safety reasons.

### 6.2 `Error: Corsair KEK must be exactly 32 bytes`
The `CORSAIR_KEK` environment variable is strictly checked. If it is 31 or 33 characters, the app will crash on boot. Generate a proper key using `openssl`.

### 6.3 `Vercel Build Failed: Type error in check-tables.ts`
If you created temporary `.ts` debugging scripts in the root directory, the Next.js compiler will attempt to parse them and fail if they have invalid imports. Delete any scratch scripts in the root folder before deploying to Vercel.
