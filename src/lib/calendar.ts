/**
 * @file calendar.ts
 * @description Google Calendar integration — sync, create, update, delete events via Corsair
 *
 * WHY: Same architecture as gmail.ts — all calendar operations go through Corsair.
 * This keeps OAuth token management in one place and provides real-time webhook support.
 *
 * ARCHITECTURE NOTE: Events are stored locally in Postgres for fast reads. The UI
 * reads from the local DB and writes to Corsair, which syncs to Google Calendar.
 *
 * OPTIMIZATION: Natural language scheduling ("lunch tomorrow at 1pm") is parsed
 * by the AI agent before creating the event, enabling the "Schedule Meeting" flow.
 */
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import { groq, AI_MODEL } from "@/lib/ai";

// ── Sync Calendar Events ────────────────────────────────────────
export async function syncCalendarEvents(
  userId: string,
  maxResults = 50,
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  try {
    const calendarRes = await corsair
      .withTenant(userId)
      .googlecalendar.api.events.getMany({
        maxResults,
      });

    if (!calendarRes.items || calendarRes.items.length === 0) {
      return { synced: 0, failed: 0 };
    }

    for (const item of calendarRes.items) {
      if (!item.id) continue;

      try {
        const title = item.summary ?? "(No Title)";
        const description = item.description ?? null;
        const location = item.location ?? null;

        // Parse start/end dates
        const startStr = item.start?.dateTime ?? item.start?.date;
        const endStr = item.end?.dateTime ?? item.end?.date;
        if (!startStr || !endStr) continue;

        const startTime = new Date(startStr);
        const endTime = new Date(endStr);
        const isAllDay = !item.start?.dateTime;

        // Parse attendees
        const attendees = Array.isArray(item.attendees)
          ? (item.attendees as Array<{ email?: string; displayName?: string; responseStatus?: string }>).map((a) => ({
              email: a.email ?? "",
              name: a.displayName ?? "",
              status: a.responseStatus ?? "needsAction",
            }))
          : [];

        const status = item.status ?? "confirmed";
        const color = item.colorId ?? null;
        const recurrence = Array.isArray(item.recurrence) ? item.recurrence.join("\n") : null;
        const videoLink = item.hangoutLink ?? null;

        await db.calendarEvent.upsert({
          where: { googleEventId: item.id },
          create: {
            userId,
            googleEventId: item.id,
            calendarId: "primary",
            title,
            description,
            location,
            startTime,
            endTime,
            isAllDay,
            attendees,
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
            attendees,
            recurrence,
            videoLink,
            status,
            color,
            updatedAt: new Date(),
          },
        });

        synced++;
      } catch (err) {
        console.error(`Failed to sync calendar event ${item.id}:`, err);
        failed++;
      }
    }
  } catch (err) {
    console.error(`Google Calendar sync failed for user ${userId}:`, err);
    throw err;
  }

  return { synced, failed };
}

// ── Create Event ───────────────────────────────────────────────
export async function createCalendarEvent(params: {
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  attendees?: string[];
}): Promise<unknown> {
  const { userId, title, startTime, endTime, description, location, attendees } = params;

  try {
    const formattedAttendees = attendees?.map((email) => ({ email })) ?? [];

    type CreateParams = Parameters<
      ReturnType<typeof corsair.withTenant>["googlecalendar"]["api"]["events"]["create"]
    >[0];

    const res = await corsair
      .withTenant(userId)
      .googlecalendar.api.events.create({
        event: {
          summary: title,
          description,
          location,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          attendees: formattedAttendees,
        }
      } as CreateParams);

    // Sync the newly created event to local DB
    if (res?.id) {
      await syncCalendarEvents(userId);
    }

    return res;
  } catch (err) {
    console.error("[Calendar] Create event failed:", err);
    throw err;
  }
}

// ── Update Event ───────────────────────────────────────────────
export async function updateCalendarEvent(params: {
  userId: string;
  googleEventId: string;
  title?: string;
  startTime?: Date;
  endTime?: Date;
  description?: string;
  location?: string;
  attendees?: string[];
}): Promise<unknown> {
  const { userId, googleEventId, title, startTime, endTime, description, location, attendees } = params;

  try {
    type UpdateParams = Parameters<
      ReturnType<typeof corsair.withTenant>["googlecalendar"]["api"]["events"]["update"]
    >[0];

    type EventBody = NonNullable<UpdateParams["event"]>;

    const patchBody: EventBody = {};
    if (title) patchBody.summary = title;
    if (description !== undefined) patchBody.description = description;
    if (location !== undefined) patchBody.location = location;
    if (startTime) patchBody.start = { dateTime: startTime.toISOString() };
    if (endTime) patchBody.end = { dateTime: endTime.toISOString() };
    if (attendees !== undefined) {
      patchBody.attendees = attendees.map((email) => ({ email }));
    }

    const res = await corsair
      .withTenant(userId)
      .googlecalendar.api.events.update({
        id: googleEventId,
        event: patchBody,
      });

    if (res?.id) {
      await syncCalendarEvents(userId);
    }

    return res;
  } catch (err) {
    console.error("[Calendar] Update event failed:", err);
    throw err;
  }
}

// ── Delete Event ───────────────────────────────────────────────
export async function deleteCalendarEvent(userId: string, googleEventId: string): Promise<void> {
  try {
    type DeleteParams = Parameters<
      ReturnType<typeof corsair.withTenant>["googlecalendar"]["api"]["events"]["delete"]
    >[0];

    await corsair
      .withTenant(userId)
      .googlecalendar.api.events.delete({
        id: googleEventId,
      });

    // Delete locally
    await db.calendarEvent.deleteMany({
      where: { googleEventId },
    });
  } catch (err) {
    console.error("[Calendar] Delete event failed:", err);
    throw err;
  }
}

// ── Calendar AI Assistant ─────────────────────────────────────────
export async function queryCalendarAssistant(
  input: string,
  userId: string,
): Promise<string> {
  // Fetch recent past and upcoming events for context
  const now = new Date();
  const pastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 2 weeks back
  const futureMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month forward

  const events = await db.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: pastWeek, lte: futureMonth },
    },
    select: { title: true, startTime: true, endTime: true, status: true, attendees: true, location: true },
    orderBy: { startTime: "asc" },
  });

  const eventContext = events
    .map((e) => `"${e.title}" from ${e.startTime.toISOString()} to ${e.endTime.toISOString()} (Status: ${e.status})`)
    .join("\n");

  const prompt = `You are Valora's intelligent Calendar Assistant. The user is asking you a question about their calendar.

Current time: ${now.toISOString()}

User's recent and upcoming calendar events:
${eventContext || "No events found."}

User request: "${input}"

Instructions:
- If the user asks you to ADD, CREATE, or SCHEDULE a new event, politely tell them to "Please use the Zara AI chat interface or the Create Event button to schedule new events." Do NOT attempt to confirm scheduling here.
- If the user asks for a summary of events, what events they attended, or what's coming up, provide a concise, friendly, and highly readable summary.
- Keep your response brief, professional, and directly answer the question.
- Do NOT use markdown headings. Use bolding and bullet points if needed.`;

  try {
    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    return completion.choices[0]?.message?.content || "I couldn't process that request right now.";
  } catch (err) {
    console.error("[Calendar] AI query failed:", err);
    return "I'm having trouble connecting to my brain. Please try again later.";
  }
}
