"use client";

/**
 * Valora — DayView (Stage 8)
 * Single-day hourly timeline with positioned event blocks
 */
import type { CalendarEvent } from "@/types";
import {
  format,
  isSameDay,
  isToday,
  differenceInMinutes,
  startOfDay,
  addMinutes,
} from "date-fns";
import EventCard from "./EventCard";

const HOUR_HEIGHT = 64;
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onClickEvent: (event: CalendarEvent) => void;
  onClickSlot: (date: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date) => void;
}

export default function DayView({
  currentDate,
  events,
  onClickEvent,
  onClickSlot,
  onEventDrop,
}: DayViewProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => DAY_START_HOUR + i);
  const dayStartTime = addMinutes(startOfDay(currentDate), DAY_START_HOUR * 60);

  const dayEvents = events.filter(
    (e) => isSameDay(new Date(e.startTime), currentDate) && !e.isAllDay,
  );
  const allDayEvents = events.filter(
    (e) => isSameDay(new Date(e.startTime), currentDate) && e.isAllDay,
  );

  const today = isToday(currentDate);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#222222] px-6 py-3 flex-shrink-0 flex items-center gap-4">
        <div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            {format(currentDate, "EEEE")}
          </div>
          <div
            className={`text-3xl font-bold ${today ? "text-[#A855F7]" : "text-zinc-200"}`}
          >
            {format(currentDate, "d")}
          </div>
        </div>
        <div className="text-sm text-zinc-500">
          {format(currentDate, "MMMM yyyy")}
        </div>
      </div>

      {/* All-day */}
      {allDayEvents.length > 0 && (
        <div className="border-b border-[#222222] px-6 py-2 flex-shrink-0 flex gap-2 flex-wrap">
          {allDayEvents.map((ev) => (
            <EventCard key={ev.id} event={ev} onClick={onClickEvent} compact />
          ))}
        </div>
      )}

      {/* Hourly timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div
          className="relative ml-16"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
          onDrop={(e) => {
            e.preventDefault();
            const eventId = e.dataTransfer.getData("text/plain");
            if (!eventId || !onEventDrop) return;
            
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const clickedHour = Math.floor(y / HOUR_HEIGHT) + DAY_START_HOUR;
            const clickedMins = Math.round(((y % HOUR_HEIGHT) / HOUR_HEIGHT) * 60 / 15) * 15;
            const dropDate = new Date(currentDate);
            dropDate.setHours(clickedHour, clickedMins, 0, 0);
            
            onEventDrop(eventId, dropDate);
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const clickedHour = Math.floor(y / HOUR_HEIGHT) + DAY_START_HOUR;
            const clickedMins =
              Math.round(((y % HOUR_HEIGHT) / HOUR_HEIGHT) * 60 / 15) * 15;
            const slotDate = new Date(currentDate);
            slotDate.setHours(clickedHour, clickedMins, 0, 0);
            onClickSlot(slotDate);
          }}
        >
          {/* Time labels + grid lines */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0"
              style={{ top: `${(hour - DAY_START_HOUR) * HOUR_HEIGHT}px` }}
            >
              <div className="absolute -left-16 text-[9px] text-zinc-600 font-mono -translate-y-2 w-14 text-right pr-2">
                {format(addMinutes(startOfDay(currentDate), hour * 60), "h a")}
              </div>
              <div className="border-t border-[#1A1A1A] w-full" />
            </div>
          ))}

          {/* Events */}
          {dayEvents.map((event) => {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);
            const topPx =
              (differenceInMinutes(start, dayStartTime) / 60) * HOUR_HEIGHT;
            const heightPx = Math.max(
              (differenceInMinutes(end, start) / 60) * HOUR_HEIGHT,
              28,
            );
            return (
              <div
                key={event.id}
                className="absolute left-2 right-2 z-10"
                style={{ top: `${topPx}px` }}
                onClick={(e) => e.stopPropagation()}
              >
                <EventCard event={event} onClick={onClickEvent} heightPx={heightPx} />
              </div>
            );
          })}

          {/* Now line */}
          {today && (
            <NowIndicator dayStartHour={DAY_START_HOUR} hourHeight={HOUR_HEIGHT} />
          )}
        </div>
      </div>
    </div>
  );
}

function NowIndicator({
  dayStartHour,
  hourHeight,
}: {
  dayStartHour: number;
  hourHeight: number;
}) {
  const now = new Date();
  const top =
    ((now.getHours() - dayStartHour) * 60 + now.getMinutes()) *
    (hourHeight / 60);
  if (top < 0) return null;
  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0 -ml-1" />
        <div className="flex-1 h-px bg-[#7C3AED]" />
      </div>
    </div>
  );
}
