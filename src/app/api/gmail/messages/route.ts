import { NextResponse } from "next/server";

import { requireUserId, handleRouteError } from "@/lib/api-route";
import { syncGmailInbox } from "@/lib/gmail";
import { db } from "@/server/db";
import type { Prisma } from "../../../../../generated/prisma";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const label = searchParams.get("label") ?? "inbox";
    const priority = searchParams.get("priority") ?? "all";
    const query = searchParams.get("q")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const cursor = searchParams.get("cursor");

    const where: Prisma.EmailWhereInput = {
      userId,
      isArchived: label === "archive",
    };

    if (label && !["all", "inbox", "archive"].includes(label)) {
      where.labels = { has: label.toUpperCase() };
    }

    if (priority !== "all") {
      where.priorityLabel = priority;
    }

    if (query) {
      where.OR = [
        { subject: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
        { bodyPreview: { contains: query, mode: "insensitive" } },
        { fromEmail: { contains: query, mode: "insensitive" } },
        { fromName: { contains: query, mode: "insensitive" } },
      ];
    }

    const emails = await db.email.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = emails.length > limit;
    const items = hasMore ? emails.slice(0, limit) : emails;

    return NextResponse.json({
      items,
      hasMore,
      nextCursor: hasMore ? items.at(-1)?.id : null,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const maxThreads = Math.min(Number(searchParams.get("maxThreads") ?? 25), 100);
    const result = await syncGmailInbox(userId, maxThreads);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleRouteError(error);
  }
}
