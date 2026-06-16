/**
 * @file api-route.ts
 * @description Small helpers for authenticated App Router API endpoints.
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/server/auth";

export class ApiRouteError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
  ) {
    super(message);
  }
}

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new ApiRouteError("Unauthorized", 401);
  }

  return userId;
}

export async function parseJson<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new ApiRouteError("Invalid JSON body", 400);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return invalidInput(parsed.error);
  }

  return parsed.data;
}

export function invalidInput(error: z.ZodError): never {
  const message = error.issues
    .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
    .join("; ");

  throw new ApiRouteError(message || "Invalid input", 400);
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof ApiRouteError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: "Invalid input", issues: error.issues }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;

  return NextResponse.json({ error: message }, { status });
}
