/**
 * Specialist Statistics — additional calculators beyond Part 2.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

function parseNums(text: unknown): number[] {
  const s = String(text ?? "");
  return s.split(/[\s,;]+/).map((t) => t.trim()).filter(Boolean)
    .map(toNum).filter((n) => Number.isFinite(n));
}

/* ----------------- Linear regression -------------------------------- */
export const linearRegression: CalculatorDefinition = {
  slug: "linear-regression",
  name: "Linear Regression (y = mx + b)",
  description: "Fit a line to (x, y) data points using least-squares regression.",
  category: "statistics",
  keywords: ["regression", "linear", "least squares", "trend line", "best fit", "correlation"],
  status: "live",
  part: 5,
  inputs: [
    { name: "points", label: "Data points (one per line: <x> <y>)", type: "textarea",
      default: "1 2\n2 4\n3 5\n4 4\n5 5",
      placeholder: "x y\ne.g. 1 2" },
  ],
  related: ["standard-deviation", "median-mode", "average"],
  calculate: (raw) => {
    const text = String(raw.points ?? "");
    const pts: { x: number; y: number }[] = [];
    for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const x = toNum(parts[0]);
      const y = toNum(parts[1]);
      if (Number.isFinite(x) && Number.isFinite(y)) pts.push({ x, y });
    }
    if (pts.length < 2) {
      return { rows: [{ key: "slope", label: "Slope", value: "—", hint: "Need at least 2 points." }] };
    }
    const n = pts.length;
    const sumX = pts.reduce((s, p) => s + p.x, 0);
    const sumY = pts.reduce((s, p) => s + p.y, 0);
    const sumXY = pts.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = pts.reduce((s, p) => s + p.x * p.x, 0);
    const sumYY = pts.reduce((s, p) => s + p.y * p.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;
    const denomX = sumXX - n * meanX * meanX;
    if (denomX === 0) {
      return { rows: [{ key: "slope", label: "Slope", value: "—", hint: "All x values are the same." }] };
    }
    const slope = (sumXY - n * meanX * meanY) / denomX;
    const intercept = meanY - slope * meanX;
    // Correlation coefficient r
    const denomY = sumYY - n * meanY * meanY;
    const r = denomY === 0 ? 0 : (sumXY - n * meanX * meanY) / Math.sqrt(denomX * denomY);
    const rSquared = r * r;
    // Residuals
    let ssRes = 0;
    for (const p of pts) {
      const pred = slope * p.x + intercept;
      ssRes += (p.y - pred) ** 2;
    }
    const rmse = Math.sqrt(ssRes / n);
    return {
      rows: [
        { key: "slope", label: "Slope (m)", value: fmt(slope, 6), emphasis: "primary" },
        { key: "intercept", label: "Intercept (b)", value: fmt(intercept, 6), emphasis: "primary" },
        { key: "equation", label: "Equation", value: `y = ${fmt(slope, 4)}x + ${fmt(intercept, 4)}` },
      ],
      sections: [{
        title: "Goodness of fit",
        rows: [
          { key: "r", label: "Correlation coefficient (r)", value: fmt(r, 6) },
          { key: "r2", label: "Coefficient of determination (r²)", value: fmt(rSquared, 6) },
          { key: "rmse", label: "RMSE", value: fmt(rmse, 6) },
          { key: "n", label: "Number of points", value: String(n) },
        ],
      }],
      summary: "Slope m = Σ((x−x̄)(y−ȳ)) ÷ Σ((x−x̄)²). r² close to 1 means a strong linear fit; r² close to 0 means the line explains little of the variation.",
    };
  },
  tests: [
    { name: "Perfect linear: (1,2),(2,4),(3,6)", inputs: { points: "1 2\n2 4\n3 6" }, expected: { slope: "2", r2: "1" } },
  ],
};

