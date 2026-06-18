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

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://valorahq.in"}/api/corsair/callback`;

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
    const userId = session.user.id;

    // Delete dependent entities and events first to prevent FK constraint violations
    // (if ON DELETE CASCADE is not perfectly configured on the schema)
    await conn.query(
      `DELETE FROM "corsair_events" WHERE account_id IN (
         SELECT id FROM "corsair_accounts" WHERE tenant_id = $1 AND integration_id = (SELECT id FROM "corsair_integrations" WHERE name = $2 LIMIT 1)
       )`,
      [userId, pluginId]
    ).catch(e => console.error("Warning: failed to delete events", e));

    await conn.query(
      `DELETE FROM "corsair_entities" WHERE account_id IN (
         SELECT id FROM "corsair_accounts" WHERE tenant_id = $1 AND integration_id = (SELECT id FROM "corsair_integrations" WHERE name = $2 LIMIT 1)
       )`,
      [userId, pluginId]
    ).catch(e => console.error("Warning: failed to delete entities", e));

    // Then delete the account token
    const res = await conn.query(
      `DELETE FROM "corsair_accounts" WHERE tenant_id = $1 AND integration_id = (SELECT id FROM "corsair_integrations" WHERE name = $2 LIMIT 1)`,
      [userId, pluginId]
    );

    console.log(`[disconnect] deleted ${res.rowCount} rows for tenant ${userId} and plugin ${pluginId}`);
    return { success: true, rowCount: res.rowCount };
  } catch (err) {
    console.error("Failed to disconnect:", err);
    return { success: false, error: "Failed to disconnect" };
  }
}
