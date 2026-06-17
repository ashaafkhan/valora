"use client";

/**
 * Valora — EventCard (Stage 8)
 * Rendered event block inside Week/Day views — color-coded, shows title + time
 */
import type { CalendarEvent } from "@/types";
import { format } from "date-fns";
import { Video, MapPin } from "lucide-react";

// Color palette for events (maps colorId or cycles through defaults)
const EVENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "1": { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-300" },
  "2": { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300" },
  "3": { bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-300" },
  "4": { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-300" },
  "5": { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-300" },
  "6": { bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-300" },
  default: { bg: "bg-[#0066ff]/20", border: "border-[#0066ff]/40", text: "text-[#93c5fd]" },
};

// Derive stable color from event id if no colorId
function getEventColor(event: CalendarEvent) {
  if (event.color && EVENT_COLORS[event.color]) return EVENT_COLORS[event.color]!;
  // Hash from event id
  let hash = 0;
  for (let i = 0; i < event.id.length; i++) {
    hash = event.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const keys = Object.keys(EVENT_COLORS).filter((k) => k !== "default");
  return EVENT_COLORS[keys[Math.abs(hash) % keys.length]!] ?? EVENT_COLORS.default!;
}

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  /** Height in pixels (for positioned views) */
  heightPx?: number;
  /** Whether we're in a compact view (month) */
  compact?: boolean;
  style?: React.CSSProperties;
}

export default function EventCard({
  event,
  onClick,
  heightPx,
  compact = false,
  style,
}: EventCardProps) {
  const color = getEventColor(event);
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  if (compact) {
    // Month view pill
    return (
      <button
        onClick={() => onClick(event)}
        className={`w-full text-left px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate ${color.bg} ${color.text} border ${color.border} hover:brightness-110 transition`}
        title={event.title}
      >
        {event.title}
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(event)}
      style={{ height: heightPx ? `${heightPx}px` : undefined, ...style }}
      className={`w-full text-left px-2 py-1.5 rounded-lg border ${color.bg} ${color.border} hover:brightness-110 cursor-grab active:cursor-grabbing transition group overflow-hidden flex flex-col gap-0.5`}
      title={event.title}
      draggable={!event.isAllDay}
      onDragStart={(e) => {
        if (event.isAllDay) return;
        e.dataTransfer.setData("text/plain", event.googleEventId);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <span className={`text-xs font-semibold leading-tight truncate ${color.text}`}>
        {event.title}
      </span>
      {!event.isAllDay && (
        <span className="text-[10px] text-text-secondary font-mono truncate">
          {format(start, "h:mm")}–{format(end, "h:mm a")}
        </span>
      )}
      <div className="flex items-center gap-1 mt-0.5">
        {event.videoLink && (
          <Video className={`w-2.5 h-2.5 ${color.text} opacity-70`} />
        )}
        {event.location && (
          <MapPin className="w-2.5 h-2.5 text-text-muted opacity-70" />
        )}
      </div>
    </button>
  );
}
