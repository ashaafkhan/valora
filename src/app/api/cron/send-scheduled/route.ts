import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sendGmailEmail } from "@/lib/gmail";

export const maxDuration = 60; // Max execution time

export async function GET(request: Request) {
  try {
    // Basic security: check for a cron secret (if set in env)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find pending scheduled emails that are due
    const pendingEmails = await db.scheduledEmail.findMany({
      where: {
        status: "pending",
        scheduledAt: {
          lte: new Date(),
        },
      },
      take: 20, // process in batches of 20
    });

    if (pendingEmails.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    let processed = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      try {
        // Send email via Gmail API
        await sendGmailEmail({
          userId: email.userId,
          to: email.to,
          subject: email.subject,
          body: email.body,
          cc: email.cc.length > 0 ? email.cc : undefined,
        });

        // Mark as sent
        await db.scheduledEmail.update({
          where: { id: email.id },
          data: { status: "sent" },
        });

        processed++;
      } catch (err) {
        console.error(`Failed to send scheduled email ${email.id}:`, err);
        
        // Mark as failed
        await db.scheduledEmail.update({
          where: { id: email.id },
          data: { status: "failed" },
        });
        
        failed++;
      }
    }

    return NextResponse.json({ success: true, processed, failed });
  } catch (error) {
    console.error("Scheduled email cron failed:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
