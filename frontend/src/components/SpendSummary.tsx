import type { Expense } from "../api";
import { formatMoney, moneyParts } from "../format";

// The top of the dashboard: the total for the chosen period, and one bar
// split by category so you can see at a glance where the money went.

const MAX_SEGMENTS = 5; // categories after the 5th are grouped into "Everything else"

type Slice = { category: string; total: number; share: number };

function slices(expenses: Expense[], total: number): Slice[] {
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    const key = e.category?.trim() || "Uncategorised";
    byCategory.set(key, (byCategory.get(key) ?? 0) + e.amount);
  }
  const sorted = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, MAX_SEGMENTS);
  const rest = sorted.slice(MAX_SEGMENTS).reduce((sum, [, v]) => sum + v, 0);
  if (rest > 0) top.push(["Everything else", rest]);
  return top.map(([category, value]) => ({ category, total: value, share: total ? value / total : 0 }));
}

type Props = {
  expenses: Expense[];
  periodLabel: string;
  period: "month" | "all";
  onPeriodChange: (p: "month" | "all") => void;
};

export default function SpendSummary({ expenses, periodLabel, period, onPeriodChange }: Props) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const { symbol, whole, fraction } = moneyParts(total);
  const parts = slices(expenses, total);

  return (
    <section className="summary" aria-labelledby="summary-heading">
      <div className="summary-top">
        <h1 id="summary-heading" className="summary-heading">
          Spent {period === "month" ? `in ${periodLabel}` : "in total"}
        </h1>
        <div className="segmented" role="group" aria-label="Period">
          <button type="button" aria-pressed={period === "month"} onClick={() => onPeriodChange("month")}>
            This month
          </button>
          <button type="button" aria-pressed={period === "all"} onClick={() => onPeriodChange("all")}>
            All time
          </button>
        </div>
      </div>

      <p className="total" aria-label={formatMoney(total)}>
        <span className="total-symbol">{symbol}</span>
        <span className="total-whole">{whole}</span>
        <span className="total-fraction">.{fraction}</span>
      </p>
      <p className="total-count">
        {expenses.length === 0
          ? "Nothing logged for this period yet."
          : `${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"}`}
      </p>

      {parts.length > 0 && (
        <>
          <div className="ribbon" role="img" aria-label="Spending split by category">
            {parts.map((p, i) => (
              <span
                key={p.category}
                className={`ribbon-seg tone-${i}`}
                style={{ flexGrow: Math.max(p.share, 0.012) }}
                title={`${p.category}: ${formatMoney(p.total)}`}
              />
            ))}
          </div>
          <ul className="legend">
            {parts.map((p, i) => (
              <li key={p.category}>
                <span className={`swatch tone-${i}`} aria-hidden="true" />
                <span className="legend-name">{p.category}</span>
                <span className="legend-amount">{formatMoney(p.total)}</span>
                <span className="legend-share">{Math.round(p.share * 100)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
