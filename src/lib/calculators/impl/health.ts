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

/* ----------------------- BMR / TDEE ------------------------------- */
export const bmrCalculator: CalculatorDefinition = {
  slug: "bmr",
  name: "BMR & Daily Calorie Needs",
  description: "Basal metabolic rate (Mifflin-St Jeor) and total daily energy expenditure by activity level.",
  category: "health",
  keywords: ["bmr", "metabolism", "tdee", "calorie", "maintenance", "mifflin", "energy"],
  status: "live",
  part: 4,
  inputs: [
    { name: "sex", label: "Sex", type: "select", default: "male",
      options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }] },
    { name: "age", label: "Age", type: "number", default: 30, min: 1, max: 120, step: 1, unit: "yrs" },
    { name: "weight", label: "Weight", type: "number", default: 70, min: 0, step: "any", unit: "kg" },
    { name: "height", label: "Height", type: "number", default: 175, min: 0, step: "any", unit: "cm" },
    { name: "activity", label: "Activity level", type: "select", default: "1.55",
      options: [
        { label: "Sedentary (little/no exercise) — 1.2×", value: "1.2" },
        { label: "Lightly active (1-3 days/wk) — 1.375×", value: "1.375" },
        { label: "Moderately active (3-5 days/wk) — 1.55×", value: "1.55" },
        { label: "Very active (6-7 days/wk) — 1.725×", value: "1.725" },
        { label: "Extra active (physical job + training) — 1.9×", value: "1.9" },
      ] },
  ],
  related: ["bmi", "ideal-weight", "macro-calculator", "heart-rate-zones"],
  calculate: (raw) => {
    const sex = String(raw.sex ?? "male");
    const age = toNum(raw.age);
    const weight = toNum(raw.weight);
    const height = toNum(raw.height);
    const activity = Number(raw.activity ?? 1.55);
    if (weight <= 0 || height <= 0 || age <= 0) {
      return { rows: [{ key: "bmr", label: "BMR", value: "—" }] };
    }
    // Mifflin-St Jeor (1990) — currently the most accurate predictive equation
    const bmr = sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = bmr * activity;
    return {
      rows: [
        { key: "bmr", label: "BMR (Mifflin-St Jeor)", value: `${fmt(bmr, 0)} kcal/day`, emphasis: "primary" },
        { key: "tdee", label: "TDEE (maintenance calories)", value: `${fmt(tdee, 0)} kcal/day`, emphasis: "primary" },
      ],
      sections: [{
        title: "Goal-adjusted calories",
        rows: [
          { key: "lose_fast", label: "Lose 1 lb/week (−500)", value: `${fmt(tdee - 500, 0)} kcal/day` },
          { key: "lose_slow", label: "Lose 0.5 lb/week (−250)", value: `${fmt(tdee - 250, 0)} kcal/day` },
          { key: "maintain", label: "Maintain", value: `${fmt(tdee, 0)} kcal/day` },
          { key: "gain_slow", label: "Gain 0.5 lb/week (+250)", value: `${fmt(tdee + 250, 0)} kcal/day` },
          { key: "gain_fast", label: "Gain 1 lb/week (+500)", value: `${fmt(tdee + 500, 0)} kcal/day` },
        ],
      }],
      summary: "ESTIMATE ONLY — not medical advice. Mifflin-St Jeor is the most accurate predictive equation but still has ±10% individual variation. 1 lb of body fat ≈ 3500 kcal.",
    };
  },
  tests: [
    { name: "Male, 30y, 70kg, 175cm, moderate", inputs: { sex: "male", age: 30, weight: 70, height: 175, activity: "1.55" }, expected: { bmr: "1,649 kcal/day" } },
    { name: "Female, 25y, 60kg, 165cm, sedentary", inputs: { sex: "female", age: 25, weight: 60, height: 165, activity: "1.2" }, expected: { bmr: "1,345 kcal/day" } },
  ],
};

