/**
 * Cooking, Food and Nutrition — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ----------------------- Recipe scaler ---------------------------- */
export const recipeScaler: CalculatorDefinition = {
  slug: "recipe-scaler",
  name: "Recipe Scaler",
  description: "Scale a recipe up or down by ratio or target servings.",
  category: "cooking",
  keywords: ["recipe", "scale", "servings", "double", "half", "cooking"],
  status: "live",
  part: 4,
  inputs: [
    { name: "original_servings", label: "Original recipe servings", type: "number", default: 4, min: 1, step: 1 },
    { name: "target_servings", label: "Target servings", type: "number", default: 6, min: 1, step: 1 },
    { name: "ingredients", label: "Ingredients (one per line: <amount> <unit> <name>)", type: "textarea",
      default: "200 g flour\n100 g sugar\n2 eggs\n250 ml milk\n1 tsp vanilla",
      placeholder: "amount unit name\ne.g. 200 g flour" },
  ],
  related: ["food-serving-conversion", "volume-converter", "mass-converter"],
  calculate: (raw) => {
    const orig = Math.max(1, toNum(raw.original_servings));
    const target = Math.max(1, toNum(raw.target_servings));
    const ratio = target / orig;
    const text = String(raw.ingredients ?? "");
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const scaled = lines.map((line) => {
      const m = line.match(/^([\d.\s\/]+)\s*(\S*)\s+(.+)$/);
      if (!m) return { original: line, scaled: line };
      const amountStr = m[1].trim();
      const unit = m[2];
      const name = m[3];
      const amount = parseAmount(amountStr);
      const newAmount = amount * ratio;
      return {
        original: `${formatAmount(amount)} ${unit} ${name}`,
        scaled: `${formatAmount(newAmount)} ${unit} ${name}`,
      };
    });
    return {
      rows: [
        { key: "ratio", label: "Scaling factor", value: `${fmt(ratio, 4)}×`, emphasis: "primary" },
        { key: "from_to", label: "From / to", value: `${orig} → ${target} servings` },
      ],
      sections: [{
        title: "Scaled ingredients",
        rows: scaled.map((s, i) => ({ key: `ing_${i}`, label: s.original, value: s.scaled })),
      }],
      summary: `Scaling factor = target ÷ original = ${target} ÷ ${orig} = ${fmt(ratio, 4)}×. Apply this to every ingredient amount. Spices may not scale linearly — taste and adjust.`,
    };
  },
  tests: [
    { name: "4 → 6 servings = 1.5×", inputs: { original_servings: 4, target_servings: 6, ingredients: "200 g flour" }, expected: { ratio: "1.5×" } },
  ],
};

function parseAmount(s: string): number {
  s = s.trim();
  // Handle fractions like "1/2" or "1 1/2"
  if (s.includes("/")) {
    const parts = s.split(" ");
    let total = 0;
    for (const p of parts) {
      if (p.includes("/")) {
        const [n, d] = p.split("/").map(Number);
        total += n / d;
      } else {
        total += Number(p);
      }
    }
    return total;
  }
  return Number(s);
}

function formatAmount(n: number): string {
  if (n === 0) return "0";
  // Show as fraction for common cooking fractions
  const fractions: [number, string][] = [
    [0.125, "1/8"], [0.25, "1/4"], [0.333, "1/3"], [0.5, "1/2"],
    [0.667, "2/3"], [0.75, "3/4"], [1.25, "1 1/4"], [1.5, "1 1/2"], [1.75, "1 3/4"],
  ];
  for (const [v, label] of fractions) {
    if (Math.abs(n - v) < 0.01) return label;
  }
  return fmt(n, 2);
}

/* ----------- Food serving / ingredient conversion ----------------- */
export const foodServingConversion: CalculatorDefinition = {
  slug: "food-serving-conversion",
  name: "Cooking Measurement Converter",
  description: "Convert between cups, tablespoons, teaspoons, ml and grams for common ingredients.",
  category: "cooking",
  keywords: ["cooking", "measurement", "cup", "tablespoon", "teaspoon", "convert"],
  status: "live",
  part: 4,
  inputs: [
    { name: "amount", label: "Amount", type: "number", default: 1, min: 0, step: "any" },
    { name: "from", label: "From", type: "select", default: "cup",
      options: [
        { label: "Cup (US)", value: "cup" },
        { label: "Tablespoon (US)", value: "tbsp" },
        { label: "Teaspoon (US)", value: "tsp" },
        { label: "Fluid ounce (US)", value: "fl_oz" },
        { label: "Milliliter", value: "ml" },
        { label: "Liter", value: "L" },
      ] },
    { name: "to", label: "To", type: "select", default: "ml",
      options: [
        { label: "Cup (US)", value: "cup" },
        { label: "Tablespoon (US)", value: "tbsp" },
        { label: "Teaspoon (US)", value: "tsp" },
        { label: "Fluid ounce (US)", value: "fl_oz" },
        { label: "Milliliter", value: "ml" },
        { label: "Liter", value: "L" },
      ] },
  ],
  related: ["recipe-scaler", "volume-converter", "mass-converter"],
  calculate: (raw) => {
    const amount = toNum(raw.amount);
    const from = String(raw.from ?? "cup");
    const to = String(raw.to ?? "ml");
    const toMl: Record<string, number> = {
      cup: 236.588, tbsp: 14.7868, tsp: 4.92892, fl_oz: 29.5735, ml: 1, L: 1000,
    };
    const inMl = amount * (toMl[from] ?? 1);
    const out = inMl / (toMl[to] ?? 1);
    return {
      rows: [
        { key: "result", label: `${fmt(amount, 4)} ${from} = `, value: `${fmt(out, 4)} ${to}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Common equivalences",
        rows: [
          { key: "cup_tbsp", label: "1 cup = tablespoons", value: "16 tbsp" },
          { key: "cup_tsp", label: "1 cup = teaspoons", value: "48 tsp" },
          { key: "tbsp_tsp", label: "1 tablespoon = teaspoons", value: "3 tsp" },
          { key: "cup_ml", label: "1 US cup = ml", value: "236.588 ml" },
        ],
      }],
      summary: "US customary units. 1 US cup = 16 tbsp = 48 tsp = 236.588 ml. UK/Australian cups differ slightly (250 ml).",
    };
  },
  tests: [
    { name: "1 cup to tbsp = 16", inputs: { amount: 1, from: "cup", to: "tbsp" }, expected: "16 tbsp", tolerance: 0.001 },
    { name: "1 cup to ml = 236.588", inputs: { amount: 1, from: "cup", to: "ml" }, expected: "236.588 ml", tolerance: 0.01 },
  ],
};
