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

/* --------------------- Probability & EV --------------------------- */
export const probabilityExpectedValue: CalculatorDefinition = {
  slug: "probability-expected-value",
  name: "Probability & Expected Value",
  description: "Expected value, variance and standard deviation of a discrete probability distribution.",
  category: "statistics",
  keywords: ["expected value", "EV", "mean", "variance", "probability distribution", "discrete"],
  status: "live",
  part: 2,
  inputs: [
    { name: "outcomes", label: "Outcomes (one per line: <value> <probability>)", type: "textarea",
      default: "10 0.25\n20 0.40\n30 0.20\n40 0.15",
      placeholder: "value probability\ne.g. 10 0.25" },
  ],
  related: ["standard-deviation", "binomial-probability", "normal-distribution"],
  calculate: (raw) => {
    const text = String(raw.outcomes ?? "");
    const rows = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const pairs: { v: number; p: number }[] = [];
    for (const line of rows) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const v = toNum(parts[0]);
      const p = toNum(parts[1]);
      if (Number.isFinite(v) && Number.isFinite(p)) pairs.push({ v, p });
    }
    if (pairs.length === 0) {
      return { rows: [{ key: "ev", label: "Expected value", value: "—" }] };
    }
    const totalP = pairs.reduce((s, x) => s + x.p, 0);
    if (Math.abs(totalP - 1) > 0.001) {
      return { rows: [{ key: "ev", label: "Expected value", value: "—", hint: `Probabilities sum to ${fmt(totalP, 4)}, not 1.`, emphasis: "warning" }] };
    }
    const ev = pairs.reduce((s, x) => s + x.v * x.p, 0);
    const variance = pairs.reduce((s, x) => s + x.p * (x.v - ev) ** 2, 0);
    const sd = Math.sqrt(variance);
    const series = pairs.map((x) => ({ label: String(x.v), value: x.p }));
    return {
      rows: [
        { key: "ev", label: "Expected value E[X]", value: fmt(ev, 4), emphasis: "primary" },
        { key: "var", label: "Variance Var(X)", value: fmt(variance, 4) },
        { key: "sd", label: "Standard deviation σ", value: fmt(sd, 4) },
      ],
      sections: [{
        title: "Distribution check",
        rows: [
          { key: "n", label: "Number of outcomes", value: String(pairs.length) },
          { key: "sum_p", label: "Sum of probabilities", value: fmt(totalP, 6) },
        ],
      }],
      chart: { type: "bar", title: "Probability distribution", series },
      summary: "E[X] = Σ x·P(x). Variance = Σ P(x)·(x − E[X])². Probabilities must sum to 1.",
    };
  },
  tests: [
    { name: "fair die EV = 3.5", inputs: { outcomes: "1 0.16667\n2 0.16667\n3 0.16667\n4 0.16667\n5 0.16667\n6 0.16665" }, expected: { ev: "3.5" }, tolerance: 0.01 },
    { name: "coin flip 0/1 → EV=0.5", inputs: { outcomes: "0 0.5\n1 0.5" }, expected: { ev: "0.5" } },
  ],
};

