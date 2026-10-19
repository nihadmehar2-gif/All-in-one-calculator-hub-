/**
 * Planned calculators — tracked in the registry but NOT exposed.
 *
 * Each entry below is a placeholder that documents intent for future build
 * parts. They have NO calculate() logic and NO test cases, so they are
 * excluded from search, directory, category pages and all UI surfaces.
 *
 * When a future Part implements one of these, the placeholder is replaced
 * by a real CalculatorDefinition with `status: "live"`, real `inputs`,
 * a pure `calculate`, and at least one `tests` entry.
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
  /* algebra */
  plan({ slug: "system-of-equations", name: "System of Linear Equations (3x3)", description: "3x3 systems by Cramer's rule.", category: "algebra", keywords: ["system", "cramer", "3x3"], inputs: [], part: 5 }),
  plan({ slug: "inequalities-solver", name: "Linear Inequalities Solver", description: "Solve linear inequalities and graph the solution.", category: "algebra", keywords: ["inequality", "linear"], inputs: [], part: 5 }),

  /* calculus */
  plan({ slug: "limits", name: "Limits Evaluator", description: "Numerical limit of f(x) as x approaches a.", category: "calculus", keywords: ["limit", "approaches"], inputs: [], part: 5 }),
  plan({ slug: "taylor-series", name: "Taylor Series Expansion", description: "Expand f(x) around a point to N terms.", category: "calculus", keywords: ["taylor", "series", "maclaurin"], inputs: [], part: 5 }),

  /* health */
  plan({ slug: "calorie-target", name: "Calorie Target (TDEE-based)", description: "TDEE and goal-adjusted calories.", category: "health", keywords: ["tdee", "calories"], inputs: [], part: 5 }),

  /* science */
  plan({ slug: "power-calculator", name: "Power Calculator", description: "Electrical and mechanical power.", category: "science", keywords: ["power", "watt"], inputs: [], part: 5 }),
  plan({ slug: "torque-calculator", name: "Torque Calculator", description: "Torque = force × lever arm.", category: "science", keywords: ["torque", "moment"], inputs: [], part: 5 }),

  /* engineering */
  plan({ slug: "pipe-flow", name: "Pipe Flow (Hazen-Williams)", description: "Flow rate from pipe diameter and pressure drop.", category: "engineering", keywords: ["pipe", "flow", "fluid"], inputs: [], part: 5 }),

  /* construction */
  plan({ slug: "roof-area", name: "Roof Area Estimator (advanced)", description: "Hip, valley, and dormer-aware roof area.", category: "construction", keywords: ["roof"], inputs: [], part: 5 }),

  /* automotive */
  plan({ slug: "ev-range", name: "EV Range Estimator", description: "Estimated range from battery kWh.", category: "automotive", keywords: ["ev", "electric"], inputs: [], part: 5 }),
  plan({ slug: "tire-size", name: "Tire Size Calculator", description: "Compute tire diameter from size code.", category: "automotive", keywords: ["tire"], inputs: [], part: 5 }),

  /* cooking */
  plan({ slug: "baking-ratio", name: "Baker's Percentage", description: "Hydration and baker's ratios.", category: "cooking", keywords: ["baking"], inputs: [], part: 5 }),
  plan({ slug: "nutrition-facts", name: "Nutrition Facts from Recipe", description: "Aggregate macros from ingredient list.", category: "cooking", keywords: ["nutrition", "macros"], inputs: [], part: 5 }),

  /* agriculture */
  plan({ slug: "irrigation-calculator", name: "Irrigation Volume", description: "Water needed per zone.", category: "agriculture", keywords: ["irrigation"], inputs: [], part: 5 }),
  plan({ slug: "crop-yield", name: "Crop Yield Estimator", description: "Expected yield per hectare from planting density.", category: "agriculture", keywords: ["crop", "yield"], inputs: [], part: 5 }),

  /* environment */
  plan({ slug: "water-footprint", name: "Water Footprint", description: "Annual direct + indirect water usage.", category: "environment", keywords: ["water", "footprint"], inputs: [], part: 5 }),

  /* real-estate */
  plan({ slug: "property-tax", name: "Property Tax Estimator", description: "Annual property tax from assessed value and rate.", category: "real-estate", keywords: ["property tax"], inputs: [], part: 5 }),
  plan({ slug: "hoa-impact", name: "HOA Cost Impact", description: "Total HOA cost over holding period.", category: "real-estate", keywords: ["hoa"], inputs: [], part: 5 }),

  /* shopping */
  plan({ slug: "coupon-stack", name: "Coupon Stack Optimizer", description: "Best order to apply multiple coupons.", category: "shopping", keywords: ["coupon", "stack"], inputs: [], part: 5 }),

  /* sports */
  plan({ slug: "odds-converter", name: "Odds Converter", description: "Decimal / fractional / implied probability.", category: "sports", keywords: ["odds"], inputs: [], part: 5 }),
  plan({ slug: "handicap-calculator", name: "Golf Handicap", description: "Course handicap from index and slope.", category: "sports", keywords: ["golf", "handicap"], inputs: [], part: 5 }),

  /* pets */
  plan({ slug: "cat-age", name: "Cat Age Calculator", description: "Human-equivalent cat age.", category: "pets", keywords: ["cat age"], inputs: [], part: 5 }),
  plan({ slug: "horse-weight", name: "Horse Weight Estimator", description: "Equine body weight from heart girth.", category: "pets", keywords: ["horse", "equine"], inputs: [], part: 5 }),

  /* parenting */
  plan({ slug: "due-date", name: "Pregnancy Due Date (basic)", description: "Estimate due date from LMP.", category: "parenting", keywords: ["due date", "pregnancy"], inputs: [], part: 5 }),
  plan({ slug: "ovulation", name: "Ovulation Calendar", description: "Fertile window estimate.", category: "parenting", keywords: ["ovulation"], inputs: [], part: 5 }),
  plan({ slug: "child-growth-percentile", name: "Child Growth Percentile", description: "WHO/CDC growth chart percentile.", category: "parenting", keywords: ["growth", "child"], inputs: [], part: 5 }),

  /* astronomy */
  plan({ slug: "orbital-period", name: "Orbital Period (Kepler)", description: "T² = (4π²/GM) a³.", category: "astronomy", keywords: ["orbit", "kepler"], inputs: [], part: 5 }),
  plan({ slug: "light-time", name: "Light Travel Time", description: "Time for light to cross a distance.", category: "astronomy", keywords: ["light", "distance"], inputs: [], part: 5 }),
  plan({ slug: "stellar-distance", name: "Stellar Parallax Distance", description: "Distance in parsecs from parallax angle.", category: "astronomy", keywords: ["parsec", "parallax"], inputs: [], part: 5 }),

  /* manufacturing */
  plan({ slug: "oee", name: "OEE Calculator", description: "Overall equipment effectiveness.", category: "manufacturing", keywords: ["oee"], inputs: [], part: 5 }),
  plan({ slug: "cycle-time", name: "Cycle Time", description: "Time per unit / units per hour.", category: "manufacturing", keywords: ["cycle"], inputs: [], part: 5 }),
  plan({ slug: "throughput", name: "Throughput Calculator", description: "Units per shift accounting for downtime.", category: "manufacturing", keywords: ["throughput"], inputs: [], part: 5 }),

  /* logistics */
  plan({ slug: "container-packing", name: "Container Packing", description: "How many cartons fit a shipping container.", category: "logistics", keywords: ["container"], inputs: [], part: 5 }),
  plan({ slug: "eta-calculator", name: "ETA Calculator", description: "Arrival time from distance and speed with stops.", category: "logistics", keywords: ["eta"], inputs: [], part: 5 }),

  /* productivity */
  plan({ slug: "hourly-rate", name: "Hourly Rate Calculator", description: "Effective hourly rate from salary.", category: "productivity", keywords: ["hourly rate"], inputs: [], part: 5 }),
  plan({ slug: "pomodoro-planner", name: "Pomodoro Planner", description: "Sessions and break scheduling.", category: "productivity", keywords: ["pomodoro"], inputs: [], part: 5 }),

  /* specialized */
  plan({ slug: "concrete-strength", name: "Concrete Strength (Mix)", description: "MPa from mix proportions.", category: "specialized", keywords: ["concrete", "mpa"], inputs: [], part: 5 }),
  plan({ slug: "paint-coverage-pro", name: "Paint Coverage Pro", description: "Multi-room paint estimator.", category: "specialized", keywords: ["paint"], inputs: [], part: 5 }),
  plan({ slug: "medical-dose", name: "Medical Drug Dosage", description: "Weight-based drug dose calculator (professional use only).", category: "specialized", keywords: ["medical", "dose"], inputs: [], part: 5 }),
];
