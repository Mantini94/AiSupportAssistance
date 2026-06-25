import { AuthScreen } from "./components/AuthScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { ManualTicketComposer } from "./components/ManualTicketComposer";
import { MetricsGrid } from "./components/MetricsGrid";
import { Sidebar } from "./components/Sidebar";
import { TicketList } from "./components/TicketList";
import { WorkspaceHero } from "./components/WorkspaceHero";
import { useAuth } from "./hooks/useAuth";
import { useTickets } from "./hooks/useTickets";
import "./App.css";

function App() {
  const { session, authLoading, signUp, signIn, signOut } = useAuth();
  const {
    tickets,
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
  } = useTickets(session);

  function handleReplyDraftChange(ticketId, value) {
    setReplyDrafts((current) => ({
      ...current,
      [ticketId]: value,
    }));
  }

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <main className="app-main">
      <div className="workspace-shell">
        <Sidebar userEmail={session.user.email} onSignOut={signOut} />

        <section className="workspace-content">
          <WorkspaceHero />
          <MetricsGrid stats={stats} />

          <ManualTicketComposer
            onCreateTicket={createTicket}
            savingTicketId={savingTicketId}
          />

          <TicketList
            tickets={tickets}
            ticketsLoading={ticketsLoading}
            messagesByTicketId={messagesByTicketId}
            replyDrafts={replyDrafts}
            savingTicketId={savingTicketId}
            onReplyDraftChange={handleReplyDraftChange}
            onSaveReply={saveReply}
            onApproveReply={approveReply}
            onMarkAsSent={markAsSent}
            onUpdateStatus={updateTicketStatus}
            onDeleteTicket={deleteTicket}
          />
        </section>
      </div>
    </main>
  );
}

export default App;
