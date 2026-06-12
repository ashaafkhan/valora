"use client";

/**
 * Valora — MonthView (Stage 8)
 * Full month grid with event pills and day click navigation
 */
import type { CalendarEvent } from "@/types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import EventCard from "./EventCard";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onClickEvent: (event: CalendarEvent) => void;
  onClickDay: (date: Date) => void;
}

const MAX_VISIBLE_EVENTS = 3;

export default function MonthView({
  currentDate,
  events,
  onClickEvent,
  onClickDay,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const getEventsForDay = (day: Date) =>
    events
      .filter((e) => isSameDay(new Date(e.startTime), day))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-[#222222] flex-shrink-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Weeks grid */}
      <div className="flex-1 grid" style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-[#1A1A1A]">
            {week.map((day) => {
              const dayEvents = getEventsForDay(day);
              const overflow = dayEvents.length - MAX_VISIBLE_EVENTS;
              const today = isToday(day);
              const inMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-[#1A1A1A] p-1 min-h-[100px] cursor-pointer transition group ${
                    inMonth
                      ? "bg-transparent hover:bg-zinc-900/30"
                      : "bg-[#080808] opacity-50"
                  }`}
                  onClick={() => onClickDay(day)}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-end mb-1">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition ${
                        today
                          ? "bg-[#7C3AED] text-white"
                          : inMonth
                          ? "text-zinc-300 group-hover:text-white"
                          : "text-zinc-700"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <EventCard event={ev} onClick={onClickEvent} compact />
                      </div>
                    ))}
                    {overflow > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClickDay(day);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-[#A855F7] font-mono px-1 transition"
                      >
                        +{overflow} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
