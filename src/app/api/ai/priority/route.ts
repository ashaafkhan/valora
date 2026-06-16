import { NextResponse } from "next/server";
import { z } from "zod";

import { scoreEmailPriority } from "@/lib/ai";
import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";

const prioritySchema = z.object({
  subject: z.string().min(1),
  fromEmail: z.string().email(),
  fromName: z.string().optional(),
  bodyPreview: z.string().default(""),
  labels: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    await requireUserId();
    const input = await parseJson(request, prioritySchema);
    const priority = await scoreEmailPriority(input);

    return NextResponse.json({ priority });
  } catch (error) {
    return handleRouteError(error);
  }
}
