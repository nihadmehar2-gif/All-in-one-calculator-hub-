/**
 * Basic Mathematics — implemented calculators.
 * Each export is a CalculatorDefinition with self-verifying tests.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum, round } from "../_format";
import { evaluateExpression } from "../_expr";

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
  related: ["percentage-change", "reverse-percentage", "fraction-to-decimal"],
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

/* ----------------------- Percentage change ------------------------ */
export const percentageChange: CalculatorDefinition = {
  slug: "percentage-change",
  name: "Percentage Change Calculator",
  description: "Percent increase or decrease between an original and a new value.",
  category: "basic-math",
  keywords: ["increase", "decrease", "growth", "decline", "change", "delta %"],
  status: "live",
  part: 2,
  inputs: [
    { name: "original", label: "Original value", type: "number", default: 80, step: "any" },
    { name: "new", label: "New value", type: "number", default: 100, step: "any" },
  ],
  related: ["percentage", "reverse-percentage"],
  calculate: (raw) => {
    const o = toNum(raw.original);
    const n = toNum(raw.new);
    if (o === 0) {
      return { rows: [{ key: "pct", label: "Percentage change", value: "—", hint: "Original value cannot be zero." }] };
    }
    const change = n - o;
    const pct = (change / Math.abs(o)) * 100;
    const direction = change > 0 ? "increase" : change < 0 ? "decrease" : "no change";
    return {
      rows: [
        { key: "pct", label: `Percentage ${direction}`, value: `${fmt(Math.abs(pct), 4)}%`, emphasis: "primary" },
        { key: "abs_change", label: "Absolute change", value: fmt(change, 4) },
      ],
      summary: "Formula: ((new − original) / |original|) × 100. Using the absolute value of the original keeps the sign meaningful.",
    };
  },
  tests: [
    { name: "80 → 100 = 25% increase", inputs: { original: 80, new: 100 }, expected: { pct: "25%" } },
    { name: "100 → 80 = 20% decrease", inputs: { original: 100, new: 80 }, expected: { pct: "20%" } },
    { name: "50 → 50 = 0%", inputs: { original: 50, new: 50 }, expected: { pct: "0%" } },
  ],
};

/* --------------------- Reverse percentage ------------------------- */
export const reversePercentage: CalculatorDefinition = {
  slug: "reverse-percentage",
  name: "Reverse Percentage Calculator",
  description: "Find the original value before a percentage increase or decrease was applied.",
  category: "basic-math",
  keywords: ["original value", "before discount", "back calculate", "reverse percent"],
  status: "live",
  part: 2,
  inputs: [
    { name: "final_value", label: "Final value", type: "number", default: 120, step: "any" },
    { name: "pct", label: "Percentage applied", type: "number", default: 20, step: "any", unit: "%" },
    { name: "direction", label: "Direction", type: "select", default: "increase",
      options: [
        { label: "Final is after an increase", value: "increase" },
        { label: "Final is after a decrease", value: "decrease" },
      ] },
  ],
  related: ["percentage", "percentage-change"],
  calculate: (raw) => {
    const f = toNum(raw.final_value);
    const p = toNum(raw.pct);
    const dir = String(raw.direction ?? "increase");
    const factor = dir === "increase" ? 1 + p / 100 : 1 - p / 100;
    if (factor === 0) {
      return { rows: [{ key: "original", label: "Original value", value: "—", hint: "100% decrease has no original." }] };
    }
    const original = f / factor;
    const diff = f - original;
    return {
      rows: [
        { key: "original", label: "Original value", value: fmt(original, 4), emphasis: "primary" },
        { key: "diff", label: dir === "increase" ? "Increase applied" : "Decrease applied", value: fmt(Math.abs(diff), 4) },
      ],
      summary: dir === "increase"
        ? "If final = original × (1 + p/100), then original = final ÷ (1 + p/100)."
        : "If final = original × (1 − p/100), then original = final ÷ (1 − p/100).",
    };
  },
  tests: [
    { name: "120 after 20% increase → 100", inputs: { final_value: 120, pct: 20, direction: "increase" }, expected: { original: "100" } },
    { name: "80 after 20% decrease → 100", inputs: { final_value: 80, pct: 20, direction: "decrease" }, expected: { original: "100" } },
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
  related: ["median-mode", "standard-deviation", "weighted-average"],
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
  related: ["decimal-to-fraction", "percentage", "ratio-simplifier"],
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
    { name: "3/4", inputs: { numerator: 3, denominator: 4 }, expected: { decimal: "0.75" } },
    { name: "1/3", inputs: { numerator: 1, denominator: 3 }, expected: { decimal: "0.333333" } },
  ],
};

