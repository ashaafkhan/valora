"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Star, Send, FileText, Trash2, Mail,
  Zap, Calendar, Settings, LogOut, Plus,
  CreditCard, ChevronLeft, ChevronRight, Sparkles, Rss, Keyboard
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import ShortcutCheatSheet from "./ShortcutCheatSheet";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onCompose?: () => void;
}

// ── Zara Avatar ─────────────────────────────────────────────────
function ZaraAvatar({ size = 24 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white overflow-hidden border border-border"
      style={{
        width: size,
        height: size,
      }}
    >
      <img src="/robot.webp" alt="Zara AI" className="w-full h-full object-cover" />
    </div>
  );
}

// ── Nav Section ──────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType | (() => React.ReactNode);
  shortcut?: string;
  badge?: string | number;
  isNew?: boolean;
  isCustomIcon?: boolean;
}

const MAIL_NAV: NavItem[] = [
  { label: "Inbox", href: "/inbox", icon: Inbox, shortcut: "I" },
  { label: "Starred", href: "/inbox?tab=starred", icon: Star, shortcut: "*" },
  { label: "Sent", href: "/inbox?tab=sent", icon: Send },
  { label: "Drafts", href: "/inbox?tab=drafts", icon: FileText },
  { label: "Trash", href: "/inbox?tab=trash", icon: Trash2 },
];

const TOOLS_NAV: NavItem[] = [
  { label: "Calendar", href: "/calendar", icon: Calendar, shortcut: "C" },
];

const APP_NAV: NavItem[] = [
  { label: "Zara AI", href: "/zara", icon: Sparkles, shortcut: "A", isNew: true },
  { label: "Digest", href: "/digest", icon: Zap, shortcut: "D" },
];

const ACCOUNT_NAV: NavItem[] = [
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ user, onCompose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [zaraVisited, setZaraVisited] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    // Check if Zara has been visited before
    const visited = localStorage.getItem("valora-zara-visited");
    setZaraVisited(!!visited);
    if (pathname === "/zara" && !visited) {
      localStorage.setItem("valora-zara-visited", "true");
      setZaraVisited(true);
    }
  }, [pathname]);

  const isActive = (href: string) => {
    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

    if (href === "/inbox") return currentUrl === "/inbox";
    if (href.includes("?")) return currentUrl === href;
    return pathname.startsWith(href);
  };

  const sidebarWidth = collapsed ? 64 : 220;

  function NavLink({ item }: { item: NavItem }) {
    const active = isActive(item.href);
    const Icon = item.icon as React.ElementType;
    const isZara = item.href === "/zara";

    return (
      <motion.div whileHover={{ x: collapsed ? 0 : 2 }} transition={{ duration: 0.12 }}>
        <Link
          href={item.href}
          title={collapsed ? item.label : undefined}
          className={`relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 group
            ${active
              ? "bg-primary/10 border-l-2 border-primary text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border-l-2 border-transparent"
            }`}
        >
          {isZara ? (
            <ZaraAvatar size={16} />
          ) : (
            <Icon className={`flex-shrink-0 ${active ? "text-primary" : ""}`} style={{ width: 16, height: 16 }} />
          )}

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-sm whitespace-nowrap flex-1 overflow-hidden"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {!collapsed && item.isNew && !zaraVisited && (
            <span className="ml-auto text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          )}

          {!collapsed && item.badge && (
            <span className="ml-auto text-[10px] font-bold bg-primary text-white min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
              {item.badge}
            </span>
          )}

          {!collapsed && item.shortcut && !item.badge && !item.isNew && (
            <kbd className="ml-auto text-[10px] font-mono text-text-muted bg-surface-hover border border-border rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.shortcut}
            </kbd>
          )}
        </Link>
      </motion.div>
    );
  }

  function NavSection({ items, label }: { items: NavItem[]; label?: string }) {
    return (
      <div className="space-y-0.5">
        {label && !collapsed && (
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 py-1.5">
            {label}
          </p>
        )}
        {items.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </div>
    );
  }

  return (
    <motion.aside
      className="h-screen bg-surface border-r border-border flex flex-col flex-shrink-0 select-none overflow-hidden theme-transition relative z-20"
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Brand header */}
      <div className="flex items-center gap-2.5 px-3 h-14 border-b border-border/60 flex-shrink-0 overflow-hidden">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src="/valora_logo.png"
              alt="Valora"
              fill
              className="object-contain logo-adaptive"
            />
          </div>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-bold tracking-tight text-text-primary font-sora">Valora</span>
              <span className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold opacity-80">
                Command Center
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`ml-auto w-6 h-6 rounded-lg border border-border bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-border transition-all flex-shrink-0 ${collapsed ? "mx-auto" : ""}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Compose button */}
      <div className="px-2.5 pt-3 pb-2 flex-shrink-0">
        <button
          onClick={onCompose}
          title={collapsed ? "Compose (C)" : undefined}
          className={`w-full flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl py-2 font-medium transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.98] ${collapsed ? "justify-center px-2" : "px-3"}`}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-sm whitespace-nowrap"
              >
                Compose
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2.5 py-1 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <NavSection items={MAIL_NAV} />
        <div className="border-t border-border/60 pt-3">
          <NavSection items={TOOLS_NAV} />
        </div>
        <div className="border-t border-border/60 pt-3">
          <NavSection items={APP_NAV} />
        </div>
        <div className="border-t border-border/60 pt-3">
          <NavSection items={ACCOUNT_NAV} />
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-border/60 p-2.5 flex-shrink-0">
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/15 to-indigo-500/15 flex items-center justify-center flex-shrink-0 border border-primary/15">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-primary">
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 flex-1"
              >
                <div className="text-sm font-medium text-text-primary truncate leading-none">
                  {user.name ?? "User"}
                </div>
                <div className="text-[10px] text-text-muted truncate mt-0.5 leading-none font-mono">
                  {user.email}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center justify-between px-1"
            >
              <div className="flex items-center gap-1.5">
                <ThemeToggle className="!w-7 !h-7 !rounded-lg" />
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-surface-hover flex items-center justify-center transition-all text-text-muted hover:text-primary"
                  title="Keyboard Shortcuts"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/5 transition-colors text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div className="mt-2 flex flex-col gap-1.5 items-center">
            <ThemeToggle className="!w-7 !h-7 !rounded-lg" />
            <button
              onClick={() => setShowShortcuts(true)}
              className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-surface-hover flex items-center justify-center transition-all text-text-muted hover:text-primary"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-7 h-7 rounded-lg text-text-muted hover:text-error hover:bg-error/5 transition-colors flex items-center justify-center"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <ShortcutCheatSheet isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </motion.aside>
  );
}