/* ------------------- Body fat & lean mass ------------------------- */
export const bodyFatCalculator: CalculatorDefinition = {
  slug: "body-fat",
  name: "Body Fat % (US Navy Method)",
  description: "Estimate body fat percentage from circumference measurements using the US Navy formula.",
  category: "health",
  keywords: ["body fat", "lean mass", "navy", "circumference", "composition"],
  status: "live",
  part: 4,
  inputs: [
    { name: "sex", label: "Sex", type: "select", default: "male",
      options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }] },
    { name: "height", label: "Height", type: "number", default: 175, min: 0, step: "any", unit: "cm" },
    { name: "neck", label: "Neck circumference", type: "number", default: 38, min: 0, step: "any", unit: "cm" },
    { name: "waist", label: "Waist circumference (at navel)", type: "number", default: 82, min: 0, step: "any", unit: "cm" },
    { name: "hip", label: "Hip circumference (females only)", type: "number", default: 0, min: 0, step: "any", unit: "cm" },
    { name: "weight", label: "Weight (for lean mass)", type: "number", default: 70, min: 0, step: "any", unit: "kg" },
  ],
  related: ["bmi", "bmr", "ideal-weight"],
  calculate: (raw) => {
    const sex = String(raw.sex ?? "male");
    const height = toNum(raw.height);
    const neck = toNum(raw.neck);
    const waist = toNum(raw.waist);
    const hip = toNum(raw.hip);
    const weight = toNum(raw.weight);
    if (waist <= neck || height <= 0) {
      return { rows: [{ key: "bf", label: "Body fat %", value: "—", hint: "Waist must exceed neck.", emphasis: "warning" }] };
    }
    // US Navy formula (metric, cm)
    let bf: number;
    if (sex === "male") {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      if (hip <= 0) {
        return { rows: [{ key: "bf", label: "Body fat %", value: "—", hint: "Hip circumference required for females." }] };
      }
      if (waist + hip <= neck) {
        return { rows: [{ key: "bf", label: "Body fat %", value: "—", hint: "Waist + hip must exceed neck." }] };
      }
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }
    bf = Math.max(0, Math.min(60, bf));
    const fatMass = weight * (bf / 100);
    const leanMass = weight - fatMass;
    let category = "";
    if (sex === "male") {
      if (bf < 6) category = "Essential fat";
      else if (bf < 14) category = "Athlete";
      else if (bf < 18) category = "Fitness";
      else if (bf < 25) category = "Average";
      else category = "High";
    } else {
      if (bf < 14) category = "Essential fat";
      else if (bf < 21) category = "Athlete";
      else if (bf < 25) category = "Fitness";
      else if (bf < 32) category = "Average";
      else category = "High";
    }
    return {
      rows: [
        { key: "bf", label: "Body fat %", value: `${fmt(bf, 1)}%`, emphasis: "primary" },
        { key: "category", label: "Category", value: category },
        { key: "fat_mass", label: "Fat mass", value: `${fmt(fatMass, 1)} kg` },
        { key: "lean_mass", label: "Lean body mass", value: `${fmt(leanMass, 1)} kg`, emphasis: "primary" },
      ],
      summary: "ESTIMATE ONLY — not a medical diagnosis. US Navy method has ±3-4% accuracy vs DEXA. Uses log10 of (waist − neck) for males, (waist + hip − neck) for females. Measurements in cm.",
    };
  },
  tests: [
    { name: "Male, 175cm, neck 38, waist 82, 70kg", inputs: { sex: "male", height: 175, neck: 38, waist: 82, hip: 0, weight: 70 }, expected: { bf: "14.6%" }, tolerance: 0.5 },
  ],
};

