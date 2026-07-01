import { Bot, UserRound } from "lucide-react";
import { getOriginalMessage } from "../lib/ticketHelpers";

export function ConversationThread({ ticket, messages = [] }) {
  const threadMessages = messages.length
    ? messages
    : [
        {
          id: "original-message",
          role: "customer",
          sender_email: ticket.customer_email,
          message: getOriginalMessage(ticket),
        },
      ];

  return (
    <section className="support-panel thread-panel">
      <div className="thread-header">
       <strong>Conversation</strong>

        <span className="thread-count">
          {threadMessages.length} message{threadMessages.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="conversation-thread">
        {threadMessages.map((message) => {
          const isCustomer = message.role?.toLowerCase() === "customer";

          return (
            <div
              className={`conversation-row ${
                isCustomer ? "from-customer" : "from-support"
              }`}
              key={message.id}
            >
              <div className="message-avatar">
                {isCustomer ? <UserRound size={15} /> : <Bot size={15} />}
              </div>

              <div className="message-bubble">
                <div className="conversation-meta">
                  <strong>{isCustomer ? "Customer" : "Support"}</strong>
                  <span>{message.sender_email}</span>
                </div>

                <p>{message.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}