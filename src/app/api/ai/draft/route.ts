import { NextResponse } from "next/server";
import { z } from "zod";

import { generateSmartDraft } from "@/lib/ai";
import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";
import { PRICING_LIMITS, PlanType } from "@/lib/pricing";

const draftSchema = z.object({
  to: z.string().min(1),
  subject: z.string().min(1),
  context: z.string().optional(),
  tone: z.enum(["professional", "casual", "brief"]).optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    
    // Fetch user to check limits
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const plan = (user.plan as PlanType) || "free";
    const limits = PRICING_LIMITS[plan];

    if (user.emailComposeUsed >= limits.emailCompose) {
      return NextResponse.json(
        { error: `You have reached your limit of ${limits.emailCompose} email drafts for the ${plan} plan. Please upgrade.` },
        { status: 403 }
      );
    }

    const input = await parseJson(request, draftSchema);
    const draft = await generateSmartDraft(input);

    // Increment usage
    await db.user.update({
      where: { id: userId },
      data: { emailComposeUsed: { increment: 1 } },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    return handleRouteError(error);
  }
}
