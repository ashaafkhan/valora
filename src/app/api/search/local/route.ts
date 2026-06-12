import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
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
      return NextResponse.json({ results: [] });
    }

    const results = await vectorSearch(query, session.user.id, limit);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[Search Local] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
