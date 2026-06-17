import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    CORSAIR_KEK: z.string(),
    CORSAIR_API_KEY: z.string().optional(),
    CORSAIR_WEBHOOK_SECRET: z.string().optional(),
    GROQ_API_KEY: z.string(),
    MEM0_API_KEY: z.string().optional(),
    NGROK_URL: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_CORSAIR_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_ENABLE_AGENT: z.string().optional(),
    NEXT_PUBLIC_ENABLE_WEBHOOKS: z.string().optional(),
    NEXT_PUBLIC_ENABLE_VECTOR_SEARCH: z.string().optional(),
    NEXT_PUBLIC_ENABLE_SECURITY_SHIELD: z.string().optional(),
  },

  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    CORSAIR_KEK: process.env.CORSAIR_KEK,
    CORSAIR_API_KEY: process.env.CORSAIR_API_KEY,
    CORSAIR_WEBHOOK_SECRET: process.env.CORSAIR_WEBHOOK_SECRET,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    MEM0_API_KEY: process.env.MEM0_API_KEY,
    NGROK_URL: process.env.NGROK_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CORSAIR_BASE_URL: process.env.NEXT_PUBLIC_CORSAIR_BASE_URL,
    NEXT_PUBLIC_ENABLE_AGENT: process.env.NEXT_PUBLIC_ENABLE_AGENT,
    NEXT_PUBLIC_ENABLE_WEBHOOKS: process.env.NEXT_PUBLIC_ENABLE_WEBHOOKS,
    NEXT_PUBLIC_ENABLE_VECTOR_SEARCH: process.env.NEXT_PUBLIC_ENABLE_VECTOR_SEARCH,
    NEXT_PUBLIC_ENABLE_SECURITY_SHIELD: process.env.NEXT_PUBLIC_ENABLE_SECURITY_SHIELD,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