/* -------------------- Decimal to fraction ------------------------- */
export const decimalToFraction: CalculatorDefinition = {
  slug: "decimal-to-fraction",
  name: "Decimal to Fraction",
  description: "Convert any decimal to a simplified fraction using continued fractions.",
  category: "basic-math",
  keywords: ["decimal", "fraction", "convert", "rational"],
  status: "live",
  part: 2,
  inputs: [
    { name: "value", label: "Decimal value", type: "number", default: 0.625, step: "any" },
  ],
  related: ["fraction-to-decimal", "percentage", "ratio-simplifier"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    if (!Number.isFinite(v)) {
      return { rows: [{ key: "fraction", label: "Fraction", value: "—" }] };
    }
    // Use continued-fraction expansion to find the best rational approximation
    // with denominator up to 1_000_000.
    const sign = v < 0 ? -1 : 1;
    const x = Math.abs(v);
    let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
    do {
      const a = Math.floor(b);
      const h2 = a * h1 + h0;
      const k2 = a * k1 + k0;
      h0 = h1; h1 = h2; k0 = k1; k1 = k2;
      if (b - a < 1e-12) break;
      b = 1 / (b - a);
      if (!Number.isFinite(b) || k1 > 1_000_000) break;
    } while (k1 <= 1_000_000);
    const num = sign * h1;
    const den = k1;
    if (den === 0) {
      return { rows: [{ key: "fraction", label: "Fraction", value: "—" }] };
    }
    return {
      rows: [
        { key: "fraction", label: "Fraction", value: `${num} / ${den}`, emphasis: "primary" },
        { key: "decimal_check", label: "Decimal value", value: fmt(num / den, 10) },
      ],
      sections: [{
        title: "Mixed form",
        rows: [
          { key: "mixed", label: "Mixed number", value: Math.abs(num) >= den ? `${Math.trunc(num / den)} ${Math.abs(num) % den} / ${den}` : "—" },
        ],
      }],
      summary: "Continued-fraction expansion finds the simplest fraction equal to (or extremely close to) the decimal.",
    };
  },
  tests: [
    { name: "0.625 → 5/8", inputs: { value: 0.625 }, expected: { fraction: "5 / 8" } },
    { name: "0.75 → 3/4", inputs: { value: 0.75 }, expected: { fraction: "3 / 4" } },
    { name: "1.5 → 3/2", inputs: { value: 1.5 }, expected: { fraction: "3 / 2" } },
  ],
};

