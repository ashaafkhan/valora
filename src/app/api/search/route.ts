import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { vectorSearch } from "@/lib/vectors";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (!query.trim()) {
      return NextResponse.json({ results: [], sources: { vector: 0, keyword: 0 } });
    }

    const q = query.toLowerCase();

    // Run vector + keyword search in parallel
    const [vectorResults, keywordResults] = await Promise.all([
      vectorSearch(query, session.user.id, limit).catch(() => []),
      db.email.findMany({
        where: {
          userId: session.user.id,
          isArchived: false,
          OR: [
            { subject: { contains: q, mode: "insensitive" } },
            { fromEmail: { contains: q, mode: "insensitive" } },
            { fromName: { contains: q, mode: "insensitive" } },
            { bodyPreview: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { receivedAt: "desc" },
        take: limit,
        select: {
          id: true,
          gmailId: true,
          subject: true,
          fromEmail: true,
          fromName: true,
          bodyPreview: true,
          receivedAt: true,
          priorityLabel: true,
        },
      }),
    ]);

    const seen = new Set<string>();
    const merged = [];

    // Vector results first (semantic relevance)
    for (const r of vectorResults) {
      seen.add(r.id);
      merged.push({ ...r, source: "vector", distance: r.distance });
    }

    // Keyword results (deduped)
    for (const r of keywordResults) {
      if (!seen.has(r.id)) {
        merged.push({ ...r, source: "keyword" });
      }
    }

    return NextResponse.json({
      results: merged.slice(0, limit),
      sources: { vector: vectorResults.length, keyword: keywordResults.length },
    });
  } catch (error) {
    console.error("[Search] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
