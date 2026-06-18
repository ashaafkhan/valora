/**
 * Valora — Groq AI Client
 * Powers email prioritization, smart drafts, and the AI agent
 * Using llama-3.3-70b-versatile for ultra-fast inference
 */
import Groq from "groq-sdk";
import OpenAI from "openai";
import type { PriorityLabel } from "@/types";

// Singleton clients
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export const openai = new OpenAI({
});

export const AI_MODEL = "llama-3.3-70b-versatile";

// Robust wrapper with orchestration: OpenAI primary, Groq fallback
export async function chatCompletionWithOrchestration(params: any, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`[Orchestration] Attempting OpenAI (gpt-4o)... Attempt ${i + 1}`);
      return await openai.chat.completions.create({
        ...params,
        model: "gpt-4o", // Upgraded to flagship model
      });
    } catch (err: any) {
      console.warn(`[OpenAI] Completion attempt ${i + 1} failed:`, err?.message || err);
      if (i === retries) {
        console.log(`[Orchestration] Falling back to Groq (${AI_MODEL})...`);
        try {
          return await groq.chat.completions.create({
            ...params,
            model: AI_MODEL,
          });
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, (i + 1) * 800));
    }
  }
}

// ── Email Priority Scoring ─────────────────────────────────────
export interface PriorityResult {
  label: PriorityLabel;
  score: number;
  reason: string;
}

export async function scoreEmailPriority(email: {
  subject: string;
  fromEmail: string;
  fromName?: string;
  bodyPreview: string;
  labels?: string[];
}): Promise<PriorityResult> {
  const prompt = `You are Valora's AI Priority Engine. Analyze this email and return a JSON priority assessment.

Email:
- From: ${email.fromName ?? email.fromEmail} <${email.fromEmail}>
- Subject: ${email.subject}
- Preview: ${email.bodyPreview.slice(0, 300)}
- Labels: ${email.labels?.join(", ") ?? "none"}

Classify the priority as one of: urgent, high, normal, low
- urgent: Action required immediately (deadlines, crises, important people)
- high: Important but not time-critical (replies needed, key stakeholders)
- normal: Regular business communication
- low: Newsletters, FYIs, automated emails

Respond ONLY with valid JSON matching this schema:
{"label": "urgent"|"high"|"normal"|"low", "score": 0-100, "reason": "brief reason"}`;

  try {
    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as PriorityResult;

    // Validate
    const validLabels: PriorityLabel[] = ["urgent", "high", "normal", "low"];
    if (!validLabels.includes(parsed.label)) {
      parsed.label = "normal";
    }
    parsed.score = Math.max(0, Math.min(100, parsed.score ?? 40));
    parsed.reason = parsed.reason ?? "Auto-classified";

    return parsed;
  } catch {
    return { label: "normal", score: 40, reason: "Classification unavailable" };
  }
}

// ── Smart Draft Assist ─────────────────────────────────────────
export async function generateSmartDraft(params: {
  to: string;
  subject: string;
  context?: string;
  tone?: "professional" | "casual" | "brief";
}): Promise<string> {
  const tone = params.tone ?? "professional";

  const prompt = `You are Valora's AI Draft Assistant. Write an email reply or new email.

To: ${params.to}
Subject: ${params.subject}
${params.context ? `Context: ${params.context}` : ""}
Tone: ${tone}

Write ONLY the email body. No subject line. Keep it ${tone === "brief" ? "very short (2-3 sentences)" : "concise and clear"}. Sign off appropriately.`;

  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content ?? "";
}

// ── AI Agent Chat ──────────────────────────────────────────────
export interface AgentChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function runAgentChat(
  messages: AgentChatMessage[],
  systemPrompt?: string,
): Promise<string> {
  const system: AgentChatMessage = {
    role: "system",
    content:
      systemPrompt ??
      `You are Valora AI, an intelligent email and calendar assistant.
You help users manage their Gmail inbox and Google Calendar efficiently.
You can: summarize emails, draft replies, schedule meetings, search inbox, archive emails, and give productivity advice.
Be concise, action-oriented, and helpful. Never be verbose.
Current time: ${new Date().toISOString()}`,
  };

  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [system, ...messages],
    temperature: 0.6,
    max_tokens: 1000,
  });

  return completion.choices[0]?.message?.content ?? "I couldn't process that request.";
}

// ── Email Summarization ────────────────────────────────────────
export async function summarizeEmail(body: string, maxLength = 150): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "user",
        content: `Summarize this email in ${maxLength} characters or less. Be direct, no fluff:\n\n${body.slice(0, 2000)}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 100,
  });

  return completion.choices[0]?.message?.content ?? body.slice(0, maxLength);
}

// ── Email-to-Calendar Meeting Extraction ─────────────────────────
export interface ExtractedMeeting {
  title: string;
  attendees: string[];
  suggestedTime: string; // YYYY-MM-DDTHH:MM:SSZ format or human-readable
  duration: number; // in minutes
}

export async function extractMeetingFromEmail(emailBody: string): Promise<ExtractedMeeting> {
  const prompt = `Extract meeting details from this email. Return ONLY valid JSON matching this schema:
  {"title": "meeting title", "attendees": ["email1", "email2"], "suggestedTime": "ISO_DATETIME_STRING_OR_EMPTY", "duration": 30}
  
  Do not include any explanation or markdown formatting, just raw JSON.
  
  Email body:
  ${emailBody.slice(0, 2000)}`;

  try {
    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as ExtractedMeeting;

    // Validate properties
    parsed.title = parsed.title || "Meeting from Email";
    parsed.attendees = Array.isArray(parsed.attendees) ? parsed.attendees.filter(Boolean) : [];
    parsed.suggestedTime = parsed.suggestedTime || "";
    parsed.duration = typeof parsed.duration === "number" ? parsed.duration : 30;

    return parsed;
  } catch (err) {
    console.error("AI meeting extraction failed:", err);
    return { title: "Meeting from Email", attendees: [], suggestedTime: "", duration: 30 };
  }
}
