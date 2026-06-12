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
  Archive,
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
    if (!acc[cmd.category]) acc[cmd.category] = [];
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-[580px] bg-[#111111] border border-[#333333] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-fade-in-scale">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#222222]">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-zinc-100 placeholder-zinc-600 focus:ring-0"
          />
          <kbd className="text-[10px] text-zinc-600 font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto py-2 scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">
              No commands found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category} className="mb-1">
                <div className="px-4 py-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
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
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                        isSelected
                          ? "bg-[#1C1640] text-white"
                          : "text-zinc-300 hover:bg-zinc-900/50"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 ${
                          isSelected ? "text-[#A855F7]" : "text-zinc-500"
                        }`}
                      >
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-zinc-500 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {cmd.shortcut.split(" ").map((k, i) => (
                            <kbd
                              key={i}
                              className="text-[10px] text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      )}
                      {isSelected && (
                        <ArrowRight className="w-3.5 h-3.5 text-[#A855F7] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-[#222222] flex items-center justify-between text-[10px] text-zinc-600 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded">↵</kbd> select
            </span>
          </div>
          <span className="flex items-center gap-1 text-[#7C3AED]">
            <Clock className="w-3 h-3" /> Valora Command Palette
          </span>
        </div>
      </div>
    </>
  );
}
