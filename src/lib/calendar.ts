/**
 * Valora — Google Calendar Integration Helpers
 * Handles interaction with Google Calendar via Corsair and database synchronization
 */
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";

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
        const title = item.summary || "(No Title)";
        const description = item.description || null;
        const location = item.location || null;

        // Parse start/end dates
        const startStr = item.start?.dateTime ?? item.start?.date;
        const endStr = item.end?.dateTime ?? item.end?.date;
        if (!startStr || !endStr) continue;

        const startTime = new Date(startStr);
        const endTime = new Date(endStr);
        const isAllDay = !item.start?.dateTime;

        // Parse attendees
        const attendees = Array.isArray(item.attendees)
          ? item.attendees.map((a: any) => ({
              email: a.email ?? "",
              name: a.displayName ?? "",
              status: a.responseStatus ?? "needsAction",
            }))
          : [];

        const status = item.status || "confirmed";
        const color = item.colorId || null;
        const recurrence = Array.isArray(item.recurrence) ? item.recurrence.join("\n") : null;
        const videoLink = item.hangoutLink || null;

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
}): Promise<any> {
  const { userId, title, startTime, endTime, description, location, attendees } = params;

  try {
    const formattedAttendees = attendees?.map((email) => ({ email })) ?? [];

    const res = await corsair
      .withTenant(userId)
      .googlecalendar.api.events.create({
        summary: title,
        description,
        location,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: formattedAttendees,
      } as any);

    // Sync the newly created event to local DB
    if (res && res.id) {
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
}): Promise<any> {
  const { userId, googleEventId, title, startTime, endTime, description, location } = params;

  try {
    const patchBody: Record<string, any> = {};
    if (title) patchBody.summary = title;
    if (description !== undefined) patchBody.description = description;
    if (location !== undefined) patchBody.location = location;
    if (startTime) patchBody.start = { dateTime: startTime.toISOString() };
    if (endTime) patchBody.end = { dateTime: endTime.toISOString() };

    const res = await corsair
      .withTenant(userId)
      .googlecalendar.api.events.update({
        id: googleEventId,
        ...patchBody,
      } as any);

    if (res && res.id) {
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
    await corsair
      .withTenant(userId)
      .googlecalendar.api.events.delete({
        id: googleEventId,
      } as any);

    // Delete locally
    await db.calendarEvent.deleteMany({
      where: { googleEventId },
    });
  } catch (err) {
    console.error("[Calendar] Delete event failed:", err);
    throw err;
  }
}
