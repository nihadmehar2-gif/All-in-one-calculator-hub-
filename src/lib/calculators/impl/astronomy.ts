/**
 * Astronomy and Space — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* Universal gravitational constant (m³ kg⁻¹ s⁻²) */
const G = 6.67430e-11;
/* Speed of light (m/s) */
const C = 299792458;
/* 1 AU in meters */
const AU = 1.495978707e11;
/* 1 parsec in meters */
const PARSEC = 3.08567758149137e16;
/* 1 light-year in meters */
const LIGHT_YEAR = 9.4607304725808e15;

/* -------------- Orbital period (Kepler's 3rd law) ----------------- */
export const orbitalPeriod: CalculatorDefinition = {
  slug: "orbital-period",
  name: "Orbital Period (Kepler's 3rd Law)",
  description: "Compute orbital period from semi-major axis and central body mass.",
  category: "astronomy",
  keywords: ["orbit", "kepler", "period", "satellite", "planet", "semi-major axis"],
  status: "live",
  part: 5,
  inputs: [
    { name: "a", label: "Semi-major axis (a)", type: "number", default: 1, min: 0.0001, step: "any", unit: "AU" },
    { name: "M", label: "Central body mass (M)", type: "select", default: "sun",
      options: [
        { label: "Sun (1.989×10³⁰ kg)", value: "sun" },
        { label: "Earth (5.972×10²⁴ kg)", value: "earth" },
        { label: "Jupiter (1.898×10²⁷ kg)", value: "jupiter" },
        { label: "Custom (kg)", value: "custom" },
      ] },
    { name: "M_custom", label: "Custom mass (kg)", type: "number", default: 1.989e30, min: 1, step: "any" },
  ],
  related: ["light-time", "stellar-distance"],
  calculate: (raw) => {
    const aAU = toNum(raw.a);
    const a = aAU * AU;
    const MType = String(raw.M ?? "sun");
    const masses: Record<string, number> = {
      sun: 1.98892e30,
      earth: 5.972e24,
      jupiter: 1.898e27,
      custom: toNum(raw.M_custom),
    };
    const M = masses[MType] ?? masses.sun;
    if (a <= 0 || M <= 0) {
      return { rows: [{ key: "period", label: "Orbital period", value: "—" }] };
    }
    // T² = 4π²·a³ / (G·M)  → T = 2π √(a³/GM)
    const T = 2 * Math.PI * Math.sqrt((a * a * a) / (G * M));
    const years = T / (365.25 * 24 * 3600);
    const days = T / (24 * 3600);
    const hours = T / 3600;
    let periodStr: string;
    if (years >= 1) periodStr = `${fmt(years, 4)} years`;
    else if (days >= 1) periodStr = `${fmt(days, 4)} days`;
    else periodStr = `${fmt(hours, 4)} hours`;
    return {
      rows: [
        { key: "period", label: "Orbital period (T)", value: periodStr, emphasis: "primary" },
        { key: "seconds", label: "In seconds", value: fmt(T, 4) },
      ],
      sections: [{
        title: "Inputs",
        rows: [
          { key: "a", label: "Semi-major axis", value: `${fmt(aAU, 4)} AU (${fmt(a, 4)} m)` },
          { key: "M", label: "Central mass", value: `${M.toExponential(4)} kg` },
          { key: "v", label: "Mean orbital velocity", value: `${fmt(2 * Math.PI * a / T, 4)} m/s` },
        ],
      }],
      summary: "Kepler's 3rd law: T = 2π √(a³/GM). Works for any bound orbit. For the Sun, T²(in years) = a³(in AU) when M = M_sun.",
    };
  },
  tests: [
    { name: "Earth orbit: a=1 AU around Sun → 1 year", inputs: { a: 1, M: "sun", M_custom: 1.989e30 }, expected: { period: "365.21 days" }, tolerance: 5 },
    { name: "Geostationary: a≈42164 km around Earth", inputs: { a: 42164000 / AU, M: "earth", M_custom: 5.972e24 }, expected: { period: "23.9347 hours" }, tolerance: 0.1 },
  ],
};

