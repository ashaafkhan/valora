"use client";

import type { Email, PriorityLabel } from "@/types";
import { useEmailStore } from "@/store/emailStore";
import EmailRow from "./EmailRow";
import { Mail, RefreshCw, Archive, Eye, CheckSquare, Square, Trash, Sparkles } from "lucide-react";
import { useState } from "react";

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

  return (
    <div className="flex flex-col h-full bg-[#0E0E0E] border-r border-[#222222]/80 w-full md:w-[440px] flex-shrink-0">
      {/* Search and Top Info bar */}
      <div className="p-4 border-b border-[#222222]/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckSquare
            onClick={handleToggleSelectAll}
            className={`w-4 h-4 cursor-pointer hover:text-zinc-300 ${
              isAllSelected ? "text-[#7C3AED]" : "text-zinc-600"
            }`}
          />
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="text-zinc-500 hover:text-zinc-300 transition disabled:opacity-40"
            title="Sync Gmail inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#7C3AED]" : ""}`} />
          </button>
        </div>

        {/* Brand label */}
        <span className="text-[10px] font-mono tracking-widest text-[#7C3AED] uppercase font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#A855F7]" />
          Inbox Engine
        </span>
      </div>

      {/* Priority Navigation Tabs */}
      <div className="flex items-center px-2 py-1 bg-[#0A0A0A] border-b border-[#222222]/50 overflow-x-auto gap-0.5 scrollbar-none">
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
                    ? "bg-[#111111] text-white border border-[#222222]/80"
                    : "text-[#888888] hover:text-zinc-300 hover:bg-zinc-900/30 border border-transparent"
                }`}
            >
              {sec.dotColor && (
                <span className={`w-1.5 h-1.5 rounded-full ${sec.dotColor}`} />
              )}
              {sec.label}
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                isActive ? "bg-zinc-800 text-zinc-300" : "bg-transparent text-zinc-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk Action Panel (slides in if items selected) */}
      {selectedEmailIds.size > 0 && (
        <div className="px-4 py-2 bg-[#1C1640]/40 border-b border-[#7C3AED]/20 flex items-center justify-between text-xs animate-slide-up">
          <div className="text-zinc-300 flex items-center gap-1 font-mono">
            <span className="font-bold text-[#A855F7]">{selectedEmailIds.size}</span> selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkMarkRead()}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1.5 transition"
            >
              <Eye className="w-3 h-3" /> Mark Read
            </button>
            <button
              onClick={() => bulkArchive()}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1.5 transition"
            >
              <Archive className="w-3 h-3" /> Archive
            </button>
            <button
              onClick={() => clearSelection()}
              className="text-zinc-500 hover:text-zinc-300 font-medium px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Email List container */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222222]/30 scrollbar-thin">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-600">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-300">All caught up!</p>
              <p className="text-xs text-zinc-500 mt-1">
                No emails in this section. Press Sync to refresh.
              </p>
            </div>
          </div>
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
