/**
 * Valora — Keyboard Shortcut Registry
 * Central registry for all keyboard shortcuts across the app
 */
import type { KeyboardShortcut } from "@/types";

// ── Shortcut Definitions (actions bound at runtime) ────────────
export const SHORTCUT_DEFINITIONS: Omit<KeyboardShortcut, "action">[] = [
  // Global
  { key: "k", modifier: "meta", description: "Open command palette", scope: "global" },
  { key: "k", modifier: "ctrl", description: "Open command palette", scope: "global" },
  { key: "/", description: "Focus search", scope: "global" },
  { key: "?", description: "Show keyboard shortcuts", scope: "global" },

  // Inbox
  { key: "c", description: "Compose new email", scope: "inbox" },
  { key: "e", description: "Archive selected email", scope: "inbox" },
  { key: "r", description: "Mark as read/unread", scope: "inbox" },
  { key: "*", description: "Star/unstar email", scope: "inbox" },
  { key: "#", description: "Delete email", scope: "inbox" },
  { key: "l", description: "Apply label", scope: "inbox" },
  { key: "u", description: "Unsubscribe from sender", scope: "inbox" },
  { key: "j", description: "Next email", scope: "inbox" },
  { key: "k", description: "Previous email", scope: "inbox" },
  { key: "Enter", description: "Open selected email", scope: "inbox" },
  { key: "Escape", description: "Close email / deselect", scope: "inbox" },
  { key: "x", description: "Select email", scope: "inbox" },
  { key: "*", modifier: "shift", description: "Select all emails", scope: "inbox" },

  // Compose
  { key: "Enter", modifier: "meta", description: "Send email", scope: "compose" },
  { key: "Enter", modifier: "ctrl", description: "Send email", scope: "compose" },
  { key: "d", modifier: "meta", description: "Save draft", scope: "compose" },
  { key: "Escape", description: "Close compose", scope: "compose" },

  // Calendar
  { key: "t", description: "Go to today", scope: "calendar" },
  { key: "d", description: "Day view", scope: "calendar" },
  { key: "w", description: "Week view", scope: "calendar" },
  { key: "m", description: "Month view", scope: "calendar" },
  { key: "n", description: "New event", scope: "calendar" },
  { key: "ArrowLeft", description: "Previous period", scope: "calendar" },
  { key: "ArrowRight", description: "Next period", scope: "calendar" },
];

// ── Helper: Format key display ─────────────────────────────────
export function formatShortcutKey(shortcut: Omit<KeyboardShortcut, "action">): string {
  const isMac =
    typeof navigator !== "undefined" && navigator.platform.includes("Mac");
  const parts: string[] = [];

  if (shortcut.modifier === "meta") parts.push(isMac ? "⌘" : "Ctrl");
  else if (shortcut.modifier === "ctrl") parts.push("Ctrl");
  else if (shortcut.modifier === "shift") parts.push("⇧");
  else if (shortcut.modifier === "alt") parts.push(isMac ? "⌥" : "Alt");

  const key = shortcut.key;
  if (key === "Enter") parts.push("↵");
  else if (key === "Escape") parts.push("Esc");
  else if (key === "ArrowLeft") parts.push("←");
  else if (key === "ArrowRight") parts.push("→");
  else parts.push(key.toUpperCase());

  return parts.join("");
}

// ── Shortcut Matching ──────────────────────────────────────────
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: { key: string; modifier?: string },
): boolean {
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return false;

  if (shortcut.modifier === "meta" && !event.metaKey && !event.ctrlKey)
    return false;
  if (shortcut.modifier === "ctrl" && !event.ctrlKey) return false;
  if (shortcut.modifier === "shift" && !event.shiftKey) return false;
  if (shortcut.modifier === "alt" && !event.altKey) return false;

  // Ensure no unexpected modifiers
  if (!shortcut.modifier) {
    if (event.metaKey || event.ctrlKey || event.altKey) return false;
  }

  return true;
}

// ── Input Guard — don't fire shortcuts when typing ─────────────
export function isTypingInInput(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.contentEditable === "true" ||
    target.isContentEditable
  );
}
