/**
 * @file api-handler.ts
 * @description Centralized error handling wrapper for Next.js API routes
 *
 * WHY: Every API route needs consistent error handling. Instead of duplicating
 * try/catch with different status codes across routes, this wrapper provides
 * a single place to handle auth errors, rate limits, and internal errors.
 *
 * ARCHITECTURE NOTE: Only wraps plain Next.js route handlers (agent, webhooks,
 * search). tRPC routes have their own error handling via the tRPC router.
 */
import { NextResponse } from "next/server";

type RouteHandler = (req: Request, ...args: unknown[]) => Promise<Response>;

/**
 * Wraps API route handlers with consistent error handling.
 * Catches known error types and returns appropriate status codes.
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req: Request, ...args: unknown[]) => {
    try {
      return await handler(req, ...args);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Internal server error";

      if (message.includes("Unauthorized") || message.includes("unauthorized")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (err instanceof Response) {
        return NextResponse.json({ error: "Upstream API error" }, { status: err.status });
      }

      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
