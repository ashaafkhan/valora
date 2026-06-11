// src/server/db.ts
// Exports both Prisma client (for app tables) and raw pg Pool (for Corsair)
import { env } from "@/env";
import { PrismaClient } from "../../generated/prisma";
import { Pool } from "pg";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Raw pg Pool — used by Corsair for its internal tables (corsair_*)
export const conn = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon SSL
});
