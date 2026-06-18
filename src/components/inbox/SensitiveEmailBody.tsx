"use client";

import { useState } from "react";
import { ShieldAlert, Eye, EyeOff } from "lucide-react";
import type { SensitiveType } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SensitiveEmailBodyProps {
  body: string;
  types: SensitiveType[];
}

export function SensitiveEmailBody({ body, types }: SensitiveEmailBodyProps) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-[10px] text-yellow-400 font-medium">
          <EyeOff className="w-3 h-3" />
          <span>Sensitive content revealed — handle with care</span>
          <button
            onClick={() => setRevealed(false)}
            className="ml-auto px-2 py-0.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 text-[9px] font-semibold transition"
          >
            Hide
          </button>
        </div>
        {body.includes("</") ? (
          <div
            className="text-sm text-text-secondary leading-relaxed overflow-x-auto whitespace-pre-wrap select-text font-sans"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <div className="text-sm text-text-secondary leading-relaxed overflow-x-auto whitespace-pre-wrap select-text font-sans [&_a]:text-primary-light [&_a]:underline hover:[&_a]:text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {body}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="blur-sm select-none pointer-events-none text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
        {body.slice(0, 1000)}
      </div>
      <button
        onClick={() => setRevealed(true)}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-xs rounded-xl cursor-pointer transition hover:bg-black/50"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/25">
          <ShieldAlert className="w-4 h-4 text-yellow-400" />
          <Eye className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-400">
            Click to reveal sensitive content
          </span>
        </div>
        <span className="text-[10px] text-yellow-500/70 font-mono">
          Contains: {types.join(", ")}
        </span>
      </button>
    </div>
  );
}
