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
  related: ["grade-calculator", "test-score"],
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
