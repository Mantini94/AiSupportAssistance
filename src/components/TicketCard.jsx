import { AiAnalysisCard } from "./AiAnalysisCard";
import { ConversationThread } from "./ConversationThread";
import { ReplyPanel } from "./ReplyPanel";
import { SuggestedActions } from "./SuggestedActions";
import { formatStatus, getTicketSubject, safeValue, STATUS_OPTIONS } from "../lib/ticketHelpers";

export function TicketCard({
  ticket,
  messages,
  replyDraft,
  savingTicketId,
  onReplyDraftChange,
  onSaveReply,
  onApproveReply,
  onMarkAsSent,
  onUpdateStatus,
  onDeleteTicket,
}) {
  return (
    <article className="ticket-card">
      <div className="ticket-topline">
        <p className="ticket-source">
          {safeValue(ticket.source, "manual")} · {safeValue(ticket.customer_email, "unknown customer")}
        </p>

        <h3>{getTicketSubject(ticket)}</h3>

        <div className="ticket-badges">
          <span className={`status-badge status-${ticket.status}`}>
            {formatStatus(ticket.status)}
          </span>

          <span className={`risk-badge risk-${ticket.ai_risk}`}>
            Risk: {safeValue(ticket.ai_risk, "unknown")}
          </span>
        </div>
      </div>

      <section className="ai-command-card">
        <AiAnalysisCard ticket={ticket} />

        <div className="ticket-lower-grid">
          <SuggestedActions ticket={ticket} />
          <ConversationThread ticket={ticket} messages={messages} />
          <ReplyPanel
            ticket={ticket}
            replyDraft={replyDraft}
            savingTicketId={savingTicketId}
            onReplyDraftChange={onReplyDraftChange}
            onSaveReply={onSaveReply}
            onApproveReply={onApproveReply}
            onMarkAsSent={onMarkAsSent}
          />
        </div>
      </section>

      <div className="workflow-actions">
        {STATUS_OPTIONS.map((status) => (
          <button key={status} className="small-button" onClick={() => onUpdateStatus(ticket.id, status)}>
            {formatStatus(status)}
          </button>
        ))}

        <button className="danger-button" onClick={() => onDeleteTicket(ticket.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
