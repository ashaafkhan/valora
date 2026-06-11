"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Calendar, Sparkles, Search, Settings, LogOut, ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Inbox", href: "/inbox", icon: Mail },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "AI Copilot", href: "/agent", icon: Sparkles },
    { label: "Search", href: "/search", icon: Search },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#0A0A0A] border-r border-[#222222]/80 h-screen flex flex-col flex-shrink-0 select-none">
      {/* Brand Header Logo */}
      <div className="p-6 border-b border-[#222222]/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center flex-shrink-0">
          <Image
            src="/valora_logo.png"
            alt="Valora Logo"
            width={24}
            height={24}
            className="w-5 h-5 object-contain"
          />
        </div>
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-white font-sans">
            Valora
          </h2>
          <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            Command Center
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition duration-150
                ${
                  isActive
                    ? "bg-[#111111] text-white border border-[#222222]/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/30 border border-transparent"
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#A855F7]" : "text-zinc-500"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Actions Footer */}
      <div className="p-4 border-t border-[#222222]/50 bg-zinc-950/20 space-y-4">
        {/* User avatar segment */}
        <div className="flex items-center gap-3 px-2">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-xl object-cover border border-[#222222]"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 border border-[#222222]">
              {user.name?.slice(0, 1).toUpperCase() || "U"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-200 truncate leading-none">
              {user.name || "User"}
            </p>
            <p className="text-[10px] text-zinc-500 truncate mt-1 leading-none font-mono">
              {user.email}
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