/* ----------------------- Poisson distribution ---------------------- */
export const poissonDistribution: CalculatorDefinition = {
  slug: "poisson-distribution",
  name: "Poisson Distribution",
  description: "Compute P(X=k) and cumulative probabilities for events with a known average rate λ.",
  category: "statistics",
  keywords: ["poisson", "distribution", "rare events", "lambda", "probability"],
  status: "live",
  part: 5,
  inputs: [
    { name: "lambda", label: "Average rate (λ) per interval", type: "number", default: 3, min: 0, step: "any" },
    { name: "k", label: "Number of events (k)", type: "number", default: 2, min: 0, step: 1 },
  ],
  related: ["binomial-probability", "normal-distribution", "probability-expected-value"],
  calculate: (raw) => {
    const lambda = Math.max(0, toNum(raw.lambda));
    const k = Math.max(0, Math.round(toNum(raw.k)));
    if (lambda === 0) {
      return {
        rows: [
          { key: "pmf", label: `P(X = ${k})`, value: k === 0 ? "1" : "0", emphasis: "primary" },
        ],
        summary: "When λ = 0, no events can occur. P(X=0) = 1, P(X=k>0) = 0.",
      };
    }
    // P(X=k) = e^(-λ) × λ^k / k!  (use log to avoid overflow)
    const logFact = (n: number): number => {
      let s = 0;
      for (let i = 2; i <= n; i++) s += Math.log(i);
      return s;
    };
    const logPmf = (j: number) => -lambda + j * Math.log(lambda) - logFact(j);
    const pmf = (j: number) => Math.exp(logPmf(j));
    const pExact = pmf(k);
    let pAtMost = 0;
    for (let j = 0; j <= k; j++) pAtMost += pmf(j);
    let pAtLeast = 0;
    for (let j = k; j <= k + 50; j++) pAtLeast += pmf(j); // cap to avoid infinite
    const variance = lambda;
    const sd = Math.sqrt(lambda);
    const series: { label: string; value: number }[] = [];
    for (let j = 0; j <= Math.min(k + 10, 30); j++) {
      series.push({ label: String(j), value: Math.round(pmf(j) * 1e6) / 1e6 });
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
          { key: "mean", label: "Mean E[X] = λ", value: fmt(lambda, 4) },
          { key: "var", label: "Variance = λ", value: fmt(variance, 4) },
          { key: "sd", label: "Standard deviation", value: fmt(sd, 4) },
        ],
      }],
      chart: { type: "bar", title: "Poisson PMF", series },
      summary: "P(X=k) = e^(−λ) × λ^k ÷ k!. Mean = variance = λ. Poisson models rare events in a fixed interval (arrivals per hour, defects per batch, etc.).",
    };
  },
  tests: [
    { name: "λ=3, k=2 → 0.224", inputs: { lambda: 3, k: 2 }, expected: { pmf: "0.224042" }, tolerance: 0.0001 },
    { name: "λ=2, k=0 → 0.1353", inputs: { lambda: 2, k: 0 }, expected: { pmf: "0.135335" }, tolerance: 0.0001 },
  ],
};

