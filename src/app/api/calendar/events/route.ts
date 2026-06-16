import { NextResponse } from "next/server";
import type { Prisma } from "../../../../../generated/prisma";

import { handleRouteError, requireUserId } from "@/lib/api-route";
import { syncCalendarEvents } from "@/lib/calendar";
import { db } from "@/server/db";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 250);

    const where: Prisma.CalendarEventWhereInput = {
      userId,
      ...(from || to
        ? {
            startTime: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const events = await db.calendarEvent.findMany({
      where,
      orderBy: { startTime: "asc" },
      take: limit,
    });

    return NextResponse.json({ events });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const maxResults = Math.min(Number(searchParams.get("maxResults") ?? 50), 250);
    const result = await syncCalendarEvents(userId, maxResults);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleRouteError(error);
  }
}