/* ------------------ Light travel time ------------------------------ */
export const lightTime: CalculatorDefinition = {
  slug: "light-time",
  name: "Light Travel Time",
  description: "Time for light to travel a given distance (in AU, light-years, or meters).",
  category: "astronomy",
  keywords: ["light", "light year", "au", "distance", "speed of light", "travel time"],
  status: "live",
  part: 5,
  inputs: [
    { name: "distance", label: "Distance", type: "number", default: 1, min: 0, step: "any" },
    { name: "unit", label: "Distance unit", type: "select", default: "au",
      options: [
        { label: "Astronomical units (AU)", value: "au" },
        { label: "Light-years (ly)", value: "ly" },
        { label: "Parsecs (pc)", value: "pc" },
        { label: "Meters (m)", value: "m" },
        { label: "Kilometers (km)", value: "km" },
      ] },
  ],
  related: ["orbital-period", "stellar-distance"],
  calculate: (raw) => {
    const d = toNum(raw.distance);
    const unit = String(raw.unit ?? "au");
    if (d < 0) {
      return { rows: [{ key: "time", label: "Travel time", value: "—" }] };
    }
    const factors: Record<string, number> = {
      au: AU,
      ly: LIGHT_YEAR,
      pc: PARSEC,
      m: 1,
      km: 1000,
    };
    const meters = d * (factors[unit] ?? 1);
    const seconds = meters / C;
    let timeStr: string;
    if (seconds < 1e-6) timeStr = `${fmt(seconds * 1e9, 4)} ns`;
    else if (seconds < 1e-3) timeStr = `${fmt(seconds * 1e6, 4)} µs`;
    else if (seconds < 1) timeStr = `${fmt(seconds * 1e3, 4)} ms`;
    else if (seconds < 60) timeStr = `${fmt(seconds, 4)} s`;
    else if (seconds < 3600) timeStr = `${fmt(seconds / 60, 4)} min`;
    else if (seconds < 86400) timeStr = `${fmt(seconds / 3600, 4)} h`;
    else if (seconds < 86400 * 365.25) timeStr = `${fmt(seconds / 86400, 4)} days`;
    else timeStr = `${fmt(seconds / (86400 * 365.25), 4)} years`;
    return {
      rows: [
        { key: "time", label: "Light travel time", value: timeStr, emphasis: "primary" },
        { key: "seconds", label: "In seconds", value: fmt(seconds, 4) },
      ],
      sections: [{
        title: "Reference distances",
        rows: [
          { key: "moon", label: "Moon (1.28 ls)", value: "1.28 seconds" },
          { key: "sun", label: "Sun (8.3 light-min)", value: "8.3 minutes" },
          { key: "proxima", label: "Proxima Centauri", value: "4.24 years" },
          { key: "andromeda", label: "Andromeda galaxy", value: "2.5 million years" },
        ],
      }],
      summary: `Time = distance ÷ c (speed of light, ${C.toExponential(4)} m/s). 1 AU ≈ 499 light-seconds (8.3 light-minutes).`,
    };
  },
  tests: [
    { name: "1 AU → 499 s", inputs: { distance: 1, unit: "au" }, expected: { seconds: "499" }, tolerance: 1 },
    { name: "1 light-year → 1 year", inputs: { distance: 1, unit: "ly" }, expected: { seconds: "31,557,600" }, tolerance: 1000 },
  ],
};

