/**
 * Valora — Central Type Definitions
 * All shared types across the application
 */

// ── Priority / Labels ──────────────────────────────────────────
export type PriorityLabel = "urgent" | "high" | "normal" | "low";

export interface PriorityInfo {
  label: PriorityLabel;
  score: number; // 0-100
  reason?: string;
}

// ── Email ──────────────────────────────────────────────────────
export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface Email {
  id: string;
  gmailId: string;
  threadId: string;
  subject: string;
  fromEmail: string;
  fromName?: string;
  toEmails: string[];
  ccEmails: string[];
  body: string;
  bodyPreview: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  priorityScore: number;
  priorityLabel: PriorityLabel;
  isSensitive: boolean;
  sensitiveTypes: SensitiveType[];
  sentAt: Date;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailThread {
  id: string;
  subject: string;
  snippet: string;
  emails: Email[];
  latestEmail?: Email;
  unreadCount?: number;
}

export type SensitiveType = "bank" | "otp" | "password" | "medical" | "legal" | "personal";

// ── Email Actions ──────────────────────────────────────────────
export interface SendEmailPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  replyToMessageId?: string;
  replyToThreadId?: string;
  scheduledAt?: Date;
}

export interface DraftPayload {
  to?: string[];
  cc?: string[];
  subject?: string;
  body?: string;
  replyToMessageId?: string;
}

export interface ModifyEmailPayload {
  addLabels?: string[];
  removeLabels?: string[];
  isRead?: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
}

// ── Calendar ───────────────────────────────────────────────────
export type CalendarViewMode = "day" | "week" | "month";

export interface Attendee {
  email: string;
  name?: string;
  status: "accepted" | "declined" | "tentative" | "needsAction";
  isOrganizer?: boolean;
}

export interface CalendarEvent {
  id: string;
  googleEventId: string;
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  attendees: Attendee[];
  recurrence?: string;
  videoLink?: string;
  status: "confirmed" | "tentative" | "cancelled";
  color?: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  attendees?: Pick<Attendee, "email" | "name">[];
  recurrence?: string;
  calendarId?: string;
}

// ── AI Agent ───────────────────────────────────────────────────
export type AgentRole = "user" | "assistant";

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  metadata?: AgentMessageMetadata;
  createdAt: Date;
}

export interface AgentMessageMetadata {
  toolsUsed?: string[];
  actionsTaken?: AgentAction[];
  emailIds?: string[];
  eventIds?: string[];
  thinking?: string;
}

export interface AgentAction {
  type: "send_email" | "create_event" | "archive_email" | "label_email" | "search" | "summarize";
  description: string;
  confirmed: boolean;
  result?: string;
}

// ── Search ─────────────────────────────────────────────────────
export interface SearchResult {
  id: string;
  type: "email" | "event";
  title: string;
  preview: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface SearchQuery {
  query: string;
  type?: "email" | "event" | "all";
  limit?: number;
  from?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachment?: boolean;
  labels?: string[];
}

// ── User / Preferences ─────────────────────────────────────────
export interface UserPreferences {
  enableAIPriority: boolean;
  enableSecurityShield: boolean;
  enableKeyboardShortcuts: boolean;
  defaultCalendarView: CalendarViewMode;
  emailsPerPage: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  theme: "dark" | "light";
  preferences: UserPreferences;
  onboardingDone: boolean;
}

// ── API Responses ──────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextPageToken?: string;
  total?: number;
  hasMore: boolean;
}

// ── Keyboard Shortcuts ──────────────────────────────────────────
export interface KeyboardShortcut {
  key: string;
  modifier?: "ctrl" | "meta" | "shift" | "alt";
  description: string;
  action: () => void;
  scope?: "global" | "inbox" | "compose" | "calendar" | "agent";
}

// ── UI State ────────────────────────────────────────────────────
export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export type SidebarSection = "inbox" | "calendar" | "agent" | "search" | "settings";

// ── Webhook ─────────────────────────────────────────────────────
export interface WebhookPayload {
  source: "gmail" | "calendar";
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature?: string;
}
