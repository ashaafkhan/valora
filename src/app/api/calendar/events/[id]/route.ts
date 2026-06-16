import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { deleteCalendarEvent, updateCalendarEvent } from "@/lib/calendar";

const patchEventSchema = z.object({
  title: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const input = await parseJson(request, patchEventSchema);
    const result = await updateCalendarEvent({
      userId,
      googleEventId: id,
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;

    await deleteCalendarEvent(userId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
