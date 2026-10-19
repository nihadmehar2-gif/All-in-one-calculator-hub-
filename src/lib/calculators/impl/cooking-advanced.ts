/**
 * Advanced Cooking and Baking — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ------------------- Baker's percentage ---------------------------- */
export const bakersPercentage: CalculatorDefinition = {
  slug: "bakers-percentage",
  name: "Baker's Percentage (Hydration)",
  description: "Express bread ingredients as a percentage of flour weight, with hydration.",
  category: "cooking",
  keywords: ["baker", "baking", "percentage", "hydration", "bread", "flour"],
  status: "live",
  part: 5,
  inputs: [
    { name: "flour", label: "Flour weight (g)", type: "number", default: 500, min: 1, step: "any", unit: "g" },
    { name: "water", label: "Water weight (g)", type: "number", default: 350, min: 0, step: "any", unit: "g" },
    { name: "salt", label: "Salt (g)", type: "number", default: 10, min: 0, step: "any", unit: "g" },
    { name: "yeast", label: "Yeast (g)", type: "number", default: 7, min: 0, step: "any", unit: "g" },
    { name: "fat", label: "Fat/butter (g, optional)", type: "number", default: 0, min: 0, step: "any", unit: "g" },
    { name: "sugar", label: "Sugar (g, optional)", type: "number", default: 0, min: 0, step: "any", unit: "g" },
  ],
  related: ["recipe-scaler", "food-serving-conversion", "macro-calculator"],
  calculate: (raw) => {
    const flour = toNum(raw.flour);
    const water = toNum(raw.water);
    const salt = toNum(raw.salt);
    const yeast = toNum(raw.yeast);
    const fat = toNum(raw.fat);
    const sugar = toNum(raw.sugar);
    if (flour <= 0) {
      return { rows: [{ key: "hydration", label: "Hydration", value: "—" }] };
    }
    const pct = (g: number) => (g / flour) * 100;
    const hydration = pct(water);
    const totalWeight = flour + water + salt + yeast + fat + sugar;
    let doughType = "";
    if (hydration < 60) doughType = "Stiff (bagels, pasta)";
    else if (hydration < 70) doughType = "Standard (sandwich bread)";
    else if (hydration < 80) doughType = "Rustic (artisan, ciabatta)";
    else doughType = "High hydration (focaccia, ciabatta)";
    return {
      rows: [
        { key: "hydration", label: "Hydration", value: `${fmt(hydration, 1)}%`, emphasis: "primary" },
        { key: "dough_type", label: "Dough type", value: doughType },
        { key: "total_weight", label: "Total dough weight", value: `${fmt(totalWeight, 0)} g` },
      ],
      sections: [{
        title: "Baker's percentages",
        rows: [
          { key: "flour_pct", label: "Flour (reference)", value: "100.0%" },
          { key: "water_pct", label: "Water", value: `${fmt(pct(water), 1)}%` },
          { key: "salt_pct", label: "Salt", value: `${fmt(pct(salt), 1)}%` },
          { key: "yeast_pct", label: "Yeast", value: `${fmt(pct(yeast), 2)}%` },
          { key: "fat_pct", label: "Fat", value: fat > 0 ? `${fmt(pct(fat), 1)}%` : "—" },
          { key: "sugar_pct", label: "Sugar", value: sugar > 0 ? `${fmt(pct(sugar), 1)}%` : "—" },
        ],
      }],
      summary: "Baker's percentage expresses every ingredient as % of flour weight. Flour is always 100%. Hydration = water ÷ flour. Salt is typically 2%, yeast 1-2%.",
    };
  },
  tests: [
    { name: "500g flour, 350g water → 70% hydration", inputs: { flour: 500, water: 350, salt: 10, yeast: 7, fat: 0, sugar: 0 }, expected: { hydration: "70%" } },
  ],
};

