import { Bot, Copy, Check, Sparkles, Send } from "lucide-react";
import { useState } from "react";

export function ReplyPanel({
  ticket,
  replyDraft,
  savingTicketId,
  onReplyDraftChange,
  onSaveReply,
  onApproveReply,
  onRegenerateReply,
  onMarkAsSent,
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(replyDraft || "");

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section className="support-panel reply-panel">
      <div className="reply-header">
        <div className="panel-title-icon">
          <Bot size={18} />
          <p className="panel-kicker">AI Reply</p>
        </div>
      </div>

      <textarea
        className="reply-editor"
        value={replyDraft || ""}
        onChange={(event) =>
          onReplyDraftChange(ticket.id, event.target.value)
        }
      />

      <div className="reply-actions">
        <button
          className="icon-button"
          onClick={handleCopy}
          title="Copy reply"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>

        <button
          className="secondary-button"
          onClick={() => onRegenerateReply(ticket)}
          disabled={savingTicketId === ticket.id}
        >
          <Sparkles size={16} />
          Regenerate
        </button>

        <button
          className="primary-button"
          onClick={() => onMarkAsSent(ticket)}
          disabled={savingTicketId === ticket.id}
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </section>
  );
}