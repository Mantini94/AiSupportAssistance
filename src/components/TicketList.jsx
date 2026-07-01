import { TicketCard } from "./TicketCard";

export function TicketList({
  tickets,
  ticketsLoading,
  messagesByTicketId,
  replyDrafts,
  savingTicketId,
  onReplyDraftChange,
  onSaveReply,
  onApproveReply,
  onRegenerateReply,
  onMarkAsSent,
  onUpdateStatus,
  onDeleteTicket,
}) {
  return (
    <section className="tickets-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live inbox</p>
          <h2>AI-reviewed customer tickets</h2>
        </div>

        {ticketsLoading && <span className="loading-pill">Syncing...</span>}
      </div>

      <div className="ticket-list">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            messages={messagesByTicketId[ticket.id] || []}
            replyDraft={replyDrafts[ticket.id] || ""}
            savingTicketId={savingTicketId}
            onReplyDraftChange={onReplyDraftChange}
            onSaveReply={onSaveReply}
            onApproveReply={onApproveReply}
            onRegenerateReply={onRegenerateReply}
            onMarkAsSent={onMarkAsSent}
            onUpdateStatus={onUpdateStatus}
            onDeleteTicket={onDeleteTicket}
          />
        ))}

        {!tickets.length && !ticketsLoading && (
          <div className="empty-state">
            <p className="eyebrow">No tickets yet</p>
            <h3>Create your first AI-reviewed support request.</h3>
          </div>
        )}
      </div>
    </section>
  );
}
