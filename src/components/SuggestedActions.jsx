import { CheckCircle2 } from "lucide-react";
import { safeValue } from "../lib/ticketHelpers";

function parseActions(value) {
  const text = safeValue(value, "");
  if (!text) return [];

  return text
    .split(/\n|;|•|-/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function SuggestedActions({ ticket }) {
  const actions = parseActions(ticket.suggested_actions);

  return (
    <section className="support-panel suggested-actions-panel">
      <div className="compact-section-header">
        <p className="panel-kicker">Suggested Actions</p>
      </div>

      <ul className="suggested-action-list">
        {actions.length ? (
          actions.map((action, index) => (
            <li key={`${action}-${index}`}>
              <CheckCircle2 size={15} />
              <span>{action}</span>
            </li>
          ))
        ) : (
          <li>
            <CheckCircle2 size={15} />
            <span>No suggested actions yet.</span>
          </li>
        )}
      </ul>
    </section>
  );
}