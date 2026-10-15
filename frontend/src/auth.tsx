import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";

// Holds the logged-in user's token for the whole app, so any page can
// read it with useAuth() instead of passing it down through props.

type AuthState = {
  token: string | null;
  email: string | null;
  notice: string | null; // a message for the login page, e.g. "session expired"
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: (notice?: string) => void;
  clearNotice: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "expense-tracker-session";

type Session = { token: string; email: string };

// localStorage can throw (private windows, blocked storage), so wrap it.
function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* the app still works for this tab without storage */
  }
}

// A JWT is three base64 parts: header.payload.signature.
// The payload is readable (not secret); only the signature proves it's real.
// We read `exp` here just to know when to log out. The backend still does
// the real check on every request.
function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = loadSession();
    const exp = saved ? tokenExpiry(saved.token) : null;
    return saved && exp && exp > Date.now() ? saved : null;
  });
  const [notice, setNotice] = useState<string | null>(null);

  const logout = useCallback((message?: string) => {
    saveSession(null);
    setSession(null);
    setNotice(message ?? null);
  }, []);

  // Log out automatically the moment the token expires (30 min on your backend).
  useEffect(() => {
    if (!session) return;
    const exp = tokenExpiry(session.token);
    if (!exp) return;
    const timer = window.setTimeout(
      () => logout("Your session expired. Log in again to continue."),
      Math.max(exp - Date.now(), 0),
    );
    return () => window.clearTimeout(timer);
  }, [session, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await api.login(email, password);
    const next = { token: access_token, email };
    saveSession(next);
    setSession(next);
    setNotice(null);
  }, []);

  // Your /register returns the user, not a token, so we log in right after.
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await api.register(name, email, password);
      await login(email, password);
    },
    [login],
  );

  const value = useMemo<AuthState>(
    () => ({
      token: session?.token ?? null,
      email: session?.email ?? null,
      notice,
      login,
      register,
      logout,
      clearNotice: () => setNotice(null),
    }),
    [session, notice, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
