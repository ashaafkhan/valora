// src/server/corsair.ts
// Matches the Corsair quickstart setup exactly
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