/* ------------------------- Ratio simplifier ----------------------- */
export const ratioSimplifier: CalculatorDefinition = {
  slug: "ratio-simplifier",
  name: "Ratio Simplifier",
  description: "Simplify a ratio a : b to its lowest whole-number terms.",
  category: "basic-math",
  keywords: ["ratio", "simplify", "lowest terms", "proportion"],
  status: "live",
  part: 2,
  inputs: [
    { name: "a", label: "First term (a)", type: "number", default: 12, step: "any" },
    { name: "b", label: "Second term (b)", type: "number", default: 18, step: "any" },
  ],
  related: ["fraction-to-decimal", "decimal-to-fraction", "percentage"],
  calculate: (raw) => {
    const a = toNum(raw.a);
    const b = toNum(raw.b);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return { rows: [{ key: "ratio", label: "Simplified ratio", value: "—" }] };
    }
    if (a === 0 && b === 0) {
      return { rows: [{ key: "ratio", label: "Simplified ratio", value: "—", hint: "Both terms cannot be zero." }] };
    }
    // Convert to integers by scaling
    const scale = Math.max(
      (Number.isInteger(a) ? 1 : Math.pow(10, (a.toString().split(".")[1] ?? "").length)),
      (Number.isInteger(b) ? 1 : Math.pow(10, (b.toString().split(".")[1] ?? "").length)),
    );
    const ai = Math.round(a * scale);
    const bi = Math.round(b * scale);
    const gcd = (x: number, y: number): number => (y === 0 ? Math.abs(x) : gcd(y, x % y));
    const g = gcd(ai, bi) || 1;
    const sa = ai / g;
    const sb = bi / g;
    return {
      rows: [
        { key: "ratio", label: "Simplified ratio", value: `${sa} : ${sb}`, emphasis: "primary" },
        { key: "decimal", label: "As decimal (a ÷ b)", value: sb === 0 ? "—" : fmt(sa / sb, 6) },
        { key: "pct", label: "a as % of b", value: sb === 0 ? "—" : `${fmt((sa / sb) * 100, 4)}%` },
      ],
      summary: "Divide both terms by their greatest common divisor (GCD) to reach the lowest whole-number ratio.",
    };
  },
  tests: [
    { name: "12:18 → 2:3", inputs: { a: 12, b: 18 }, expected: { ratio: "2 : 3" } },
    { name: "100:25 → 4:1", inputs: { a: 100, b: 25 }, expected: { ratio: "4 : 1" } },
  ],
};

/* --------------- GCD / LCM / Prime factorization ------------------ */
export const gcdLcmPrime: CalculatorDefinition = {
  slug: "gcd-lcm-prime-factors",
  name: "GCD, LCM & Prime Factors",
  description: "Greatest common divisor, least common multiple, and prime factorization of two integers.",
  category: "basic-math",
  keywords: ["gcd", "lcm", "hcf", "prime", "factor", "factorize", "euclidean"],
  status: "live",
  part: 2,
  inputs: [
    { name: "a", label: "First integer", type: "number", default: 84, step: 1 },
    { name: "b", label: "Second integer", type: "number", default: 60, step: 1 },
  ],
  related: ["ratio-simplifier", "fraction-to-decimal"],
  calculate: (raw) => {
    const aIn = toNum(raw.a);
    const bIn = toNum(raw.b);
    if (!Number.isInteger(aIn) || !Number.isInteger(bIn)) {
      return { rows: [{ key: "gcd", label: "GCD", value: "—", hint: "Both inputs must be integers." }] };
    }
    const a = Math.abs(aIn);
    const b = Math.abs(bIn);
    const gcdFn = (x: number, y: number): number => (y === 0 ? x : gcdFn(y, x % y));
    const gcd = gcdFn(a, b);
    const lcm = a === 0 || b === 0 ? 0 : (a * b) / gcd;
    const factorize = (n: number): string => {
      if (n < 2) return n === 1 ? "1" : "—";
      const factors: Record<number, number> = {};
      let m = n;
      for (let d = 2; d * d <= m; d++) {
        while (m % d === 0) { factors[d] = (factors[d] ?? 0) + 1; m /= d; }
      }
      if (m > 1) factors[m] = (factors[m] ?? 0) + 1;
      return Object.entries(factors).map(([p, e]) => e === 1 ? p : `${p}^${e}`).join(" × ");
    };
    return {
      rows: [
        { key: "gcd", label: "GCD (greatest common divisor)", value: fmt(gcd, 0), emphasis: "primary" },
        { key: "lcm", label: "LCM (least common multiple)", value: fmt(lcm, 0) },
      ],
      sections: [{
        title: "Prime factorizations",
        rows: [
          { key: "pf_a", label: `${a}`, value: factorize(a) },
          { key: "pf_b", label: `${b}`, value: factorize(b) },
        ],
      }],
      summary: "GCD uses the Euclidean algorithm; LCM = |a × b| / GCD. Prime factors are found by trial division up to √n.",
    };
  },
  tests: [
    { name: "gcd(84, 60) = 12", inputs: { a: 84, b: 60 }, expected: { gcd: "12" } },
    { name: "lcm(84, 60) = 420", inputs: { a: 84, b: 60 }, expected: { lcm: "420" } },
    { name: "gcd(17, 5) = 1 (coprime)", inputs: { a: 17, b: 5 }, expected: { gcd: "1" } },
  ],
};

