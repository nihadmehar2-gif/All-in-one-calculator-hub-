/**
 * Education and Grades — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtFixed, toNum } from "../_format";

interface CourseRow { grade: number; credits: number; }

function parseCourses(raw: unknown): CourseRow[] {
  // Format: one course per line, "grade credits", e.g. "3.7 3"
  const text = String(raw ?? "");
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const out: CourseRow[] = [];
  for (const line of lines) {
    const parts = line.split(/[\s,;\t]+/).filter(Boolean);
    if (parts.length < 2) continue;
    const grade = toNum(parts[0]);
    const credits = toNum(parts[1]);
    if (Number.isFinite(grade) && Number.isFinite(credits)) {
      out.push({ grade, credits });
    }
  }
  return out;
}

export const gpaCalculator: CalculatorDefinition = {
  slug: "gpa",
  name: "GPA Calculator",
  description: "Compute a grade-point average weighted by credit hours. Accepts 4.0 or 0–100 scales.",
  category: "education",
  keywords: ["grade point average", "credits", "grades", "transcript", "weighted"],
  status: "live",
  part: 1,
  inputs: [
    { name: "scale", label: "Grading scale", type: "select", default: "4.0",
      options: [{ label: "4.0 scale (0–4)", value: "4.0" }, { label: "Percentage (0–100)", value: "100" }] },
    { name: "courses", label: "Courses (one per line: <grade> <credits>)", type: "textarea",
      default: "3.7 3\n3.0 4\n4.0 3\n2.7 3", placeholder: "3.7 3\n3.0 4\n4.0 3" },
  ],
  related: ["cgpa", "weighted-average", "final-exam-score"],
  calculate: (raw) => {
    const scale = String(raw.scale ?? "4.0");
    const courses = parseCourses(raw.courses);
    if (courses.length === 0) {
      return { rows: [{ key: "gpa", label: "GPA", value: "—" }] };
    }
    const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
    const weightedSum = courses.reduce((s, c) => s + c.grade * c.credits, 0);
    const gpa = totalCredits === 0 ? NaN : weightedSum / totalCredits;
    const max = scale === "4.0" ? 4 : 100;
    const pct = (gpa / max) * 100;
    return {
      rows: [
        { key: "gpa", label: `GPA (${scale} scale)`, value: fmtFixed(gpa, 2), emphasis: "primary" },
        { key: "credits", label: "Total credits", value: fmt(totalCredits, 1) },
        { key: "courses", label: "Course count", value: `${courses.length}` },
        { key: "pct", label: "Equivalent %", value: `${fmt(pct, 1)}%` },
      ],
      summary: "Weighted GPA = Σ(grade × credits) ÷ Σ(credits). Higher-credit courses count more.",
    };
  },
  tests: [
    { name: "sample 4-course GPA", inputs: { scale: "4.0", courses: "3.7 3\n3.0 4\n4.0 3\n2.7 3" }, expected: { gpa: "3.32" } },
    { name: "single 4.0 course", inputs: { scale: "4.0", courses: "4.0 3" }, expected: { gpa: "4.00" } },
  ],
};

/* ----------------- CGPA (cumulative GPA) -------------------------- */
export const cgpaCalculator: CalculatorDefinition = {
  slug: "cgpa",
  name: "CGPA Calculator",
  description: "Cumulative GPA across multiple semesters, weighted by semester credits.",
  category: "education",
  keywords: ["cgpa", "cumulative", "semester", "gpa", "weighted"],
  status: "live",
  part: 2,
  inputs: [
    { name: "scale", label: "Grading scale", type: "select", default: "4.0",
      options: [{ label: "4.0 scale (0–4)", value: "4.0" }, { label: "10.0 scale (0–10)", value: "10" }] },
    { name: "semesters", label: "Semesters (one per line: <gpa> <credits>)", type: "textarea",
      default: "3.4 18\n3.7 20\n3.2 16\n3.9 18", placeholder: "3.4 18\n3.7 20" },
  ],
  related: ["gpa", "weighted-average"],
  calculate: (raw) => {
    const scale = String(raw.scale ?? "4.0");
    const semesters = parseCourses(raw.semesters);
    if (semesters.length === 0) {
      return { rows: [{ key: "cgpa", label: "CGPA", value: "—" }] };
    }
    const totalCredits = semesters.reduce((s, c) => s + c.credits, 0);
    const weightedSum = semesters.reduce((s, c) => s + c.grade * c.credits, 0);
    const cgpa = totalCredits === 0 ? NaN : weightedSum / totalCredits;
    const max = scale === "4.0" ? 4 : 10;
    const pct = (cgpa / max) * 100;
    const series = semesters.map((s, i) => ({ label: `Sem ${i + 1}`, value: s.grade }));
    return {
      rows: [
        { key: "cgpa", label: `CGPA (${scale} scale)`, value: fmtFixed(cgpa, 3), emphasis: "primary" },
        { key: "credits", label: "Total credits", value: fmt(totalCredits, 1) },
        { key: "pct", label: "Equivalent %", value: `${fmt(pct, 2)}%` },
      ],
      chart: { type: "bar", title: "GPA per semester", series },
      summary: "CGPA = Σ(semester GPA × credits) ÷ Σ(credits). Each semester is weighted by how many credits it carried.",
    };
  },
  tests: [
    { name: "sample CGPA", inputs: { scale: "4.0", semesters: "3.4 18\n3.7 20\n3.2 16\n3.9 18" }, expected: { cgpa: "3.564" } },
  ],
};

