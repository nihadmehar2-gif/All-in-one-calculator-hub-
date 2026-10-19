/**
 * Algebra and Equations — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* --------------------- Linear equation solver --------------------- */
export const linearEquationSolver: CalculatorDefinition = {
  slug: "linear-equation-solver",
  name: "Linear Equation Solver (ax + b = c)",
  description: "Solve a first-degree linear equation in one variable.",
  category: "algebra",
  keywords: ["linear", "equation", "first degree", "solve for x", "ax+b=c"],
  status: "live",
  part: 2,
  inputs: [
    { name: "a", label: "Coefficient a", type: "number", default: 3, step: "any" },
    { name: "b", label: "Constant b", type: "number", default: 7, step: "any" },
    { name: "c", label: "Right-hand side c", type: "number", default: 22, step: "any" },
  ],
  related: ["quadratic-solver", "system-of-equations-2x2"],
  calculate: (raw) => {
    const a = toNum(raw.a);
    const b = toNum(raw.b);
    const c = toNum(raw.c);
    if (a === 0) {
      if (b === c) {
        return { rows: [{ key: "x", label: "Solution", value: "Infinite solutions", hint: "0x + b = c is true for every x." }] };
      }
      return { rows: [{ key: "x", label: "Solution", value: "No solution", hint: "0x ≠ c is a contradiction.", emphasis: "warning" }] };
    }
    const x = (c - b) / a;
    return {
      rows: [
        { key: "x", label: "x = (c − b) / a", value: fmt(x, 6), emphasis: "primary" },
      ],
      sections: [{
        title: "Worked check",
        rows: [
          { key: "check", label: `a·x + b`, value: fmt(a * x + b, 6) },
          { key: "target", label: "Target c", value: fmt(c, 6) },
        ],
      }],
      summary: "A linear equation ax + b = c has exactly one solution when a ≠ 0: x = (c − b) / a.",
    };
  },
  tests: [
    { name: "3x + 7 = 22 → x = 5", inputs: { a: 3, b: 7, c: 22 }, expected: { x: "5" } },
    { name: "2x - 4 = 10 → x = 7", inputs: { a: 2, b: -4, c: 10 }, expected: { x: "7" } },
    { name: "0x + 5 = 5 → infinite", inputs: { a: 0, b: 5, c: 5 }, expected: { x: "Infinite solutions" } },
  ],
};

