"use client";

/**
 * Valora — WeekView (Stage 8)
 * 7-day hourly grid with positioned event blocks, click-to-create on empty slots
 */
import type { CalendarEvent } from "@/types";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  differenceInMinutes,
  startOfDay,
  addMinutes,
} from "date-fns";
import EventCard from "./EventCard";

const HOUR_HEIGHT = 60; // px per hour
const DAY_START_HOUR = 6; // 6 AM
const DAY_END_HOUR = 22; // 10 PM
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

function getEventPosition(event: CalendarEvent, dayStart: Date) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const startMins = differenceInMinutes(start, dayStart);
  const durationMins = differenceInMinutes(end, start);
  const topPx = (startMins / 60) * HOUR_HEIGHT;
  const heightPx = Math.max((durationMins / 60) * HOUR_HEIGHT, 24);
  return { topPx, heightPx };
}

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onClickEvent: (event: CalendarEvent) => void;
  onClickSlot: (date: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date) => void;
}

export default function WeekView({
  currentDate,
  events,
  onClickEvent,
  onClickSlot,
  onEventDrop,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => DAY_START_HOUR + i);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startTime), day) && !e.isAllDay);

  const getAllDayEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startTime), day) && e.isAllDay);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day Headers */}
      <div className="flex border-b border-[#222222] flex-shrink-0">
        {/* Time gutter spacer */}
        <div className="w-14 flex-shrink-0" />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="flex-1 text-center py-2 border-l border-[#222222] select-none"
            >
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                {format(day, "EEE")}
              </div>
              <div
                className={`text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto transition ${
                  today
                    ? "bg-[#0066ff] text-white"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      {days.some((d) => getAllDayEventsForDay(d).length > 0) && (
        <div className="flex border-b border-[#222222] flex-shrink-0 min-h-[28px]">
          <div className="w-14 flex-shrink-0 text-[9px] text-zinc-600 font-mono flex items-center justify-end pr-2">
            all-day
          </div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="flex-1 border-l border-[#222222] px-0.5 py-0.5 space-y-0.5"
            >
              {getAllDayEventsForDay(day).map((ev) => (
                <EventCard key={ev.id} event={ev} onClick={onClickEvent} compact />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable hourly grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
          {/* Time labels */}
          <div className="w-14 flex-shrink-0 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-[9px] text-zinc-600 font-mono -translate-y-2"
                style={{ top: `${(hour - DAY_START_HOUR) * HOUR_HEIGHT}px` }}
              >
                {format(addMinutes(startOfDay(currentDate), hour * 60), "ha")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const dayStartTime = addMinutes(startOfDay(day), DAY_START_HOUR * 60);

            return (
              <div
                key={day.toISOString()}
                className="flex-1 border-l border-[#222222] relative cursor-pointer"
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
                  const dropDate = new Date(day);
                  dropDate.setHours(clickedHour, clickedMins, 0, 0);
                  
                  onEventDrop(eventId, dropDate);
                }}
                onClick={(e) => {
                  // Calculate clicked hour from Y position
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const clickedHour = Math.floor(y / HOUR_HEIGHT) + DAY_START_HOUR;
                  const clickedMins = Math.round(((y % HOUR_HEIGHT) / HOUR_HEIGHT) * 60 / 15) * 15;
                  const slotDate = new Date(day);
                  slotDate.setHours(clickedHour, clickedMins, 0, 0);
                  onClickSlot(slotDate);
                }}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-[#1A1A1A]"
                    style={{ top: `${(hour - DAY_START_HOUR) * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Half-hour lines */}
                {hours.map((hour) => (
                  <div
                    key={`${hour}-half`}
                    className="absolute left-0 right-0 border-t border-[#161616]"
                    style={{ top: `${(hour - DAY_START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const { topPx, heightPx } = getEventPosition(event, dayStartTime);
                  return (
                    <div
                      key={event.id}
                      className="absolute left-0.5 right-0.5 z-10"
                      style={{ top: `${topPx}px` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EventCard
                        event={event}
                        onClick={onClickEvent}
                        heightPx={heightPx}
                      />
                    </div>
                  );
                })}

                {/* Current time indicator */}
                {isToday(day) && (
                  <NowIndicator dayStartHour={DAY_START_HOUR} hourHeight={HOUR_HEIGHT} />
                )}
              </div>
            );
          })}
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
      <div className="flex items-center gap-0">
        <div className="w-2 h-2 rounded-full bg-[#0066ff] flex-shrink-0 -ml-1" />
        <div className="flex-1 h-px bg-[#0066ff]" />
      </div>
    </div>
  );
}
