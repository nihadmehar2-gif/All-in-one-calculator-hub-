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

/* ------------------ Right triangle / Pythagoras ------------------- */
export const rightTriangle: CalculatorDefinition = {
  slug: "right-triangle",
  name: "Right Triangle Solver",
  description: "Solve any right triangle: given two sides (or one side + one angle), find the rest.",
  category: "geometry",
  keywords: ["right angle", "pythagoras", "hypotenuse", "triangle", "trig", "90 degrees"],
  status: "live",
  part: 2,
  inputs: [
    { name: "a", label: "Side a (leg)", type: "number", default: 3, step: "any", help: "Leave 0 if unknown." },
    { name: "b", label: "Side b (leg)", type: "number", default: 4, step: "any", help: "Leave 0 if unknown." },
    { name: "c", label: "Side c (hypotenuse)", type: "number", default: 0, step: "any", help: "Leave 0 if unknown." },
  ],
  related: ["triangle-area-heron", "pythagorean-theorem", "trig-evaluator"],
  calculate: (raw) => {
    let a = toNum(raw.a);
    let b = toNum(raw.b);
    let c = toNum(raw.c);
    // Treat 0 as "unknown"
    const known: ("a" | "b" | "c")[] = [];
    if (a > 0) known.push("a");
    if (b > 0) known.push("b");
    if (c > 0) known.push("c");
    if (known.length < 2) {
      return { rows: [{ key: "result", label: "Need more info", value: "—", hint: "Provide at least two of a, b, c.", emphasis: "warning" }] };
    }
    // Solve for the missing side via Pythagoras
    if (a === 0) {
      if (c <= b) return { rows: [{ key: "result", label: "Invalid", value: "—", hint: "Hypotenuse must be the longest side.", emphasis: "warning" }] };
      a = Math.sqrt(c * c - b * b);
    } else if (b === 0) {
      if (c <= a) return { rows: [{ key: "result", label: "Invalid", value: "—", hint: "Hypotenuse must be the longest side.", emphasis: "warning" }] };
      b = Math.sqrt(c * c - a * a);
    } else if (c === 0) {
      c = Math.sqrt(a * a + b * b);
    }
    const A = Math.atan2(a, b) * 180 / Math.PI; // angle opposite side a
    const B = 90 - A;
    const area = (a * b) / 2;
    const perimeter = a + b + c;
    return {
      rows: [
        { key: "a", label: "Side a", value: fmt(a, 4) },
        { key: "b", label: "Side b", value: fmt(b, 4) },
        { key: "c", label: "Hypotenuse c", value: fmt(c, 4), emphasis: "primary" },
      ],
      sections: [
        { title: "Angles", rows: [
          { key: "angle_a", label: "Angle opposite a", value: `${fmt(A, 2)}°` },
          { key: "angle_b", label: "Angle opposite b", value: `${fmt(B, 2)}°` },
          { key: "angle_c", label: "Right angle", value: "90°" },
        ] },
        { title: "Properties", rows: [
          { key: "area", label: "Area", value: fmt(area, 4) },
          { key: "perimeter", label: "Perimeter", value: fmt(perimeter, 4) },
        ] },
      ],
      summary: "Pythagoras: a² + b² = c². Angles come from arctan(a/b) and arctan(b/a).",
    };
  },
  tests: [
    { name: "3-4-5 right triangle", inputs: { a: 3, b: 4, c: 0 }, expected: { c: "5" } },
    { name: "5-12-13 right triangle", inputs: { a: 5, b: 12, c: 0 }, expected: { c: "13" } },
    { name: "given hypotenuse and one leg", inputs: { a: 0, b: 4, c: 5 }, expected: { a: "3" } },
  ],
};

