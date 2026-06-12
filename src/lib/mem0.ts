/**
 * Valora — Mem0 Memory Client
 * Persistent agent memory across sessions
 */
import MemoryClient from "mem0ai";
import type { AgentMessage } from "@/types";

// Lazy-init client (Mem0 is optional)
let _client: MemoryClient | null = null;

function getClient(): MemoryClient | null {
  if (!process.env.MEM0_API_KEY) return null;
  _client ??= new MemoryClient({ apiKey: process.env.MEM0_API_KEY });
  return _client;
}

// ── Add Memory ─────────────────────────────────────────────────
export async function addMemory(
  userId: string,
  messages: AgentMessage[],
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const result = await client.add(
      messages.map((m) => ({ role: m.role, content: m.content })),
      { user_id: userId } as Parameters<MemoryClient["add"]>[1],
    );
    return (result as { id?: string })?.id ?? null;
  } catch (err) {
    console.error("[Mem0] addMemory error:", err);
    return null;
  }
}

// ── Search Memory ──────────────────────────────────────────────
export async function searchMemory(
  userId: string,
  query: string,
  limit = 5,
): Promise<string[]> {
  const client = getClient();
  if (!client) return [];

  try {
    const results = await client.search(
      query,
      { filters: { user_id: userId }, limit } as Parameters<MemoryClient["search"]>[1]
    );
    // @ts-expect-error - Mem0 SDK response shape
    return (results as Array<{ memory?: string }>).map(
      (r) => r.memory ?? "",
    ).filter(Boolean);
  } catch (err) {
    console.error("[Mem0] searchMemory error:", err);
    return [];
  }
}

// ── Get All Memories for User ──────────────────────────────────
export async function getUserMemories(userId: string): Promise<string[]> {
  const client = getClient();
  if (!client) return [];

  try {
    const results = await client.getAll({ user_id: userId } as Parameters<MemoryClient["getAll"]>[0]);
    // @ts-expect-error - Mem0 SDK response shape
    return (results as Array<{ memory?: string }>).map(
      (r) => r.memory ?? "",
    ).filter(Boolean);
  } catch (err) {
    console.error("[Mem0] getUserMemories error:", err);
    return [];
  }
}

// ── Build Memory Context String ────────────────────────────────
export async function buildMemoryContext(
  userId: string,
  query: string,
): Promise<string> {
  const memories = await searchMemory(userId, query);
  if (memories.length === 0) return "";

  return `\nRelevant context from past interactions:\n${memories.map((m) => `- ${m}`).join("\n")}\n`;
}

// ── Delete Memory ──────────────────────────────────────────────
export async function deleteMemory(memoryId: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.delete(memoryId);
  } catch (err) {
    console.error("[Mem0] deleteMemory error:", err);
  }
}

export const isMemoryEnabled = (): boolean => Boolean(process.env.MEM0_API_KEY);
