/**
 * Advanced Agriculture and Irrigation — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ------------------- Irrigation volume ----------------------------- */
export const irrigationCalculator: CalculatorDefinition = {
  slug: "irrigation-calculator",
  name: "Irrigation Volume & Schedule",
  description: "Estimate water volume per irrigation cycle from area, root depth and ET rate.",
  category: "agriculture",
  keywords: ["irrigation", "water", "schedule", "crop", "et", "evapotranspiration"],
  status: "live",
  part: 5,
  inputs: [
    { name: "area", label: "Irrigated area", type: "number", default: 1000, min: 0, step: "any", unit: "m²" },
    { name: "root_depth", label: "Effective root depth", type: "number", default: 0.3, min: 0.01, step: "any", unit: "m",
      help: "Vegetables: 0.3-0.6m. Lawns: 0.15m. Trees: 0.6-1.5m." },
    { name: "et_rate", label: "Daily evapotranspiration (ET)", type: "number", default: 5, min: 0, step: "any", unit: "mm/day",
      help: "Cool humid: 2-4mm. Hot arid: 8-12mm. Get from local ag extension." },
    { name: "interval_days", label: "Days between irrigations", type: "number", default: 3, min: 1, step: 1, unit: "days" },
    { name: "efficiency", label: "Irrigation efficiency", type: "number", default: 75, min: 1, max: 100, step: "any", unit: "%",
      help: "Drip: 90%. Sprinkler: 75%. Flood: 50%." },
  ],
  related: ["plant-spacing", "fertilizer-calculator", "soil-gravel-mulch"],
  calculate: (raw) => {
    const area = toNum(raw.area);
    const rootDepth = toNum(raw.root_depth);
    const et = toNum(raw.et_rate);
    const interval = toNum(raw.interval_days);
    const eff = toNum(raw.efficiency) / 100;
    if (area <= 0 || rootDepth <= 0 || interval <= 0 || eff <= 0) {
      return { rows: [{ key: "volume", label: "Volume per cycle", value: "—" }] };
    }
    // Total water needed = ET × interval × area, divided by efficiency
    const waterMm = et * interval;
    const grossWaterMm = waterMm / eff;
    const volumeM3 = (grossWaterMm / 1000) * area;
    const volumeLiters = volumeM3 * 1000;
    // Hold capacity (max water soil can hold per cycle = root depth × ~10% for loam)
    const holdCapacity = rootDepth * 0.10 * area; // m³
    return {
      rows: [
        { key: "volume", label: "Water per irrigation cycle", value: `${fmt(volumeM3, 2)} m³ (${fmt(volumeLiters, 0)} L)`, emphasis: "primary" },
        { key: "depth", label: "Net water depth applied", value: `${fmt(waterMm, 2)} mm` },
        { key: "gross_depth", label: "Gross depth (incl. losses)", value: `${fmt(grossWaterMm, 2)} mm` },
        { key: "monthly", label: "Monthly water need", value: `${fmt(volumeM3 * (30 / interval), 2)} m³` },
      ],
      sections: [{
        title: "Soil water holding",
        rows: [
          { key: "hold", label: "Estimated root-zone capacity", value: `${fmt(holdCapacity, 2)} m³` },
          { key: "fill_pct", label: "Cycle fills root zone by", value: `${fmt((volumeM3 / holdCapacity) * 100, 1)}%` },
        ],
      }],
      summary: "Volume = (ET × interval × area) ÷ efficiency. Drip systems can achieve 90% efficiency vs 50% for flood. ESTIMATE — local soil type and crop coefficient matter.",
    };
  },
  tests: [
    { name: "1000m², 0.3m root, 5mm/day ET, 3-day interval, 75% eff", inputs: { area: 1000, root_depth: 0.3, et_rate: 5, interval_days: 3, efficiency: 75 }, expected: { volume: "20 m³ (20,000 L)" } },
  ],
};

/* ------------------- Crop yield estimator -------------------------- */
export const cropYield: CalculatorDefinition = {
  slug: "crop-yield",
  name: "Crop Yield Estimator",
  description: "Estimate crop yield from plant density and per-plant yield.",
  category: "agriculture",
  keywords: ["crop", "yield", "harvest", "agriculture", "farm"],
  status: "live",
  part: 5,
  inputs: [
    { name: "area", label: "Field area", type: "number", default: 1, min: 0.001, step: "any", unit: "hectare" },
    { name: "density", label: "Plant density", type: "number", default: 50000, min: 1, step: 1, unit: "plants/ha" },
    { name: "per_plant", label: "Yield per plant", type: "number", default: 0.5, min: 0, step: "any", unit: "kg" },
    { name: "loss_pct", label: "Harvest + storage loss", type: "number", default: 10, min: 0, max: 100, step: "any", unit: "%" },
  ],
  related: ["plant-spacing", "irrigation-calculator", "fertilizer-calculator"],
  calculate: (raw) => {
    const area = toNum(raw.area);
    const density = toNum(raw.density);
    const perPlant = toNum(raw.per_plant);
    const loss = toNum(raw.loss_pct) / 100;
    if (area <= 0) {
      return { rows: [{ key: "yield", label: "Expected yield", value: "—" }] };
    }
    const totalPlants = density * area;
    const grossYield = totalPlants * perPlant;
    const netYield = grossYield * (1 - loss);
    const yieldPerHa = netYield / area;
    return {
      rows: [
        { key: "yield", label: "Net yield (after loss)", value: `${fmt(netYield, 2)} kg (${fmt(netYield / 1000, 4)} t)`, emphasis: "primary" },
        { key: "per_ha", label: "Yield per hectare", value: `${fmt(yieldPerHa, 0)} kg/ha (${fmt(yieldPerHa / 1000, 2)} t/ha)`, emphasis: "primary" },
        { key: "plants", label: "Total plants", value: String(totalPlants.toLocaleString()) },
        { key: "gross", label: "Gross yield (before loss)", value: `${fmt(grossYield, 2)} kg` },
      ],
      sections: [{
        title: "Reference yields (good conditions)",
        rows: [
          { key: "wheat", label: "Wheat", value: "3-5 t/ha" },
          { key: "corn", label: "Corn (maize)", value: "8-12 t/ha" },
          { key: "rice", label: "Rice (paddy)", value: "5-8 t/ha" },
          { key: "tomato", label: "Tomato", value: "60-80 t/ha" },
          { key: "potato", label: "Potato", value: "30-50 t/ha" },
        ],
      }],
      summary: "Yield = density × area × per-plant × (1 − loss). Real yields depend heavily on soil, climate, water, fertilizer and pest management.",
    };
  },
  tests: [
    { name: "1ha, 50000 plants, 0.5kg, 10% loss → 22500 kg", inputs: { area: 1, density: 50000, per_plant: 0.5, loss_pct: 10 }, expected: { yield: "22,500 kg (22.5 t)" } },
  ],
};

