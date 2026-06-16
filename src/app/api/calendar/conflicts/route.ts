import { NextResponse } from "next/server";

import { handleRouteError, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("startTime");
    const end = searchParams.get("endTime");
    const excludeEventId = searchParams.get("excludeEventId") ?? undefined;

    if (!start || !end) {
      return NextResponse.json({ error: "startTime and endTime are required" }, { status: 400 });
    }

    const conflicts = await db.calendarEvent.findMany({
      where: {
        userId,
        ...(excludeEventId ? { NOT: { googleEventId: excludeEventId } } : {}),
        AND: [
          { startTime: { lt: new Date(end) } },
          { endTime: { gt: new Date(start) } },
        ],
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({
      hasConflict: conflicts.length > 0,
      conflicts,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
