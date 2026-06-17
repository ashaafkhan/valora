"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import CommandPalette from "@/components/shared/CommandPalette";
import ShortcutCheatSheet from "@/components/shared/ShortcutCheatSheet";
import ComposeModal from "@/components/inbox/ComposeModal";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useEmailStore } from "@/store/emailStore";
import { toast } from "sonner";
import { api } from "@/trpc/react";

/**
 * Valora — Dashboard Layout (Client)
 * Wraps all authenticated routes with sidebar, command palette, and cheat sheet.
 * Handles global keyboard shortcuts: ?, navigation chords (g i, g c, g a, g s, g d, g b).
 * Compose modal is globally available from sidebar button or `C` key.
 */
export default function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const { toggleCommandPalette, closePalette, isOpen: paletteOpen } = useCommandPalette();
  const { openCompose } = useEmailStore();
  const [navChord, setNavChord] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { data: connStatus } = api.gmail.getConnectionStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // ── Default light theme on first load ──────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("valora-theme");
    const theme = stored ?? "light";
    const html = document.documentElement;

    if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.setAttribute("data-theme", "light");
      html.classList.add("light");
      html.classList.remove("dark");
    }
  }, []);

  // ── Global keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isEditable = (e.target as HTMLElement).isContentEditable;
      if (["input", "textarea", "select"].includes(tag) || isEditable) return;

      // Handle `g *` navigation chords
      if (navChord === "g") {
        setNavChord(null);
        switch (e.key.toLowerCase()) {
          case "i": e.preventDefault(); router.push("/inbox"); break;
          case "c": e.preventDefault(); router.push("/calendar"); break;
          case "a": e.preventDefault(); router.push("/zara"); break;
          case "s": e.preventDefault(); router.push("/settings"); break;
          case "d": e.preventDefault(); router.push("/digest"); break;
          case "b": e.preventDefault(); router.push("/billing"); break;
        }
        return;
      }

      // ? → cheat sheet
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCheatSheetOpen((v) => !v);
        return;
      }

      // Ctrl+K / Cmd+K → command palette
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openPalette();
        return;
      }

      // c → compose (only when not in Zara or Calendar)
      if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!pathname.startsWith("/calendar") && !pathname.startsWith("/zara")) {
          e.preventDefault();
          openCompose();
          return;
        }
      }

      // g → start nav chord
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setNavChord("g");
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navChord, router, pathname, openPalette]);

  // Reset chord on blur or timeout
  useEffect(() => {
    const onBlur = () => setNavChord(null);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  useEffect(() => {
    if (!navChord) return;
    const timer = setTimeout(() => setNavChord(null), 1000);
    return () => clearTimeout(timer);
  }, [navChord]);

  // Tab title
  useEffect(() => {
    const pageNames: Record<string, string> = {
      "/inbox": "Inbox",
      "/calendar": "Calendar",
      "/zara": "Zara",
      "/digest": "Digest",
      "/billing": "Billing",
      "/settings": "Settings",
    };
    const match = Object.entries(pageNames).find(([key]) => pathname.startsWith(key));
    document.title = match ? `${match[1]} | Valora` : "Valora";
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary theme-transition">
      <Sidebar
        user={user}
        onCompose={() => setComposeOpen(true)}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
      <CommandPalette isOpen={paletteOpen} onClose={closePalette} />
      <ShortcutCheatSheet isOpen={cheatSheetOpen} onClose={() => setCheatSheetOpen(false)} />

      {/* Global compose modal */}
      <ComposeModal />
    </div>
  );
}
