import { ListTodo } from "lucide-react";
import { safeValue } from "../lib/ticketHelpers";

export function SuggestedActions({ ticket }) {
  return (
    <section className="support-panel actions-panel">
      <div className="panel-title-icon">
        <ListTodo size={26} />
        <p className="panel-kicker">Suggested Actions</p>
      </div>

      <p>{safeValue(ticket.suggested_actions)}</p>
    </section>
  );
}
