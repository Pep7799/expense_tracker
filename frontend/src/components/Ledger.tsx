import type { Expense } from "../api";
import { formatDay, formatMoney } from "../format";

// The list of expenses, grouped by day like a running receipt.
// When you build update/delete, the row actions go in .ledger-row.

function groupByDay(expenses: Expense[]) {
  const sorted = [...expenses].sort((a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1));
  const groups: { date: string; items: Expense[]; total: number }[] = [];
  for (const e of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) {
      last.items.push(e);
      last.total += e.amount;
    } else {
      groups.push({ date: e.date, items: [e], total: e.amount });
    }
  }
  return groups;
}

type Props = { expenses: Expense[]; highlightId: number | null };

export default function Ledger({ expenses, highlightId }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="ledger-empty">
        <p className="ledger-empty-title">No expenses here yet</p>
        <p>Add one with the form and it will show up in this list.</p>
      </div>
    );
  }

  return (
    <div className="ledger">
      {groupByDay(expenses).map((group) => (
        <section key={group.date} className="ledger-day" aria-label={formatDay(group.date)}>
          <header className="ledger-day-head">
            <h3>{formatDay(group.date)}</h3>
            <span>{formatMoney(group.total)}</span>
          </header>
          <ul>
            {group.items.map((e) => (
              <li key={e.id} className={`ledger-row${e.id === highlightId ? " is-new" : ""}`}>
                <div className="ledger-what">
                  <span className="ledger-desc">{e.description}</span>
                  <span className="ledger-cat">{e.category}</span>
                </div>
                <span className="ledger-leader" aria-hidden="true" />
                <span className="ledger-amount">{formatMoney(e.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
