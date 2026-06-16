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
    <div className="space-y-2">
      {/* Input */}
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-[#111111] border rounded-2xl transition ${
          parsed
            ? "border-[#0066ff]/40"
            : "border-[#222222] hover:border-[#333333]"
        }`}
      >
        <Sparkles className="w-4 h-4 text-[#60a5fa] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (parsed) setParsed(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleParse()}
          placeholder='e.g. "Schedule 30min with team@co.com next Tuesday at 3pm"'
          className="flex-1 bg-transparent border-0 outline-none text-sm text-zinc-200 placeholder-zinc-600 focus:ring-0"
          disabled={isParsing}
        />
        <button
          onClick={handleParse}
          disabled={!input.trim() || isParsing}
          className="px-3 py-1.5 bg-[#0066ff]/15 hover:bg-[#0066ff]/25 border border-[#0066ff]/30 text-[#60a5fa] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 flex-shrink-0"
        >
          {isParsing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          Parse
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-rose-900/20 border border-rose-800/30 rounded-xl text-xs text-rose-400">
          <X className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Parsed result */}
      {parsed && (
        <div className="border border-[#0066ff]/30 bg-[#0066ff]/5 rounded-2xl p-4 space-y-3">
          {/* Conflict warning */}
          {parsed.hasConflict && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/20 border border-amber-800/30 rounded-xl text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Conflicts with &quot;{parsed.conflictWith}&quot; — you can still create it
            </div>
          )}

          <div className="space-y-1.5">
            <div className="text-sm font-semibold text-zinc-100">{parsed.title}</div>
            <div className="text-xs text-zinc-400 font-mono">
              {format(new Date(parsed.startISO), "EEE, MMM d · h:mm a")} →{" "}
              {format(new Date(parsed.endISO), "h:mm a")}
            </div>
            {parsed.attendeeEmail && (
              <div className="text-xs text-[#93c5fd]">with {parsed.attendeeEmail}</div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={isCreating}
              className="flex-1 py-2 bg-[#0066ff] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-blue-900/20"
            >
              {isCreating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Confirm & Create
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs rounded-xl transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