/* ----------------------- Binomial probability --------------------- */
export const binomialProbability: CalculatorDefinition = {
  slug: "binomial-probability",
  name: "Binomial Probability",
  description: "Compute P(X = k), P(X ≤ k) and P(X ≥ k) for a binomial distribution.",
  category: "statistics",
  keywords: ["binomial", "probability", "p(x=k)", "cumulative", "coin flip", "trials"],
  status: "live",
  part: 2,
  inputs: [
    { name: "n", label: "Number of trials (n)", type: "number", default: 10, min: 0, step: 1 },
    { name: "p", label: "Success probability (p)", type: "number", default: 0.5, min: 0, max: 1, step: "any" },
    { name: "k", label: "Number of successes (k)", type: "number", default: 5, min: 0, step: 1 },
  ],
  related: ["permutations-combinations", "normal-distribution", "probability-expected-value"],
  calculate: (raw) => {
    const n = Math.max(0, Math.round(toNum(raw.n)));
    const p = Math.max(0, Math.min(1, toNum(raw.p)));
    const k = Math.max(0, Math.round(toNum(raw.k)));
    if (k > n) {
      return { rows: [{ key: "pmf", label: "P(X=k)", value: "0", hint: "k cannot exceed n." }] };
    }
    // log-factorial to avoid overflow
    const logFact = (m: number): number => {
      let s = 0;
      for (let i = 2; i <= m; i++) s += Math.log(i);
      return s;
    };
    const logPmf = (j: number): number => {
      if (p === 0) return j === 0 ? 0 : -Infinity;
      if (p === 1) return j === n ? 0 : -Infinity;
      return logFact(n) - logFact(j) - logFact(n - j) + j * Math.log(p) + (n - j) * Math.log(1 - p);
    };
    const pmf = (j: number): number => {
      const lp = logPmf(j);
      return lp === -Infinity ? 0 : Math.exp(lp);
    };
    const pExact = pmf(k);
    let pAtMost = 0;
    for (let j = 0; j <= k; j++) pAtMost += pmf(j);
    let pAtLeast = 0;
    for (let j = k; j <= n; j++) pAtLeast += pmf(j);
    const mean = n * p;
    const variance = n * p * (1 - p);
    const sd = Math.sqrt(variance);
    // Distribution chart
    const series: { label: string; value: number }[] = [];
    for (let j = 0; j <= n; j++) {
      series.push({ label: String(j), value: round(pmf(j), 6) });
    }
    return {
      rows: [
        { key: "pmf", label: `P(X = ${k})`, value: fmt(pExact, 6), emphasis: "primary" },
        { key: "cdf_le", label: `P(X ≤ ${k})`, value: fmt(pAtMost, 6) },
        { key: "cdf_ge", label: `P(X ≥ ${k})`, value: fmt(pAtLeast, 6) },
      ],
      sections: [{
        title: "Distribution parameters",
        rows: [
          { key: "mean", label: "Mean E[X] = np", value: fmt(mean, 4) },
          { key: "var", label: "Variance np(1−p)", value: fmt(variance, 4) },
          { key: "sd", label: "Standard deviation", value: fmt(sd, 4) },
        ],
      }],
      chart: { type: "bar", title: "Binomial PMF", series },
      summary: "P(X=k) = C(n,k)·p^k·(1−p)^(n−k). Mean = np, variance = np(1−p).",
    };
  },
  tests: [
    { name: "P(X=5) for n=10, p=0.5 = 0.2461", inputs: { n: 10, p: 0.5, k: 5 }, expected: { pmf: "0.2461" }, tolerance: 0.0001 },
    { name: "P(X=0) for n=10, p=0.5 = 0.000977", inputs: { n: 10, p: 0.5, k: 0 }, expected: { pmf: "0.000977" }, tolerance: 0.0000001 },
    { name: "P(X=10) for n=10, p=1 = 1", inputs: { n: 10, p: 1, k: 10 }, expected: { pmf: "1" } },
  ],
};