/* ------------- Pythagorean theorem (standalone) ------------------- */
export const pythagoreanTheorem: CalculatorDefinition = {
  slug: "pythagorean-theorem",
  name: "Pythagorean Theorem",
  description: "Verify a² + b² = c² and compute the missing side.",
  category: "geometry",
  keywords: ["pythagoras", "hypotenuse", "right triangle", "a²+b²=c²"],
  status: "live",
  part: 2,
  inputs: [
    { name: "solve_for", label: "Solve for", type: "select", default: "c",
      options: [
        { label: "c (hypotenuse)", value: "c" },
        { label: "a (leg)", value: "a" },
        { label: "b (leg)", value: "b" },
      ] },
    { name: "a", label: "Side a", type: "number", default: 3, step: "any" },
    { name: "b", label: "Side b", type: "number", default: 4, step: "any" },
    { name: "c", label: "Hypotenuse c", type: "number", default: 5, step: "any" },
  ],
  related: ["right-triangle", "triangle-area-heron"],
  calculate: (raw) => {
    const solve = String(raw.solve_for ?? "c");
    const a = toNum(raw.a);
    const b = toNum(raw.b);
    const c = toNum(raw.c);
    let result = 0;
    let formula = "";
    if (solve === "c") {
      if (a <= 0 || b <= 0) return { rows: [{ key: "result", label: "c", value: "—", hint: "a and b must be positive." }] };
      result = Math.sqrt(a * a + b * b);
      formula = `c = √(a² + b²) = √(${fmt(a, 4)}² + ${fmt(b, 4)}²)`;
    } else if (solve === "a") {
      if (b <= 0 || c <= 0 || c <= b) return { rows: [{ key: "result", label: "a", value: "—", hint: "c must be greater than b.", emphasis: "warning" }] };
      result = Math.sqrt(c * c - b * b);
      formula = `a = √(c² − b²) = √(${fmt(c, 4)}² − ${fmt(b, 4)}²)`;
    } else {
      if (a <= 0 || c <= 0 || c <= a) return { rows: [{ key: "result", label: "b", value: "—", hint: "c must be greater than a.", emphasis: "warning" }] };
      result = Math.sqrt(c * c - a * a);
      formula = `b = √(c² − a²) = √(${fmt(c, 4)}² − ${fmt(a, 4)}²)`;
    }
    return {
      rows: [
        { key: "result", label: `Solved ${solve}`, value: fmt(result, 6), emphasis: "primary" },
        { key: "formula", label: "Formula", value: formula },
      ],
      summary: "Pythagorean theorem: in a right triangle, the square of the hypotenuse equals the sum of the squares of the legs.",
    };
  },
  tests: [
    { name: "a=3, b=4 → c=5", inputs: { solve_for: "c", a: 3, b: 4, c: 0 }, expected: { result: "5" } },
    { name: "b=4, c=5 → a=3", inputs: { solve_for: "a", a: 0, b: 4, c: 5 }, expected: { result: "3" } },
  ],
};

/* ------------------ Sphere volume & surface ----------------------- */
export const sphereVolume: CalculatorDefinition = {
  slug: "sphere-volume",
  name: "Sphere Volume & Surface Area",
  description: "Volume and surface area of a sphere from its radius.",
  category: "geometry",
  keywords: ["sphere", "ball", "volume", "surface area", "3d"],
  status: "live",
  part: 2,
  inputs: [
    { name: "r", label: "Radius (r)", type: "number", default: 5, min: 0, step: "any" },
  ],
  related: ["circle-area", "cylinder-volume", "cone-volume"],
  calculate: (raw) => {
    const r = toNum(raw.r);
    if (r <= 0) return { rows: [{ key: "volume", label: "Volume", value: "—", hint: "Radius must be positive." }] };
    const volume = (4 / 3) * Math.PI * r * r * r;
    const surface = 4 * Math.PI * r * r;
    const circumference = 2 * Math.PI * r;
    return {
      rows: [
        { key: "volume", label: "Volume (4/3)πr³", value: fmt(volume, 4), emphasis: "primary" },
        { key: "surface", label: "Surface area 4πr²", value: fmt(surface, 4), emphasis: "primary" },
      ],
      sections: [{
        title: "Cross-section",
        rows: [
          { key: "great_circle_area", label: "Great-circle area (πr²)", value: fmt(Math.PI * r * r, 4) },
          { key: "circumference", label: "Great-circle circumference (2πr)", value: fmt(circumference, 4) },
        ],
      }],
      summary: "Volume of a sphere: V = (4/3)πr³. Surface area: A = 4πr² — note the surface is exactly 4× the great-circle area.",
    };
  },
  tests: [
    { name: "r=1 → V=4.1888", inputs: { r: 1 }, expected: { volume: "4.1888" } },
    { name: "r=1 → A=12.5664", inputs: { r: 1 }, expected: { surface: "12.5664" } },
  ],
};

