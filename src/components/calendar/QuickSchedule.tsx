"use client";

/**
 * Valora — QuickSchedule (Stage 8)
 * Natural language scheduling input bar — AI-powered event creation
 * e.g. "Schedule 30min with sarah@example.com next Tuesday at 3pm"
 */
import { useState, useRef } from "react";
import {
  Sparkles,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { api } from "@/trpc/react";

interface QuickScheduleProps {
  onConfirm: (event: {
    title: string;
    startISO: string;
    endISO: string;
    attendeeEmail: string;
  }) => void;
}

export default function QuickSchedule({ onConfirm }: QuickScheduleProps) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<{
    title: string;
    attendeeEmail: string;
    startISO: string;
    endISO: string;
    hasConflict: boolean;
    conflictWith?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseMutation = api.calendar.parseNaturalSchedule.useMutation();
  const createMutation = api.calendar.createEvent.useMutation();

  const handleParse = async () => {
    if (!input.trim()) return;
    setError(null);
    setParsed(null);

    try {
      const result = await parseMutation.mutateAsync({ input: input.trim() });
      setParsed(result);
    } catch (err) {
      setError("Failed to parse — try being more specific.");
    }
  };

  const handleConfirm = async () => {
    if (!parsed) return;
    await createMutation.mutateAsync({
      title: parsed.title,
      startTime: parsed.startISO,
      endTime: parsed.endISO,
      attendees: parsed.attendeeEmail ? [parsed.attendeeEmail] : undefined,
    });
    onConfirm({
      title: parsed.title,
      startISO: parsed.startISO,
      endISO: parsed.endISO,
      attendeeEmail: parsed.attendeeEmail,
    });
    setInput("");
    setParsed(null);
  };

  const handleCancel = () => {
    setParsed(null);
    setError(null);
    setInput("");
  };

  const isParsing = parseMutation.isPending;
  const isCreating = createMutation.isPending;

  return (
    <div className="space-y-3">
      {/* Input */}
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-surface border rounded-2xl shadow-sm transition-all duration-200 ${
          parsed
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
            if (parsed) setParsed(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleParse()}
          placeholder="e.g. 'Meet team tomorrow at 3pm'"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 text-sm font-medium text-text-primary placeholder:text-text-muted/70 focus:ring-0 text-ellipsis"
          disabled={isParsing}
        />
        <button
          onClick={handleParse}
          disabled={!input.trim() || isParsing}
          className={`bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 flex-shrink-0 shadow-sm hover:shadow ${
            input.trim() ? "px-3 py-1.5 text-xs gap-1.5" : "w-8 h-8 p-0"
          }`}
        >
          {isParsing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
          ) : (
            <Zap className="w-3.5 h-3.5 fill-current flex-shrink-0" />
          )}
          {input.trim() ? <span>Generate</span> : null}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-error/10 border border-error/20 rounded-xl text-xs font-semibold text-error shadow-sm animate-in fade-in slide-in-from-top-2">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Parsed result */}
      {parsed && (
        <div className="border border-primary/30 bg-primary/5 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          {/* Conflict warning */}
          {parsed.hasConflict && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Conflicts with &quot;{parsed.conflictWith}&quot; — you can still create it
            </div>
          )}

          <div className="space-y-1.5">
            <div className="text-base font-bold text-text-primary flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {parsed.title}
            </div>
            <div className="text-sm text-text-secondary font-mono bg-surface-hover inline-block px-2 py-1 rounded-md border border-border">
              {format(new Date(parsed.startISO), "EEE, MMM d · h:mm a")} →{" "}
              {format(new Date(parsed.endISO), "h:mm a")}
            </div>
            {parsed.attendeeEmail && (
              <div className="text-sm font-medium text-primary flex items-center gap-1.5 mt-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px]">@</span>
                </div>
                {parsed.attendeeEmail}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleConfirm}
              disabled={isCreating}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Confirm & Schedule
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border text-text-secondary text-sm font-semibold rounded-xl transition-all hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
