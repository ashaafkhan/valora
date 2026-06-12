"use client";

/**
 * Valora — Search Bar (Stage 7)
 * Inline search with keyboard shortcut hint and query dispatch
 */
import { useRef, useEffect, useState } from "react";
import { Search, X, Command } from "lucide-react";
import { useEmailStore } from "@/store/emailStore";

interface SearchBarProps {
  onOpenCommandPalette?: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  onOpenCommandPalette,
  placeholder = "Search emails...",
  className = "",
}: SearchBarProps) {
  const { searchQuery, setSearchQuery } = useEmailStore();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (["input", "textarea"].includes(tag)) return;
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        if (e.key === "k" && onOpenCommandPalette) {
          onOpenCommandPalette();
        } else {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenCommandPalette]);

  return (
    <div
      className={`relative flex items-center gap-2 rounded-xl border transition-all duration-200 ${
        isFocused
          ? "border-[#7C3AED]/50 bg-[#111111] shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
          : "border-[#222222] bg-[#0F0F0F] hover:border-[#333333]"
      } ${className}`}
    >
      <Search
        className={`w-3.5 h-3.5 ml-3 flex-shrink-0 transition-colors ${
          isFocused ? "text-[#A855F7]" : "text-zinc-600"
        }`}
      />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 outline-none py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:ring-0 min-w-0"
      />
      {searchQuery ? (
        <button
          onClick={() => setSearchQuery("")}
          className="mr-2 p-0.5 rounded-md text-zinc-500 hover:text-zinc-300 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="mr-2 flex items-center gap-0.5 text-zinc-700 flex-shrink-0">
          <kbd className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded">
            /
          </kbd>
        </div>
      )}
    </div>
  );
}
