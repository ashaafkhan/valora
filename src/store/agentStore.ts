/**
 * Valora — Agent Store (Zustand)
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentMessage } from "@/types";

interface AgentState {
  messages: AgentMessage[];
  isTyping: boolean;
  isOpen: boolean;
  pendingAction: { type: string; description: string } | null;

  addMessage: (message: AgentMessage) => void;
  setMessages: (messages: AgentMessage[]) => void;
  clearMessages: () => void;
  setTyping: (typing: boolean) => void;
  openAgent: () => void;
  closeAgent: () => void;
  toggleAgent: () => void;
  setPendingAction: (action: { type: string; description: string } | null) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      messages: [],
      isTyping: false,
      isOpen: false,
      pendingAction: null,

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),
      setTyping: (isTyping) => set({ isTyping }),
      openAgent: () => set({ isOpen: true }),
      closeAgent: () => set({ isOpen: false }),
      toggleAgent: () => set((state) => ({ isOpen: !state.isOpen })),
      setPendingAction: (pendingAction) => set({ pendingAction }),
    }),
    {
      name: "valora-agent",
      partialize: (state) => ({ messages: state.messages.slice(-50) }), // Persist last 50 messages
    },
  ),
);
