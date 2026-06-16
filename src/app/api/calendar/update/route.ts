import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { updateCalendarEvent } from "@/lib/calendar";

const updateEventSchema = z.object({
  googleEventId: z.string().min(1),
  title: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseJson(request, updateEventSchema);
    const result = await updateCalendarEvent({
      userId,
      googleEventId: input.googleEventId,
      title: input.title,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
      description: input.description,
      location: input.location,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return handleRouteError(error);
  }
}
