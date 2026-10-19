/**
 * Advanced Geometry and Engineering — additional calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ------------------- Sphere surface & volume (already exists) ------- */
// Move on to new tools.

/* ------------------- Truss / beam load ----------------------------- */
export const beamLoad: CalculatorDefinition = {
  slug: "simple-beam-load",
  name: "Simply-Supported Beam (Point Load)",
  description: "Compute max bending moment and deflection for a simply-supported beam with a central point load.",
  category: "engineering",
  keywords: ["beam", "load", "bending moment", "deflection", "structural", "engineering"],
  status: "live",
  part: 5,
  inputs: [
    { name: "P", label: "Point load (P)", type: "number", default: 1000, min: 0, step: "any", unit: "N" },
    { name: "L", label: "Beam length (L)", type: "number", default: 4, min: 0.001, step: "any", unit: "m" },
    { name: "E", label: "Young's modulus (E)", type: "number", default: 200e9, min: 1, step: "any", unit: "Pa",
      help: "Steel: 200 GPa. Aluminum: 69 GPa. Wood: 11 GPa. Concrete: 30 GPa." },
    { name: "I", label: "Second moment of area (I)", type: "number", default: 1e-5, min: 0, step: "any", unit: "m⁴",
      help: "Rectangular beam: I = b·h³/12. Circle: I = π·r⁴/4." },
  ],
  related: ["newtons-second", "work-energy-power", "density-pressure-buoyancy"],
  calculate: (raw) => {
    const P = toNum(raw.P);
    const L = toNum(raw.L);
    const E = toNum(raw.E);
    const I = toNum(raw.I);
    if (L <= 0 || E <= 0 || I <= 0) {
      return { rows: [{ key: "moment", label: "Max bending moment", value: "—" }] };
    }
    // Max bending moment for central point load on simply-supported beam: M = PL/4
    const moment = (P * L) / 4;
    // Max deflection (central): δ = PL³ / (48 E I)
    const deflection = (P * Math.pow(L, 3)) / (48 * E * I);
    // Reactions at each support
    const reaction = P / 2;
    return {
      rows: [
        { key: "moment", label: "Max bending moment (M = PL/4)", value: `${fmt(moment, 4)} N·m`, emphasis: "primary" },
        { key: "deflection", label: "Max deflection (δ = PL³/48EI)", value: `${fmt(deflection * 1000, 6)} mm`, emphasis: "primary" },
        { key: "reaction", label: "Reaction at each support", value: `${fmt(reaction, 4)} N` },
      ],
      sections: [{
        title: "Reference materials (Young's modulus E)",
        rows: [
          { key: "steel", label: "Steel", value: "200 GPa" },
          { key: "aluminum", label: "Aluminum", value: "69 GPa" },
          { key: "wood", label: "Wood (parallel)", value: "11 GPa" },
          { key: "concrete", label: "Concrete", value: "30 GPa" },
        ],
      }],
      summary: "For a simply-supported beam with central point load: M_max = PL/4, δ_max = PL³/48EI. ESTIMATE — assumes elastic behavior, isotropic material, and small deflections. Use a structural engineer for actual design.",
    };
  },
  tests: [
    { name: "1000N, 4m, steel 200GPa, I=1e-5 m⁴", inputs: { P: 1000, L: 4, E: 200e9, I: 1e-5 }, expected: { moment: "1,000 N·m" } },
  ],
};