/* --------------------- Ideal weight ------------------------------- */
export const idealWeight: CalculatorDefinition = {
  slug: "ideal-weight",
  name: "Ideal Body Weight (Devine & Robinson)",
  description: "Estimate ideal body weight using the Devine and Robinson formulas.",
  category: "health",
  keywords: ["ideal weight", "devine", "robinson", "ibw", "target weight"],
  status: "live",
  part: 4,
  inputs: [
    { name: "sex", label: "Sex", type: "select", default: "male",
      options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }] },
    { name: "height_cm", label: "Height", type: "number", default: 175, min: 100, max: 250, step: "any", unit: "cm" },
  ],
  related: ["bmi", "bmr", "body-fat"],
  calculate: (raw) => {
    const sex = String(raw.sex ?? "male");
    const h = toNum(raw.height_cm);
    if (h < 100 || h > 250) {
      return { rows: [{ key: "devine", label: "Devine", value: "—" }] };
    }
    // Formulas use height in inches over 5 ft
    const inchesOver5ft = Math.max(0, (h / 2.54) - 60);
    const devine = sex === "male"
      ? 50 + 2.3 * inchesOver5ft
      : 45.5 + 2.3 * inchesOver5ft;
    const robinson = sex === "male"
      ? 52 + 1.9 * inchesOver5ft
      : 49 + 1.7 * inchesOver5ft;
    const miller = sex === "male"
      ? 56.2 + 1.41 * inchesOver5ft
      : 53.1 + 1.36 * inchesOver5ft;
    const hamwi = sex === "male"
      ? 48 + 2.7 * inchesOver5ft
      : 45.5 + 2.2 * inchesOver5ft;
    return {
      rows: [
        { key: "devine", label: "Devine (1974, most cited)", value: `${fmt(devine, 1)} kg`, emphasis: "primary" },
        { key: "robinson", label: "Robinson (1983)", value: `${fmt(robinson, 1)} kg`, emphasis: "primary" },
      ],
      sections: [{
        title: "Other formulas",
        rows: [
          { key: "miller", label: "Miller (1983)", value: `${fmt(miller, 1)} kg` },
          { key: "hamwi", label: "Hamwi (1964)", value: `${fmt(hamwi, 1)} kg` },
        ],
      }],
      summary: "ESTIMATE ONLY — these formulas were developed from actuarial data and have known limitations: they don't account for muscle mass, frame size, or body composition. Use as a rough target, not a prescription.",
    };
  },
  tests: [
    { name: "Male, 175cm → Devine 70.5kg", inputs: { sex: "male", height_cm: 175 }, expected: { devine: "70.5 kg" } },
    { name: "Female, 165cm → Devine 56.9kg", inputs: { sex: "female", height_cm: 165 }, expected: { devine: "56.9 kg" } },
  ],
};

/* ---------------- Heart-rate training zones ----------------------- */
export const heartRateZones: CalculatorDefinition = {
  slug: "heart-rate-zones",
  name: "Heart Rate Training Zones",
  description: "Compute 5 training zones from max heart rate (Karvonen formula with optional resting HR).",
  category: "health",
  keywords: ["heart rate", "training zone", "karvonen", "max hr", "cardio", "exercise"],
  status: "live",
  part: 4,
  inputs: [
    { name: "age", label: "Age", type: "number", default: 30, min: 1, max: 120, step: 1, unit: "yrs" },
    { name: "resting_hr", label: "Resting heart rate (optional)", type: "number", default: 60, min: 30, max: 120, step: 1, unit: "bpm",
      help: "If you know it, the Karvonen formula uses resting HR for more accurate zones. Set to 0 to use the simple % of max method." },
  ],
  related: ["bmr", "pace-speed-distance", "bmi"],
  calculate: (raw) => {
    const age = toNum(raw.age);
    const resting = toNum(raw.resting_hr);
    const maxHR = 220 - age; // Fox formula (simple, widely used)
    const useKarvonen = resting > 0;
    const zones = [
      { name: "Zone 1 — Very light (50-60%)", lo: 0.50, hi: 0.60 },
      { name: "Zone 2 — Light (60-70%)", lo: 0.60, hi: 0.70 },
      { name: "Zone 3 — Moderate (70-80%)", lo: 0.70, hi: 0.80 },
      { name: "Zone 4 — Hard (80-90%)", lo: 0.80, hi: 0.90 },
      { name: "Zone 5 — Maximum (90-100%)", lo: 0.90, hi: 1.00 },
    ];
    const rows = zones.map((z) => {
      let loHR: number, hiHR: number;
      if (useKarvonen) {
        // Karvonen: target = (max - rest) × intensity + rest
        loHR = (maxHR - resting) * z.lo + resting;
        hiHR = (maxHR - resting) * z.hi + resting;
      } else {
        loHR = maxHR * z.lo;
        hiHR = maxHR * z.hi;
      }
      return { key: `z${z.lo}`, label: z.name, value: `${fmt(loHR, 0)} - ${fmt(hiHR, 0)} bpm` };
    });
    return {
      rows: [
        { key: "max_hr", label: "Estimated max HR (220 − age)", value: `${fmt(maxHR, 0)} bpm`, emphasis: "primary" },
        ...rows,
      ],
      summary: `ESTIMATE ONLY — not medical advice. Max HR formula (220 − age) has ±10 bpm individual variation. ${useKarvonen ? "Using Karvonen formula with your resting HR." : "Using simple % of max HR. Enter resting HR for Karvonen method."} Consult a doctor before starting intense exercise.`,
    };
  },
  tests: [
    { name: "30y, no resting HR → max 190", inputs: { age: 30, resting_hr: 0 }, expected: { max_hr: "190 bpm" } },
    { name: "30y, resting 60 → zone 1 = 125-138", inputs: { age: 30, resting_hr: 60 }, expected: { "z0.5": "125 - 138 bpm" } },
  ],
};

