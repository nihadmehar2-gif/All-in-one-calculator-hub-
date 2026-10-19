/**
 * Environment and Sustainability — additional calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* ------------------- Water footprint ------------------------------- */
export const waterFootprint: CalculatorDefinition = {
  slug: "water-footprint",
  name: "Household Water Footprint",
  description: "Estimate annual direct and indirect water use from common household activities.",
  category: "environment",
  keywords: ["water", "footprint", "consumption", "conservation", "sustainability"],
  status: "live",
  part: 5,
  inputs: [
    { name: "showers_per_week", label: "Showers per week", type: "number", default: 7, min: 0, step: 1 },
    { name: "shower_min", label: "Average shower length (min)", type: "number", default: 8, min: 1, step: "any" },
    { name: "flushes_per_day", label: "Toilet flushes per day (household)", type: "number", default: 5, min: 0, step: "any" },
    { name: "laundry_loads_week", label: "Laundry loads per week", type: "number", default: 3, min: 0, step: "any" },
    { name: "dishwasher_loads_week", label: "Dishwasher loads per week", type: "number", default: 5, min: 0, step: "any" },
    { name: "diet_liters", label: "Daily diet water (liters)", type: "number", default: 3500, min: 0, step: "any",
      help: "Meat-heavy ~5000L/day. Vegetarian ~2500L/day. Vegan ~2000L/day." },
  ],
  related: ["carbon-footprint", "electricity-bill", "solar-panel"],
  calculate: (raw) => {
    const showers = toNum(raw.showers_per_week);
    const showerMin = toNum(raw.shower_min);
    const flushes = toNum(raw.flushes_per_day);
    const laundry = toNum(raw.laundry_loads_week);
    const dishwasher = toNum(raw.dishwasher_loads_week);
    const diet = toNum(raw.diet_liters);
    // Standard flow rates
    const showerL = 9 * showerMin; // 9 L/min standard showerhead
    const flushL = 6; // 6 L/flush (modern low-flow)
    const laundryL = 60; // ~60 L/load (HE washer)
    const dishwasherL = 15;
    const showerAnnual = showers * showerL * 52;
    const flushAnnual = flushes * flushL * 365;
    const laundryAnnual = laundry * laundryL * 52;
    const dishwasherAnnual = dishwasher * dishwasherL * 52;
    const dietAnnual = diet * 365;
    const directAnnual = showerAnnual + flushAnnual + laundryAnnual + dishwasherAnnual;
    const totalAnnual = directAnnual + dietAnnual;
    return {
      rows: [
        { key: "total", label: "Total annual water footprint", value: `${fmt(totalAnnual / 1000, 1)} m³ (${fmt(totalAnnual, 0)} L)`, emphasis: "primary" },
        { key: "per_day", label: "Average per day", value: `${fmt(totalAnnual / 365, 0)} L/day`, emphasis: "primary" },
        { key: "direct", label: "Direct (household use)", value: `${fmt(directAnnual / 1000, 1)} m³` },
        { key: "indirect", label: "Indirect (diet)", value: `${fmt(dietAnnual / 1000, 1)} m³` },
      ],
      sections: [{
        title: "Breakdown",
        rows: [
          { key: "showers_a", label: "Showers (annual)", value: `${fmt(showerAnnual, 0)} L` },
          { key: "toilets_a", label: "Toilet flushes", value: `${fmt(flushAnnual, 0)} L` },
          { key: "laundry_a", label: "Laundry", value: `${fmt(laundryAnnual, 0)} L` },
          { key: "dishwasher_a", label: "Dishwasher", value: `${fmt(dishwasherAnnual, 0)} L` },
          { key: "diet_a", label: "Diet (indirect)", value: `${fmt(dietAnnual, 0)} L` },
        ],
      }],
      summary: "ESTIMATE — global average is ~3,800 L/day per person. Diet typically dominates because meat and dairy require huge water inputs. Cutting showers helps but eating less meat helps more.",
    };
  },
  tests: [
    { name: "Default sample", inputs: { showers_per_week: 7, shower_min: 8, flushes_per_day: 5, laundry_loads_week: 3, dishwasher_loads_week: 5, diet_liters: 3500 }, expected: { total: "1,327.9 m³ (1,327,918 L)" } },
  ],
};

