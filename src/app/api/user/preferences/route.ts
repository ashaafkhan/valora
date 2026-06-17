import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";

const preferencesSchema = z
  .object({
    enableAIPriority: z.boolean().optional(),
    enableSecurityShield: z.boolean().optional(),
    enableKeyboardShortcuts: z.boolean().optional(),
    defaultCalendarView: z.enum(["day", "week", "month"]).optional(),
    emailsPerPage: z.number().int().min(10).max(100).optional(),
    notificationsEnabled: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
  })
  .partial();

export async function GET() {
  try {
    const userId = await requireUserId();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { preferences: true, theme: true, onboardingDone: true },
    });

    return NextResponse.json({
      preferences: user?.preferences ?? {},
      theme: user?.theme ?? "light",
      onboardingDone: user?.onboardingDone ?? false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseJson(request, preferencesSchema);
    const current = await db.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const { theme, ...prefInput } = input;

    const preferences = {
      ...((current?.preferences as Record<string, unknown> | null) ?? {}),
      ...prefInput,
    };

    const updateData: any = { preferences };
    if (theme) {
      updateData.theme = theme;
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { preferences: true, theme: true },
    });

    return NextResponse.json({ preferences: user.preferences, theme: user.theme });
  } catch (error) {
    return handleRouteError(error);
  }
}
