"use client";

/**
 * Valora — Calendar AI Assistant (formerly QuickSchedule)
 * Natural language calendar assistant — answers questions, summarizes events, etc.
 */
import { useState, useRef } from "react";
import {
  Sparkles,
  Loader2,
  X,
  Bot,
} from "lucide-react";
import { api } from "@/trpc/react";

export default function QuickSchedule() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const askMutation = api.calendar.queryCalendarAssistant.useMutation();

  const handleAsk = async () => {
    if (!input.trim()) return;
    setError(null);
    setResponse(null);

    try {
      const result = await askMutation.mutateAsync({ input: input.trim() });
      setResponse(result);
      setInput(""); // clear input after asking
    } catch (err) {
      setError("Failed to reach Assistant — please try again.");
    }
  };

  const handleClear = () => {
    setResponse(null);
    setError(null);
    setInput("");
  };

  const isAsking = askMutation.isPending;

  return (
    <div className="space-y-3">
      {/* Input */}
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-surface border rounded-2xl shadow-sm transition-all duration-200 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 ${
          response
            ? "border-primary/40 ring-2 ring-primary/10 shadow-primary/5"
            : "border-border hover:border-border-strong hover:shadow-md"
        }`}
      >
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 animate-pulse ml-1" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (response) setResponse(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask about your calendar events..."
          className="flex-1 min-w-0 bg-transparent border-0 !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 text-sm font-medium text-text-primary placeholder:text-text-muted/70 text-ellipsis"
          disabled={isAsking}
        />
        <button
          onClick={handleAsk}
          disabled={!input.trim() || isAsking}
          className={`bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 flex-shrink-0 shadow-sm hover:shadow ${
            input.trim() ? "px-3 py-1.5 text-xs gap-1.5" : "w-8 h-8 p-0"
          }`}
        >
          {isAsking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
          ) : (
            <Bot className="w-3.5 h-3.5 fill-current flex-shrink-0" />
          )}
          {input.trim() ? <span>Ask</span> : null}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between px-4 py-3 bg-error/10 border border-error/20 rounded-xl text-xs font-semibold text-error shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="hover:text-error/70">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="border border-primary/30 bg-primary/5 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                Calendar Assistant
              </div>
              <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                {response}
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1 hover:bg-surface-hover rounded-lg text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
