/**
 * Valora — useEmailSync hook (Stage 7)
 * Handles background email sync polling and refetch on window focus
 */
"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEmailStore } from "@/store/emailStore";
import { api } from "@/trpc/react";

const SYNC_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes passive refresh

export function useEmailSync() {
  const { setEmails, setLoading, addEmail } = useEmailStore();
  const lastSyncRef = useRef<Date | null>(null);

  const emailsQuery = api.gmail.getEmails.useQuery(
    {},
    {
      refetchOnWindowFocus: true,
      refetchInterval: SYNC_INTERVAL_MS,
      staleTime: 60 * 1000, // 1 min stale
    }
  );

  const syncMutation = api.gmail.syncInbox.useMutation();

  // Sync emails into store
  useEffect(() => {
    if (emailsQuery.data) {
      setEmails(emailsQuery.data as any);
      lastSyncRef.current = new Date();
    }
  }, [emailsQuery.data, setEmails]);

  useEffect(() => {
    setLoading(emailsQuery.isLoading);
  }, [emailsQuery.isLoading, setLoading]);

  // Manual sync trigger
  const triggerSync = useCallback(
    async (maxThreads = 25) => {
      try {
        await syncMutation.mutateAsync({ maxThreads });
        await emailsQuery.refetch();
        lastSyncRef.current = new Date();
      } catch (err) {
        console.error("[useEmailSync] Sync failed:", err);
      }
    },
    [syncMutation, emailsQuery]
  );

  return {
    isSyncing: syncMutation.isPending || emailsQuery.isFetching,
    lastSync: lastSyncRef.current,
    triggerSync,
    refetch: emailsQuery.refetch,
  };
}