/* ------------------- Tree planting carbon offset ------------------- */
export const treeCarbonOffset: CalculatorDefinition = {
  slug: "tree-carbon-offset",
  name: "Tree Planting Carbon Offset",
  description: "Estimate how many trees to plant to offset a known CO₂ output.",
  category: "environment",
  keywords: ["tree", "carbon", "offset", "co2", "planting", "sequestration"],
  status: "live",
  part: 5,
  inputs: [
    { name: "co2_kg_year", label: "Annual CO₂ to offset", type: "number", default: 5000, min: 0, step: "any", unit: "kg/yr" },
    { name: "tree_type", label: "Tree type", type: "select", default: "mixed",
      options: [
        { label: "Mixed broadleaf (22 kg/yr)", value: "mixed" },
        { label: "Pine (15 kg/yr)", value: "pine" },
        { label: "Oak (25 kg/yr)", value: "oak" },
        { label: "Eucalyptus (30 kg/yr)", value: "eucalyptus" },
        { label: "Tropical (35 kg/yr)", value: "tropical" },
      ] },
    { name: "years", label: "Years to maturity", type: "number", default: 30, min: 1, step: 1, unit: "yrs" },
  ],
  related: ["carbon-footprint", "solar-panel", "electricity-bill"],
  calculate: (raw) => {
    const co2 = toNum(raw.co2_kg_year);
    const type = String(raw.tree_type ?? "mixed");
    const years = toNum(raw.years);
    const rates: Record<string, number> = {
      mixed: 22, pine: 15, oak: 25, eucalyptus: 30, tropical: 35,
    };
    const perTreePerYear = rates[type] ?? 22;
    if (perTreePerYear <= 0) {
      return { rows: [{ key: "trees", label: "Trees needed", value: "—" }] };
    }
    const treesForAnnual = Math.ceil(co2 / perTreePerYear);
    const lifetimePerTree = perTreePerYear * years;
    const treesForLifetime = Math.ceil((co2 * years) / lifetimePerTree);
    return {
      rows: [
        { key: "trees_annual", label: "Trees to offset annual CO₂", value: `${treesForAnnual}`, emphasis: "primary" },
        { key: "trees_lifetime", label: "Trees for lifetime offset", value: `${treesForLifetime}`, emphasis: "primary" },
        { key: "per_tree", label: "CO₂ absorbed per tree per year", value: `${perTreePerYear} kg` },
        { key: "lifetime", label: `Per tree over ${years} years`, value: `${fmt(lifetimePerTree, 0)} kg` },
      ],
      sections: [{
        title: "Reality check",
        rows: [
          { key: "land", label: "Planting density", value: "~400-1100 trees/hectare depending on species" },
          { key: "maturity", label: "Carbon uptake", value: "Peaks at 10-30 years, slows after" },
          { key: "alternative", label: "Reduce emissions", value: "Often cheaper & faster than offsetting" },
        ],
      }],
      summary: "Estimates use mature-tree uptake rates; saplings absorb much less. Tree planting is a long-term offset, not an immediate fix. Reducing emissions at source is more reliable.",
    };
  },
  tests: [
    { name: "5000 kg CO₂ with mixed broadleaf (22 kg/yr)", inputs: { co2_kg_year: 5000, tree_type: "mixed", years: 30 }, expected: { trees_annual: "228" } },
  ],
};

/* ------------------- EV fuel savings ------------------------------- */
export const evFuelSavings: CalculatorDefinition = {
  slug: "ev-fuel-savings",
  name: "EV vs Gas Fuel Savings",
  description: "Compare annual fuel cost between an electric vehicle and a gas vehicle.",
  category: "environment",
  keywords: ["ev", "electric vehicle", "fuel savings", "comparison", "cost"],
  status: "live",
  part: 5,
  inputs: [
    { name: "annual_km", label: "Annual kilometers driven", type: "number", default: 15000, min: 0, step: "any", unit: "km" },
    { name: "gas_economy", label: "Gas vehicle fuel economy", type: "number", default: 8, min: 0, step: "any", unit: "L/100km" },
    { name: "gas_price", label: "Gasoline price", type: "number", default: 1.5, min: 0, step: "any", unit: "$/L" },
    { name: "ev_economy", label: "EV efficiency", type: "number", default: 18, min: 0, step: "any", unit: "kWh/100km" },
    { name: "elec_price", label: "Electricity price", type: "number", default: 0.15, min: 0, step: "any", unit: "$/kWh" },
  ],
  related: ["fuel-economy", "electricity-bill", "carbon-footprint"],
  calculate: (raw) => {
    const km = toNum(raw.annual_km);
    const gasEcon = toNum(raw.gas_economy);
    const gasPrice = toNum(raw.gas_price);
    const evEcon = toNum(raw.ev_economy);
    const elecPrice = toNum(raw.elec_price);
    const gasLiters = (km * gasEcon) / 100;
    const gasCost = gasLiters * gasPrice;
    const evKwh = (km * evEcon) / 100;
    const evCost = evKwh * elecPrice;
    const savings = gasCost - evCost;
    const pct = gasCost > 0 ? (savings / gasCost) * 100 : 0;
    // CO2 comparison: gas 2.31 kg/L, grid 0.4 kg/kWh typical
    const gasCO2 = gasLiters * 2.31;
    const evCO2 = evKwh * 0.4;
    return {
      rows: [
        { key: "gas_cost", label: "Annual gas vehicle cost", value: fmtUSD(gasCost) },
        { key: "ev_cost", label: "Annual EV cost", value: fmtUSD(evCost), emphasis: "primary" },
        { key: "savings", label: "Annual savings", value: fmtUSD(savings), emphasis: "primary" },
        { key: "pct", label: "Savings %", value: `${fmt(pct, 1)}%` },
      ],
      sections: [{
        title: "CO₂ emissions",
        rows: [
          { key: "gas_co2", label: "Gas vehicle", value: `${fmt(gasCO2, 0)} kg/yr` },
          { key: "ev_co2", label: "EV (grid avg)", value: `${fmt(evCO2, 0)} kg/yr` },
          { key: "co2_savings", label: "CO₂ saved", value: `${fmt(gasCO2 - evCO2, 0)} kg/yr` },
        ],
      }],
      summary: "Savings depend on local fuel vs electricity prices. EVs are cheapest to run in regions with cheap night-time electricity. EV battery manufacturing has its own footprint — net benefit usually appears after 2-3 years of driving.",
    };
  },
  tests: [
    { name: "15k km, 8L/100km @ $1.5 vs 18kWh/100km @ $0.15", inputs: { annual_km: 15000, gas_economy: 8, gas_price: 1.5, ev_economy: 18, elec_price: 0.15 }, expected: { savings: "$1,395.00" } },
  ],
};
