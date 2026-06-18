import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { groq, AI_MODEL, chatCompletionWithOrchestration } from "@/lib/ai";
import { searchMemory, addMemory } from "@/lib/mem0";
import { executeSearchEmails, executeGetSchedule } from "@/lib/agent-tools";

import { PRICING_LIMITS, type PlanType } from "@/lib/pricing";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      // If no session ID is provided, return empty history
      return NextResponse.json({ history: [] });
    }

    const history = await db.agentChat.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[Agent GET route error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    
    // Fetch user to check limits
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const plan = (user.plan as PlanType) || "free";
    const limits = PRICING_LIMITS[plan];

    if (user.aiMessagesUsed >= limits.aiMessages) {
      return NextResponse.json(
        { error: `You have reached your limit of ${limits.aiMessages} AI messages for the ${plan} plan. Please upgrade.` },
        { status: 403 }
      );
    }

    const body = (await req.json()) as { message: string; sessionId?: string; timezone?: string; localTime?: string };
    const { message, sessionId, timezone, localTime } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch user memory context from database
    const localMemories = await db.agentMemory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const memoryContext = localMemories.length > 0 
      ? localMemories.map((m) => `- ${m.content}`).join("\n")
      : "No past context recorded yet.";

    // 2. Fetch past 15 chat messages from DB for this session
    const dbHistory = await db.agentChat.findMany({
      where: sessionId ? { userId, sessionId } : { userId },
      orderBy: { createdAt: "asc" },
      take: 15,
    });

    const messages: Message[] = dbHistory.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    }));

    // Add current user message
    messages.push({ role: "user", content: message });

    // 3. Define Tools
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "send_email",
          description: "Send an email via Gmail. Requires user confirmation.",
          parameters: {
            type: "object",
            properties: {
              to: { type: "string", description: "Recipient email address" },
              subject: { type: "string", description: "Subject line of the email" },
              body: { type: "string", description: "Body content of the email" },
            },
            required: ["to", "subject", "body"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "search_emails",
          description: "Search user's local emails for keywords or sender info.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "The search query (keyword, name, or email)" },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "create_event",
          description: "Create a new Google Calendar event. Requires user confirmation.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the calendar event" },
              startISO: { type: "string", description: "Start date/time in ISO 8601 format" },
              endISO: { type: "string", description: "End date/time in ISO 8601 format" },
              attendees: {
                type: "array",
                items: { type: "string" },
                description: "Optional array of email addresses of attendees",
              },
              description: { type: "string", description: "Optional description/notes" },
            },
            required: ["title", "startISO", "endISO"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "get_schedule",
          description: "Get upcoming calendar events for the next N days.",
          parameters: {
            type: "object",
            properties: {
              days: { type: "number", description: "Number of days to search (default 7)" },
            },
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "store_memory",
          description: "Store a specific preference or fact about the user in long-term memory.",
          parameters: {
            type: "object",
            properties: {
              content: { type: "string", description: "The fact or preference to remember (e.g. 'User likes apples', 'User's boss is Sarah')" },
              category: { type: "string", description: "Optional category (e.g. 'preference', 'contact', 'general')" }
            },
            required: ["content"],
          },
        },
      },
    ];

    const systemPrompt = `You are Zara AI, a premium AI executive assistant for Gmail and Google Calendar.
You help busy professionals manage their inbox, compose emails, and organize their schedules.

You have access to tools to help the user. Use 'store_memory' if the user explicitly asks you to remember something or states a preference.
1. ACTION BIAS: When the user asks you to send an email or create an event, IMMEDIATELY call the corresponding tool (e.g., 'send_email'). DO NOT ask for conversational confirmation. The tool call itself generates an editable UI confirmation card for the user. If information is missing, invent reasonable placeholders or draft content based on the context, and call the tool anyway so the user can review it in the UI.
2. FORMATTING: Use plain natural language. Do NOT use markdown formatting (like **bold**, *italics*, or bullet points). Keep the response conversational and highly readable as raw text.
3. ANTI-HALLUCINATION & MEMORY USE: Treat the 'User Preferences/Context' below ONLY as background context (e.g., preferred tone, default email addresses, names). NEVER invent past emails, meetings, or facts that aren't explicitly provided in the current conversation. ALWAYS prioritize the user's immediate request over past memory. If a detail is missing, ask for it or use a placeholder, do not guess based on memory unless it's a stated preference.
4. NEVER expose sensitive information (e.g. passwords, OTPs, full bank details).
5. Be concise and professional — users are busy.
6. SCOPE GUARDRAIL: You are strictly an executive assistant. Your ONLY capabilities are managing emails and calendar events, and remembering user preferences. If the user asks about ANYTHING outside this scope (e.g., general knowledge, coding, math, writing essays, or unrelated advice), you MUST politely decline. Briefly explain that you are specialized in inbox and calendar management to keep their workflow optimized.
6. CURRENT TIME & TIMEZONE:
   - User's Timezone: ${timezone || 'UTC'}
   - User's Local Time: ${localTime || new Date().toISOString()}
   - CRITICAL: When generating startISO and endISO for the create_event tool, you MUST include the correct timezone offset in the ISO string (e.g., "2026-06-18T18:00:00+05:30") so the time is correct in the user's local timezone. Do NOT use "Z" (UTC) unless you have mathematically converted the local time to UTC.

User Preferences/Context:
${memoryContext}`;

    // 4. Call Groq with Retry/Fallback
    const completion: any = await chatCompletionWithOrchestration({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      tools,
      tool_choice: "auto",
      temperature: 0.5,
    });

    let choice = completion?.choices[0];
    if (!choice) {
      return NextResponse.json({ error: "No response from AI agent" }, { status: 500 });
    }

    const aiMessage = choice.message;
    const toolCalls = aiMessage.tool_calls;

    // Check if the model wants to call tools
    if (toolCalls && toolCalls.length > 0) {
      const writeToolCalls = toolCalls.filter((tc: any) => tc.function.name === "send_email" || tc.function.name === "create_event");

      if (writeToolCalls.length > 0) {
        // Create user message in DB first
        await db.agentChat.create({
          data: { userId, role: "user", content: message, sessionId },
        });

        const formattedToolCalls = [];

        // Save each assistant's tool request in DB
        for (const tc of writeToolCalls) {
          let toolArgs: Record<string, any> = {};
          try {
            toolArgs = JSON.parse(tc.function.arguments) as Record<string, unknown>;
          } catch (err) {
            console.error("[Agent] Failed to parse tool arguments:", tc.function.arguments, err);
          }

          await db.agentChat.create({
            data: {
              userId,
              role: "assistant",
              content: "",
              sessionId,
              toolCall: {
                id: tc.id,
                name: tc.function.name,
                arguments: toolArgs,
                status: "pending",
              },
            },
          });

          formattedToolCalls.push({
            id: tc.id,
            name: tc.function.name,
            arguments: toolArgs,
          });
        }

        // Update session timestamp
        if (sessionId) {
          await db.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
          });
        }

        return NextResponse.json({
          type: "action_required",
          toolCalls: formattedToolCalls,
        });
      }

      // B. Read-only tools (search_emails, get_schedule, store_memory) -> Execute immediately and continue the chain
      const toolCall = toolCalls[0]!;
      const toolName = toolCall.function.name;
      let toolArgs: Record<string, any> = {};
      try {
        toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      } catch (err) {
        console.error("[Agent] Failed to parse tool arguments:", toolCall.function.arguments, err);
      }
      
      let toolResultData: unknown;
      if (toolName === "search_emails") {
        const query = String(toolArgs.query ?? "");
        const res = await executeSearchEmails({ userId, query });
        toolResultData = res.success ? res.data : { error: res.error };
      } else if (toolName === "get_schedule") {
        const days = typeof toolArgs.days === "number" ? toolArgs.days : 7;
        const res = await executeGetSchedule({ userId, days });
        toolResultData = res.success ? res.data : { error: res.error };
      } else if (toolName === "store_memory") {
        const content = String(toolArgs.content ?? "");
        const category = toolArgs.category ? String(toolArgs.category) : "preference";
        
        await db.agentMemory.create({
          data: {
            userId,
            content,
            category,
          }
        });
        
        toolResultData = { success: true, message: "Memory stored successfully." };
      }

      // Feed tool result back to Groq for final textual answer (with Retry/Fallback)
      const secondCompletion: any = await chatCompletionWithOrchestration({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          {
            role: "assistant",
            content: aiMessage.content || "",
            tool_calls: aiMessage.tool_calls,
          },
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResultData),
          },
        ],
      });

      const finalChoice = secondCompletion?.choices[0];
      const finalText = finalChoice?.message?.content ?? "No response could be formulated.";

      // Save user & assistant messages to DB
      await db.agentChat.createMany({
        data: [
          { userId, role: "user", content: message, sessionId },
          { userId, role: "assistant", content: finalText, sessionId },
        ],
      });

      // Update session timestamp
      if (sessionId) {
        await db.chatSession.update({
          where: { id: sessionId },
          data: { updatedAt: new Date() },
        });
      }

      // Background save to Mem0
      addMemory(userId, [
        { role: "user", content: message },
        { role: "assistant", content: finalText },
      ]).catch((e) => console.error("Mem0 background save failed:", e));

      // Increment AI message usage
      await db.user.update({
        where: { id: userId },
        data: { aiMessagesUsed: { increment: 1 } },
      });

      return NextResponse.json({
        type: "message",
        content: finalText,
      });
    }

    // Default: Plain text response
    const plainText = aiMessage.content ?? "";

    // Save user & assistant messages to DB
    await db.agentChat.createMany({
      data: [
        { userId, role: "user", content: message, sessionId },
        { userId, role: "assistant", content: plainText, sessionId },
      ],
    });

    // Update session timestamp
    if (sessionId) {
      await db.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    }

    // Background save to Mem0
    addMemory(userId, [
      { role: "user", content: message },
      { role: "assistant", content: plainText },
    ]).catch((e) => console.error("Mem0 background save failed:", e));

    // Increment AI message usage
    await db.user.update({
      where: { id: userId },
      data: { aiMessagesUsed: { increment: 1 } },
    });

    return NextResponse.json({
      type: "message",
      content: plainText,
    });
  } catch (error) {
    console.error("[Agent route error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