/* ------------------- Pipe flow (Hazen-Williams) -------------------- */
export const pipeFlow: CalculatorDefinition = {
  slug: "pipe-flow",
  name: "Pipe Flow (Hazen-Williams)",
  description: "Estimate water flow rate through a pipe using the Hazen-Williams formula.",
  category: "engineering",
  keywords: ["pipe", "flow", "water", "hazen", "williams", "fluid", "hydraulic"],
  status: "live",
  part: 5,
  inputs: [
    { name: "d", label: "Internal pipe diameter", type: "number", default: 0.1, min: 0.001, step: "any", unit: "m" },
    { name: "s", label: "Hydraulic slope (head loss per length)", type: "number", default: 0.02, min: 0.0001, step: "any", unit: "m/m" },
    { name: "C", label: "Hazen-Williams C coefficient", type: "number", default: 140, min: 1, step: "any",
      help: "New steel/Cu: 140. PVC: 150. Old steel: 100. Severely scaled: 60." },
  ],
  related: ["density-pressure-buoyancy", "beam-load", "rc-time-constant"],
  calculate: (raw) => {
    const d = toNum(raw.d);
    const s = toNum(raw.s);
    const C = toNum(raw.C);
    if (d <= 0 || s <= 0 || C <= 0) {
      return { rows: [{ key: "flow", label: "Flow rate", value: "—" }] };
    }
    // Hazen-Williams (SI units): Q = 0.849 × C × d^2.63 × s^0.54
    const Q = 0.849 * C * Math.pow(d, 2.63) * Math.pow(s, 0.54);
    const velocity = Q / (Math.PI * d * d / 4);
    const lpm = Q * 1000 * 60;
    const gpm = Q * 264.172 * 60;
    return {
      rows: [
        { key: "flow", label: "Flow rate (Q)", value: `${fmt(Q, 4)} m³/s`, emphasis: "primary" },
        { key: "lpm", label: "In liters/min", value: `${fmt(lpm, 2)} L/min`, emphasis: "primary" },
        { key: "gpm", label: "In US gal/min", value: `${fmt(gpm, 2)} gpm` },
        { key: "velocity", label: "Flow velocity", value: `${fmt(velocity, 4)} m/s` },
      ],
      sections: [{
        title: "C coefficient reference",
        rows: [
          { key: "pvc", label: "PVC (new)", value: "150" },
          { key: "copper", label: "Copper / steel (new)", value: "140" },
          { key: "concrete", label: "Concrete", value: "130" },
          { key: "old_steel", label: "Old steel (some scale)", value: "100" },
          { key: "scaled", label: "Severely scaled", value: "60" },
        ],
      }],
      summary: "Hazen-Williams (SI): Q = 0.849 × C × d^2.63 × s^0.54. Only valid for water at typical temperatures and turbulent flow. ESTIMATE — Darcy-Weisbach is more accurate for non-water fluids.",
    };
  },
  tests: [
    { name: "100mm pipe, slope 0.02, C=140", inputs: { d: 0.1, s: 0.02, C: 140 }, expected: { flow: "0.0337 m³/s" }, tolerance: 0.001 },
  ],
};

/* ------------------- Voltage drop in cable ------------------------- */
export const voltageDrop: CalculatorDefinition = {
  slug: "voltage-drop",
  name: "Cable Voltage Drop",
  description: "Compute voltage drop in a copper cable from current, length and gauge.",
  category: "engineering",
  keywords: ["voltage drop", "cable", "wire", "gauge", "resistance", "electrical"],
  status: "live",
  part: 5,
  inputs: [
    { name: "current", label: "Current", type: "number", default: 15, min: 0, step: "any", unit: "A" },
    { name: "length", label: "Cable length (one-way)", type: "number", default: 20, min: 0, step: "any", unit: "m" },
    { name: "cable", label: "Cable cross-section", type: "select", default: "2.5",
      options: [
        { label: "1.5 mm² (15 AWG)", value: "1.5" },
        { label: "2.5 mm² (13 AWG)", value: "2.5" },
        { label: "4 mm² (11 AWG)", value: "4" },
        { label: "6 mm² (9 AWG)", value: "6" },
        { label: "10 mm² (7 AWG)", value: "10" },
        { label: "16 mm² (5 AWG)", value: "16" },
      ] },
    { name: "material", label: "Conductor material", type: "select", default: "copper",
      options: [
        { label: "Copper (ρ = 1.68×10⁻⁸ Ω·m)", value: "copper" },
        { label: "Aluminum (ρ = 2.65×10⁻⁸ Ω·m)", value: "aluminum" },
      ] },
    { name: "supply", label: "Supply voltage", type: "number", default: 230, min: 1, step: "any", unit: "V" },
  ],
  related: ["ohms-law", "voltage-divider", "series-parallel-resistance"],
  calculate: (raw) => {
    const I = toNum(raw.current);
    const L = toNum(raw.length);
    const area = Number(raw.cable ?? 2.5) * 1e-6; // mm² → m²
    const mat = String(raw.material ?? "copper");
    const supply = toNum(raw.supply);
    const rho = mat === "copper" ? 1.68e-8 : 2.65e-8;
    if (I <= 0 || L <= 0 || area <= 0) {
      return { rows: [{ key: "drop", label: "Voltage drop", value: "—" }] };
    }
    // Round-trip resistance (length × 2 for both conductors)
    const R = (rho * 2 * L) / area;
    const drop = I * R;
    const dropPct = supply > 0 ? (drop / supply) * 100 : 0;
    const receivedVoltage = supply - drop;
    return {
      rows: [
        { key: "drop", label: "Voltage drop", value: `${fmt(drop, 4)} V`, emphasis: "primary" },
        { key: "drop_pct", label: "Drop %", value: `${fmt(dropPct, 2)}%`, emphasis: dropPct > 5 ? "warning" : "success" },
        { key: "received", label: "Voltage at load", value: `${fmt(receivedVoltage, 4)} V`, emphasis: "primary" },
      ],
      sections: [{
        title: "Cable properties",
        rows: [
          { key: "resistance", label: "Round-trip resistance", value: `${fmt(R, 4)} Ω` },
          { key: "power_loss", label: "Power loss in cable", value: `${fmt(drop * I, 4)} W` },
          { key: "material", label: "Conductor material", value: mat },
        ],
      }],
      summary: "ΔV = I × R where R = 2·ρ·L/A (round trip). Rule of thumb: keep drop <3% for lighting, <5% for other loads. Increase cable cross-section or shorten run to reduce drop.",
    };
  },
  tests: [
    { name: "15A, 20m, 2.5mm² copper, 230V supply", inputs: { current: 15, length: 20, cable: "2.5", material: "copper", supply: 230 }, expected: { drop_pct: "1.75%" }, tolerance: 0.1 },
  ],
};

