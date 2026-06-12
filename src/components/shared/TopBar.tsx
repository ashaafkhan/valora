"use client";

import { useEmailStore } from "@/store/emailStore";
import { Search, Plus, Command } from "lucide-react";
import { useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

interface TopBarProps {
  onOpenCommandPalette?: () => void;
}

export default function TopBar({ onOpenCommandPalette }: TopBarProps) {
  const { searchQuery, setSearchQuery, openCompose } = useEmailStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search box on [/] keypress, ⌘K opens command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenCommandPalette]);

  return (
    <header className="h-14 border-b border-border/80 bg-background/40 backdrop-blur flex items-center justify-between px-6 gap-6 flex-shrink-0 select-none theme-transition">
      {/* Search Input Box */}
      <div className="flex-1 max-w-xl relative flex items-center group">
        <Search className="absolute left-3.5 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search mail and attachments..."
          className="w-full pl-10 pr-12 py-1.5 bg-surface/35 hover:bg-surface/50 focus:bg-surface border border-border focus:border-primary/50 rounded-xl text-xs text-text-primary placeholder-text-muted outline-none transition focus:ring-1 focus:ring-primary/10 theme-transition"
        />
        {/* Hotkey hint inside search box */}
        <kbd className="absolute right-3.5 px-1.5 py-0.5 bg-background border border-border text-[9px] font-mono text-text-muted rounded pointer-events-none group-focus-within:hidden select-none">
          /
        </kbd>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* ⌘K Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          title="Open Command Palette (⌘K)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface/60 hover:bg-surface border border-border rounded-xl text-xs text-text-muted hover:text-text-primary transition theme-transition"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono text-[10px]">⌘K</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Compose Button Trigger */}
        <button
          onClick={() => openCompose()}
          className="px-4 py-1.5 bg-primary hover:bg-primary-light text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow shadow-primary/20 active:scale-95 theme-transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Compose
        </button>
      </div>
    </header>
  );
}
