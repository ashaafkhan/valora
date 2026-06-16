import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { parseNaturalSchedule } from "@/lib/calendar";

const scheduleSchema = z.object({
  input: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const { input } = await parseJson(request, scheduleSchema);
    const schedule = await parseNaturalSchedule(input, userId);

    return NextResponse.json({ schedule });
  } catch (error) {
    return handleRouteError(error);
  }
}
