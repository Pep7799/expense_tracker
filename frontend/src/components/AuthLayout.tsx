import type { ReactNode } from "react";

// Shared frame for the login and register pages:
// a statement on the left, the form on the right (stacked on phones).

const SAMPLE = [
  { label: "Food", share: 38 },
  { label: "Transport", share: 22 },
  { label: "Rent", share: 18 },
  { label: "Data & airtime", share: 12 },
  { label: "Other", share: 10 },
];

export default function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="auth">
      <section className="auth-statement" aria-hidden="true">
        <p className="wordmark">Spent</p>
        <h1 className="auth-headline">Every naira, accounted for.</h1>
        <div className="ribbon ribbon--sample">
          {SAMPLE.map((s, i) => (
            <span key={s.label} className={`ribbon-seg tone-${i}`} style={{ flexGrow: s.share }} />
          ))}
        </div>
        <p className="auth-caption">Log what you spend. See where it goes.</p>
      </section>

      <main className="auth-panel">
        <div className="auth-form-wrap">
          <h2 className="auth-title">{title}</h2>
          {children}
        </div>
      </main>
    </div>
  );
}