/* ----------------- Exponents, roots and logarithms ---------------- */
export const exponentsRootsLogs: CalculatorDefinition = {
  slug: "exponents-roots-logs",
  name: "Exponents, Roots & Logarithms",
  description: "Compute power, root and logarithm of a number for any base.",
  category: "basic-math",
  keywords: ["power", "exponent", "root", "square root", "cube root", "log", "logarithm"],
  status: "live",
  part: 2,
  inputs: [
    { name: "x", label: "Value (x)", type: "number", default: 8, step: "any" },
    { name: "n", label: "Exponent / root degree / log base (n)", type: "number", default: 3, step: "any" },
  ],
  related: ["scientific-notation", "scientific-calculator"],
  calculate: (raw) => {
    const x = toNum(raw.x);
    const n = toNum(raw.n);
    const power = Math.pow(x, n);
    const root = n !== 0 ? (x < 0 && n % 2 === 0 ? NaN : Math.sign(x) * Math.pow(Math.abs(x), 1 / n)) : NaN;
    const logBaseN = x > 0 && n > 0 && n !== 1 ? Math.log(x) / Math.log(n) : NaN;
    return {
      rows: [
        { key: "power", label: `x^n = ${fmt(x, 4)}^${fmt(n, 4)}`, value: fmt(power, 6), emphasis: "primary" },
        { key: "root", label: `n-th root of x = x^(1/n)`, value: Number.isFinite(root) ? fmt(root, 6) : "—", hint: "Even roots of negatives are not real." },
        { key: "log", label: `log_n(x) = log base ${fmt(n, 4)} of ${fmt(x, 4)}`, value: Number.isFinite(logBaseN) ? fmt(logBaseN, 6) : "—", hint: "Requires x > 0, n > 0, n ≠ 1." },
      ],
      sections: [{
        title: "Common shortcuts",
        rows: [
          { key: "sqrt", label: "Square root (√x)", value: x >= 0 ? fmt(Math.sqrt(x), 6) : "—" },
          { key: "cbrt", label: "Cube root (∛x)", value: fmt(Math.cbrt(x), 6) },
          { key: "log10", label: "log₁₀(x)", value: x > 0 ? fmt(Math.log10(x), 6) : "—" },
          { key: "ln", label: "ln(x) (base e)", value: x > 0 ? fmt(Math.log(x), 6) : "—" },
        ],
      }],
      summary: "Logarithm: log_b(x) = ln(x) / ln(b). Roots: ⁿ√x = x^(1/n). For even n, negative x has no real root.",
    };
  },
  tests: [
    { name: "2^10 = 1024", inputs: { x: 2, n: 10 }, expected: { power: "1,024" } },
    { name: "cube root of 8 = 2", inputs: { x: 8, n: 3 }, expected: { root: "2" } },
    { name: "log_2(8) = 3", inputs: { x: 8, n: 2 }, expected: { log: "3" } },
  ],
};

/* ----------------------- Scientific notation ---------------------- */
export const scientificNotation: CalculatorDefinition = {
  slug: "scientific-notation",
  name: "Scientific Notation Converter",
  description: "Convert between decimal and scientific notation, with E-notation for engineering use.",
  category: "basic-math",
  keywords: ["scientific", "exponent", "e notation", "engineering", "power of 10"],
  status: "live",
  part: 2,
  inputs: [
    { name: "value", label: "Number", type: "number", default: 12345.678, step: "any" },
    { name: "sig_figs", label: "Significant figures", type: "number", default: 4, min: 1, max: 15, step: 1 },
  ],
  related: ["exponents-roots-logs", "scientific-calculator", "significant-figures"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const sf = Math.max(1, Math.min(15, Math.round(toNum(raw.sig_figs))));
    if (!Number.isFinite(v) || v === 0) {
      return { rows: [{ key: "sci", label: "Scientific notation", value: v === 0 ? "0 × 10^0" : "—" }] };
    }
    const exp = Math.floor(Math.log10(Math.abs(v)));
    const mantissa = v / Math.pow(10, exp);
    const mantissaRounded = Number(mantissa.toFixed(sf - 1));
    return {
      rows: [
        { key: "sci", label: "Scientific notation", value: `${mantissaRounded} × 10^${exp}`, emphasis: "primary" },
        { key: "e_notation", label: "E-notation", value: `${mantissaRounded}E${exp >= 0 ? "+" : ""}${exp}` },
        { key: "engineering", label: "Engineering notation", value: toEngineering(v) },
      ],
      summary: "Scientific: a × 10^b where 1 ≤ |a| < 10. Engineering notation uses exponents that are multiples of 3.",
    };
  },
  tests: [
    { name: "12345.678 → 1.235 × 10^4", inputs: { value: 12345.678, sig_figs: 4 }, expected: { sci: "1.235 × 10^4" } },
    { name: "0.00042 → 4.2 × 10^-4", inputs: { value: 0.00042, sig_figs: 2 }, expected: { sci: "4.2 × 10^-4" } },
  ],
};

