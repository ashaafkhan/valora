"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, Loader2, Mail, Clock, Hash, FileText, Inbox } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useKeyboard } from "@/hooks/useKeyboard";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState({ vector: 0, keyword: 0 });
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useKeyboard({ key: "Escape" }, () => { setQuery(""); setResults([]); setSearched(false); });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-8 pt-6 pb-4 border-b border-border/60">
          <h1 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary-light" />
            Search
          </h1>
          <form onSubmit={handleSubmit} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search emails by sender, subject, or content..."
              className="w-full bg-surface border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-muted transition"
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-light animate-spin" />
            )}
          </form>
          {sources.vector > 0 && (
            <p className="mt-2 text-[10px] text-text-muted font-mono">
              <span className="text-primary-light">Semantic</span> ({sources.vector}) · <span className="text-text-secondary">Keyword</span> ({sources.keyword})
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
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
              <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm font-semibold text-text-muted">Search your inbox</p>
              <p className="text-xs text-text-secondary mt-1 max-w-sm">
                Vector search across all your emails — find messages by meaning, not just keywords
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
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {r.fromName || r.fromEmail}
                    </span>
                    <span className="text-[10px] text-text-muted truncate">{r.fromEmail}</span>
                    {r.source === "vector" && (
                      <span className="text-[8px] font-mono uppercase tracking-wider text-primary-light bg-primary/5 px-1.5 py-0.5 rounded-md flex-shrink-0">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-text-primary truncate mt-0.5">
                    {r.subject}
                  </p>
                  <p className="text-[10px] text-text-muted truncate mt-0.5">
                    {r.bodyPreview}
                  </p>
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
      </div>
    </div>
  );
}