/* ----------------- Stellar parallax distance ----------------------- */
export const stellarDistance: CalculatorDefinition = {
  slug: "stellar-distance",
  name: "Stellar Distance (Parallax)",
  description: "Convert a star's parallax angle to its distance in parsecs and light-years.",
  category: "astronomy",
  keywords: ["parallax", "parsecs", "light years", "star", "distance"],
  status: "live",
  part: 5,
  inputs: [
    { name: "parallax_mas", label: "Parallax angle (milliarcseconds)", type: "number", default: 768.07, min: 0.0001, step: "any", unit: "mas",
      help: "Proxima Centauri ≈ 768 mas. Sirius ≈ 379 mas. Typical Gaia stars: <1 mas." },
  ],
  related: ["orbital-period", "light-time"],
  calculate: (raw) => {
    const pMas = toNum(raw.parallax_mas);
    if (pMas <= 0) {
      return { rows: [{ key: "pc", label: "Distance (parsecs)", value: "—" }] };
    }
    const pArcsec = pMas / 1000;
    const pc = 1 / pArcsec;
    const ly = pc * 3.26156;
    const au = pc * 206265;
    return {
      rows: [
        { key: "pc", label: "Distance (parsecs)", value: `${fmt(pc, 6)} pc`, emphasis: "primary" },
        { key: "ly", label: "In light-years", value: `${fmt(ly, 6)} ly`, emphasis: "primary" },
        { key: "au", label: "In AU", value: `${fmt(au, 0)} AU` },
      ],
      sections: [{
        title: "Reference stars",
        rows: [
          { key: "proxima", label: "Proxima Centauri (768 mas)", value: "1.30 pc / 4.24 ly" },
          { key: "sirius", label: "Sirius (379 mas)", value: "2.64 pc / 8.60 ly" },
          { key: "betelgeuse", label: "Betelgeuse (~5 mas)", value: "~200 pc" },
        ],
      }],
      summary: "Distance (pc) = 1 ÷ parallax (arcsec). 1 parsec = distance at which 1 AU subtends 1 arcsecond ≈ 3.26 light-years.",
    };
  },
  tests: [
    { name: "Proxima Centauri: 768 mas → 1.30 pc", inputs: { parallax_mas: 768.07 }, expected: { pc: "1.30194 pc" }, tolerance: 0.001 },
    { name: "1 mas → 1000 pc", inputs: { parallax_mas: 1 }, expected: { pc: "1,000 pc" } },
  ],
};

/* ------------------- Escape velocity -------------------------------- */
export const escapeVelocity: CalculatorDefinition = {
  slug: "escape-velocity",
  name: "Escape Velocity",
  description: "Minimum speed to break free from a body's gravity well, ignoring drag.",
  category: "astronomy",
  keywords: ["escape velocity", "gravity", "orbital", "rocket"],
  status: "live",
  part: 5,
  inputs: [
    { name: "M", label: "Body mass (kg)", type: "number", default: 5.972e24, min: 1, step: "any" },
    { name: "r", label: "Body radius (m)", type: "number", default: 6.371e6, min: 1, step: "any" },
  ],
  related: ["orbital-period", "newtons-second", "density-pressure-buoyancy"],
  calculate: (raw) => {
    const M = toNum(raw.M);
    const r = toNum(raw.r);
    if (M <= 0 || r <= 0) {
      return { rows: [{ key: "v", label: "Escape velocity", value: "—" }] };
    }
    // v = √(2GM/r)
    const v = Math.sqrt((2 * G * M) / r);
    return {
      rows: [
        { key: "v", label: "Escape velocity", value: `${fmt(v, 4)} m/s`, emphasis: "primary" },
        { key: "km_s", label: "In km/s", value: `${fmt(v / 1000, 4)} km/s`, emphasis: "primary" },
        { key: "mph", label: "In mph", value: `${fmt(v * 2.23694, 4)} mph` },
      ],
      sections: [{
        title: "Reference values",
        rows: [
          { key: "earth", label: "Earth", value: "11.19 km/s" },
          { key: "moon", label: "Moon", value: "2.38 km/s" },
          { key: "mars", label: "Mars", value: "5.03 km/s" },
          { key: "jupiter", label: "Jupiter", value: "59.5 km/s" },
          { key: "sun", label: "Sun", value: "617.5 km/s" },
        ],
      }],
      summary: "v = √(2GM/r). Assumes no atmospheric drag. The default values are Earth's mass (5.972×10²⁴ kg) and radius (6,371 km).",
    };
  },
  tests: [
    { name: "Earth escape velocity ≈ 11.19 km/s", inputs: { M: 5.972e24, r: 6.371e6 }, expected: { km_s: "11.186 km/s" }, tolerance: 0.01 },
  ],
};

