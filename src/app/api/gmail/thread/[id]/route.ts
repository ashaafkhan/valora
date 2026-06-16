import { NextResponse } from "next/server";

import { handleRouteError, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;

    const thread = await db.emailThread.findUnique({
      where: { id },
      include: {
        emails: {
          where: { userId },
          orderBy: { receivedAt: "asc" },
        },
      },
    });

    if (!thread || thread.emails.length === 0) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json({ thread });
  } catch (error) {
    return handleRouteError(error);
  }
}
