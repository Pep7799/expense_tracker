import { useState, type FormEvent } from "react";
import { ApiError, type Expense, type ExpenseCreate } from "../api";
import { todayISO } from "../format";

// Suggestions only: the category field still accepts anything you type.
const CATEGORY_SUGGESTIONS = [
  "Food",
  "Transport",
  "Rent",
  "Bills",
  "Data & airtime",
  "Shopping",
  "Health",
  "Entertainment",
  "Savings",
];

type Props = {
  onCreate: (expense: ExpenseCreate) => Promise<Expense>;
};

export default function AddExpenseForm({ onCreate }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    setBusy(true);
    try {
      const created = await onCreate({
        description: description.trim(),
        amount: value,
        category: category.trim(),
        date,
      });
      setSaved(`Added “${created.description}”.`);
      // Keep category and date: people often log several from the same day.
      setDescription("");
      setAmount("");
    } catch (err) {
      // A 401 is handled by the dashboard (it logs you out).
      if (!(err instanceof ApiError && err.status === 401)) {
        setError(err instanceof ApiError ? err.message : "Couldn't add the expense. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="add" aria-labelledby="add-heading">
      <h2 id="add-heading" className="add-heading">Add an expense</h2>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">What was it?</span>
          <input
            required
            maxLength={100}
            placeholder="Lunch at work"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="field">
          <label className="field-label" htmlFor="expense-amount">
            Amount
          </label>
          <div className="input-prefix">
            <span aria-hidden="true">₦</span>
            <input
              id="expense-amount"
              required
              inputMode="decimal"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="field-row">
          <label className="field">
            <span className="field-label">Category</span>
            <input
              required
              maxLength={100}
              list="category-suggestions"
              placeholder="Food"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <label className="field">
            <span className="field-label">Date</span>
            <input type="date" required max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        {error && <p className="banner banner--error" role="alert">{error}</p>}
        {saved && <p className="form-saved" role="status">{saved}</p>}

        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? "Adding…" : "Add expense"}
        </button>
      </form>
    </section>
  );
}
