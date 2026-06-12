/**
 * Valora — Gmail Webhook Handler (Stage 6 / Stage 9)
 * Processes real-time Gmail push notifications from Corsair
 * Verifies HMAC signature, processes new emails, scores priority, runs security shield
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db";
import { scoreEmailPriority } from "@/lib/ai";
import { scanEmailContent } from "@/lib/security";

// ── HMAC Signature Verification ───────────────────────────────
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.CORSAIR_WEBHOOK_SECRET;
  if (!secret) return true; // Skip in dev if not set
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    const sigBuf = Buffer.from(signature.replace(/^sha256=/, ""), "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

// ── POST: Receive Gmail Push Notification ─────────────────────
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-corsair-signature") ??
    request.headers.get("x-hub-signature-256") ??
    "";

  if (!verifySignature(rawBody, signature)) {
    console.warn("[Webhook/Gmail] Invalid signature");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return new NextResponse("Bad Request: invalid JSON", { status: 400 });
  }

  // Log incoming webhook
  try {
    await db.webhookLog.create({
      data: { source: "gmail", payload: data as any, processed: false },
    });
  } catch (err) {
    console.error("[Webhook/Gmail] Failed to log webhook:", err);
  }

  const eventType = (data.type as string) ?? "";

  // ── Process new message ─────────────────────────────────────
  if (eventType === "message.created" || eventType === "gmail.message") {
    const message = (data.message ?? data.data) as Record<string, unknown> | undefined;
    const userId = (data.userId ?? data.tenantId ?? data.user_id) as string | undefined;

    if (!message || !userId) {
      console.warn("[Webhook/Gmail] Missing message or userId in payload");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const gmailId = (message.id ?? message.messageId) as string;
    const threadId = (message.threadId ?? message.thread_id ?? gmailId) as string;
    const subject = (message.subject ?? "(No Subject)") as string;
    const fromHeader = (message.from ?? message.fromEmail ?? "") as string;
    const body = (message.body ?? message.snippet ?? "") as string;
    const bodyPreview = body.slice(0, 200);

    // Parse from header "Name <email>"
    const fromMatch = fromHeader.match(/^(.*?)\s*<([^>]+)>$/);
    const fromName = fromMatch?.[1]?.replace(/^["']|["']$/g, "").trim() ?? "";
    const fromEmail = fromMatch?.[2]?.trim() ?? fromHeader.trim();

    try {
      // Run AI priority + security in parallel
      const [aiPriority, securityScan] = await Promise.all([
        scoreEmailPriority({ subject, fromEmail, fromName, bodyPreview }),
        Promise.resolve(scanEmailContent({ subject, body, fromEmail })),
      ]);

      // Upsert thread
      await db.emailThread.upsert({
        where: { id: threadId },
        create: { id: threadId, subject, snippet: bodyPreview },
        update: { subject, snippet: bodyPreview, updatedAt: new Date() },
      });

      // Upsert email
      await db.email.upsert({
        where: { gmailId },
        create: {
          userId,
          gmailId,
          threadId,
          subject,
          fromEmail,
          fromName: fromName || null,
          toEmails: [],
          ccEmails: [],
          body,
          bodyPreview,
          labels: ["INBOX"],
          isRead: false,
          isStarred: false,
          isArchived: false,
          priorityScore: aiPriority.score,
          priorityLabel: aiPriority.label,
          isSensitive: securityScan.isSensitive,
          sensitiveTypes: securityScan.sensitiveTypes,
          sentAt: new Date(),
          receivedAt: new Date(),
        },
        update: {
          priorityScore: aiPriority.score,
          priorityLabel: aiPriority.label,
          isSensitive: securityScan.isSensitive,
          isRead: false,
        },
      });

      await db.webhookLog.updateMany({
        where: { source: "gmail", processed: false },
        data: { processed: true },
      });

      console.info(
        `[Webhook/Gmail] Processed message ${gmailId} — priority: ${aiPriority.label}`
      );
    } catch (err) {
      console.error("[Webhook/Gmail] Failed to process message:", err);
      return NextResponse.json({ ok: false, error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

// ── GET: Health check ─────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "gmail-webhook",
    timestamp: new Date().toISOString(),
  });
}