/* ------------------- Compost ratio --------------------------------- */
export const compostRatio: CalculatorDefinition = {
  slug: "compost-ratio",
  name: "Compost C:N Ratio Mixer",
  description: "Mix high-carbon and high-nitrogen materials to target a 30:1 C:N ratio.",
  category: "agriculture",
  keywords: ["compost", "carbon", "nitrogen", "ratio", "organic", "garden"],
  status: "live",
  part: 5,
  inputs: [
    { name: "material", label: "Material 1 (high carbon)", type: "select", default: "leaves",
      options: [
        { label: "Dry leaves (C:N 60:1)", value: "leaves" },
        { label: "Straw (C:N 75:1)", value: "straw" },
        { label: "Sawdust (C:N 500:1)", value: "sawdust" },
        { label: "Cardboard (C:N 350:1)", value: "cardboard" },
        { label: "Newspaper (C:N 175:1)", value: "newspaper" },
      ] },
    { name: "weight1", label: "Weight of material 1", type: "number", default: 5, min: 0.1, step: "any", unit: "kg" },
    { name: "material2", label: "Material 2 (high nitrogen)", type: "select", default: "grass",
      options: [
        { label: "Grass clippings (C:N 20:1)", value: "grass" },
        { label: "Food scraps (C:N 15:1)", value: "food" },
        { label: "Coffee grounds (C:N 20:1)", value: "coffee" },
        { label: "Manure (cow, C:N 20:1)", value: "manure" },
        { label: "Manure (poultry, C:N 10:1)", value: "poultry" },
      ] },
    { name: "weight2", label: "Weight of material 2", type: "number", default: 2, min: 0.1, step: "any", unit: "kg" },
  ],
  related: ["plant-spacing", "fertilizer-calculator", "soil-gravel-mulch"],
  calculate: (raw) => {
    const cnRatios: Record<string, number> = {
      leaves: 60, straw: 75, sawdust: 500, cardboard: 350, newspaper: 175,
      grass: 20, food: 15, coffee: 20, manure: 20, poultry: 10,
    };
    const m1 = String(raw.material ?? "leaves");
    const m2 = String(raw.material2 ?? "grass");
    const w1 = toNum(raw.weight1);
    const w2 = toNum(raw.weight2);
    if (w1 <= 0 || w2 <= 0) {
      return { rows: [{ key: "resulting_cn", label: "Resulting C:N", value: "—" }] };
    }
    // Roughly: weighted average of C:N ratios by mass (simplified)
    // Actually: total C = w1 × C1% + w2 × C2%, total N = w1 × N1% + w2 × N2%
    // C% = 50% for most materials, N% = 50/ratio
    const cPct = 0.5;
    const n1 = cPct / cnRatios[m1];
    const n2 = cPct / cnRatios[m2];
    const totalC = (w1 + w2) * cPct;
    const totalN = w1 * n1 + w2 * n2;
    if (totalN <= 0) {
      return { rows: [{ key: "resulting_cn", label: "Resulting C:N", value: "—" }] };
    }
    const resultingCN = totalC / totalN;
    const target = 30;
    const status = Math.abs(resultingCN - target) < 5 ? "Good" : resultingCN > target ? "Too carbon-rich (add nitrogen)" : "Too nitrogen-rich (add carbon)";
    return {
      rows: [
        { key: "resulting_cn", label: "Resulting C:N ratio", value: `${fmt(resultingCN, 1)} : 1`, emphasis: "primary" },
        { key: "target", label: "Target C:N", value: `${target} : 1` },
        { key: "status", label: "Status", value: status, emphasis: Math.abs(resultingCN - target) < 5 ? "success" : "warning" },
        { key: "total_weight", label: "Total weight", value: `${fmt(w1 + w2, 2)} kg` },
      ],
      summary: "Ideal compost C:N is 25-30:1. Higher = slow decomposition (add greens). Lower = ammonia smell (add browns).",
    };
  },
  tests: [
    { name: "5kg leaves (60:1) + 2kg grass (20:1)", inputs: { material: "leaves", weight1: 5, material2: "grass", weight2: 2 }, expected: { resulting_cn: "38.2 : 1" } },
  ],
};