/* ------------------- Marks percentage ----------------------------- */
export const marksPercentage: CalculatorDefinition = {
  slug: "marks-percentage",
  name: "Marks Percentage Calculator",
  description: "Percentage score, total marks, and pass/fail status from obtained and maximum marks.",
  category: "education",
  keywords: ["marks", "percentage", "score", "exam", "test result", "pass fail"],
  status: "live",
  part: 2,
  inputs: [
    { name: "obtained", label: "Marks obtained", type: "number", default: 85, step: "any" },
    { name: "total", label: "Maximum marks", type: "number", default: 100, min: 0.0001, step: "any" },
    { name: "pass_pct", label: "Passing percentage", type: "number", default: 40, min: 0, max: 100, step: "any", unit: "%" },
  ],
  related: ["weighted-average", "final-exam-score", "gpa"],
  calculate: (raw) => {
    const obt = toNum(raw.obtained);
    const tot = toNum(raw.total);
    const passPct = toNum(raw.pass_pct);
    if (tot <= 0) {
      return { rows: [{ key: "pct", label: "Percentage", value: "—", hint: "Maximum marks must be positive.", emphasis: "warning" }] };
    }
    const pct = (obt / tot) * 100;
    const passed = pct >= passPct;
    const gap = pct - passPct;
    return {
      rows: [
        { key: "pct", label: "Percentage", value: `${fmt(pct, 2)}%`, emphasis: "primary" },
        { key: "pass", label: "Status", value: passed ? "PASS" : "FAIL", emphasis: passed ? "success" : "warning" },
        { key: "gap", label: gap >= 0 ? "Margin above pass mark" : "Shortfall", value: `${fmt(Math.abs(gap), 2)}%` },
      ],
      sections: [{
        title: "Letter grade (US scale)",
        rows: [
          { key: "grade", label: "Letter grade", value: letterGrade(pct) },
        ],
      }],
      summary: "Percentage = (obtained ÷ maximum) × 100. Letter grade uses a common US 10-point scale.",
    };
  },
  tests: [
    { name: "85/100 = 85%", inputs: { obtained: 85, total: 100, pass_pct: 40 }, expected: { pct: "85%" } },
    { name: "30/75 = 40%", inputs: { obtained: 30, total: 75, pass_pct: 40 }, expected: { pct: "40%" } },
    { name: "fails at 35/100 with 40% pass", inputs: { obtained: 35, total: 100, pass_pct: 40 }, expected: { pass: "FAIL" } },
  ],
};

