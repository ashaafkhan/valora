import type { SensitiveType } from "@/types";
import { ShieldAlert } from "lucide-react";
import { getShieldLabel } from "@/lib/security";

interface ShieldBadgeProps {
  types: SensitiveType[];
}

export default function ShieldBadge({ types }: ShieldBadgeProps) {
  if (!types || types.length === 0) return null;

  const primaryTypeLabel = getShieldLabel(types);

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 group relative cursor-help"
      title={`Security Shield blocked: ${types.join(", ")}`}
    >
      <ShieldAlert className="w-3 h-3 text-yellow-400" />
      {primaryTypeLabel}
      
      {/* Tooltip detail on hover */}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-zinc-950 text-zinc-300 text-[9px] normal-case font-sans px-2.5 py-1.5 rounded-md border border-zinc-800 shadow-xl opacity-0 group-hover:opacity-100 transition duration-200 z-50">
        🛡️ Sensitive info detected: {types.join(", ")}
      </span>
    </span>
  );
}
