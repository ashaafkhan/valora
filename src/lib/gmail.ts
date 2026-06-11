/**
 * Valora — Gmail Integration Helpers
 * Handles interaction with Gmail via Corsair and database synchronization
 */
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import { scoreEmailPriority } from "./ai";
import { scanEmailContent } from "./security";

// ── Header Parsing Helpers ─────────────────────────────────────
function getHeader(headers: Array<{ name?: string; value?: string }>, name: string): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function parseFrom(fromHeader: string): { name: string; email: string } {
  if (!fromHeader) return { name: "", email: "" };
  const match = fromHeader.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1]?.replace(/^["']|["']$/g, "").trim() ?? "",
      email: match[2]?.trim() ?? "",
    };
  }
  return { name: "", email: fromHeader.trim() };
}

function parseEmailList(headerValue: string): string[] {
  if (!headerValue) return [];
  return headerValue
    .split(",")
    .map((e) => {
      const match = e.match(/<([^>]+)>/);
      return (match && match[1] ? match[1] : e).trim();
    })
    .filter(Boolean);
}

function decodeBase64(data: string): string {
  // Gmail uses base64url encoding
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function getBody(payload: any): string {
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const body = getBody(part);
      if (body) return body;
    }
  }
  return "";
}

// ── Email Synchronization ──────────────────────────────────────
export async function syncGmailInbox(userId: string, maxThreads = 20): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  try {
    const res = await corsair.withTenant(userId).gmail.api.threads.list({
      maxResults: maxThreads,
    });

    if (!res.threads || res.threads.length === 0) {
      return { synced: 0, failed: 0 };
    }

    for (const threadListItem of res.threads) {
      if (!threadListItem.id) continue;
      try {
        // Fetch full thread details
        const threadDetails = await corsair.withTenant(userId).gmail.api.threads.get({
          id: threadListItem.id,
        });

        if (!threadDetails.messages || threadDetails.messages.length === 0) continue;

        // Upsert the Thread record
        const latestMessage = threadDetails.messages[threadDetails.messages.length - 1];
        if (!latestMessage) continue;
        const headers = latestMessage.payload?.headers ?? [];
        const subject = getHeader(headers, "subject") || "(No Subject)";
        const snippet = latestMessage.snippet ?? "";

        await db.emailThread.upsert({
          where: { id: threadListItem.id },
          create: {
            id: threadListItem.id,
            subject,
            snippet,
          },
          update: {
            subject,
            snippet,
            updatedAt: new Date(),
          },
        });

        // Process each message in the thread
        for (const message of threadDetails.messages) {
          if (!message.id) continue;

          // Check if message is already in our DB
          const existing = await db.email.findUnique({
            where: { gmailId: message.id },
            select: { id: true },
          });

          if (existing) continue; // Skip if already synced

          const msgHeaders = message.payload?.headers ?? [];
          const msgSubject = getHeader(msgHeaders, "subject") || "(No Subject)";
          const fromHeader = getHeader(msgHeaders, "from");
          const { name: fromName, email: fromEmail } = parseFrom(fromHeader);
          const toEmails = parseEmailList(getHeader(msgHeaders, "to"));
          const ccEmails = parseEmailList(getHeader(msgHeaders, "cc"));

          const body = getBody(message.payload) || message.snippet || "";
          const bodyPreview = message.snippet ?? body.slice(0, 200);

          const labels = message.labelIds ?? [];
          const isRead = !labels.includes("UNREAD");
          const isStarred = labels.includes("STARRED");
          const isArchived = !labels.includes("INBOX");

          const receivedAt = new Date(parseInt(message.internalDate ?? String(Date.now())));
          const sentAt = new Date(getHeader(msgHeaders, "date") || receivedAt.toISOString());

          // AI Priority Engine
          const aiPriority = await scoreEmailPriority({
            subject: msgSubject,
            fromEmail,
            fromName,
            bodyPreview,
            labels,
          });

          // Security Shield
          const securityScan = scanEmailContent({
            subject: msgSubject,
            body,
            fromEmail,
          });

          // Save Email record
          await db.email.create({
            data: {
              userId,
              gmailId: message.id,
              threadId: threadListItem.id,
              subject: msgSubject,
              fromEmail,
              fromName: fromName || null,
              toEmails,
              ccEmails,
              body,
              bodyPreview,
              labels,
              isRead,
              isStarred,
              isArchived,
              priorityScore: aiPriority.score,
              priorityLabel: aiPriority.label,
              isSensitive: securityScan.isSensitive,
              sensitiveTypes: securityScan.sensitiveTypes,
              sentAt,
              receivedAt,
            },
          });

          synced++;
        }
      } catch (err) {
        console.error(`Failed to sync thread ${threadListItem.id}:`, err);
        failed++;
      }
    }
  } catch (err) {
    console.error(`Gmail sync failed for user ${userId}:`, err);
    throw err;
  }

  return { synced, failed };
}

// ── Send Email ──────────────────────────────────────────────────
export async function sendGmailEmail(params: {
  userId: string;
  to: string;
  subject: string;
  body: string; // HTML body support
  cc?: string[];
}): Promise<any> {
  const { userId, to, subject, body, cc } = params;

  // Build raw MIME message
  const mimeParts = [
    `To: ${to}`,
    cc && cc.length > 0 ? `Cc: ${cc.join(", ")}` : "",
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    body,
  ].filter(Boolean);

  const rawMime = Buffer.from(mimeParts.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // base64url encoded

  try {
    const res = await corsair.withTenant(userId).gmail.api.messages.send({
      raw: rawMime,
    } as any);

    return res;
  } catch (err) {
    console.error("[Gmail] Send failed:", err);
    throw err;
  }
}

// ── Message Mutations (Archive, Star, Read status) ──────────────
export async function archiveEmail(userId: string, gmailId: string): Promise<void> {
  try {
    // Remove "INBOX" label in Gmail
    await corsair.withTenant(userId).gmail.api.messages.modify({
      id: gmailId,
      removeLabelIds: ["INBOX"],
    } as any);

    // Update locally in DB
    await db.email.update({
      where: { gmailId },
      data: { isArchived: true, labels: { set: [] } }, // Simplification
    });
  } catch (err) {
    console.error("[Gmail] Archive failed:", err);
    throw err;
  }
}

export async function starEmail(userId: string, gmailId: string, star: boolean): Promise<void> {
  try {
    await corsair.withTenant(userId).gmail.api.messages.modify({
      id: gmailId,
      addLabelIds: star ? ["STARRED"] : [],
      removeLabelIds: star ? [] : ["STARRED"],
    } as any);

    await db.email.update({
      where: { gmailId },
      data: { isStarred: star },
    });
  } catch (err) {
    console.error("[Gmail] Star failed:", err);
    throw err;
  }
}

export async function markEmailRead(userId: string, gmailId: string, read: boolean): Promise<void> {
  try {
    await corsair.withTenant(userId).gmail.api.messages.modify({
      id: gmailId,
      addLabelIds: read ? [] : ["UNREAD"],
      removeLabelIds: read ? ["UNREAD"] : [],
    } as any);

    await db.email.update({
      where: { gmailId },
      data: { isRead: read },
    });
  } catch (err) {
    console.error("[Gmail] Mark read failed:", err);
    throw err;
  }
}