function letterGrade(pct: number): string {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

/* ------------------- Weighted average ----------------------------- */
export const weightedAverage: CalculatorDefinition = {
  slug: "weighted-average",
  name: "Weighted Average Calculator",
  description: "Average of values weighted by their importance (credits, hours, percentages, etc.).",
  category: "education",
  keywords: ["weighted", "average", "mean", "weights", "credit hours"],
  status: "live",
  part: 2,
  inputs: [
    { name: "items", label: "Items (one per line: <value> <weight>)", type: "textarea",
      default: "85 3\n90 4\n78 2\n92 3", placeholder: "value weight\ne.g. 85 3" },
  ],
  related: ["average", "gpa", "weighted-assignments"],
  calculate: (raw) => {
    const items = parseCourses(raw.items);
    if (items.length === 0) {
      return { rows: [{ key: "wavg", label: "Weighted average", value: "—" }] };
    }
    const totalW = items.reduce((s, x) => s + x.credits, 0);
    if (totalW === 0) {
      return { rows: [{ key: "wavg", label: "Weighted average", value: "—", hint: "Total weight is zero." }] };
    }
    const wavg = items.reduce((s, x) => s + x.grade * x.credits, 0) / totalW;
    const plainAvg = items.reduce((s, x) => s + x.grade, 0) / items.length;
    return {
      rows: [
        { key: "wavg", label: "Weighted average", value: fmt(wavg, 4), emphasis: "primary" },
        { key: "plain", label: "Plain (unweighted) average", value: fmt(plainAvg, 4) },
        { key: "total_w", label: "Total weight", value: fmt(totalW, 4) },
      ],
      summary: "Weighted average = Σ(value × weight) ÷ Σ(weight). Use this for assignments, courses, or anything where some items count more than others.",
    };
  },
  tests: [
    { name: "85×3 + 90×4 + 78×2 + 92×3", inputs: { items: "85 3\n90 4\n78 2\n92 3" }, expected: { wavg: "87.25" } },
  ],
};

/* ---------------- Final exam score needed ------------------------- */
export const finalExamScore: CalculatorDefinition = {
  slug: "final-exam-score",
  name: "Final Exam Score Needed",
  description: "Find the score you need on the final to reach a target overall grade.",
  category: "education",
  keywords: ["final exam", "target grade", "needed score", "what do i need", "grade calculator"],
  status: "live",
  part: 2,
  inputs: [
    { name: "current", label: "Current grade (%)", type: "number", default: 85, step: "any" },
    { name: "target", label: "Target overall grade (%)", type: "number", default: 90, step: "any" },
    { name: "final_weight", label: "Final exam weight", type: "number", default: 30, min: 0.0001, max: 100, step: "any", unit: "%" },
  ],
  related: ["weighted-average", "marks-percentage", "weighted-assignments"],
  calculate: (raw) => {
    const current = toNum(raw.current);
    const target = toNum(raw.target);
    const w = toNum(raw.final_weight) / 100;
    if (w <= 0 || w > 1) {
      return { rows: [{ key: "needed", label: "Needed on final", value: "—", hint: "Weight must be between 0 and 100.", emphasis: "warning" }] };
    }
    // target = current × (1 − w) + final × w
    // final = (target − current × (1 − w)) / w
    const needed = (target - current * (1 - w)) / w;
    let hint: string | undefined;
    let emphasis: "primary" | "warning" = "primary";
    if (needed > 100) { hint = "Realistically out of reach — the final is worth too little to lift your grade that far."; emphasis = "warning"; }
    else if (needed < 0) { hint = "You've already met your target — even 0 on the final would suffice."; }
    return {
      rows: [
        { key: "needed", label: "Score needed on final", value: `${fmt(needed, 2)}%`, emphasis },
        { key: "current", label: "Current grade", value: `${fmt(current, 2)}%` },
        { key: "target", label: "Target grade", value: `${fmt(target, 2)}%` },
      ],
      summary: "Formula: needed = (target − current·(1 − w)) / w, where w is the final's weight as a decimal.",
    };
  },
  tests: [
    { name: "current 85, target 90, w=30% → 101.67%", inputs: { current: 85, target: 90, final_weight: 30 }, expected: { needed: "101.67%" } },
    { name: "current 80, target 80, w=25% → 80%", inputs: { current: 80, target: 80, final_weight: 25 }, expected: { needed: "80%" } },
    { name: "already exceeded", inputs: { current: 95, target: 80, final_weight: 30 }, expected: { needed: "45%" } },
  ],
};

/* ------------------- Weighted assignments ------------------------- */
export const weightedAssignments: CalculatorDefinition = {
  slug: "weighted-assignments",
  name: "Weighted Course Grade Calculator",
  description: "Compute a course grade from weighted categories like homework, midterm, final.",
  category: "education",
  keywords: ["course grade", "category", "syllabus", "homework", "midterm", "weighted categories"],
  status: "live",
  part: 2,
  inputs: [
    { name: "categories", label: "Categories (one per line: <name> <score%> <weight%>)", type: "textarea",
      default: "Homework 90 20\nQuizzes 85 15\nMidterm 78 25\nFinal 88 40",
      placeholder: "name score% weight%\ne.g. Homework 90 20" },
  ],
  related: ["weighted-average", "final-exam-score", "gpa"],
  calculate: (raw) => {
    const text = String(raw.categories ?? "");
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const cats: { name: string; score: number; weight: number }[] = [];
    for (const line of lines) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 3) continue;
      // First token is name, last two are score and weight
      const weight = toNum(parts[parts.length - 1]);
      const score = toNum(parts[parts.length - 2]);
      const name = parts.slice(0, parts.length - 2).join(" ");
      if (Number.isFinite(score) && Number.isFinite(weight)) {
        cats.push({ name, score, weight });
      }
    }
    if (cats.length === 0) {
      return { rows: [{ key: "grade", label: "Course grade", value: "—" }] };
    }
    const totalW = cats.reduce((s, c) => s + c.weight, 0);
    const earned = cats.reduce((s, c) => s + (c.score * c.weight) / 100, 0);
    if (totalW === 0) {
      return { rows: [{ key: "grade", label: "Course grade", value: "—", hint: "Total weight is zero." }] };
    }
    // Two conventions: (a) weights sum to 100 → grade is earned (as %);
    // (b) weights sum to < 100 → grade is earned / totalW * 100
    const grade = totalW === 100 ? earned : (earned / totalW) * 100;
    const rows = cats.map((c) => ({
      key: c.name.toLowerCase().replace(/\s+/g, "_"),
      label: `${c.name} (${fmt(c.weight, 0)}% of grade)`,
      value: `${fmt(c.score, 2)}% → contributes ${fmt((c.score * c.weight) / 100, 2)}%`,
    }));
    return {
      rows: [
        { key: "grade", label: "Course grade", value: `${fmt(grade, 2)}%`, emphasis: "primary" },
        { key: "letter", label: "Letter grade", value: letterGrade(grade) },
      ],
      sections: [
        { title: "Category breakdown", rows },
        { title: "Weight check", rows: [
          { key: "total_w", label: "Total weight", value: totalW === 100 ? `${fmt(totalW, 0)}% ✓` : `${fmt(totalW, 0)}% (rescaled)`, hint: totalW === 100 ? undefined : "Weights don't sum to 100% — rescaled proportionally." },
        ] },
      ],
      summary: "Each category contributes score × weight ÷ 100 to the final grade. If weights don't sum to 100%, the result is rescaled.",
    };
  },
  tests: [
    { name: "all 100% with 100% weights", inputs: { categories: "HW 100 50\nFinal 100 50" }, expected: { grade: "100%" } },
    { name: "homework 90 (20), quizzes 85 (15), midterm 78 (25), final 88 (40)", inputs: { categories: "Homework 90 20\nQuizzes 85 15\nMidterm 78 25\nFinal 88 40" }, expected: { grade: "85.45%" } },
  ],
};

