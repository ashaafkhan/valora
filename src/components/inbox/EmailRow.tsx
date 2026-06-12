"use client";

import type { Email } from "@/types";
import { Star, ShieldAlert } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import ShieldBadge from "./ShieldBadge";
import { redactSensitiveContent } from "@/lib/security";
import { format } from "date-fns";

interface EmailRowProps {
  email: Email;
  isSelected: boolean;
  isFocused: boolean;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
}

// Simple color hashing for avatar backgrounds
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-[#7C3AED]/20 text-[#A855F7] border-[#7C3AED]/30",
    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "bg-rose-500/10 text-rose-400 border-rose-500/20",
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ];
  return colors[Math.abs(hash) % colors.length] ?? colors[0]!;
}

export default function EmailRow({
  email,
  isSelected,
  isFocused,
  onToggleSelect,
  onToggleStar,
  onClick,
}: EmailRowProps) {
  const senderName = email.fromName ?? email.fromEmail.split("@")[0] ?? "Unknown";
  const initials = senderName.slice(0, 2).toUpperCase();
  const avatarColor = stringToColor(email.fromEmail);

  // Date formatting
  const receivedDate = new Date(email.receivedAt);
  const timeStr =
    Date.now() - receivedDate.getTime() < 24 * 60 * 60 * 1000
      ? format(receivedDate, "h:mm a")
      : format(receivedDate, "MMM d");

  return (
    <div
      onClick={onClick}
      className={`group px-4 py-3 border-b border-border/80 flex items-center gap-3 cursor-pointer transition-all duration-200 select-none relative theme-transition
        ${isFocused ? "bg-surface-hover/80 border-l-[3px] border-l-primary pl-[13px] valora-glow" : "bg-transparent"}
        ${isSelected ? "bg-primary/10" : ""}
        ${!email.isRead ? "font-semibold text-text-primary bg-primary/[0.03]" : "font-normal text-text-secondary"}
        hover:bg-surface-hover/50 hover:border-l-[3px] hover:border-l-primary-light hover:pl-[13px]`}
    >
      {/* Checkbox (Bulk Action Selection) */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(email.id, e);
        }}
        className="flex items-center justify-center w-5 h-5 flex-shrink-0"
      >
        <input
          type="checkbox"
          checked={isSelected}
          readOnly
          className="w-3.5 h-3.5 rounded border-border bg-background text-primary focus:ring-primary/20 focus:ring-offset-0 cursor-pointer accent-primary"
        />
      </div>

      {/* Star Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar(email.id, e);
        }}
        className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition hover:scale-115 duration-200 ${
          email.isStarred ? "text-amber-400" : "text-text-muted hover:text-text-secondary"
        }`}
      >
        <Star className="w-4 h-4" fill={email.isStarred ? "currentColor" : "none"} />
      </button>

      {/* Sender Avatar */}
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-semibold font-sans flex-shrink-0 ${avatarColor}`}>
        {initials}
      </div>

      {/* Message Info block */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate text-sm ${!email.isRead ? "text-text-primary font-bold" : "text-text-primary font-medium"}`}>
            {senderName}
          </span>
          <span className="text-[10px] text-text-muted flex-shrink-0 font-mono">
            {timeStr}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`truncate text-xs ${!email.isRead ? "text-text-primary font-semibold" : "text-text-secondary"}`}>
            {email.subject}
          </span>
          <span className="text-text-muted text-xs truncate max-w-[250px] font-normal">
            — {email.isSensitive ? redactSensitiveContent(email.bodyPreview, email.sensitiveTypes) : email.bodyPreview}
          </span>
        </div>
      </div>

      {/* Badges Column */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {email.isSensitive && <ShieldBadge types={email.sensitiveTypes} />}
        <PriorityBadge label={email.priorityLabel} score={email.priorityScore} />
      </div>

      {/* Keyboard Shortcut Hints shown on Hover */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 valora-glass rounded-lg p-1.5 z-10 shadow-lg select-none">
        <span className="text-[9px] text-text-muted font-mono flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-background border border-border rounded font-bold">E</kbd> Archive
        </span>
        <span className="text-[9px] text-text-muted font-mono flex items-center gap-1 ml-1.5">
          <kbd className="px-1 py-0.5 bg-background border border-border rounded font-bold">R</kbd> Read
        </span>
        <span className="text-[9px] text-text-muted font-mono flex items-center gap-1 ml-1.5">
          <kbd className="px-1 py-0.5 bg-background border border-border rounded font-bold">*</kbd> Star
        </span>
      </div>
    </div>
  );
}
