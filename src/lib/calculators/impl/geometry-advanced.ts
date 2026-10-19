/**
 * Advanced Geometry — additional calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ------------------- Sector area (circular sector) ----------------- */
export const circularSector: CalculatorDefinition = {
  slug: "circular-sector",
  name: "Circular Sector Area & Arc Length",
  description: "Compute area and arc length of a pie-slice sector of a circle.",
  category: "geometry",
  keywords: ["sector", "arc", "circle", "pie", "wedge"],
  status: "live",
  part: 5,
  inputs: [
    { name: "r", label: "Radius (r)", type: "number", default: 5, min: 0, step: "any", unit: "" },
    { name: "angle", label: "Central angle", type: "number", default: 60, min: 0, max: 360, step: "any", unit: "°" },
  ],
  related: ["circle-area", "regular-polygon", "triangle-area-heron"],
  calculate: (raw) => {
    const r = toNum(raw.r);
    const angle = toNum(raw.angle);
    if (r <= 0) {
      return { rows: [{ key: "area", label: "Sector area", value: "—" }] };
    }
    const rad = (angle * Math.PI) / 180;
    const area = 0.5 * r * r * rad;
    const arc = r * rad;
    const chord = 2 * r * Math.sin(rad / 2);
    return {
      rows: [
        { key: "area", label: "Sector area", value: fmt(area, 4), emphasis: "primary" },
        { key: "arc", label: "Arc length", value: fmt(arc, 4), emphasis: "primary" },
        { key: "chord", label: "Chord length", value: fmt(chord, 4) },
      ],
      summary: "Area = ½·r²·θ (radians). Arc = r·θ. Chord = 2r·sin(θ/2).",
    };
  },
  tests: [
    { name: "Quarter circle (r=5, 90°)", inputs: { r: 5, angle: 90 }, expected: { area: "19.635" } },
    { name: "Full circle (r=5, 360°)", inputs: { r: 5, angle: 360 }, expected: { area: "78.5398" } },
  ],
};

/* ------------------- Ellipse area & perimeter ---------------------- */
export const ellipseArea: CalculatorDefinition = {
  slug: "ellipse-area",
  name: "Ellipse Area & Perimeter (Ramanujan)",
  description: "Area and approximate perimeter of an ellipse from semi-major and semi-minor axes.",
  category: "geometry",
  keywords: ["ellipse", "oval", "area", "perimeter", "ramanujan"],
  status: "live",
  part: 5,
  inputs: [
    { name: "a", label: "Semi-major axis (a)", type: "number", default: 5, min: 0, step: "any" },
    { name: "b", label: "Semi-minor axis (b)", type: "number", default: 3, min: 0, step: "any" },
  ],
  related: ["circle-area", "circular-sector", "regular-polygon"],
  calculate: (raw) => {
    let a = toNum(raw.a);
    let b = toNum(raw.b);
    if (a < b) [a, b] = [b, a]; // ensure a is semi-major
    if (a <= 0 || b <= 0) {
      return { rows: [{ key: "area", label: "Area", value: "—" }] };
    }
    const area = Math.PI * a * b;
    // Ramanujan's first approximation: P ≈ π[3(a+b) − √((3a+b)(a+3b))]
    const perimeter = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
    const eccentricity = a > 0 ? Math.sqrt(1 - (b * b) / (a * a)) : 0;
    return {
      rows: [
        { key: "area", label: "Area (π·a·b)", value: fmt(area, 4), emphasis: "primary" },
        { key: "perimeter", label: "Perimeter (Ramanujan approx.)", value: fmt(perimeter, 4), emphasis: "primary" },
        { key: "eccentricity", label: "Eccentricity (e)", value: fmt(eccentricity, 4) },
      ],
      summary: "Area = π·a·b. Exact perimeter has no closed form; Ramanujan's approximation is accurate to within 0.01% for typical ellipses. A circle is an ellipse with a = b (eccentricity = 0).",
    };
  },
  tests: [
    { name: "Ellipse a=5, b=3 → area 47.12", inputs: { a: 5, b: 3 }, expected: { area: "47.1239" } },
    { name: "Circle a=b=5 → area 78.54", inputs: { a: 5, b: 5 }, expected: { area: "78.5398" } },
  ],
};

/* ------------------- Spherical cap --------------------------------- */
export const sphericalCap: CalculatorDefinition = {
  slug: "spherical-cap",
  name: "Spherical Cap Volume",
  description: "Volume and surface area of a spherical cap (a slice of a sphere).",
  category: "geometry",
  keywords: ["spherical cap", "dome", "cap", "sphere", "volume"],
  status: "live",
  part: 5,
  inputs: [
    { name: "r", label: "Sphere radius (r)", type: "number", default: 5, min: 0, step: "any" },
    { name: "h", label: "Cap height (h)", type: "number", default: 2, min: 0, step: "any" },
  ],
  related: ["sphere-volume", "cylinder-volume", "ellipse-area"],
  calculate: (raw) => {
    const r = toNum(raw.r);
    const h = toNum(raw.h);
    if (r <= 0 || h <= 0 || h > 2 * r) {
      return { rows: [{ key: "volume", label: "Volume", value: "—" }] };
    }
    // Volume: V = (π h² / 3)(3r − h)
    const volume = (Math.PI * h * h / 3) * (3 * r - h);
    // Curved surface area: A = 2π·r·h
    const curvedArea = 2 * Math.PI * r * h;
    // Base area: π·a² where a² = h(2r − h)
    const baseRadius = Math.sqrt(h * (2 * r - h));
    const baseArea = Math.PI * baseRadius * baseRadius;
    const totalArea = curvedArea + baseArea;
    return {
      rows: [
        { key: "volume", label: "Volume (πh²/3)(3r−h)", value: fmt(volume, 4), emphasis: "primary" },
        { key: "curved_area", label: "Curved surface area", value: fmt(curvedArea, 4), emphasis: "primary" },
        { key: "base_area", label: "Base area (circle)", value: fmt(baseArea, 4) },
        { key: "total_area", label: "Total surface area", value: fmt(totalArea, 4) },
        { key: "base_radius", label: "Base radius", value: fmt(baseRadius, 4) },
      ],
      summary: "Spherical cap = portion of sphere cut off by a plane. Volume = (πh²/3)(3r − h). When h = 2r, the cap is the entire sphere.",
    };
  },
  tests: [
    { name: "Cap height = sphere diameter (full sphere)", inputs: { r: 5, h: 10 }, expected: { volume: "523.5988" } },
    { name: "Half sphere: r=5, h=5", inputs: { r: 5, h: 5 }, expected: { volume: "261.7994" } },
  ],
};

