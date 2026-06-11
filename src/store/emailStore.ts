/**
 * Valora — Email Store (Zustand)
 * Client-side email state management
 */
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Email, PriorityLabel } from "@/types";

type InboxSection = "all" | PriorityLabel;

interface EmailState {
  // Data
  emails: Email[];
  selectedEmailId: string | null;
  selectedEmailIds: Set<string>; // For bulk actions
  activeThread: string | null;
  activeSection: InboxSection;

  // UI state
  isComposing: boolean;
  composeReplyTo: Email | null;
  isLoading: boolean;
  searchQuery: string;

  // Actions — Data
  setEmails: (emails: Email[]) => void;
  addEmail: (email: Email) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  removeEmail: (id: string) => void;

  // Actions — Selection
  selectEmail: (id: string | null) => void;
  toggleEmailSelection: (id: string) => void;
  selectAllEmails: () => void;
  clearSelection: () => void;

  // Actions — Thread
  openThread: (threadId: string) => void;
  closeThread: () => void;

  // Actions — UI
  setSection: (section: InboxSection) => void;
  openCompose: (replyTo?: Email) => void;
  closeCompose: () => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Actions — Email operations
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  toggleStar: (id: string) => void;
  archiveEmail: (id: string) => void;
  bulkArchive: () => void;
  bulkMarkRead: () => void;
}

export const useEmailStore = create<EmailState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    emails: [],
    selectedEmailId: null,
    selectedEmailIds: new Set(),
    activeThread: null,
    activeSection: "all",
    isComposing: false,
    composeReplyTo: null,
    isLoading: false,
    searchQuery: "",

    // Data actions
    setEmails: (emails) => set({ emails }),
    addEmail: (email) =>
      set((state) => ({ emails: [email, ...state.emails] })),
    updateEmail: (id, updates) =>
      set((state) => ({
        emails: state.emails.map((e) =>
          e.id === id ? { ...e, ...updates } : e,
        ),
      })),
    removeEmail: (id) =>
      set((state) => ({
        emails: state.emails.filter((e) => e.id !== id),
        selectedEmailId:
          state.selectedEmailId === id ? null : state.selectedEmailId,
      })),

    // Selection actions
    selectEmail: (id) => set({ selectedEmailId: id, selectedEmailIds: new Set() }),
    toggleEmailSelection: (id) =>
      set((state) => {
        const next = new Set(state.selectedEmailIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { selectedEmailIds: next };
      }),
    selectAllEmails: () =>
      set((state) => ({
        selectedEmailIds: new Set(state.emails.map((e) => e.id)),
      })),
    clearSelection: () =>
      set({ selectedEmailIds: new Set(), selectedEmailId: null }),

    // Thread actions
    openThread: (threadId) => set({ activeThread: threadId }),
    closeThread: () => set({ activeThread: null, selectedEmailId: null }),

    // UI actions
    setSection: (section) => set({ activeSection: section, selectedEmailId: null }),
    openCompose: (replyTo) => set({ isComposing: true, composeReplyTo: replyTo ?? null }),
    closeCompose: () => set({ isComposing: false, composeReplyTo: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),

    // Email operations (optimistic updates)
    markAsRead: (id) => get().updateEmail(id, { isRead: true }),
    markAsUnread: (id) => get().updateEmail(id, { isRead: false }),
    toggleStar: (id) => {
      const email = get().emails.find((e) => e.id === id);
      if (email) get().updateEmail(id, { isStarred: !email.isStarred });
    },
    archiveEmail: (id) => {
      get().updateEmail(id, { isArchived: true });
      if (get().selectedEmailId === id) get().closeThread();
    },
    bulkArchive: () => {
      const ids = get().selectedEmailIds;
      ids.forEach((id) => get().updateEmail(id, { isArchived: true }));
      get().clearSelection();
    },
    bulkMarkRead: () => {
      const ids = get().selectedEmailIds;
      ids.forEach((id) => get().updateEmail(id, { isRead: true }));
      get().clearSelection();
    },
  })),
);

// ── Derived selectors ──────────────────────────────────────────
export const selectEmailsByPriority = (state: EmailState, label: PriorityLabel) =>
  state.emails.filter((e) => !e.isArchived && e.priorityLabel === label);

export const selectUnreadCount = (state: EmailState) =>
  state.emails.filter((e) => !e.isRead && !e.isArchived).length;

export const selectFilteredEmails = (state: EmailState) => {
  let emails = state.emails.filter((e) => !e.isArchived);
  if (state.activeSection !== "all") {
    emails = emails.filter((e) => e.priorityLabel === state.activeSection);
  }
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    emails = emails.filter(
      (e) =>
        e.subject.toLowerCase().includes(q) ||
        e.fromEmail.toLowerCase().includes(q) ||
        e.fromName?.toLowerCase().includes(q) ||
        e.bodyPreview.toLowerCase().includes(q),
    );
  }
  return emails;
};
