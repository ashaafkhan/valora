import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const memories = await db.agentMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      memories: memories.map((m) => ({
        id: m.id,
        content: m.content,
        category: m.category,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[Memory GET error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 });
    }

    const memory = await db.agentMemory.findUnique({
      where: { id: memoryId },
    });

    if (!memory || memory.userId !== session.user.id) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    await db.agentMemory.delete({ where: { id: memoryId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Memory DELETE error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
