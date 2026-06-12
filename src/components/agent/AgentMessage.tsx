import { Mail, Calendar, Check, X, Bot, User, Clock } from "lucide-react";

export interface ToolCallData {
  id: string;
  name: string;
  arguments: any;
  status?: "pending" | "approved" | "rejected";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  toolCall?: ToolCallData;
}

interface AgentMessageProps {
  message: ChatMessage;
  onActionConfirm?: (messageId: string, toolCall: ToolCallData, wasApproved: boolean) => void;
  isActionLoading?: boolean;
}

export function AgentMessage({ message, onActionConfirm, isActionLoading }: AgentMessageProps) {
  const isUser = message.role === "user";
  const { toolCall } = message;

  return (
    <div className={`flex gap-4 p-4 rounded-2xl transition-all duration-200 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 valora-glow">
          <Bot className="w-4 h-4 text-primary-light" />
        </div>
      )}

      {/* Bubble Content */}
      <div className="max-w-[75%] flex flex-col gap-3">
        {/* Text Body */}
        {message.content && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs leading-relaxed font-medium theme-transition shadow-sm
              ${
                isUser
                  ? "bg-primary text-white rounded-tr-none font-sans"
                  : "bg-surface border border-border text-text-primary rounded-tl-none valora-glass"
              }`}
          >
            {message.content}
          </div>
        )}

        {/* Action Confirmation Card */}
        {toolCall && (
          <div className="border border-border/80 rounded-2xl bg-surface p-4 flex flex-col gap-4 shadow-lg valora-glass min-w-[320px] max-w-[450px]">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-text-muted uppercase">
                {toolCall.name === "send_email" ? (
                  <>
                    <Mail className="w-3.5 h-3.5 text-primary-light" />
                    <span>Email Action Required</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-primary-light" />
                    <span>Calendar Action Required</span>
                  </>
                )}
              </div>

              {toolCall.status && toolCall.status !== "pending" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                    ${
                      toolCall.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-error/10 text-error border border-error/20"
                    }`}
                >
                  {toolCall.status === "approved" ? "Approved" : "Cancelled"}
                </span>
              )}
            </div>

            {/* Action Details */}
            <div className="text-[11px] space-y-2.5 text-text-secondary leading-normal">
              {toolCall.name === "send_email" && (
                <>
                  <div className="flex gap-1.5">
                    <span className="font-semibold text-text-muted w-14 flex-shrink-0">Recipient:</span>
                    <span className="text-text-primary truncate">{toolCall.arguments.to}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="font-semibold text-text-muted w-14 flex-shrink-0">Subject:</span>
                    <span className="text-text-primary truncate font-bold">{toolCall.arguments.subject}</span>
                  </div>
                  <div className="border border-border/30 rounded-xl bg-background/40 p-2.5 max-h-32 overflow-y-auto text-[10px] font-mono leading-relaxed mt-1 whitespace-pre-wrap">
                    {toolCall.arguments.body}
                  </div>
                </>
              )}

              {toolCall.name === "create_event" && (
                <>
                  <div className="flex gap-1.5">
                    <span className="font-semibold text-text-muted w-14 flex-shrink-0">Event:</span>
                    <span className="text-text-primary truncate font-bold">{toolCall.arguments.title}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="font-semibold text-text-muted w-14 flex-shrink-0">Start:</span>
                    <span className="text-text-primary font-mono text-[10px]">
                      {new Date(toolCall.arguments.startISO).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="font-semibold text-text-muted w-14 flex-shrink-0">End:</span>
                    <span className="text-text-primary font-mono text-[10px]">
                      {new Date(toolCall.arguments.endISO).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {toolCall.arguments.attendees && toolCall.arguments.attendees.length > 0 && (
                    <div className="flex gap-1.5">
                      <span className="font-semibold text-text-muted w-14 flex-shrink-0">Guests:</span>
                      <span className="text-text-primary truncate">
                        {toolCall.arguments.attendees.join(", ")}
                      </span>
                    </div>
                  )}
                  {toolCall.arguments.description && (
                    <div className="border border-border/30 rounded-xl bg-background/40 p-2.5 max-h-24 overflow-y-auto text-[10px] italic mt-1">
                      {toolCall.arguments.description}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons (Pending state only) */}
            {toolCall.status === "pending" && onActionConfirm && (
              <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border/40">
                <button
                  onClick={() => onActionConfirm(message.id, toolCall, false)}
                  disabled={isActionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold bg-surface-hover hover:bg-zinc-800 text-text-secondary hover:text-text-primary border border-border transition disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  onClick={() => onActionConfirm(message.id, toolCall, true)}
                  disabled={isActionLoading}
                  className="flex items-center gap-1.5 px-4.5 py-1.5 rounded-xl text-[10px] font-semibold bg-primary hover:bg-primary/95 text-white border border-primary/20 transition shadow-sm disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirm Action
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Icon */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-surface-hover border border-border flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-text-secondary" />
        </div>
      )}
    </div>
  );
}
