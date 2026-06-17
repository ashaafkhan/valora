import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { groq } from "@/lib/ai";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Fetch the 50 most recent unarchived emails
    const recentEmails = await db.email.findMany({
      where: { userId, isArchived: false },
      orderBy: { receivedAt: "desc" },
      take: 50,
      select: {
        subject: true,
        fromEmail: true,
        fromName: true,
        bodyPreview: true,
        priorityLabel: true,
        receivedAt: true,
      }
    });

    // Fetch today's calendar events
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const events = await db.calendarEvent.findMany({
      where: {
        userId,
        startTime: { gte: todayStart },
        endTime: { lte: todayEnd }
      },
      orderBy: { startTime: "asc" },
      take: 10
    });

    const meetings = events.map(e => {
      const attendeesArray = Array.isArray(e.attendees) ? e.attendees : [];
      return {
        title: e.title,
        time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(e.startTime),
        attendees: attendeesArray.length
      };
    });

    if (recentEmails.length === 0) {
      return NextResponse.json({
        urgentItems: [],
        highItems: [],
        meetings,
        newsletters: []
      });
    }

    const emailContext = recentEmails.map((e, i) => `[${i+1}] From: ${e.fromName || e.fromEmail} (${e.fromEmail})
Subject: ${e.subject}
Received: ${e.receivedAt.toISOString()}
Preview: ${e.bodyPreview}
Priority: ${e.priorityLabel}
---`).join("\n");

    const systemPrompt = `You are an AI assistant that creates a concise daily digest from the user's recent emails.
Analyze the provided recent emails and categorize them.
You MUST respond with ONLY a valid JSON object matching this schema exactly:
{
  "urgentItems": [{ "from": "Name", "subject": "Short summary" }],
  "highItems": [{ "from": "Name", "subject": "Short summary" }],
  "newsletters": [{ "sender": "Name", "email": "sender@domain.com", "count": 1, "lastSent": "Today" }]
}

Rules:
- urgentItems: Critical items needing immediate action (e.g., invoices, signatures, urgent requests). Max 3 items.
- highItems: Important follow-ups or direct communications from individuals. Max 5 items.
- newsletters: Automated digests, marketing emails, or subscriptions. Aggregate them by sender. Set "count" to the number of times this sender appears in the recent emails. "lastSent" should be "Today", "Yesterday", etc.
- If an array has no items, return an empty array [].
- Do NOT output any markdown blocks, backticks, or text outside the JSON.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here are my recent emails:\n\n${emailContext}` }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content from LLM");

    const parsed = JSON.parse(content);
    
    // Attach meetings to the final output
    parsed.meetings = meetings;

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[Digest Error]:", error);
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 });
  }
}
