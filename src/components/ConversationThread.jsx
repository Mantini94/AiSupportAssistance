import { UserRound } from "lucide-react";
import { getOriginalMessage } from "../lib/ticketHelpers";

export function ConversationThread({ ticket, messages = [] }) {
  return (
    <section className="support-panel thread-panel">
      <div className="panel-title-icon">
        <UserRound size={26} />
        <p className="panel-kicker">Conversation Thread</p>
      </div>

      <div className="conversation-thread">
        {messages.map((message) => (
          <div
            className={`conversation-message ${
              message.role?.toLowerCase() === "customer" ? "from-customer" : "from-support"
            }`}
            key={message.id}
          >
            <div className="conversation-meta">
              <strong>{message.role}</strong>
              <span>{message.sender_email}</span>
            </div>

            <p>{message.message}</p>
          </div>
        ))}

        {!messages.length && (
          <div className="conversation-message from-customer">
            <p>{getOriginalMessage(ticket)}</p>
          </div>
        )}
      </div>
    </section>
  );
}
