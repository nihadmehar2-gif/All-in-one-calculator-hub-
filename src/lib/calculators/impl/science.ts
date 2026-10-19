/**
 * Science and Physics — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* Ohm's Law */
export const ohmsLaw: CalculatorDefinition = {
  slug: "ohms-law",
  name: "Ohm's Law Calculator",
  description: "Solve for voltage, current, resistance or power given any two values.",
  category: "science",
  keywords: ["voltage", "current", "resistance", "power", "V=IR", "watt", "volt", "amp"],
  status: "live",
  part: 1,
  inputs: [
    { name: "voltage", label: "Voltage (V)", type: "number", default: 12, step: "any", unit: "V", help: "Leave blank to solve." },
    { name: "current", label: "Current (I)", type: "number", default: 2, step: "any", unit: "A", help: "Leave blank to solve." },
    { name: "resistance", label: "Resistance (R)", type: "number", default: "" as unknown as number, step: "any", unit: "Ω", help: "Leave blank to solve." },
  ],
  related: ["power-calculator", "resistor-color-code"],
  calculate: (raw) => {
    const hasV = raw.voltage !== "" && raw.voltage !== undefined && raw.voltage !== null;
    const hasI = raw.current !== "" && raw.current !== undefined && raw.current !== null;
    const hasR = raw.resistance !== "" && raw.resistance !== undefined && raw.resistance !== null;
    const V = hasV ? toNum(raw.voltage) : NaN;
    const I = hasI ? toNum(raw.current) : NaN;
    const R = hasR ? toNum(raw.resistance) : NaN;
    let v = V, i = I, r = R;
    if (Number.isFinite(v) && Number.isFinite(i) && !Number.isFinite(r)) r = v / i;
    else if (Number.isFinite(v) && Number.isFinite(r) && !Number.isFinite(i)) i = v / r;
    else if (Number.isFinite(i) && Number.isFinite(r) && !Number.isFinite(v)) v = i * r;
    if (!Number.isFinite(v) || !Number.isFinite(i) || !Number.isFinite(r) || i === 0 || r === 0) {
      return { rows: [{ key: "power", label: "Power", value: "—", hint: "Provide any two of V, I, R." }] };
    }
    const power = v * i;
    return {
      rows: [
        { key: "voltage", label: "Voltage (V)", value: `${fmt(v, 4)} V` },
        { key: "current", label: "Current (I)", value: `${fmt(i, 4)} A` },
        { key: "resistance", label: "Resistance (R)", value: `${fmt(r, 4)} Ω` },
        { key: "power", label: "Power (P = V × I)", value: `${fmt(power, 4)} W`, emphasis: "primary" },
      ],
      summary: "Ohm's Law: V = I·R. Power P = V·I = I²R = V²/R.",
    };
  },
  tests: [
    { name: "12V, 2A → solve R", inputs: { voltage: 12, current: 2, resistance: "" }, expected: { power: "24 W" } },
    { name: "5V, 10Ω → solve I", inputs: { voltage: 5, current: "", resistance: 10 }, expected: { power: "2.5 W" } },
  ],
};

