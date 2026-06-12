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
  const regex = /^(.*?)\s*<([^>]+)>$/;
  const match = regex.exec(fromHeader);
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
  const regex = /<([^>]+)>/;
  return headerValue
    .split(",")
    .map((e) => {
      const match = regex.exec(e);
      return (match?.[1] ?? e).trim();
    })
    .filter(Boolean);
}

function decodeBase64(data: string): string {
  // Gmail uses base64url encoding
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

interface MessagePart {
  body?: {
    data?: string | null;
  } | null;
  parts?: MessagePart[] | null;
}

interface GmailMessage {
  id?: string | null;
  snippet?: string | null;
  internalDate?: string | null;
  labelIds?: string[] | null;
  payload?: {
    headers?: Array<{ name?: string; value?: string }> | null;
    body?: {
      data?: string | null;
    } | null;
    parts?: MessagePart[] | null;
  } | null;
}

interface ParsedMessage {
  gmailId: string;
  threadId: string;
  msgSubject: string;
  fromEmail: string;
  fromName: string;
  toEmails: string[];
  ccEmails: string[];
  body: string;
  bodyPreview: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  sentAt: Date;
  receivedAt: Date;
}

function getBody(payload?: MessagePart | null): string {
  if (!payload) return "";
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

    const allMessages: Array<{ message: GmailMessage; threadId: string }> = [];
    const threadMap = new Map<string, { subject: string; snippet: string }>();

    for (const threadListItem of res.threads) {
      if (!threadListItem.id) continue;
      try {
        // Fetch full thread details
        const threadDetails = await corsair.withTenant(userId).gmail.api.threads.get({
          id: threadListItem.id,
        });

        const messages = (threadDetails.messages ?? []) as GmailMessage[];
        if (messages.length === 0) continue;

        // Collect latest thread header details
        const latestMessage = messages[messages.length - 1];
        if (!latestMessage) continue;
        const headers = latestMessage.payload?.headers ?? [];
        const subject = getHeader(headers, "subject") || "(No Subject)";
        const snippet = latestMessage.snippet ?? "";

        threadMap.set(threadListItem.id, { subject, snippet });

        for (const message of messages) {
          if (!message.id) continue;
          allMessages.push({ message, threadId: threadListItem.id });
        }
      } catch (err) {
        console.error(`Failed to fetch thread ${threadListItem.id}:`, err);
        failed++;
      }
    }

    if (allMessages.length === 0) {
      return { synced: 0, failed };
    }

    // Query DB in one single batch to check for existing emails
    const allMessageIds = allMessages.map((item) => item.message.id ?? "").filter(Boolean);
    const existingEmails = await db.email.findMany({
      where: {
        gmailId: { in: allMessageIds },
      },
      select: { gmailId: true },
    });
    const existingIds = new Set(existingEmails.map((e) => e.gmailId));

    const newMessages = allMessages.filter((item) => !existingIds.has(item.message.id ?? ""));

    if (newMessages.length === 0) {
      return { synced: 0, failed };
    }

    // Upsert all required thread parents first
    for (const [threadId, info] of threadMap.entries()) {
      await db.emailThread.upsert({
        where: { id: threadId },
        create: {
          id: threadId,
          subject: info.subject,
          snippet: info.snippet,
        },
        update: {
          subject: info.subject,
          snippet: info.snippet,
          updatedAt: new Date(),
        },
      });
    }

    // Parse and prepare new message data structures
    const parsedMessages: ParsedMessage[] = [];
    for (const item of newMessages) {
      const message = item.message;
      const threadId = item.threadId;

      const msgHeaders = (message.payload?.headers ?? []) as Array<{ name?: string; value?: string }>;
      const msgSubject = getHeader(msgHeaders, "subject") || "(No Subject)";
      const fromHeader = getHeader(msgHeaders, "from");
      const { name: fromName, email: fromEmail } = parseFrom(fromHeader);
      const toEmails = parseEmailList(getHeader(msgHeaders, "to"));
      const ccEmails = parseEmailList(getHeader(msgHeaders, "cc"));

      const body = getBody(message.payload) || (message.snippet ?? "");
      const bodyPreview = message.snippet ?? body.slice(0, 200);

      const labels = message.labelIds ?? [];
      const isRead = !labels.includes("UNREAD");
      const isStarred = labels.includes("STARRED");
      const isArchived = !labels.includes("INBOX");

      const receivedAt = new Date(parseInt(message.internalDate ?? String(Date.now())));
      const sentAt = new Date(getHeader(msgHeaders, "date") || receivedAt.toISOString());

      parsedMessages.push({
        gmailId: message.id ?? "",
        threadId,
        msgSubject,
        fromEmail,
        fromName,
        toEmails,
        ccEmails,
        body,
        bodyPreview,
        labels,
        isRead,
        isStarred,
        isArchived,
        sentAt,
        receivedAt,
      });
    }

    // Batch process in chunks of 10
    const batchSize = 10;
    for (let i = 0; i < parsedMessages.length; i += batchSize) {
      const batch = parsedMessages.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (msg) => {
          try {
            const aiPriority = await scoreEmailPriority({
              subject: msg.msgSubject,
              fromEmail: msg.fromEmail,
              fromName: msg.fromName,
              bodyPreview: msg.bodyPreview,
              labels: msg.labels,
            });

            const securityScan = scanEmailContent({
              subject: msg.msgSubject,
              body: msg.body,
              fromEmail: msg.fromEmail,
            });

            return { aiPriority, securityScan };
          } catch (err) {
            console.error(`AI processing failed for message ${msg.gmailId}:`, err);
            return {
              aiPriority: { label: "normal" as const, score: 40, reason: "Fallback" },
              securityScan: { isSensitive: false, sensitiveTypes: [] },
            };
          }
        })
      );

      // Save chunk to database
      for (let j = 0; j < batch.length; j++) {
        const msg = batch[j]!;
        const result = batchResults[j]!;

        try {
          await db.email.create({
            data: {
              userId,
              gmailId: msg.gmailId,
              threadId: msg.threadId,
              subject: msg.msgSubject,
              fromEmail: msg.fromEmail,
              fromName: msg.fromName ?? null,
              toEmails: msg.toEmails,
              ccEmails: msg.ccEmails,
              body: msg.body,
              bodyPreview: msg.bodyPreview,
              labels: msg.labels,
              isRead: msg.isRead,
              isStarred: msg.isStarred,
              isArchived: msg.isArchived,
              priorityScore: result.aiPriority.score,
              priorityLabel: result.aiPriority.label,
              isSensitive: result.securityScan.isSensitive,
              sensitiveTypes: result.securityScan.sensitiveTypes,
              sentAt: msg.sentAt,
              receivedAt: msg.receivedAt,
            },
          });
          synced++;
        } catch (err) {
          console.error(`Failed to save email ${msg.gmailId}:`, err);
          failed++;
        }
      }

      // Delay 500ms between batches to satisfy rate limits
      if (i + batchSize < parsedMessages.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
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
}): Promise<unknown> {
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
    });

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
    });

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
    });

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
    });

    await db.email.update({
      where: { gmailId },
      data: { isRead: read },
    });
  } catch (err) {
    console.error("[Gmail] Mark read failed:", err);
    throw err;
  }
}
