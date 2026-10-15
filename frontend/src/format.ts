// Your backend stores plain numbers with no currency, so the currency
// is a display choice. Change these two lines to switch it.
const LOCALE = "en-NG";
const CURRENCY = "NGN";

const money = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY });

export function formatMoney(amount: number) {
  return money.format(amount);
}

// Splits "₦124,500.00" into symbol, whole part and decimals so the big
// total can style them differently.
export function moneyParts(amount: number) {
  const parts = money.formatToParts(amount);
  const symbol = parts.filter((p) => p.type === "currency").map((p) => p.value).join("");
  const whole = parts
    .filter((p) => p.type === "integer" || p.type === "group")
    .map((p) => p.value)
    .join("");
  const fraction = parts.find((p) => p.type === "fraction")?.value ?? "00";
  return { symbol, whole, fraction };
}

// "2026-10-14" -> a Date at local midnight. new Date("2026-10-14") would
// treat it as UTC, which can shift the day depending on timezone.
export function parseDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const dayLabelWithYear = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDay(iso: string) {
  const date = parseDay(iso);
  const today = parseDay(todayISO());
  const diff = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.getFullYear() === today.getFullYear() ? dayLabel.format(date) : dayLabelWithYear.format(date);
}

export const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
