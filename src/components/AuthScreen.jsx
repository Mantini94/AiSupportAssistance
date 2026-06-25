import { useState } from "react";

export function AuthScreen({ onSignIn, onSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

          <button className="primary-button" onClick={() => onSignIn(email, password)}>
            Sign In
          </button>

          <button className="secondary-button" onClick={() => onSignUp(email, password)}>
            Create Account
          </button>
        </div>
      </section>
    </main>
  );
}
