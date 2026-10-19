/**
 * Planned calculators — backlog requiring more research or specialist validation.
 *
 * Each entry below is a placeholder that documents intent for future build
 * work. They have NO calculate() logic and NO test cases, so they are
 * excluded from search, directory, category pages and all UI surfaces.
 *
 * These calculators are kept on the backlog rather than shipped because:
 *   - The formula depends on jurisdiction-specific data we haven't verified
 *     (e.g. state-specific tax rules, country-specific payroll rules)
 *   - The output is medically or legally consequential and should be
 *     reviewed by a subject-matter expert before publication
 *   - The calculation requires live data feeds (exchange rates, weather)
 *     we don't currently have a reliable free source for
 *   - The math is complex enough to warrant peer review
 *
 * Users can request any of these (or new ones) via the /request page.
 */
import type { CalculatorDefinition } from "../types";

const noop = () => ({ rows: [{ key: "todo", label: "Planned", value: "—" }] });

type Plan = Omit<CalculatorDefinition, "calculate" | "tests" | "status"> & {
  status?: "planned";
};

const plan = (p: Plan): CalculatorDefinition => ({
  status: "planned",
  calculate: noop,
  tests: [],
  ...p,
});

export const PLANNED_CALCULATORS: CalculatorDefinition[] = [
  /* algebra — needs symbolic algebra engine */
  plan({ slug: "system-of-equations-3x3", name: "System of Linear Equations (3x3)", description: "3x3 systems by Cramer's rule.", category: "algebra", keywords: ["system", "cramer", "3x3"], inputs: [], part: 5 }),
  plan({ slug: "inequalities-solver", name: "Linear Inequalities Solver", description: "Solve linear inequalities and graph the solution.", category: "algebra", keywords: ["inequality", "linear"], inputs: [], part: 5 }),

  /* calculus — needs better numerical methods or symbolic differentiation */
  plan({ slug: "limits", name: "Limits Evaluator", description: "Numerical limit of f(x) as x approaches a.", category: "calculus", keywords: ["limit", "approaches"], inputs: [], part: 5 }),
  plan({ slug: "taylor-series", name: "Taylor Series Expansion", description: "Expand f(x) around a point to N terms.", category: "calculus", keywords: ["taylor", "series", "maclaurin"], inputs: [], part: 5 }),

  /* automotive — EV range needs verified battery efficiency data */
  plan({ slug: "ev-range", name: "EV Range Estimator", description: "Estimated range from battery kWh.", category: "automotive", keywords: ["ev", "electric"], inputs: [], part: 5 }),
  plan({ slug: "tire-size", name: "Tire Size Calculator", description: "Compute tire diameter from size code.", category: "automotive", keywords: ["tire"], inputs: [], part: 5 }),

  /* construction — advanced roof needs more research */
  plan({ slug: "roof-area-advanced", name: "Roof Area Estimator (advanced)", description: "Hip, valley, and dormer-aware roof area.", category: "construction", keywords: ["roof"], inputs: [], part: 5 }),

  /* cooking — nutrition aggregator needs verified food composition database */
  plan({ slug: "nutrition-facts", name: "Nutrition Facts from Recipe", description: "Aggregate macros from ingredient list.", category: "cooking", keywords: ["nutrition", "macros"], inputs: [], part: 5 }),

  /* specialized — these need medical/legal review before publication */
  plan({ slug: "medical-dose", name: "Medical Drug Dosage", description: "Weight-based drug dose calculator (professional use only).", category: "specialized", keywords: ["medical", "dose"], inputs: [], part: 5 }),
  plan({ slug: "concrete-strength", name: "Concrete Strength (Mix)", description: "MPa from mix proportions — requires regional code review.", category: "specialized", keywords: ["concrete", "mpa"], inputs: [], part: 5 }),
  plan({ slug: "paint-coverage-pro", name: "Paint Coverage Pro", description: "Multi-room paint estimator with custom per-room inputs.", category: "specialized", keywords: ["paint"], inputs: [], part: 5 }),

  /* engineering — torque calculator needs more validation */
  plan({ slug: "torque-calculator", name: "Torque Calculator", description: "Torque = force × lever arm.", category: "science", keywords: ["torque", "moment"], inputs: [], part: 5 }),

  /* shopping — coupon stacking needs more research */
  plan({ slug: "coupon-stack", name: "Coupon Stack Optimizer", description: "Best order to apply multiple coupons.", category: "shopping", keywords: ["coupon", "stack"], inputs: [], part: 5 }),

  /* pets — cat age and horse weight need species-specific formulas reviewed */
  plan({ slug: "cat-age", name: "Cat Age Calculator", description: "Human-equivalent cat age.", category: "pets", keywords: ["cat age"], inputs: [], part: 5 }),
  plan({ slug: "horse-weight", name: "Horse Weight Estimator", description: "Equine body weight from heart girth.", category: "pets", keywords: ["horse", "equine"], inputs: [], part: 5 }),
];
