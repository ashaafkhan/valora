"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Calendar, Sparkles, Search, Settings, LogOut, Inbox } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  shortcut?: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Inbox", href: "/inbox", icon: Inbox, shortcut: "I" },
  { label: "Calendar", href: "/calendar", icon: Calendar, shortcut: "C" },
  { label: "CoPilot", href: "/agent", icon: Sparkles, shortcut: "A" },
  { label: "Search", href: "/search", icon: Search, shortcut: "S" },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const expanded = hovered;

  const sidebarWidth = expanded ? 240 : 72;

  return (
    <motion.aside
      className="h-screen bg-surface border-r border-border flex flex-col flex-shrink-0 select-none overflow-hidden theme-transition relative z-20"
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border/60 flex-shrink-0 overflow-hidden">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,102,255,0.2)]">
          <Image
            src="/valora_logo.png"
            alt="Valora"
            width={20}
            height={20}
            className="w-[18px] h-[18px] object-contain"
          />
        </div>
        <motion.div
          className="flex flex-col min-w-0"
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <span className="text-sm font-bold tracking-tight text-text-primary">Valora</span>
          <span className="text-[8px] font-mono tracking-widest text-primary uppercase font-bold">Command Center</span>
        </motion.div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-primary/10 border-l-2 border-primary text-primary shadow-[inset_0_0_20px_rgba(0,102,255,0.06)]"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border-l-2 border-transparent"
                  }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                <motion.span
                  className="text-sm whitespace-nowrap"
                  animate={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
                {expanded && item.shortcut && (
                  <motion.kbd
                    className="ml-auto text-[10px] font-mono text-text-muted bg-surface-hover border border-border rounded px-1.5 py-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.shortcut}
                  </motion.kbd>
                )}
                {expanded && item.label === "Inbox" && (
                  <motion.span
                    className="ml-auto text-[10px] font-bold bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,102,255,0.4)]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    3
                  </motion.span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border/60 p-3 flex-shrink-0">
        <motion.div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
          animate={{ justifyContent: expanded ? "flex-start" : "center" }}
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-primary/20">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "User"} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary">{user.name?.[0] ?? "U"}</span>
            )}
          </div>
          <motion.div
            className="min-w-0 flex-1"
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="text-sm font-medium text-text-primary truncate leading-none">{user.name ?? "User"}</div>
            <div className="text-[10px] text-text-muted truncate mt-1 leading-none font-mono">{user.email}</div>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 mt-2"
          animate={{ justifyContent: expanded ? "space-between" : "center" }}
        >
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/5 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            {expanded && (
              <motion.span
                className="text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Sign out
              </motion.span>
            )}
          </button>
        </motion.div>
      </div>
    </motion.aside>
  );
}
