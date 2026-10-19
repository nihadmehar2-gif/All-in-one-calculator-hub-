/**
 * Date and Time — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";

function parseDate(v: unknown): Date | null {
  if (v instanceof Date) return v;
  if (typeof v === "string" && v.trim()) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export const dateDifference: CalculatorDefinition = {
  slug: "date-difference",
  name: "Date Difference Calculator",
  description: "Compute the number of days, weeks, months and years between two dates.",
  category: "date-time",
  keywords: ["days between", "duration", "age", "calendar", "elapsed"],
  status: "live",
  part: 1,
  inputs: [
    { name: "start", label: "Start date", type: "date", default: "2024-01-01" },
    { name: "end", label: "End date", type: "date", default: "2024-12-31" },
  ],
  related: ["age-calculator", "workday-counter"],
  calculate: (raw) => {
    const a = parseDate(raw.start);
    const b = parseDate(raw.end);
    if (!a || !b) {
      return { rows: [{ key: "days", label: "Difference", value: "—", hint: "Pick both dates." }] };
    }
    const days = daysBetween(a, b);
    const weeks = days / 7;
    const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    const years = days / 365.25;
    return {
      rows: [
        { key: "days", label: "Total days", value: `${days}`, emphasis: "primary" },
        { key: "weeks", label: "Weeks", value: `${(weeks).toFixed(2)}` },
        { key: "months", label: "Calendar months", value: `${months}` },
        { key: "years", label: "Years (approx)", value: `${years.toFixed(3)}` },
      ],
      summary: "Calendar months count whole month boundaries crossed; days/years are exact ratios.",
    };
  },
  tests: [
    { name: "Jan 1 to Dec 31 2024 (leap year)", inputs: { start: "2024-01-01", end: "2024-12-31" }, expected: { days: "365" } },
    { name: "2024-01-01 to 2024-02-01", inputs: { start: "2024-01-01", end: "2024-02-01" }, expected: { days: "31" } },
  ],
};
