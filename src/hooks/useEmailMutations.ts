/**
 * @file useEmailMutations.ts
 * @description Custom hook wrapping archive/star/mark-read tRPC mutations with optimistic updates
 *
 * WHY: TanStack Query's optimistic update pattern requires rollback on failure.
 * This hook encapsulates the onMutate/onError pattern so components just call
 * archive(id), toggleStar(id), markRead(id, read) without error handling boilerplate.
 *
 * ARCHITECTURE NOTE: Uses Zustand store for the optimistic part (instant UI update)
 * and tRPC for the server sync. On error, the Zustand store is rolled back AND
 * the TanStack Query cache is invalidated to ensure consistency.
 */
import { useCallback } from "react";
import { api } from "@/trpc/react";
import { useEmailStore } from "@/store/emailStore";

export function useEmailMutations() {
  const utils = api.useUtils();

  const archiveMutation = api.gmail.archive.useMutation({
    onError: (_err, _vars) => {
      void utils.gmail.getEmails.invalidate();
    },
  });

  const starMutation = api.gmail.star.useMutation({
    onError: () => {
      void utils.gmail.getEmails.invalidate();
    },
  });

  const markReadMutation = api.gmail.markRead.useMutation({
    onError: () => {
      void utils.gmail.getEmails.invalidate();
    },
  });

  const { archiveEmail: storeArchive, toggleStar: storeToggleStar, markAsRead: storeMarkAsRead, markAsUnread: storeMarkAsUnread, emails } = useEmailStore();

  const handleArchive = useCallback(
    (gmailId: string) => {
      const email = emails.find((e) => e.gmailId === gmailId);
      if (!email) return;
      const prev = { ...email };
      storeArchive(email.id);
      archiveMutation.mutate(
        { gmailId },
        {
          onError: () => {
            useEmailStore.getState().updateEmail(email.id, prev);
          },
        },
      );
    },
    [emails, storeArchive, archiveMutation],
  );

  const handleToggleStar = useCallback(
    (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (!email) return;
      const prev = { ...email };
      storeToggleStar(id);
      starMutation.mutate(
        { gmailId: email.gmailId, star: !email.isStarred },
        {
          onError: () => {
            useEmailStore.getState().updateEmail(id, prev);
          },
        },
      );
    },
    [emails, storeToggleStar, starMutation],
  );

  const handleMarkRead = useCallback(
    (id: string, read: boolean) => {
      const email = emails.find((e) => e.id === id);
      if (!email) return;
      const prev = { ...email };
      if (read) {
        storeMarkAsRead(id);
      } else {
        storeMarkAsUnread(id);
      }
      markReadMutation.mutate(
        { gmailId: email.gmailId, read },
        {
          onError: () => {
            useEmailStore.getState().updateEmail(id, prev);
          },
        },
      );
    },
    [emails, storeMarkAsRead, storeMarkAsUnread, markReadMutation],
  );

  return {
    archive: handleArchive,
    toggleStar: handleToggleStar,
    markRead: handleMarkRead,
    isArchiving: archiveMutation.isPending,
    isStarring: starMutation.isPending,
    isMarkingRead: markReadMutation.isPending,
  };
}
