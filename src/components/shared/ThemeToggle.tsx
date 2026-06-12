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
      <div className={`w-8 h-8 rounded-xl bg-surface border border-border ${className}`} />
    );
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`w-8 h-8 rounded-xl border border-border bg-surface hover:bg-surface-hover flex items-center justify-center transition-all active:scale-90 hover:border-primary/50 duration-300 theme-transition ${className}`}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-text-secondary hover:text-amber-400 transition-all duration-300 transform hover:rotate-45" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-text-secondary hover:text-primary-light transition-all duration-300 transform hover:-rotate-12" />
      )}
    </button>
  );
}
