import { processWebhook } from "corsair";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";

export async function POST(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const contentType = request.headers.get("content-type");
  let body: string | Record<string, unknown>;
  if (contentType?.includes("application/json")) {
    body = (await request.json()) as Record<string, unknown>;
  } else {
    const text = await request.text();
    body = text?.trim() ? text : {};
  }

  const searchParams = request.nextUrl.searchParams;
  const tenantId =
    searchParams.get("tenantId") ??
    searchParams.get("tenant_id") ??
    "cmqa1hx0s0000usokz4i5dk5t"; // Fallback to our active user tenant ID if not provided

  try {
    const result = await processWebhook(corsair, headers, body, { tenantId });
    console.info("Plugin Processed:", result.plugin, result.action);

    // Build response headers (e.g. Asana X-Hook-Secret handshake)
    // Cast to custom interface to avoid typescript-eslint 'any' warnings
    const resultWithHeaders = result as unknown as {
      responseHeaders?: Record<string, string | number | boolean>;
      response?: {
        responseHeaders?: Record<string, string | number | boolean>;
      };
    };
    const responseHeaders = resultWithHeaders.responseHeaders ?? resultWithHeaders.response?.responseHeaders;
    const nextHeaders = new Headers();
    if (responseHeaders) {
      for (const [key, value] of Object.entries(responseHeaders)) {
        nextHeaders.set(key, String(value));
      }
    }

    // Handle case where no webhook matched
    if (!result.response) {
      return NextResponse.json(
        {
          success: false,
          message: "No matching webhook handler found",
        },
        { status: 404 }
      );
    }

    if (result.response !== undefined) {
      return NextResponse.json(result.response, { headers: nextHeaders });
    }

    // Webhook processed successfully, but no data to return to sender
    return new NextResponse(null, { status: 200, headers: nextHeaders });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during webhook processing",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
