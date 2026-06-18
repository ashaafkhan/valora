import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        planResetDate: true,
        aiMessagesUsed: true,
        voiceInputUsed: true,
        emailComposeUsed: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Dynamic billing cycle reset
    const now = new Date();
    const cycleStart = new Date(user.planResetDate || now);
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    if (now > cycleEnd) {
      let newStart = new Date(cycleStart);
      // Advance by months until the current date falls within [newStart, newStart + 1 month)
      while (new Date(newStart.getFullYear(), newStart.getMonth() + 1, newStart.getDate()) <= now) {
        newStart.setMonth(newStart.getMonth() + 1);
      }
      
      user = await db.user.update({
        where: { id: user.id },
        data: {
          planResetDate: newStart,
          aiMessagesUsed: 0,
          voiceInputUsed: 0,
          emailComposeUsed: 0,
        },
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          planResetDate: true,
          aiMessagesUsed: true,
          voiceInputUsed: true,
          emailComposeUsed: true,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
