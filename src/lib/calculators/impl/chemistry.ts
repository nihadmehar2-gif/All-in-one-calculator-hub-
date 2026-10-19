/**
 * Chemistry — implemented calculators.
 * Common periodic-table atomic masses (IUPAC 2023 standard atomic weights).
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

// Atomic masses in g/mol (IUPAC 2023 standard atomic weights, rounded to 4 dp for common elements)
const ATOMIC_MASS: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
  Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
  Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.63,
  As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41,
  In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33,
  W: 183.84, Pt: 195.08, Au: 196.97, Hg: 200.59, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222,
  U: 238.03,
};

// Parse a simple chemical formula like "H2O", "C6H12O6", "Ca(OH)2", "(NH4)2SO4"
// Returns a map of element → count
function parseFormula(formula: string): Record<string, number> {
  const result: Record<string, number> = {};
  const stack: Record<string, number>[] = [{}];
  let i = 0;
  while (i < formula.length) {
    const c = formula[i];
    if (c === "(") {
      stack.push({});
      i++;
    } else if (c === ")") {
      i++;
      // Read multiplier
      let numStr = "";
      while (i < formula.length && /[0-9]/.test(formula[i])) { numStr += formula[i]; i++; }
      const mult = numStr ? parseInt(numStr, 10) : 1;
      const top = stack.pop()!;
      const target = stack[stack.length - 1];
      for (const [el, n] of Object.entries(top)) {
        target[el] = (target[el] ?? 0) + n * mult;
      }
    } else if (/[A-Z]/.test(c)) {
      let el = c;
      i++;
      while (i < formula.length && /[a-z]/.test(formula[i])) { el += formula[i]; i++; }
      let numStr = "";
      while (i < formula.length && /[0-9]/.test(formula[i])) { numStr += formula[i]; i++; }
      const n = numStr ? parseInt(numStr, 10) : 1;
      const target = stack[stack.length - 1];
      target[el] = (target[el] ?? 0) + n;
    } else {
      i++; // skip whitespace or unknown
    }
  }
  const top = stack.pop()!;
  for (const [el, n] of Object.entries(top)) {
    result[el] = (result[el] ?? 0) + n;
  }
  return result;
}

export const molarMass: CalculatorDefinition = {
  slug: "molar-mass",
  name: "Molar Mass from Formula",
  description: "Compute molar mass (g/mol) of a chemical compound from its formula.",
  category: "chemistry",
  keywords: ["molar mass", "molecular weight", "formula", "chemistry", "mole", "g/mol"],
  status: "live",
  part: 4,
  inputs: [
    { name: "formula", label: "Chemical formula", type: "text", default: "H2O",
      placeholder: "e.g. H2O, C6H12O6, Ca(OH)2, (NH4)2SO4" },
  ],
  related: ["molarity", "dilution"],
  calculate: (raw) => {
    const formula = String(raw.formula ?? "").trim();
    if (!formula) {
      return { rows: [{ key: "molar_mass", label: "Molar mass", value: "—" }] };
    }
    try {
      const composition = parseFormula(formula);
      const rows: { key: string; label: string; value: string }[] = [];
      let total = 0;
      let unknownElements: string[] = [];
      for (const [el, count] of Object.entries(composition)) {
        const mass = ATOMIC_MASS[el];
        if (mass === undefined) {
          unknownElements.push(el);
          rows.push({ key: el, label: `${el} (×${count})`, value: "unknown element" });
        } else {
          const contribution = mass * count;
          total += contribution;
          rows.push({ key: el, label: `${el} (×${count})`, value: `${fmt(mass, 4)} × ${count} = ${fmt(contribution, 4)} g/mol` });
        }
      }
      if (unknownElements.length > 0) {
        return {
          rows: [{ key: "molar_mass", label: "Molar mass", value: "—", hint: `Unknown elements: ${unknownElements.join(", ")}. Only common elements are supported.`, emphasis: "warning" }],
        };
      }
      return {
        rows: [
          { key: "molar_mass", label: `Molar mass of ${formula}`, value: `${fmt(total, 4)} g/mol`, emphasis: "primary" },
        ],
        sections: [
          { title: "Element breakdown", rows },
        ],
        summary: "Molar mass = Σ (atomic mass × atom count). Uses IUPAC 2023 standard atomic weights. Supports common elements and nested parentheses like Ca(OH)2 and (NH4)2SO4.",
      };
    } catch (e) {
      return { rows: [{ key: "molar_mass", label: "Molar mass", value: "—", hint: (e as Error).message }] };
    }
  },
  tests: [
    { name: "H2O = 18.015 g/mol", inputs: { formula: "H2O" }, expected: { molar_mass: "18.015 g/mol" }, tolerance: 0.01 },
    { name: "C6H12O6 (glucose) ≈ 180.156 g/mol", inputs: { formula: "C6H12O6" }, expected: { molar_mass: "180.156 g/mol" }, tolerance: 0.01 },
    { name: "Ca(OH)2 ≈ 74.093 g/mol", inputs: { formula: "Ca(OH)2" }, expected: { molar_mass: "74.093 g/mol" }, tolerance: 0.01 },
    { name: "NaCl ≈ 58.44 g/mol", inputs: { formula: "NaCl" }, expected: { molar_mass: "58.44 g/mol" }, tolerance: 0.01 },
  ],
};

export const molarity: CalculatorDefinition = {
  slug: "molarity",
  name: "Molarity Calculator",
  description: "Compute molarity (mol/L) from solute mass and formula, or solve for mass needed.",
  category: "chemistry",
  keywords: ["molarity", "concentration", "moles", "solution", "mol/L", "M"],
  status: "live",
  part: 4,
  inputs: [
    { name: "solve", label: "Solve for", type: "select", default: "molarity",
      options: [
        { label: "Molarity (given mass + volume + formula)", value: "molarity" },
        { label: "Mass needed (given molarity + volume + formula)", value: "mass" },
      ] },
    { name: "formula", label: "Solute formula", type: "text", default: "NaCl",
      placeholder: "e.g. NaCl, H2SO4" },
    { name: "mass", label: "Mass of solute (g)", type: "number", default: 5.844, min: 0, step: "any", unit: "g" },
    { name: "volume", label: "Solution volume", type: "number", default: 1, min: 0, step: "any", unit: "L" },
    { name: "target_molarity", label: "Target molarity (for mass mode)", type: "number", default: 0.1, min: 0, step: "any", unit: "mol/L" },
  ],
  related: ["molar-mass", "dilution"],
  calculate: (raw) => {
    const formula = String(raw.formula ?? "").trim();
    if (!formula) return { rows: [{ key: "result", label: "Result", value: "—" }] };
    let mm: number;
    try {
      const comp = parseFormula(formula);
      mm = 0;
      for (const [el, n] of Object.entries(comp)) {
        const m = ATOMIC_MASS[el];
        if (m === undefined) return { rows: [{ key: "result", label: "Result", value: "—", hint: `Unknown element: ${el}` }] };
        mm += m * n;
      }
    } catch (e) {
      return { rows: [{ key: "result", label: "Result", value: "—" }] };
    }
    const solve = String(raw.solve ?? "molarity");
    if (solve === "molarity") {
      const mass = toNum(raw.mass);
      const vol = toNum(raw.volume);
      if (vol === 0) return { rows: [{ key: "result", label: "Molarity", value: "—" }] };
      const moles = mass / mm;
      const molarity = moles / vol;
      return {
        rows: [
          { key: "result", label: `Molarity of ${formula}`, value: `${fmt(molarity, 6)} mol/L`, emphasis: "primary" },
          { key: "moles", label: "Moles of solute", value: `${fmt(moles, 6)} mol` },
        ],
        sections: [{
          title: "Inputs",
          rows: [
            { key: "mm", label: "Molar mass", value: `${fmt(mm, 4)} g/mol` },
            { key: "mass", label: "Mass", value: `${fmt(mass, 4)} g` },
            { key: "vol", label: "Volume", value: `${fmt(vol, 4)} L` },
          ],
        }],
        summary: "Molarity (M) = moles of solute ÷ liters of solution. Moles = mass ÷ molar mass.",
      };
    }
    // solve for mass
    const molarity = toNum(raw.target_molarity);
    const vol = toNum(raw.volume);
    const moles = molarity * vol;
    const mass = moles * mm;
    return {
      rows: [
        { key: "result", label: `Mass of ${formula} needed`, value: `${fmt(mass, 4)} g`, emphasis: "primary" },
        { key: "moles", label: "Moles of solute", value: `${fmt(moles, 6)} mol` },
      ],
      sections: [{
        title: "Inputs",
        rows: [
          { key: "mm", label: "Molar mass", value: `${fmt(mm, 4)} g/mol` },
          { key: "target", label: "Target molarity", value: `${fmt(molarity, 4)} mol/L` },
          { key: "vol", label: "Volume", value: `${fmt(vol, 4)} L` },
        ],
      }],
      summary: "Mass = molarity × volume × molar mass.",
    };
  },
  tests: [
    { name: "5.844g NaCl in 1L → 0.1 M", inputs: { solve: "molarity", formula: "NaCl", mass: 5.844, volume: 1, target_molarity: 0.1 }, expected: { result: "0.1 mol/L" }, tolerance: 0.001 },
    { name: "0.1M NaCl, 1L → 5.844g", inputs: { solve: "mass", formula: "NaCl", mass: 0, volume: 1, target_molarity: 0.1 }, expected: { result: "5.844 g" }, tolerance: 0.01 },
  ],
};

export const dilution: CalculatorDefinition = {
  slug: "dilution",
  name: "Dilution Calculator (C₁V₁ = C₂V₂)",
  description: "Compute the volume of stock solution needed to prepare a target dilution.",
  category: "chemistry",
  keywords: ["dilution", "c1v1", "concentration", "stock", "serial", "dilute"],
  status: "live",
  part: 4,
  inputs: [
    { name: "c1", label: "Stock concentration (C₁)", type: "number", default: 1, min: 0, step: "any", unit: "M" },
    { name: "c2", label: "Target concentration (C₂)", type: "number", default: 0.1, min: 0, step: "any", unit: "M" },
    { name: "v2", label: "Target volume (V₂)", type: "number", default: 1, min: 0, step: "any", unit: "L" },
  ],
  related: ["molarity", "molar-mass"],
  calculate: (raw) => {
    const c1 = toNum(raw.c1);
    const c2 = toNum(raw.c2);
    const v2 = toNum(raw.v2);
    if (c1 === 0 || c2 > c1) {
      return { rows: [{ key: "v1", label: "V₁ (stock volume)", value: "—", hint: "C₁ must be ≥ C₂ and > 0.", emphasis: "warning" }] };
    }
    const v1 = (c2 * v2) / c1;
    const solvent = v2 - v1;
    const dilutionFactor = c1 / c2;
    return {
      rows: [
        { key: "v1", label: "V₁ (stock volume to use)", value: `${fmt(v1, 4)} L`, emphasis: "primary" },
        { key: "solvent", label: "Solvent to add", value: `${fmt(solvent, 4)} L`, emphasis: "primary" },
        { key: "factor", label: "Dilution factor (C₁/C₂)", value: `${fmt(dilutionFactor, 2)}×` },
      ],
      summary: "C₁V₁ = C₂V₂ → V₁ = C₂V₂ / C₁. The dilution factor C₁:C₂ tells you the ratio of stock to final.",
    };
  },
  tests: [
    { name: "1M → 0.1M, 1L target", inputs: { c1: 1, c2: 0.1, v2: 1 }, expected: { v1: "0.1 L" } },
    { name: "Same → solvent 0.9 L", inputs: { c1: 1, c2: 0.1, v2: 1 }, expected: { solvent: "0.9 L" } },
  ],
};
