# Valora Architecture Deep Dive

This document outlines the core architectural choices, technical layers, and infrastructure scaling considerations for the Valora AI Workflow Command Center. It is designed for senior engineers, DevOps, and architectural reviewers.

---

## 1. Topological Overview

Valora employs a **hybrid monolithic architecture** utilizing Next.js 15 (App Router). While the codebase is unified in a single repository, the runtime boundary is strictly bifurcated into edge-compatible React Server Components (RSC) and long-running Node.js API processes for data mutation.

### 1.1 Infrastructure Tiers

- **Client Tier (Browser)**: React 19, Zustand, Framer Motion, tRPC Client. Focuses on zero-latency optimistic UI updates.
- **Edge Tier (Vercel Edge Network)**: Handles Next.js routing, middleware auth checks, and static asset delivery.
- **Compute Tier (Vercel Serverless Functions)**: Node.js runtime executing Prisma Client mutations, Groq API inference calls, and Corsair Webhook processing.
- **Data Tier (Neon Serverless Postgres)**: A decoupled, globally accessible Postgres database with `pgvector` enabled for semantic search.

---

## 2. The Vector Database & Semantic Pipeline

A core differentiation of Valora is its native integration of vector mathematics for search and memory retrieval.

### 2.1 The pgvector Extension
We utilize `pgvector` inside Neon Postgres rather than an external vector database (like Pinecone) to ensure ACID compliance between relational email metadata and high-dimensional embeddings. 
- **Dimensionality**: We use 768-dimensional float arrays (`vector(768)`).
- **Distance Metric**: We utilize Cosine Similarity (`<=>`) for computing textual distance between a user's search query and historical emails.

```sql
-- Internal SQL representation of a semantic search
SELECT id, subject, bodyPreview, 
       1 - (embedding <=> $1) AS similarity 
FROM "Email" 
WHERE 1 - (embedding <=> $1) > 0.7 
ORDER BY similarity DESC 
LIMIT 10;
```

### 2.2 Embedding Generation
When an email is ingested via Corsair, the backend strips the HTML and generates a text embedding via OpenAI or a lightweight local model before inserting it into the `Email` table. This allows users to search "when are we deploying" and retrieve an email titled "Release Schedule" even if the keywords do not strictly match.

---

## 3. Advanced AI Orchestration

Valora implements a fault-tolerant LLM router to process thousands of emails per day without breaking due to rate limits.

### 3.1 Fallback Hierarchy
Located in `src/lib/ai.ts`, the orchestrator uses a primary/secondary fallback pattern:
1. **Primary Model**: OpenAI `gpt-4o`. Used for complex reasoning (e.g., generating sophisticated multi-paragraph replies).
2. **Secondary Model**: Groq `llama-3.3-70b-versatile`. Capable of 800+ tokens per second. Used for instantaneous Priority Engine classification and failover if OpenAI times out.

### 3.2 The Priority Engine Mechanics
The Priority Engine is a non-blocking asynchronous worker. 
1. Corsair Webhook hits `/api/webhooks/gmail`.
2. Next.js immediately returns a `200 OK` to prevent webhook retries.
3. Node.js `Promise.allSettled` spawns a background thread to fetch the raw email body.
4. Groq parses the email text via a rigid JSON schema, returning a deterministic `priorityScore` (0-100).
5. Prisma saves the score to the DB.
6. A tRPC mutation triggers a UI invalidation, instantly glowing the email "red" if `score > 90`.

---

## 4. State Management & Render Optimization

Email clients face massive performance degradation when rendering lists of 1,000+ items.

### 4.1 Zustand Store Architecture
We explicitly avoid React Context for our email list arrays to prevent massive re-render trees. 

Instead, `useMailStore` (Zustand) sits entirely outside the React component tree. We use **Zustand Selectors** to ensure that components only re-render when the exact slice of state they care about changes.

```typescript
// Good: Only re-renders if the active thread changes
const activeThreadId = useMailStore(state => state.activeThreadId);

// Bad (Avoided in Valora): Re-renders if ANY email state changes
const store = useMailStore(); 
```

### 4.2 tRPC over REST
We utilize **tRPC** for all client-to-database mutations. This provides end-to-end type safety.
- **Client Side**: Uses `@trpc/react-query` to automatically cache and deduplicate identical API requests (e.g., if two components request the same user profile simultaneously).
- **Server Side**: All input payloads are strictly validated using `zod` schemas. If a client attempts to pass a string instead of a number for `emailsPerPage`, the server rejects it with a `400 Bad Request` before the Node controller even executes.

---

## 5. Security Architecture

Valora is designed under a "Zero Trust" model regarding user data.

### 5.1 OAuth Token Encryption
Valora never holds plaintext Google OAuth tokens. 
When the Corsair SDK negotiates the OAuth flow, the resulting access tokens and refresh tokens are encrypted at rest using AES-256-GCM. 
The symmetric key (`CORSAIR_KEK`) is securely injected via Vercel Environment Variables and never committed to source control.

### 5.2 NextAuth Middleware Security
Valora utilizes Next.js App Router Middleware (`middleware.ts`) to intercept every request at the Edge.
If an unauthenticated user attempts to access `/inbox` or any internal API route, the Edge network instantly redirects them to `/login` without ever spinning up a Node.js compute container, saving backend compute resources and preventing unauthorized execution entirely.

### 5.3 The Danger Zone (Atomic Purge)
When a user deletes their account, we execute a massive, multi-table `db.$transaction([])`. 
Because Prisma does not implicitly execute cascading deletes in a single atomic SQL command for some relations, we explicitly target and delete dependent records first. If any single table deletion fails (e.g., database network drop), the entire transaction rolls back instantly, ensuring no "ghost accounts" or corrupted states are left behind.

---

## 6. Future Architectural Scaling

As Valora scales beyond 10,000 MAU (Monthly Active Users), the architecture is prepared to shift:

1. **Redis Caching Layer**: Implementing Upstash Redis to cache user configurations and avoid hitting Neon Postgres on every tRPC validation request.
2. **Dedicated Worker Nodes**: Moving the AI Priority Engine from Vercel Serverless Functions to dedicated AWS EC2/Render Background Workers connected to a BullMQ queue to handle massive bursts of incoming email traffic during peak hours without serverless timeout limits.