/* ---------------- Kinematics (SUVAT) ------------------------------ */
export const kinematics: CalculatorDefinition = {
  slug: "kinematics",
  name: "Kinematics (SUVAT)",
  description: "Solve uniform-acceleration motion: any 3 of displacement, initial/final velocity, acceleration, time.",
  category: "science",
  keywords: ["kinematics", "suvat", "motion", "acceleration", "velocity", "displacement"],
  status: "live",
  part: 4,
  inputs: [
    { name: "s", label: "Displacement s (m) — blank if unknown", type: "number", default: 0, step: "any" },
    { name: "u", label: "Initial velocity u (m/s) — blank if unknown", type: "number", default: 0, step: "any" },
    { name: "v", label: "Final velocity v (m/s) — blank if unknown", type: "number", default: 10, step: "any" },
    { name: "a", label: "Acceleration a (m/s²) — blank if unknown", type: "number", default: 2, step: "any" },
    { name: "t", label: "Time t (s) — blank if unknown", type: "number", default: 0, step: "any" },
  ],
  related: ["newtons-second", "work-energy-power", "momentum-energy"],
  calculate: (raw) => {
    // Treat 0 as "unknown" — kinematics problems often have legitimate zero values, so we use a heuristic:
    // we require exactly 3 knowns. We'll detect blanks (empty strings).
    const known: Record<string, number> = {};
    for (const k of ["s", "u", "v", "a", "t"]) {
      const v = raw[k];
      if (v !== "" && v !== undefined && v !== null) {
        known[k] = toNum(v);
      }
    }
    const knownCount = Object.keys(known).length;
    if (knownCount < 3) {
      return { rows: [{ key: "result", label: "Need more info", value: "—", hint: "Provide at least 3 of s, u, v, a, t (leave the others blank).", emphasis: "warning" }] };
    }
    let s = known.s, u = known.u, v = known.v, a = known.a, t = known.t;
    // Apply SUVAT equations to solve for the 2 unknowns
    // v = u + at
    // s = (u + v)/2 * t
    // v² = u² + 2as
    // s = ut + ½at²
    // s = vt − ½at²
    let iterations = 0;
    while (iterations < 10) {
      let solved = false;
      if (s === undefined && u !== undefined && v !== undefined && t !== undefined) { s = ((u + v) / 2) * t; solved = true; }
      if (s === undefined && u !== undefined && a !== undefined && t !== undefined) { s = u * t + 0.5 * a * t * t; solved = true; }
      if (s === undefined && v !== undefined && a !== undefined && t !== undefined) { s = v * t - 0.5 * a * t * t; solved = true; }
      if (s === undefined && u !== undefined && v !== undefined && a !== undefined) { s = (v * v - u * u) / (2 * a); solved = true; }
      if (u === undefined && v !== undefined && a !== undefined && t !== undefined) { u = v - a * t; solved = true; }
      if (u === undefined && s !== undefined && v !== undefined && t !== undefined) { u = (2 * s - v * t) / t; solved = true; }
      if (u === undefined && s !== undefined && a !== undefined && t !== undefined) { u = (s - 0.5 * a * t * t) / t; solved = true; }
      if (u === undefined && s !== undefined && v !== undefined && a !== undefined) { u = Math.sqrt(v * v - 2 * a * s); solved = true; }
      if (v === undefined && u !== undefined && a !== undefined && t !== undefined) { v = u + a * t; solved = true; }
      if (v === undefined && s !== undefined && u !== undefined && t !== undefined) { v = (2 * s - u * t) / t; solved = true; }
      if (v === undefined && s !== undefined && u !== undefined && a !== undefined) { v = Math.sqrt(u * u + 2 * a * s); solved = true; }
      if (a === undefined && v !== undefined && u !== undefined && t !== undefined) { a = (v - u) / t; solved = true; }
      if (a === undefined && s !== undefined && u !== undefined && t !== undefined) { a = (2 * (s - u * t)) / (t * t); solved = true; }
      if (a === undefined && s !== undefined && u !== undefined && v !== undefined) { a = (v * v - u * u) / (2 * s); solved = true; }
      if (t === undefined && v !== undefined && u !== undefined && a !== undefined) {
        if (a === 0) { t = 0; } else { t = (v - u) / a; }
        solved = true;
      }
      if (t === undefined && s !== undefined && u !== undefined && v !== undefined) {
        if (u + v === 0) { t = 0; } else { t = (2 * s) / (u + v); }
        solved = true;
      }
      if (t === undefined && s !== undefined && u !== undefined && a !== undefined) {
        // 0.5*a*t² + u*t − s = 0
        const disc = u * u + 2 * a * s;
        if (disc < 0) { t = NaN; } else { t = (-u + Math.sqrt(disc)) / a; }
        solved = true;
      }
      if (!solved || Object.keys(known).length + [s, u, v, a, t].filter((x) => x !== undefined).length >= 5) break;
      iterations++;
    }
    return {
      rows: [
        { key: "s", label: "Displacement (s)", value: s !== undefined ? `${fmt(s, 4)} m` : "—", emphasis: "primary" },
        { key: "u", label: "Initial velocity (u)", value: u !== undefined ? `${fmt(u, 4)} m/s` : "—" },
        { key: "v", label: "Final velocity (v)", value: v !== undefined ? `${fmt(v, 4)} m/s` : "—" },
        { key: "a", label: "Acceleration (a)", value: a !== undefined ? `${fmt(a, 4)} m/s²` : "—" },
        { key: "t", label: "Time (t)", value: t !== undefined ? `${fmt(t, 4)} s` : "—" },
      ],
      summary: "SUVAT equations (constant acceleration only). Leave unknowns as blank (not 0) — values you want to keep as zero should be entered as 0.",
    };
  },
  tests: [
    { name: "u=0, v=10, a=2 → t=5, s=25", inputs: { s: "", u: 0, v: 10, a: 2, t: "" }, expected: { t: "5 s", s: "25 m" } },
  ],
};