/* ----------------------- Hypergeometric ---------------------------- */
export const hypergeometric: CalculatorDefinition = {
  slug: "hypergeometric-distribution",
  name: "Hypergeometric Distribution",
  description: "Probability of k successes drawing n from a finite population without replacement.",
  category: "statistics",
  keywords: ["hypergeometric", "without replacement", "lottery", "card", "drawing"],
  status: "live",
  part: 5,
  inputs: [
    { name: "N", label: "Population size (N)", type: "number", default: 52, min: 1, step: 1 },
    { name: "K", label: "Success states in population (K)", type: "number", default: 4, min: 0, step: 1 },
    { name: "n", label: "Sample size (n)", type: "number", default: 5, min: 1, step: 1 },
    { name: "k", label: "Observed successes (k)", type: "number", default: 2, min: 0, step: 1 },
  ],
  related: ["binomial-probability", "poisson-distribution", "permutations-combinations"],
  calculate: (raw) => {
    const N = Math.max(0, Math.round(toNum(raw.N)));
    const K = Math.max(0, Math.round(toNum(raw.K)));
    const n = Math.max(0, Math.round(toNum(raw.n)));
    const k = Math.max(0, Math.round(toNum(raw.k)));
    if (K > N || n > N || k > K || k > n) {
      return { rows: [{ key: "pmf", label: "P(X=k)", value: "—", hint: "Invalid: check K ≤ N, n ≤ N, k ≤ K, k ≤ n.", emphasis: "warning" }] };
    }
    const logFact = (m: number): number => {
      let s = 0;
      for (let i = 2; i <= m; i++) s += Math.log(i);
      return s;
    };
    const logChoose = (a: number, b: number) => {
      if (b < 0 || b > a) return -Infinity;
      return logFact(a) - logFact(b) - logFact(a - b);
    };
    // P(X=k) = C(K,k) × C(N−K, n−k) / C(N, n)
    const logP = logChoose(K, k) + logChoose(N - K, n - k) - logChoose(N, n);
    const pExact = Math.exp(logP);
    // Cumulative: P(X ≤ k)
    let pAtMost = 0;
    for (let j = 0; j <= k; j++) {
      pAtMost += Math.exp(logChoose(K, j) + logChoose(N - K, n - j) - logChoose(N, n));
    }
    const mean = n * K / N;
    const variance = n * (K / N) * ((N - K) / N) * ((N - n) / (N - 1));
    return {
      rows: [
        { key: "pmf", label: `P(X = ${k})`, value: fmt(pExact, 6), emphasis: "primary" },
        { key: "cdf", label: `P(X ≤ ${k})`, value: fmt(pAtMost, 6) },
        { key: "mean", label: "Mean E[X]", value: fmt(mean, 4) },
        { key: "var", label: "Variance", value: fmt(variance, 4) },
      ],
      summary: "P(X=k) = C(K,k)·C(N−K, n−k) ÷ C(N, n). Used for sampling without replacement (e.g. lottery, card draws, quality inspection).",
    };
  },
  tests: [
    { name: "Card draw: 4 aces, 5 cards from 52, P(2 aces)", inputs: { N: 52, K: 4, n: 5, k: 2 }, expected: { pmf: "0.039929" }, tolerance: 0.0001 },
  ],
};

/* ------------------- Chi-square statistic -------------------------- */
export const chiSquareTest: CalculatorDefinition = {
  slug: "chi-square-goodness-of-fit",
  name: "Chi-Square Goodness of Fit",
  description: "Compute the χ² statistic between observed and expected frequencies.",
  category: "statistics",
  keywords: ["chi-square", "chi squared", "goodness of fit", "observed", "expected", "hypothesis"],
  status: "live",
  part: 5,
  inputs: [
    { name: "pairs", label: "Categories (one per line: <observed> <expected>)", type: "textarea",
      default: "30 25\n25 25\n20 25\n25 25",
      placeholder: "observed expected\ne.g. 30 25" },
  ],
  related: ["standard-deviation", "binomial-probability", "normal-distribution"],
  calculate: (raw) => {
    const text = String(raw.pairs ?? "");
    const pairs: { o: number; e: number }[] = [];
    for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const o = toNum(parts[0]);
      const e = toNum(parts[1]);
      if (Number.isFinite(o) && Number.isFinite(e)) pairs.push({ o, e });
    }
    if (pairs.length < 2) {
      return { rows: [{ key: "chi2", label: "χ²", value: "—" }] };
    }
    let chi2 = 0;
    let totalO = 0, totalE = 0;
    for (const p of pairs) {
      if (p.e <= 0) {
        return { rows: [{ key: "chi2", label: "χ²", value: "—", hint: "Expected frequencies must be > 0.", emphasis: "warning" }] };
      }
      chi2 += ((p.o - p.e) ** 2) / p.e;
      totalO += p.o;
      totalE += p.e;
    }
    const df = pairs.length - 1;
    // Critical values at common alpha levels (for df up to ~10)
    // Just provide a rough interpretation guide
    const rows = pairs.map((p, i) => ({
      key: `cat_${i}`,
      label: `Category ${i + 1}`,
      value: `O=${fmt(p.o, 0)}, E=${fmt(p.e, 0)}, (O−E)²/E=${fmt(((p.o - p.e) ** 2) / p.e, 4)}`,
    }));
    return {
      rows: [
        { key: "chi2", label: "χ² statistic", value: fmt(chi2, 4), emphasis: "primary" },
        { key: "df", label: "Degrees of freedom", value: String(df) },
        { key: "totals", label: "Total O / Total E", value: `${fmt(totalO, 0)} / ${fmt(totalE, 0)}` },
      ],
      sections: [
        { title: "Per-category breakdown", rows },
        { title: "Critical values (α=0.05)", rows: [
          { key: "cv_df1", label: "df=1 → 3.841", value: chi2 > 3.841 && df === 1 ? "reject H₀" : "" },
          { key: "cv_df2", label: "df=2 → 5.991", value: chi2 > 5.991 && df === 2 ? "reject H₀" : "" },
          { key: "cv_df3", label: "df=3 → 7.815", value: chi2 > 7.815 && df === 3 ? "reject H₀" : "" },
          { key: "cv_df4", label: "df=4 → 9.488", value: chi2 > 9.488 && df === 4 ? "reject H₀" : "" },
        ] },
      ],
      summary: "χ² = Σ((O−E)² ÷ E). If χ² exceeds the critical value at α=0.05 for your df, reject H₀ (the observed distribution differs significantly from expected).",
    };
  },
  tests: [
    { name: "All observed = expected → χ² = 0", inputs: { pairs: "25 25\n25 25\n25 25" }, expected: { chi2: "0" } },
  ],
};