/* --------------------- Quadratic solver --------------------------- */
export const quadraticSolver: CalculatorDefinition = {
  slug: "quadratic-solver",
  name: "Quadratic Equation Solver",
  description: "Find real and complex roots of ax² + bx + c = 0 using the quadratic formula.",
  category: "algebra",
  keywords: ["quadratic", "roots", "discriminant", "complex", "parabola", "ax^2+bx+c"],
  status: "live",
  part: 2,
  inputs: [
    { name: "a", label: "Coefficient a", type: "number", default: 1, step: "any", help: "Cannot be zero (else the equation is linear)." },
    { name: "b", label: "Coefficient b", type: "number", default: -5, step: "any" },
    { name: "c", label: "Coefficient c", type: "number", default: 6, step: "any" },
  ],
  related: ["linear-equation-solver", "system-of-equations-2x2"],
  calculate: (raw) => {
    const a = toNum(raw.a);
    const b = toNum(raw.b);
    const c = toNum(raw.c);
    if (a === 0) {
      return { rows: [{ key: "x1", label: "Root", value: "—", hint: "a = 0 makes this linear, not quadratic.", emphasis: "warning" }] };
    }
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      // Use the numerically stable form to avoid catastrophic cancellation
      const q = -0.5 * (b + Math.sign(b) * sq);
      const r1 = q / a;
      const r2 = c / q;
      const [x1, x2] = r1 <= r2 ? [r1, r2] : [r2, r1];
      return {
        rows: [
          { key: "x1", label: "Root x₁ (smaller)", value: fmt(x1, 6), emphasis: "primary" },
          { key: "x2", label: "Root x₂ (larger)", value: fmt(x2, 6), emphasis: disc > 0 ? "primary" : "normal" },
          { key: "disc", label: "Discriminant Δ = b² − 4ac", value: fmt(disc, 4) },
        ],
        summary: disc > 0 ? "Two distinct real roots." : disc === 0 ? "One repeated real root (the parabola touches the x-axis)." : "",
      };
    }
    // Complex roots
    const real = -b / (2 * a);
    const imag = Math.sqrt(-disc) / (2 * a);
    // Avoid "-0" in display
    const realStr = real === 0 ? "0" : fmt(real, 6);
    return {
      rows: [
        { key: "x1", label: "Root x₁", value: `${realStr} + ${fmt(imag, 6)}i`, emphasis: "primary" },
        { key: "x2", label: "Root x₂", value: `${realStr} − ${fmt(imag, 6)}i`, emphasis: "primary" },
        { key: "disc", label: "Discriminant Δ = b² − 4ac", value: fmt(disc, 4), hint: "Negative → complex conjugate roots." },
      ],
      summary: "Negative discriminant → two complex conjugate roots: x = (−b ± i√|Δ|) / (2a).",
    };
  },
  tests: [
    { name: "x²-5x+6=0 → 2, 3", inputs: { a: 1, b: -5, c: 6 }, expected: { x1: "2" } },
    { name: "x²+1=0 → ±i", inputs: { a: 1, b: 0, c: 1 }, expected: { x1: "0 + 1i" } },
    { name: "x²-4x+4=0 → 2 (repeated)", inputs: { a: 1, b: -4, c: 4 }, expected: { x1: "2" } },
  ],
};

/* -------------------- 2x2 system (Cramer's rule) ------------------ */
export const system2x2: CalculatorDefinition = {
  slug: "system-of-equations-2x2",
  name: "System of 2×2 Linear Equations",
  description: "Solve a system of two linear equations in two variables using Cramer's rule.",
  category: "algebra",
  keywords: ["system", "simultaneous", "cramer", "2x2", "two equations", "two unknowns"],
  status: "live",
  part: 2,
  inputs: [
    { name: "a1", label: "Equation 1: a₁·x + b₁·y = c₁ — coefficient a₁", type: "number", default: 2, step: "any" },
    { name: "b1", label: "coefficient b₁", type: "number", default: 3, step: "any" },
    { name: "c1", label: "right-hand side c₁", type: "number", default: 8, step: "any" },
    { name: "a2", label: "Equation 2: a₂·x + b₂·y = c₂ — coefficient a₂", type: "number", default: 4, step: "any" },
    { name: "b2", label: "coefficient b₂", type: "number", default: -1, step: "any" },
    { name: "c2", label: "right-hand side c₂", type: "number", default: 2, step: "any" },
  ],
  related: ["linear-equation-solver", "quadratic-solver"],
  calculate: (raw) => {
    const a1 = toNum(raw.a1), b1 = toNum(raw.b1), c1 = toNum(raw.c1);
    const a2 = toNum(raw.a2), b2 = toNum(raw.b2), c2 = toNum(raw.c2);
    const det = a1 * b2 - a2 * b1;
    if (det === 0) {
      // Either no solution or infinitely many
      const detX = c1 * b2 - c2 * b1;
      const detY = a1 * c2 - a2 * c1;
      if (detX === 0 && detY === 0) {
        return { rows: [{ key: "x", label: "Solution", value: "Infinitely many solutions", hint: "The two equations are dependent." }] };
      }
      return { rows: [{ key: "x", label: "Solution", value: "No solution", hint: "The two lines are parallel.", emphasis: "warning" }] };
    }
    const detX = c1 * b2 - c2 * b1;
    const detY = a1 * c2 - a2 * c1;
    const x = detX / det;
    const y = detY / det;
    return {
      rows: [
        { key: "x", label: "x", value: fmt(x, 6), emphasis: "primary" },
        { key: "y", label: "y", value: fmt(y, 6), emphasis: "primary" },
        { key: "det", label: "Determinant D = a₁b₂ − a₂b₁", value: fmt(det, 6) },
      ],
      sections: [{
        title: "Cramer's rule",
        rows: [
          { key: "dx", label: "D_x (replace col 1 with c)", value: fmt(detX, 6) },
          { key: "dy", label: "D_y (replace col 2 with c)", value: fmt(detY, 6) },
        ],
      }],
      summary: "Cramer's rule: x = D_x / D, y = D_y / D. If D = 0 the lines are either parallel or coincident.",
    };
  },
  tests: [
    { name: "2x+3y=8, 4x-y=2 → x=1, y=2", inputs: { a1: 2, b1: 3, c1: 8, a2: 4, b2: -1, c2: 2 }, expected: { x: "1" } },
    { name: "parallel lines → no solution", inputs: { a1: 1, b1: 1, c1: 1, a2: 2, b2: 2, c2: 3 }, expected: { x: "No solution" } },
  ],
};