/* -------------- Newton's second law (F=ma) ------------------------ */
export const newtonsSecond: CalculatorDefinition = {
  slug: "newtons-second",
  name: "Newton's Second Law (F = m·a)",
  description: "Solve for force, mass, or acceleration given the other two.",
  category: "science",
  keywords: ["force", "newton", "mass", "acceleration", "f=ma", "newton's law"],
  status: "live",
  part: 4,
  inputs: [
    { name: "solve", label: "Solve for", type: "select", default: "F",
      options: [
        { label: "Force (F)", value: "F" },
        { label: "Mass (m)", value: "m" },
        { label: "Acceleration (a)", value: "a" },
      ] },
    { name: "F", label: "Force (N)", type: "number", default: 0, step: "any" },
    { name: "m", label: "Mass (kg)", type: "number", default: 10, step: "any" },
    { name: "a", label: "Acceleration (m/s²)", type: "number", default: 9.81, step: "any" },
  ],
  related: ["kinematics", "work-energy-power", "momentum-energy"],
  calculate: (raw) => {
    const solve = String(raw.solve ?? "F");
    const F = toNum(raw.F);
    const m = toNum(raw.m);
    const a = toNum(raw.a);
    let result = 0;
    let formula = "";
    if (solve === "F") {
      result = m * a;
      formula = `F = m·a = ${fmt(m, 4)} × ${fmt(a, 4)}`;
    } else if (solve === "m") {
      if (a === 0) return { rows: [{ key: "result", label: "Mass", value: "—", hint: "Acceleration cannot be 0." }] };
      result = F / a;
      formula = `m = F/a = ${fmt(F, 4)} / ${fmt(a, 4)}`;
    } else {
      if (m === 0) return { rows: [{ key: "result", label: "Acceleration", value: "—", hint: "Mass cannot be 0." }] };
      result = F / m;
      formula = `a = F/m = ${fmt(F, 4)} / ${fmt(m, 4)}`;
    }
    return {
      rows: [
        { key: "result", label: `${solve}`, value: solve === "F" ? `${fmt(result, 4)} N` : solve === "m" ? `${fmt(result, 4)} kg` : `${fmt(result, 4)} m/s²`, emphasis: "primary" },
        { key: "formula", label: "Formula", value: formula },
      ],
      summary: "Newton's second law: F = m·a. 1 N = 1 kg·m/s². Acceleration of gravity on Earth ≈ 9.81 m/s².",
    };
  },
  tests: [
    { name: "10kg × 9.81 = 98.1 N", inputs: { solve: "F", F: 0, m: 10, a: 9.81 }, expected: { result: "98.1 N" } },
    { name: "100N / 10kg = 10 m/s²", inputs: { solve: "a", F: 100, m: 10, a: 0 }, expected: { result: "10 m/s²" } },
  ],
};

/* ----------------- Work / energy / power -------------------------- */
export const workEnergyPower: CalculatorDefinition = {
  slug: "work-energy-power",
  name: "Work, Energy & Power",
  description: "Compute work (W = F·d), kinetic energy (½mv²), potential energy (mgh), and power.",
  category: "science",
  keywords: ["work", "energy", "power", "kinetic", "potential", "joule", "watt"],
  status: "live",
  part: 4,
  inputs: [
    { name: "force", label: "Force (N)", type: "number", default: 50, min: 0, step: "any" },
    { name: "distance", label: "Distance (m)", type: "number", default: 10, min: 0, step: "any" },
    { name: "mass", label: "Mass (kg)", type: "number", default: 2, min: 0, step: "any" },
    { name: "velocity", label: "Velocity (m/s)", type: "number", default: 10, min: 0, step: "any" },
    { name: "height", label: "Height (m)", type: "number", default: 5, min: 0, step: "any" },
    { name: "time", label: "Time (s)", type: "number", default: 4, min: 0.001, step: "any" },
  ],
  related: ["newtons-second", "momentum-energy", "kinematics"],
  calculate: (raw) => {
    const F = toNum(raw.force);
    const d = toNum(raw.distance);
    const m = toNum(raw.mass);
    const v = toNum(raw.velocity);
    const h = toNum(raw.height);
    const t = toNum(raw.time);
    const g = 9.81;
    const work = F * d;
    const ke = 0.5 * m * v * v;
    const pe = m * g * h;
    const totalEnergy = ke + pe;
    const power = work / t;
    return {
      rows: [
        { key: "work", label: "Work W = F·d", value: `${fmt(work, 4)} J`, emphasis: "primary" },
        { key: "ke", label: `Kinetic energy KE = ½mv²`, value: `${fmt(ke, 4)} J`, emphasis: "primary" },
        { key: "pe", label: "Potential energy PE = mgh (g=9.81)", value: `${fmt(pe, 4)} J`, emphasis: "primary" },
        { key: "total", label: "Total mechanical energy", value: `${fmt(totalEnergy, 4)} J` },
        { key: "power", label: `Power P = W/t`, value: `${fmt(power, 4)} W`, emphasis: "primary" },
      ],
      summary: "1 joule = 1 N·m = 1 kg·m²/s². 1 watt = 1 J/s. Work requires force in the direction of motion; if force is perpendicular, work is zero.",
    };
  },
  tests: [
    { name: "50N × 10m = 500 J", inputs: { force: 50, distance: 10, mass: 2, velocity: 10, height: 5, time: 4 }, expected: { work: "500 J" } },
    { name: "KE = ½·2·10² = 100 J", inputs: { force: 50, distance: 10, mass: 2, velocity: 10, height: 5, time: 4 }, expected: { ke: "100 J" } },
    { name: "Power = 500J / 4s = 125 W", inputs: { force: 50, distance: 10, mass: 2, velocity: 10, height: 5, time: 4 }, expected: { power: "125 W" } },
  ],
};