/* ------------------- Correlation coefficient ----------------------- */
export const correlationCoefficient: CalculatorDefinition = {
  slug: "correlation-coefficient",
  name: "Pearson Correlation Coefficient",
  description: "Compute Pearson r between two paired datasets to measure linear association.",
  category: "statistics",
  keywords: ["pearson", "correlation", "r", "linear association", "scatter"],
  status: "live",
  part: 5,
  inputs: [
    { name: "x", label: "X values (comma separated)", type: "text", default: "1, 2, 3, 4, 5" },
    { name: "y", label: "Y values (comma separated)", type: "text", default: "2, 4, 5, 4, 5" },
  ],
  related: ["linear-regression", "standard-deviation", "average"],
  calculate: (raw) => {
    const x = parseNums(raw.x);
    const y = parseNums(raw.y);
    if (x.length < 2 || y.length < 2 || x.length !== y.length) {
      return { rows: [{ key: "r", label: "Pearson r", value: "—", hint: "X and Y need the same length, ≥2 values each." }] };
    }
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    if (denX === 0 || denY === 0) {
      return { rows: [{ key: "r", label: "Pearson r", value: "—", hint: "One of the variables has zero variance." }] };
    }
    const r = num / Math.sqrt(denX * denY);
    const r2 = r * r;
    let interpretation = "";
    const absR = Math.abs(r);
    if (absR < 0.1) interpretation = "Negligible correlation";
    else if (absR < 0.3) interpretation = "Weak correlation";
    else if (absR < 0.5) interpretation = "Moderate correlation";
    else if (absR < 0.7) interpretation = "Strong correlation";
    else if (absR < 0.9) interpretation = "Very strong correlation";
    else interpretation = "Near-perfect correlation";
    const direction = r > 0 ? "positive" : r < 0 ? "negative" : "no";
    return {
      rows: [
        { key: "r", label: "Pearson r", value: fmt(r, 6), emphasis: "primary" },
        { key: "r2", label: "r² (coefficient of determination)", value: fmt(r2, 6), emphasis: "primary" },
        { key: "interp", label: "Interpretation", value: `${interpretation} (${direction})` },
        { key: "n", label: "Sample size", value: String(n) },
      ],
      summary: "r = Σ((x−x̄)(y−ȳ)) ÷ √(Σ(x−x̄)² · Σ(y−ȳ)²). Range −1 to +1. Correlation does not imply causation.",
    };
  },
  tests: [
    { name: "Perfect positive: (1,2),(2,4),(3,6)", inputs: { x: "1, 2, 3", y: "2, 4, 6" }, expected: { r: "1" } },
    { name: "Perfect negative: (1,6),(2,4),(3,2)", inputs: { x: "1, 2, 3", y: "6, 4, 2" }, expected: { r: "-1" } },
  ],
};

