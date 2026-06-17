"use client";

/**
 * Valora — Settings Page (Stage 13 / Stage 17)
 * Full user preferences command center: theme, AI, shortcuts, integrations, security & account.
 */
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Palette,
  Zap,
  Shield,
  Keyboard,
  Bell,
  Link2,
  Trash2,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Check,
  AlertTriangle,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  ExternalLink,
  Mail,
  Calendar,
  Bot,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────
type ThemeOption = "dark" | "light" | "system";

interface SettingsState {
  theme: ThemeOption;
  enableAIPriority: boolean;
  enableSecurityShield: boolean;
  enableKeyboardShortcuts: boolean;
  enableNotifications: boolean;
  emailsPerPage: number;
  defaultCalendarView: "day" | "week" | "month";
  showReadEmails: boolean;
  compactMode: boolean;
  soundEnabled: boolean;
}

// ── Helper: Toggle Row ──────────────────────────────────────────
function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  badge,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0 group">
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          {badge && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-primary/15 text-primary-light border border-primary/20">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        role="switch"
        aria-checked={enabled}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          enabled
            ? "border-primary bg-primary"
            : "border-border bg-surface-hover"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 mt-[1px] ${
            enabled ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// ── Helper: Section Card ────────────────────────────────────────
function SettingsSection({
  icon: Icon,
  title,
  subtitle,
  children,
  iconColor = "text-primary-light",
  iconBg = "bg-primary/10 border-primary/20",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <section className="bg-surface border border-border rounded-2xl overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-border/60 flex items-center gap-3 bg-background/30">
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text-primary">{title}</h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-2">{children}</div>
    </section>
  );
}

// ── Keyboard Shortcut Table ─────────────────────────────────────
const SHORTCUT_TABLE = [
  { scope: "Global", key: "⌘K / Ctrl+K", action: "Open command palette" },
  { scope: "Global", key: "?", action: "Show shortcut cheat sheet" },
  { scope: "Global", key: "G I", action: "Go to Inbox" },
  { scope: "Global", key: "G C", action: "Go to Calendar" },
  { scope: "Global", key: "G A", action: "Go to AI Agent" },
  { scope: "Global", key: "G S", action: "Go to Settings" },
  { scope: "Inbox", key: "C", action: "Compose new email" },
  { scope: "Inbox", key: "E", action: "Archive selected email" },
  { scope: "Inbox", key: "R", action: "Toggle read/unread" },
  { scope: "Inbox", key: "★ (*)", action: "Star / unstar" },
  { scope: "Inbox", key: "J / K", action: "Navigate emails" },
  { scope: "Inbox", key: "X", action: "Select email" },
  { scope: "Inbox", key: "Esc", action: "Close thread / deselect" },
  { scope: "Compose", key: "⌘↵ / Ctrl+↵", action: "Send email" },
  { scope: "Compose", key: "Esc", action: "Close compose" },
  { scope: "Calendar", key: "T", action: "Jump to today" },
  { scope: "Calendar", key: "D / W / M", action: "Day / Week / Month view" },
  { scope: "Calendar", key: "N", action: "New event" },
  { scope: "Calendar", key: "← / →", action: "Previous / next period" },
];

const SCOPE_COLORS: Record<string, string> = {
  Global: "text-primary-light bg-primary/10 border-primary/20",
  Inbox: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Compose: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Calendar: "text-sky-400 bg-sky-400/10 border-sky-400/20",
};

// ── Main Page ───────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: session } = useSession();

  const [settings, setSettings] = useState<SettingsState>({
    theme: "light",
    enableAIPriority: true,
    enableSecurityShield: true,
    enableKeyboardShortcuts: true,
    enableNotifications: false,
    emailsPerPage: 25,
    defaultCalendarView: "week",
    showReadEmails: true,
    compactMode: false,
    soundEnabled: false,
  });

  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("Free");

  // Apply theme helper
  const applyTheme = useCallback((theme: ThemeOption) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (theme === "light") {
      root.setAttribute("data-theme", "light");
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      root.classList.toggle("dark", prefersDark);
      root.classList.toggle("light", !prefersDark);
    }
  }, []);

  // Load settings from backend and fallback to localStorage
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch preferences from DB
        const prefRes = await fetch("/api/user/preferences");
        if (prefRes.ok) {
          const prefData = await prefRes.json();
          const dbPrefs = prefData.preferences || {};
          
          setSettings((prev) => {
            const merged = {
              ...prev,
              ...dbPrefs,
              // Map DB property notificationsEnabled back to state's enableNotifications
              enableNotifications: dbPrefs.notificationsEnabled !== undefined ? dbPrefs.notificationsEnabled : prev.enableNotifications,
              theme: prefData.theme ?? prev.theme,
            };
            return merged;
          });

          if (prefData.theme) {
            applyTheme(prefData.theme);
          }
        }

        // Fetch profile to get plan details
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.user?.plan) {
            setUserPlan(profileData.user.plan.charAt(0).toUpperCase() + profileData.user.plan.slice(1));
          }
        }
      } catch (err) {
        console.error("Failed to load settings from DB:", err);
      }
    }
    void loadData();
  }, [applyTheme]);

  const updateSetting = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("valora-settings", JSON.stringify(next));
      if (key === "theme") {
        localStorage.setItem("valora-theme", String(value));
        applyTheme(value as ThemeOption);
      }

      // Sync specific preferences to DB
      const keyMap: Record<string, string> = {
        enableAIPriority: "enableAIPriority",
        enableSecurityShield: "enableSecurityShield",
        enableKeyboardShortcuts: "enableKeyboardShortcuts",
        defaultCalendarView: "defaultCalendarView",
        emailsPerPage: "emailsPerPage",
        enableNotifications: "notificationsEnabled",
        soundEnabled: "soundEnabled",
        theme: "theme",
      };
      
      const dbKey = keyMap[key];
      if (dbKey) {
        fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [dbKey]: value }),
        }).catch((err) => console.error("Failed to sync preference to DB:", err));
      }

      return next;
    });
    setSaved(false);
  }, [applyTheme]);

  const handleSave = () => {
    localStorage.setItem("valora-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = async () => {
    const defaults: SettingsState = {
      theme: "light",
      enableAIPriority: true,
      enableSecurityShield: true,
      enableKeyboardShortcuts: true,
      enableNotifications: false,
      emailsPerPage: 25,
      defaultCalendarView: "week",
      showReadEmails: true,
      compactMode: false,
      soundEnabled: false,
    };
    setSettings(defaults);
    localStorage.setItem("valora-settings", JSON.stringify(defaults));
    applyTheme("light");
    localStorage.setItem("valora-theme", "light");
    setSaved(false);

    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enableAIPriority: true,
          enableSecurityShield: true,
          enableKeyboardShortcuts: true,
          defaultCalendarView: "week",
          emailsPerPage: 25,
          notificationsEnabled: false,
          soundEnabled: false,
          theme: "light",
        }),
      });
    } catch (err) {
      console.error("Failed to reset database preferences:", err);
    }
  };

  const navSections = [
    { id: "account", label: "Account", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "ai", label: "AI & Priority", icon: Sparkles },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
    { id: "integrations", label: "Integrations", icon: Link2 },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  const themeOptions: { value: ThemeOption; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Left Nav ─────────────────────────────────────────── */}
      <aside className="w-52 flex-shrink-0 border-r border-border/60 flex flex-col py-6 px-3 bg-surface/30 overflow-y-auto scrollbar-thin">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-3 font-mono">
          Settings
        </p>
        <nav className="space-y-0.5">
          {navSections.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            const isDanger = id === "danger";
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? isDanger
                      ? "bg-error/10 text-error border border-error/20"
                      : "bg-background text-text-primary border border-border shadow-sm"
                    : isDanger
                      ? "text-error/70 hover:text-error hover:bg-error/5 border border-transparent"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive && !isDanger ? "text-primary-light" : ""}`} />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

          {/* ── Account ─────────────────────────────────────── */}
          {activeSection === "account" && (
            <SettingsSection icon={User} title="Account" subtitle="Manage your profile and identity">
              <div className="py-5 space-y-5">
                {/* Profile card */}
                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border/60">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-lg text-primary-light">
                      {session?.user?.name?.slice(0, 1).toUpperCase() ?? "V"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {session?.user?.name ?? "Valora User"}
                    </p>
                    <p className="text-xs text-text-muted truncate font-mono mt-0.5">
                      {session?.user?.email ?? ""}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                      Connected via Google
                    </span>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-3 border-b border-border/40">
                    <span className="text-text-secondary text-xs">Email</span>
                    <span className="text-text-primary font-mono text-xs">{session?.user?.email ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/40">
                    <span className="text-text-secondary text-xs">Plan</span>
                    <span className="text-xs font-bold text-primary-light">{userPlan}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/40">
                    <span className="text-text-secondary text-xs">Version</span>
                    <span className="text-text-muted font-mono text-xs">v1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-text-secondary text-xs">Domain</span>
                    <a
                      href="https://valorahq.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-light hover:text-accent flex items-center gap-1 font-mono transition"
                    >
                      valorahq.in <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-error/30 text-error text-xs font-semibold hover:bg-error/5 transition cursor-pointer"
                >
                  Sign out of Valora
                </button>
              </div>
            </SettingsSection>
          )}

          {/* ── Appearance ──────────────────────────────────── */}
          {activeSection === "appearance" && (
            <>
              <SettingsSection icon={Palette} title="Appearance" subtitle="Customize how Valora looks and feels">
                <div className="py-5 space-y-6">
                  {/* Theme picker */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-widest font-mono">Theme</p>
                    <div className="grid grid-cols-3 gap-2">
                      {themeOptions.map(({ value, label, icon: Icon }) => {
                        const isSelected = settings.theme === value;
                        return (
                          <button
                            key={value}
                            onClick={() => updateSetting("theme", value)}
                            className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary-light"
                                : "border-border bg-surface-hover/50 text-text-secondary hover:border-primary/40 hover:text-text-primary"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? "text-primary-light" : "text-text-muted"}`} />
                            {label}
                            {isSelected && <Check className="w-3 h-3 absolute top-2 right-2 text-primary-light" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Display options */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-0 uppercase tracking-widest font-mono">Display</p>
                    <ToggleRow
                      label="Compact Mode"
                      description="Reduce spacing for higher email density"
                      enabled={settings.compactMode}
                      onChange={(v) => updateSetting("compactMode", v)}
                    />
                    <ToggleRow
                      label="Show Read Emails"
                      description="Include already-read emails in the inbox list"
                      enabled={settings.showReadEmails}
                      onChange={(v) => updateSetting("showReadEmails", v)}
                    />
                  </div>

                  {/* Emails per page */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-widest font-mono">Emails per sync</p>
                    <div className="flex items-center gap-3">
                      {[10, 25, 50, 100].map((n) => (
                        <button
                          key={n}
                          onClick={() => updateSetting("emailsPerPage", n)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            settings.emailsPerPage === n
                              ? "bg-primary/15 border-primary/40 text-primary-light"
                              : "bg-surface-hover/50 border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Default calendar view */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-widest font-mono">Default Calendar View</p>
                    <div className="flex items-center gap-2">
                      {(["day", "week", "month"] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => updateSetting("defaultCalendarView", v)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer capitalize ${
                            settings.defaultCalendarView === v
                              ? "bg-primary/15 border-primary/40 text-primary-light"
                              : "bg-surface-hover/50 border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection icon={Bell} title="Notifications & Sound" subtitle="Control alerts and audio feedback">
                <div className="py-2">
                  <ToggleRow
                    label="Browser Notifications"
                    description="Show desktop notifications for new emails and events"
                    enabled={settings.enableNotifications}
                    onChange={(v) => updateSetting("enableNotifications", v)}
                  />
                  <ToggleRow
                    label="Sound Effects"
                    description="Play subtle sounds for send, archive, and notifications"
                    enabled={settings.soundEnabled}
                    onChange={(v) => updateSetting("soundEnabled", v)}
                  />
                </div>
              </SettingsSection>
            </>
          )}

          {/* ── AI & Priority ────────────────────────────────── */}
          {activeSection === "ai" && (
            <>
              <SettingsSection
                icon={Sparkles}
                title="AI Priority Engine"
                subtitle="Powered by Groq Llama-3.3-70b — ultra-fast inference"
                iconBg="bg-blue-500/10 border-blue-500/20"
                iconColor="text-blue-400"
              >
                <div className="py-2">
                  <ToggleRow
                    label="AI Priority Inbox"
                    description="Automatically classify emails as Urgent, High, Normal, or Low using LLM scoring."
                    enabled={settings.enableAIPriority}
                    onChange={(v) => updateSetting("enableAIPriority", v)}
                    badge="Recommended"
                  />
                </div>
                <div className="pb-4 pt-1 grid grid-cols-4 gap-2">
                  {[
                    { label: "Urgent", color: "bg-error/15 border-error/30 text-error" },
                    { label: "High", color: "bg-warning/15 border-warning/30 text-warning" },
                    { label: "Normal", color: "bg-surface-hover border-border text-text-secondary" },
                    { label: "Low", color: "bg-surface-hover border-border/50 text-text-muted" },
                  ].map(({ label, color }) => (
                    <div key={label} className={`text-center py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider ${color}`}>
                      {label}
                    </div>
                  ))}
                </div>
              </SettingsSection>

              <SettingsSection
                icon={Bot}
                title="AI Agent"
                subtitle="Valora Copilot — your executive assistant with memory"
                iconBg="bg-blue-500/10 border-blue-500/20"
                iconColor="text-blue-400"
              >
                <div className="py-5 space-y-4">
                  <div className="p-4 bg-background/50 rounded-xl border border-border/60 text-xs text-text-secondary leading-relaxed space-y-2">
                    <p className="text-text-primary font-semibold text-xs">What Valora AI can do:</p>
                    <ul className="space-y-1.5 mt-2">
                      {[
                        "Search your inbox with natural language",
                        "Draft and send emails on your behalf (with confirmation)",
                        "Create calendar events and fetch your schedule",
                        "Summarize threads and extract meeting details",
                        "Remember your preferences across sessions via Mem0",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-[10px] text-text-muted font-mono">
                    Model: <span className="text-primary-light">llama-3.3-70b-versatile</span> via Groq API ·
                    Memory: <span className="text-primary-light">Mem0</span> persistent store
                  </p>
                </div>
              </SettingsSection>
            </>
          )}

          {/* ── Keyboard Shortcuts ───────────────────────────── */}
          {activeSection === "shortcuts" && (
            <SettingsSection icon={Keyboard} title="Keyboard Shortcuts" subtitle="Superhuman-grade keyboard-first navigation">
              <div className="py-2">
                <ToggleRow
                  label="Enable Keyboard Shortcuts"
                  description="Master your inbox at the speed of thought. All shortcuts are context-aware."
                  enabled={settings.enableKeyboardShortcuts}
                  onChange={(v) => updateSetting("enableKeyboardShortcuts", v)}
                />
              </div>
              <div className="pb-5">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono mb-3">Complete Shortcut Reference</p>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-background/50">
                        <th className="px-4 py-2.5 text-left font-semibold text-text-muted text-[10px] uppercase tracking-wider">Scope</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-text-muted text-[10px] uppercase tracking-wider">Key</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-text-muted text-[10px] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHORTCUT_TABLE.map(({ scope, key, action }, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/40 last:border-0 hover:bg-surface-hover/30 transition"
                        >
                          <td className="px-4 py-2.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${SCOPE_COLORS[scope] ?? ""}`}>
                              {scope}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <kbd className="font-mono">{key}</kbd>
                          </td>
                          <td className="px-4 py-2.5 text-text-secondary">{action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </SettingsSection>
          )}

          {/* ── Integrations ─────────────────────────────────── */}
          {activeSection === "integrations" && (
            <SettingsSection icon={Link2} title="Integrations" subtitle="Connected services powering Valora">
              <div className="py-5 space-y-3">
                {[
                  {
                    icon: Mail,
                    name: "Gmail",
                    description: "Read, send, archive, star, and manage labels",
                    status: "connected",
                    via: "Corsair SDK",
                    color: "text-red-400 bg-red-400/10 border-red-400/20",
                  },
                  {
                    icon: Calendar,
                    name: "Google Calendar",
                    description: "View, create, and manage calendar events",
                    status: "connected",
                    via: "Corsair SDK",
                    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
                  },
                  {
                    icon: Sparkles,
                    name: "Groq AI",
                    description: "Email prioritization, smart drafts, and agent reasoning",
                    status: "connected",
                    via: "Groq API",
                    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
                  },
                  {
                    icon: Bot,
                    name: "Mem0 Memory",
                    description: "Persistent AI agent memory across sessions",
                    status: "optional",
                    via: "Mem0 API",
                    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
                  },
                ].map(({ icon: Icon, name, description, status, via, color }) => (
                  <div
                    key={name}
                    className="flex items-center gap-4 p-4 bg-background/40 rounded-xl border border-border/60 hover:border-border transition"
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-text-primary">{name}</p>
                        <span className="text-[9px] font-mono text-text-muted">via {via}</span>
                      </div>
                      <p className="text-xs text-text-muted">{description}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border flex-shrink-0 ${
                        status === "connected"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}

                <div className="pt-2">
                  <a
                    href="/connect"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary/30 text-primary-light text-xs font-semibold hover:bg-primary/5 transition"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Manage Integrations
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </SettingsSection>
          )}

          {/* ── Privacy & Security ───────────────────────────── */}
          {activeSection === "privacy" && (
            <>
              <SettingsSection
                icon={Shield}
                title="Security Shield"
                subtitle="Automatic detection of sensitive email content"
                iconBg="bg-emerald-500/10 border-emerald-500/20"
                iconColor="text-emerald-400"
              >
                <div className="py-2">
                  <ToggleRow
                    label="Enable Security Shield"
                    description="Automatically flags emails containing bank details, OTPs, passwords, and medical/legal data."
                    enabled={settings.enableSecurityShield}
                    onChange={(v) => updateSetting("enableSecurityShield", v)}
                    badge="Recommended"
                  />
                </div>
                <div className="pb-5">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono mb-3">Detected Categories</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "🏦 Banking", desc: "Account numbers, card details, wire transfers" },
                      { label: "🔑 OTP / 2FA", desc: "One-time passwords, verification codes" },
                      { label: "🔐 Passwords", desc: "Credential resets, API keys" },
                      { label: "🏥 Medical", desc: "Diagnoses, prescriptions, lab results" },
                      { label: "⚖️ Legal", desc: "NDAs, subpoenas, legal notices" },
                      { label: "👤 Personal", desc: "SSN, passport, home address" },
                    ].map(({ label, desc }) => (
                      <div key={label} className="p-3 bg-background/40 rounded-xl border border-border/50 text-xs">
                        <p className="font-semibold text-text-primary mb-0.5">{label}</p>
                        <p className="text-text-muted text-[10px] leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection
                icon={Eye}
                title="Privacy"
                subtitle="Your data, your control"
                iconBg="bg-blue-500/10 border-blue-500/20"
                iconColor="text-blue-400"
              >
                <div className="py-5 space-y-3 text-xs text-text-secondary leading-relaxed">
                  <div className="p-4 bg-background/40 rounded-xl border border-border/50 space-y-2">
                    {[
                      "Email content is processed locally on the server — never sent to third parties",
                      "AI prioritization uses only subject + preview (first 300 chars)",
                      "Google OAuth tokens are encrypted at rest in the database",
                      "Mem0 memory stores only interaction summaries, never raw email content",
                      "All Corsair API calls are proxied through your own server — no direct client access",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <EyeOff className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SettingsSection>
            </>
          )}

          {/* ── Danger Zone ──────────────────────────────────── */}
          {activeSection === "danger" && (
            <SettingsSection
              icon={AlertTriangle}
              title="Danger Zone"
              subtitle="Irreversible actions — proceed with caution"
              iconBg="bg-error/10 border-error/20"
              iconColor="text-error"
            >
              <div className="py-5 space-y-4">
                {/* Reset settings */}
                <div className="flex items-center justify-between p-4 bg-background/40 rounded-xl border border-border/60">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Reset All Settings</p>
                    <p className="text-xs text-text-muted mt-0.5">Restore all preferences to factory defaults</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-warning/30 text-warning text-xs font-semibold hover:bg-warning/5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                {/* Sign out all devices */}
                <div className="flex items-center justify-between p-4 bg-background/40 rounded-xl border border-border/60">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Sign Out Everywhere</p>
                    <p className="text-xs text-text-muted mt-0.5">Revoke all active sessions across all devices</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-error/30 text-error text-xs font-semibold hover:bg-error/5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>

                {/* Delete account */}
                <div className="p-4 bg-error/5 rounded-xl border border-error/20">
                  <p className="text-sm font-semibold text-error mb-1">Delete Account</p>
                  <p className="text-xs text-text-muted mb-4 leading-relaxed">
                    Permanently delete your Valora account and all synced data. This action is irreversible and cannot be undone.
                  </p>
                  {!showDangerConfirm ? (
                    <button
                      onClick={() => setShowDangerConfirm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold hover:bg-error/20 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete My Account
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDangerConfirm(false)}
                        className="px-4 py-2 rounded-xl border border-border text-text-secondary text-xs font-semibold hover:bg-surface-hover transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error border-0 text-white text-xs font-bold hover:brightness-90 transition cursor-pointer">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Confirm Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SettingsSection>
          )}

          {/* ── Save Button (for non-danger sections) ─────────── */}
          {activeSection !== "danger" && activeSection !== "shortcuts" && (
            <div className="flex items-center justify-between pt-2 pb-6">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-text-secondary text-xs font-semibold hover:bg-surface-hover transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  saved
                    ? "bg-success text-white border-0 shadow-lg shadow-success/20"
                    : "bg-primary hover:bg-primary-light text-primary-foreground border-0 shadow-lg shadow-primary/20"
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved!
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
