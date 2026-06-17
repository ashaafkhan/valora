import { type NextRequest, NextResponse } from "next/server";
import { corsair } from "@/server/corsair";
import { processOAuthCallback } from "corsair/oauth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "bad_request", message: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://valorahq.in";

  try {
    const redirectUri = `${appUrl}/api/corsair/callback`;
    console.log("[CALLBACK DEBUG] redirectUri for token exchange =", redirectUri);

    const result = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri,
    });

    console.log("[CALLBACK DEBUG] OAuth callback success, plugin =", result.plugin);

    // Redirect to inbox after successful connection
    return NextResponse.redirect(
      new URL(
        `/inbox?success=true&plugin=${result.plugin}`,
        appUrl
      )
    );
  } catch (error) {
    console.error("Corsair OAuth Callback Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(
      new URL(
        `/inbox?error=${encodeURIComponent(errorMessage)}`,
        appUrl
      )
    );
  }
}
