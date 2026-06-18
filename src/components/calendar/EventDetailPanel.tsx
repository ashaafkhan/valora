"use client";

/**
 * Valora — EventDetailPanel (Stage 8)
 * Right-side slide-in panel showing full event details, RSVP, Meet link, edit/delete
 */
import type { CalendarEvent } from "@/types";
import {
  X,
  MapPin,
  Video,
  Users,
  Edit2,
  Trash2,
  Check,
  X as XIcon,
  HelpCircle,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";

interface EventDetailPanelProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (googleEventId: string) => void;
  onSendInvite: (email: string) => void;
  onRSVP?: (googleEventId: string, status: "accepted" | "declined" | "tentative") => void;
}

function formatDuration(start: Date, end: Date): string {
  const mins = differenceInMinutes(end, start);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

/** Shape of attendees stored in JSON column */
interface Attendee {
  email: string;
  name?: string;
  status?: string;
}

export default function EventDetailPanel({
  event,
  onClose,
  onEdit,
  onDelete,
  onSendInvite,
  onRSVP,
}: EventDetailPanelProps) {
  const deleteMutation = api.calendar.deleteEvent.useMutation();
  const sendInviteMutation = api.calendar.sendInviteEmail.useMutation();
  
  const { data: session } = useSession();

  if (!event) return null;

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const rawAttendees = Array.isArray(event.attendees) ? event.attendees : [];
  
  const attendees: Attendee[] = rawAttendees.map((a: any) => {
    if (typeof a === "string") return { email: a, status: "needsAction" };
    return {
      email: a.email || "",
      name: a.name,
      status: a.status || "needsAction",
    };
  }).filter((a) => a.email);

  const userEmail = session?.user?.email;
  const userAttendee = attendees.find((a) => a.email === userEmail);
  const needsRsvp = userAttendee && userAttendee.status !== "accepted";

  const handleDelete = async () => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    await deleteMutation.mutateAsync({ googleEventId: event.googleEventId });
    onDelete(event.googleEventId);
  };

  return (
    <div className="w-80 flex-shrink-0 border-l border-border bg-surface flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-text-primary leading-tight">
            {event.title}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                event.status === "cancelled"
                  ? "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/30"
                  : event.status === "tentative"
                  ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30"
                  : "bg-emerald-200 text-[#17432d] border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30"
              }`}
            >
              {event.status === "confirmed" ? "Scheduled" : event.status}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
        {/* Date & Time */}
        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
          <div className="text-sm text-text-primary">
            <div className="font-semibold">
              {event.isAllDay
                ? format(start, "EEEE, MMMM d, yyyy")
                : format(start, "EEEE, MMMM d, yyyy")}
            </div>
            {!event.isAllDay && (
              <div className="text-xs text-text-muted mt-0.5">
                {format(start, "h:mm a")} – {format(end, "h:mm a")} ·{" "}
                {formatDuration(start, end)}
              </div>
            )}
            {event.isAllDay && (
              <div className="text-xs text-text-muted mt-0.5">All day</div>
            )}
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
            <span className="text-sm text-text-primary">{event.location}</span>
          </div>
        )}

        {/* Meet Link */}
        {event.videoLink && (
          <div className="flex items-start gap-3">
            <Video className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
            <a
              href={event.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-light hover:underline truncate"
            >
              Join Google Meet
            </a>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="text-sm text-text-secondary leading-relaxed bg-surface-hover/40 rounded-xl p-3 border border-border">
            {event.description}
          </div>
        )}

        {/* Attendees */}
        {attendees.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-widest">
              <Users className="w-3.5 h-3.5" />
              Attendees ({attendees.length})
            </div>
            <div className="space-y-1.5">
              {attendees.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-border flex items-center justify-center text-[10px] font-bold text-text-secondary flex-shrink-0">
                      {((a.name ?? a.email) ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-text-primary truncate">
                        {a.name ?? a.email}
                      </div>
                      {a.name && (
                        <div className="text-[10px] text-text-muted truncate">{a.email}</div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      a.status === "accepted"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : a.status === "declined"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {a.status === "accepted"
                      ? "✓"
                      : a.status === "declined"
                      ? "✗"
                      : "?"}
                  </span>
                </div>
              ))}
            </div>

            {/* Send invite to all attendees */}
            {attendees.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    for (const a of attendees) {
                      await sendInviteMutation.mutateAsync({
                        to: a.email,
                        eventTitle: event.title,
                        startTime: event.startTime.toISOString(),
                        endTime: event.endTime.toISOString(),
                        location: event.location || undefined,
                        meetLink: event.videoLink || undefined,
                      });
                    }
                  } catch (err) {
                    console.error("Failed to send invites:", err);
                  }
                }}
                disabled={sendInviteMutation.isPending}
                className="w-full mt-2 px-3 py-1.5 bg-surface-hover hover:bg-border border border-border text-text-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {sendInviteMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : sendInviteMutation.isSuccess ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Mail className="w-3 h-3" />
                )}
                {sendInviteMutation.isSuccess ? "Sent!" : "Send Email Invite"}
              </button>
            )}
          </div>
        )}

        {/* RSVP */}
        {needsRsvp && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              RSVP
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onRSVP?.(event.googleEventId, "accepted")}
                className="flex-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:border dark:border-emerald-800/30 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition"
              >
                <Check className="w-3 h-3" /> Accept
              </button>
              <button
                onClick={() => onRSVP?.(event.googleEventId, "tentative")}
                className="flex-1 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-surface-hover dark:hover:bg-border border border-border dark:text-text-secondary text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition"
              >
                <HelpCircle className="w-3 h-3" /> Maybe
              </button>
              <button
                onClick={() => onRSVP?.(event.googleEventId, "declined")}
                className="flex-1 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:border dark:border-rose-800/30 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition"
              >
                <XIcon className="w-3 h-3" /> Decline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-4 border-t border-border flex items-center gap-2">
        <button
          onClick={() => onEdit(event)}
          className="flex-1 py-2 bg-surface-hover hover:bg-border border border-border text-text-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Event
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="py-2 px-3 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-800/30 text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
