"use client";

import { useState } from "react";
import { AgentChat } from "@/components/agent/AgentChat";
import { MemoryContext } from "@/components/agent/MemoryContext";
import { Brain, PanelRightClose, PanelRightOpen } from "lucide-react";

export default function AgentPage() {
  const [showMemory, setShowMemory] = useState(false);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 min-w-0">
        <AgentChat />
      </div>

      <button
        onClick={() => setShowMemory((v) => !v)}
        className="absolute top-1/2 right-0 -translate-y-1/2 z-20 p-1.5 rounded-l-lg bg-surface border border-border border-r-0 hover:bg-surface-hover transition text-text-muted hover:text-primary-light cursor-pointer shadow-sm"
        title={showMemory ? "Hide memory panel" : "Show memory panel"}
      >
        {showMemory ? (
          <PanelRightClose className="w-3.5 h-3.5" />
        ) : (
          <Brain className="w-3.5 h-3.5" />
        )}
      </button>

      {showMemory && (
        <div className="w-72 border-l border-border bg-surface flex-shrink-0 overflow-hidden">
          <MemoryContext />
        </div>
      )}
    </div>
  );
}
