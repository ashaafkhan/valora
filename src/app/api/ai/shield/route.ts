import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { scanEmailContent } from "@/lib/security";

const shieldSchema = z.object({
  subject: z.string().default(""),
  body: z.string().default(""),
  fromEmail: z.string().default("unknown@local"),
});

export async function POST(request: Request) {
  try {
    await requireUserId();
    const input = await parseJson(request, shieldSchema);
    const shield = scanEmailContent(input);

    return NextResponse.json({ shield });
  } catch (error) {
    return handleRouteError(error);
  }
}