/* ------------------ Sequences & series (AP/GP) -------------------- */
export const sequencesSeries: CalculatorDefinition = {
  slug: "sequences-series",
  name: "Sequences & Series (AP / GP)",
  description: "nth term and sum of first n terms for arithmetic and geometric progressions.",
  category: "algebra",
  keywords: ["arithmetic", "geometric", "progression", "sequence", "series", "AP", "GP", "sum"],
  status: "live",
  part: 2,
  inputs: [
    { name: "type", label: "Progression type", type: "select", default: "ap",
      options: [
        { label: "Arithmetic (AP): a, a+d, a+2d, …", value: "ap" },
        { label: "Geometric (GP): a, ar, ar², …", value: "gp" },
      ] },
    { name: "a", label: "First term (a)", type: "number", default: 2, step: "any" },
    { name: "d_or_r", label: "Common difference (d) or ratio (r)", type: "number", default: 3, step: "any" },
    { name: "n", label: "Number of terms (n)", type: "number", default: 5, min: 1, step: 1 },
  ],
  related: ["quadratic-solver", "permutations-combinations"],
  calculate: (raw) => {
    const type = String(raw.type ?? "ap");
    const a = toNum(raw.a);
    const dr = toNum(raw.d_or_r);
    const n = Math.max(1, Math.round(toNum(raw.n)));
    if (type === "ap") {
      const nth = a + (n - 1) * dr;
      const sum = (n / 2) * (2 * a + (n - 1) * dr);
      const series: { label: string; value: number }[] = [];
      for (let i = 1; i <= Math.min(n, 12); i++) {
        series.push({ label: `Term ${i}`, value: a + (i - 1) * dr });
      }
      return {
        rows: [
          { key: "nth", label: `Term ${n}`, value: fmt(nth, 6), emphasis: "primary" },
          { key: "sum", label: `Sum of first ${n} terms`, value: fmt(sum, 6), emphasis: "primary" },
        ],
        chart: { type: "bar", title: "First terms", series },
        summary: "AP: nth term = a + (n−1)d. Sum = (n/2)(2a + (n−1)d) = (n/2)(first + last).",
      };
    }
    // GP
    if (dr === 0) {
      return { rows: [{ key: "nth", label: "Term", value: "—", hint: "Common ratio cannot be zero." }] };
    }
    const nth = a * Math.pow(dr, n - 1);
    let sum: number;
    let sumHint = "";
    if (dr === 1) {
      sum = a * n;
      sumHint = " (r = 1 → every term equals a)";
    } else {
      sum = (a * (Math.pow(dr, n) - 1)) / (dr - 1);
    }
    const series: { label: string; value: number }[] = [];
    for (let i = 1; i <= Math.min(n, 12); i++) {
      series.push({ label: `Term ${i}`, value: a * Math.pow(dr, i - 1) });
    }
    return {
      rows: [
        { key: "nth", label: `Term ${n}`, value: fmt(nth, 6), emphasis: "primary" },
        { key: "sum", label: `Sum of first ${n} terms`, value: fmt(sum, 6), emphasis: "primary", hint: sumHint || undefined },
      ],
      chart: { type: "bar", title: "First terms", series },
      summary: "GP: nth term = a·r^(n−1). Sum = a(r^n − 1)/(r − 1) when r ≠ 1; if |r| < 1 the infinite sum is a/(1−r).",
    };
  },
  tests: [
    { name: "AP 2,5,8,... n=5 → 14, sum=40", inputs: { type: "ap", a: 2, d_or_r: 3, n: 5 }, expected: { nth: "14" } },
    { name: "AP sum 2,5,8,... n=5", inputs: { type: "ap", a: 2, d_or_r: 3, n: 5 }, expected: { sum: "40" } },
    { name: "GP 2,6,18,... n=4 → 54", inputs: { type: "gp", a: 2, d_or_r: 3, n: 4 }, expected: { nth: "54" } },
    { name: "GP sum 2,6,18,54 = 80", inputs: { type: "gp", a: 2, d_or_r: 3, n: 4 }, expected: { sum: "80" } },
  ],
};

