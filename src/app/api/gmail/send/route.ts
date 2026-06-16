import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { sendGmailEmail } from "@/lib/gmail";

const sendSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  cc: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseJson(request, sendSchema);
    const to = Array.isArray(input.to) ? input.to.join(", ") : input.to;

    const result = await sendGmailEmail({
      userId,
      to,
      cc: input.cc,
      subject: input.subject,
      body: input.body,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return handleRouteError(error);
  }
}