/* ------------------- T-score (one-sample) -------------------------- */
export const tScore: CalculatorDefinition = {
  slug: "t-score-one-sample",
  name: "One-Sample T-Score",
  description: "Compute the t-statistic comparing a sample mean to a hypothesized population mean.",
  category: "statistics",
  keywords: ["t-score", "t-test", "hypothesis", "one sample", "student t"],
  status: "live",
  part: 5,
  inputs: [
    { name: "values", label: "Sample values (comma separated)", type: "text", default: "78, 82, 85, 79, 88, 81, 84" },
    { name: "mu0", label: "Hypothesized mean (μ₀)", type: "number", default: 80, step: "any" },
  ],
  related: ["standard-deviation", "average", "normal-distribution"],
  calculate: (raw) => {
    const vals = parseNums(raw.values);
    const mu0 = toNum(raw.mu0);
    if (vals.length < 2) {
      return { rows: [{ key: "t", label: "t-statistic", value: "—", hint: "Need at least 2 values." }] };
    }
    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const variance = vals.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1);
    const sd = Math.sqrt(variance);
    const se = sd / Math.sqrt(n);
    if (se === 0) {
      return { rows: [{ key: "t", label: "t-statistic", value: "—", hint: "Standard error is 0 (all values identical)." }] };
    }
    const t = (mean - mu0) / se;
    const df = n - 1;
    return {
      rows: [
        { key: "t", label: "t-statistic", value: fmt(t, 4), emphasis: "primary" },
        { key: "df", label: "Degrees of freedom", value: String(df) },
        { key: "mean", label: "Sample mean", value: fmt(mean, 4) },
        { key: "sd", label: "Sample SD", value: fmt(sd, 4) },
        { key: "se", label: "Standard error", value: fmt(se, 4) },
      ],
      sections: [{
        title: "Critical t-values (two-tailed, α=0.05)",
        rows: [
          { key: "cv_df5", label: "df=5 → ±2.571", value: Math.abs(t) > 2.571 && df === 5 ? "reject H₀" : "" },
          { key: "cv_df10", label: "df=10 → ±2.228", value: Math.abs(t) > 2.228 && df === 10 ? "reject H₀" : "" },
          { key: "cv_df30", label: "df=30 → ±2.042", value: Math.abs(t) > 2.042 && df === 30 ? "reject H₀" : "" },
          { key: "cv_large", label: "df>30 → ±1.96 (approx)", value: Math.abs(t) > 1.96 && df > 30 ? "reject H₀" : "" },
        ],
      }],
      summary: "t = (x̄ − μ₀) ÷ (s/√n). df = n − 1. If |t| > critical value, reject H₀ (sample mean differs significantly from μ₀).",
    };
  },
  tests: [
    { name: "Sample close to mean", inputs: { values: "78, 82, 85, 79, 88, 81, 84", mu0: 80 }, expected: { mean: "82.4286" } },
  ],
};

