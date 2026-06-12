"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useEmailStore, selectFilteredEmails } from "@/store/emailStore";
import { useCalendarStore } from "@/store/calendarStore";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboard";
import EmailList from "@/components/inbox/EmailList";
import EmailThread from "@/components/inbox/EmailThread";
import ComposeModal from "@/components/inbox/ComposeModal";
import { PenSquare, Inbox } from "lucide-react";
import type { Email } from "@/types";

/**
 * Valora — Inbox Page (Stage 7: Gmail Core Module)
 * Three-panel command center: Sidebar (shared) | Email List | Email Thread
 */
export default function InboxPage() {
  const {
    emails,
    setEmails,
    selectedEmailId,
    selectEmail,
    activeThread,
    openThread,
    closeThread,
    openCompose,
    setLoading,
    markAsRead,
    toggleStar,
    archiveEmail,
    updateEmail,
  } = useEmailStore();

  const { setPrefillEvent } = useCalendarStore();
  const router = useRouter();

  // Subscribe to store changes to re-render filtered emails
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = useEmailStore.subscribe(() => setTick((n) => n + 1));
    return unsub;
  }, []);

  // Get filtered emails from store
  const displayEmails = selectFilteredEmails(useEmailStore.getState());

  // ── tRPC Queries & Mutations ────────────────────────────────────
  const emailsQuery = api.gmail.getEmails.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      refetchInterval: 2 * 60 * 1000, // Passive refresh every 2 minutes
    },
  );

  const threadQuery = api.gmail.getThread.useQuery(
    { threadId: activeThread! },
    {
      enabled: !!activeThread,
      refetchOnWindowFocus: false,
    },
  );

  const syncMutation = api.gmail.syncInbox.useMutation();
  const sendEmailMutation = api.gmail.sendEmail.useMutation();
  const archiveMutation = api.gmail.archive.useMutation();
  const starMutation = api.gmail.star.useMutation();
  const markReadMutation = api.gmail.markRead.useMutation();

  // ── Populate email store from server ───────────────────────────
  useEffect(() => {
    if (emailsQuery.data) {
      setEmails(emailsQuery.data as Email[]);
    }
  }, [emailsQuery.data, setEmails]);

  useEffect(() => {
    setLoading(emailsQuery.isLoading);
  }, [emailsQuery.isLoading, setLoading]);

  // ── Handlers ───────────────────────────────────────────────────
  const handleSelectEmail = useCallback(
    async (email: Email) => {
      selectEmail(email.id);
      openThread(email.threadId);

      // Mark as read (optimistic + server)
      if (!email.isRead) {
        markAsRead(email.id);
        markReadMutation.mutate({ gmailId: email.gmailId, read: true });
      }
    },
    [selectEmail, openThread, markAsRead, markReadMutation],
  );

  const handleToggleStar = useCallback(
    (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (!email) return;
      toggleStar(id); // Optimistic
      starMutation.mutate({ gmailId: email.gmailId, star: !email.isStarred });
    },
    [emails, toggleStar, starMutation],
  );

  const handleArchive = useCallback(
    (gmailId: string) => {
      const email = emails.find((e) => e.gmailId === gmailId);
      if (!email) return;
      archiveEmail(email.id); // Optimistic
      archiveMutation.mutate({ gmailId });
      if (activeThread === email.threadId) closeThread();
    },
    [emails, archiveEmail, archiveMutation, activeThread, closeThread],
  );

  const handleSync = useCallback(async () => {
    await syncMutation.mutateAsync({ maxThreads: 25 });
    await emailsQuery.refetch();
  }, [syncMutation, emailsQuery]);

  const handleSendEmail = useCallback(
    async (payload: { to: string; subject: string; body: string; cc?: string[] }) => {
      await sendEmailMutation.mutateAsync(payload);
    },
    [sendEmailMutation],
  );

  const handleReply = useCallback(
    async (body: string) => {
      if (!activeThread) return;
      const threadEmails = (threadQuery.data ?? []) as Email[];
      const lastEmail = threadEmails[threadEmails.length - 1];
      if (!lastEmail) return;

      await sendEmailMutation.mutateAsync({
        to: lastEmail.fromEmail,
        subject: lastEmail.subject.toLowerCase().startsWith("re:")
          ? lastEmail.subject
          : `Re: ${lastEmail.subject}`,
        body,
      });
    },
    [activeThread, threadQuery.data, sendEmailMutation],
  );

  const handleToggleStarThread = useCallback(
    (gmailId: string, starred: boolean) => {
      const email = emails.find((e) => e.gmailId === gmailId);
      if (!email) return;
      updateEmail(email.id, { isStarred: starred });
      starMutation.mutate({ gmailId, star: starred });
    },
    [emails, updateEmail, starMutation],
  );

  // Email-to-Calendar: prefill calendar store and redirect
  const handleScheduleMeeting = useCallback(
    (extracted: {
      title: string;
      attendees: string[];
      suggestedTime: string;
      duration: number;
      description?: string;
    }) => {
      setPrefillEvent(extracted);
      router.push("/calendar");
    },
    [setPrefillEvent, router],
  );

  // Build thread emails from query
  const threadEmails = activeThread
    ? ((threadQuery.data ?? []) as Email[])
    : [];

  // ── Keyboard Shortcuts (after handlers) ───────────────────────
  const inboxShortcuts = useMemo(() => {
    const getSelected = () => {
      if (!selectedEmailId) return null;
      return emails.find((e) => e.id === selectedEmailId) ?? null;
    };

    return [
      {
        shortcut: { key: "c" },
        action: () => openCompose(),
      },
      {
        shortcut: { key: "Escape" },
        action: () => { if (activeThread) closeThread(); },
      },
      {
        shortcut: { key: "e" },
        action: () => {
          const email = getSelected();
          if (email) handleArchive(email.gmailId);
        },
      },
      {
        shortcut: { key: "r" },
        action: () => {
          const email = getSelected();
          if (!email) return;
          if (email.isRead) {
            useEmailStore.getState().markAsUnread(email.id);
          } else {
            markAsRead(email.id);
          }
          markReadMutation.mutate({ gmailId: email.gmailId, read: !email.isRead });
        },
      },
      {
        shortcut: { key: "*" },
        action: () => {
          const email = getSelected();
          if (email) handleToggleStar(email.id);
        },
      },
      {
        shortcut: { key: "j" },
        action: () => {
          const ids = displayEmails.map((e) => e.id);
          if (ids.length === 0) return;
          const curIdx = selectedEmailId ? ids.indexOf(selectedEmailId) : -1;
          const next = curIdx < ids.length - 1 ? curIdx + 1 : 0;
          const email = displayEmails[next];
          if (email) handleSelectEmail(email);
        },
      },
      {
        shortcut: { key: "k" },
        action: () => {
          const ids = displayEmails.map((e) => e.id);
          if (ids.length === 0) return;
          const curIdx = selectedEmailId ? ids.indexOf(selectedEmailId) : 1;
          const prev = curIdx > 0 ? curIdx - 1 : ids.length - 1;
          const email = displayEmails[prev];
          if (email) handleSelectEmail(email);
        },
      },
      {
        shortcut: { key: "Enter" },
        action: () => {
          if (!selectedEmailId) {
            const first = displayEmails[0];
            if (first) handleSelectEmail(first);
          }
        },
      },
      {
        shortcut: { key: "x" },
        action: () => {
          if (selectedEmailId) useEmailStore.getState().toggleEmailSelection(selectedEmailId);
        },
      },
    ];
  }, [emails, selectedEmailId, activeThread, displayEmails, openCompose, closeThread, handleArchive, handleToggleStar, handleSelectEmail, markAsRead, markReadMutation]);

  useKeyboardShortcuts(inboxShortcuts);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ── Email List Panel ─────────────────────────────────── */}
      <EmailList
        emails={displayEmails}
        focusedEmailId={selectedEmailId}
        onSelectEmail={handleSelectEmail}
        onToggleStar={handleToggleStar}
        onSync={handleSync}
        isSyncing={syncMutation.isPending}
      />

      {/* ── Thread / Detail Panel ────────────────────────────── */}
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        {activeThread ? (
          <EmailThread
            threadId={activeThread}
            emailsInThread={threadEmails}
            isLoading={threadQuery.isLoading}
            onArchive={handleArchive}
            onToggleStar={handleToggleStarThread}
            onReply={handleReply}
            isReplying={sendEmailMutation.isPending}
            onScheduleMeeting={handleScheduleMeeting}
          />
        ) : (
          /* Empty state — no thread selected */
          <div className="flex flex-col items-center justify-center h-full bg-[#070707] text-zinc-600 select-none">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900/50 border border-zinc-800/60 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-zinc-700" />
            </div>
            <p className="text-sm font-semibold text-zinc-400">
              No conversation selected
            </p>
            <p className="text-xs text-zinc-600 mt-1.5 text-center max-w-[220px] leading-relaxed">
              Choose an email from the list or press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono">
                C
              </kbd>{" "}
              to compose
            </p>
          </div>
        )}
      </div>

      {/* ── Compose Button (floating) ─────────────────────────── */}
      <button
        onClick={() => openCompose()}
        id="inbox-compose-btn"
        title="Compose new email (C)"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-900/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40"
      >
        <PenSquare className="w-5 h-5" />
      </button>

      {/* ── Compose Modal ─────────────────────────────────────── */}
      <ComposeModal
        onSend={handleSendEmail}
        isSending={sendEmailMutation.isPending}
      />
    </div>
  );
}
