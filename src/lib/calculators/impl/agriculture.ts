/**
 * Agriculture and Gardening — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* --------------------- Plant spacing ------------------------------ */
export const plantSpacing: CalculatorDefinition = {
  slug: "plant-spacing",
  name: "Plant Spacing & Garden Yield Estimator",
  description: "Compute how many plants fit a garden bed and estimate yield.",
  category: "agriculture",
  keywords: ["plant", "spacing", "garden", "vegetable", "yield", "bed"],
  status: "live",
  part: 4,
  inputs: [
    { name: "bed_length", label: "Bed length", type: "number", default: 3, min: 0, step: "any", unit: "m" },
    { name: "bed_width", label: "Bed width", type: "number", default: 1.2, min: 0, step: "any", unit: "m" },
    { name: "spacing", label: "Plant spacing", type: "number", default: 30, min: 1, step: "any", unit: "cm" },
    { name: "row_spacing", label: "Row spacing (0 = same as plant)", type: "number", default: 0, min: 0, step: "any", unit: "cm" },
    { name: "yield_per_plant", label: "Yield per plant", type: "number", default: 2, min: 0, step: "any", unit: "kg" },
  ],
  related: ["soil-gravel-mulch", "fertilizer-calculator", "area-converter"],
  calculate: (raw) => {
    const bl = toNum(raw.bed_length);
    const bw = toNum(raw.bed_width);
    const sp = toNum(raw.spacing) / 100;
    const rs = toNum(raw.row_spacing) / 100;
    const ypp = toNum(raw.yield_per_plant);
    if (sp <= 0 || bl <= 0 || bw <= 0) {
      return { rows: [{ key: "plants", label: "Plants", value: "—" }] };
    }
    const rowSp = rs > 0 ? rs : sp;
    const plantsPerRow = Math.floor(bl / sp);
    const numRows = Math.floor(bw / rowSp);
    const totalPlants = plantsPerRow * numRows;
    const totalYield = totalPlants * ypp;
    const bedArea = bl * bw;
    const yieldPerM2 = bedArea > 0 ? totalYield / bedArea : 0;
    return {
      rows: [
        { key: "plants", label: "Total plants", value: `${totalPlants}`, emphasis: "primary" },
        { key: "rows", label: "Number of rows", value: `${numRows}` },
        { key: "per_row", label: "Plants per row", value: `${plantsPerRow}` },
        { key: "yield", label: "Estimated total yield", value: `${fmt(totalYield, 2)} kg`, emphasis: "primary" },
        { key: "yield_m2", label: "Yield per m²", value: `${fmt(yieldPerM2, 2)} kg/m²` },
      ],
      summary: `Plants = floor(length ÷ spacing) × floor(width ÷ row_spacing). Yield estimate is rough — actual yield varies with soil, weather, and care.`,
    };
  },
  tests: [
    { name: "3×1.2m bed, 30cm spacing → 4 rows × 10 = 40 plants", inputs: { bed_length: 3, bed_width: 1.2, spacing: 30, row_spacing: 0, yield_per_plant: 2 }, expected: { plants: "40" } },
  ],
};

/* -------------------- Fertilizer rate ----------------------------- */
export const fertilizerCalculator: CalculatorDefinition = {
  slug: "fertilizer-calculator",
  name: "Fertilizer Rate Calculator",
  description: "Compute fertilizer quantity from N-P-K ratio and target nitrogen application.",
  category: "agriculture",
  keywords: ["fertilizer", "npk", "nitrogen", "phosphorus", "potassium", "garden"],
  status: "live",
  part: 4,
  inputs: [
    { name: "area", label: "Area to fertilize", type: "number", default: 50, min: 0, step: "any", unit: "m²" },
    { name: "n_pct", label: "Nitrogen (N) %", type: "number", default: 10, min: 0, max: 100, step: "any", unit: "%" },
    { name: "p_pct", label: "Phosphorus (P₂O₅) %", type: "number", default: 10, min: 0, max: 100, step: "any", unit: "%" },
    { name: "k_pct", label: "Potassium (K₂O) %", type: "number", default: 10, min: 0, max: 100, step: "any", unit: "%" },
    { name: "target_n", label: "Target N application", type: "number", default: 20, min: 0, step: "any", unit: "g/m²",
      help: "Typical lawn: 10-20 g N/m² per year. Vegetables: 15-30 g N/m²." },
  ],
  related: ["plant-spacing", "soil-gravel-mulch", "area-converter"],
  calculate: (raw) => {
    const area = toNum(raw.area);
    const nPct = toNum(raw.n_pct) / 100;
    const pPct = toNum(raw.p_pct) / 100;
    const kPct = toNum(raw.k_pct) / 100;
    const targetN = toNum(raw.target_n);
    if (nPct <= 0) {
      return { rows: [{ key: "fertilizer", label: "Fertilizer needed", value: "—" }] };
    }
    // g of fertilizer per m² to deliver targetN g N/m²
    const fertPerM2 = targetN / nPct;
    const totalFert = fertPerM2 * area;
    const totalN = targetN * area;
    const totalP = fertPerM2 * pPct * area;
    const totalK = fertPerM2 * kPct * area;
    return {
      rows: [
        { key: "fertilizer", label: "Fertilizer needed", value: `${fmt(totalFert / 1000, 2)} kg (${fmt(totalFert, 0)} g)`, emphasis: "primary" },
        { key: "per_m2", label: "Per m²", value: `${fmt(fertPerM2, 0)} g/m²` },
        { key: "n_applied", label: "N applied", value: `${fmt(totalN / 1000, 3)} kg` },
        { key: "p_applied", label: "P₂O₅ applied", value: `${fmt(totalP / 1000, 3)} kg` },
        { key: "k_applied", label: "K₂O applied", value: `${fmt(totalK / 1000, 3)} kg` },
      ],
      summary: "Fertilizer needed = (target N × area) ÷ N% in fertilizer. Always check the bag's N-P-K label and apply at recommended rates — over-fertilizing damages plants and pollutes runoff.",
    };
  },
  tests: [
    { name: "50m², 10-10-10 fertilizer, 20 g N/m²", inputs: { area: 50, n_pct: 10, p_pct: 10, k_pct: 10, target_n: 20 }, expected: { fertilizer: "10 kg (10,000 g)" } },
  ],
};