/* ------------------- Apparent / absolute magnitude ----------------- */
export const stellarMagnitude: CalculatorDefinition = {
  slug: "stellar-magnitude",
  name: "Stellar Magnitude (Apparent ↔ Absolute)",
  description: "Convert between apparent and absolute magnitude given the star's distance.",
  category: "astronomy",
  keywords: ["magnitude", "apparent", "absolute", "star", "brightness", "luminosity"],
  status: "live",
  part: 5,
  inputs: [
    { name: "mode", label: "Mode", type: "select", default: "to_absolute",
      options: [
        { label: "Apparent → Absolute (need distance)", value: "to_absolute" },
        { label: "Absolute → Apparent (need distance)", value: "to_apparent" },
      ] },
    { name: "m", label: "Apparent magnitude (m)", type: "number", default: -1.46, step: "any",
      help: "Sirius m = −1.46. Sun m = −26.74. Naked eye limit ≈ +6." },
    { name: "M_abs", label: "Absolute magnitude (M)", type: "number", default: 4.83, step: "any",
      help: "Sun M = 4.83. Sirius M = 1.42." },
    { name: "distance_pc", label: "Distance (parsecs)", type: "number", default: 2.64, min: 0.001, step: "any" },
  ],
  related: ["stellar-distance", "light-time", "orbital-period"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "to_absolute");
    const d = toNum(raw.distance_pc);
    if (d <= 0) {
      return { rows: [{ key: "result", label: "Result", value: "—" }] };
    }
    let result: number;
    let label: string;
    let formula: string;
    if (mode === "to_absolute") {
      const m = toNum(raw.m);
      // M = m − 5 log10(d) + 5
      result = m - 5 * Math.log10(d) + 5;
      label = "Absolute magnitude (M)";
      formula = `M = m − 5·log₁₀(d) + 5 = ${m} − 5·log₁₀(${fmt(d, 4)}) + 5`;
    } else {
      const M = toNum(raw.M_abs);
      // m = M + 5 log10(d) − 5
      result = M + 5 * Math.log10(d) - 5;
      label = "Apparent magnitude (m)";
      formula = `m = M + 5·log₁₀(d) − 5 = ${M} + 5·log₁₀(${fmt(d, 4)}) − 5`;
    }
    return {
      rows: [
        { key: "result", label, value: fmt(result, 4), emphasis: "primary" },
        { key: "formula", label: "Formula", value: formula },
      ],
      sections: [{
        title: "Reference",
        rows: [
          { key: "sun_app", label: "Sun (apparent)", value: "−26.74" },
          { key: "sun_abs", label: "Sun (absolute)", value: "+4.83" },
          { key: "sirius_app", label: "Sirius (apparent)", value: "−1.46" },
          { key: "sirius_abs", label: "Sirius (absolute)", value: "+1.42" },
        ],
      }],
      summary: "Magnitude scale is logarithmic and inverted: lower numbers are brighter. Apparent m is what we see; absolute M is what the star would look like at 10 pc.",
    };
  },
  tests: [
    { name: "Sirius: m=−1.46, d=2.64pc → M=1.42", inputs: { mode: "to_absolute", m: -1.46, M_abs: 4.83, distance_pc: 2.64 }, expected: { result: "1.4247" }, tolerance: 0.05 },
  ],
};
