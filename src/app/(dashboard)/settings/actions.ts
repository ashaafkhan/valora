"use server";

import { auth } from "@/server/auth";
import { corsair } from "@/server/corsair";
import { generateOAuthUrl } from "corsair/oauth";
import { headers } from "next/headers";
import { conn } from "@/server/db";

/**
 * Generate OAuth URL for an integration
 */
export async function getIntegrationOAuthUrl(pluginId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/corsair/callback`;

  const result = await generateOAuthUrl(corsair, pluginId, {
    tenantId: session.user.id,
    redirectUri,
  });

  return result.url;
}

/**
 * Disconnect an integration by deleting its records from the Corsair database tables.
 */
export async function disconnectIntegration(pluginId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    // Corsair doesn't expose a direct manage.disconnect API, so we manually remove
    // the connection from the underlying tables managed by the pg pool.
    await conn.query(
      `DELETE FROM "corsair_accounts" WHERE tenant_id = $1 AND integration_id = (SELECT id FROM "corsair_integrations" WHERE name = $2 LIMIT 1)`,
      [session.user.id, pluginId]
    );
    
    return { success: true };
  } catch (err) {
    console.error("Failed to disconnect:", err);
    // Fallback: if table names differ in this version of Corsair, 
    // it's safest to instruct the user to revoke from Google.
    return { success: false, error: "Failed to disconnect" };
  }
}
