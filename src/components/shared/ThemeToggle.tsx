"use client";

/**
 * Valora — Theme Toggle (Stage 7 / Stage 10)
 * Toggles between dark and light mode using next-themes
 */
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read from localStorage or default to dark
    const stored = localStorage.getItem("valora-theme");
    setIsDark(stored !== "light");
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("valora-theme", next ? "dark" : "light");
    // Apply to root element
    document.documentElement.classList.toggle("light", !next);
    document.documentElement.classList.toggle("dark", next);
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 ${className}`} />
    );
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`w-8 h-8 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-all hover:border-zinc-700 ${className}`}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-zinc-400 hover:text-amber-400 transition-colors" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-zinc-400 hover:text-[#A855F7] transition-colors" />
      )}
    </button>
  );
}
