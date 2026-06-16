import { NextResponse } from "next/server";

import { handleRouteError, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";

const SYSTEM_LABELS = ["INBOX", "STARRED", "IMPORTANT", "SENT", "DRAFT", "TRASH", "SPAM"];

export async function GET() {
  try {
    const userId = await requireUserId();
    const emails = await db.email.findMany({
      where: { userId },
      select: {
        labels: true,
        isArchived: true,
        priorityLabel: true,
        isSensitive: true,
      },
    });

    const counts = new Map<string, number>();
    for (const email of emails) {
      counts.set(email.isArchived ? "ARCHIVE" : "INBOX", (counts.get(email.isArchived ? "ARCHIVE" : "INBOX") ?? 0) + 1);
      counts.set(`PRIORITY_${email.priorityLabel.toUpperCase()}`, (counts.get(`PRIORITY_${email.priorityLabel.toUpperCase()}`) ?? 0) + 1);
      if (email.isSensitive) counts.set("SENSITIVE", (counts.get("SENSITIVE") ?? 0) + 1);
      for (const label of email.labels) {
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }

    const labels = Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        system: SYSTEM_LABELS.includes(name) || name.startsWith("PRIORITY_") || name === "SENSITIVE",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ labels });
  } catch (error) {
    return handleRouteError(error);
  }
}
