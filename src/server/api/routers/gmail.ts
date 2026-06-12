import { z } from "zod";
import { type Prisma } from "../../../../generated/prisma";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  syncGmailInbox,
  sendGmailEmail,
  archiveEmail,
  starEmail,
  markEmailRead,
} from "@/lib/gmail";
import { generateSmartDraft, extractMeetingFromEmail } from "@/lib/ai";

export const gmailRouter = createTRPCRouter({
  // ── Get All Emails ───────────────────────────────────────────
  getEmails: protectedProcedure
    .input(
      z.object({
        label: z.string().optional(),
        priority: z.string().optional(),
        searchQuery: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { label, priority, searchQuery } = input;
      const userId = ctx.session.user.id;

      const whereClause: Prisma.EmailWhereInput = {
        userId,
        isArchived: label === "archive",
      };

      if (label && label !== "all" && label !== "archive") {
        whereClause.labels = { has: label.toUpperCase() };
      }

      if (priority && priority !== "all") {
        whereClause.priorityLabel = priority;
      }

      if (searchQuery) {
        whereClause.OR = [
          { subject: { contains: searchQuery, mode: "insensitive" } },
          { body: { contains: searchQuery, mode: "insensitive" } },
          { fromEmail: { contains: searchQuery, mode: "insensitive" } },
          { fromName: { contains: searchQuery, mode: "insensitive" } },
        ];
      }

      return ctx.db.email.findMany({
        where: whereClause,
        orderBy: { receivedAt: "desc" },
      });
    }),

  // ── Get Single Thread ─────────────────────────────────────────
  getThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.email.findMany({
        where: {
          userId,
          threadId: input.threadId,
        },
        orderBy: { receivedAt: "asc" },
      });
    }),

  // ── Sync Emails ──────────────────────────────────────────────
  syncInbox: protectedProcedure
    .input(z.object({ maxThreads: z.number().optional().default(20) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const result = await syncGmailInbox(userId, input.maxThreads);
      return { success: true, ...result };
    }),

  // ── Send Email ────────────────────────────────────────────────
  sendEmail: protectedProcedure
    .input(
      z.object({
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        cc: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return sendGmailEmail({
        userId,
        to: input.to,
        subject: input.subject,
        body: input.body,
        cc: input.cc,
      });
    }),

  // ── Archive Email ─────────────────────────────────────────────
  archive: protectedProcedure
    .input(z.object({ gmailId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await archiveEmail(userId, input.gmailId);
      return { success: true };
    }),

  // ── Star/Unstar Email ─────────────────────────────────────────
  star: protectedProcedure
    .input(z.object({ gmailId: z.string(), star: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await starEmail(userId, input.gmailId, input.star);
      return { success: true };
    }),

  // ── Mark Read/Unread ──────────────────────────────────────────
  markRead: protectedProcedure
    .input(z.object({ gmailId: z.string(), read: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await markEmailRead(userId, input.gmailId, input.read);
      return { success: true };
    }),

  // ── AI Smart Draft Assist ─────────────────────────────────────
  generateDraft: protectedProcedure
    .input(
      z.object({
        to: z.string(),
        subject: z.string(),
        context: z.string().optional(),
        tone: z.enum(["professional", "casual", "brief"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const draft = await generateSmartDraft(input);
      return { draft };
    }),

  // ── AI Email-to-Calendar Meeting Details Extraction ───────────
  extractMeeting: protectedProcedure
    .input(z.object({ emailBody: z.string() }))
    .mutation(async ({ input }) => {
      const meeting = await extractMeetingFromEmail(input.emailBody);
      return meeting;
    }),

  // ── Get Recent Contacts (for type-ahead) ─────────────────────
  getRecentContacts: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const recentEmails = await ctx.db.email.findMany({
        where: { userId },
        select: {
          fromEmail: true,
          fromName: true,
          toEmails: true,
        },
        orderBy: { receivedAt: "desc" },
        take: 100,
      });

      const contactsMap = new Map<string, string>();
      for (const email of recentEmails) {
        if (email.fromEmail) {
          contactsMap.set(email.fromEmail.toLowerCase(), email.fromName ?? "");
        }
        for (const to of email.toEmails) {
          if (to && !contactsMap.has(to.toLowerCase())) {
            contactsMap.set(to.toLowerCase(), "");
          }
        }
      }

      return Array.from(contactsMap.entries()).map(([email, name]) => ({
        email,
        name: name || undefined,
      }));
    }),
});
