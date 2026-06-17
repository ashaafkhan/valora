"use client";

import { useState, useEffect } from "react";
import { X, Send, Sparkles, Loader2, Clock, Calendar, ShieldAlert } from "lucide-react";
import { useEmailStore } from "@/store/emailStore";
import { api } from "@/trpc/react";
import { scanEmailContent, getShieldLabel } from "@/lib/security";
import { toast } from "sonner";

export default function ComposeModal() {
  const { isComposing, closeCompose, composeReplyTo } = useEmailStore();
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string>(""); // ISO string from datetime-local input
  const [showScheduler, setShowScheduler] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  const { data: connStatus } = api.gmail.getConnectionStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Scan body for sensitive content whenever it changes
  useEffect(() => {
    if (!body.trim()) {
      setSecurityWarning(null);
      return;
    }
    const result = scanEmailContent({ subject, body, fromEmail: "" });
    if (result.isSensitive && result.sensitiveTypes.length > 0) {
      setSecurityWarning(getShieldLabel(result.sensitiveTypes));
    } else {
      setSecurityWarning(null);
    }
  }, [body, subject]);

  // tRPC mutation for AI smart drafts
  const draftMutation = api.gmail.generateDraft.useMutation();

  // tRPC mutation for sending email
  const sendEmailMutation = api.gmail.sendEmail.useMutation({
    onSuccess: () => {
      toast.success("Email sent!");
    },
    onError: (err) => {
      toast.error(`Failed to send email: ${err.message}`);
    },
  });

  const isSending = sendEmailMutation.isPending;

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
        void handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, subject, body, cc]);

  const handleSend = async () => {
    if (connStatus?.gmailConnected === false) {
      toast.error("Connect Your Gmail");
      return;
    }

    if (!to.trim() || !subject.trim() || !body.trim()) return;

    const ccArray = cc
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    try {
      await sendEmailMutation.mutateAsync({
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
    } catch (e) {
      console.error(e);
    }
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
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) closeCompose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col z-50 overflow-hidden animate-slide-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">New Message</h2>
          <button
            onClick={closeCompose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto scrollbar-thin">
          {/* TO field */}
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <span className="text-xs font-mono text-text-muted w-10">To:</span>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent border-0 outline-none p-0 text-sm text-text-primary placeholder-text-muted focus:ring-0"
            />
            <button
              onClick={() => setShowCc(!showCc)}
              className="text-[10px] font-mono text-text-muted hover:text-text-primary"
            >
              Cc
            </button>
          </div>

          {/* CC field */}
          {showCc && (
            <div className="flex items-center gap-2 border-b border-border pb-2.5 animate-fade-in">
              <span className="text-xs font-mono text-text-muted w-10">Cc:</span>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="carboncopy@example.com"
                className="flex-1 bg-transparent border-0 outline-none p-0 text-sm text-text-primary placeholder-text-muted focus:ring-0"
              />
            </div>
          )}

          {/* Subject field */}
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <span className="text-xs font-mono text-text-muted w-10">Subj:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              className="flex-1 bg-transparent border-0 outline-none p-0 text-sm text-text-primary placeholder-text-muted focus:ring-0"
            />
          </div>

          {/* Body field */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email here..."
            className="flex-1 bg-transparent border-0 outline-none p-0 text-sm text-text-primary placeholder-text-muted focus:ring-0 resize-none min-h-[220px]"
          />
        </div>

        {/* Security warning */}
        {securityWarning && (
          <div className="mx-4 mb-0 px-3.5 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/15 flex items-center gap-2 text-[11px] text-yellow-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Sensitive content detected: {securityWarning}. Review before sending.</span>
          </div>
        )}

        {/* Footer bar */}
        <div className="p-4 bg-surface-hover/50 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* AI Smart Draft Assist */}
            <button
              onClick={handleAIDraft}
              disabled={isDrafting || !to.trim() || !subject.trim()}
              className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
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
                  ? "bg-warning/10 border-warning/30 text-warning"
                  : "bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover"
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
                className="bg-surface border border-border text-text-primary text-xs rounded-xl px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[10px] text-text-muted font-mono">
              <kbd className="px-1 py-0.5 bg-surface border border-border rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-surface border border-border rounded">Enter</kbd> to send
            </span>

            <button
              onClick={handleSend}
              disabled={isSending || !to.trim() || !subject.trim() || !body.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary-light disabled:opacity-50 disabled:hover:bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
            >
              {isSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white/70" />
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
    </div>
  );
}
