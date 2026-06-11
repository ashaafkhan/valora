"use client";

import { useEmailStore } from "@/store/emailStore";
import { Search, Plus, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

export default function TopBar() {
  const { searchQuery, setSearchQuery, openCompose } = useEmailStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search box on [/] keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        // Prevent key input in search box when focusing
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-14 border-b border-[#222222]/80 bg-[#0A0A0A]/40 backdrop-blur flex items-center justify-between px-6 gap-6 flex-shrink-0 select-none">
      {/* Search Input Box */}
      <div className="flex-1 max-w-xl relative flex items-center group">
        <Search className="absolute left-3.5 w-4 h-4 text-zinc-500 group-focus-within:text-[#7C3AED] transition-colors pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search mail and attachments..."
          className="w-full pl-10 pr-12 py-1.5 bg-zinc-900/35 hover:bg-zinc-900/50 focus:bg-zinc-950 border border-zinc-800/80 focus:border-[#7C3AED]/50 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:ring-1 focus:ring-[#7C3AED]/10"
        />
        {/* Hotkey hint inside search box */}
        <kbd className="absolute right-3.5 px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-zinc-500 rounded pointer-events-none group-focus-within:hidden select-none">
          /
        </kbd>
      </div>

      {/* Compose Button Trigger */}
      <button
        onClick={() => openCompose()}
        className="px-4 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow shadow-[#7C3AED]/20 active:scale-95"
      >
        <Plus className="w-3.5 h-3.5" />
        Compose
      </button>
    </header>
  );
}