/* ----------------- Momentum & energy ------------------------------ */
export const momentumEnergy: CalculatorDefinition = {
  slug: "momentum-energy",
  name: "Momentum & Collisions",
  description: "Compute momentum (p=mv) and final velocities for elastic and inelastic collisions.",
  category: "science",
  keywords: ["momentum", "collision", "elastic", "inelastic", "conservation", "impulse"],
  status: "live",
  part: 4,
  inputs: [
    { name: "m1", label: "Mass 1 (kg)", type: "number", default: 2, min: 0, step: "any" },
    { name: "v1", label: "Velocity 1 (m/s)", type: "number", default: 5, step: "any" },
    { name: "m2", label: "Mass 2 (kg)", type: "number", default: 3, min: 0, step: "any" },
    { name: "v2", label: "Velocity 2 (m/s)", type: "number", default: -2, step: "any" },
  ],
  related: ["newtons-second", "work-energy-power", "kinematics"],
  calculate: (raw) => {
    const m1 = toNum(raw.m1);
    const v1 = toNum(raw.v1);
    const m2 = toNum(raw.m2);
    const v2 = toNum(raw.v2);
    const p1 = m1 * v1;
    const p2 = m2 * v2;
    const totalP = p1 + p2;
    const totalKE = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
    // Perfectly inelastic: both objects stick together
    const vFinalInelastic = (m1 * v1 + m2 * v2) / (m1 + m2);
    // Perfectly elastic: conserve both momentum and KE
    const v1FinalElastic = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
    const v2FinalElastic = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
    return {
      rows: [
        { key: "p1", label: "Momentum of object 1", value: `${fmt(p1, 4)} kg·m/s` },
        { key: "p2", label: "Momentum of object 2", value: `${fmt(p2, 4)} kg·m/s` },
        { key: "total_p", label: "Total momentum (conserved)", value: `${fmt(totalP, 4)} kg·m/s`, emphasis: "primary" },
        { key: "total_ke", label: "Total kinetic energy", value: `${fmt(totalKE, 4)} J` },
      ],
      sections: [{
        title: "After collision",
        rows: [
          { key: "inelastic", label: "Perfectly inelastic (stick together)", value: `v = ${fmt(vFinalInelastic, 4)} m/s` },
          { key: "elastic_v1", label: "Elastic: v₁ final", value: `${fmt(v1FinalElastic, 4)} m/s` },
          { key: "elastic_v2", label: "Elastic: v₂ final", value: `${fmt(v2FinalElastic, 4)} m/s` },
        ],
      }],
      summary: "Momentum p = m·v is always conserved in collisions. Kinetic energy is conserved only in perfectly elastic collisions. Real collisions are somewhere in between.",
    };
  },
  tests: [
    { name: "p1 + p2 = 4 kg·m/s", inputs: { m1: 2, v1: 5, m2: 3, v2: -2 }, expected: { total_p: "4 kg·m/s" } },
    { name: "Inelastic v = 4/5 = 0.8 m/s", inputs: { m1: 2, v1: 5, m2: 3, v2: -2 }, expected: { inelastic: "v = 0.8 m/s" } },
  ],
};