/* --------------- Cylinder volume & surface ------------------------ */
export const cylinderVolume: CalculatorDefinition = {
  slug: "cylinder-volume",
  name: "Cylinder Volume & Surface Area",
  description: "Volume, lateral and total surface area of a right circular cylinder.",
  category: "geometry",
  keywords: ["cylinder", "can", "volume", "surface", "3d", "tube"],
  status: "live",
  part: 2,
  inputs: [
    { name: "r", label: "Radius (r)", type: "number", default: 3, min: 0, step: "any" },
    { name: "h", label: "Height (h)", type: "number", default: 10, min: 0, step: "any" },
  ],
  related: ["sphere-volume", "cone-volume", "circle-area"],
  calculate: (raw) => {
    const r = toNum(raw.r);
    const h = toNum(raw.h);
    if (r <= 0 || h <= 0) return { rows: [{ key: "volume", label: "Volume", value: "—", hint: "Radius and height must be positive." }] };
    const volume = Math.PI * r * r * h;
    const lateral = 2 * Math.PI * r * h;
    const total = 2 * Math.PI * r * (r + h);
    return {
      rows: [
        { key: "volume", label: "Volume πr²h", value: fmt(volume, 4), emphasis: "primary" },
        { key: "lateral", label: "Lateral surface 2πrh", value: fmt(lateral, 4) },
        { key: "total", label: "Total surface 2πr(r+h)", value: fmt(total, 4), emphasis: "primary" },
      ],
      summary: "Cylinder volume = πr²h. Total surface = 2πr² (top+bottom) + 2πrh (side).",
    };
  },
  tests: [
    { name: "r=3, h=10 → V=282.7433", inputs: { r: 3, h: 10 }, expected: { volume: "282.7433" } },
  ],
};

/* ------------------ Cone volume & surface ------------------------- */
export const coneVolume: CalculatorDefinition = {
  slug: "cone-volume",
  name: "Cone Volume & Surface Area",
  description: "Volume, slant height and surface area of a right circular cone.",
  category: "geometry",
  keywords: ["cone", "ice cream", "volume", "surface", "slant", "3d"],
  status: "live",
  part: 2,
  inputs: [
    { name: "r", label: "Radius (r)", type: "number", default: 3, min: 0, step: "any" },
    { name: "h", label: "Height (h)", type: "number", default: 4, min: 0, step: "any" },
  ],
  related: ["cylinder-volume", "sphere-volume", "circle-area"],
  calculate: (raw) => {
    const r = toNum(raw.r);
    const h = toNum(raw.h);
    if (r <= 0 || h <= 0) return { rows: [{ key: "volume", label: "Volume", value: "—", hint: "Radius and height must be positive." }] };
    const slant = Math.sqrt(r * r + h * h);
    const volume = (1 / 3) * Math.PI * r * r * h;
    const lateral = Math.PI * r * slant;
    const total = Math.PI * r * (r + slant);
    return {
      rows: [
        { key: "volume", label: "Volume (1/3)πr²h", value: fmt(volume, 4), emphasis: "primary" },
        { key: "slant", label: "Slant height l = √(r²+h²)", value: fmt(slant, 4) },
        { key: "lateral", label: "Lateral surface πrl", value: fmt(lateral, 4) },
        { key: "total", label: "Total surface πr(r+l)", value: fmt(total, 4), emphasis: "primary" },
      ],
      summary: "A cone has 1/3 the volume of its bounding cylinder. Slant height l = √(r² + h²).",
    };
  },
  tests: [
    { name: "r=3, h=4 → V=37.6991", inputs: { r: 3, h: 4 }, expected: { volume: "37.6991" } },
    { name: "r=3, h=4 → slant=5", inputs: { r: 3, h: 4 }, expected: { slant: "5" } },
  ],
};

