import { useState } from "react";

export function ManualTicketComposer({ onCreateTicket, savingTicketId }) {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function resetForm() {
    setCustomerEmail("");
    setCustomerName("");
    setSubject("");
    setMessage("");
  }

  function handleCreateTicket() {
    onCreateTicket({ customerEmail, customerName, subject, message, onSuccess: resetForm });
  }

  return (
    <section className="composer-panel">
      <div>
        <p className="eyebrow">Manual intake</p>
        <h2>Create customer request</h2>
      </div>

      <div className="composer-grid">
        <input
          type="email"
          placeholder="Customer email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
        />

        <input
          type="text"
          placeholder="Customer name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />

        <textarea
          placeholder="Original customer message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <button
          className="primary-button composer-button"
          onClick={handleCreateTicket}
          disabled={savingTicketId === "new-ticket"}
        >
          {savingTicketId === "new-ticket" ? "Analyzing..." : "Create"}
        </button>
      </div>
    </section>
  );
}