/* --------------- Density, pressure, buoyancy ---------------------- */
export const densityPressure: CalculatorDefinition = {
  slug: "density-pressure-buoyancy",
  name: "Density, Pressure & Buoyancy",
  description: "Compute density (ρ=m/V), pressure (P=F/A), and buoyant force (F=ρVg).",
  category: "science",
  keywords: ["density", "pressure", "buoyancy", "archimedes", "fluid", "mass"],
  status: "live",
  part: 4,
  inputs: [
    { name: "mode", label: "Mode", type: "select", default: "density",
      options: [
        { label: "Density (ρ = m/V)", value: "density" },
        { label: "Pressure (P = F/A)", value: "pressure" },
        { label: "Buoyant force (F = ρ·V·g)", value: "buoyancy" },
      ] },
    { name: "mass", label: "Mass (kg)", type: "number", default: 500, step: "any" },
    { name: "volume", label: "Volume (m³)", type: "number", default: 0.5, step: "any" },
    { name: "force", label: "Force (N)", type: "number", default: 100, step: "any" },
    { name: "area", label: "Area (m²)", type: "number", default: 0.05, step: "any" },
    { name: "fluid_density", label: "Fluid density (kg/m³)", type: "number", default: 1000, step: "any",
      help: "Water = 1000, air = 1.225, mercury = 13546, oil ≈ 900." },
  ],
  related: ["newtons-second", "work-energy-power"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "density");
    const m = toNum(raw.mass);
    const V = toNum(raw.volume);
    const F = toNum(raw.force);
    const A = toNum(raw.area);
    const rho = toNum(raw.fluid_density);
    const g = 9.81;
    if (mode === "density") {
      if (V === 0) return { rows: [{ key: "result", label: "Density", value: "—" }] };
      const d = m / V;
      return {
        rows: [
          { key: "result", label: "Density (ρ = m/V)", value: `${fmt(d, 4)} kg/m³`, emphasis: "primary" },
        ],
        sections: [{
          title: "Reference densities",
          rows: [
            { key: "water", label: "Water (4°C)", value: "1000 kg/m³" },
            { key: "air", label: "Air (sea level)", value: "1.225 kg/m³" },
            { key: "iron", label: "Iron", value: "7870 kg/m³" },
            { key: "gold", label: "Gold", value: "19320 kg/m³" },
          ],
        }],
        summary: "ρ = m/V. Density tells you how much mass is packed into a volume.",
      };
    }
    if (mode === "pressure") {
      if (A === 0) return { rows: [{ key: "result", label: "Pressure", value: "—" }] };
      const P = F / A;
      return {
        rows: [
          { key: "result", label: "Pressure (P = F/A)", value: `${fmt(P, 4)} Pa`, emphasis: "primary" },
          { key: "kpa", label: "In kPa", value: `${fmt(P / 1000, 4)} kPa` },
          { key: "psi", label: "In psi", value: `${fmt(P / 6894.76, 4)} psi` },
          { key: "bar", label: "In bar", value: `${fmt(P / 100000, 4)} bar` },
        ],
        summary: "P = F/A. 1 Pa = 1 N/m². 1 bar = 100 kPa. Atmospheric pressure ≈ 101325 Pa.",
      };
    }
    // Buoyancy
    const buoyant = rho * V * g;
    const apparentWeight = m * g - buoyant;
    const floats = m * g <= buoyant;
    return {
      rows: [
        { key: "result", label: "Buoyant force (F = ρ·V·g)", value: `${fmt(buoyant, 4)} N`, emphasis: "primary" },
        { key: "weight", label: "Object weight (m·g)", value: `${fmt(m * g, 4)} N` },
        { key: "apparent", label: "Apparent weight in fluid", value: `${fmt(apparentWeight, 4)} N`, emphasis: "primary" },
        { key: "floats", label: "Will it float?", value: floats ? "Yes (buoyancy ≥ weight)" : "No (sinks)", emphasis: floats ? "success" : "warning" },
      ],
      summary: "Archimedes' principle: buoyant force = weight of fluid displaced = ρ·V·g. Object floats iff buoyant force ≥ object weight.",
    };
  },
  tests: [
    { name: "500kg / 0.5m³ = 1,000 kg/m³", inputs: { mode: "density", mass: 500, volume: 0.5, force: 0, area: 0, fluid_density: 1000 }, expected: { result: "1,000 kg/m³" } },
    { name: "100N / 0.05m² = 2,000 Pa", inputs: { mode: "pressure", mass: 0, volume: 0, force: 100, area: 0.05, fluid_density: 1000 }, expected: { result: "2,000 Pa" } },
    { name: "Buoyancy 0.5m³ in water = 4,905 N", inputs: { mode: "buoyancy", mass: 0, volume: 0.5, force: 0, area: 0, fluid_density: 1000 }, expected: { result: "4,905 N" } },
  ],
};

/* --------------- Thermal expansion -------------------------------- */
export const thermalExpansion: CalculatorDefinition = {
  slug: "thermal-expansion",
  name: "Thermal Expansion",
  description: "Linear and volumetric thermal expansion of materials.",
  category: "science",
  keywords: ["thermal", "expansion", "heat", "temperature", "linear", "volumetric", "coefficient"],
  status: "live",
  part: 4,
  inputs: [
    { name: "mode", label: "Mode", type: "select", default: "linear",
      options: [
        { label: "Linear (ΔL = α·L₀·ΔT)", value: "linear" },
        { label: "Volumetric (ΔV = 3α·V₀·ΔT)", value: "volume" },
      ] },
    { name: "L0", label: "Initial length (m) or volume (m³)", type: "number", default: 1, min: 0, step: "any" },
    { name: "alpha", label: "Coefficient α (×10⁻⁶ /°C)", type: "number", default: 12, min: 0, step: "any",
      help: "Aluminum 23, Steel 12, Copper 17, Glass 9, Concrete 12 (all ×10⁻⁶/°C)." },
    { name: "t0", label: "Initial temperature (°C)", type: "number", default: 20, step: "any" },
    { name: "t1", label: "Final temperature (°C)", type: "number", default: 100, step: "any" },
  ],
  related: ["temperature-converter", "density-pressure-buoyancy"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "linear");
    const L0 = toNum(raw.L0);
    const alpha = toNum(raw.alpha) * 1e-6;
    const t0 = toNum(raw.t0);
    const t1 = toNum(raw.t1);
    if (L0 <= 0) return { rows: [{ key: "result", label: "Result", value: "—" }] };
    const dT = t1 - t0;
    const coefficient = mode === "linear" ? alpha : 3 * alpha;
    const delta = coefficient * L0 * dT;
    const final = L0 + delta;
    return {
      rows: [
        { key: "result", label: mode === "linear" ? "ΔL (length change)" : "ΔV (volume change)", value: `${fmt(delta, 6)} ${mode === "linear" ? "m" : "m³"}`, emphasis: "primary" },
        { key: "final", label: "Final value", value: `${fmt(final, 6)} ${mode === "linear" ? "m" : "m³"}`, emphasis: "primary" },
        { key: "dT", label: "Temperature change", value: `${fmt(dT, 2)} °C` },
      ],
      sections: [{
        title: "Common coefficients (×10⁻⁶ /°C)",
        rows: [
          { key: "aluminum", label: "Aluminum", value: "23" },
          { key: "steel", label: "Steel", value: "12" },
          { key: "copper", label: "Copper", value: "17" },
          { key: "glass", label: "Glass", value: "9" },
          { key: "concrete", label: "Concrete", value: "12" },
          { key: "invar", label: "Invar (low expansion)", value: "1.2" },
        ],
      }],
      summary: `ΔL = α·L₀·ΔT. Volumetric uses 3α for isotropic materials. The coefficients are approximate; real values vary with alloy and temperature.`,
    };
  },
  tests: [
    { name: "1m steel, 20→100°C → ΔL = 0.00096m", inputs: { mode: "linear", L0: 1, alpha: 12, t0: 20, t1: 100 }, expected: { result: "0.00096 m" } },
  ],
};

