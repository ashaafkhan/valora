import { NextResponse } from "next/server";

import { handleRouteError, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

    if (!query) {
      return NextResponse.json({ results: [], source: "corsair-cache" });
    }

    const results = await db.email.findMany({
      where: {
        userId,
        OR: [
          { subject: { contains: query, mode: "insensitive" } },
          { body: { contains: query, mode: "insensitive" } },
          { fromEmail: { contains: query, mode: "insensitive" } },
          { fromName: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { receivedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      results,
      source: "corsair-cache",
      note: "Uses Valora's Corsair-synced local cache for deterministic Gmail search.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