/* ----------------------- Hydration -------------------------------- */
export const hydration: CalculatorDefinition = {
  slug: "hydration",
  name: "Daily Water Intake Estimate",
  description: "Rough daily water requirement based on body weight and activity.",
  category: "health",
  keywords: ["water", "hydration", "drinking", "fluid", "daily intake"],
  status: "live",
  part: 4,
  inputs: [
    { name: "weight", label: "Body weight", type: "number", default: 70, min: 0, step: "any", unit: "kg" },
    { name: "activity_min", label: "Exercise minutes per day", type: "number", default: 30, min: 0, step: 1, unit: "min" },
    { name: "climate", label: "Climate", type: "select", default: "temperate",
      options: [
        { label: "Temperate", value: "temperate" },
        { label: "Hot / humid (extra 500ml)", value: "hot" },
        { label: "Cold / high altitude (extra 350ml)", value: "cold" },
      ] },
  ],
  related: ["bmr", "bmi", "macro-calculator"],
  calculate: (raw) => {
    const weight = toNum(raw.weight);
    const exercise = toNum(raw.activity_min);
    const climate = String(raw.climate ?? "temperate");
    if (weight <= 0) {
      return { rows: [{ key: "total", label: "Daily intake", value: "—" }] };
    }
    // Common rule of thumb: 35 ml per kg body weight
    let base = weight * 35;
    // Add 350 ml per 30 min exercise
    base += (exercise / 30) * 350;
    // Climate adjustment
    if (climate === "hot") base += 500;
    else if (climate === "cold") base += 350;
    const liters = base / 1000;
    const cups = base / 240; // 8 oz cup
    return {
      rows: [
        { key: "total", label: "Estimated daily intake", value: `${fmt(liters, 2)} L (${fmt(base, 0)} ml)`, emphasis: "primary" },
        { key: "cups", label: "≈ 8 oz cups", value: `${fmt(cups, 1)} cups` },
      ],
      sections: [{
        title: "Reference",
        rows: [
          { key: "rule", label: "Rule of thumb", value: "35 ml per kg body weight" },
          { key: "exercise", label: "Exercise bonus", value: "+350 ml per 30 min" },
          { key: "source", label: "Source", value: "European Food Safety Authority ~2.5L (men), 2.0L (women) Adequate Intake" },
        ],
      }],
      summary: "GENERAL ESTIMATE — individual needs vary with diet, health, pregnancy, and breastfeeding. ~20% of water typically comes from food. Thirst is a reliable guide for most healthy adults.",
    };
  },
  tests: [
    { name: "70kg, 30min exercise, temperate", inputs: { weight: 70, activity_min: 30, climate: "temperate" }, expected: { total: "2.8 L (2,800 ml)" } },
  ],
};

