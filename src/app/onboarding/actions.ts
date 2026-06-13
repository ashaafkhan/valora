"use server";

import { redirect } from "next/navigation";
import { corsair } from "@/server/corsair";
import { generateOAuthUrl } from "corsair/oauth";
import { db } from "@/server/db";

export async function getOAuthUrl(pluginId: string, userId: string) {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/corsair/callback`;
  const result = await generateOAuthUrl(corsair, pluginId, {
    tenantId: userId,
    redirectUri,
  });
  return result.url;
}

export async function connectGmail(formData: FormData) {
  const userId = formData.get("userId") as string;
  const url = await getOAuthUrl("gmail", userId);
  redirect(url);
}

export async function connectCalendar(formData: FormData) {
  const userId = formData.get("userId") as string;
  const url = await getOAuthUrl("googlecalendar", userId);
  redirect(url);
}

export async function completeOnboarding(userId: string, formData: FormData) {
  const enableAI = formData.get("enableAI") === "true";
  const enableShield = formData.get("enableShield") === "true";
  const enableShortcuts = formData.get("enableShortcuts") === "true";

  await db.user.update({
    where: { id: userId },
    data: {
      onboardingDone: true,
      preferences: {
        enableAI,
        enableShield,
        enableShortcuts,
      },
    },
  });

  redirect("/inbox");
}