/* ------------------ Cube volume & surface ------------------------- */
export const cubeVolume: CalculatorDefinition = {
  slug: "cube-volume",
  name: "Cube & Cuboid Calculator",
  description: "Volume, surface area and space diagonal of a cube or rectangular cuboid.",
  category: "geometry",
  keywords: ["cube", "cuboid", "box", "rectangular prism", "volume", "surface", "diagonal"],
  status: "live",
  part: 2,
  inputs: [
    { name: "l", label: "Length (l)", type: "number", default: 4, min: 0, step: "any" },
    { name: "w", label: "Width (w)", type: "number", default: 3, min: 0, step: "any" },
    { name: "h", label: "Height (h)", type: "number", default: 2, min: 0, step: "any" },
  ],
  related: ["cylinder-volume", "sphere-volume"],
  calculate: (raw) => {
    const l = toNum(raw.l);
    const w = toNum(raw.w);
    const h = toNum(raw.h);
    if (l <= 0 || w <= 0 || h <= 0) return { rows: [{ key: "volume", label: "Volume", value: "—", hint: "All sides must be positive." }] };
    const volume = l * w * h;
    const surface = 2 * (l * w + l * h + w * h);
    const diagonal = Math.sqrt(l * l + w * w + h * h);
    const isCube = l === w && w === h;
    return {
      rows: [
        { key: "volume", label: "Volume l·w·h", value: fmt(volume, 4), emphasis: "primary" },
        { key: "surface", label: "Surface 2(lw+lh+wh)", value: fmt(surface, 4), emphasis: "primary" },
        { key: "diagonal", label: "Space diagonal √(l²+w²+h²)", value: fmt(diagonal, 4) },
      ],
      summary: isCube ? "All sides equal — this is a cube (V = s³, A = 6s²)." : "Cuboid (rectangular prism). Surface = sum of all 6 face areas.",
    };
  },
  tests: [
    { name: "4×3×2 → V=24", inputs: { l: 4, w: 3, h: 2 }, expected: { volume: "24" } },
    { name: "4×3×2 → A=52", inputs: { l: 4, w: 3, h: 2 }, expected: { surface: "52" } },
    { name: "5×5×5 cube → diagonal = 5√3 ≈ 8.6603", inputs: { l: 5, w: 5, h: 5 }, expected: { diagonal: "8.6603" } },
  ],
};

/* ---------------- Regular polygon area ---------------------------- */
export const regularPolygon: CalculatorDefinition = {
  slug: "regular-polygon",
  name: "Regular Polygon Calculator",
  description: "Area, perimeter, interior angles and apothem of a regular n-sided polygon.",
  category: "geometry",
  keywords: ["polygon", "regular", "hexagon", "pentagon", "octagon", "apothem", "interior angle"],
  status: "live",
  part: 2,
  inputs: [
    { name: "n", label: "Number of sides (n)", type: "number", default: 6, min: 3, max: 1000, step: 1 },
    { name: "s", label: "Side length (s)", type: "number", default: 5, min: 0, step: "any" },
  ],
  related: ["circle-area", "triangle-area-heron"],
  calculate: (raw) => {
    const n = Math.max(3, Math.round(toNum(raw.n)));
    const s = toNum(raw.s);
    if (s <= 0) return { rows: [{ key: "area", label: "Area", value: "—" }] };
    const apothem = s / (2 * Math.tan(Math.PI / n));
    const perimeter = n * s;
    const area = (perimeter * apothem) / 2;
    const interiorAngle = ((n - 2) * 180) / n;
    const exteriorAngle = 360 / n;
    return {
      rows: [
        { key: "area", label: "Area", value: fmt(area, 4), emphasis: "primary" },
        { key: "perimeter", label: "Perimeter", value: fmt(perimeter, 4) },
        { key: "apothem", label: "Apothem (inradius)", value: fmt(apothem, 4) },
      ],
      sections: [{
        title: "Angles",
        rows: [
          { key: "interior", label: "Interior angle", value: `${fmt(interiorAngle, 2)}°` },
          { key: "exterior", label: "Exterior angle", value: `${fmt(exteriorAngle, 2)}°` },
          { key: "sum_interior", label: "Sum of interior angles", value: `${fmt((n - 2) * 180, 0)}°` },
        ],
      }],
      summary: "Area = (1/2)·n·s·apothem, where apothem = s / (2·tan(π/n)). Sum of interior angles = (n−2)·180°.",
    };
  },
  tests: [
    { name: "hexagon side 5 → area 64.9519", inputs: { n: 6, s: 5 }, expected: { area: "64.9519" } },
    { name: "square side 4 → area 16", inputs: { n: 4, s: 4 }, expected: { area: "16" } },
    { name: "equilateral triangle side 2 → area 1.7321", inputs: { n: 3, s: 2 }, expected: { area: "1.7321" } },
  ],
};

