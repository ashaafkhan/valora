"use client";

import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import CommandPalette from "@/components/shared/CommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";

/**
 * Valora — Dashboard Layout (Client)
 * Wraps all authenticated routes with sidebar, topbar, and command palette.
 * Auth check is handled by middleware / server component parent.
 */
export default function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const { isOpen, close, open } = useCommandPalette();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary theme-transition">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onOpenCommandPalette={open} />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
      <CommandPalette isOpen={isOpen} onClose={close} />
    </div>
  );
}