/* ------------------- Significant figures -------------------------- */
export const significantFigures: CalculatorDefinition = {
  slug: "significant-figures",
  name: "Significant Figures Rounding",
  description: "Round a number to a specified number of significant figures and identify the count of sig figs.",
  category: "education",
  keywords: ["sig figs", "significant figures", "rounding", "precision", "scientific"],
  status: "live",
  part: 2,
  inputs: [
    { name: "value", label: "Number", type: "number", default: 12345, step: "any" },
    { name: "sig_figs", label: "Round to N sig figs", type: "number", default: 3, min: 1, max: 20, step: 1 },
  ],
  related: ["scientific-notation", "gpa"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const n = Math.max(1, Math.min(20, Math.round(toNum(raw.sig_figs))));
    if (!Number.isFinite(v) || v === 0) {
      return {
        rows: [
          { key: "rounded", label: `Rounded to ${n} sig figs`, value: v === 0 ? "0" : "—", emphasis: "primary" },
          { key: "count", label: "Sig figs in input", value: v === 0 ? "1 (by convention)" : "—" },
        ],
      };
    }
    // Count sig figs in the input string
    const inputStr = String(raw.value ?? "").trim();
    const countSig = countSigFigs(inputStr);
    // Round
    const order = Math.floor(Math.log10(Math.abs(v)));
    const factor = Math.pow(10, n - 1 - order);
    const rounded = Math.round(v * factor) / factor;
    // Format without exponential for small N
    const decimals = Math.max(0, n - 1 - order);
    const formatted = rounded.toFixed(decimals);
    return {
      rows: [
        { key: "rounded", label: `Rounded to ${n} sig figs`, value: formatted, emphasis: "primary" },
        { key: "count", label: "Sig figs in input", value: String(countSig) },
      ],
      sections: [{
        title: "Reference",
        rows: [
          { key: "rule1", label: "Non-zero digits", value: "always significant" },
          { key: "rule2", label: "Leading zeros", value: "never significant (0.0042 → 2 sf)" },
          { key: "rule3", label: "Captive zeros", value: "significant (1005 → 4 sf)" },
          { key: "rule4", label: "Trailing zeros w/ decimal", value: "significant (2.50 → 3 sf)" },
        ],
      }],
      summary: "Significant figures are the digits that carry meaning. To round to N sig figs, scale the number so the Nth digit is just before the decimal, round, then scale back.",
    };
  },
  tests: [
    { name: "12345 to 3 sf = 12300", inputs: { value: 12345, sig_figs: 3 }, expected: { rounded: "12300" } },
    { name: "0.004567 to 2 sf = 0.0046", inputs: { value: 0.004567, sig_figs: 2 }, expected: { rounded: "0.0046" } },
    { name: "3.14159 to 4 sf = 3.142", inputs: { value: 3.14159, sig_figs: 4 }, expected: { rounded: "3.142" } },
  ],
};