/* ----------- Permutations, combinations & factorials -------------- */
export const permutationsCombinations: CalculatorDefinition = {
  slug: "permutations-combinations",
  name: "Permutations & Combinations",
  description: "Compute nPr, nCr and factorials for arranging or selecting items.",
  category: "algebra",
  keywords: ["npr", "ncr", "permutation", "combination", "factorial", "choose", "arrange"],
  status: "live",
  part: 2,
  inputs: [
    { name: "n", label: "Total items (n)", type: "number", default: 10, min: 0, step: 1 },
    { name: "r", label: "Items to choose (r)", type: "number", default: 3, min: 0, step: 1 },
  ],
  related: ["sequences-series", "binomial-probability"],
  calculate: (raw) => {
    const n = Math.max(0, Math.round(toNum(raw.n)));
    const r = Math.max(0, Math.round(toNum(raw.r)));
    if (r > n) {
      return {
        rows: [
          { key: "npr", label: "nPr", value: "0", hint: "r cannot exceed n." },
          { key: "ncr", label: "nCr", value: "0", hint: "r cannot exceed n." },
        ],
      };
    }
    // Use logarithms to avoid overflow for moderately large n
    const fact = (k: number): number => {
      let p = 1;
      for (let i = 2; i <= k; i++) p *= i;
      return p;
    };
    const falling = (base: number, count: number): number => {
      let p = 1;
      for (let i = 0; i < count; i++) p *= (base - i);
      return p;
    };
    const npr = falling(n, r);
    const ncr = npr / fact(r);
    const nFact = fact(n);
    const rFact = fact(r);
    return {
      rows: [
        { key: "npr", label: `P(n=${n}, r=${r}) = n!/(n−r)!`, value: fmt(npr, 0), emphasis: "primary" },
        { key: "ncr", label: `C(n=${n}, r=${r}) = n!/(r!(n−r)!)`, value: fmt(ncr, 0), emphasis: "primary" },
      ],
      sections: [{
        title: "Factorials",
        rows: [
          { key: "n_fact", label: `${n}!`, value: fmt(nFact, 0) },
          { key: "r_fact", label: `${r}!`, value: fmt(rFact, 0) },
        ],
      }],
      summary: "Permutations care about order; combinations do not. P(n,r) = n!/(n−r)!. C(n,r) = n!/(r!(n−r)!).",
    };
  },
  tests: [
    { name: "P(10, 3) = 720", inputs: { n: 10, r: 3 }, expected: { npr: "720" } },
    { name: "C(10, 3) = 120", inputs: { n: 10, r: 3 }, expected: { ncr: "120" } },
    { name: "P(5, 0) = 1, C(5, 0) = 1", inputs: { n: 5, r: 0 }, expected: { ncr: "1" } },
  ],
};
