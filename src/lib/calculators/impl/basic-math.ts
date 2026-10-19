/**
 * Basic Mathematics — implemented calculators.
 * Each export is a CalculatorDefinition with self-verifying tests.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum, round } from "../_format";

/* --------------------------- Percentage --------------------------- */
export const percentageCalculator: CalculatorDefinition = {
  slug: "percentage",
  name: "Percentage Calculator",
  description: "Find a percentage of a number, or what percent one number is of another.",
  category: "basic-math",
  keywords: ["percent", "ratio", "share", "proportion", "%"],
  status: "live",
  part: 1,
  inputs: [
    { name: "mode", label: "Calculation type", type: "select", default: "of",
      options: [
        { label: "X% of Y", value: "of" },
        { label: "X is what % of Y", value: "is_what_percent" },
        { label: "% increase/decrease from X to Y", value: "change" },
      ] },
    { name: "x", label: "X", type: "number", default: 25, step: "any" },
    { name: "y", label: "Y", type: "number", default: 200, step: "any" },
  ],
  related: ["percentage-change", "fraction-to-decimal"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "of");
    const x = toNum(raw.x);
    const y = toNum(raw.y);
    let label = "";
    let value = "";
    if (mode === "of") {
      const r = (x / 100) * y;
      label = `${fmt(x, 4)}% of ${fmt(y, 4)}`;
      value = fmt(r, 4);
    } else if (mode === "is_what_percent") {
      const r = y === 0 ? NaN : (x / y) * 100;
      label = `${fmt(x, 4)} as a % of ${fmt(y, 4)}`;
      value = `${fmt(r, 4)}%`;
    } else {
      const r = x === 0 ? NaN : ((y - x) / Math.abs(x)) * 100;
      label = `Change from ${fmt(x, 4)} to ${fmt(y, 4)}`;
      value = `${fmt(r, 4)}%`;
    }
    return {
      rows: [{ key: "result", label, value, emphasis: "primary" }],
      summary: "Percentages express a part of a whole as a fraction of 100.",
    };
  },
  tests: [
    { name: "25% of 200", inputs: { mode: "of", x: 25, y: 200 }, expected: "50" },
    { name: "30 is what % of 120", inputs: { mode: "is_what_percent", x: 30, y: 120 }, expected: "25%" },
    { name: "change from 80 to 100", inputs: { mode: "change", x: 80, y: 100 }, expected: "25%" },
  ],
};

/* ----------------------------- Average ---------------------------- */
export const averageCalculator: CalculatorDefinition = {
  slug: "average",
  name: "Average (Mean) Calculator",
  description: "Compute the arithmetic mean, sum and count of a list of numbers.",
  category: "basic-math",
  keywords: ["mean", "arithmetic mean", "sum", "average of numbers"],
  status: "live",
  part: 1,
  inputs: [
    { name: "values", label: "Numbers (comma or space separated)", type: "textarea",
      default: "10, 20, 30, 40, 50", placeholder: "e.g. 12, 18, 24" },
  ],
  related: ["median-mode", "standard-deviation"],
  calculate: (raw) => {
    const text = String(raw.values ?? "");
    const parts = text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    const nums = parts.map(toNum).filter((n) => Number.isFinite(n));
    if (nums.length === 0) {
      return { rows: [{ key: "mean", label: "Mean", value: "—" }] };
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;
    return {
      rows: [
        { key: "mean", label: "Mean (average)", value: fmt(mean, 4), emphasis: "primary" },
        { key: "sum", label: "Sum", value: fmt(sum, 4) },
        { key: "count", label: "Count", value: fmt(nums.length, 0) },
        { key: "min", label: "Min", value: fmt(Math.min(...nums), 4) },
        { key: "max", label: "Max", value: fmt(Math.max(...nums), 4) },
      ],
      summary: "The arithmetic mean is the sum of values divided by the count of values.",
    };
  },
  tests: [
    { name: "mean of 10,20,30,40,50", inputs: { values: "10, 20, 30, 40, 50" }, expected: "30" },
    { name: "mean of 2,4,6", inputs: { values: "2 4 6" }, expected: "4" },
  ],
};

/* --------------------- Fraction to decimal ------------------------ */
export const fractionToDecimal: CalculatorDefinition = {
  slug: "fraction-to-decimal",
  name: "Fraction to Decimal",
  description: "Convert any fraction (numerator / denominator) to its decimal form.",
  category: "basic-math",
  keywords: ["fraction", "decimal", "ratio", "convert"],
  status: "live",
  part: 1,
  inputs: [
    { name: "numerator", label: "Numerator", type: "number", default: 3, step: "any" },
    { name: "denominator", label: "Denominator", type: "number", default: 4, step: "any" },
  ],
  related: ["percentage", "decimal-to-fraction"],
  calculate: (raw) => {
    const n = toNum(raw.numerator);
    const d = toNum(raw.denominator);
    if (!d) {
      return { rows: [{ key: "decimal", label: "Decimal", value: "—", hint: "Denominator cannot be zero." }] };
    }
    const dec = n / d;
    const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
    const g = gcd(Math.round(n), Math.round(d));
    const simplifiable = Number.isInteger(n) && Number.isInteger(d) && g > 1;
    return {
      rows: [
        { key: "decimal", label: "Decimal", value: fmt(dec, 6), emphasis: "primary" },
        { key: "percent", label: "As percentage", value: `${fmt(dec * 100, 4)}%` },
      ],
      sections: simplifiable
        ? [{ title: "Simplified fraction", rows: [
            { key: "simplified", label: "Reduced", value: `${Math.round(n) / g} / ${Math.round(d) / g}` },
          ] }]
        : undefined,
    };
  },
  tests: [
    { name: "3/4", inputs: { numerator: 3, denominator: 4 }, expected: "0.75" },
    { name: "1/3", inputs: { numerator: 1, denominator: 3 }, expected: "0.333333" },
  ],
};
