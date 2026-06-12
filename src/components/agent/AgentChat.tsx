"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, AlertCircle, Sparkles, Brain, Loader2 } from "lucide-react";
import { AgentMessage, type ChatMessage, type ToolCallData } from "./AgentMessage";

export function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/agent/chat");
        if (res.ok) {
          const data = (await res.json()) as { history: Array<{ id: string; role: string; content: string; createdAt: string }> };
          const formatted: ChatMessage[] = data.history.map((h) => ({
            id: h.id,
            role: h.role as "user" | "assistant",
            content: h.content,
            createdAt: new Date(h.createdAt),
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load agent chat history:", err);
      }
    }
    loadHistory();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text) return;

    if (!textToSend) {
      setInput("");
    }
    setError(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error("Failed to get agent response");
      }

      const data = (await res.json()) as {
        type: "message" | "action_required";
        content?: string;
        toolCall?: { id: string; name: string; arguments: any };
      };

      if (data.type === "action_required" && data.toolCall) {
        const toolMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          content: "I need your approval to execute this action:",
          createdAt: new Date(),
          toolCall: {
            ...data.toolCall,
            status: "pending",
          },
        };
        setMessages((prev) => [...prev, toolMsg]);
      } else {
        const agentMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          content: data.content ?? "",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, agentMsg]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleActionConfirm = async (messageId: string, toolCall: ToolCallData, wasApproved: boolean) => {
    setIsActionLoading(true);
    setError(null);

    // Update message state status immediately to reflect choice
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.toolCall) {
          return {
            ...msg,
            toolCall: {
              ...msg.toolCall,
              status: wasApproved ? "approved" : "rejected",
            },
          };
        }
        return msg;
      })
    );

    try {
      const res = await fetch("/api/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolCallId: toolCall.id,
          name: toolCall.name,
          arguments: toolCall.arguments,
          wasApproved,
        }),
      });

      if (!res.ok) {
        throw new Error("Action execution failed");
      }

      const data = (await res.json()) as { message: string };

      // Append confirmation text response
      const agentMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.message,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete action");
    } finally {
      setIsActionLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const suggestions = [
    { label: "What is my schedule for the next few days?", text: "What is my schedule for the next few days?" },
    { label: "Search my emails for meeting requests", text: "Search my emails for meeting requests" },
    { label: "Draft a professional follow-up email", text: "Draft an email to client about project status" },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] bg-background select-none overflow-hidden font-sans">
      {/* Agent Panel Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border/60 bg-surface/30 valora-glass flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center valora-glow">
            <Bot className="w-5 h-5 text-primary-light" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary">Valora Copilot</h1>
            <p className="text-[10px] text-text-muted mt-0.5">Autonomous email & calendar scheduling assistant</p>
          </div>
        </div>

        {/* Memory status */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-primary/5 border border-primary/10">
          <Brain className="w-3.5 h-3.5 text-primary-light animate-pulse" />
          <span className="text-[9px] font-semibold text-primary-light uppercase tracking-wider font-mono">
            Memory Enabled
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-4 min-h-0 scrollbar-thin">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-3xl bg-surface border border-border flex items-center justify-center mb-6 valora-glow">
              <Sparkles className="w-6 h-6 text-primary-light" />
            </div>
            <h2 className="text-sm font-bold text-text-primary mb-2">Welcome to Valora Copilot</h2>
            <p className="text-xs text-text-secondary mb-8 leading-relaxed">
              I can read and summarize your emails, search your inbox, and schedule meetings directly on your Google Calendar.
            </p>

            {/* Suggestions cards */}
            <div className="w-full flex flex-col gap-3">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.text)}
                  className="w-full text-left p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-primary/30 transition text-xs font-semibold text-text-primary flex items-center justify-between shadow-sm cursor-pointer"
                >
                  <span>{s.label}</span>
                  <Send className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List of bubbles */}
        {messages.map((msg) => (
          <AgentMessage
            key={msg.id}
            message={msg}
            onActionConfirm={handleActionConfirm}
            isActionLoading={isActionLoading}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-4 p-4 rounded-2xl justify-start">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 valora-glow">
              <Loader2 className="w-4 h-4 text-primary-light animate-spin" />
            </div>
            <div className="max-w-[70%]">
              <div className="px-4 py-3 rounded-2xl bg-surface border border-border text-xs text-text-muted rounded-tl-none font-medium flex items-center gap-2 valora-glass">
                <span>Valora is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-8 py-2.5 bg-error/10 border-t border-error/20 flex items-center gap-2.5 text-xs font-semibold text-error flex-shrink-0">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat Input form */}
      <div className="p-6 border-t border-border/60 bg-surface/30 valora-glass flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative max-w-4xl mx-auto"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isActionLoading}
            placeholder="Ask Valora anything..."
            className="w-full bg-background border border-border rounded-2xl px-5 py-4 pr-16 text-xs text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-muted transition shadow-inner"
          />

          <button
            type="submit"
            disabled={isLoading || isActionLoading || !input.trim()}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-primary text-white hover:bg-primary/95 transition shadow-sm disabled:opacity-30 flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