function toEngineering(v: number): string {
  if (v === 0) return "0 × 10^0";
  const exp = Math.floor(Math.log10(Math.abs(v)) / 3) * 3;
  const mantissa = v / Math.pow(10, exp);
  return `${mantissa} × 10^${exp}`;
}

/* ---------------------- Scientific calculator --------------------- */
export const scientificCalculator: CalculatorDefinition = {
  slug: "scientific-calculator",
  name: "Scientific Calculator",
  description: "Evaluate expressions with parentheses, trig, log, sqrt, powers, constants and more.",
  category: "basic-math",
  keywords: ["calculator", "expression", "evaluate", "trig", "sin", "cos", "log", "sqrt", "pi", "e"],
  status: "live",
  part: 2,
  inputs: [
    { name: "expression", label: "Expression", type: "text", default: "2 * sin(pi/2) + sqrt(16) - log(100)",
      placeholder: "e.g. 2*(3+4)^2 - ln(e^3)" },
    { name: "angle", label: "Angle mode", type: "select", default: "rad",
      options: [{ label: "Radians", value: "rad" }, { label: "Degrees", value: "deg" }] },
  ],
  related: ["exponents-roots-logs", "scientific-notation"],
  calculate: (raw) => {
    const src = String(raw.expression ?? "");
    const angle = String(raw.angle ?? "rad") as "rad" | "deg";
    try {
      const r = evaluateExpression(src, { angleMode: angle });
      return {
        rows: [{ key: "result", label: "Result", value: fmt(r, 10), emphasis: "primary" }],
        sections: [{
          title: "Available functions & constants",
          rows: [
            { key: "ops", label: "Operators", value: "+  -  *  /  %  ^  ( )" },
            { key: "trig", label: "Trig", value: "sin cos tan asin acos atan sinh cosh tanh" },
            { key: "log", label: "Logs & powers", value: "log(x) log(base, x) ln(x) log2(x) exp(x) sqrt(x) cbrt(x)" },
            { key: "other", label: "Other", value: "abs floor ceil round sign fact(n)" },
            { key: "const", label: "Constants", value: "pi  e  tau  phi" },
          ],
        }],
        summary: `Evaluated with a safe recursive-descent parser (no eval). Angle mode: ${angle}.`,
      };
    } catch (e) {
      return {
        rows: [{ key: "result", label: "Result", value: "—", hint: (e as Error).message, emphasis: "warning" }],
        summary: "Common mistakes: missing operators between numbers, mismatched parentheses, unknown function names.",
      };
    }
  },
  tests: [
    { name: "2+3*4 = 14", inputs: { expression: "2+3*4", angle: "rad" }, expected: "14" },
    { name: "2^10 = 1024", inputs: { expression: "2^10", angle: "rad" }, expected: "1,024" },
    { name: "sin(pi/2) = 1", inputs: { expression: "sin(pi/2)", angle: "rad" }, expected: "1" },
    { name: "log(1000) = 3", inputs: { expression: "log(1000)", angle: "rad" }, expected: "3" },
    { name: "fact(5) = 120", inputs: { expression: "fact(5)", angle: "rad" }, expected: "120" },
  ],
};
