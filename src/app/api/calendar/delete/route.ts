import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { deleteCalendarEvent } from "@/lib/calendar";

const deleteEventSchema = z.object({
  googleEventId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseJson(request, deleteEventSchema);

    await deleteCalendarEvent(userId, input.googleEventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
