/**
 * Health and Fitness — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

export const bmiCalculator: CalculatorDefinition = {
  slug: "bmi",
  name: "BMI Calculator",
  description: "Body Mass Index from height and weight, plus WHO category classification.",
  category: "health",
  keywords: ["body mass index", "weight", "height", "obesity", "healthy weight", "underweight"],
  status: "live",
  part: 1,
  inputs: [
    { name: "unit", label: "Units", type: "select", default: "metric",
      options: [
        { label: "Metric (cm, kg)", value: "metric" },
        { label: "Imperial (in, lb)", value: "imperial" },
      ] },
    { name: "height", label: "Height", type: "number", default: 175, min: 0, step: "any",
      unit: "cm", help: "Switch unit selector to change to inches." },
    { name: "weight", label: "Weight", type: "number", default: 70, min: 0, step: "any",
      unit: "kg", help: "Switch unit selector to change to pounds." },
  ],
  related: ["bmr", "ideal-weight", "body-fat"],
  calculate: (raw) => {
    const unit = String(raw.unit ?? "metric");
    const h = toNum(raw.height);
    const w = toNum(raw.weight);
    if (h <= 0 || w <= 0) {
      return { rows: [{ key: "bmi", label: "BMI", value: "—" }] };
    }
    let bmi: number;
    if (unit === "imperial") {
      bmi = (703 * w) / (h * h);
    } else {
      bmi = w / ((h / 100) ** 2);
    }
    let category = "";
    let emphasis: "normal" | "warning" | "success" = "normal";
    if (bmi < 18.5) { category = "Underweight"; emphasis = "warning"; }
    else if (bmi < 25) { category = "Normal weight"; emphasis = "success"; }
    else if (bmi < 30) { category = "Overweight"; emphasis = "warning"; }
    else { category = "Obese"; emphasis = "warning"; }

    return {
      rows: [
        { key: "bmi", label: "BMI", value: fmt(bmi, 1), emphasis: "primary" },
        { key: "category", label: "WHO category", value: category, emphasis },
      ],
      sections: [
        {
          title: "WHO reference ranges",
          rows: [
            { key: "r1", label: "Underweight", value: "< 18.5" },
            { key: "r2", label: "Normal", value: "18.5 – 24.9" },
            { key: "r3", label: "Overweight", value: "25 – 29.9" },
            { key: "r4", label: "Obese", value: "≥ 30" },
          ],
        },
      ],
      summary:
        "BMI is a screening tool that estimates body fatness from height and weight. " +
        "It does not directly measure body composition, so athletes and elderly may have misleading values.",
    };
  },
  tests: [
    { name: "70kg, 175cm", inputs: { unit: "metric", height: 175, weight: 70 }, expected: { bmi: "22.9" } },
    { name: "160lb, 70in", inputs: { unit: "imperial", height: 70, weight: 160 }, expected: { bmi: "23" } },
  ],
};
