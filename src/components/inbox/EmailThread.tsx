"use client";

import type { Email } from "@/types";
import {
  Archive,
  Star,
  CornerUpLeft,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronRight,
  User,
  Loader2,
  Send,
  PlusCircle,
  ExternalLink,
  MailX,
} from "lucide-react";
import { useState } from "react";
import PriorityBadge from "./PriorityBadge";
import ShieldBadge from "./ShieldBadge";
import { format } from "date-fns";
import { api } from "@/trpc/react";

interface EmailThreadProps {
  threadId: string;
  emailsInThread: Email[];
  isLoading: boolean;
  onArchive: (gmailId: string) => void;
  onToggleStar: (gmailId: string, starred: boolean) => void;
  onReply: (body: string) => Promise<void>;
  isReplying: boolean;
  onScheduleMeeting?: (extracted: {
    title: string;
    attendees: string[];
    suggestedTime: string;
    duration: number;
    description?: string;
  }) => void;
}

export default function EmailThread({
  threadId,
  emailsInThread,
  isLoading,
  onArchive,
  onToggleStar,
  onReply,
  isReplying,
  onScheduleMeeting,
}: EmailThreadProps) {
  // Expand/collapse message indexes (default only show last message expanded)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [replyBody, setReplyBody] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  // Detect unsubscribe URL from email body (List-Unsubscribe heuristic)
  const unsubscribeUrl = (() => {
    const allBodies = emailsInThread.map((e) => e.body).join(" ");
    // Match common unsubscribe link patterns
    const urlMatch = allBodies.match(
      /href=["'](https?:\/\/[^"']*unsubscrib[^"']*)["']/i
    );
    if (urlMatch?.[1]) return urlMatch[1];
    // Fallback: look for plain URLs with unsubscribe
    const plainMatch = allBodies.match(
      /(https?:\/\/\S*unsubscrib\S*)/i
    );
    return plainMatch?.[1] ?? null;
  })();

  // tRPC mutations for AI
  const draftMutation = api.gmail.generateDraft.useMutation();
  const extractMutation = api.gmail.extractMeeting.useMutation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#070707] h-full text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (emailsInThread.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#070707] h-full text-zinc-600 p-8">
        <User className="w-10 h-10 text-zinc-800 mb-2" />
        <p className="text-sm font-medium">No conversation selected</p>
        <p className="text-xs text-zinc-500 mt-1">
          Select an email thread from the inbox to read.
        </p>
      </div>
    );
  }

  const latestEmail = emailsInThread[emailsInThread.length - 1]!;
  const subject = latestEmail.subject;

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper to check if a message is expanded
  const isExpanded = (id: string, index: number) => {
    if (expandedIds[id] !== undefined) return expandedIds[id];
    return index === emailsInThread.length - 1; // Default last message to expanded
  };

  // AI draft assistant
  const handleAIDraft = async () => {
    setIsDrafting(true);
    try {
      const promptContext = `This is a reply to the email conversation with subject: "${subject}". Context of last message: "${latestEmail.bodyPreview}". Please draft a professional reply.`;
      const res = await draftMutation.mutateAsync({
        to: latestEmail.fromEmail,
        subject: `Re: ${subject}`,
        context: promptContext,
        tone: "professional",
      });
      if (res.draft) {
        setReplyBody(res.draft);
      }
    } catch (err) {
      console.error("Failed to generate AI draft:", err);
    } finally {
      setIsDrafting(false);
    }
  };

  // AI meeting extractor
  const handleExtractMeeting = async () => {
    setIsExtracting(true);
    try {
      const fullText = emailsInThread.map((e) => e.body).join("\n\n");
      const meeting = await extractMutation.mutateAsync({
        emailBody: fullText,
      });

      if (onScheduleMeeting) {
        onScheduleMeeting({
          title: meeting.title,
          attendees: meeting.attendees,
          suggestedTime: meeting.suggestedTime,
          duration: meeting.duration,
          description: `Meeting scheduled from email thread: "${subject}"`,
        });
      }
    } catch (err) {
      console.error("Meeting extraction failed:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyBody.trim()) return;
    await onReply(replyBody);
    setReplyBody("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070707] text-[#F8F8F8]">
      {/* Thread Header Toolbar */}
      <div className="px-6 py-4 border-b border-[#222222]/80 flex items-center justify-between gap-4 flex-shrink-0 bg-[#0A0A0A]/40 backdrop-blur">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-zinc-100 truncate">{subject}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <PriorityBadge label={latestEmail.priorityLabel} score={latestEmail.priorityScore} />
            {latestEmail.isSensitive && <ShieldBadge types={latestEmail.sensitiveTypes} />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Unsubscribe button — only shown if detected */}
          {unsubscribeUrl && (
            <a
              href={unsubscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="One-click unsubscribe from this mailing list"
              className="px-3 py-1.5 bg-rose-900/10 hover:bg-rose-900/25 text-rose-400 border border-rose-800/30 hover:border-rose-700/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <MailX className="w-3.5 h-3.5" />
              Unsubscribe
            </a>
          )}

          {/* Schedule Meeting button */}
          <button
            onClick={handleExtractMeeting}
            disabled={isExtracting}
            className="px-3 py-1.5 bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 text-[#A855F7] border border-[#7C3AED]/30 hover:border-[#7C3AED]/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isExtracting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            Schedule Meeting
          </button>

          {/* Star Action */}
          <button
            onClick={() => onToggleStar(latestEmail.gmailId, !latestEmail.isStarred)}
            className={`p-2 rounded-xl border border-[#222222] bg-zinc-950 transition hover:bg-zinc-900 ${
              latestEmail.isStarred ? "text-amber-400 border-amber-500/10" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Star className="w-4 h-4" fill={latestEmail.isStarred ? "currentColor" : "none"} />
          </button>

          {/* Archive Action */}
          <button
            onClick={() => onArchive(latestEmail.gmailId)}
            className="p-2 rounded-xl border border-[#222222] bg-zinc-950 text-zinc-400 hover:text-white transition hover:bg-zinc-900"
            title="Archive email (E)"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages list scroller */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
        {emailsInThread.map((email, index) => {
          const expanded = isExpanded(email.id, index);
          const date = new Date(email.receivedAt);

          return (
            <div
              key={email.id}
              className={`border border-[#222222]/80 rounded-2xl overflow-hidden transition-all duration-200 bg-[#0F0F0F]
                ${expanded ? "ring-1 ring-zinc-800" : "opacity-75 hover:opacity-100"}`}
            >
              {/* Message Header Bar */}
              <div
                onClick={() => toggleExpand(email.id)}
                className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400">
                    {email.fromName?.slice(0, 1) || email.fromEmail.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-zinc-100">
                      {email.fromName || email.fromEmail}
                    </span>
                    <span className="text-xs text-zinc-500 ml-1.5">
                      &lt;{email.fromEmail}&gt;
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 font-mono">
                    {format(date, "MMM d, yyyy h:mm a")}
                  </span>
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
              </div>

              {/* Message Body Content */}
              {expanded && (
                <div className="px-5 py-4 border-t border-[#222222]/60 bg-zinc-950/20">
                  {/* Recipients details */}
                  <div className="text-[10px] text-zinc-500 space-y-1 mb-4 pb-3 border-b border-[#222222]/40 font-sans">
                    <p>
                      <span className="font-semibold text-zinc-400">To:</span>{" "}
                      {email.toEmails.join(", ")}
                    </p>
                    {email.ccEmails.length > 0 && (
                      <p>
                        <span className="font-semibold text-zinc-400">Cc:</span>{" "}
                        {email.ccEmails.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Body HTML/Text rendering */}
                  <div
                    className="text-sm text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap select-text font-sans"
                    dangerouslySetInnerHTML={{
                      __html: email.body.includes("</") ? email.body : email.body.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline Reply Box at Bottom */}
      <div className="p-4 border-t border-[#222222]/80 bg-[#0A0A0A] flex-shrink-0">
        <div className="relative border border-[#222222] rounded-2xl bg-zinc-950 p-2 focus-within:ring-1 focus-within:ring-[#7C3AED]">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder={`Reply to ${latestEmail.fromName || latestEmail.fromEmail}...`}
            className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm text-zinc-100 placeholder-zinc-500 p-3 h-24 resize-none"
          />

          <div className="flex justify-between items-center px-2 pt-2 border-t border-[#222222]/60 mt-1">
            <div className="flex items-center gap-1.5">
              {/* AI Draft helper button */}
              <button
                onClick={handleAIDraft}
                disabled={isDrafting}
                className="px-3 py-1.5 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 border border-[#7C3AED]/20 hover:border-[#7C3AED]/40 text-purple-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isDrafting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                AI Reply Assist
              </button>
            </div>

            <button
              onClick={handleSendReply}
              disabled={isReplying || !replyBody.trim()}
              className="px-4 py-1.5 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow"
            >
              {isReplying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Send Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