/* ----------------- Pregnancy due date ----------------------------- */
export const pregnancyDueDate: CalculatorDefinition = {
  slug: "pregnancy-due-date",
  name: "Pregnancy Due Date (Naegele's Rule)",
  description: "Estimate due date and gestational age from the first day of the last menstrual period.",
  category: "health",
  keywords: ["pregnancy", "due date", "lmp", "naegele", "gestational age", "weeks"],
  status: "live",
  part: 4,
  inputs: [
    { name: "lmp", label: "First day of last menstrual period (LMP)", type: "date", default: "2024-01-01" },
    { name: "cycle_length", label: "Average cycle length", type: "number", default: 28, min: 21, max: 35, step: 1, unit: "days" },
  ],
  related: ["age-calculator", "date-difference"],
  calculate: (raw) => {
    const lmpStr = String(raw.lmp ?? "");
    const cycle = toNum(raw.cycle_length);
    const lmp = new Date(lmpStr);
    if (isNaN(lmp.getTime())) {
      return { rows: [{ key: "due", label: "Due date", value: "—", hint: "Enter a valid LMP date." }] };
    }
    // Naegele's rule: due date = LMP + 280 days (adjusted for cycle length)
    const adjustment = cycle - 28;
    const dueMs = lmp.getTime() + (280 + adjustment) * 24 * 60 * 60 * 1000;
    const due = new Date(dueMs);
    const now = new Date();
    const gestAgeDays = Math.floor((now.getTime() - lmp.getTime()) / (24 * 60 * 60 * 1000));
    const gestAgeWeeks = Math.floor(gestAgeDays / 7);
    const gestAgeDaysRem = gestAgeDays % 7;
    const trimester = gestAgeWeeks < 13 ? "First (weeks 1-12)" : gestAgeWeeks < 27 ? "Second (weeks 13-26)" : gestAgeWeeks < 40 ? "Third (weeks 27-40)" : "Post-term";
    const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return {
      rows: [
        { key: "due", label: "Estimated due date", value: due.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), emphasis: "primary" },
        { key: "gest_age", label: "Current gestational age", value: `${gestAgeWeeks} weeks ${gestAgeDaysRem} days`, emphasis: "primary" },
        { key: "trimester", label: "Trimester", value: trimester },
        { key: "days_left", label: "Days until due", value: `${daysUntilDue}` },
      ],
      sections: [{
        title: "Key milestones",
        rows: [
          { key: "end_first", label: "End of first trimester", value: new Date(lmp.getTime() + 13 * 7 * 86400000).toLocaleDateString("en-US") },
          { key: "end_second", label: "End of second trimester", value: new Date(lmp.getTime() + 27 * 7 * 86400000).toLocaleDateString("en-US") },
          { key: "full_term", label: "Full term (37 weeks)", value: new Date(lmp.getTime() + 37 * 7 * 86400000).toLocaleDateString("en-US") },
        ],
      }],
      summary: "ESTIMATE ONLY — not a medical diagnosis. Naegele's rule assumes a 28-day cycle with ovulation on day 14. Only ~5% of babies arrive on their due date; most arrive within 2 weeks of it. Ultrasound dating in the first trimester is more accurate.",
    };
  },
  tests: [
    { name: "LMP 2024-01-01, 28-day cycle → due Oct 7, 2024", inputs: { lmp: "2024-01-01", cycle_length: 28 }, expected: { due: "October 7, 2024" } },
  ],
};

