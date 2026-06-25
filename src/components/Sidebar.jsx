export function Sidebar({ userEmail, onSignOut }) {
  return (
    <aside className="workspace-sidebar">
      <div>
        <div className="brand">
          AI<span>Support</span>
        </div>

        <p className="sidebar-copy">
          Customer support workspace powered by n8n, OpenAI, Supabase and
          realtime approval flows.
        </p>

        <div className="sidebar-workflow">
          <p className="sidebar-label">Workflow</p>

          <div className="workflow-step">
            <span>01</span>
            <div>
              <strong>Email received</strong>
              <p>Customer message enters the system.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span>02</span>
            <div>
              <strong>AI analysis</strong>
              <p>Risk, intent and sentiment are detected.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span>03</span>
            <div>
              <strong>Reply approval</strong>
              <p>Agent reviews and approves the answer.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <p>Signed in as</p>
        <strong>{userEmail}</strong>
        <button className="logout-button" onClick={onSignOut}>
          Logout
        </button>
      </div>
    </aside>
  );
}
