import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { ApiError } from "../api";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That email already has an account. Log in instead.");
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      }
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create your account">
      {error && <p className="banner banner--error" role="alert">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Name</span>
          <input
            autoComplete="name"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
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
            autoComplete="new-password"
            required
            maxLength={100}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
