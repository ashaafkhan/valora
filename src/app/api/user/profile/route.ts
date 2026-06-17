import { NextResponse } from "next/server";
import { handleRouteError, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";

export async function GET() {
  try {
    const userId = await requireUserId();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        planResetDate: true,
        aiMessagesUsed: true,
        voiceInputUsed: true,
        emailComposeUsed: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
