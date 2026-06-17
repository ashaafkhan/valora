"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Send, Mic, Brain, PanelRightClose, PanelRightOpen, Sparkles, Loader2 } from "lucide-react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { AgentMessage, type ChatMessage, type ToolCallData } from "@/components/agent/AgentMessage";
import { MemoryContext } from "@/components/agent/MemoryContext";

// ── Types ─────────────────────────────────────────────────────
interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  lastMessagePreview?: string;
}

// ── Zara Avatar ───────────────────────────────────────────────
function ZaraAvatar({ size = 40, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white transition-all ${
        thinking ? "animate-zara-think" : ""
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: "linear-gradient(135deg, #0066FF 0%, #7C3AED 100%)",
        boxShadow: thinking ? "0 0 0 3px rgba(0, 102, 255, 0.3)" : "none",
      }}
    >
      Z
    </div>
  );
}

// ── Session Sidebar ───────────────────────────────────────────
function SessionSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading,
}: {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  const grouped = sessions.reduce<Record<string, ChatSession[]>>((acc, s) => {
    const date = new Date(s.updatedAt);
    let key = "Older";
    if (isToday(date)) key = "Today";
    else if (isYesterday(date)) key = "Yesterday";
    else if (isThisWeek(date)) key = "This Week";
    
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  const order = ["Today", "Yesterday", "This Week", "Older"];

  return (
    <div className="w-56 flex-shrink-0 border-r border-border bg-surface/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <button
          onClick={onNew}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
          </div>
        ) : (
          order.map((period) => {
            const items = grouped[period];
            if (!items || items.length === 0) return null;

            return (
              <div key={period} className="space-y-1">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-2.5 py-1 font-mono">
                  {period}
                </p>
                {items.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all border ${
                      activeId === session.id
                        ? "bg-primary/10 border-primary/20 text-primary-light font-medium"
                        : "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    }`}
                    onClick={() => onSelect(session.id)}
                  >
                    <span className="truncate text-xs pr-6">{session.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(session.id);
                      }}
                      className="absolute right-2.5 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded hover:bg-error/10 hover:text-error text-text-muted"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })
        )}

        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-center px-4">
            <p className="text-[10px] font-semibold text-text-muted">No history yet</p>
            <p className="text-[9px] text-text-muted mt-1 leading-relaxed">Start a new chat to begin commanding your workspace.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Zara Page ────────────────────────────────────────────
export default function ZaraPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all chat sessions
  const fetchSessions = useCallback(async (selectId?: string) => {
    try {
      const res = await fetch("/api/agent/sessions");
      if (res.ok) {
        const data = (await res.json()) as { sessions: ChatSession[] };
        setSessions(data.sessions);
        
        // Auto-select session if appropriate
        if (data.sessions.length > 0) {
          if (selectId) {
            setActiveSessionId(selectId);
          } else if (!activeSessionId) {
            setActiveSessionId(data.sessions[0]?.id || null);
          }
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, [activeSessionId]);

  // Load chat messages when active session changes
  useEffect(() => {
    if (!activeSessionId) return;

    async function loadHistory() {
      setIsThinking(true);
      setError(null);
      try {
        const res = await fetch(`/api/agent/chat?sessionId=${activeSessionId}`);
        if (res.ok) {
          const data = (await res.json()) as {
            history: Array<{
              id: string;
              role: string;
              content: string;
              createdAt: string;
              toolCall?: any;
            }>;
          };
          const formatted: ChatMessage[] = data.history.map((h) => ({
            id: h.id,
            role: h.role as "user" | "assistant",
            content: h.content,
            createdAt: new Date(h.createdAt),
            toolCall: h.toolCall
              ? {
                  id: h.toolCall.id || Math.random().toString(),
                  name: h.toolCall.name,
                  arguments: h.toolCall.arguments,
                  status: h.toolCall.status || "pending",
                }
              : undefined,
          }));
          setMessages(formatted);
        } else {
          throw new Error("Failed to load conversation history");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setIsThinking(false);
      }
    }

    void loadHistory();
  }, [activeSessionId]);

  // Initial load of sessions
  useEffect(() => {
    void fetchSessions();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Handle creating a new chat session
  const handleNewChat = async () => {
    setError(null);
    try {
      const res = await fetch("/api/agent/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (res.ok) {
        const data = (await res.json()) as { session: ChatSession };
        await fetchSessions(data.session.id);
        setMessages([]);
      } else {
        throw new Error("Failed to create new session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating session");
    }
  };

  // Handle deleting a chat session
  const handleDeleteSession = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/agent/sessions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const remaining = sessions.filter((s) => s.id !== id);
        setSessions(remaining);
        if (activeSessionId === id) {
          const nextId = remaining[0]?.id ?? null;
          setActiveSessionId(nextId);
          if (!nextId) {
            setMessages([]);
          }
        }
      } else {
        throw new Error("Failed to delete session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting session");
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text) return;

    if (!textToSend) {
      setInput("");
    }
    setError(null);
    setIsThinking(true);

    let sessionId = activeSessionId;

    // 1. Create a session on the fly if none is selected
    if (!sessionId) {
      try {
        const sessionRes = await fetch("/api/agent/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: text.split(" ").slice(0, 5).join(" ") || "New Chat",
          }),
        });
        if (sessionRes.ok) {
          const data = (await sessionRes.json()) as { session: ChatSession };
          sessionId = data.session.id;
          setActiveSessionId(sessionId);
          // Insert session into local state list immediately
          setSessions((prev) => [data.session, ...prev]);
        } else {
          throw new Error("Failed to initialize session");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error starting chat");
        setIsThinking(false);
        return;
      }
    }

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response from Zara");
      }

      const data = (await res.json()) as {
        type: "message" | "action_required";
        content?: string;
        toolCall?: { id: string; name: string; arguments: any };
      };

      if (data.type === "action_required" && data.toolCall) {
        const toolMsg: ChatMessage = {
          id: `assistant-tool-${Date.now()}`,
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
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content ?? "",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, agentMsg]);
      }

      // Rename session if it was previously default "New Chat" and this is the first message
      const activeSession = sessions.find((s) => s.id === sessionId);
      if (activeSession && activeSession.title === "New Chat") {
        const newTitle = text.split(" ").slice(0, 5).join(" ") || "New Chat";
        await fetch("/api/agent/sessions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sessionId, title: newTitle }),
        });
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
        );
      } else {
        // Just touch the session to update its timestamp ordering
        setSessions((prev) =>
          prev
            .map((s) => (s.id === sessionId ? { ...s, updatedAt: new Date().toISOString() } : s))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleActionConfirm = async (messageId: string, toolCall: ToolCallData, wasApproved: boolean) => {
    setIsActionLoading(true);
    setError(null);

    // Update UI state immediately
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
          sessionId: activeSessionId,
        }),
      });

      if (!res.ok) {
        throw new Error("Action execution failed");
      }

      const data = (await res.json()) as { message: string };

      // Append confirmation response bubble
      const agentMsg: ChatMessage = {
        id: `assistant-confirm-${Date.now()}`,
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
    <div className="flex h-full overflow-hidden bg-background">
      {/* Session sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onNew={handleNewChat}
        onDelete={handleDeleteSession}
        loading={loadingSessions}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Chat header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-surface/50">
          <ZaraAvatar size={44} thinking={isThinking} />
          <div>
            <h1 className="text-base font-bold text-text-primary">Zara</h1>
            <p className="text-xs text-text-muted">Your personal AI for email and calendar</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-semibold text-text-muted uppercase">Online</span>
            </div>
            
            {/* Toggle memory sidebar */}
            <button
              onClick={() => setShowMemory((v) => !v)}
              className="p-1.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-primary-light transition cursor-pointer"
              title={showMemory ? "Hide memory panel" : "Show memory panel"}
            >
              {showMemory ? <PanelRightClose className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-4">
          {messages.length === 0 && !isThinking && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
              <div className="w-12 h-12 rounded-3xl bg-surface border border-border flex items-center justify-center mb-6 valora-glow">
                <Sparkles className="w-6 h-6 text-primary-light" />
              </div>
              <h2 className="text-sm font-bold text-text-primary mb-2 font-display">Command Center Assistant</h2>
              <p className="text-xs text-text-secondary mb-8 leading-relaxed">
                Zara helps you command your inbox and Google Calendar. Ask questions, search messages, prepare replies, or organize your calendar in plain text.
              </p>

              {/* Suggestions */}
              <div className="w-full flex flex-col gap-2.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.text)}
                    className="w-full text-left p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-primary/30 transition text-xs font-semibold text-text-primary flex items-center justify-between shadow-sm cursor-pointer"
                  >
                    <span>{s.label}</span>
                    <Send className="w-3.5 h-3.5 text-text-muted hover:text-primary transition" />
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

          {/* Typing/Thinking indicator */}
          {isThinking && (
            <div className="flex gap-4 p-4 rounded-2xl justify-start">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 valora-glow">
                <Loader2 className="w-4 h-4 text-primary-light animate-spin" />
              </div>
              <div className="max-w-[70%]">
                <div className="px-4 py-3 rounded-2xl bg-surface border border-border text-xs text-text-muted rounded-tl-none font-medium flex items-center gap-2 valora-glass">
                  <span>Zara is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-6 py-2.5 bg-error/10 border-t border-error/20 flex items-center gap-2 text-xs font-semibold text-error flex-shrink-0">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Input area */}
        <div className="px-6 py-4 border-t border-border bg-surface/30">
          <div className="flex items-end gap-3 bg-surface border border-border rounded-2xl px-4 py-3 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Ask Zara anything... Draft emails, schedule meetings, search your inbox"
              rows={1}
              className="flex-1 bg-transparent text-xs text-text-primary placeholder-text-muted outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ minHeight: "20px" }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="w-8 h-8 rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center cursor-pointer"
                title="Voice input (coming soon)"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={() => void handleSend()}
                disabled={!input.trim() || isThinking}
                className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/95 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-text-muted text-center mt-2 font-mono">
            Zara will ask for your confirmation before performing write actions.
          </p>
        </div>
      </div>

      {/* Memory context panel on the right */}
      {showMemory && (
        <div className="w-72 border-l border-border bg-surface flex-shrink-0 overflow-hidden h-full">
          <MemoryContext />
        </div>
      )}
    </div>
  );
}