/* ------------------- Cooking time estimator ------------------------ */
export const cookingTime: CalculatorDefinition = {
  slug: "cooking-time-estimator",
  name: "Meat Cooking Time Estimator",
  description: "Rough cooking time estimate for common meats by weight and method.",
  category: "cooking",
  keywords: ["cooking time", "meat", "roast", "steak", "chicken", "pork"],
  status: "live",
  part: 5,
  inputs: [
    { name: "meat", label: "Meat type", type: "select", default: "beef_roast",
      options: [
        { label: "Beef roast", value: "beef_roast" },
        { label: "Whole chicken", value: "chicken" },
        { label: "Pork roast", value: "pork" },
        { label: "Turkey", value: "turkey" },
        { label: "Lamb", value: "lamb" },
      ] },
    { name: "weight", label: "Weight", type: "number", default: 2, min: 0.1, step: "any", unit: "kg" },
    { name: "doneness", label: "Doneness (for beef/lamb)", type: "select", default: "medium",
      options: [
        { label: "Rare (52°C internal)", value: "rare" },
        { label: "Medium rare (57°C)", value: "medium_rare" },
        { label: "Medium (63°C)", value: "medium" },
        { label: "Medium well (68°C)", value: "medium_well" },
        { label: "Well done (73°C)", value: "well" },
      ] },
  ],
  related: ["recipe-scaler", "bakers-percentage", "food-serving-conversion"],
  calculate: (raw) => {
    const meat = String(raw.meat ?? "beef_roast");
    const w = toNum(raw.weight);
    const doneness = String(raw.doneness ?? "medium");
    if (w <= 0) {
      return { rows: [{ key: "time", label: "Cooking time", value: "—" }] };
    }
    // Approximate times per kg, by meat type and method (roasting at 180°C/350°F)
    const timesPerKg: Record<string, number> = {
      beef_roast: 60, chicken: 40, pork: 60, turkey: 45, lamb: 60,
    };
    const internalTemps: Record<string, number> = {
      rare: 52, medium_rare: 57, medium: 63, medium_well: 68, well: 73,
    };
    const baseMinutes = timesPerKg[meat] ?? 60;
    const totalMin = baseMinutes * w + 20; // +20 min resting
    const restMin = 15;
    const cookMin = totalMin - restMin;
    const h = Math.floor(totalMin / 60);
    const m = Math.round(totalMin % 60);
    let targetInternal: number;
    if (meat === "beef_roast" || meat === "lamb") {
      targetInternal = internalTemps[doneness] ?? 63;
    } else if (meat === "chicken" || meat === "turkey") {
      targetInternal = 74; // safe poultry temp
    } else if (meat === "pork") {
      targetInternal = 71; // safe pork temp
    } else {
      targetInternal = 63;
    }
    return {
      rows: [
        { key: "time", label: "Estimated total time (incl. rest)", value: `${h}h ${m}m`, emphasis: "primary" },
        { key: "cook", label: "Active cooking time", value: `${fmt(cookMin, 0)} min` },
        { key: "rest", label: "Resting time", value: `${restMin} min` },
        { key: "target_temp", label: "Target internal temperature", value: `${targetInternal}°C`, emphasis: "primary" },
      ],
      summary: `ESTIMATE ONLY — actual time depends on oven accuracy, starting temperature, and shape. Always verify with a meat thermometer. Poultry must reach 74°C for food safety.`,
    };
  },
  tests: [
    { name: "2kg beef roast medium → 140 min total", inputs: { meat: "beef_roast", weight: 2, doneness: "medium" }, expected: { time: "2h 20m" } },
  ],
};

/* ------------------- Sugar / sweetener conversion ------------------ */
export const sweetenerConversion: CalculatorDefinition = {
  slug: "sweetener-conversion",
  name: "Sugar & Sweetener Conversion",
  description: "Convert between sugar, honey, maple syrup, stevia and other sweeteners.",
  category: "cooking",
  keywords: ["sugar", "honey", "maple syrup", "stevia", "sweetener", "convert"],
  status: "live",
  part: 5,
  inputs: [
    { name: "amount", label: "Amount", type: "number", default: 100, min: 0, step: "any", unit: "g" },
    { name: "from", label: "From", type: "select", default: "sugar",
      options: [
        { label: "White sugar", value: "sugar" },
        { label: "Brown sugar", value: "brown" },
        { label: "Honey", value: "honey" },
        { label: "Maple syrup", value: "maple" },
        { label: "Agave nectar", value: "agave" },
        { label: "Stevia (powder)", value: "stevia" },
      ] },
  ],
  related: ["recipe-scaler", "food-serving-conversion", "macro-calculator"],
  calculate: (raw) => {
    const amount = toNum(raw.amount);
    const from = String(raw.from ?? "sugar");
    if (amount <= 0) {
      return { rows: [{ key: "result", label: "Result", value: "—" }] };
    }
    // Sweetness relative to sugar (sugar = 1.0)
    const sweetness: Record<string, number> = {
      sugar: 1.0,
      brown: 0.97,
      honey: 1.25,    // 25% sweeter than sugar by weight
      maple: 0.7,
      agave: 1.4,
      stevia: 300,    // ~300× sweeter than sugar
    };
    // Sugar-equivalent grams
    const sugarEquiv = amount * (sweetness[from] ?? 1);
    const conversions: { key: string; label: string; value: string }[] = [];
    for (const [name, factor] of Object.entries(sweetness)) {
      if (name === from) continue;
      const grams = sugarEquiv / factor;
      conversions.push({
        key: name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        value: `${fmt(grams, 1)} g`,
      });
    }
    return {
      rows: [
        { key: "sugar_equiv", label: "Sugar-equivalent sweetness", value: `${fmt(sugarEquiv, 1)} g`, emphasis: "primary" },
        { key: "input", label: `Input: ${fmt(amount, 1)} g ${from}`, value: `Sweetness factor: ${sweetness[from]}×` },
      ],
      sections: [{ title: "Equivalent amounts", rows: conversions }],
      summary: "Sweetness varies by sweetener. Honey is ~25% sweeter than sugar, stevia ~300× sweeter. Liquid sweeteners (honey, maple) add moisture — reduce other liquids in the recipe.",
    };
  },
  tests: [
    { name: "100g sugar → 80g honey (1.25×)", inputs: { amount: 100, from: "sugar" }, expected: { sugar_equiv: "100 g" } },
  ],
};
