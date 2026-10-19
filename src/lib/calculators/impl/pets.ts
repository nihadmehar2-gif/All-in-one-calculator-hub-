/**
 * Pets and Animals — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* --------------------- Dog age ------------------------------------ */
export const dogAge: CalculatorDefinition = {
  slug: "dog-age",
  name: "Dog Age Calculator",
  description: "Convert dog years to human-equivalent years using breed-size-aware formula.",
  category: "pets",
  keywords: ["dog", "age", "pet", "canine", "human years"],
  status: "live",
  part: 4,
  inputs: [
    { name: "age_years", label: "Dog age (years)", type: "number", default: 5, min: 0, step: "any", unit: "yrs" },
    { name: "age_months", label: "Additional months", type: "number", default: 0, min: 0, max: 11, step: 1, unit: "mo" },
    { name: "size", label: "Breed size", type: "select", default: "medium",
      options: [
        { label: "Small (up to 9 kg / 20 lb)", value: "small" },
        { label: "Medium (9-23 kg / 20-50 lb)", value: "medium" },
        { label: "Large (23-45 kg / 50-100 lb)", value: "large" },
        { label: "Giant (over 45 kg / 100 lb)", value: "giant" },
      ] },
  ],
  related: ["pet-calorie", "age-calculator"],
  calculate: (raw) => {
    const yrs = toNum(raw.age_years);
    const mos = toNum(raw.age_months);
    const size = String(raw.size ?? "medium");
    const totalYrs = yrs + mos / 12;
    // AVMA formula: dogs age ~15 human yrs in year 1, ~9 in year 2, ~4-5 per year after
    // Size affects later years: smaller dogs live longer
    let humanYrs: number;
    if (totalYrs <= 0) {
      humanYrs = 0;
    } else if (totalYrs <= 1) {
      humanYrs = 15 * totalYrs;
    } else if (totalYrs <= 2) {
      humanYrs = 15 + 9 * (totalYrs - 1);
    } else {
      const afterAge2 = totalYrs - 2;
      const perYear = size === "small" ? 4 : size === "medium" ? 5 : size === "large" ? 6 : 7;
      humanYrs = 24 + afterAge2 * perYear;
    }
    // Life expectancy by size
    const lifeExp: Record<string, number> = { small: 14, medium: 12, large: 10, giant: 8 };
    const expectancy = lifeExp[size] ?? 12;
    const lifePct = (totalYrs / expectancy) * 100;
    return {
      rows: [
        { key: "human_years", label: "Human-equivalent age", value: `${fmt(humanYrs, 1)} years`, emphasis: "primary" },
        { key: "dog_years", label: "Actual dog age", value: `${fmt(totalYrs, 2)} years` },
        { key: "expectancy", label: `Life expectancy (${size})`, value: `${expectancy} years` },
        { key: "life_pct", label: "Percent of life lived", value: `${fmt(lifePct, 0)}%`, emphasis: lifePct > 75 ? "warning" : "normal" },
      ],
      summary: "Based on AVMA convention: year 1 ≈ 15 human years, year 2 ≈ 9, then 4-7 per year (smaller dogs age slower after maturity). ESTIMATE — individual variation is significant.",
    };
  },
  tests: [
    { name: "5yo medium dog → 39 human years", inputs: { age_years: 5, age_months: 0, size: "medium" }, expected: { human_years: "39 years" } },
    { name: "1yo small dog → 15 human years", inputs: { age_years: 1, age_months: 0, size: "small" }, expected: { human_years: "15 years" } },
  ],
};

/* --------------- Pet calorie needs -------------------------------- */
export const petCalorie: CalculatorDefinition = {
  slug: "pet-calorie",
  name: "Pet Daily Calorie Needs",
  description: "Estimate daily resting energy requirement (RER) and daily energy (DER) for dogs and cats.",
  category: "pets",
  keywords: ["pet", "calorie", "dog", "cat", "rer", "der", "feeding"],
  status: "live",
  part: 4,
  inputs: [
    { name: "species", label: "Species", type: "select", default: "dog",
      options: [{ label: "Dog", value: "dog" }, { label: "Cat", value: "cat" }] },
    { name: "weight", label: "Body weight", type: "number", default: 15, min: 0, step: "any", unit: "kg" },
    { name: "activity", label: "Activity / life stage", type: "select", default: "neutered_adult",
      options: [
        { label: "Intact adult (1.6×)", value: "intact" },
        { label: "Neutered adult (1.4×)", value: "neutered_adult" },
        { label: "Weight loss (1.0×)", value: "loss" },
        { label: "Weight gain (1.7×)", value: "gain" },
        { label: "Puppy/kitten (2.5×)", value: "young" },
        { label: "Active working dog (3.0×)", value: "active" },
      ] },
  ],
  related: ["dog-age", "bmr"],
  calculate: (raw) => {
    const species = String(raw.species ?? "dog");
    const weight = toNum(raw.weight);
    const activity = String(raw.activity ?? "neutered_adult");
    if (weight <= 0) {
      return { rows: [{ key: "der", label: "Daily calories", value: "—" }] };
    }
    // RER formula: 70 × weight^0.75 (kcal/day)
    const rer = 70 * Math.pow(weight, 0.75);
    const factors: Record<string, number> = {
      intact: 1.6, neutered_adult: 1.4, loss: 1.0, gain: 1.7, young: 2.5, active: 3.0,
    };
    const factor = factors[activity] ?? 1.4;
    const der = rer * factor;
    // Approximate food amount (assume 350 kcal/100g dog food, 350 kcal/100g cat food)
    const foodG = (der / 350) * 100;
    return {
      rows: [
        { key: "rer", label: "Resting energy requirement (RER)", value: `${fmt(rer, 0)} kcal/day`, emphasis: "primary" },
        { key: "der", label: "Daily energy requirement (DER)", value: `${fmt(der, 0)} kcal/day`, emphasis: "primary" },
        { key: "food", label: "Approx. dry food amount", value: `${fmt(foodG, 0)} g/day` },
      ],
      sections: [{
        title: "Reference",
        rows: [
          { key: "rer_formula", label: "RER formula", value: "70 × weight^0.75 kcal/day" },
          { key: "factor", label: `Activity factor (${activity})`, value: `${factor}×` },
        ],
      }],
      summary: "ESTIMATE ONLY — based on AAHA/WSAVA guidelines. Actual needs vary with breed, body condition, neuter status, and health. Consult your vet for overweight pets or special diets.",
    };
  },
  tests: [
    { name: "15kg neutered dog → ~747 kcal/day", inputs: { species: "dog", weight: 15, activity: "neutered_adult" }, expected: { der: "747 kcal/day" }, tolerance: 5 },
  ],
};
