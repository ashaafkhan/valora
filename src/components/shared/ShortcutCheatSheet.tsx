"use client";

import { useEffect, useCallback } from "react";
import { Keyboard, X } from "lucide-react";

interface ShortcutCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEFT_SHORTCUTS = [
  {
    group: "Global",
    items: [
      { keys: ["Ctrl", "K"], desc: "Open command palette" },
      { keys: ["?"], desc: "Show shortcuts" },
      { keys: ["G", "I"], desc: "Go to Inbox" },
      { keys: ["G", "C"], desc: "Go to Calendar" },
      { keys: ["G", "A"], desc: "Go to Zara" },
      { keys: ["G", "D"], desc: "Go to Digest" },
      { keys: ["G", "S"], desc: "Go to Settings" },
      { keys: ["G", "B"], desc: "Go to Billing" },
    ],
  },
  {
    group: "Inbox",
    items: [
      { keys: ["C"], desc: "Compose new email" },
      { keys: ["E"], desc: "Archive email" },
      { keys: ["R"], desc: "Toggle read/unread" },
      { keys: ["*"], desc: "Star/unstar" },
      { keys: ["J"], desc: "Next email" },
      { keys: ["K"], desc: "Previous email" },
      { keys: ["X"], desc: "Select email" },
      { keys: ["Enter"], desc: "Open selected email" },
      { keys: ["Esc"], desc: "Close / deselect" },
    ],
  },
];

const RIGHT_SHORTCUTS = [
  {
    group: "Compose",
    items: [
      { keys: ["Ctrl", "↵"], desc: "Send email" },
      { keys: ["Tab"], desc: "Accept AI autocomplete" },
      { keys: ["Esc"], desc: "Close compose" },
    ],
  },
  {
    group: "Calendar",
    items: [
      { keys: ["T"], desc: "Go to today" },
      { keys: ["D"], desc: "Day view" },
      { keys: ["W"], desc: "Week view" },
      { keys: ["M"], desc: "Month view" },
      { keys: ["N"], desc: "New event" },
      { keys: ["←"], desc: "Previous period" },
      { keys: ["→"], desc: "Next period" },
    ],
  },
  {
    group: "Zara",
    items: [
      { keys: ["Ctrl", "/"], desc: "New chat session" },
    ],
  },
];

function ShortcutRow({ keys, desc }: { keys: string[]; desc: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-1 rounded-lg hover:bg-surface-hover/60 transition-colors">
      <span className="text-xs text-text-secondary">{desc}</span>
      <div className="flex items-center gap-1 ml-4">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="text-[10px] font-mono text-text-muted bg-background border border-border px-1.5 py-0.5 rounded min-w-[22px] text-center shadow-sm"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function ShortcutGroup({ group, items }: { group: string; items: { keys: string[]; desc: string }[] }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 px-1">
        {group}
      </p>
      {items.map((item, i) => (
        <ShortcutRow key={i} keys={item.keys} desc={item.desc} />
      ))}
    </div>
  );
}

export default function ShortcutCheatSheet({ isOpen, onClose }: ShortcutCheatSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-[800px] max-h-[78vh] bg-surface border border-border rounded-2xl z-50 overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-hover/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Keyboard Shortcuts</h2>
              <p className="text-[10px] text-text-muted">
                Press <kbd className="px-1 py-0.5 rounded bg-background border border-border text-[9px] font-mono">ESC</kbd> to close
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-0 overflow-y-auto max-h-[calc(78vh-70px)]">
          {/* Left column */}
          <div className="p-5 border-r border-border">
            {LEFT_SHORTCUTS.map((group) => (
              <ShortcutGroup key={group.group} group={group.group} items={group.items} />
            ))}
          </div>

          {/* Right column */}
          <div className="p-5">
            {RIGHT_SHORTCUTS.map((group) => (
              <ShortcutGroup key={group.group} group={group.group} items={group.items} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-hover/30">
          <p className="text-[10px] text-text-muted font-mono text-center">
            Valora — Keyboard-first email & calendar command center
          </p>
        </div>
      </div>
    </>
  );
}
