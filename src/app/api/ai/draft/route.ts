import { NextResponse } from "next/server";
import { z } from "zod";

import { generateSmartDraft } from "@/lib/ai";
import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";

const draftSchema = z.object({
  to: z.string().min(1),
  subject: z.string().min(1),
  context: z.string().optional(),
  tone: z.enum(["professional", "casual", "brief"]).optional(),
});

export async function POST(request: Request) {
  try {
    await requireUserId();
    const input = await parseJson(request, draftSchema);
    const draft = await generateSmartDraft(input);

    return NextResponse.json({ draft });
  } catch (error) {
    return handleRouteError(error);
  }
}
