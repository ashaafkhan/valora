"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import CommandPalette from "@/components/shared/CommandPalette";
import ShortcutCheatSheet from "@/components/shared/ShortcutCheatSheet";
import { useCommandPalette } from "@/hooks/useCommandPalette";

/**
 * Valora — Dashboard Layout (Client)
 * Wraps all authenticated routes with sidebar, topbar, command palette, and cheat sheet.
 * Handles global keyboard shortcuts: ?, navigation chords (g i, g c, g a, g s).
 */
export default function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const { isOpen: paletteOpen, close: closePalette, open: openPalette } = useCommandPalette();
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [navChord, setNavChord] = useState<string | null>(null);
  const router = useRouter();

  // Navigation chords (g i, g c, g a, g s)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;

      if (navChord === "g") {
        setNavChord(null);
        switch (e.key.toLowerCase()) {
          case "i": e.preventDefault(); router.push("/inbox"); break;
          case "c": e.preventDefault(); router.push("/calendar"); break;
          case "a": e.preventDefault(); router.push("/agent"); break;
          case "s": e.preventDefault(); router.push("/settings"); break;
        }
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCheatSheetOpen((v) => !v);
        return;
      }

      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setNavChord("g");
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navChord, router]);

  // Reset chord on blur
  useEffect(() => {
    const onBlur = () => setNavChord(null);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  // Reset chord after timeout
  useEffect(() => {
    if (!navChord) return;
    const timer = setTimeout(() => setNavChord(null), 1000);
    return () => clearTimeout(timer);
  }, [navChord]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary theme-transition">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onOpenCommandPalette={openPalette} />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
      <CommandPalette isOpen={paletteOpen} onClose={closePalette} />
      <ShortcutCheatSheet isOpen={cheatSheetOpen} onClose={() => setCheatSheetOpen(false)} />
    </div>
  );
}