function countSigFigs(s: string): number {
  // Remove sign, exponent, leading zeros
  const cleaned = s.replace(/[eE][+-]?\d+$/, "").replace(/^-/, "").replace(/\./g, "");
  const withoutLeading = cleaned.replace(/^0+/, "");
  if (withoutLeading === "") return 1;
  // Trailing zeros are significant only if there's a decimal point in the original
  const hasDecimal = s.includes(".");
  if (!hasDecimal) {
    // Trailing zeros ambiguous — count all but treat trailing zeros as not significant
    return withoutLeading.replace(/0+$/, "").length || 1;
  }
  return withoutLeading.length;
}

/* --------------------- Reading time -------------------------------- */
export const readingTime: CalculatorDefinition = {
  slug: "reading-time",
  name: "Reading & Study Time Estimator",
  description: "Estimate reading time from word count and reading speed; plan study sessions from total study hours.",
  category: "education",
  keywords: ["reading time", "study", "words per minute", "wpm", "session planner"],
  status: "live",
  part: 2,
  inputs: [
    { name: "words", label: "Total words", type: "number", default: 2000, min: 0, step: 1 },
    { name: "wpm", label: "Reading speed (words per minute)", type: "number", default: 250, min: 1, step: 1,
      help: "Average adult: 200-250 wpm. Skim reading: ~400 wpm. Speed reading: 700+ wpm." },
    { name: "session_length", label: "Study session length (minutes)", type: "number", default: 25, min: 1, step: 1 },
  ],
  related: ["gpa", "marks-percentage"],
  calculate: (raw) => {
    const words = Math.max(0, toNum(raw.words));
    const wpm = Math.max(1, toNum(raw.wpm));
    const sessionLen = Math.max(1, toNum(raw.session_length));
    const totalMin = words / wpm;
    const hours = Math.floor(totalMin / 60);
    const mins = Math.round(totalMin % 60);
    const sessions = Math.ceil(totalMin / sessionLen);
    const breakMin = Math.max(0, (sessions - 1) * 5); // 5-min break between sessions
    const totalWithBreaks = totalMin + breakMin;
    return {
      rows: [
        { key: "time", label: "Estimated reading time", value: `${hours}h ${mins}m`, emphasis: "primary" },
        { key: "total_min", label: "Total minutes", value: fmt(totalMin, 1) },
        { key: "sessions", label: `Sessions (at ${fmt(sessionLen, 0)} min each)`, value: String(sessions) },
        { key: "with_breaks", label: "Including 5-min breaks", value: `${fmt(totalWithBreaks, 1)} min` },
      ],
      sections: [{
        title: "Pages estimate",
        rows: [
          { key: "pages", label: "Approx pages (300 wpp)", value: fmt(words / 300, 1) },
          { key: "minutes_per_page", label: "Minutes per page", value: fmt(300 / wpm, 2) },
        ],
      }],
      summary: "Reading time = words ÷ WPM. The default 250 WPM is typical for adult non-fiction; technical material is closer to 150-200 WPM.",
    };
  },
  tests: [
    { name: "2000 words at 250 wpm = 8 min", inputs: { words: 2000, wpm: 250, session_length: 25 }, expected: { total_min: "8" } },
    { name: "6000 words at 200 wpm = 30 min", inputs: { words: 6000, wpm: 200, session_length: 25 }, expected: { total_min: "30" } },
  ],
};
