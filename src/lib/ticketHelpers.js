export const N8N_WEBHOOK_URL =
  "https://n8n-mvj1.srv1505698.hstgr.cloud/webhook/ai-ticket-analysis";

export const SEND_REPLY_WEBHOOK =
  "https://n8n-mvj1.srv1505698.hstgr.cloud/webhook/send-ticket-reply";
  

export const STATUS_OPTIONS = ["new", "pending", "needs_review", "resolved", "spam"];

export function formatStatus(value) {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ");
}

export function safeValue(value, fallback = "Not available") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

export function getTicketSubject(ticket) {
  return ticket.subject || ticket.title || "Untitled customer request";
}

export function getOriginalMessage(ticket) {
  return ticket.original_message || ticket.description || "No original message.";
}

export function getFinalReply(ticket) {
  return ticket.final_reply || ticket.ai_reply || "";
}
