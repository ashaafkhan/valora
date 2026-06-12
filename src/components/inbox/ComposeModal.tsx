"use client";

import { useState, useEffect } from "react";
import { X, Send, Sparkles, Loader2, Clock, Calendar } from "lucide-react";
import { useEmailStore } from "@/store/emailStore";
import { api } from "@/trpc/react";

interface ComposeModalProps {
  onSend: (payload: { to: string; subject: string; body: string; cc?: string[]; scheduledAt?: Date }) => Promise<void>;
  isSending: boolean;
}

export default function ComposeModal({ onSend, isSending }: ComposeModalProps) {
  const { isComposing, closeCompose, composeReplyTo } = useEmailStore();
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string>(""); // ISO string from datetime-local input
  const [showScheduler, setShowScheduler] = useState(false);

  // tRPC mutation for AI smart drafts
  const draftMutation = api.gmail.generateDraft.useMutation();

  // Populate fields if this is a reply
  useEffect(() => {
    if (composeReplyTo) {
      setTo(composeReplyTo.fromEmail);
      setSubject(
        composeReplyTo.subject.toLowerCase().startsWith("re:")
          ? composeReplyTo.subject
          : `Re: ${composeReplyTo.subject}`,
      );
      // Optional: quote previous body
    } else {
      setTo("");
      setSubject("");
      setBody("");
    }
  }, [composeReplyTo, isComposing]);

  // Handle keyboard shortcut (Cmd/Ctrl + Enter to send)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [to, subject, body, cc]);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) return;

    const ccArray = cc
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    await onSend({
      to: to.trim(),
      subject: subject.trim(),
      body,
      cc: ccArray.length > 0 ? ccArray : undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    // Reset and close
    setTo("");
    setCc("");
    setSubject("");
    setBody("");
    setScheduledAt("");
    setShowScheduler(false);
    closeCompose();
  };

  const handleAIDraft = async () => {
    if (!to.trim() || !subject.trim()) return;
    setIsDrafting(true);
    try {
      const res = await draftMutation.mutateAsync({
        to,
        subject,
        tone: "professional",
      });
      if (res.draft) {
        setBody(res.draft);
      }
    } catch (err) {
      console.error("AI Smart draft failed:", err);
    } finally {
      setIsDrafting(false);
    }
  };

  if (!isComposing) return null;

  return (
    <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[600px] h-[550px] md:h-[500px] bg-[#111111] border border-zinc-800 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-slide-up">
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
          New Message
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={closeCompose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto scrollbar-thin">
        {/* TO field */}
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
          <span className="text-xs font-mono text-zinc-500 w-10">To:</span>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="flex-1 bg-transparent border-0 outline-none p-0 text-sm text-zinc-100 placeholder-zinc-700 focus:ring-0"
          />
          <button
            onClick={() => setShowCc(!showCc)}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
          >
            Cc
          </button>
        </div>

        {/* CC field */}
        {showCc && (
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5 animate-fade-in">
            <span className="text-xs font-mono text-zinc-500 w-10">Cc:</span>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="carboncopy@example.com"
              className="flex-1 bg-transparent border-0 outline-none p-0 text-sm text-zinc-100 placeholder-zinc-700 focus:ring-0"
            />
          </div>
        )}

        {/* Subject field */}
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
          <span className="text-xs font-mono text-zinc-500 w-10">Subj:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            className="flex-1 bg-transparent border-0 outline-none p-0 text-sm text-zinc-100 placeholder-zinc-700 focus:ring-0"
          />
        </div>

        {/* Body field */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email here..."
          className="flex-1 bg-transparent border-0 outline-none p-0 text-sm text-zinc-100 placeholder-zinc-700 focus:ring-0 resize-none min-h-[220px]"
        />
      </div>

      {/* Footer bar */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* AI Smart Draft Assist */}
          <button
            onClick={handleAIDraft}
            disabled={isDrafting || !to.trim() || !subject.trim()}
            className="px-3.5 py-2 bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 text-[#A855F7] border border-[#7C3AED]/30 hover:border-[#7C3AED]/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            title="Automatically draft response based on subject & recipient"
          >
            {isDrafting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            AI Smart Draft
          </button>

          {/* Send Later */}
          <button
            onClick={() => setShowScheduler(!showScheduler)}
            title="Schedule send"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              showScheduler || scheduledAt
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {scheduledAt ? "Scheduled" : "Send Later"}
          </button>

          {/* Datetime picker for scheduled send */}
          {showScheduler && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl px-2 py-1.5 focus:ring-1 focus:ring-[#7C3AED] outline-none"
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[10px] text-zinc-500 font-mono">
            <kbd className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded">Enter</kbd> to send
          </span>

          <button
            onClick={handleSend}
            disabled={isSending || !to.trim() || !subject.trim() || !body.trim()}
            className="px-4 py-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
          >
            {isSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : scheduledAt ? (
              <Calendar className="w-3.5 h-3.5" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {scheduledAt ? "Schedule Send" : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
