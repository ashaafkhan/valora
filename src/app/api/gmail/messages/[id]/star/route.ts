import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { starEmail } from "@/lib/gmail";

const starSchema = z.object({
  starred: z.boolean().default(true),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const input = await parseJson(request, starSchema);

    await starEmail(userId, id, input.starred);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
