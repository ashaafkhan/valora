"use client";

import { useEffect, useCallback, useState } from "react";
import { SHORTCUT_DEFINITIONS, formatShortcutKey } from "@/lib/shortcuts";
import { Keyboard } from "lucide-react";

interface ShortcutCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutCheatSheet({ isOpen, onClose }: ShortcutCheatSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
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

  const grouped = SHORTCUT_DEFINITIONS.reduce<Record<string, typeof SHORTCUT_DEFINITIONS>>(
    (acc, s) => {
      const scope = s.scope ?? "global";
      acc[scope] ??= [];
      acc[scope]!.push(s);
      return acc;
    },
    {},
  );

  const scopeLabels: Record<string, string> = {
    global: "Global",
    inbox: "Inbox",
    compose: "Compose",
    calendar: "Calendar",
  };

  const scopeOrder = ["global", "inbox", "compose", "calendar"];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50" onClick={onClose} />
      <div className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-[640px] max-h-[65vh] valora-glass rounded-2xl z-50 overflow-hidden animate-fade-in theme-transition valora-glow">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-background/25">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-primary-light" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Keyboard Shortcuts</h2>
              <p className="text-[10px] text-text-muted">Press <kbd className="px-1 py-0.5 rounded bg-background border border-border text-[9px] font-mono">ESC</kbd> to close</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(65vh-70px)] py-2 scrollbar-thin">
          {scopeOrder.map((scope) => {
            const cmds = grouped[scope];
            if (!cmds?.length) return null;
            return (
              <div key={scope} className="mb-1">
                <div className="px-5 py-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                  {scopeLabels[scope] ?? scope}
                </div>
                {cmds.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-5 py-2 hover:bg-surface-hover/50 transition"
                  >
                    <span className="text-xs text-text-primary">{cmd.description}</span>
                    <kbd className="text-[10px] text-text-muted font-mono bg-background border border-border px-2 py-0.5 rounded">
                      {formatShortcutKey(cmd)}
                    </kbd>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-border/80 bg-background/25">
          <p className="text-[9px] text-text-muted font-mono text-center">
            Valora — Keyboard-first email &amp; calendar command center
          </p>
        </div>
      </div>
    </>
  );
}