/* ------------------- Pump hydraulic power --------------------------- */
export const pumpPower: CalculatorDefinition = {
  slug: "pump-hydraulic-power",
  name: "Pump Hydraulic Power",
  description: "Compute hydraulic power needed to pump fluid against a head.",
  category: "engineering",
  keywords: ["pump", "hydraulic", "power", "head", "water", "fluid"],
  status: "live",
  part: 5,
  inputs: [
    { name: "flow", label: "Flow rate", type: "number", default: 0.01, min: 0, step: "any", unit: "m³/s" },
    { name: "head", label: "Total head (vertical lift + friction)", type: "number", default: 20, min: 0, step: "any", unit: "m" },
    { name: "density", label: "Fluid density", type: "number", default: 1000, min: 1, step: "any", unit: "kg/m³",
      help: "Water: 1000. Seawater: 1025. Oil: ~900. Gasoline: ~750." },
    { name: "efficiency", label: "Pump efficiency", type: "number", default: 70, min: 1, max: 100, step: "any", unit: "%" },
  ],
  related: ["pipe-flow", "voltage-drop", "ohms-law"],
  calculate: (raw) => {
    const Q = toNum(raw.flow);
    const H = toNum(raw.head);
    const rho = toNum(raw.density);
    const eff = toNum(raw.efficiency) / 100;
    const g = 9.81;
    if (Q <= 0 || H <= 0 || eff <= 0) {
      return { rows: [{ key: "power", label: "Power required", value: "—" }] };
    }
    // Hydraulic power: P_hyd = ρ × g × Q × H
    const hydraulicPower = rho * g * Q * H;
    const shaftPower = hydraulicPower / eff;
    return {
      rows: [
        { key: "power", label: "Hydraulic power", value: `${fmt(hydraulicPower, 4)} W`, emphasis: "primary" },
        { key: "shaft", label: "Shaft power required", value: `${fmt(shaftPower, 4)} W (${fmt(shaftPower / 1000, 4)} kW)`, emphasis: "primary" },
        { key: "hp", label: "In horsepower", value: `${fmt(shaftPower / 745.7, 4)} HP` },
      ],
      sections: [{
        title: "Inputs",
        rows: [
          { key: "flow_lpm", label: "Flow (L/min)", value: `${fmt(Q * 60000, 2)}` },
          { key: "flow_gpm", label: "Flow (gpm)", value: `${fmt(Q * 15850.3, 2)}` },
        ],
      }],
      summary: "Hydraulic power = ρ·g·Q·H. Shaft power = hydraulic ÷ efficiency. Pump efficiency varies 50-85% depending on type and operating point.",
    };
  },
  tests: [
    { name: "10 L/s, 20m head, water, 70% eff", inputs: { flow: 0.01, head: 20, density: 1000, efficiency: 70 }, expected: { power: "1,962 W" } },
  ],
};
