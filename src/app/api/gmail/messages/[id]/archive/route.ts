import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { archiveEmail, unarchiveEmail } from "@/lib/gmail";

const archiveSchema = z.object({
  archived: z.boolean().default(true),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const input = await parseJson(request, archiveSchema);

    if (input.archived) {
      await archiveEmail(userId, id);
    } else {
      await unarchiveEmail(userId, id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
