import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { ApiError } from "../api";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const { login, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    clearNotice();
    setBusy(true);
    try {
      await login(email.trim(), password);
      // No navigate() needed: once the token is set, <GuestOnly> redirects to "/".
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Log in">
      {notice && <p className="banner banner--info" role="status">{notice}</p>}
      {error && <p className="banner banner--error" role="alert">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
