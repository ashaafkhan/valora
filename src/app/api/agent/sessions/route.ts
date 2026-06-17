import { NextResponse } from "next/server";
import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";
import { z } from "zod";

const createSessionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

const updateSessionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    const sessions = await db.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Format output with message count and preview
    const result = sessions.map((s) => {
      const lastMsg = s.messages[0];
      return {
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        lastMessagePreview: lastMsg ? lastMsg.content : "No messages yet",
      };
    });

    return NextResponse.json({ sessions: result });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseJson(request, createSessionSchema);
    const title = input.title ?? "New Chat";

    const session = await db.chatSession.create({
      data: {
        userId,
        title,
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseJson(request, updateSessionSchema);

    // Verify session belongs to user
    const existing = await db.chatSession.findFirst({
      where: { id: input.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = await db.chatSession.update({
      where: { id: input.id },
      data: { title: input.title },
    });

    return NextResponse.json({ session });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete associated messages first
    await db.agentChat.deleteMany({
      where: { sessionId },
    });

    // Delete the session itself
    await db.chatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
