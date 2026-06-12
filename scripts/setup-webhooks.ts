/**
 * Valora — Webhook Registration Script (Stage 6)
 * Run once to register Corsair webhooks for Gmail and Calendar.
 * Usage: npx tsx scripts/setup-webhooks.ts
 *        (or npm run setup:webhooks if script is added to package.json)
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv needed)
function loadEnv(envPath: string) {
  try {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env not found — continue with existing environment
  }
}

loadEnv(path.resolve(__dirname, "../.env"));
loadEnv(path.resolve(__dirname, "../.env.local"));

const CORSAIR_BASE =
  process.env.NEXT_PUBLIC_CORSAIR_BASE_URL ?? "https://api.corsair.dev";
const CORSAIR_API_KEY = process.env.CORSAIR_API_KEY;
const BASE_URL =
  process.env.NGROK_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

if (!CORSAIR_API_KEY) {
  console.error("❌  CORSAIR_API_KEY is not set in .env");
  process.exit(1);
}

async function corsairRequest(path: string, body: unknown) {
  const res = await fetch(`${CORSAIR_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CORSAIR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Corsair API ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function registerWebhooks() {
  console.log("🔗 Registering Corsair webhooks...");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Corsair:  ${CORSAIR_BASE}\n`);

  // ── Gmail Webhook ────────────────────────────────────────────
  try {
    const gmailUrl = `${BASE_URL}/api/webhooks/gmail`;
    await corsairRequest("/webhooks/register", {
      integration: "gmail",
      url: gmailUrl,
      events: ["message.created", "message.updated"],
    });
    console.log(`✅  Gmail webhook registered → ${gmailUrl}`);
  } catch (err) {
    console.error("❌  Gmail webhook registration failed:", err);
  }

  // ── Calendar Webhook ─────────────────────────────────────────
  try {
    const calendarUrl = `${BASE_URL}/api/webhooks/calendar`;
    await corsairRequest("/webhooks/register", {
      integration: "calendar",
      url: calendarUrl,
      events: ["event.created", "event.updated", "event.deleted"],
    });
    console.log(`✅  Calendar webhook registered → ${calendarUrl}`);
  } catch (err) {
    console.error("❌  Calendar webhook registration failed:", err);
  }

  console.log("\n✨  Done. Update NGROK_URL in .env if your tunnel changes.");
}

registerWebhooks().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
