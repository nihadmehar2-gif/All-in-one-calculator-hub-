/**
 * Calculus — implemented calculators.
 * Both tools use the shared expression parser so users can type f(x) as a
 * real expression (e.g. "x^2 + sin(x)") rather than picking from a fixed list.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";
import { evaluateExpression } from "../_expr";

/* ----------------- Numerical derivative --------------------------- */
export const numericalDerivative: CalculatorDefinition = {
  slug: "derivative",
  name: "Numerical Derivative (f'(x))",
  description: "Estimate the derivative of f(x) at a point using central differences.",
  category: "calculus",
  keywords: ["derivative", "differentiation", "f'", "slope", "tangent", "central difference"],
  status: "live",
  part: 2,
  inputs: [
    { name: "expr", label: "f(x) = ", type: "text", default: "x^2 + 3*x + 2",
      placeholder: "e.g. sin(x) + x^3" },
    { name: "x", label: "Evaluate at x", type: "number", default: 2, step: "any" },
    { name: "h", label: "Step size h", type: "number", default: 0.0001, min: 1e-12, step: "any",
      help: "Smaller h is more accurate until floating-point noise dominates. 1e-4 is a good default." },
  ],
  related: ["definite-integral", "scientific-calculator"],
  calculate: (raw) => {
    const expr = String(raw.expr ?? "");
    const x = toNum(raw.x);
    const h = Math.max(1e-12, toNum(raw.h));
    try {
      const fPlus = evaluateExpression(expr, { variables: { x: x + h } });
      const fMinus = evaluateExpression(expr, { variables: { x: x - h } });
      const fAt = evaluateExpression(expr, { variables: { x } });
      const deriv = (fPlus - fMinus) / (2 * h);
      // Second derivative for curvature info
      const second = (fPlus - 2 * fAt + fMinus) / (h * h);
      const series: { label: string; value: number }[] = [];
      const step = (Math.abs(x) + 1) * 0.1;
      for (let i = -5; i <= 5; i++) {
        const xi = x + i * step;
        try {
          const fi = evaluateExpression(expr, { variables: { x: xi } });
          series.push({ label: `x=${fmt(xi, 2)}`, value: fi });
        } catch { /* skip */ }
      }
      return {
        rows: [
          { key: "deriv", label: `f'(${fmt(x, 4)})`, value: fmt(deriv, 6), emphasis: "primary" },
          { key: "f_at", label: `f(${fmt(x, 4)})`, value: fmt(fAt, 6) },
          { key: "second", label: `f''(${fmt(x, 4)}) ≈ `, value: fmt(second, 6), hint: "Second derivative (curvature)." },
        ],
        chart: { type: "line", title: "f(x) near the evaluation point", series },
        summary: "Central difference: f'(x) ≈ (f(x+h) − f(x−h)) / (2h). Error is O(h²), so 1e-4 gives ~1e-8 accuracy for smooth functions.",
      };
    } catch (e) {
      return { rows: [{ key: "deriv", label: "f'(x)", value: "—", hint: (e as Error).message, emphasis: "warning" }] };
    }
  },
  tests: [
    { name: "d/dx x^2 at x=2 = 4", inputs: { expr: "x^2", x: 2, h: 0.0001 }, expected: { deriv: "4" }, tolerance: 1e-4 },
    { name: "d/dx sin(x) at x=0 = 1", inputs: { expr: "sin(x)", x: 0, h: 0.0001 }, expected: { deriv: "1" }, tolerance: 1e-4 },
    { name: "d/dx x^3 at x=1 = 3", inputs: { expr: "x^3", x: 1, h: 0.0001 }, expected: { deriv: "3" }, tolerance: 1e-4 },
  ],
};

/* ---------------- Definite integral (Simpson's rule) -------------- */
export const definiteIntegral: CalculatorDefinition = {
  slug: "definite-integral",
  name: "Definite Integral (Simpson's Rule)",
  description: "Approximate ∫f(x)dx from a to b using composite Simpson's rule.",
  category: "calculus",
  keywords: ["integral", "antiderivative", "area under curve", "simpson", "numerical integration"],
  status: "live",
  part: 2,
  inputs: [
    { name: "expr", label: "f(x) = ", type: "text", default: "x^2",
      placeholder: "e.g. sin(x) / x" },
    { name: "a", label: "Lower limit a", type: "number", default: 0, step: "any" },
    { name: "b", label: "Upper limit b", type: "number", default: 3, step: "any" },
    { name: "n", label: "Subintervals n (even)", type: "number", default: 100, min: 2, step: 2,
      help: "More subintervals = more accuracy. Must be even." },
  ],
  related: ["derivative", "scientific-calculator"],
  calculate: (raw) => {
    const expr = String(raw.expr ?? "");
    const a = toNum(raw.a);
    const b = toNum(raw.b);
    let n = Math.max(2, Math.round(toNum(raw.n)));
    if (n % 2 !== 0) n += 1; // force even
    if (a === b) {
      return { rows: [{ key: "integral", label: `∫ from ${fmt(a, 4)} to ${fmt(b, 4)}`, value: "0", hint: "Equal bounds → zero area." }] };
    }
    try {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const h = (hi - lo) / n;
      let sum = 0;
      const series: { label: string; value: number }[] = [];
      for (let i = 0; i <= n; i++) {
        const xi = lo + i * h;
        const fi = evaluateExpression(expr, { variables: { x: xi } });
        if (i === 0 || i === n) sum += fi;
        else if (i % 2 === 0) sum += 2 * fi;
        else sum += 4 * fi;
        if (i % Math.max(1, Math.floor(n / 20)) === 0 || i === n) {
          series.push({ label: fmt(xi, 2), value: fi });
        }
      }
      const integral = (h / 3) * sum * (a < b ? 1 : -1);
      return {
        rows: [
          { key: "integral", label: `∫ from ${fmt(a, 4)} to ${fmt(b, 4)}`, value: fmt(integral, 6), emphasis: "primary" },
          { key: "n", label: "Subintervals used", value: fmt(n, 0) },
          { key: "h", label: "Step size h", value: fmt(h, 6) },
        ],
        chart: { type: "line", title: "f(x) over [a, b]", series },
        summary: "Simpson's rule: ∫ ≈ (h/3)·[f₀ + 4·(odd terms) + 2·(even terms) + fₙ]. Error is O(h⁴) for smooth functions.",
      };
    } catch (e) {
      return { rows: [{ key: "integral", label: "Integral", value: "—", hint: (e as Error).message, emphasis: "warning" }] };
    }
  },
  tests: [
    { name: "∫x² from 0 to 3 = 9", inputs: { expr: "x^2", a: 0, b: 3, n: 100 }, expected: { integral: "9" }, tolerance: 1e-3 },
    { name: "∫1 from 0 to 5 = 5", inputs: { expr: "1", a: 0, b: 5, n: 100 }, expected: { integral: "5" }, tolerance: 1e-3 },
    { name: "∫sin from 0 to π ≈ 2", inputs: { expr: "sin(x)", a: 0, b: 3.141592653589793, n: 100 }, expected: { integral: "2" }, tolerance: 1e-3 },
  ],
};
