/**
 * Valora — Calendar Webhook Handler (Stage 6 / Stage 9)
 * Processes real-time Google Calendar push notifications from Corsair
 * Verifies HMAC signature, upserts events in DB
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db";

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

// ── POST: Receive Calendar Push Notification ──────────────────
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-corsair-signature") ??
    request.headers.get("x-hub-signature-256") ??
    "";

  if (!verifySignature(rawBody, signature)) {
    console.warn("[Webhook/Calendar] Invalid signature");
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
      data: { source: "calendar", payload: data as any, processed: false },
    });
  } catch (err) {
    console.error("[Webhook/Calendar] Failed to log webhook:", err);
  }

  const eventType = (data.type as string) ?? "";

  // ── Process event created or updated ────────────────────────
  if (
    eventType === "event.created" ||
    eventType === "event.updated" ||
    eventType === "calendar.event"
  ) {
    const event = (data.event ?? data.data) as Record<string, unknown> | undefined;
    const userId = (data.userId ?? data.tenantId ?? data.user_id) as string | undefined;

    if (!event || !userId) {
      console.warn("[Webhook/Calendar] Missing event or userId in payload");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const googleEventId = (event.id ?? event.eventId) as string;
    const calendarId = (event.calendarId ?? event.calendar_id ?? "primary") as string;
    const title = (event.summary ?? event.title ?? "Untitled Event") as string;
    const description = (event.description ?? null) as string | null;
    const location = (event.location ?? null) as string | null;
    const videoLink = (event.hangoutLink ?? event.videoLink ?? null) as string | null;
    const status = (event.status ?? "confirmed") as string;
    const color = (event.colorId ?? event.color ?? null) as string | null;

    // Parse start/end times
    const startRaw = event.start as Record<string, string> | undefined;
    const endRaw = event.end as Record<string, string> | undefined;
    const startTime = new Date(
      startRaw?.dateTime ?? startRaw?.date ?? new Date().toISOString()
    );
    const endTime = new Date(
      endRaw?.dateTime ?? endRaw?.date ?? new Date(Date.now() + 3600000).toISOString()
    );
    const isAllDay = !startRaw?.dateTime;

    const attendees = Array.isArray(event.attendees) ? event.attendees : [];
    const recurrence =
      Array.isArray(event.recurrence) && event.recurrence.length > 0
        ? (event.recurrence as string[]).join("\n")
        : null;

    try {
      await db.calendarEvent.upsert({
        where: { googleEventId },
        create: {
          userId,
          googleEventId,
          calendarId,
          title,
          description,
          location,
          startTime,
          endTime,
          isAllDay,
          attendees: attendees as any,
          recurrence,
          videoLink,
          status,
          color,
        },
        update: {
          title,
          description,
          location,
          startTime,
          endTime,
          isAllDay,
          attendees: attendees as any,
          recurrence,
          videoLink,
          status,
          color,
        },
      });

      await db.webhookLog.updateMany({
        where: { source: "calendar", processed: false },
        data: { processed: true },
      });

      console.info(
        `[Webhook/Calendar] Processed event ${googleEventId}: "${title}"`
      );
    } catch (err) {
      console.error("[Webhook/Calendar] Failed to process event:", err);
      return NextResponse.json({ ok: false, error: "Processing failed" }, { status: 500 });
    }
  }

  // ── Process event deleted ────────────────────────────────────
  if (eventType === "event.deleted") {
    const event = (data.event ?? data.data) as Record<string, unknown> | undefined;
    if (event?.id) {
      try {
        await db.calendarEvent.deleteMany({
          where: { googleEventId: event.id as string },
        });
        console.info(`[Webhook/Calendar] Deleted event ${event.id as string}`);
      } catch (err) {
        console.error("[Webhook/Calendar] Failed to delete event:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

// ── GET: Health check ─────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "calendar-webhook",
    timestamp: new Date().toISOString(),
  });
}
