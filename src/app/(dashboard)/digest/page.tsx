"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, Loader2, Mail, Clock, Zap, FileText, Inbox, Calendar, BookOpen, Rss } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  gmailId: string;
  subject: string;
  fromEmail: string;
  fromName: string | null;
  bodyPreview: string;
  receivedAt: string;
  priorityLabel: string;
  source?: string;
  distance?: number;
}

const TABS = [
  { id: "summary", label: "Daily Summary", icon: BookOpen },
  { id: "newsletters", label: "Newsletters", icon: Rss },
  { id: "search", label: "Search", icon: Search },
];

// ── Types ───────────────────────────────────────────────────────
export interface DigestData {
  urgentItems: { from: string; subject: string }[];
  highItems: { from: string; subject: string }[];
  meetings: { title: string; time: string; attendees: number }[];
  newsletters: { sender: string; email: string; count: number; lastSent: string }[];
}

// ── Daily Summary Tab ─────────────────────────────────────────
function DailySummaryTab({ data, loading, onGenerate }: { data: DigestData | null, loading: boolean, onGenerate: () => void }) {
  const today = format(new Date(), "MMMM d, yyyy");

  const urgentItems = data?.urgentItems || [];
  const highItems = data?.highItems || [];
  const meetings = data?.meetings || [];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0066FF, #7C3AED)" }}>
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Today's Digest — {today}</h2>
              <p className="text-xs text-text-muted">Generated dynamically from your inbox</p>
            </div>
          </div>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? "Generating..." : "Generate Digest"}
          </button>
        </div>

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm font-semibold text-text-primary">Analyzing your inbox...</p>
            <p className="text-xs text-text-muted mt-1">Zara is reading your recent emails to extract action items.</p>
          </div>
        )}

        {!loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl">
            <BookOpen className="w-8 h-8 text-text-muted mb-4" />
            <p className="text-sm font-semibold text-text-primary">No digest generated yet</p>
            <p className="text-xs text-text-muted mt-1 mb-4">Click the button above to analyze your inbox.</p>
            <button
              onClick={onGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Generate Digest
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Urgent emails", value: urgentItems.length, color: "text-error", bg: "bg-error/5 border-error/20" },
                { label: "Meetings today", value: meetings.length, color: "text-primary", bg: "bg-primary/5 border-primary/20" },
                { label: "Newsletters", value: data.newsletters.length, color: "text-warning", bg: "bg-warning/5 border-warning/20" },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} border rounded-xl p-4 text-center`}>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Urgent */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-error">Urgent</span>
                <div className="flex-1 border-t border-error/20" />
              </div>
              {urgentItems.length === 0 ? (
                <p className="text-xs text-text-muted px-2">No urgent emails right now.</p>
              ) : (
                <div className="space-y-2">
                  {urgentItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-error/15 bg-error/5 hover:bg-error/8 cursor-pointer transition-colors">
                      <div className="w-2 h-2 rounded-full bg-error flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-text-primary">{item.from}</span>
                        <span className="text-text-muted mx-2">—</span>
                        <span className="text-xs text-text-secondary">{item.subject}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* High Priority */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-warning">High Priority</span>
                <div className="flex-1 border-t border-warning/20" />
              </div>
              {highItems.length === 0 ? (
                <p className="text-xs text-text-muted px-2">No high priority emails.</p>
              ) : (
                <div className="space-y-2">
                  {highItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-warning/15 bg-warning/5 hover:bg-warning/8 cursor-pointer transition-colors">
                      <div className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-text-primary">{item.from}</span>
                        <span className="text-text-muted mx-2">—</span>
                        <span className="text-xs text-text-secondary">{item.subject}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meetings */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Today's Meetings</span>
                <div className="flex-1 border-t border-primary/20" />
              </div>
              {meetings.length === 0 ? (
                <p className="text-xs text-text-muted px-2">No meetings scheduled for today.</p>
              ) : (
                <div className="space-y-2">
                  {meetings.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:bg-surface-hover cursor-pointer transition-colors">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-text-primary">{m.title}</span>
                      </div>
                      <span className="text-xs text-text-muted font-mono">{m.time}</span>
                      <span className="text-[10px] text-text-muted">{m.attendees} attendees</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Newsletters Tab ───────────────────────────────────────────
function NewslettersTab({ data, loading, onGenerate }: { data: DigestData | null, loading: boolean, onGenerate: () => void }) {
  const [unsubscribed, setUnsubscribed] = useState<string[]>([]);
  const unsubscribeMutation = api.gmail.unsubscribeSender.useMutation({
    onSuccess: (_, variables) => {
      setUnsubscribed((prev) => [...prev, variables.senderEmail]);
      toast.success(`Unsubscribed from ${variables.senderEmail}`);
    },
    onError: () => {
      toast.error("Failed to unsubscribe");
    }
  });

  const newsletters = data?.newsletters?.filter(n => !unsubscribed.includes(n.email)) || [];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-text-muted max-w-sm">
            Detected newsletters in your inbox. You can unsubscribe from any of them.
          </p>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? "Generating..." : "Generate Digest"}
          </button>
        </div>

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm font-semibold text-text-primary">Scanning for newsletters...</p>
          </div>
        )}

        {!loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl">
            <Rss className="w-8 h-8 text-text-muted mb-4" />
            <p className="text-sm font-semibold text-text-primary">No data generated yet</p>
            <p className="text-xs text-text-muted mt-1 mb-4">Click the button above to scan your inbox.</p>
          </div>
        )}

        {data && newsletters.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-text-muted">No newsletters detected in your recent emails.</p>
          </div>
        )}

        {data && newsletters.length > 0 && (
          <div className="space-y-2">
            {newsletters.map((n, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border hover:bg-surface-hover transition-colors">
                <div className="w-9 h-9 rounded-xl bg-surface-hover border border-border flex items-center justify-center flex-shrink-0 text-sm font-bold text-text-secondary uppercase">
                  {n.sender[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{n.sender}</div>
                  <div className="text-xs text-text-muted font-mono truncate">{n.email}</div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="text-sm font-bold text-text-primary">{n.count}</div>
                  <div className="text-[10px] text-text-muted">emails</div>
                </div>
                <div className="text-xs text-text-muted flex-shrink-0 w-20 text-right">{n.lastSent}</div>
                <button 
                  onClick={() => unsubscribeMutation.mutate({ senderEmail: n.email })}
                  disabled={unsubscribeMutation.isPending}
                  className="px-3 py-1.5 rounded-lg border border-error/30 text-error text-xs hover:bg-error/5 transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  Unsubscribe
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Digest Page ───────────────────────────────────────────────
export default function DigestPage() {
  const [activeTab, setActiveTab] = useState("summary");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState({ vector: 0, keyword: 0 });
  const [searched, setSearched] = useState(false);
  
  // Dynamic digest state
  const [digestData, setDigestData] = useState<DigestData | null>(null);
  const [loadingDigest, setLoadingDigest] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "search") inputRef.current?.focus();
  }, [activeTab]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=30`);
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as { results: SearchResult[]; sources: { vector: number; keyword: number } };
      setResults(data.results);
      setSources(data.sources);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateDigest = useCallback(async () => {
    setLoadingDigest(true);
    try {
      const res = await fetch(`/api/ai/digest`);
      if (!res.ok) throw new Error("Failed to generate digest");
      const data = await res.json();
      setDigestData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDigest(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performSearch(query);
  };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-8 pt-6 pb-0 border-b border-border/60">
          <h1 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Digest
          </h1>
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-text-muted hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <>
            <div className="px-8 py-4 border-b border-border/40">
              <form onSubmit={handleSubmit} className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Semantic search across your entire inbox..."
                  className="w-full bg-surface border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-muted transition"
                />
                {loading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                )}
              </form>
              {sources.vector > 0 && (
                <p className="mt-2 text-[10px] text-text-muted font-mono">
                  <span className="text-primary">AI Semantic</span> ({sources.vector}) ·{" "}
                  <span className="text-text-secondary">Keyword</span> ({sources.keyword})
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {searched && !loading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-text-muted" />
                  </div>
                  <p className="text-sm font-semibold text-text-muted">No results found</p>
                  <p className="text-xs text-text-secondary mt-1">Try a different search term</p>
                </div>
              )}

              {!searched && (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/15 flex items-center justify-center mb-4">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">Semantic search</p>
                  <p className="text-xs text-text-muted mt-1 max-w-sm">
                    Search your entire inbox by meaning, not just keywords. Powered by vector AI.
                  </p>
                </div>
              )}

              <div className="px-8 py-4 space-y-1">
                {results.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => router.push(`/inbox`)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-hover/60 transition cursor-pointer border border-transparent hover:border-border/60 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {r.fromName || r.fromEmail}
                        </span>
                        {r.source === "vector" && (
                          <span className="text-[8px] font-mono uppercase tracking-wider text-primary bg-primary/8 px-1.5 py-0.5 rounded-md flex-shrink-0">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-text-primary truncate mt-0.5">{r.subject}</p>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{r.bodyPreview}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(r.receivedAt), "MMM d")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Daily Summary Tab */}
        {activeTab === "summary" && <DailySummaryTab data={digestData} loading={loadingDigest} onGenerate={generateDigest} />}

        {/* Newsletters Tab */}
        {activeTab === "newsletters" && <NewslettersTab data={digestData} loading={loadingDigest} onGenerate={generateDigest} />}
      </div>
    </div>
  );
}
