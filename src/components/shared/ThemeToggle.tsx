"use client";

/**
 * Valora — Theme Toggle (Stage 7 / Stage 10)
 * Toggles between dark and light mode using next-themes
 */
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-xl bg-surface border border-border ${className}`} />
    );
  }

  const isDark = theme === "dark" || (!theme && document.documentElement.classList.contains("dark"));

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
