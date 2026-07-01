import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { getFinalReply, N8N_WEBHOOK_URL, SEND_REPLY_WEBHOOK } from "../lib/ticketHelpers";

export function useTickets(session) {
  const [tickets, setTickets] = useState([]);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingTicketId, setSavingTicketId] = useState(null);

  useEffect(() => {
    if (!session) return;

    getTickets();
    getTicketMessages();

    const channel = supabase
      .channel("tickets-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => getTickets()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket_messages" },
        () => getTicketMessages()
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

  async function getTickets() {
    setTicketsLoading(true);

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("last_message_at", { ascending: false });

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

  async function createTicket({ customerEmail, customerName, subject, message, onSuccess }) {
  if (!subject || !message) {
    alert("Fill subject and message.");
    return;
  }

  try {
    setSavingTicketId("new-ticket");

    const now = new Date().toISOString();

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

          ai_summary: null,
          ai_category: null,
          ai_urgency: null,
          ai_sentiment: null,
          ai_risk: null,
          ai_spam: false,
          ai_confidence: null,
          suggested_actions: null,
          ai_reply: "",
          final_reply: "",

          reply_status: "draft",
          human_edited: false,

          status: "new",
          priority: "medium",

          last_message_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Insert failed. Check your Supabase columns.");
      return;
    }

    const { error: messageError } = await supabase.from("ticket_messages").insert({
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

    onSuccess?.();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticket.id,
          customer_email: ticket.customer_email,
          subject: ticket.subject || ticket.title || "Support reply",
          message: replyText,
          email_thread_id: ticket.email_thread_id,
        }),
      });

console.log("n8n response status:", response.status);

const result = await response.json().catch(() => null);

if (!response.ok || result?.success !== true) {
  console.error("n8n send error:", result);
  alert(result?.message || "Email was not sent. Ticket was not marked as sent.");
  setSavingTicketId(null);
  return;
}

      const { error: messageError } = await supabase.from("ticket_messages").insert({
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
      if (!acc[message.ticket_id]) acc[message.ticket_id] = [];
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

  return {
    tickets,
    ticketMessages,
    ticketsLoading,
    replyDrafts,
    savingTicketId,
    setReplyDrafts,
    createTicket,
    updateTicketStatus,
    saveReply,
    approveReply,
    markAsSent,
    deleteTicket,
    messagesByTicketId,
    stats,
  };
}