/* --------------- Wave frequency / wavelength ---------------------- */
export const waveFrequency: CalculatorDefinition = {
  slug: "wave-frequency",
  name: "Wave Frequency & Wavelength",
  description: "Compute wave speed (v = f·λ), frequency, or wavelength given the other two.",
  category: "science",
  keywords: ["wave", "frequency", "wavelength", "speed", "hertz", "hz", "light", "sound"],
  status: "live",
  part: 4,
  inputs: [
    { name: "solve", label: "Solve for", type: "select", default: "v",
      options: [
        { label: "Wave speed (v = f·λ)", value: "v" },
        { label: "Frequency (f = v/λ)", value: "f" },
        { label: "Wavelength (λ = v/f)", value: "lambda" },
      ] },
    { name: "v", label: "Wave speed (m/s)", type: "number", default: 343, step: "any",
      help: "Sound in air ≈ 343 m/s, sound in water ≈ 1480 m/s, light ≈ 3×10⁸ m/s." },
    { name: "f", label: "Frequency (Hz)", type: "number", default: 440, step: "any" },
    { name: "lambda", label: "Wavelength (m)", type: "number", default: 0, step: "any" },
  ],
  related: ["trig-evaluator", "scientific-calculator"],
  calculate: (raw) => {
    const solve = String(raw.solve ?? "v");
    const v = toNum(raw.v);
    const f = toNum(raw.f);
    const lambda = toNum(raw.lambda);
    let result = 0;
    let unit = "";
    if (solve === "v") {
      result = f * lambda;
      unit = "m/s";
    } else if (solve === "f") {
      if (lambda === 0) return { rows: [{ key: "result", label: "Frequency", value: "—" }] };
      result = v / lambda;
      unit = "Hz";
    } else {
      if (f === 0) return { rows: [{ key: "result", label: "Wavelength", value: "—" }] };
      result = v / f;
      unit = "m";
    }
    return {
      rows: [
        { key: "result", label: solve === "v" ? "Wave speed" : solve === "f" ? "Frequency" : "Wavelength", value: `${fmt(result, 6)} ${unit}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Reference speeds",
        rows: [
          { key: "sound_air", label: "Sound in air (20°C)", value: "343 m/s" },
          { key: "sound_water", label: "Sound in water", value: "1480 m/s" },
          { key: "light", label: "Light in vacuum", value: "2.998×10⁸ m/s" },
        ],
      }],
      summary: "v = f·λ. Frequency in Hz (cycles per second). Wavelength in meters. Higher frequency → shorter wavelength for the same wave speed.",
    };
  },
  tests: [
    { name: "440Hz × 0.78m = 343 m/s", inputs: { solve: "v", v: 0, f: 440, lambda: 0.78 }, expected: { result: "343.2 m/s" } },
    { name: "Speed of light, f=100MHz → λ=3m", inputs: { solve: "lambda", v: 299792458, f: 100000000, lambda: 0 }, expected: { result: "2.997925 m" } },
  ],
};

/* --------------- Electrical energy consumption -------------------- */
export const electricalEnergy: CalculatorDefinition = {
  slug: "electrical-energy-consumption",
  name: "Electricity Consumption & Bill",
  description: "Estimate energy use (kWh) and cost for an appliance from wattage and daily usage.",
  category: "science",
  keywords: ["electricity", "energy", "kwh", "bill", "appliance", "consumption", "watt"],
  status: "live",
  part: 4,
  inputs: [
    { name: "wattage", label: "Appliance wattage (W)", type: "number", default: 1500, min: 0, step: "any", unit: "W" },
    { name: "hours_per_day", label: "Hours used per day", type: "number", default: 3, min: 0, max: 24, step: "any", unit: "h" },
    { name: "days", label: "Period (days)", type: "number", default: 30, min: 1, step: 1, unit: "days" },
    { name: "rate", label: "Electricity rate", type: "number", default: 0.15, min: 0, step: "any", unit: "$/kWh",
      help: "US average ~$0.15/kWh. EU averages €0.25-0.35/kWh." },
  ],
  related: ["ohms-law", "series-parallel-resistance", "electricity-bill"],
  calculate: (raw) => {
    const w = toNum(raw.wattage);
    const h = toNum(raw.hours_per_day);
    const days = toNum(raw.days);
    const rate = toNum(raw.rate);
    const kwhPerDay = (w * h) / 1000;
    const totalKwh = kwhPerDay * days;
    const cost = totalKwh * rate;
    return {
      rows: [
        { key: "kwh_day", label: "Energy per day", value: `${fmt(kwhPerDay, 4)} kWh` },
        { key: "total_kwh", label: `Total energy (${days} days)`, value: `${fmt(totalKwh, 4)} kWh`, emphasis: "primary" },
        { key: "cost", label: "Estimated cost", value: fmtUSD(cost), emphasis: "primary" },
      ],
      sections: [{
        title: "Long-term projections",
        rows: [
          { key: "monthly", label: "Monthly cost (30 days)", value: fmtUSD(kwhPerDay * 30 * rate) },
          { key: "yearly", label: "Yearly cost", value: fmtUSD(kwhPerDay * 365 * rate) },
        ],
      }],
      summary: "kWh = (W × hours) ÷ 1000. Cost = kWh × rate. ESTIMATE ONLY — actual consumption depends on duty cycle, standby draw, and efficiency.",
    };
  },
  tests: [
    { name: "1500W × 3h × 30d @ $0.15", inputs: { wattage: 1500, hours_per_day: 3, days: 30, rate: 0.15 }, expected: { total_kwh: "135 kWh" } },
    { name: "Same → cost $20.25", inputs: { wattage: 1500, hours_per_day: 3, days: 30, rate: 0.15 }, expected: { cost: "$20.25" } },
  ],
};

/* --------------- Series & parallel resistance --------------------- */
export const seriesParallelResistance: CalculatorDefinition = {
  slug: "series-parallel-resistance",
  name: "Series & Parallel Resistance",
  description: "Compute total resistance for resistors in series or parallel.",
  category: "science",
  keywords: ["resistor", "series", "parallel", "resistance", "circuit", "ohm"],
  status: "live",
  part: 4,
  inputs: [
    { name: "resistors", label: "Resistors (comma separated, in Ω)", type: "text", default: "100, 220, 330",
      placeholder: "e.g. 100, 220, 330" },
    { name: "config", label: "Configuration", type: "select", default: "series",
      options: [
        { label: "Series (R = R₁ + R₂ + …)", value: "series" },
        { label: "Parallel (1/R = 1/R₁ + 1/R₂ + …)", value: "parallel" },
      ] },
  ],
  related: ["ohms-law", "electrical-energy-consumption", "resistor-color-code"],
  calculate: (raw) => {
    const text = String(raw.resistors ?? "");
    const nums = text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean).map(toNum).filter((n) => Number.isFinite(n) && n > 0);
    if (nums.length === 0) {
      return { rows: [{ key: "total", label: "Total resistance", value: "—" }] };
    }
    const config = String(raw.config ?? "series");
    let total: number;
    if (config === "series") {
      total = nums.reduce((a, b) => a + b, 0);
    } else {
      total = 1 / nums.reduce((a, b) => a + 1 / b, 0);
    }
    return {
      rows: [
        { key: "total", label: `Total resistance (${config})`, value: `${fmt(total, 4)} Ω`, emphasis: "primary" },
        { key: "count", label: "Number of resistors", value: `${nums.length}` },
      ],
      sections: [{
        title: "Resistor values",
        rows: nums.map((n, i) => ({ key: `r${i}`, label: `R${i + 1}`, value: `${fmt(n, 4)} Ω` })),
      }],
      summary: config === "series"
        ? "Series: R = R₁ + R₂ + … — total resistance is always greater than any individual resistor."
        : "Parallel: 1/R = 1/R₁ + 1/R₂ + … — total resistance is always less than the smallest individual resistor.",
    };
  },
  tests: [
    { name: "100+220+330 series = 650Ω", inputs: { resistors: "100, 220, 330", config: "series" }, expected: { total: "650 Ω" } },
    { name: "100, 200 parallel = 66.667Ω", inputs: { resistors: "100, 200", config: "parallel" }, expected: { total: "66.6667 Ω" } },
  ],
};

/* --------------- Gas laws (Boyle, Charles, Gay-Lussac) ------------ */
export const gasLaws: CalculatorDefinition = {
  slug: "gas-laws",
  name: "Gas Laws (Boyle, Charles, Combined)",
  description: "Solve PV=nRT and the combined gas law for ideal gases.",
  category: "science",
  keywords: ["gas", "boyle", "charles", "ideal", "pv=nrt", "pressure", "volume", "temperature"],
  status: "live",
  part: 4,
  inputs: [
    { name: "mode", label: "Mode", type: "select", default: "combined",
      options: [
        { label: "Combined gas law (P₁V₁/T₁ = P₂V₂/T₂)", value: "combined" },
        { label: "Ideal gas law (PV = nRT)", value: "ideal" },
      ] },
    { name: "p1", label: "P₁ (Pa)", type: "number", default: 101325, step: "any" },
    { name: "v1", label: "V₁ (m³)", type: "number", default: 0.024, step: "any" },
    { name: "t1", label: "T₁ (K)", type: "number", default: 293, step: "any" },
    { name: "p2", label: "P₂ (Pa)", type: "number", default: 200000, step: "any" },
    { name: "v2", label: "V₂ (m³) — leave 0 to solve", type: "number", default: 0, step: "any" },
    { name: "t2", label: "T₂ (K)", type: "number", default: 293, step: "any" },
    { name: "n", label: "Moles (n) — for ideal gas law", type: "number", default: 1, step: "any" },
  ],
  related: ["density-pressure-buoyancy", "thermal-expansion", "temperature-converter"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "combined");
    const R = 8.314; // J/(mol·K)
    if (mode === "ideal") {
      const P = toNum(raw.p1);
      const V = toNum(raw.v1);
      const T = toNum(raw.t1);
      const n = toNum(raw.n);
      if (T === 0) return { rows: [{ key: "result", label: "Result", value: "—", hint: "T must be > 0 K." }] };
      // Solve for the missing one: detect by 0 value
      if (P === 0) {
        const r = n * R * T / V;
        return { rows: [{ key: "result", label: "Pressure P = nRT/V", value: `${fmt(r, 4)} Pa`, emphasis: "primary" }] };
      }
      if (V === 0) {
        const r = n * R * T / P;
        return { rows: [{ key: "result", label: "Volume V = nRT/P", value: `${fmt(r, 6)} m³`, emphasis: "primary" }] };
      }
      if (T === 0 && n > 0) {
        const r = P * V / (n * R);
        return { rows: [{ key: "result", label: "Temperature T = PV/nR", value: `${fmt(r, 4)} K`, emphasis: "primary" }] };
      }
      const computedN = P * V / (R * T);
      return { rows: [{ key: "result", label: "Moles n = PV/RT", value: `${fmt(computedN, 6)} mol`, emphasis: "primary" }] };
    }
    // Combined: P1·V1/T1 = P2·V2/T2 → solve for V2 (if 0)
    const P1 = toNum(raw.p1);
    const V1 = toNum(raw.v1);
    const T1 = toNum(raw.t1);
    const P2 = toNum(raw.p2);
    const V2 = toNum(raw.v2);
    const T2 = toNum(raw.t2);
    if (T1 === 0 || T2 === 0 || P2 === 0) {
      return { rows: [{ key: "result", label: "Result", value: "—", hint: "T₁, T₂, P₂ must be non-zero." }] };
    }
    if (V2 === 0) {
      const v2 = (P1 * V1 * T2) / (T1 * P2);
      return {
        rows: [
          { key: "result", label: "V₂ = P₁V₁T₂ / (T₁P₂)", value: `${fmt(v2, 6)} m³`, emphasis: "primary" },
        ],
        summary: "Combined gas law: P₁V₁/T₁ = P₂V₂/T₂ (T in kelvin). Assumes the amount of gas is constant.",
      };
    }
    // Compute ratio
    const lhs = (P1 * V1) / T1;
    const rhs = (P2 * V2) / T2;
    return {
      rows: [
        { key: "lhs", label: "P₁V₁/T₁", value: `${fmt(lhs, 6)}` },
        { key: "rhs", label: "P₂V₂/T₂", value: `${fmt(rhs, 6)}` },
        { key: "ratio", label: "Ratio", value: `${fmt(lhs / rhs, 4)}`, hint: "Should be 1.000 if both sides balance." },
      ],
      summary: "Combined gas law: P₁V₁/T₁ = P₂V₂/T₂. Temperature must be in kelvin (K = °C + 273.15).",
    };
  },
  tests: [
    { name: "1 mol at STP → V ≈ 0.024 m³", inputs: { mode: "ideal", p1: 101325, v1: 0, t1: 293, p2: 0, v2: 0, t2: 0, n: 1 }, expected: { result: "0.024052 m³" }, tolerance: 0.0001 },
  ],
};
