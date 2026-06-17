"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import CommandPalette from "@/components/shared/CommandPalette";
import ShortcutCheatSheet from "@/components/shared/ShortcutCheatSheet";
import { useCommandPalette } from "@/hooks/useCommandPalette";

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
  const { isOpen: paletteOpen, close: closePalette, open: openPalette } = useCommandPalette();
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [navChord, setNavChord] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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
          setComposeOpen(true);
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

      {/* Global compose modal placeholder — will be triggered by sidebar or keyboard */}
      {composeOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setComposeOpen(false); }}
        >
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">New Message</h2>
              <button
                onClick={() => setComposeOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "To", placeholder: "recipient@example.com", type: "email" },
                { label: "Subject", placeholder: "Subject", type: "text" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 border-b border-border pb-3">
                  <span className="text-xs text-text-muted w-14 flex-shrink-0">{f.label}</span>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
                  />
                </div>
              ))}
              <div>
                <textarea
                  placeholder="Write your message..."
                  rows={8}
                  className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted outline-none resize-none leading-relaxed"
                />
              </div>
              {/* AI Toolbar */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">AI:</span>
                {["Improve Tone", "Fix Grammar", "Make Shorter", "Make Formal"].map(action => (
                  <button
                    key={action}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-text-secondary hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-hover/50">
              <div className="flex items-center gap-2">
                <button className="text-xs text-text-muted hover:text-text-primary transition-colors">Discard</button>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors">
                  Save Draft
                </button>
                <button className="text-xs px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium flex items-center gap-1.5 shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