/* ---------------- Coordinate geometry ----------------------------- */
export const coordinateGeometry: CalculatorDefinition = {
  slug: "coordinate-geometry",
  name: "Coordinate Geometry (Distance & Midpoint)",
  description: "Distance, midpoint and slope between two points (x₁,y₁) and (x₂,y₂).",
  category: "geometry",
  keywords: ["distance", "midpoint", "slope", "cartesian", "two points", "coordinate"],
  status: "live",
  part: 2,
  inputs: [
    { name: "x1", label: "x₁", type: "number", default: 1, step: "any" },
    { name: "y1", label: "y₁", type: "number", default: 2, step: "any" },
    { name: "x2", label: "x₂", type: "number", default: 4, step: "any" },
    { name: "y2", label: "y₂", type: "number", default: 6, step: "any" },
  ],
  related: ["right-triangle", "pythagorean-theorem"],
  calculate: (raw) => {
    const x1 = toNum(raw.x1), y1 = toNum(raw.y1);
    const x2 = toNum(raw.x2), y2 = toNum(raw.y2);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const slope = dx === 0 ? NaN : dy / dx;
    return {
      rows: [
        { key: "distance", label: "Distance √((x₂−x₁)²+(y₂−y₁)²)", value: fmt(distance, 6), emphasis: "primary" },
        { key: "midpoint", label: "Midpoint", value: `(${fmt(midX, 4)}, ${fmt(midY, 4)})`, emphasis: "primary" },
        { key: "slope", label: "Slope (y₂−y₁)/(x₂−x₁)", value: Number.isFinite(slope) ? fmt(slope, 6) : "undefined (vertical line)", hint: dx === 0 ? "x₂ = x₁, line is vertical." : undefined },
      ],
      sections: [{
        title: "Equation of the line",
        rows: [
          { key: "eq", label: "Slope-intercept form", value: Number.isFinite(slope) ? `y = ${fmt(slope, 4)}x + ${fmt(y1 - slope * x1, 4)}` : `x = ${fmt(x1, 4)}` },
        ],
      }],
      summary: "Distance formula from Pythagoras: d = √(Δx² + Δy²). Slope = Δy/Δx; vertical lines have undefined slope.",
    };
  },
  tests: [
    { name: "(1,2)-(4,6) → distance 5", inputs: { x1: 1, y1: 2, x2: 4, y2: 6 }, expected: { distance: "5" } },
    { name: "(1,2)-(4,6) → midpoint (2.5, 4)", inputs: { x1: 1, y1: 2, x2: 4, y2: 6 }, expected: { midpoint: "(2.5, 4)" } },
    { name: "vertical line slope", inputs: { x1: 3, y1: 0, x2: 3, y2: 5 }, expected: { slope: "undefined (vertical line)" } },
  ],
};

