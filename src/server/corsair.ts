/**
 * @file corsair.ts
 * @description Central Corsair API client for Valora — all Gmail & Calendar operations go through here
 *
 * WHY: Corsair acts as middleware between Valora and Google APIs. It handles OAuth token
 * management, rate limiting, caching, and webhook registration. All Gmail and Calendar
 * operations MUST go through Corsair, never directly through Google APIs.
 *
 * ARCHITECTURE NOTE: We use a single authenticated client rather than per-user clients
 * because Corsair handles user authentication at the integration level. The CORSAIR_API_KEY
 * identifies our app; user-level access is granted through the onboarding OAuth flow.
 *
 * OPTIMIZATION: Corsair caches email data locally, which enables our vector search feature.
 * By storing embeddings in our Postgres DB and combining with Corsair's cache,
 * we achieve sub-200ms search latency.
 */
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { conn } from "./db";

export const corsair = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: conn,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
  connect: {
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/corsair/callback`,
    baseUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/connect`,
  },
});
