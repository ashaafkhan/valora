import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { corsair } from "@/server/corsair";
import { generateOAuthUrl } from "corsair/oauth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  const searchParams = req.nextUrl.searchParams;
  const pluginId = searchParams.get("plugin") || "gmail";
  
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://valorahq.in"}/api/corsair/callback`;

  const result = await generateOAuthUrl(corsair, pluginId, {
    tenantId: session.user.id,
    redirectUri,
  });

  return NextResponse.redirect(result.url);
}
