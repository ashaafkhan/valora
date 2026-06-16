"use client";

import type { Email, PriorityLabel } from "@/types";
import { useEmailStore } from "@/store/emailStore";
import EmailRow from "./EmailRow";
import { motion } from "framer-motion";
import { Mail, RefreshCw, Archive, Eye, CheckSquare, Square, Trash, Sparkles, Inbox } from "lucide-react";
import { useState } from "react";
import { fadeIn } from "@/lib/motion";

interface EmailListProps {
  emails: Email[];
  focusedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
  onToggleStar: (id: string) => void;
  onSync: () => void;
  isSyncing: boolean;
}

type SectionTab = "all" | PriorityLabel;

export default function EmailList({
  emails,
  focusedEmailId,
  onSelectEmail,
  onToggleStar,
  onSync,
  isSyncing,
}: EmailListProps) {
  const {
    activeSection,
    setSection,
    selectedEmailIds,
    toggleEmailSelection,
    selectAllEmails,
    clearSelection,
    bulkArchive,
    bulkMarkRead,
    bulkDelete,
  } = useEmailStore();

  const [searchFocused, setSearchFocused] = useState(false);

  // Tabs config
  const sections: Array<{ label: string; value: SectionTab; dotColor?: string }> = [
    { label: "All", value: "all" },
    { label: "Urgent", value: "urgent", dotColor: "bg-rose-500" },
    { label: "High", value: "high", dotColor: "bg-amber-500" },
    { label: "Normal", value: "normal", dotColor: "bg-zinc-600" },
    { label: "Low", value: "low", dotColor: "bg-zinc-800" },
  ];

  // Helper counts
  const getSectionCount = (section: SectionTab) => {
    if (section === "all") return emails.length;
    return emails.filter((e) => e.priorityLabel === section).length;
  };

  const isAllSelected =
    emails.length > 0 && selectedEmailIds.size === emails.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllEmails();
    }
  };

  function EmailSkeleton() {
    return (
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
            <div className="skeleton w-3.5 h-3.5 rounded" />
            <div className="skeleton w-5 h-5 rounded" />
            <div className="skeleton w-9 h-9 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-1/3 rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
            <div className="skeleton h-3 w-12 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const isLoading = isSyncing && emails.length === 0;

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border w-full md:w-[440px] flex-shrink-0 theme-transition">
      {/* Search and Top Info bar */}
      <div className="p-4 border-b border-border/60 bg-background/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckSquare
            onClick={handleToggleSelectAll}
            className={`w-4 h-4 cursor-pointer hover:text-text-primary transition-colors ${
              isAllSelected ? "text-primary" : "text-text-muted"
            }`}
          />
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="text-text-muted hover:text-text-primary transition disabled:opacity-40"
            title="Sync Gmail inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>

        {/* Brand label */}
        <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary-light" />
          Inbox Engine
        </span>
      </div>

      {/* Priority Navigation Tabs */}
      <div className="flex items-center px-2 py-1 bg-background/50 border-b border-border/50 overflow-x-auto gap-0.5 scrollbar-none">
        {sections.map((sec) => {
          const isActive = activeSection === sec.value;
          const count = getSectionCount(sec.value);

          return (
            <button
              key={sec.value}
              onClick={() => setSection(sec.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 flex-shrink-0
                ${
                  isActive
                    ? "bg-surface text-text-primary border border-border/80 shadow-sm valora-glow"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover/55 border border-transparent"
                }`}
            >
              {sec.dotColor && (
                <span className={`w-1.5 h-1.5 rounded-full ${sec.dotColor}`} />
              )}
              {sec.label}
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                isActive ? "bg-surface-hover border border-border/30 text-text-primary" : "bg-transparent text-text-muted"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk Action Panel (slides in if items selected) */}
      {selectedEmailIds.size > 0 && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-xs animate-slide-up">
          <div className="text-text-primary flex items-center gap-1 font-mono">
            <span className="font-bold text-primary-light">{selectedEmailIds.size}</span> selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkMarkRead()}
              className="px-2.5 py-1 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-lg flex items-center gap-1.5 transition theme-transition"
            >
              <Eye className="w-3 h-3" /> Mark Read
            </button>
            <button
              onClick={() => bulkArchive()}
              className="px-2.5 py-1 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-lg flex items-center gap-1.5 transition theme-transition"
            >
              <Archive className="w-3 h-3" /> Archive
            </button>
            <button
              onClick={() => bulkDelete()}
              className="px-2.5 py-1 bg-error/10 hover:bg-error/20 border border-error/20 text-error rounded-lg flex items-center gap-1.5 transition theme-transition"
            >
              <Trash className="w-3 h-3" /> Delete
            </button>
            <button
              onClick={() => clearSelection()}
              className="text-text-secondary hover:text-text-primary font-medium px-2 py-1 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Email List container */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 scrollbar-thin">
        {isLoading ? (
          <EmailSkeleton />
        ) : emails.length === 0 ? (
          <motion.div {...fadeIn} className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.1)]">
              <Inbox className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">You&apos;re all caught up!</p>
              <p className="text-sm text-text-secondary mt-1 max-w-xs">
                No emails in this section. Use CoPilot to draft your next message or sync to check for new mail.
              </p>
            </div>
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/20 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              Sync now
            </button>
          </motion.div>
        ) : (
          emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              isSelected={selectedEmailIds.has(email.id)}
              isFocused={focusedEmailId === email.id}
              onToggleSelect={(id) => toggleEmailSelection(id)}
              onToggleStar={(id) => onToggleStar(id)}
              onClick={() => onSelectEmail(email)}
            />
          ))
        )}
      </div>
    </div>
  );
}
