/**
 * Helper formatting utilities shared by every calculator implementation.
 * Pure functions, no I/O, safe to call from anywhere (browser or server).
 */

/**
 * Format a number with thousands separators and up to `decimals` decimal places.
 * Trailing zeros are trimmed so fmt(50, 4) returns "50" and fmt(2.5, 4) returns
 * "2.5". Use fmtFixed() when you need a guaranteed fixed number of decimals.
 */
export function fmt(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  const fixed = n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return fixed;
}

/** Format with a guaranteed fixed number of decimals (no trimming). */
export function fmtFixed(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a number as USD currency. */
export function fmtUSD(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a number as a percentage with the given decimals. */
export function fmtPct(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(decimals)}%`;
}

/** Parse a value that might be a string or number into a finite number, else NaN. */
export function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[, $%]/g, "");
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

/** Round half away from zero to `decimals` digits. */
export function round(n: number, decimals = 2): number {
  if (!Number.isFinite(n)) return NaN;
  const f = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** Clamp a number to the inclusive [min, max] range. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
