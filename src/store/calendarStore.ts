/**
 * Valora — Calendar Store (Zustand)
 */
import { create } from "zustand";
import type { CalendarEvent, CalendarViewMode } from "@/types";

interface CalendarState {
  events: CalendarEvent[];
  viewMode: CalendarViewMode;
  currentDate: Date;
  selectedEventId: string | null;
  isCreatingEvent: boolean;
  isLoading: boolean;

  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  removeEvent: (id: string) => void;

  setViewMode: (mode: CalendarViewMode) => void;
  setCurrentDate: (date: Date) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;

  selectEvent: (id: string | null) => void;
  openCreateEvent: () => void;
  closeCreateEvent: () => void;
  setLoading: (loading: boolean) => void;

  // Email-to-Calendar quick action
  prefillEvent: { title: string; attendees: string[]; suggestedTime: string; duration: number; description?: string } | null;
  setPrefillEvent: (data: CalendarState["prefillEvent"]) => void;
  clearPrefillEvent: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  viewMode: "month",
  currentDate: new Date(),
  selectedEventId: null,
  isCreatingEvent: false,
  isLoading: false,
  prefillEvent: null,

  setEvents: (events) => set({ events }),
  addEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, ...updates } : e,
      ),
    })),
  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
      selectedEventId:
        state.selectedEventId === id ? null : state.selectedEventId,
    })),

  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentDate: (currentDate) => set({ currentDate }),
  goToToday: () => set({ currentDate: new Date() }),
  goToPrevious: () => {
    const { currentDate, viewMode } = get();
    const next = new Date(currentDate);
    if (viewMode === "day") next.setDate(next.getDate() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    set({ currentDate: next });
  },
  goToNext: () => {
    const { currentDate, viewMode } = get();
    const next = new Date(currentDate);
    if (viewMode === "day") next.setDate(next.getDate() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    set({ currentDate: next });
  },

  selectEvent: (selectedEventId) => set({ selectedEventId }),
  openCreateEvent: () => set({ isCreatingEvent: true }),
  closeCreateEvent: () => set({ isCreatingEvent: false }),
  setLoading: (isLoading) => set({ isLoading }),

  // Email-to-Calendar
  setPrefillEvent: (prefillEvent) => set({ prefillEvent, isCreatingEvent: true }),
  clearPrefillEvent: () => set({ prefillEvent: null }),
}));