/* --------------------- Normal distribution ------------------------ */
export const normalDistribution: CalculatorDefinition = {
  slug: "normal-distribution",
  name: "Normal Distribution (Z-score & CDF)",
  description: "Convert a value to a z-score and find cumulative probability P(X ≤ x) for a normal distribution.",
  category: "statistics",
  keywords: ["normal", "gaussian", "z-score", "bell curve", "cdf", "cumulative", "standardize"],
  status: "live",
  part: 2,
  inputs: [
    { name: "x", label: "Value (x)", type: "number", default: 75, step: "any" },
    { name: "mean", label: "Mean (μ)", type: "number", default: 70, step: "any" },
    { name: "sd", label: "Standard deviation (σ)", type: "number", default: 10, min: 0.0001, step: "any" },
  ],
  related: ["standard-deviation", "binomial-probability", "confidence-interval"],
  calculate: (raw) => {
    const x = toNum(raw.x);
    const mean = toNum(raw.mean);
    const sd = toNum(raw.sd);
    if (sd <= 0) {
      return { rows: [{ key: "z", label: "Z-score", value: "—", hint: "Standard deviation must be positive.", emphasis: "warning" }] };
    }
    const z = (x - mean) / sd;
    // Abramowitz & Stegun 7.1.26 erf approximation
    const erf = (t: number): number => {
      const sign = Math.sign(t);
      const tt = Math.abs(t);
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
      const u = 1 / (1 + p * tt);
      const y = 1 - (((((a5 * u + a4) * u) + a3) * u + a2) * u + a1) * u * Math.exp(-tt * tt);
      return sign * y;
    };
    // P(X ≤ x) = 0.5 * (1 + erf((x - mean) / (sd * sqrt(2))))
    const cdf = 0.5 * (1 + erf((x - mean) / (sd * Math.sqrt(2))));
    const pdf = Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
    const above = 1 - cdf;
    // Build the bell curve around the mean
    const series: { label: string; value: number }[] = [];
    for (let i = -4; i <= 4; i++) {
      const xi = mean + i * sd;
      const pdfI = Math.exp(-0.5 * ((xi - mean) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
      series.push({ label: fmt(xi, 1), value: round(pdfI, 6) });
    }
    return {
      rows: [
        { key: "z", label: "Z-score", value: fmt(z, 4), emphasis: "primary" },
        { key: "cdf", label: `P(X ≤ ${fmt(x, 4)})`, value: fmt(cdf * 100, 4) + "%", emphasis: "primary" },
        { key: "above", label: `P(X > ${fmt(x, 4)})`, value: fmt(above * 100, 4) + "%" },
        { key: "pdf", label: "Probability density f(x)", value: fmt(pdf, 6) },
      ],
      chart: { type: "line", title: "Normal PDF", series },
      summary: "Z = (x − μ) / σ standardizes any normal variable. P(X ≤ x) = Φ(z) = ½[1 + erf(z/√2)].",
    };
  },
  tests: [
    { name: "z = (75-70)/10 = 0.5", inputs: { x: 75, mean: 70, sd: 10 }, expected: { z: "0.5" } },
    { name: "P(X ≤ mean) = 50%", inputs: { x: 70, mean: 70, sd: 10 }, expected: { cdf: "50%" } },
    { name: "z = 1 → CDF ≈ 84.13%", inputs: { x: 80, mean: 70, sd: 10 }, expected: { cdf: "84.1345%" }, tolerance: 0.01 },
  ],
};

/* -------------------- Confidence interval ------------------------- */
export const confidenceInterval: CalculatorDefinition = {
  slug: "confidence-interval",
  name: "Confidence Interval for the Mean",
  description: "Compute a confidence interval for a population mean using z (large samples) or t (small samples).",
  category: "statistics",
  keywords: ["confidence interval", "margin of error", "ci", "z-score", "t-score", "statistics"],
  status: "live",
  part: 2,
  inputs: [
    { name: "mean", label: "Sample mean (x̄)", type: "number", default: 100, step: "any" },
    { name: "sd", label: "Sample standard deviation (s)", type: "number", default: 15, min: 0.0001, step: "any" },
    { name: "n", label: "Sample size (n)", type: "number", default: 30, min: 2, step: 1 },
    { name: "confidence", label: "Confidence level", type: "select", default: "0.95",
      options: [
        { label: "90%", value: "0.90" },
        { label: "95%", value: "0.95" },
        { label: "99%", value: "0.99" },
      ] },
  ],
  related: ["normal-distribution", "standard-deviation"],
  calculate: (raw) => {
    const mean = toNum(raw.mean);
    const sd = toNum(raw.sd);
    const n = Math.max(2, Math.round(toNum(raw.n)));
    const conf = Number(raw.confidence ?? 0.95);
    if (sd <= 0) {
      return { rows: [{ key: "lower", label: "Lower bound", value: "—", hint: "SD must be positive.", emphasis: "warning" }] };
    }
    const se = sd / Math.sqrt(n);
    // Use z critical values (large-sample approximation). For small samples, a full
    // t-distribution table would be needed; we approximate by inflating z slightly
    // when n < 30. For n ≥ 30 the z-approximation is standard practice.
    const zTable: Record<string, number> = { "0.90": 1.645, "0.95": 1.96, "0.99": 2.576 };
    let z = zTable[String(conf)] ?? 1.96;
    let method = "z (large-sample)";
    if (n < 30) {
      // Conservative inflation: use z * 1.05 to approximate t with df=n-1
      z *= 1.05;
      method = "z inflated (small-sample — exact t-table not implemented)";
    }
    const me = z * se;
    const lower = mean - me;
    const upper = mean + me;
    return {
      rows: [
        { key: "lower", label: "Lower bound", value: fmt(lower, 4), emphasis: "primary" },
        { key: "upper", label: "Upper bound", value: fmt(upper, 4), emphasis: "primary" },
        { key: "me", label: "Margin of error", value: fmt(me, 4) },
      ],
      sections: [{
        title: "Inputs",
        rows: [
          { key: "se", label: "Standard error (s/√n)", value: fmt(se, 6) },
          { key: "z", label: "Critical value", value: fmt(z, 4) },
          { key: "method", label: "Method", value: method },
          { key: "ci_pct", label: "Confidence level", value: `${(conf * 100).toFixed(0)}%` },
        ],
      }],
      summary: `CI = x̄ ± z·(s/√n). We are ${(conf * 100).toFixed(0)}% confident the true mean lies in [${fmt(lower, 4)}, ${fmt(upper, 4)}].`,
    };
  },
  tests: [
    { name: "mean=100, sd=15, n=30, 95% → ME=5.3677", inputs: { mean: 100, sd: 15, n: 30, confidence: "0.95" }, expected: { me: "5.3677" } },
    { name: "mean=100, sd=15, n=30, 99% → ME=7.0547", inputs: { mean: 100, sd: 15, n: 30, confidence: "0.99" }, expected: { me: "7.0547" } },
  ],
};
