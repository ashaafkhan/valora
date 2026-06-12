/**
 * Valora — useAgentChat hook (Stage 7 / Stage 12)
 * Manages AI agent chat state, message history, and tRPC mutation
 */
"use client";

import { useCallback, useState } from "react";
import { useAgentStore } from "@/store/agentStore";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isThinking) return;
      setError(null);

      // Append user message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      appendMessage(userMsg);
      setIsThinking(true);

      // Placeholder assistant message while thinking
      const assistantId = `assistant-${Date.now()}`;
      const thinkingMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      appendMessage(thinkingMsg);

      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) throw new Error(`Agent API error: ${res.status}`);
        const data = (await res.json()) as { reply: string };

        // Replace placeholder with real response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: data.reply, isStreaming: false }
              : m
          )
        );
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errMsg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Sorry, I encountered an error. Please try again.",
                  isStreaming: false,
                }
              : m
          )
        );
      } finally {
        setIsThinking(false);
      }
    },
    [messages, isThinking, appendMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isThinking,
    error,
    sendMessage,
    clearChat,
  };
}
