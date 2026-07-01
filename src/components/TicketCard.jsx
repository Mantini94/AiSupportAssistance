import { Clock3, Radio } from "lucide-react";
import { AiAnalysisCard } from "./AiAnalysisCard";
import { ConversationThread } from "./ConversationThread";
import { ReplyPanel } from "./ReplyPanel";
import { SuggestedActions } from "./SuggestedActions";
import { formatStatus, getTicketSubject, safeValue, STATUS_OPTIONS } from "../lib/ticketHelpers";

function formatRelativeTime(dateValue) {
  if (!dateValue) return "No activity";

  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function TicketCard({
  ticket,
  messages,
  replyDraft,
  savingTicketId,
  onReplyDraftChange,
  onSaveReply,
  onApproveReply,
  onRegenerateReply,
  onMarkAsSent,
  onUpdateStatus,
  onDeleteTicket,
}) {
  const lastActivity = ticket.last_message_at || ticket.updated_at || ticket.created_at;

  const hasNewCustomerReply =
    ticket.status === "new" &&
    messages?.[messages.length - 1]?.role?.toLowerCase() === "customer";

  return (
    <article className={`ticket-card ${hasNewCustomerReply ? "ticket-card-live" : ""}`}>
      <div className="ticket-topline">
        <div className="ticket-meta-row">
          <p className="ticket-source">
            {safeValue(ticket.source, "manual")} · {safeValue(ticket.customer_email, "unknown customer")}
          </p>

          <span className="ticket-activity">
            <Clock3 size={14} />
            {formatRelativeTime(lastActivity)}
          </span>
        </div>

        <h3>{getTicketSubject(ticket)}</h3>

        <div className="ticket-badges">
          {hasNewCustomerReply && (
            <span className="new-reply-badge">
              <Radio size={13} />
              New reply
            </span>
          )}

          <span className={`status-badge status-${ticket.status}`}>
            {formatStatus(ticket.status)}
          </span>

          <span className={`risk-badge risk-${ticket.ai_risk}`}>
            Risk: {safeValue(ticket.ai_risk, "unknown")}
          </span>
        </div>
      </div>
<section className="ticket-workspace">
  <ConversationThread ticket={ticket} messages={messages} />

  <AiAnalysisCard ticket={ticket} />

  <SuggestedActions ticket={ticket} />

  <ReplyPanel
    ticket={ticket}
    replyDraft={replyDraft}
    savingTicketId={savingTicketId}
    onReplyDraftChange={onReplyDraftChange}
    onSaveReply={onSaveReply}
    onApproveReply={onApproveReply}
    onRegenerateReply={onRegenerateReply}
    onMarkAsSent={onMarkAsSent}
  />

<div className="workflow-toolbar">
  <div className="status-segmented" aria-label="Ticket status">
    {STATUS_OPTIONS.map((status) => (
      <button
        key={status}
        type="button"
        className={`status-segment ${ticket.status === status ? "active" : ""}`}
        onClick={() => onUpdateStatus(ticket.id, status)}
      >
        {formatStatus(status)}
      </button>
    ))}
  </div>

  <button
    type="button"
    className="delete-icon-button"
    onClick={() => onDeleteTicket(ticket.id)}
    title="Delete ticket"
  >
    Delete
  </button>
</div>
</section>

      
    </article>
  );
}