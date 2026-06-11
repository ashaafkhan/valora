import type { PriorityLabel } from "@/types";
import { AlertTriangle, ChevronUp, Minus, ChevronsDown } from "lucide-react";

interface PriorityBadgeProps {
  label: PriorityLabel;
  score?: number;
}

export default function PriorityBadge({ label, score }: PriorityBadgeProps) {
  let badgeStyle = "";
  let Icon = Minus;

  switch (label) {
    case "urgent":
      badgeStyle = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      Icon = AlertTriangle;
      break;
    case "high":
      badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      Icon = ChevronUp;
      break;
    case "normal":
      badgeStyle = "bg-zinc-800/50 text-zinc-400 border border-zinc-800/80";
      Icon = Minus;
      break;
    case "low":
      badgeStyle = "bg-[#111111] text-zinc-500 border border-zinc-800/30";
      Icon = ChevronsDown;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono uppercase tracking-wider ${badgeStyle}`}>
      <Icon className="w-3 h-3" />
      {label}
      {score !== undefined && score > 0 && <span className="opacity-60 ml-0.5">{score}</span>}
    </span>
  );
}
