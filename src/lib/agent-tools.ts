/**
 * Valora — Agent Tools
 * Implementations of secure execution actions for the AI agent
 */
import { sendGmailEmail } from "./gmail";
import { createCalendarEvent } from "./calendar";
import { scanEmailContent } from "./security";
import { db } from "@/server/db";

export interface ToolExecutionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export async function executeSendEmail(params: {
  userId: string;
  to: string;
  subject: string;
  body: string;
}): Promise<ToolExecutionResult> {
  const { userId, to, subject, body } = params;

  // Security Shield check
  const scanResult = scanEmailContent({
    subject,
    body,
    fromEmail: "self@valora.ai", // Outgoing check
  });

  if (scanResult.isSensitive) {
    return {
      success: false,
      error: "Email contains sensitive data. Sending blocked by Security Shield.",
    };
  }

  try {
    await sendGmailEmail({
      userId,
      to,
      subject,
      body,
    });
    return {
      success: true,
      message: `Email sent to ${to}`,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to send email: ${errMsg}`,
    };
  }
}

export async function executeSearchEmails(params: {
  userId: string;
  query: string;
}): Promise<ToolExecutionResult> {
  const { userId, query } = params;

  try {
    const emails = await db.email.findMany({
      where: {
        userId,
        OR: [
          { subject: { contains: query, mode: "insensitive" } },
          { body: { contains: query, mode: "insensitive" } },
          { fromEmail: { contains: query, mode: "insensitive" } },
          { fromName: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { receivedAt: "desc" },
    });

    return {
      success: true,
      data: emails.map((e) => ({
        id: e.id,
        subject: e.subject,
        fromEmail: e.fromEmail,
        fromName: e.fromName,
        bodyPreview: e.bodyPreview,
        receivedAt: e.receivedAt.toISOString(),
      })),
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to search emails: ${errMsg}`,
    };
  }
}

export async function executeCreateEvent(params: {
  userId: string;
  title: string;
  startISO: string;
  endISO: string;
  attendees?: string[];
  description?: string;
}): Promise<ToolExecutionResult> {
  const { userId, title, startISO, endISO, attendees, description } = params;

  try {
    const res = await createCalendarEvent({
      userId,
      title,
      startTime: new Date(startISO),
      endTime: new Date(endISO),
      attendees,
      description,
    });

    return {
      success: true,
      message: `Event '${title}' successfully created.`,
      data: res,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to create calendar event: ${errMsg}`,
    };
  }
}

export async function executeGetSchedule(params: {
  userId: string;
  days?: number;
}): Promise<ToolExecutionResult> {
  const { userId, days } = params;
  const daysLimit = days ?? 7;

  try {
    const start = new Date();
    const end = new Date(Date.now() + daysLimit * 24 * 60 * 60 * 1000);

    const events = await db.calendarEvent.findMany({
      where: {
        userId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startTime: "asc" },
      take: 20,
    });

    return {
      success: true,
      data: events.map((e) => ({
        id: e.id,
        title: e.title,
        startTime: e.startTime.toISOString(),
        endTime: e.endTime.toISOString(),
        location: e.location,
        description: e.description,
      })),
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to retrieve schedule: ${errMsg}`,
    };
  }
}
