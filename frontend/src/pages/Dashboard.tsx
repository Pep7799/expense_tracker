import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError, type Expense, type ExpenseCreate } from "../api";
import { useAuth } from "../auth";
import { monthLabel, parseDay } from "../format";
import SpendSummary from "../components/SpendSummary";
import AddExpenseForm from "../components/AddExpenseForm";
import Ledger from "../components/Ledger";

export default function Dashboard() {
  const { token, email, logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"month" | "all">("month");
  const [highlightId, setHighlightId] = useState<number | null>(null);

  // If the backend says 401 (token expired or invalid), send the user to login.
  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout("Your session expired. Log in again to continue.");
        return true;
      }
      return false;
    },
    [logout],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setExpenses(await api.listExpenses(token));
    } catch (err) {
      if (!handleError(err)) setError(err instanceof ApiError ? err.message : "Couldn't load your expenses.");
    } finally {
      setLoading(false);
    }
  }, [token, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  async function createExpense(data: ExpenseCreate) {
    try {
      const created = await api.createExpense(token!, data);
      setExpenses((prev) => [created, ...prev]);
      setHighlightId(created.id);
      // If you log something from an earlier month, switch to All time so you can see it.
      const d = parseDay(created.date);
      const now = new Date();
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) setPeriod("all");
      return created;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }

  const visible = useMemo(() => {
    if (period === "all") return expenses;
    const now = new Date();
    return expenses.filter((e) => {
      const d = parseDay(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [expenses, period]);

  return (
    <div className="app">
      <header className="topbar">
        <p className="wordmark">Spent</p>
        <div className="topbar-user">
          <span className="topbar-email">{email}</span>
          <button className="btn btn--ghost" type="button" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      {error ? (
        <div className="load-error" role="alert">
          <p>{error}</p>
          <button className="btn btn--ghost" type="button" onClick={load}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <SpendSummary
            expenses={loading ? [] : visible}
            period={period}
            periodLabel={monthLabel.format(new Date())}
            onPeriodChange={setPeriod}
          />

          <div className="workspace">
            <AddExpenseForm onCreate={createExpense} />
            <section className="history" aria-labelledby="history-heading">
              <h2 id="history-heading" className="history-heading">
                {period === "month" ? "This month" : "All expenses"}
              </h2>
              {loading ? <p className="muted">Loading your expenses…</p> : <Ledger expenses={visible} highlightId={highlightId} />}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
