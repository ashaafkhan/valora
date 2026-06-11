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

  try {
    const redirectUri = `${request.nextUrl.origin}/api/corsair/callback`;
    const result = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri,
    });

    // Redirect to the onboarding page with success status
    return NextResponse.redirect(
      new URL(
        `/onboarding?success=true&plugin=${result.plugin}&tenantId=${result.tenantId}`,
        request.nextUrl.origin
      )
    );
  } catch (error) {
    console.error("Corsair OAuth Callback Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(
      new URL(
        `/onboarding?error=${encodeURIComponent(errorMessage)}`,
        request.nextUrl.origin
      )
    );
  }
}
