"use client";

import type { Email } from "@/types";
import { Star, ShieldAlert, Archive, Reply, Trash2 } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import ShieldBadge from "./ShieldBadge";
import { redactSensitiveContent } from "@/lib/security";
import { format } from "date-fns";
import { toast } from "sonner";

interface EmailRowProps {
  email: Email;
  isSelected: boolean;
  isFocused: boolean;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-[#0066ff]/20 text-[#60a5fa] border-[#0066ff]/30",
    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "bg-rose-500/10 text-rose-400 border-rose-500/20",
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ];
  return colors[Math.abs(hash) % colors.length] ?? colors[0]!;
}

function ActionBtn({ icon: Icon, label, shortcut, onClick }: {
  icon: React.ElementType;
  label: string;
  shortcut: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      title={`${label} [${shortcut}]`}
      className="group/btn relative w-7 h-7 rounded-lg flex items-center justify-center
                 text-text-muted hover:text-text-primary hover:bg-surface-hover/80 transition-all"
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/btn:block
                       text-[9px] font-mono bg-surface border border-border rounded px-1.5 py-0.5
                       whitespace-nowrap z-20 shadow-lg">
        {shortcut}
      </span>
    </button>
  );
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

  const receivedDate = new Date(email.receivedAt);
  const timeStr =
    Date.now() - receivedDate.getTime() < 24 * 60 * 60 * 1000
      ? format(receivedDate, "h:mm a")
      : format(receivedDate, "MMM d");

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Archived");
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Reply composer opened");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Deleted");
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar(email.id, e);
  };

  return (
    <div
      onClick={onClick}
      className={`group relative px-4 py-3 border-b border-border/80 flex items-center gap-3 cursor-pointer transition-all duration-150 select-none
        ${isFocused ? "bg-surface-hover/80 border-l-[3px] border-l-primary pl-[13px] shadow-[inset_0_0_20px_rgba(0,102,255,0.04)]" : "bg-transparent"}
        ${isSelected ? "bg-primary/5" : ""}
        ${!email.isRead ? "font-semibold text-text-primary bg-primary/[0.02]" : "font-normal text-text-secondary"}
        hover:bg-surface-hover/50 hover:border-l-[3px] hover:border-l-primary/40 hover:pl-[13px]`}
    >
      {/* Checkbox */}
      <div
        onClick={(e) => { e.stopPropagation(); onToggleSelect(email.id, e); }}
        className="flex items-center justify-center w-5 h-5 flex-shrink-0"
      >
        <input
          type="checkbox"
          checked={isSelected}
          readOnly
          className="w-3.5 h-3.5 rounded border-border bg-background text-primary focus:ring-primary/20 focus:ring-offset-0 cursor-pointer accent-primary"
        />
      </div>

      {/* Star */}
      <button
        onClick={handleStar}
        className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition hover:scale-110 duration-200 ${
          email.isStarred ? "text-amber-400" : "text-text-muted hover:text-text-secondary"
        }`}
      >
        <Star className="w-4 h-4" fill={email.isStarred ? "currentColor" : "none"} />
      </button>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-semibold font-sans flex-shrink-0 ${avatarColor}`}>
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate text-sm ${!email.isRead ? "text-text-primary font-bold" : "text-text-primary font-medium"}`}>
            {senderName}
          </span>
          <span className="text-[10px] text-text-muted flex-shrink-0 font-mono group-hover:hidden">
            {timeStr}
          </span>
          {/* Hover actions replace time */}
          <div className="hidden group-hover:flex items-center gap-0.5">
            <ActionBtn icon={Archive} label="Archive" shortcut="E" onClick={handleArchive} />
            <ActionBtn icon={Reply} label="Reply" shortcut="R" onClick={handleReply} />
            <ActionBtn icon={Trash2} label="Delete" shortcut="#" onClick={handleDelete} />
          </div>
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

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {email.isSensitive && <ShieldBadge types={email.sensitiveTypes} />}
        <PriorityBadge label={email.priorityLabel} score={email.priorityScore} />
      </div>
    </div>
  );
}
