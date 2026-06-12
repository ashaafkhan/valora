"use client";

import { useEffect, useState, useCallback } from "react";
import { Brain, Trash2, Database, RefreshCw, Loader2 } from "lucide-react";

interface Memory {
  id: string;
  content: string;
  category?: string;
  createdAt: string;
}

export function MemoryContext() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/memory");
      if (!res.ok) throw new Error("Failed to fetch memories");
      const data = (await res.json()) as { memories: Memory[] };
      setMemories(data.memories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMemories();
  }, [fetchMemories]);

  const handleDelete = async (memoryId: string) => {
    try {
      const res = await fetch(`/api/agent/memory?id=${memoryId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete memory");
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background select-none overflow-hidden font-sans">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 bg-surface/30 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Database className="w-3.5 h-3.5 text-primary-light" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-text-primary">Memory</h2>
            <p className="text-[9px] text-text-muted">
              {memories.length} stored {memories.length === 1 ? "memory" : "memories"}
            </p>
          </div>
        </div>
        <button
          onClick={fetchMemories}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition text-text-muted hover:text-text-primary cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
        {loading && memories.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-[10px] text-error bg-error/5 rounded-xl p-3 border border-error/10 text-center">
            {error}
          </div>
        )}

        {!loading && !error && memories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-9 h-9 rounded-2xl bg-surface border border-border flex items-center justify-center mb-3">
              <Brain className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-[10px] font-semibold text-text-muted">No memories yet</p>
            <p className="text-[9px] text-text-muted mt-1 leading-relaxed">
              The agent will remember your preferences as you interact with it.
            </p>
          </div>
        )}

        {memories.map((memory) => (
          <div
            key={memory.id}
            className="group relative bg-surface border border-border rounded-xl p-3 hover:border-primary/20 transition"
          >
            <p className="text-[10px] text-text-primary leading-relaxed pr-6">
              {memory.content}
            </p>
            <div className="flex items-center justify-between mt-2">
              {memory.category && (
                <span className="text-[8px] font-mono uppercase tracking-wider text-primary-light bg-primary/5 px-1.5 py-0.5 rounded-md">
                  {memory.category}
                </span>
              )}
              <span className="text-[8px] text-text-muted">
                {new Date(memory.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <button
              onClick={() => handleDelete(memory.id)}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error transition text-text-muted cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
