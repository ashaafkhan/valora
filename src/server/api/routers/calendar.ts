import { z } from "zod";
import { type Prisma } from "../../../../generated/prisma";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  syncCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  queryCalendarAssistant,
} from "@/lib/calendar";
import { sendGmailEmail } from "@/lib/gmail";
import { corsair } from "@/server/corsair";

export const calendarRouter = createTRPCRouter({
  // ── Get Events ────────────────────────────────────────────────
  getEvents: protectedProcedure
    .input(
      z.object({
        from: z.string().optional(), // ISO date string
        to: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const where: Prisma.CalendarEventWhereInput = {
        userId,
        ...(input.from || input.to ? {
          startTime: {
            ...(input.from ? { gte: new Date(input.from) } : {}),
            ...(input.to ? { lte: new Date(input.to) } : {}),
          }
        } : {})
      };

      return ctx.db.calendarEvent.findMany({
        where,
        orderBy: { startTime: "asc" },
      });
    }),

  // ── Sync from Google Calendar ─────────────────────────────────
  syncEvents: protectedProcedure
    .input(z.object({ maxResults: z.number().optional().default(50) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const result = await syncCalendarEvents(userId, input.maxResults);
      return { success: true, ...result };
    }),

  // ── Create Event ──────────────────────────────────────────────
  createEvent: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        startTime: z.string(), // ISO string
        endTime: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        attendees: z.array(z.string()).optional(), // email addresses
        addMeetLink: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const result = await createCalendarEvent({
        userId,
        title: input.title,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        description: input.description,
        location: input.location,
        attendees: input.attendees,
      });
      return result;
    }),

  // ── Update Event ──────────────────────────────────────────────
  updateEvent: protectedProcedure
    .input(
      z.object({
        googleEventId: z.string(),
        title: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        attendees: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return updateCalendarEvent({
        userId,
        googleEventId: input.googleEventId,
        title: input.title,
        startTime: input.startTime ? new Date(input.startTime) : undefined,
        endTime: input.endTime ? new Date(input.endTime) : undefined,
        description: input.description,
        location: input.location,
        attendees: input.attendees,
      });
    }),

  // ── Delete Event ──────────────────────────────────────────────
  deleteEvent: protectedProcedure
    .input(z.object({ googleEventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await deleteCalendarEvent(userId, input.googleEventId);
      return { success: true };
    }),

  // ── Conflict Detection ─────────────────────────────────────────
  checkConflicts: protectedProcedure
    .input(
      z.object({
        startTime: z.string(),
        endTime: z.string(),
        excludeEventId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const conflicts = await ctx.db.calendarEvent.findMany({
        where: {
          userId,
          NOT: input.excludeEventId
            ? { googleEventId: input.excludeEventId }
            : undefined,
          AND: [
            { startTime: { lt: new Date(input.endTime) } },
            { endTime: { gt: new Date(input.startTime) } },
          ],
        },
      });
      return { hasConflict: conflicts.length > 0, conflicts };
    }),

  // ── Calendar AI Assistant ─────────────────────────────────────────
  queryCalendarAssistant: protectedProcedure
    .input(z.object({ input: z.string(), timezone: z.string().optional(), localTime: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return queryCalendarAssistant(input.input, userId, input.timezone, input.localTime);
    }),

  // ── Send Email Invite to Attendees ────────────────────────────
  sendInviteEmail: protectedProcedure
    .input(
      z.object({
        to: z.string(),
        eventTitle: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        location: z.string().optional(),
        meetLink: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const start = new Date(input.startTime).toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const end = new Date(input.endTime).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const body = `
        <p>You've been invited to: <strong>${input.eventTitle}</strong></p>
        <p><strong>When:</strong> ${start} – ${end}</p>
        ${input.location ? `<p><strong>Where:</strong> ${input.location}</p>` : ""}
        ${input.meetLink ? `<p><strong>Join:</strong> <a href="${input.meetLink}">${input.meetLink}</a></p>` : ""}
        <p style="color:#888;font-size:12px">Sent via Valora — your AI command center.</p>
      `;

      await sendGmailEmail({
        userId,
        to: input.to,
        subject: `Invitation: ${input.eventTitle}`,
        body,
      });
      return { success: true };
    }),

  // ── Set RSVP Status ───────────────────────────────────────────
  setRSVP: protectedProcedure
    .input(
      z.object({
        googleEventId: z.string(),
        status: z.enum(["accepted", "declined", "tentative"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email;
      if (!userEmail) {
        throw new Error("User email not found in session");
      }

      // Fetch the event from local DB to get current attendees
      const event = await ctx.db.calendarEvent.findUnique({
        where: { googleEventId: input.googleEventId },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      interface CalendarAttendee {
        email?: string;
        name?: string;
        status?: string;
      }

      const attendees = (Array.isArray(event.attendees)
        ? event.attendees
        : []) as CalendarAttendee[];

      // Find or add user attendee status
      const userIndex = attendees.findIndex(
        (a) => a.email?.toLowerCase() === userEmail.toLowerCase(),
      );

      const responseStatus = input.status === "tentative" ? "tentative" : input.status;

      const updatedAttendees = [...attendees];
      if (userIndex !== -1) {
        const existing = updatedAttendees[userIndex];
        if (existing) {
          updatedAttendees[userIndex] = {
            ...existing,
            status: responseStatus,
          };
        }
      } else {
        updatedAttendees.push({
          email: userEmail,
          name: ctx.session.user.name ?? undefined,
          status: responseStatus,
        });
      }

      type UpdateParams = Parameters<
        ReturnType<typeof corsair.withTenant>["googlecalendar"]["api"]["events"]["update"]
      >[0];

      // Call Corsair to update attendees on Google Calendar
      await corsair
        .withTenant(userId)
        .googlecalendar.api.events.update({
          id: input.googleEventId,
          event: {
            attendees: updatedAttendees.map((a) => ({
              email: a.email,
              displayName: a.name ?? undefined,
              responseStatus: a.status,
            })),
          },
        } as UpdateParams);

      // Resync calendar events to local DB
      await syncCalendarEvents(userId);

      return { success: true };
    }),
});
