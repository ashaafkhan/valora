# Valora — Corsair Features Used

> This document lists every Corsair SDK feature used in Valora, as required for hackathon submission.

---

## Packages Installed

| Package | Version | Purpose |
|---------|---------|---------|
| `corsair` | ^0.1.76 | Core Corsair SDK |
| `@corsair-dev/gmail` | ^0.1.4 | Gmail integration |
| `@corsair-dev/googlecalendar` | ^0.1.3 | Google Calendar integration |
| `@corsair-dev/github` | ^0.1.9 | GitHub OAuth (secondary auth) |
| `@corsair-dev/cli` | ^0.1.19 | CLI for integration setup |

---

## Feature 1 — Gmail Integration (`@corsair-dev/gmail`)

**What it does:** Provides OAuth-proxied access to Gmail, handling token management, rate limiting, and sync.

**Used for:**
- ✅ Listing messages (inbox, sent, drafts)
- ✅ Reading full message content (body, headers, attachments metadata)
- ✅ Sending emails
- ✅ Saving drafts
- ✅ Modifying messages (mark read/unread, star, archive)
- ✅ Managing labels
- ✅ Searching messages (Corsair search API)
- ✅ Reading threads (full conversation)

**Implementation:** `src/lib/corsair.ts` → `corsairGmail.*`

---

## Feature 2 — Google Calendar Integration (`@corsair-dev/googlecalendar`)

**What it does:** Provides OAuth-proxied access to Google Calendar.

**Used for:**
- ✅ Listing calendar events (week/month/day views)
- ✅ Reading event details (attendees, Meet links, recurrence)
- ✅ Creating new events
- ✅ Updating existing events
- ✅ Deleting events
- ✅ Quick scheduling from AI agent commands

**Implementation:** `src/lib/corsair.ts` → `corsairCalendar.*`

---

## Feature 3 — Webhook Infrastructure

**What it does:** Pushes real-time events to Valora without polling.

### Gmail Webhooks
- **Endpoint:** `/api/webhooks/gmail`
- **Events handled:** new message, label change, thread update
- **HMAC verification:** Validates `CORSAIR_WEBHOOK_SECRET` on every payload

### Calendar Webhooks
- **Endpoint:** `/api/webhooks/calendar`
- **Events handled:** event created, event updated, event deleted
- **HMAC verification:** Same secret, same validation

**Database:** Events logged to `WebhookLog` table for audit trail.

---

## Feature 4 — OAuth Proxy (Corsair Auth)

**What it does:** Corsair acts as the OAuth proxy between Valora and Google — users authorize once through the Corsair-powered onboarding flow, and Corsair stores/refreshes tokens automatically.

**Used in:**
- `/app/(auth)/onboarding/` — Step 1 (Gmail) + Step 2 (Calendar) connect buttons
- `CorsairIntegration` + `CorsairAccount` Prisma models store the Corsair-managed connection state

---

## Feature 5 — Entity Sync (Corsair Entity Store)

**What it does:** Corsair maintains a normalized entity store of Gmail messages and Calendar events, enabling efficient delta syncs.

**Used for:**
- Initial sync on onboarding (last 30 days of email)
- Delta sync on webhook events
- Data stored in `CorsairEntity`, `CorsairEvent` Prisma models

---

## Feature 6 — Corsair Search API

**What it does:** Server-side search across Gmail via Corsair's search endpoint.

**Used in:**
- `/api/search/corsair` — full-text search across Gmail
- Combined with local pgvector search for hybrid semantic + keyword results

---

## Corsair Configuration

```
CORSAIR_KEK=<master-encryption-key>   # Key Encryption Key for token storage
```

The Corsair SDK is initialized via the `@corsair-dev/cli` setup, which configures the database tables (`corsair_integrations`, `corsair_accounts`, `corsair_entities`, `corsair_events`) through Prisma migrations.

---

## References

- Corsair Docs: https://corsair.dev/docs
- Setup Videos: https://drive.google.com/drive/folders/1grUZ_nYtY-AwXk5iQlOoXAfYMtKDpW39
- Reference Implementation: https://github.com/corsairdev/google-demo

---

*Last updated: Stage 1 — Vision, Branding & Market Research*
