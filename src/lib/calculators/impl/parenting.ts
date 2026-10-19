/**
 * Pregnancy and Parenting — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ------------------- Ovulation calendar ---------------------------- */
export const ovulation: CalculatorDefinition = {
  slug: "ovulation",
  name: "Ovulation Calendar",
  description: "Estimate fertile window and ovulation date from last menstrual period.",
  category: "parenting",
  keywords: ["ovulation", "fertility", "pregnancy", "conception", "lmp"],
  status: "live",
  part: 5,
  inputs: [
    { name: "lmp", label: "First day of last menstrual period", type: "date", default: "2024-09-01" },
    { name: "cycle_length", label: "Average cycle length", type: "number", default: 28, min: 21, max: 35, step: 1, unit: "days" },
  ],
  related: ["pregnancy-due-date", "age-calculator"],
  calculate: (raw) => {
    const lmpStr = String(raw.lmp ?? "");
    const cycle = toNum(raw.cycle_length);
    const lmp = new Date(lmpStr);
    if (isNaN(lmp.getTime())) {
      return { rows: [{ key: "ovulation", label: "Ovulation date", value: "—" }] };
    }
    // Ovulation typically occurs 14 days BEFORE the next period
    // Next period = LMP + cycle length
    const msPerDay = 24 * 60 * 60 * 1000;
    const nextPeriod = new Date(lmp.getTime() + cycle * msPerDay);
    const ovulationDate = new Date(nextPeriod.getTime() - 14 * msPerDay);
    // Fertile window: ovulation ± 5 days (sperm survives 5 days, egg 1 day)
    const fertileStart = new Date(ovulationDate.getTime() - 5 * msPerDay);
    const fertileEnd = new Date(ovulationDate.getTime() + 1 * msPerDay);
    // Next 3 cycles
    const nextCycles: { key: string; label: string; value: string }[] = [];
    for (let i = 1; i <= 3; i++) {
      const nextLmp = new Date(lmp.getTime() + i * cycle * msPerDay);
      const nextOv = new Date(nextLmp.getTime() + (cycle - 14) * msPerDay);
      nextCycles.push({
        key: `c${i}`,
        label: `Cycle ${i + 1}`,
        value: `LMP ${nextLmp.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · Ovulation ~${nextOv.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      });
    }
    return {
      rows: [
        { key: "ovulation", label: "Estimated ovulation", value: ovulationDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), emphasis: "primary" },
        { key: "fertile_window", label: "Fertile window", value: `${fertileStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${fertileEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, emphasis: "primary" },
        { key: "next_period", label: "Next expected period", value: nextPeriod.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
      ],
      sections: [
        { title: "Upcoming cycles", rows: nextCycles },
        { title: "Reference", rows: [
          { key: "fertile_days", label: "Most fertile days", value: "Ovulation day and 1 day before" },
          { key: "conception_window", label: "Conception possible", value: "5 days before ovulation through 1 day after" },
        ] },
      ],
      summary: "Ovulation ≈ 14 days before next period. ESTIMATE ONLY — actual ovulation varies. Use ovulation predictor kits or BBT tracking for confirmation. Cycle length 21-35 days is considered regular.",
    };
  },
  tests: [
    { name: "LMP 2024-09-01, 28-day cycle → ovulation Sep 15", inputs: { lmp: "2024-09-01", cycle_length: 28 }, expected: { ovulation: "September 15, 2024" } },
  ],
};

/* ------------------- Child growth percentile (rough) --------------- */
export const childGrowthPercentile: CalculatorDefinition = {
  slug: "child-growth-percentile",
  name: "Child Growth Percentile (rough)",
  description: "Estimate WHO percentile for child height/weight given age and sex.",
  category: "parenting",
  keywords: ["child", "growth", "percentile", "who", "height", "weight"],
  status: "live",
  part: 5,
  inputs: [
    { name: "sex", label: "Sex", type: "select", default: "male",
      options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }] },
    { name: "age_months", label: "Age (months)", type: "number", default: 24, min: 0, max: 60, step: 1, unit: "mo" },
    { name: "measure", label: "Measurement", type: "select", default: "height",
      options: [{ label: "Height/length (cm)", value: "height" }, { label: "Weight (kg)", value: "weight" }] },
    { name: "value", label: "Measured value", type: "number", default: 87, min: 0, step: "any" },
  ],
  related: ["pregnancy-due-date", "ovulation", "bmi"],
  calculate: (raw) => {
    const sex = String(raw.sex ?? "male");
    const age = Math.max(0, Math.min(60, toNum(raw.age_months)));
    const measure = String(raw.measure ?? "height");
    const v = toNum(raw.value);
    // Approximate median (50th percentile) values from WHO charts
    // These are simplified linear interpolations — real WHO charts use LMS
    let median: number, sd: number;
    if (measure === "height") {
      // Height in cm — median values for age 0-60 months
      if (sex === "male") {
        median = 50 + age * 0.78; // very rough: 50cm at birth, ~97cm at 60mo
        sd = 1.9 + age * 0.02;
      } else {
        median = 49 + age * 0.77;
        sd = 1.9 + age * 0.02;
      }
    } else {
      // Weight in kg
      if (sex === "male") {
        median = 3.3 + Math.pow(age, 0.85) * 0.55;
        sd = 0.4 + age * 0.025;
      } else {
        median = 3.2 + Math.pow(age, 0.85) * 0.52;
        sd = 0.4 + age * 0.025;
      }
    }
    // Z-score
    const z = (v - median) / sd;
    // Convert z to percentile using standard normal CDF approximation
    const erf = (t: number) => {
      const sign = Math.sign(t);
      const tt = Math.abs(t);
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
      const u = 1 / (1 + p * tt);
      const y = 1 - (((((a5 * u + a4) * u) + a3) * u + a2) * u + a1) * u * Math.exp(-tt * tt);
      return sign * y;
    };
    const percentile = 0.5 * (1 + erf(z / Math.SQRT2)) * 100;
    let category: string;
    if (percentile < 5) category = "Below 5th — consult pediatrician";
    else if (percentile < 25) category = "Below average";
    else if (percentile < 75) category = "Average range";
    else if (percentile < 95) category = "Above average";
    else category = "Above 95th — consult pediatrician";
    return {
      rows: [
        { key: "percentile", label: "Estimated percentile", value: `${fmt(percentile, 1)}%`, emphasis: "primary" },
        { key: "category", label: "Category", value: category },
        { key: "median", label: `Median (50th) for age`, value: `${fmt(median, 1)} ${measure === "height" ? "cm" : "kg"}` },
        { key: "z_score", label: "Z-score", value: fmt(z, 3) },
      ],
      summary: "ROUGH ESTIMATE based on simplified WHO medians. For official percentiles, use the WHO Anthro calculator or consult a pediatrician. Real WHO charts use LMS (Box-Cox) methods, not simple z-scores.",
    };
  },
  tests: [
    { name: "Male 24mo, height 87cm", inputs: { sex: "male", age_months: 24, measure: "height", value: 87 }, expected: { median: "68.7 cm" } },
  ],
};

/* ------------------- Baby due date (conception-based) -------------- */
export const conceptionDueDate: CalculatorDefinition = {
  slug: "conception-due-date",
  name: "Due Date from Conception Date",
  description: "Compute due date from the known conception date (alternative to LMP method).",
  category: "parenting",
  keywords: ["due date", "conception", "pregnancy", "ivf"],
  status: "live",
  part: 5,
  inputs: [
    { name: "conception", label: "Conception date", type: "date", default: "2024-01-15" },
  ],
  related: ["pregnancy-due-date", "ovulation", "age-calculator"],
  calculate: (raw) => {
    const conceptionStr = String(raw.conception ?? "");
    const conception = new Date(conceptionStr);
    if (isNaN(conception.getTime())) {
      return { rows: [{ key: "due", label: "Due date", value: "—" }] };
    }
    // Pregnancy from conception ≈ 266 days (38 weeks)
    // vs 280 days (40 weeks) from LMP because ovulation is ~14 days after LMP
    const msPerDay = 24 * 60 * 60 * 1000;
    const due = new Date(conception.getTime() + 266 * msPerDay);
    const now = new Date();
    const gestDays = Math.floor((now.getTime() - conception.getTime()) / msPerDay);
    const gestWeeks = Math.floor((gestDays + 14) / 7); // add 14 to convert to LMP-equivalent
    return {
      rows: [
        { key: "due", label: "Estimated due date", value: due.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), emphasis: "primary" },
        { key: "gest_weeks", label: "Current gestational age (LMP-equivalent)", value: `${gestWeeks} weeks`, emphasis: "primary" },
      ],
      sections: [{
        title: "Key milestones",
        rows: [
          { key: "first_trimester", label: "End of first trimester (12w)", value: new Date(conception.getTime() + (12 * 7 - 14) * msPerDay).toLocaleDateString("en-US") },
          { key: "second_trimester", label: "End of second trimester (27w)", value: new Date(conception.getTime() + (27 * 7 - 14) * msPerDay).toLocaleDateString("en-US") },
          { key: "full_term", label: "Full term (37w)", value: new Date(conception.getTime() + (37 * 7 - 14) * msPerDay).toLocaleDateString("en-US") },
        ],
      }],
      summary: "From conception: 266 days (38 weeks). From LMP: 280 days (40 weeks) — the 14-day difference reflects typical ovulation timing. ESTIMATE — only ~5% of babies arrive on their due date.",
    };
  },
  tests: [
    { name: "Conception 2024-01-15 → due Oct 7, 2024", inputs: { conception: "2024-01-15" }, expected: { due: "October 7, 2024" } },
  ],
};
