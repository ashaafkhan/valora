/**
 * Valora — Vector Search Engine
 * Generates embeddings via Groq and runs pgvector similarity search
 */
import { db } from "@/server/db";

const GROQ_BASE = "https://api.groq.com/openai/v1";
const EMBEDDING_MODEL = "nomic-embed-text-v1.5";
const EMBEDDING_DIMENSIONS = 768;

async function embedText(text: string): Promise<number[]> {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is required for vector embeddings");
  }

  const res = await fetch(`${GROQ_BASE}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000),
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq embedding error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return data.data[0]!.embedding;
}

export async function generateEmailEmbedding(
  emailId: string,
  content: string,
): Promise<void> {
  try {
    const embedding = await embedText(
      JSON.stringify({
        subject: content.slice(0, 500),
        body: content.slice(0, 2000),
      }),
    );

    await db.$executeRawUnsafe(
      `UPDATE "Email" SET embedding = $1::vector WHERE id = $2`,
      `[${embedding.join(",")}]`,
      emailId,
    );
  } catch (err) {
    console.error("[Vector] Embedding generation failed:", err);
  }
}

export async function vectorSearch(
  query: string,
  userId: string,
  limit = 20,
): Promise<Array<{
  id: string;
  gmailId: string;
  subject: string;
  fromEmail: string;
  fromName: string | null;
  bodyPreview: string;
  receivedAt: Date;
  priorityLabel: string;
  distance: number;
}>> {
  try {
    const queryEmbedding = await embedText(query);

    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    const results = await db.$queryRawUnsafe<
      Array<{
        id: string;
        gmailId: string;
        subject: string;
        fromEmail: string;
        fromName: string | null;
        bodyPreview: string;
        receivedAt: Date;
        priorityLabel: string;
        distance: number;
      }>
    >(
      `SELECT id, "gmailId", subject, "fromEmail", "fromName", "bodyPreview", "receivedAt", "priorityLabel", embedding <=> $1::vector AS distance
       FROM "Email"
       WHERE "userId" = $2 AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      embeddingStr,
      userId,
      limit,
    );

    return results;
  } catch (err) {
    console.error("[Vector] Search failed:", err);
    return [];
  }
}
