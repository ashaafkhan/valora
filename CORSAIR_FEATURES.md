# Corsair Integration Deep Dive

Valora relies heavily on the **Corsair SDK** to serve as its integration proxy, headless connection manager, and realtime webhook orchestrator. Building native integrations with Google Workspace APIs is fraught with edge cases, security risks, and scaling bottlenecks. Corsair abstracts this complexity.

---

## 1. Why Corsair? (The Integration Problem)

Historically, building an email or calendar client requires managing:
1. **OAuth 2.0 Negotiation**: Implementing PKCE, state tokens, and parsing scopes.
2. **Token Management**: Securely encrypting Access and Refresh tokens, and automatically handling HTTP `401 Unauthorized` responses by rotating tokens mid-flight.
3. **Webhook Subscriptions**: Google Pub/Sub requires setting up domain verification, managing topic subscriptions, and handling duplicate or out-of-order webhook deliveries.
4. **API Rate Limiting**: Implementing exponential backoff when Google inevitably rate-limits bulk fetch operations.

Corsair solves all of these out of the box.

---

## 2. Headless OAuth Flow

Valora uses Corsair in a **Headless Configuration**. We completely control the UI and user experience; Corsair only handles the backend infrastructure.

### The Connection Sequence
1. The user clicks "Connect Gmail" in Valora's Settings UI.
2. A Next.js Server Action requests an OAuth URL from Corsair via `corsair.oauth.generateUrl()`.
3. Corsair dynamically constructs the URL, requesting `mail.read`, `mail.send`, and `calendar.events` scopes.
4. The user authenticates on Google's consent screen.
5. Google redirects back to our endpoint: `/api/corsair/callback`.
6. Valora passes the auth `code` back to Corsair, which completes the PKCE flow, encrypts the resulting tokens, and saves them to the Postgres database.

---

## 3. Real-Time Webhook Architecture

Instead of constantly polling the Google IMAP servers, Valora operates on an instantaneous event-driven architecture powered by Corsair.

### 3.1 Webhook Registration
When an integration connects successfully, Valora immediately invokes a `watch` command.
```typescript
await corsair.integrations.gmail.watch({
  tenantId: session.user.id,
  topics: ["messages.created", "messages.updated"],
  callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/gmail`
});
```

### 3.2 HMAC Verification
To prevent malicious actors from spoofing incoming webhooks, Corsair automatically signs outgoing payloads using an HMAC-SHA256 signature. Our webhook endpoints verify this signature before processing the payload.
If the signature is missing or invalid, the webhook is dropped with a `401 Unauthorized`.

### 3.3 Event Processing (The Payload)
When an email is received, the payload sent to `/api/webhooks/gmail` is extremely lightweight:
```json
{
  "tenantId": "cuid_user_123",
  "integrationId": "gmail",
  "event": "message.created",
  "data": {
    "messageId": "msg_abc123",
    "threadId": "thr_xyz789"
  }
}
```
**Why is it lightweight?** Security and speed. Sending the entire email body over the open web in a webhook is dangerous. Instead, Corsair sends a pointer (`messageId`). Valora's backend immediately spawns an authenticated background worker to securely fetch the full email payload using Corsair's headless API methods (`corsair.api.gmail.getMessage`).

---

## 4. Encryption & Security (Token Sovereignty)

The most critical feature of our Corsair implementation is **Token Sovereignty**.

If a bad actor gains read access to the `corsair_accounts` table in PostgreSQL, they **cannot** steal the Google OAuth tokens.

Corsair uses symmetric **AES-256-GCM** encryption for all tokens at rest.
The encryption key (`CORSAIR_KEK`) is stored purely in the environment variables of the Vercel Edge compute layer. It is never committed to GitHub, and it is never stored in the database.

When Valora requests a Gmail sync:
1. The Vercel function loads `CORSAIR_KEK`.
2. Corsair fetches the encrypted token from Postgres.
3. Corsair decrypts the token in memory.
4. Corsair attaches the token to the HTTP header, fetches the emails from Google, and destroys the decrypted token in memory.

---

## 5. Unified Search Interoperability

Because Corsair homogenizes data across multiple platforms, Valora implements a unified search endpoint `/api/search/corsair`.

Instead of writing custom search syntax for Gmail (e.g., `from:boss@acme.com is:unread`) and entirely different search syntax for Google Calendar, Corsair allows Valora to issue a single unified query object.

Corsair translates this object into platform-specific syntax, executes the searches in parallel, and normalizes the output into a single array of generic `CorsairEntity` objects that Valora renders seamlessly in the UI.

This sets the foundation for Valora to easily integrate Slack, Jira, and GitHub in the future without rewriting the core search engine.
