/**
 * Geometry and Trigonometry — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum, round } from "../_format";

/* Triangle area (Heron) */
export const triangleArea: CalculatorDefinition = {
  slug: "triangle-area-heron",
  name: "Triangle Area (Heron's Formula)",
  description: "Area of any triangle from its three side lengths using Heron's formula.",
  category: "geometry",
  keywords: ["heron", "heron's", "area", "triangle", "sides", "SSS"],
  status: "live",
  part: 1,
  inputs: [
    { name: "a", label: "Side a", type: "number", default: 3, min: 0, step: "any" },
    { name: "b", label: "Side b", type: "number", default: 4, min: 0, step: "any" },
    { name: "c", label: "Side c", type: "number", default: 5, min: 0, step: "any" },
  ],
  related: ["circle-area", "right-triangle"],
  calculate: (raw) => {
    const a = toNum(raw.a);
    const b = toNum(raw.b);
    const c = toNum(raw.c);
    if (a <= 0 || b <= 0 || c <= 0) {
      return { rows: [{ key: "area", label: "Area", value: "—", hint: "Sides must be positive." }] };
    }
    // Triangle inequality
    if (a + b <= c || a + c <= b || b + c <= a) {
      return { rows: [{ key: "area", label: "Area", value: "—", hint: "These lengths do not form a triangle." }] };
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    const perimeter = a + b + c;
    // Angle opposite side a (law of cosines)
    const cosA = (b * b + c * c - a * a) / (2 * b * c);
    const angleA = Math.acos(cosA) * 180 / Math.PI;
    return {
      rows: [
        { key: "area", label: "Area", value: fmt(area, 4), emphasis: "primary" },
        { key: "perimeter", label: "Perimeter", value: fmt(perimeter, 4) },
        { key: "semiperimeter", label: "Semi-perimeter (s)", value: fmt(s, 4) },
      ],
      sections: [{
        title: "Angles (law of cosines)",
        rows: [
          { key: "angle_a", label: "Angle opposite a", value: `${fmt(angleA, 2)}°` },
        ],
      }],
      summary: "Heron's formula: area = √(s(s−a)(s−b)(s−c)) where s = (a+b+c)/2.",
    };
  },
  tests: [
    { name: "3-4-5 right triangle", inputs: { a: 3, b: 4, c: 5 }, expected: { area: "6" } },
    { name: "equilateral side 2", inputs: { a: 2, b: 2, c: 2 }, expected: { area: "1.7321" } },
  ],
};

/* Circle area & circumference */
export const circleArea: CalculatorDefinition = {
  slug: "circle-area",
  name: "Circle Area & Circumference",
  description: "Area, circumference and diameter of a circle from any single measurement.",
  category: "geometry",
  keywords: ["circle", "disk", "radius", "diameter", "pi", "circumference"],
  status: "live",
  part: 1,
  inputs: [
    { name: "input_type", label: "Given", type: "select", default: "radius",
      options: [{ label: "Radius", value: "radius" }, { label: "Diameter", value: "diameter" }, { label: "Circumference", value: "circumference" }] },
    { name: "value", label: "Value", type: "number", default: 5, min: 0, step: "any" },
  ],
  related: ["triangle-area-heron", "sphere-volume"],
  calculate: (raw) => {
    const t = String(raw.input_type ?? "radius");
    const v = toNum(raw.value);
    if (v <= 0) return { rows: [{ key: "area", label: "Area", value: "—" }] };
    let r: number;
    if (t === "diameter") r = v / 2;
    else if (t === "circumference") r = v / (2 * Math.PI);
    else r = v;
    const area = Math.PI * r * r;
    const circ = 2 * Math.PI * r;
    const dia = 2 * r;
    return {
      rows: [
        { key: "area", label: "Area", value: fmt(area, 4), emphasis: "primary" },
        { key: "circumference", label: "Circumference", value: fmt(circ, 4) },
        { key: "radius", label: "Radius", value: fmt(r, 4) },
        { key: "diameter", label: "Diameter", value: fmt(dia, 4) },
      ],
    };
  },
  tests: [
    { name: "radius 5", inputs: { input_type: "radius", value: 5 }, expected: { area: "78.5398" } },
    { name: "diameter 10", inputs: { input_type: "diameter", value: 10 }, expected: { area: "78.5398" } },
  ],
};
