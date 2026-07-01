import { Clock3, Folder, Shield, Smile, Sparkles } from "lucide-react";
import { safeValue } from "../lib/ticketHelpers";


function formatAiLabel(value) {
  if (!value) return "Unknown";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeValue(value) {
  return String(value || "").toLowerCase();
}

function riskClass(value) {
  const risk = normalizeValue(value);

  if (risk.includes("critical") || risk.includes("high")) return "danger";
  if (risk.includes("medium")) return "warning";
  if (risk.includes("low") || risk.includes("none")) return "safe";

  return "neutral";
}

export function AiAnalysisCard({ ticket }) {
  return (
    <section className="support-panel ai-summary-panel">
      <div className="compact-panel-header">
        <div className="panel-title-icon compact">
          <Sparkles size={18} strokeWidth={2} />
          <p className="panel-kicker">AI Summary</p>
        </div>

        <span className="confidence-pill">
          {safeValue(ticket.ai_confidence, 0)}% confidence
        </span>
      </div>

      <p className="ai-summary-text">
        {safeValue(
          ticket.ai_summary,
          "No summary yet. Update your n8n/OpenAI response to return ai_summary."
        )}
      </p>

 <div className="ai-compact-meta">
  <div
    className="summary-pill urgency"
    data-tooltip="AI estimated urgency"
  >
    <Clock3 size={14} />
    <strong>{formatAiLabel(ticket.ai_urgency)}</strong>
  </div>

  <div
    className="summary-pill category"
    data-tooltip="Detected category"
  >
    <Folder size={14} />
    <strong>{formatAiLabel(ticket.ai_category)}</strong>
  </div>

  <div
    className="summary-pill sentiment"
    data-tooltip="Customer sentiment"
  >
    <Smile size={14} />
    <strong>{formatAiLabel(ticket.ai_sentiment)}</strong>
  </div>

  <div
    className={`summary-pill risk ${riskClass(ticket.ai_risk)}`}
    data-tooltip="Business risk"
  >
    <Shield size={14} />
    <strong>{formatAiLabel(ticket.ai_risk)}</strong>
  </div>
</div>
    </section>
  );
}