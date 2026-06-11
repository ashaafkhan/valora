/**
 * Valora — useKeyboard hook
 * Registers and manages keyboard shortcuts
 */
"use client";

import { useEffect, useCallback } from "react";
import { matchesShortcut, isTypingInInput } from "@/lib/shortcuts";
import type { KeyboardShortcut } from "@/types";

/**
 * Register a keyboard shortcut that fires `action` when the key combo is pressed.
 * Automatically removed on component unmount.
 */
export function useKeyboard(
  shortcut: Omit<KeyboardShortcut, "action">,
  action: () => void,
  options?: {
    enabled?: boolean;
    allowInInput?: boolean;
  },
) {
  const { enabled = true, allowInInput = false } = options ?? {};

  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (!allowInInput && isTypingInInput(event)) return;
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        action();
      }
    },
    [enabled, allowInInput, shortcut, action],
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}

/**
 * Register multiple shortcuts at once.
 */
export function useKeyboardShortcuts(
  shortcuts: Array<{ shortcut: Omit<KeyboardShortcut, "action">; action: () => void }>,
  options?: { enabled?: boolean },
) {
  const { enabled = true } = options ?? {};

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (isTypingInInput(event)) return;
      for (const { shortcut, action } of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();
          action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, enabled]);
}
