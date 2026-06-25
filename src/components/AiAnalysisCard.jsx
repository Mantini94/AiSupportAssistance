import { Clock3, Folder, Shield, ShieldAlert, Smile, Sparkles } from "lucide-react";
import { safeValue } from "../lib/ticketHelpers";

export function AiAnalysisCard({ ticket }) {
  return (
    <>
      <div className="ai-command-header">
        <div>
          <div className="ai-header-line">
            <Sparkles size={30} strokeWidth={2} />
            <p className="ai-kicker">AI Analysis</p>
          </div>

          <h4>AI Summary</h4>
        </div>

        <div className="confidence-orb">
          <strong>{safeValue(ticket.ai_confidence, 0)}%</strong>
          <span>confidence</span>
        </div>
      </div>

      <div className="ai-summary-message">
        <p>
          {safeValue(
            ticket.ai_summary,
            "No summary yet. Update your n8n/OpenAI response to return ai_summary."
          )}
        </p>
      </div>

      <div className="ai-insight-grid">
        <div className="ai-insight urgency">
          <Clock3 size={36} strokeWidth={1.8} />
          <span>Urgency</span>
          <strong>{safeValue(ticket.ai_urgency)}</strong>
        </div>

        <div className="ai-insight sentiment">
          <Smile size={36} strokeWidth={1.8} />
          <span>Sentiment</span>
          <strong>{safeValue(ticket.ai_sentiment)}</strong>
        </div>

        <div className="ai-insight category">
          <Folder size={36} strokeWidth={1.8} />
          <span>Category</span>
          <strong>{safeValue(ticket.ai_category)}</strong>
        </div>

        <div className="ai-insight risk">
          <Shield size={36} strokeWidth={1.8} />
          <span>Risk</span>
          <strong>{safeValue(ticket.ai_risk)}</strong>
        </div>

        <div className={`ai-insight spam ${ticket.ai_spam ? "danger" : "safe"}`}>
          <ShieldAlert size={36} strokeWidth={1.8} />
          <span>Spam Detection</span>
          <strong>{ticket.ai_spam ? "SPAM" : "SAFE"}</strong>
        </div>
      </div>
    </>
  );
}