/* ------------------- ANOVA (one-way) -------------------------------- */
export const anovaOneWay: CalculatorDefinition = {
  slug: "anova-one-way",
  name: "One-Way ANOVA",
  description: "Compute the F-statistic for comparing means across 3 or more groups.",
  category: "statistics",
  keywords: ["anova", "f-test", "f statistic", "analysis of variance", "groups"],
  status: "live",
  part: 5,
  inputs: [
    { name: "groups", label: "Groups (one per line, comma-separated values)", type: "textarea",
      default: "10, 12, 11, 13, 10\n14, 15, 13, 16, 14\n9, 8, 10, 11, 9",
      placeholder: "Group 1 values\nGroup 2 values\nGroup 3 values" },
  ],
  related: ["t-score-one-sample", "standard-deviation", "average"],
  calculate: (raw) => {
    const text = String(raw.groups ?? "");
    const groups: number[][] = [];
    for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
      const nums = line.split(/[\s,;\t]+/).filter(Boolean).map(toNum).filter((n) => Number.isFinite(n));
      if (nums.length > 0) groups.push(nums);
    }
    if (groups.length < 2) {
      return { rows: [{ key: "f", label: "F-statistic", value: "—", hint: "Need at least 2 groups." }] };
    }
    const k = groups.length;
    const allValues: number[] = [];
    const groupMeans = groups.map((g) => {
      const m = g.reduce((a, b) => a + b, 0) / g.length;
      allValues.push(...g);
      return m;
    });
    const N = allValues.length;
    const grandMean = allValues.reduce((a, b) => a + b, 0) / N;
    // Between-group sum of squares
    let ssb = 0;
    for (let i = 0; i < k; i++) {
      ssb += groups[i].length * (groupMeans[i] - grandMean) ** 2;
    }
    // Within-group sum of squares
    let ssw = 0;
    for (let i = 0; i < k; i++) {
      for (const v of groups[i]) {
        ssw += (v - groupMeans[i]) ** 2;
      }
    }
    const dfBetween = k - 1;
    const dfWithin = N - k;
    if (dfWithin <= 0 || ssw === 0) {
      return { rows: [{ key: "f", label: "F-statistic", value: "—", hint: "Not enough data or zero within-group variance." }] };
    }
    const msb = ssb / dfBetween;
    const msw = ssw / dfWithin;
    const f = msb / msw;
    return {
      rows: [
        { key: "f", label: "F-statistic", value: fmt(f, 4), emphasis: "primary" },
        { key: "df_between", label: "df (between)", value: String(dfBetween) },
        { key: "df_within", label: "df (within)", value: String(dfWithin) },
      ],
      sections: [{
        title: "Sum of squares",
        rows: [
          { key: "ssb", label: "SS between (treatment)", value: fmt(ssb, 4) },
          { key: "ssw", label: "SS within (error)", value: fmt(ssw, 4) },
          { key: "msb", label: "MS between", value: fmt(msb, 4) },
          { key: "msw", label: "MS within", value: fmt(msw, 4) },
          { key: "grand_mean", label: "Grand mean", value: fmt(grandMean, 4) },
        ],
      }],
      summary: "F = MS_between ÷ MS_within. Large F suggests at least one group mean differs from the others. Use F-distribution table with (df_between, df_within) to find critical value at α=0.05.",
    };
  },
  tests: [
    { name: "3 groups, 5 values each", inputs: { groups: "10, 12, 11, 13, 10\n14, 15, 13, 16, 14\n9, 8, 10, 11, 9" }, expected: { df_between: "2", df_within: "12" } },
  ],
};

/* ------------------- Coefficient of variation ---------------------- */
export const coefficientOfVariation: CalculatorDefinition = {
  slug: "coefficient-of-variation",
  name: "Coefficient of Variation",
  description: "Compare the spread of two datasets relative to their means (CV = σ/μ).",
  category: "statistics",
  keywords: ["coefficient of variation", "cv", "relative standard deviation", "rsd"],
  status: "live",
  part: 5,
  inputs: [
    { name: "values", label: "Values (comma separated)", type: "text", default: "100, 102, 98, 101, 99, 103, 97" },
    { name: "basis", label: "SD basis", type: "select", default: "sample",
      options: [{ label: "Sample (n−1)", value: "sample" }, { label: "Population (n)", value: "population" }] },
  ],
  related: ["standard-deviation", "average", "median-mode"],
  calculate: (raw) => {
    const vals = parseNums(raw.values);
    const basis = String(raw.basis ?? "sample");
    if (vals.length < 2) {
      return { rows: [{ key: "cv", label: "CV", value: "—" }] };
    }
    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    if (mean === 0) {
      return { rows: [{ key: "cv", label: "CV", value: "—", hint: "Mean is 0; CV undefined." }] };
    }
    const divisor = basis === "sample" ? n - 1 : n;
    const variance = vals.reduce((s, x) => s + (x - mean) ** 2, 0) / divisor;
    const sd = Math.sqrt(variance);
    const cv = (sd / Math.abs(mean)) * 100;
    return {
      rows: [
        { key: "cv", label: "Coefficient of variation (CV)", value: `${fmt(cv, 4)}%`, emphasis: "primary" },
        { key: "mean", label: "Mean", value: fmt(mean, 4) },
        { key: "sd", label: `SD (${basis})`, value: fmt(sd, 4) },
      ],
      summary: "CV = (σ ÷ |μ|) × 100. CV is unitless, so it's useful for comparing variability across datasets measured in different units.",
    };
  },
  tests: [
    { name: "Same 7 values around 100 → CV small", inputs: { values: "100, 102, 98, 101, 99, 103, 97", basis: "sample" }, expected: { cv: "2%" }, tolerance: 0.5 },
  ],
};
