import { Bot } from "lucide-react";

export function ReplyPanel({
  ticket,
  replyDraft,
  savingTicketId,
  onReplyDraftChange,
  onSaveReply,
  onApproveReply,
  onMarkAsSent,
}) {
  return (
    <section className="support-panel reply-panel">
      <div className="panel-title-icon">
        <Bot size={26} />
        <p className="panel-kicker purple">AI Suggested Reply</p>
      </div>

      <textarea
        className="reply-editor"
        value={replyDraft || ""}
        onChange={(event) => onReplyDraftChange(ticket.id, event.target.value)}
      />

      <div className="reply-actions">
        <button
          className="secondary-button"
          onClick={() => onSaveReply(ticket)}
          disabled={savingTicketId === ticket.id}
        >
          Save draft
        </button>

        <button
          className="primary-button"
          onClick={() => onApproveReply(ticket)}
          disabled={savingTicketId === ticket.id}
        >
          Approve
        </button>

        <button
          className="success-button"
          onClick={() => onMarkAsSent(ticket)}
          disabled={savingTicketId === ticket.id}
        >
          Mark sent
        </button>
      </div>
    </section>
  );
}