/* --------------------- Sleep schedule ----------------------------- */
export const sleepSchedule: CalculatorDefinition = {
  slug: "sleep-schedule",
  name: "Sleep Schedule Calculator",
  description: "Find bedtime or wake time based on 90-minute sleep cycles.",
  category: "health",
  keywords: ["sleep", "schedule", "bedtime", "wake up", "sleep cycle", "rem"],
  status: "live",
  part: 4,
  inputs: [
    { name: "mode", label: "Mode", type: "select", default: "wake_at",
      options: [
        { label: "I want to wake at → find bedtimes", value: "wake_at" },
        { label: "I'll sleep now → find wake times", value: "sleep_now" },
      ] },
    { name: "time", label: "Wake time (or sleep-now time)", type: "text", default: "07:00",
      placeholder: "HH:MM (24h)" },
  ],
  related: ["hydration", "bmr"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "wake_at");
    const timeStr = String(raw.time ?? "");
    const m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) {
      return { rows: [{ key: "result", label: "Suggested times", value: "—", hint: "Use HH:MM 24h format." }] };
    }
    const hour = Number(m[1]);
    const min = Number(m[2]);
    if (hour > 23 || min > 59) {
      return { rows: [{ key: "result", label: "Suggested times", value: "—" }] };
    }
    const targetMinutes = hour * 60 + min;
    // Recommend 4-6 cycles (6h-9h), each cycle = 90 min, plus 15 min to fall asleep
    const cycles = [6, 5, 4]; // 6 cycles = 9h, 5 = 7.5h, 4 = 6h
    const fallAsleep = 15;
    const rows = cycles.map((c) => {
      const totalMin = c * 90 + fallAsleep;
      const otherMinutes = mode === "wake_at"
        ? (targetMinutes - totalMin + 24 * 60) % (24 * 60)
        : (targetMinutes + totalMin) % (24 * 60);
      const h = Math.floor(otherMinutes / 60);
      const mm = otherMinutes % 60;
      return {
        key: `c${c}`,
        label: `${c} cycles (${c * 1.5}h sleep)`,
        value: `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
      };
    });
    return {
      rows: [
        ...rows,
        { key: "note", label: "Time to fall asleep", value: "15 minutes assumed", hint: "Adults typically need 7-9 hours; 5 cycles (7.5h) is a good target." },
      ],
      summary: "Sleep cycles average 90 minutes. Waking at the end of a cycle feels easier than mid-cycle. ESTIMATE ONLY — sleep needs vary; consult a doctor for chronic sleep issues.",
    };
  },
  tests: [
    { name: "Wake at 07:00 → 6 cycles = 21:45", inputs: { mode: "wake_at", time: "07:00" }, expected: { c6: "21:45" } },
    { name: "Wake at 07:00 → 5 cycles = 23:15", inputs: { mode: "wake_at", time: "07:00" }, expected: { c5: "23:15" } },
  ],
};

/* ----------------- Macro / nutrition calculator ------------------- */
export const macroCalculator: CalculatorDefinition = {
  slug: "macro-calculator",
  name: "Macronutrient Calculator",
  description: "Split daily calories into protein, carbs and fat by goal and diet style.",
  category: "health",
  keywords: ["macros", "protein", "carbs", "fat", "nutrition", "diet", "keto", "balanced"],
  status: "live",
  part: 4,
  inputs: [
    { name: "calories", label: "Daily calorie target", type: "number", default: 2000, min: 800, max: 10000, step: "any", unit: "kcal" },
    { name: "diet", label: "Diet style", type: "select", default: "balanced",
      options: [
        { label: "Balanced (30/40/30)", value: "balanced" },
        { label: "High-protein (40/30/30)", value: "high_protein" },
        { label: "Low-carb (35/20/45)", value: "low_carb" },
        { label: "Keto (25/5/70)", value: "keto" },
        { label: "Endurance (20/55/25)", value: "endurance" },
      ] },
  ],
  related: ["bmr", "bmi", "hydration"],
  calculate: (raw) => {
    const cals = toNum(raw.calories);
    const diet = String(raw.diet ?? "balanced");
    if (cals <= 0) {
      return { rows: [{ key: "protein_g", label: "Protein", value: "—" }] };
    }
    const ratios: Record<string, [number, number, number]> = {
      balanced: [0.30, 0.40, 0.30],     // P/C/F
      high_protein: [0.40, 0.30, 0.30],
      low_carb: [0.35, 0.20, 0.45],
      keto: [0.25, 0.05, 0.70],
      endurance: [0.20, 0.55, 0.25],
    };
    const [pP, pC, pF] = ratios[diet] ?? ratios.balanced;
    const pCals = cals * pP;
    const cCals = cals * pC;
    const fCals = cals * pF;
    // 4 kcal/g protein, 4 kcal/g carb, 9 kcal/g fat
    const pG = pCals / 4;
    const cG = cCals / 4;
    const fG = fCals / 9;
    return {
      rows: [
        { key: "protein_g", label: "Protein", value: `${fmt(pG, 0)} g (${fmt(pP * 100, 0)}% / ${fmt(pCals, 0)} kcal)`, emphasis: "primary" },
        { key: "carbs_g", label: "Carbohydrates", value: `${fmt(cG, 0)} g (${fmt(pC * 100, 0)}% / ${fmt(cCals, 0)} kcal)`, emphasis: "primary" },
        { key: "fat_g", label: "Fat", value: `${fmt(fG, 0)} g (${fmt(pF * 100, 0)}% / ${fmt(fCals, 0)} kcal)`, emphasis: "primary" },
      ],
      summary: "Calories: protein 4 kcal/g, carbs 4 kcal/g, fat 9 kcal/g. ESTIMATE ONLY — individual needs vary; consult a registered dietitian for personalized advice.",
    };
  },
  tests: [
    { name: "2000 kcal balanced", inputs: { calories: 2000, diet: "balanced" }, expected: { protein_g: "150 g (30% / 600 kcal)" } },
    { name: "2000 kcal keto", inputs: { calories: 2000, diet: "keto" }, expected: { fat_g: "156 g (70% / 1,400 kcal)" } },
  ],
};

/* ------------- Pace / speed / distance ---------------------------- */
export const paceSpeedDistance: CalculatorDefinition = {
  slug: "pace-speed-distance",
  name: "Running Pace, Speed & Distance",
  description: "Compute any of pace, speed or distance from the other two.",
  category: "health",
  keywords: ["pace", "running", "speed", "distance", "min per km", "min per mile"],
  status: "live",
  part: 4,
  inputs: [
    { name: "solve", label: "Solve for", type: "select", default: "pace",
      options: [
        { label: "Pace (need distance + time)", value: "pace" },
        { label: "Speed (need distance + time)", value: "speed" },
        { label: "Distance (need pace + time)", value: "distance" },
        { label: "Time (need pace + distance)", value: "time" },
      ] },
    { name: "distance", label: "Distance", type: "number", default: 10, min: 0, step: "any", unit: "km" },
    { name: "hours", label: "Time: hours", type: "number", default: 0, min: 0, step: "any" },
    { name: "minutes", label: "Time: minutes", type: "number", default: 50, min: 0, max: 59, step: "any" },
    { name: "seconds", label: "Time: seconds", type: "number", default: 0, min: 0, max: 59, step: "any" },
    { name: "pace_min", label: "Pace: minutes per km", type: "number", default: 5, min: 0, step: "any" },
    { name: "pace_sec", label: "Pace: seconds per km", type: "number", default: 0, min: 0, max: 59, step: "any" },
  ],
  related: ["heart-rate-zones", "sports-average", "running-pace"],
  calculate: (raw) => {
    const solve = String(raw.solve ?? "pace");
    const dist = toNum(raw.distance);
    const hours = toNum(raw.hours);
    const minutes = toNum(raw.minutes);
    const seconds = toNum(raw.seconds);
    const paceMin = toNum(raw.pace_min);
    const paceSec = toNum(raw.pace_sec);
    const timeSec = hours * 3600 + minutes * 60 + seconds;
    const paceSecPerKm = paceMin * 60 + paceSec;
    let result: string;
    let extra: { label: string; value: string }[] = [];
    if (solve === "pace") {
      if (dist <= 0 || timeSec <= 0) return { rows: [{ key: "result", label: "Pace", value: "—" }] };
      const paceTotal = timeSec / dist;
      const pm = Math.floor(paceTotal / 60);
      const ps = Math.round(paceTotal % 60);
      result = `${pm}:${String(ps).padStart(2, "0")} per km`;
      extra = [
        { label: "Per mile", value: formatPaceHHMMSS(paceTotal * 1.609344) },
        { label: "Speed (km/h)", value: fmt((dist * 3600) / timeSec, 2) },
        { label: "Speed (mph)", value: fmt((dist * 3600) / timeSec / 1.609344, 2) },
      ];
    } else if (solve === "speed") {
      if (dist <= 0 || timeSec <= 0) return { rows: [{ key: "result", label: "Speed", value: "—" }] };
      const kmh = (dist * 3600) / timeSec;
      result = `${fmt(kmh, 2)} km/h`;
      extra = [
        { label: "mph", value: fmt(kmh / 1.609344, 2) },
        { label: "Pace (per km)", value: formatPaceHHMMSS(timeSec / dist) },
      ];
    } else if (solve === "distance") {
      if (paceSecPerKm <= 0 || timeSec <= 0) return { rows: [{ key: "result", label: "Distance", value: "—" }] };
      const d = timeSec / paceSecPerKm;
      result = `${fmt(d, 2)} km`;
      extra = [{ label: "Miles", value: fmt(d / 1.609344, 2) }];
    } else {
      // time
      if (paceSecPerKm <= 0 || dist <= 0) return { rows: [{ key: "result", label: "Time", value: "—" }] };
      const t = paceSecPerKm * dist;
      const h = Math.floor(t / 3600);
      const m = Math.floor((t % 3600) / 60);
      const s = Math.round(t % 60);
      result = `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return {
      rows: [
        { key: "result", label: `${solve.charAt(0).toUpperCase() + solve.slice(1)}`, value: result, emphasis: "primary" },
        ...extra.map((e, i) => ({ key: `extra_${i}`, label: e.label, value: e.value })),
      ],
      summary: "Pace = time ÷ distance. Speed = distance ÷ time. 1 km = 0.621371 miles.",
    };
  },
  tests: [
    { name: "10km in 50min → 5:00/km", inputs: { solve: "pace", distance: 10, hours: 0, minutes: 50, seconds: 0, pace_min: 5, pace_sec: 0 }, expected: { result: "5:00 per km" } },
    { name: "10km in 50min → 12 km/h", inputs: { solve: "speed", distance: 10, hours: 0, minutes: 50, seconds: 0, pace_min: 5, pace_sec: 0 }, expected: { result: "12 km/h" } },
  ],
};

function formatPaceHHMMSS(sec: number): string {
  const pm = Math.floor(sec / 60);
  const ps = Math.round(sec % 60);
  return `${pm}:${String(ps).padStart(2, "0")}`;
}
