"use client";

/**
 * Valora — CreateEventModal (Stage 8)
 * Full create/edit modal with conflict detection, Meet toggle, and attendees
 */
import { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  AlertTriangle,
  Loader2,
  Check,
  Plus,
} from "lucide-react";
import { format, addHours, parseISO } from "date-fns";
import { api } from "@/trpc/react";

interface PrefillData {
  title?: string;
  attendees?: string[];
  suggestedTime?: string;
  duration?: number;
  description?: string;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  prefillDate?: Date; // from click-to-create
  prefillData?: PrefillData | null; // from Email-to-Calendar
  editEvent?: {
    googleEventId: string;
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    location?: string;
    attendees?: any[];
  } | null;
}

function dateToInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onCreated,
  prefillDate,
  prefillData,
  editEvent,
}: CreateEventModalProps) {
  const now = prefillDate ?? new Date();
  const defaultStart = new Date(now);
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = addHours(defaultStart, 1);

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(dateToInputValue(defaultStart));
  const [endTime, setEndTime] = useState(dateToInputValue(defaultEnd));
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [addMeet, setAddMeet] = useState(false);
  const [conflict, setConflict] = useState<{ hasConflict: boolean; conflictWith?: string } | null>(null);

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const locationDebounce = useRef<NodeJS.Timeout | null>(null);

  const contactsQuery = api.gmail.getRecentContacts.useQuery(undefined, {
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const suggestions = (contactsQuery.data ?? [])
    .filter((contact) => {
      const input = attendeeInput.toLowerCase().trim();
      if (!input) return false;
      return (
        contact.email.toLowerCase().includes(input) ||
        (contact.name && contact.name.toLowerCase().includes(input))
      );
    })
    .filter((c) => !attendees.includes(c.email))
    .slice(0, 5);

  const isEditing = !!editEvent;

  // Populate from prefill/edit
  useEffect(() => {
    if (!isOpen) return;

    if (editEvent) {
      setTitle(editEvent.title);
      setStartTime(dateToInputValue(editEvent.startTime));
      setEndTime(dateToInputValue(editEvent.endTime));
      setDescription(editEvent.description ?? "");
      setLocation(editEvent.location ?? "");
      setAttendees(
        (editEvent.attendees ?? []).map((a: any) => a.email ?? a).filter(Boolean),
      );
    } else if (prefillData) {
      setTitle(prefillData.title ?? "");
      setAttendees(prefillData.attendees ?? []);
      setDescription(prefillData.description ?? "");
      if (prefillData.suggestedTime) {
        try {
          const s = new Date(prefillData.suggestedTime);
          const e = new Date(s.getTime() + (prefillData.duration ?? 30) * 60000);
          setStartTime(dateToInputValue(s));
          setEndTime(dateToInputValue(e));
        } catch {}
      } else {
        setStartTime(dateToInputValue(defaultStart));
        setEndTime(dateToInputValue(defaultEnd));
      }
    } else {
      setTitle("");
      setStartTime(dateToInputValue(defaultStart));
      setEndTime(dateToInputValue(defaultEnd));
      setDescription("");
      setLocation("");
      setAttendees([]);
      setAddMeet(false);
    }
    setConflict(null);
    setAttendeeInput("");
  }, [isOpen, editEvent, prefillData, prefillDate]);

  const createMutation = api.calendar.createEvent.useMutation();
  const updateMutation = api.calendar.updateEvent.useMutation();
  const conflictQuery = api.calendar.checkConflicts.useQuery(
    {
      startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : new Date().toISOString(),
      excludeEventId: editEvent?.googleEventId,
    },
    {
      enabled: !!startTime && !!endTime,
      refetchOnWindowFocus: false,
    },
  );

  // Update conflict state when query result changes
  useEffect(() => {
    if (conflictQuery.data) {
      setConflict({
        hasConflict: conflictQuery.data.hasConflict,
        conflictWith: conflictQuery.data.conflicts[0]?.title,
      });
    }
  }, [conflictQuery.data]);

  const addAttendee = () => {
    const email = attendeeInput.trim();
    if (email && !attendees.includes(email)) {
      setAttendees([...attendees, email]);
      setAttendeeInput("");
    }
  };

  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a !== email));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    if (isEditing && editEvent) {
      await updateMutation.mutateAsync({
        googleEventId: editEvent.googleEventId,
        title,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        description: description || undefined,
        location: location || undefined,
        attendees: attendees.length > 0 ? attendees : undefined,
      });
    } else {
      await createMutation.mutateAsync({
        title,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        description: description || undefined,
        location: location || undefined,
        attendees: attendees.length > 0 ? attendees : undefined,
        addMeetLink: addMeet,
      });
    }

    onCreated();
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-hover/50">
          <span className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {isEditing ? "Edit Event" : "New Event"}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            autoFocus
            className="w-full bg-transparent border-0 border-b border-border focus:border-primary outline-none text-lg font-semibold text-text-primary placeholder:text-text-muted/70 pb-2 transition"
          />

          {/* Conflict warning */}
          {conflict?.hasConflict && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/20 border border-amber-800/30 rounded-xl text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Conflicts with &quot;{conflict.conflictWith}&quot;
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" /> Start
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  // Auto-adjust end time to 1h after new start
                  if (e.target.value) {
                    const newEnd = addHours(new Date(e.target.value), 1);
                    setEndTime(dateToInputValue(newEnd));
                  }
                }}
                className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-sm text-text-primary outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" /> End
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-sm text-text-primary outline-none transition"
              />
            </div>
          </div>

          {/* Location */}
          <div className="relative">
            <div className="flex items-center gap-3 px-3 py-2 bg-surface border border-border rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (locationDebounce.current) clearTimeout(locationDebounce.current);
                  if (!e.target.value.trim()) {
                    setLocationSuggestions([]);
                    return;
                  }
                  locationDebounce.current = setTimeout(async () => {
                    setIsSearchingLocation(true);
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(e.target.value)}&limit=5`);
                      const data = await res.json();
                      setLocationSuggestions(data);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsSearchingLocation(false);
                    }
                  }, 600);
                }}
                placeholder="Location (optional)"
                className="flex-1 bg-transparent border-0 outline-none text-sm text-text-primary placeholder:text-text-muted focus:ring-0"
              />
              {isSearchingLocation && <Loader2 className="w-3.5 h-3.5 animate-spin text-text-muted" />}
            </div>
            {locationSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 z-50 bg-surface border border-border rounded-xl mt-1 overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                {locationSuggestions.map((loc: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setLocation(loc.display_name);
                      setLocationSuggestions([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-surface-hover text-sm text-text-primary flex flex-col gap-0.5 transition border-b border-border/50 last:border-0"
                  >
                    <span className="font-semibold text-text-primary line-clamp-1">{loc.display_name.split(",")[0]}</span>
                    <span className="text-[10px] text-text-muted line-clamp-1">{loc.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none resize-none transition"
          />

          {/* Attendees */}
          <div className="space-y-2">
            <label className="text-[10px] text-text-muted font-semibold uppercase tracking-widest flex items-center gap-1">
              <Users className="w-3 h-3" /> Attendees
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAttendee()}
                  placeholder="attendee@email.com"
                  className="flex-1 bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 outline-none transition"
                />
                <button
                  onClick={addAttendee}
                  className="px-3 py-2 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-50 bg-surface border border-border rounded-xl mt-1 overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                  {suggestions.map((contact) => (
                    <button
                      key={contact.email}
                      type="button"
                      onClick={() => {
                        setAttendees([...attendees, contact.email]);
                        setAttendeeInput("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm text-text-primary flex flex-col gap-0.5 transition border-b border-border/50 last:border-0"
                    >
                      {contact.name && (
                        <span className="font-semibold text-text-primary">{contact.name}</span>
                      )}
                      <span className="text-[10px] text-text-muted font-mono">{contact.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {attendees.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-full font-medium"
                  >
                    {email}
                    <button
                      onClick={() => removeAttendee(email)}
                      className="text-primary-light hover:text-rose-400 transition ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Google Meet Toggle */}
          {!isEditing && (
            <button
              onClick={() => setAddMeet(!addMeet)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition text-sm font-medium ${
                addMeet
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface-hover/30 border-border text-text-muted hover:border-border-strong hover:text-text-primary"
              }`}
            >
              <Video className="w-4 h-4" />
              {addMeet ? "✓ Google Meet link will be added" : "Add Google Meet link"}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-hover/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim()}
            className="px-5 py-2 bg-primary hover:bg-primary-hover disabled:bg-surface-hover disabled:border disabled:border-border disabled:text-text-muted text-white text-sm font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-primary/20"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isEditing ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </>
  );
}
