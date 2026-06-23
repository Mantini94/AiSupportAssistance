import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Clock3,
  Folder,
  ListTodo,
  Shield,
  ShieldAlert,
  Smile,
  Sparkles,
  UserRound,
} from "lucide-react";
import { supabase } from "./supabase";
import "./App.css";

const N8N_WEBHOOK_URL =
  "https://n8n-mvj1.srv1505698.hstgr.cloud/webhook/ai-ticket-analysis";

const SEND_REPLY_WEBHOOK =
  "https://n8n-mvj1.srv1505698.hstgr.cloud/webhook/send-ticket-reply";

const STATUS_OPTIONS = ["new", "pending", "needs_review", "resolved", "spam"];

function formatStatus(value) {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ");
}

function safeValue(value, fallback = "Not available") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

function getTicketSubject(ticket) {
  return ticket.subject || ticket.title || "Untitled customer request";
}

function getOriginalMessage(ticket) {
  return ticket.original_message || ticket.description || "No original message.";
}

function getFinalReply(ticket) {
  return ticket.final_reply || ticket.ai_reply || "";
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tickets, setTickets] = useState([]);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingTicketId, setSavingTicketId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    getTickets();
    getTicketMessages();

    const channel = supabase
      .channel("tickets-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
        },
        () => {
          getTickets();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ticket_messages",
        },
        () => {
          getTicketMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  useEffect(() => {
    const nextDrafts = {};

    tickets.forEach((ticket) => {
      nextDrafts[ticket.id] = getFinalReply(ticket);
    });

    setReplyDrafts(nextDrafts);
  }, [tickets]);

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created. Check your email if confirmation is enabled.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function getTickets() {
    setTicketsLoading(true);

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    setTicketsLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    setTickets(data || []);
  }

  async function getTicketMessages() {
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setTicketMessages(data || []);
  }

  async function createTicket() {
    if (!subject || !message) {
      alert("Fill subject and message.");
      return;
    }

    try {
      setSavingTicketId("new-ticket");

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message,
          original_message: message,
          customer_email: customerEmail,
          customer_name: customerName,
          source: "manual",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("n8n analysis error:", errorText);
        alert("AI analysis failed.");
        return;
      }

      const aiResult = await response.json();

      const { data: createdTicket, error } = await supabase
        .from("tickets")
        .insert([
          {
            user_id: session.user.id,
            source: "manual",
            customer_email: customerEmail || null,
            customer_name: customerName || null,
            subject,
            title: subject,
            original_message: message,
            description: message,

            ai_summary: aiResult.ai_summary || null,
            ai_category: aiResult.ai_category || null,
            ai_urgency: aiResult.ai_urgency || null,
            ai_sentiment: aiResult.ai_sentiment || null,
            ai_risk: aiResult.ai_risk || null,
            ai_spam: aiResult.ai_spam || false,
            ai_confidence: aiResult.ai_confidence || null,
            suggested_actions: aiResult.suggested_actions || null,
            ai_reply: aiResult.ai_reply || "",
            final_reply: aiResult.ai_reply || "",

            reply_status: "draft",
            human_edited: false,

            status: aiResult.ai_spam ? "spam" : "new",
            priority: aiResult.ai_urgency === "critical" ? "high" : "medium",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
        alert("Insert failed. Check your Supabase columns.");
        return;
      }

      const { error: messageError } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: createdTicket.id,
          user_id: session.user.id,
          role: "customer",
          sender_email: customerEmail || null,
          sender_name: customerName || null,
          subject,
          message,
          source: "manual",
          ai_generated: false,
        });

      if (messageError) {
        console.error(messageError);
        alert("Customer message insert failed.");
        return;
      }

      setCustomerEmail("");
      setCustomerName("");
      setSubject("");
      setMessage("");

      getTickets();
      getTicketMessages();
    } catch (error) {
      console.error(error);
      alert("Ticket creation failed.");
    } finally {
      setSavingTicketId(null);
    }
  }

  async function updateTicketStatus(id, status) {
    await supabase.from("tickets").update({ status }).eq("id", id);
    getTickets();
  }

  async function saveReply(ticket) {
    const currentDraft = replyDrafts[ticket.id] || "";
    const originalReply = ticket.ai_reply || "";

    setSavingTicketId(ticket.id);

    const { error } = await supabase
      .from("tickets")
      .update({
        final_reply: currentDraft,
        human_edited: currentDraft !== originalReply,
        edited_by: currentDraft !== originalReply ? session.user.id : null,
        edited_at: currentDraft !== originalReply ? new Date().toISOString() : null,
        reply_status: "draft",
      })
      .eq("id", ticket.id);

    setSavingTicketId(null);

    if (error) {
      console.error(error);
      alert("Saving reply failed.");
      return;
    }

    alert("Draft saved.");
    getTickets();
  }

  async function approveReply(ticket) {
    setSavingTicketId(ticket.id);

    const { error } = await supabase
      .from("tickets")
      .update({
        final_reply: replyDrafts[ticket.id] || ticket.final_reply || ticket.ai_reply || "",
        reply_status: "approved",
        approved_by: session.user.id,
        approved_at: new Date().toISOString(),
        status: ticket.status === "new" ? "pending" : ticket.status,
      })
      .eq("id", ticket.id);

    setSavingTicketId(null);

    if (error) {
      console.error(error);
      alert("Approval failed.");
      return;
    }

    getTickets();
  }

  async function markAsSent(ticket) {
    setSavingTicketId(ticket.id);

    const replyText = replyDrafts[ticket.id] || "";

    if (!replyText.trim()) {
      setSavingTicketId(null);
      alert("Reply is empty.");
      return;
    }

    if (!ticket.customer_email) {
      setSavingTicketId(null);
      alert("Customer email is missing.");
      return;
    }

    try {
      const response = await fetch(SEND_REPLY_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          customer_email: ticket.customer_email,
          subject: ticket.subject || ticket.title || "Support reply",
          message: replyText,
          email_thread_id: ticket.email_thread_id,
        }),
      });

      console.log("n8n response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("n8n send error:", errorText);
        alert("n8n email send failed.");
        setSavingTicketId(null);
        return;
      }

      const { error: messageError } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticket.id,
          user_id: session.user.id,
          role: "support",
          sender_email: session.user.email,
          message: replyText,
          source: "manual",
          ai_generated: false,
        });

      if (messageError) {
        console.error(messageError);
        alert("Saving support message failed.");
        setSavingTicketId(null);
        return;
      }

      const { error: ticketError } = await supabase
        .from("tickets")
        .update({
          final_reply: replyText,
          reply_status: "sent",
          sent_at: new Date().toISOString(),
          status: "resolved",
        })
        .eq("id", ticket.id);

      if (ticketError) {
        console.error(ticketError);
        alert("Sending status update failed.");
        setSavingTicketId(null);
        return;
      }

      alert("Reply sent and saved.");
      getTickets();
      getTicketMessages();
    } catch (error) {
      console.error("markAsSent error:", error);
      alert("Mark sent failed. Check console.");
    }

    setSavingTicketId(null);
  }

  async function deleteTicket(id) {
    await supabase.from("tickets").delete().eq("id", id);
    getTickets();
    getTicketMessages();
  }

  const messagesByTicketId = useMemo(() => {
    return ticketMessages.reduce((acc, message) => {
      if (!acc[message.ticket_id]) {
        acc[message.ticket_id] = [];
      }

      acc[message.ticket_id].push(message);
      return acc;
    }, {});
  }, [ticketMessages]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      new: tickets.filter((ticket) => ticket.status === "new").length,
      pending: tickets.filter((ticket) => ticket.status === "pending").length,
      review: tickets.filter((ticket) => ticket.status === "needs_review").length,
      resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
      spam: tickets.filter((ticket) => ticket.status === "spam").length,
    };
  }, [tickets]);

  if (authLoading) {
    return (
      <main className="app-main">
        <div className="auth-card">
          <p className="eyebrow">Loading workspace</p>
          <h1>AI Support Assistant</h1>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="app-main auth-screen">
        <section className="auth-card">
          <p className="eyebrow">AI Support Operating System</p>
          <h1>Sign in to your workspace</h1>
          <p className="auth-copy">
            Analyze customer messages, generate summaries and approve AI replies.
          </p>

          <div className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button className="primary-button" onClick={signIn}>
              Sign In
            </button>

            <button className="secondary-button" onClick={signUp}>
              Create Account
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-main">
      <div className="workspace-shell">
        <aside className="workspace-sidebar">
          <div>
            <div className="brand">
              AI<span>Support</span>
            </div>

            <p className="sidebar-copy">
              Customer support workspace powered by n8n, OpenAI, Supabase and
              realtime approval flows.
            </p>

            <nav className="sidebar-nav">
              <button className="nav-link active">Command Center</button>
              <button className="nav-link">Inbox</button>
              <button className="nav-link">AI Review</button>
              <button className="nav-link">Automations</button>
            </nav>
          </div>

          <div className="sidebar-footer">
            <p>Signed in as</p>
            <strong>{session.user.email}</strong>
            <button className="logout-button" onClick={signOut}>
              Logout
            </button>
          </div>
        </aside>

        <section className="workspace-content">
          <header className="workspace-hero">
            <div>
              <p className="eyebrow">Realtime AI Support Workspace</p>
              <h1>AI Support Assistant</h1>
              <p>
                Summarize customer issues, detect risk and approve AI-generated
                replies without reading walls of text.
              </p>
            </div>

            <div className="hero-status">
              <span className="live-dot"></span>
              Supabase realtime active
            </div>
          </header>

          <section className="metrics-grid">
            <Metric label="Total" value={stats.total} />
            <Metric label="New" value={stats.new} />
            <Metric label="Pending" value={stats.pending} />
            <Metric label="Needs Review" value={stats.review} />
            <Metric label="Resolved" value={stats.resolved} />
            <Metric label="Spam" value={stats.spam} />
          </section>

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
                onClick={createTicket}
                disabled={savingTicketId === "new-ticket"}
              >
                {savingTicketId === "new-ticket" ? "Analyzing..." : "Create + AI"}
              </button>
            </div>
          </section>

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
                <article className="ticket-card" key={ticket.id}>
                  <div className="ticket-topline">
                    <p className="ticket-source">
                      {safeValue(ticket.source, "manual")} ·{" "}
                      {safeValue(ticket.customer_email, "unknown customer")}
                    </p>

                    <h3>{getTicketSubject(ticket)}</h3>

                    <div className="ticket-badges">
                      <span className={`status-badge status-${ticket.status}`}>
                        {formatStatus(ticket.status)}
                      </span>

                      <span className={`risk-badge risk-${ticket.ai_risk}`}>
                        Risk: {safeValue(ticket.ai_risk, "unknown")}
                      </span>
                    </div>
                  </div>

                  <section className="ai-command-card">
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

                    <div className="ticket-lower-grid">
                      <section className="support-panel actions-panel">
                        <div className="panel-title-icon">
                          <ListTodo size={26} />
                          <p className="panel-kicker">Suggested Actions</p>
                        </div>

                        <p>{safeValue(ticket.suggested_actions)}</p>
                      </section>

                      <section className="support-panel thread-panel">
                        <div className="panel-title-icon">
                          <UserRound size={26} />
                          <p className="panel-kicker">Conversation Thread</p>
                        </div>

                        <div className="conversation-thread">
                          {(messagesByTicketId[ticket.id] || []).map((message) => (
                            <div
                              className={`conversation-message ${
                                message.role?.toLowerCase() === "customer"
                                  ? "from-customer"
                                  : "from-support"
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

                          {!messagesByTicketId[ticket.id]?.length && (
                            <div className="conversation-message from-customer">
                              <p>{getOriginalMessage(ticket)}</p>
                            </div>
                          )}
                        </div>
                      </section>

                      <section className="support-panel reply-panel">
                        <div className="panel-title-icon">
                          <Bot size={26} />
                          <p className="panel-kicker purple">AI Suggested Reply</p>
                        </div>

                        <textarea
                          className="reply-editor"
                          value={replyDrafts[ticket.id] || ""}
                          onChange={(event) =>
                            setReplyDrafts((current) => ({
                              ...current,
                              [ticket.id]: event.target.value,
                            }))
                          }
                        />

                        <div className="reply-actions">
                          <button
                            className="secondary-button"
                            onClick={() => saveReply(ticket)}
                            disabled={savingTicketId === ticket.id}
                          >
                            Save draft
                          </button>

                          <button
                            className="primary-button"
                            onClick={() => approveReply(ticket)}
                            disabled={savingTicketId === ticket.id}
                          >
                            Approve
                          </button>

                          <button
                            className="success-button"
                            onClick={() => markAsSent(ticket)}
                            disabled={savingTicketId === ticket.id}
                          >
                            Mark sent
                          </button>
                        </div>
                      </section>
                    </div>
                  </section>

                  <div className="workflow-actions">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        className="small-button"
                        onClick={() => updateTicketStatus(ticket.id, status)}
                      >
                        {formatStatus(status)}
                      </button>
                    ))}

                    <button
                      className="danger-button"
                      onClick={() => deleteTicket(ticket.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}

              {!tickets.length && !ticketsLoading && (
                <div className="empty-state">
                  <p className="eyebrow">No tickets yet</p>
                  <h3>Create your first AI-reviewed support request.</h3>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;