/* ------------------- Trig evaluator ------------------------------- */
export const trigEvaluator: CalculatorDefinition = {
  slug: "trig-evaluator",
  name: "Trigonometric Evaluator",
  description: "Evaluate sin, cos, tan and their inverses in degrees or radians.",
  category: "geometry",
  keywords: ["sin", "cos", "tan", "arcsin", "arccos", "arctan", "degrees", "radians"],
  status: "live",
  part: 2,
  inputs: [
    { name: "fn", label: "Function", type: "select", default: "sin",
      options: [
        { label: "sin(x)", value: "sin" },
        { label: "cos(x)", value: "cos" },
        { label: "tan(x)", value: "tan" },
        { label: "asin(x)", value: "asin" },
        { label: "acos(x)", value: "acos" },
        { label: "atan(x)", value: "atan" },
      ] },
    { name: "x", label: "Input value (x)", type: "number", default: 30, step: "any" },
    { name: "angle", label: "Input unit (for sin/cos/tan)", type: "select", default: "deg",
      options: [{ label: "Degrees", value: "deg" }, { label: "Radians", value: "rad" }] },
  ],
  related: ["right-triangle", "scientific-calculator"],
  calculate: (raw) => {
    const fn = String(raw.fn ?? "sin");
    const x = toNum(raw.x);
    const angle = String(raw.angle ?? "deg");
    const toRad = (v: number) => (angle === "deg" ? (v * Math.PI) / 180 : v);
    const fromRad = (v: number) => (angle === "deg" ? (v * 180) / Math.PI : v);
    let result: number;
    let formula = "";
    switch (fn) {
      case "sin": result = Math.sin(toRad(x)); formula = `sin(${fmt(x, 4)}${angle === "deg" ? "°" : " rad"})`; break;
      case "cos": result = Math.cos(toRad(x)); formula = `cos(${fmt(x, 4)}${angle === "deg" ? "°" : " rad"})`; break;
      case "tan": result = Math.tan(toRad(x)); formula = `tan(${fmt(x, 4)}${angle === "deg" ? "°" : " rad"})`; break;
      case "asin":
        if (x < -1 || x > 1) return { rows: [{ key: "result", label: "asin", value: "—", hint: "Domain of asin is [−1, 1].", emphasis: "warning" }] };
        result = fromRad(Math.asin(x)); formula = `asin(${fmt(x, 4)})`; break;
      case "acos":
        if (x < -1 || x > 1) return { rows: [{ key: "result", label: "acos", value: "—", hint: "Domain of acos is [−1, 1].", emphasis: "warning" }] };
        result = fromRad(Math.acos(x)); formula = `acos(${fmt(x, 4)})`; break;
      case "atan": result = fromRad(Math.atan(x)); formula = `atan(${fmt(x, 4)})`; break;
      default: result = NaN;
    }
    return {
      rows: [
        { key: "result", label: formula, value: fmt(result, 6), emphasis: "primary" },
        { key: "unit", label: "Output unit (for inverse trig)", value: angle === "deg" ? "degrees" : "radians", hint: fn.startsWith("a") ? undefined : "Inverse functions output angles." },
      ],
      sections: [{
        title: "Reference values (degrees)",
        rows: [
          { key: "ref1", label: "sin(30°) = 0.5", value: "0.5" },
          { key: "ref2", label: "cos(60°) = 0.5", value: "0.5" },
          { key: "ref3", label: "tan(45°) = 1", value: "1" },
        ],
      }],
      summary: "Inverse trig (asin/acos/atan) take a ratio in [−1, 1] (or any real for atan) and return an angle.",
    };
  },
  tests: [
    { name: "sin(30°) = 0.5", inputs: { fn: "sin", x: 30, angle: "deg" }, expected: { result: "0.5" } },
    { name: "cos(0) = 1", inputs: { fn: "cos", x: 0, angle: "deg" }, expected: { result: "1" } },
    { name: "tan(45°) = 1", inputs: { fn: "tan", x: 45, angle: "deg" }, expected: { result: "1" } },
    { name: "asin(0.5) = 30°", inputs: { fn: "asin", x: 0.5, angle: "deg" }, expected: { result: "30" } },
  ],
};
