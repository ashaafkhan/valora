"use client";

/**
 * Valora — Calendar Page (Stage 8)
 * The full Google Calendar integration — Week/Day/Month views, QuickSchedule, and event management
 */
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with date-fns and browser APIs
const CalendarView = dynamic(
  () => import("@/components/calendar/CalendarView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center animate-pulse">
            <svg
              className="w-5 h-5 text-[#A855F7]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-xs text-zinc-600 font-mono">Loading calendar…</span>
        </div>
      </div>
    ),
  },
);

export default function CalendarPage() {
  return (
    <div className="flex-1 h-full overflow-hidden">
      <CalendarView />
    </div>
  );
}
