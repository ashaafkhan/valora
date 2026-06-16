"use client";

/**
 * Valora — MiniCalendar (Stage 8)
 * Compact sidebar date picker for calendar navigation
 */
import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  eventDates?: Date[]; // Dates that have events (show dot)
}

export default function MiniCalendar({
  selectedDate,
  onSelectDate,
  eventDates = [],
}: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(selectedDate));

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const hasEvent = (day: Date) =>
    eventDates.some((d) => isSameDay(d, day));

  return (
    <div className="p-3 select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold text-zinc-300">
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-zinc-600">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const inMonth = isSameMonth(day, viewMonth);
          const dotVisible = hasEvent(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                onSelectDate(day);
                setViewMonth(startOfMonth(day));
              }}
              className={`relative flex flex-col items-center justify-center w-7 h-7 rounded-lg mx-auto text-[11px] font-medium transition ${
                selected
                  ? "bg-[#0066ff] text-white"
                  : today
                  ? "bg-zinc-800 text-[#60a5fa]"
                  : inMonth
                  ? "text-zinc-300 hover:bg-zinc-800"
                  : "text-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {format(day, "d")}
              {dotVisible && !selected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0066ff]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <button
        onClick={() => {
          const today = new Date();
          onSelectDate(today);
          setViewMonth(startOfMonth(today));
        }}
        className="mt-3 w-full text-center text-[10px] font-semibold text-zinc-500 hover:text-[#60a5fa] transition"
      >
        Jump to Today
      </button>
    </div>
  );
}
