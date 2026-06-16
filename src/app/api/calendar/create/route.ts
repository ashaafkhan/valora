import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { createCalendarEvent } from "@/lib/calendar";

const createEventSchema = z.object({
  title: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  description: z.string().optional(),
  location: z.string().optional(),
  attendees: z.array(z.string().email()).optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseJson(request, createEventSchema);
    const result = await createCalendarEvent({
      userId,
      title: input.title,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      description: input.description,
      location: input.location,
      attendees: input.attendees,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return handleRouteError(error);
  }
}