/* ------------------- Tetrahedron / regular polyhedra --------------- */
export const tetrahedron: CalculatorDefinition = {
  slug: "regular-tetrahedron",
  name: "Regular Tetrahedron",
  description: "Volume and surface area of a regular tetrahedron from edge length.",
  category: "geometry",
  keywords: ["tetrahedron", "pyramid", "polyhedron", "platonic", "3d"],
  status: "live",
  part: 5,
  inputs: [
    { name: "a", label: "Edge length (a)", type: "number", default: 4, min: 0, step: "any" },
  ],
  related: ["cube-volume", "sphere-volume", "cone-volume"],
  calculate: (raw) => {
    const a = toNum(raw.a);
    if (a <= 0) {
      return { rows: [{ key: "volume", label: "Volume", value: "—" }] };
    }
    // Volume: V = a³ / (6√2)
    const volume = Math.pow(a, 3) / (6 * Math.sqrt(2));
    // Surface area: A = √3 · a²
    const surface = Math.sqrt(3) * a * a;
    // Height: h = a · √(2/3)
    const height = a * Math.sqrt(2 / 3);
    // Circumradius: R = a · √6 / 4
    const circumR = (a * Math.sqrt(6)) / 4;
    // Inradius: r = a · √6 / 12
    const inR = (a * Math.sqrt(6)) / 12;
    return {
      rows: [
        { key: "volume", label: "Volume (a³/6√2)", value: fmt(volume, 4), emphasis: "primary" },
        { key: "surface", label: "Surface area (√3·a²)", value: fmt(surface, 4), emphasis: "primary" },
        { key: "height", label: "Height (a·√(2/3))", value: fmt(height, 4) },
        { key: "circumR", label: "Circumradius", value: fmt(circumR, 4) },
        { key: "inR", label: "Inradius", value: fmt(inR, 4) },
      ],
      summary: "A regular tetrahedron has 4 equilateral triangular faces. Volume = a³/(6√2). Surface area = √3·a². It is one of the 5 Platonic solids.",
    };
  },
  tests: [
    { name: "Edge 4 → volume 7.5425", inputs: { a: 4 }, expected: { volume: "7.5425" } },
  ],
};

/* ------------------- Compound angle (miter) ------------------------ */
export const miterAngle: CalculatorDefinition = {
  slug: "miter-angle",
  name: "Miter & Bevel Angle Calculator",
  description: "Compute miter and bevel angles for compound cuts at any corner angle.",
  category: "geometry",
  keywords: ["miter", "bevel", "compound", "angle", "carpentry", "crown molding"],
  status: "live",
  part: 5,
  inputs: [
    { name: "corner", label: "Corner angle", type: "number", default: 90, min: 1, max: 180, step: "any", unit: "°" },
    { name: "slope", label: "Slope (spring angle of molding)", type: "number", default: 38, min: 0, max: 90, step: "any", unit: "°",
      help: "Common crown molding slopes: 38°, 45°, 52°." },
  ],
  related: ["coordinate-geometry", "trig-evaluator", "roofing-slope"],
  calculate: (raw) => {
    const corner = toNum(raw.corner);
    const slope = toNum(raw.slope);
    if (corner <= 0 || corner > 180 || slope < 0 || slope >= 90) {
      return { rows: [{ key: "miter", label: "Miter angle", value: "—" }] };
    }
    // Compound miter formulas
    // Wall angle (half of corner for symmetric joint)
    const wallAngle = corner / 2;
    const slopeRad = (slope * Math.PI) / 180;
    const wallRad = (wallAngle * Math.PI) / 180;
    // Miter angle: arctan(cos(slope) × tan(wallAngle))
    const miter = Math.atan(Math.cos(slopeRad) * Math.tan(wallRad)) * 180 / Math.PI;
    // Bevel angle: arcsin(sin(slope) × cos(wallAngle))
    const bevel = Math.asin(Math.sin(slopeRad) * Math.cos(wallRad)) * 180 / Math.PI;
    return {
      rows: [
        { key: "miter", label: "Miter angle (saw setting)", value: `${fmt(miter, 2)}°`, emphasis: "primary" },
        { key: "bevel", label: "Bevel angle (tilt)", value: `${fmt(bevel, 2)}°`, emphasis: "primary" },
        { key: "wall_angle", label: "Wall angle (half corner)", value: `${fmt(wallAngle, 2)}°` },
      ],
      summary: "Compound miter: miter = atan(cos(slope) × tan(wall_angle)), bevel = asin(sin(slope) × cos(wall_angle)). Used for crown molding and picture-frame joints where the workpiece is tilted.",
    };
  },
  tests: [
    { name: "90° corner, 38° slope", inputs: { corner: 90, slope: 38 }, expected: { miter: "38.24°" }, tolerance: 0.05 },
  ],
};
