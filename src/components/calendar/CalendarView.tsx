"use client";

/**
 * Valora — CalendarView (Stage 8)
 * Main calendar shell — toolbar, view switcher (Day/Week/Month), and view rendering
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import type { CalendarEvent, CalendarViewMode } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { useCalendarStore } from "@/store/calendarStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboard";
import { api } from "@/trpc/react";

import WeekView from "./WeekView";
import DayView from "./DayView";
import MonthView from "./MonthView";
import EventDetailPanel from "./EventDetailPanel";
import CreateEventModal from "./CreateEventModal";
import MiniCalendar from "./MiniCalendar";
import QuickSchedule from "./QuickSchedule";

function getViewLabel(date: Date, mode: CalendarViewMode): string {
  switch (mode) {
    case "day":
      return format(date, "EEEE, MMMM d, yyyy");
    case "week": {
      const s = startOfWeek(date, { weekStartsOn: 0 });
      const e = endOfWeek(date, { weekStartsOn: 0 });
      if (format(s, "MMM") === format(e, "MMM")) {
        return `${format(s, "MMM d")} – ${format(e, "d, yyyy")}`;
      }
      return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
    }
    case "month":
      return format(date, "MMMM yyyy");
  }
}

export default function CalendarView() {
  const {
    events,
    setEvents,
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    goToPrevious,
    goToNext,
    goToToday,
    selectedEventId,
    selectEvent,
    isCreatingEvent,
    openCreateEvent,
    closeCreateEvent,
    prefillEvent,
    clearPrefillEvent,
  } = useCalendarStore();

  const [createSlotDate, setCreateSlotDate] = useState<Date | undefined>(undefined);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId) ?? null
    : null;

  // Fetch events for visible range
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 3, 0);

  const connectionQuery = api.gmail.getConnectionStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const isCalendarConnected = connectionQuery.data?.calendarConnected ?? true;

  const eventsQuery = api.calendar.getEvents.useQuery(
    { from: from.toISOString(), to: to.toISOString() },
    { refetchOnWindowFocus: true, enabled: isCalendarConnected },
  );

  // Sync events into store when query data arrives
  useEffect(() => {
    if (eventsQuery.data) {
      setEvents(eventsQuery.data as unknown as CalendarEvent[]);
    }
  }, [eventsQuery.data, setEvents]);

  if (connectionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0A0A0A]">
        <Loader2 className="w-8 h-8 text-[#0066ff] animate-spin" />
      </div>
    );
  }

  if (!isCalendarConnected) {
    return (
      <div className="flex flex-1 h-full items-center justify-center bg-[#0A0A0A] p-8">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
            <svg
              className="w-8 h-8 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-200 mb-2 font-display">
            Google Calendar not connected.
          </h2>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Connect your account to view and create events.
          </p>
          <a
            href="/connect"
            className="inline-flex items-center gap-2 bg-[#0066ff] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            Connect Google Calendar <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // ── Calendar Keyboard Shortcuts ─────────────────────────────
  const calendarShortcuts = useMemo(() => [
    { shortcut: { key: "t" }, action: () => goToToday() },
    { shortcut: { key: "d" }, action: () => setViewMode("day") },
    { shortcut: { key: "w" }, action: () => setViewMode("week") },
    { shortcut: { key: "m" }, action: () => setViewMode("month") },
    { shortcut: { key: "n" }, action: () => openCreateEvent() },
    { shortcut: { key: "ArrowLeft" }, action: () => goToPrevious() },
    { shortcut: { key: "ArrowRight" }, action: () => goToNext() },
    { shortcut: { key: "Escape" }, action: () => { if (selectedEventId) selectEvent(null); if (isCreatingEvent) closeCreateEvent(); } },
  ], [goToToday, setViewMode, openCreateEvent, goToPrevious, goToNext, selectedEventId, selectEvent, isCreatingEvent, closeCreateEvent]);

  useKeyboardShortcuts(calendarShortcuts);

  const syncMutation = api.calendar.syncEvents.useMutation({
    onSuccess: () => {
      void eventsQuery.refetch();
    },
  });

  const rsvpMutation = api.calendar.setRSVP.useMutation({
    onSuccess: () => {
      void eventsQuery.refetch();
    },
  });

  const updateMutation = api.calendar.updateEvent.useMutation({
    onSuccess: () => {
      void eventsQuery.refetch();
    },
  });

  const handleClickSlot = useCallback(
    (date: Date) => {
      setCreateSlotDate(date);
      openCreateEvent();
    },
    [openCreateEvent],
  );

  const handleClickDay = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      setViewMode("day");
    },
    [setCurrentDate, setViewMode],
  );

  const handleClickEvent = useCallback(
    (event: CalendarEvent) => {
      selectEvent(event.id);
    },
    [selectEvent],
  );

  const handleEdit = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    openCreateEvent();
  }, [openCreateEvent]);

  const handleDeleteEvent = useCallback(
    (googleEventId: string) => {
      setEvents(events.filter((e) => e.googleEventId !== googleEventId));
      selectEvent(null);
    },
    [events, setEvents, selectEvent],
  );

  const handleEventDrop = useCallback(
    async (googleEventId: string, newStart: Date) => {
      const event = events.find((e) => e.googleEventId === googleEventId);
      if (!event) return;

      const oldStart = new Date(event.startTime);
      const oldEnd = new Date(event.endTime);
      const durationMs = oldEnd.getTime() - oldStart.getTime();
      const newEnd = new Date(newStart.getTime() + durationMs);

      // Optimistic update
      const updatedEvents = events.map((e) =>
        e.googleEventId === googleEventId
          ? {
              ...e,
              startTime: newStart,
              endTime: newEnd,
            }
          : e,
      );
      setEvents(updatedEvents);

      try {
        await updateMutation.mutateAsync({
          googleEventId,
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
        });
      } catch (err) {
        console.error("Failed to move event:", err);
        // Rollback
        setEvents(events);
      }
    },
    [events, setEvents, updateMutation],
  );

  const handleRSVP = useCallback(
    async (googleEventId: string, status: "accepted" | "declined" | "tentative") => {
      try {
        await rsvpMutation.mutateAsync({ googleEventId, status });
      } catch (err) {
        console.error("Failed to update RSVP:", err);
      }
    },
    [rsvpMutation],
  );

  const handleSendInvite = useCallback(
    (_email: string) => {
      if (!selectedEvent) return;
      // Triggered in EventDetailPanel, just a callback bridge
    },
    [selectedEvent],
  );

  const handleEventCreated = useCallback(() => {
    void eventsQuery.refetch();
    clearPrefillEvent();
    setEditingEvent(null);
    setCreateSlotDate(undefined);
  }, [eventsQuery, clearPrefillEvent]);

  const handleModalClose = useCallback(() => {
    closeCreateEvent();
    setEditingEvent(null);
    setCreateSlotDate(undefined);
    clearPrefillEvent();
  }, [closeCreateEvent, clearPrefillEvent]);

  const displayedEvents = ((eventsQuery.data as unknown as CalendarEvent[] | undefined) ?? events);
  const eventDates = displayedEvents.map((e) => new Date(e.startTime));

  const VIEW_MODES: { key: CalendarViewMode; label: string }[] = [
    { key: "day", label: "Day" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left Sidebar ───────────────────────────────────────── */}
      <div className="w-[220px] flex-shrink-0 border-r border-[#222222] flex flex-col bg-[#0A0A0A] overflow-y-auto">
        {/* Mini Calendar */}
        <MiniCalendar
          selectedDate={currentDate}
          onSelectDate={(date) => {
            setCurrentDate(date);
            if (viewMode === "month") setViewMode("week");
          }}
          eventDates={eventDates}
        />

        <div className="px-3 pb-3 border-t border-[#222222] pt-3">
          {/* Quick Add Button */}
          <button
            onClick={() => {
              setCreateSlotDate(undefined);
              openCreateEvent();
            }}
            className="w-full py-2 bg-[#0066ff] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-900/20 mb-2"
          >
            <Plus className="w-3.5 h-3.5" />
            New Event
          </button>

          {/* Sync Button */}
          <button
            onClick={() => syncMutation.mutate({ maxResults: 50 })}
            disabled={syncMutation.isPending}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            {syncMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Sync Calendar
          </button>
        </div>

        {/* Quick Schedule */}
        <div className="px-3 pb-4 border-t border-[#222222] pt-3">
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            ✨ Quick Schedule
          </div>
          <QuickSchedule
            onConfirm={() => {
              void eventsQuery.refetch();
            }}
          />
        </div>
      </div>

      {/* ── Main Calendar Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 border-b border-[#222222] flex items-center justify-between px-5 gap-4 flex-shrink-0 bg-[#0A0A0A]/60 backdrop-blur">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition"
            >
              Today
            </button>
            <button
              onClick={goToNext}
              className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current range label */}
          <h2 className="text-sm font-bold text-zinc-200 flex-1 text-center truncate">
            {getViewLabel(currentDate, viewMode)}
          </h2>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 gap-0.5">
            {VIEW_MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === key
                    ? "bg-[#0066ff] text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {eventsQuery.isLoading && displayedEvents.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-[#0066ff] animate-spin" />
              </div>
            ) : viewMode === "week" ? (
              <WeekView
                currentDate={currentDate}
                events={displayedEvents}
                onClickEvent={handleClickEvent}
                onClickSlot={handleClickSlot}
                onEventDrop={handleEventDrop}
              />
            ) : viewMode === "day" ? (
              <DayView
                currentDate={currentDate}
                events={displayedEvents}
                onClickEvent={handleClickEvent}
                onClickSlot={handleClickSlot}
                onEventDrop={handleEventDrop}
              />
            ) : (
              <MonthView
                currentDate={currentDate}
                events={displayedEvents}
                onClickEvent={handleClickEvent}
                onClickDay={handleClickDay}
              />
            )}
          </div>

          {/* Event Detail Panel */}
          {selectedEvent && (
            <EventDetailPanel
              event={selectedEvent}
              onClose={() => selectEvent(null)}
              onEdit={handleEdit}
              onDelete={handleDeleteEvent}
              onSendInvite={handleSendInvite}
              onRSVP={handleRSVP}
            />
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <CreateEventModal
        isOpen={isCreatingEvent}
        onClose={handleModalClose}
        onCreated={handleEventCreated}
        prefillDate={createSlotDate}
        prefillData={prefillEvent}
        editEvent={
          editingEvent
            ? {
                googleEventId: editingEvent.googleEventId,
                title: editingEvent.title,
                startTime: new Date(editingEvent.startTime),
                endTime: new Date(editingEvent.endTime),
                description: editingEvent.description,
                location: editingEvent.location,
                attendees: Array.isArray(editingEvent.attendees)
                  ? (editingEvent.attendees as Array<{ email: string; name?: string; status: string }>)
                  : [],
              }
            : null
        }
      />
    </div>
  );
}
