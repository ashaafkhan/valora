"use client";

/**
 * Valora — Command Palette (Stage 7 / Stage 13)
 * ⌘K command bar — keyboard-first navigation and action launcher
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Mail,
  Calendar,
  Bot,
  Settings,
  Star,
  PenSquare,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";
import { useEmailStore } from "@/store/emailStore";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: "navigation" | "email" | "ai" | "settings";
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openCompose } = useEmailStore();

  const commands: Command[] = [
    // Navigation
    {
      id: "nav-inbox",
      label: "Go to Inbox",
      description: "Open your email inbox",
      icon: <Mail className="w-4 h-4" />,
      shortcut: "G I",
      action: () => { router.push("/inbox"); onClose(); },
      category: "navigation",
    },
    {
      id: "nav-calendar",
      label: "Go to Calendar",
      description: "Open Google Calendar view",
      icon: <Calendar className="w-4 h-4" />,
      shortcut: "G C",
      action: () => { router.push("/calendar"); onClose(); },
      category: "navigation",
    },
    {
      id: "nav-agent",
      label: "Open AI Agent",
      description: "Chat with Valora AI assistant",
      icon: <Bot className="w-4 h-4" />,
      shortcut: "G A",
      action: () => { router.push("/agent"); onClose(); },
      category: "navigation",
    },
    {
      id: "nav-settings",
      label: "Settings",
      description: "Manage your preferences",
      icon: <Settings className="w-4 h-4" />,
      shortcut: "G S",
      action: () => { router.push("/settings"); onClose(); },
      category: "navigation",
    },
    // Email actions
    {
      id: "email-compose",
      label: "Compose New Email",
      description: "Write a new email",
      icon: <PenSquare className="w-4 h-4" />,
      shortcut: "C",
      action: () => { openCompose(); onClose(); },
      category: "email",
    },
    {
      id: "email-urgent",
      label: "View Urgent Emails",
      description: "Filter to urgent priority only",
      icon: <Zap className="w-4 h-4 text-rose-400" />,
      action: () => {
        router.push("/inbox");
        useEmailStore.getState().setSection("urgent");
        onClose();
      },
      category: "email",
    },
    {
      id: "email-starred",
      label: "View Starred Emails",
      description: "Show only starred messages",
      icon: <Star className="w-4 h-4 text-amber-400" />,
      action: () => { router.push("/inbox"); onClose(); },
      category: "email",
    },
    {
      id: "email-archive",
      label: "Archive Selected",
      description: "Archive the currently selected email",
      icon: <Mail className="w-4 h-4" />,
      shortcut: "E",
      action: () => {
        const store = useEmailStore.getState();
        const id = store.selectedEmailId;
        if (id) store.archiveEmail(id);
        onClose();
      },
      category: "email",
    },
    {
      id: "email-markread",
      label: "Mark as Read/Unread",
      description: "Toggle read status of selected email",
      icon: <Mail className="w-4 h-4" />,
      shortcut: "R",
      action: () => {
        const store = useEmailStore.getState();
        const id = store.selectedEmailId;
        if (id) {
          const email = store.emails.find((e) => e.id === id);
          if (email) {
            if (email.isRead) store.markAsUnread(id);
            else store.markAsRead(id);
          }
        }
        onClose();
      },
      category: "email",
    },
    // Calendar actions
    {
      id: "cal-today",
      label: "Go to Today",
      description: "Jump to today in calendar",
      icon: <Calendar className="w-4 h-4 text-emerald-400" />,
      shortcut: "T",
      action: () => { router.push("/calendar"); onClose(); },
      category: "settings",
    },
    {
      id: "cal-week",
      label: "Week View",
      description: "Switch to week view",
      icon: <Calendar className="w-4 h-4" />,
      shortcut: "W",
      action: () => { router.push("/calendar"); onClose(); },
      category: "settings",
    },
    {
      id: "cal-event",
      label: "New Event",
      description: "Create a new calendar event",
      icon: <Calendar className="w-4 h-4 text-primary-light" />,
      shortcut: "N",
      action: () => { router.push("/calendar"); onClose(); },
      category: "settings",
    },
    // AI Agent commands
    {
      id: "agent-chat",
      label: "Open AI Agent",
      description: "Chat with Valora Copilot",
      icon: <Bot className="w-4 h-4 text-primary-light" />,
      shortcut: "G A",
      action: () => { router.push("/agent"); onClose(); },
      category: "ai",
    },
    {
      id: "agent-schedule",
      label: "Quick Schedule",
      description: "Use AI to schedule a meeting",
      icon: <Calendar className="w-4 h-4 text-primary-light" />,
      action: () => { router.push("/calendar"); onClose(); },
      category: "ai",
    },
  ];

  const filteredCommands = query.trim()
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Group by category
  const grouped = filteredCommands.reduce<Record<string, Command[]>>((acc, cmd) => {
    acc[cmd.category] ??= [];
    acc[cmd.category]!.push(cmd);
    return acc;
  }, {});

  const flatList = filteredCommands;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          flatList[selectedIndex]?.action();
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [isOpen, flatList, selectedIndex, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    email: "Email Actions",
    ai: "AI",
    settings: "Settings",
  };

  let globalIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-[580px] valora-glass rounded-2xl z-50 overflow-hidden animate-fade-in theme-transition valora-glow">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80 bg-background/25">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-text-primary placeholder-text-muted focus:ring-0"
          />
          <kbd className="text-[10px] text-text-muted font-mono bg-background border border-border px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto py-2 scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              No commands found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category} className="mb-1">
                <div className="px-4 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                  {categoryLabels[category] ?? category}
                </div>
                {cmds.map((cmd) => {
                  const idx = globalIndex++;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors theme-transition ${
                        isSelected
                          ? "bg-primary/15 text-text-primary border-l-[3px] border-l-primary pl-[13px]"
                          : "text-text-secondary hover:bg-surface-hover/50 pl-4"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 ${
                          isSelected ? "text-primary-light" : "text-text-muted"
                        }`}
                      >
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-text-secondary/80 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {cmd.shortcut.split(" ").map((k, i) => (
                            <kbd
                              key={i}
                              className="text-[10px] text-text-muted font-mono bg-background border border-border px-1.5 py-0.5 rounded"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      )}
                      {isSelected && (
                        <ArrowRight className="w-3.5 h-3.5 text-primary-light flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-border/80 flex items-center justify-between text-[10px] text-text-muted font-mono bg-background/25">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-background border border-border px-1 rounded">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-background border border-border px-1 rounded">↵</kbd> select
            </span>
          </div>
          <span className="flex items-center gap-1 text-primary-light font-bold">
            <Clock className="w-3 h-3" /> Valora Command Palette
          </span>
        </div>
      </div>
    </>
  );
}
