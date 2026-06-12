"use client";

/**
 * Valora — Keyboard Hint Component (Stage 7 / Stage 13)
 * Renders a styled keyboard shortcut badge
 */

interface KeyboardHintProps {
  keys: string[];
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function KeyboardHint({
  keys,
  label,
  className = "",
  size = "sm",
}: KeyboardHintProps) {
  const kbdClass =
    size === "sm"
      ? "text-[10px] px-1 py-0.5 rounded font-mono font-semibold bg-zinc-900 border border-zinc-700 text-zinc-400"
      : "text-xs px-1.5 py-1 rounded-md font-mono font-semibold bg-zinc-900 border border-zinc-700 text-zinc-300";

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {keys.map((key, i) => (
        <span key={i} className="inline-flex items-center gap-0.5">
          {i > 0 && (
            <span className="text-zinc-700 text-[10px] font-mono">+</span>
          )}
          <kbd className={kbdClass}>{key}</kbd>
        </span>
      ))}
      {label && (
        <span className="text-zinc-600 text-[10px] font-mono ml-1">{label}</span>
      )}
    </span>
  );
}
