import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { markEmailRead } from "@/lib/gmail";

const readSchema = z.object({
  read: z.boolean().default(true),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const input = await parseJson(request, readSchema);

    await markEmailRead(userId, id, input.read);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
