import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { groq, AI_MODEL } from "@/lib/ai";
import { addMemory } from "@/lib/mem0";
import { executeSendEmail, executeCreateEvent } from "@/lib/agent-tools";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = (await req.json()) as {
      toolCallId: string;
      name: string;
      arguments: Record<string, any>;
      wasApproved: boolean;
    };

    const { toolCallId, name, arguments: toolArgs, wasApproved } = body;

    if (!toolCallId || !name || !toolArgs) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let toolResultText: string;
    let success = false;

    // 1. If not approved, record the cancellation
    if (!wasApproved) {
      toolResultText = `User cancelled action: ${name}`;
    } else {
      // 2. Execute the corresponding tool
      if (name === "send_email") {
        const to = String(toolArgs.to ?? "");
        const subject = String(toolArgs.subject ?? "");
        const bodyText = String(toolArgs.body ?? "");

        const res = await executeSendEmail({ userId, to, subject, body: bodyText });
        success = res.success;
        toolResultText = res.success 
          ? `Email successfully sent to ${to}` 
          : `Error: ${res.error ?? "Failed to send email"}`;
      } else if (name === "create_event") {
        const title = String(toolArgs.title ?? "");
        const startISO = String(toolArgs.startISO ?? "");
        const endISO = String(toolArgs.endISO ?? "");
        const attendees = Array.isArray(toolArgs.attendees) ? toolArgs.attendees.map(String) : undefined;
        const description = toolArgs.description ? String(toolArgs.description) : undefined;

        const res = await executeCreateEvent({
          userId,
          title,
          startISO,
          endISO,
          attendees,
          description,
        });
        success = res.success;
        toolResultText = res.success 
          ? `Calendar event successfully created: ${title}` 
          : `Error: ${res.error ?? "Failed to create calendar event"}`;
      } else {
        return NextResponse.json({ error: `Unsupported tool: ${name}` }, { status: 400 });
      }
    }

    // 3. Re-query the database chat history to rebuild conversation context
    const dbHistory = await db.agentChat.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 15,
    });

    const messages: Message[] = dbHistory.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    }));

    const systemPrompt = `You are Valora, a premium AI executive assistant for Gmail and Google Calendar.
A tool call was executed and returned the result below. Complete the response to the user with a brief, professional confirmation message.
If the user cancelled the action, acknowledge it.
Keep it direct. Never expose password/OTP details.`;

    // 4. Call Groq to generate confirmation text
    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        {
          role: "assistant",
          content: "",
          tool_calls: [
            {
              id: toolCallId,
              type: "function",
              function: {
                name,
                arguments: JSON.stringify(toolArgs),
              },
            },
          ],
        },
        {
          role: "tool",
          tool_call_id: toolCallId,
          content: JSON.stringify({ result: toolResultText }),
        },
      ],
      temperature: 0.3,
    });

    const choice = completion.choices[0];
    const finalText = choice?.message?.content ?? `Action complete: ${toolResultText}`;

    // 5. Save final textual message to database
    await db.agentChat.create({
      data: {
        userId,
        role: "assistant",
        content: finalText,
      },
    });

    // Background update to Mem0
    addMemory(userId, [
      { role: "assistant", content: finalText },
    ]).catch((e) => console.error("Mem0 action save failed:", e));

    return NextResponse.json({
      success,
      message: finalText,
    });
  } catch (error) {
    console.error("[Agent action route error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
