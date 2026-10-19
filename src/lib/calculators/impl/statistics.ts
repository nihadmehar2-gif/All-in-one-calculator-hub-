/**
 * Statistics and Probability — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum, round } from "../_format";

function parseNums(text: unknown): number[] {
  const s = String(text ?? "");
  return s.split(/[\s,;]+/).map((t) => t.trim()).filter(Boolean)
    .map(toNum).filter((n) => Number.isFinite(n));
}

export const medianMode: CalculatorDefinition = {
  slug: "median-mode",
  name: "Median, Mode & Range",
  description: "Find the median, mode(s), range and quartiles of a list of numbers.",
  category: "statistics",
  keywords: ["middle", "most common", "spread", "quartile", "Q1 Q3", "IQR"],
  status: "live",
  part: 1,
  inputs: [
    { name: "values", label: "Numbers (comma or space separated)", type: "textarea",
      default: "4, 1, 7, 3, 7, 9, 2", placeholder: "e.g. 4 1 7 3 7 9 2" },
  ],
  related: ["average", "standard-deviation"],
  calculate: (raw) => {
    const nums = parseNums(raw.values).slice().sort((a, b) => a - b);
    if (nums.length === 0) {
      return { rows: [{ key: "median", label: "Median", value: "—" }] };
    }
    const mid = Math.floor(nums.length / 2);
    const median = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
    // mode
    const counts = new Map<number, number>();
    nums.forEach((n) => counts.set(n, (counts.get(n) ?? 0) + 1));
    const maxCount = Math.max(...counts.values());
    const modes = maxCount <= 1 ? [] : [...counts.entries()].filter(([, c]) => c === maxCount).map(([n]) => n);
    const range = nums[nums.length - 1] - nums[0];
    const q1 = nums[Math.floor(nums.length * 0.25)];
    const q3 = nums[Math.floor(nums.length * 0.75)];
    const iqr = q3 - q1;
    return {
      rows: [
        { key: "median", label: "Median", value: fmt(median, 4), emphasis: "primary" },
        { key: "mode", label: "Mode", value: modes.length ? modes.join(", ") : "No mode", hint: maxCount <= 1 ? "All values appear once." : `appears ${maxCount}×` },
        { key: "range", label: "Range", value: fmt(range, 4) },
      ],
      sections: [{
        title: "Quartiles",
        rows: [
          { key: "q1", label: "Q1 (25th percentile)", value: fmt(q1, 4) },
          { key: "q3", label: "Q3 (75th percentile)", value: fmt(q3, 4) },
          { key: "iqr", label: "Interquartile range (IQR)", value: fmt(iqr, 4) },
        ],
      }],
    };
  },
  tests: [
    { name: "sorted 1..9 odd", inputs: { values: "1 2 3 4 5 6 7 8 9" }, expected: { median: "5" } },
    { name: "4,1,7,3,7,9,2", inputs: { values: "4, 1, 7, 3, 7, 9, 2" }, expected: { median: "4" } },
  ],
};

export const standardDeviation: CalculatorDefinition = {
  slug: "standard-deviation",
  name: "Standard Deviation & Variance",
  description: "Sample and population standard deviation, variance and coefficient of variation.",
  category: "statistics",
  keywords: ["SD", "sigma", "variance", "spread", "dispersion", "CV"],
  status: "live",
  part: 1,
  inputs: [
    { name: "values", label: "Numbers (comma or space separated)", type: "textarea",
      default: "2, 4, 4, 4, 5, 5, 7, 9", placeholder: "e.g. 2 4 4 4 5 5 7 9" },
    { name: "basis", label: "Basis", type: "select", default: "sample",
      options: [{ label: "Sample (n−1)", value: "sample" }, { label: "Population (n)", value: "population" }] },
  ],
  related: ["average", "median-mode"],
  calculate: (raw) => {
    const nums = parseNums(raw.values);
    if (nums.length < 2) {
      return { rows: [{ key: "sd", label: "Standard deviation", value: "—" }] };
    }
    const n = nums.length;
    const mean = nums.reduce((a, b) => a + b, 0) / n;
    const sqDiff = nums.map((x) => (x - mean) ** 2);
    const variancePop = sqDiff.reduce((a, b) => a + b, 0) / n;
    const varianceSample = sqDiff.reduce((a, b) => a + b, 0) / (n - 1);
    const basis = String(raw.basis ?? "sample");
    const variance = basis === "population" ? variancePop : varianceSample;
    const sd = Math.sqrt(variance);
    const cv = mean === 0 ? NaN : (sd / Math.abs(mean)) * 100;
    return {
      rows: [
        { key: "sd", label: `Standard deviation (${basis})`, value: fmt(sd, 4), emphasis: "primary" },
        { key: "variance", label: `Variance (${basis})`, value: fmt(variance, 4) },
        { key: "mean", label: "Mean", value: fmt(mean, 4) },
        { key: "cv", label: "Coefficient of variation", value: `${fmt(cv, 2)}%` },
      ],
      sections: [{
        title: "Other basis",
        rows: [
          { key: "sd_pop", label: "Population SD", value: fmt(Math.sqrt(variancePop), 4) },
          { key: "sd_samp", label: "Sample SD", value: fmt(Math.sqrt(varianceSample), 4) },
        ],
      }],
    };
  },
  tests: [
    { name: "2,4,4,4,5,5,7,9 sample", inputs: { values: "2, 4, 4, 4, 5, 5, 7, 9", basis: "sample" }, expected: { sd: "2.1381" } },
    { name: "2,4,4,4,5,5,7,9 population", inputs: { values: "2, 4, 4, 4, 5, 5, 7, 9", basis: "population" }, expected: { sd: "2" } },
  ],
};
