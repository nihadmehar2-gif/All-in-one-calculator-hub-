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
 *
 * The list below is intentionally compact: it captures the high-value
 * calculators we plan to ship per category. Hundreds more can be appended
 * over time without touching any UI code.
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
  /* basic-math */

  /* algebra */
  plan({ slug: "system-of-equations", name: "System of Linear Equations", description: "2x2 and 3x3 systems by substitution / Cramer's rule.", category: "algebra", keywords: ["system", "cramer"], inputs: [], part: 3 }),

  /* geometry */

  /* calculus */

  /* statistics */

  /* finance */

  /* taxes */

  /* business */

  /* health */
  plan({ slug: "bmr", name: "BMR Calculator", description: "Basal metabolic rate (Mifflin-St Jeor).", category: "health", keywords: ["bmr", "metabolism"], inputs: [], part: 2 }),
  plan({ slug: "ideal-weight", name: "Ideal Body Weight", description: "Devine / Robinson formulas.", category: "health", keywords: ["ideal weight"], inputs: [], part: 2 }),
  plan({ slug: "body-fat", name: "Body Fat % (US Navy)", description: "Body fat percentage from circumference measurements.", category: "health", keywords: ["body fat"], inputs: [], part: 3 }),
  plan({ slug: "calorie-target", name: "Calorie Target", description: "TDEE and goal-adjusted calories.", category: "health", keywords: ["tdee", "calories"], inputs: [], part: 2 }),
  plan({ slug: "water-intake", name: "Water Intake", description: "Daily water needs by weight and activity.", category: "health", keywords: ["water", "hydration"], inputs: [], part: 3 }),

  /* date-time */
  plan({ slug: "age-calculator", name: "Age Calculator", description: "Exact age in years, months and days.", category: "date-time", keywords: ["age", "birthday"], inputs: [], part: 2 }),
  plan({ slug: "workday-counter", name: "Workday Counter", description: "Business days between two dates.", category: "date-time", keywords: ["workday", "business day"], inputs: [], part: 3 }),
  plan({ slug: "timezone-converter", name: "Timezone Converter", description: "Convert a time across timezones.", category: "date-time", keywords: ["timezone"], inputs: [], part: 3 }),

  /* conversions */
  plan({ slug: "mass-converter", name: "Mass Converter", description: "g, kg, lb, oz, ton.", category: "conversions", keywords: ["mass", "weight"], inputs: [], part: 2 }),
  plan({ slug: "speed-converter", name: "Speed Converter", description: "m/s, km/h, mph, knot.", category: "conversions", keywords: ["speed"], inputs: [], part: 2 }),
  plan({ slug: "volume-converter", name: "Volume Converter", description: "ml, L, gal, cup, fl oz.", category: "conversions", keywords: ["volume"], inputs: [], part: 2 }),
  plan({ slug: "pressure-converter", name: "Pressure Converter", description: "Pa, bar, psi, atm, mmHg.", category: "conversions", keywords: ["pressure"], inputs: [], part: 3 }),

  /* science */
  plan({ slug: "power-calculator", name: "Power Calculator", description: "Electrical and mechanical power.", category: "science", keywords: ["power", "watt"], inputs: [], part: 3 }),
  plan({ slug: "kinematics", name: "Kinematics (SUVAT)", description: "Solve uniform-acceleration motion.", category: "science", keywords: ["motion", "acceleration"], inputs: [], part: 3 }),
  plan({ slug: "newtons-second", name: "Newton's Second Law (F=ma)", description: "Force, mass or acceleration.", category: "science", keywords: ["force", "mass"], inputs: [], part: 3 }),

  /* chemistry */
  plan({ slug: "molar-mass", name: "Molar Mass", description: "Molar mass from a formula.", category: "chemistry", keywords: ["mole"], inputs: [], part: 4 }),
  plan({ slug: "molarity", name: "Molarity Calculator", description: "Moles per litre of solution.", category: "chemistry", keywords: ["molarity"], inputs: [], part: 4 }),
  plan({ slug: "dilution", name: "Dilution (C1V1=C2V2)", description: "Solvent to reach a target concentration.", category: "chemistry", keywords: ["dilution"], inputs: [], part: 4 }),

  /* engineering */
  plan({ slug: "resistor-color-code", name: "Resistor Color Code", description: "Decode 4/5-band resistors.", category: "engineering", keywords: ["resistor", "color"], inputs: [], part: 3 }),
  plan({ slug: "led-resistor", name: "LED Series Resistor", description: "Current-limiting resistor for an LED.", category: "engineering", keywords: ["led"], inputs: [], part: 3 }),
  plan({ slug: "rc-time-constant", name: "RC Time Constant", description: "τ = R × C for charging circuits.", category: "engineering", keywords: ["rc"], inputs: [], part: 4 }),

  /* construction */
  plan({ slug: "paint-coverage", name: "Paint Coverage", description: "Gallons of paint for a room.", category: "construction", keywords: ["paint"], inputs: [], part: 4 }),
  plan({ slug: "concrete-volume", name: "Concrete Volume", description: "Cubic yards for a slab.", category: "construction", keywords: ["concrete"], inputs: [], part: 4 }),
  plan({ slug: "roof-area", name: "Roof Area Estimator", description: "Roof area from footprint and pitch.", category: "construction", keywords: ["roof"], inputs: [], part: 4 }),

  /* education */

  /* computer-science */

  /* data-networking */

  /* automotive */
  plan({ slug: "fuel-economy", name: "Fuel Economy", description: "MPG, L/100km and trip cost.", category: "automotive", keywords: ["fuel", "mpg"], inputs: [], part: 4 }),
  plan({ slug: "ev-range", name: "EV Range Estimator", description: "Estimated range from battery kWh.", category: "automotive", keywords: ["ev", "electric"], inputs: [], part: 5 }),

  /* cooking */
  plan({ slug: "recipe-scaler", name: "Recipe Scaler", description: "Scale recipe quantities up or down.", category: "cooking", keywords: ["recipe"], inputs: [], part: 4 }),
  plan({ slug: "baking-ratio", name: "Baker's Percentage", description: "Hydration and baker's ratios.", category: "cooking", keywords: ["baking"], inputs: [], part: 5 }),

  /* agriculture */
  plan({ slug: "fertilizer-calculator", name: "Fertilizer Rate", description: "Nutrient application per area.", category: "agriculture", keywords: ["fertilizer"], inputs: [], part: 5 }),
  plan({ slug: "irrigation-calculator", name: "Irrigation Volume", description: "Water needed per zone.", category: "agriculture", keywords: ["irrigation"], inputs: [], part: 5 }),

  /* environment */
  plan({ slug: "carbon-footprint", name: "Carbon Footprint", description: "Annual CO₂ estimate from energy use.", category: "environment", keywords: ["carbon"], inputs: [], part: 5 }),
  plan({ slug: "electricity-bill", name: "Electricity Bill Estimator", description: "kWh × rate × appliances.", category: "environment", keywords: ["electricity"], inputs: [], part: 4 }),

  /* real-estate */

  /* shopping */
  plan({ slug: "discount-calculator", name: "Discount Calculator", description: "Final price after percent-off.", category: "shopping", keywords: ["discount"], inputs: [], part: 2 }),
  plan({ slug: "unit-price", name: "Unit Price", description: "Best value per unit between packages.", category: "shopping", keywords: ["unit price"], inputs: [], part: 2 }),
  plan({ slug: "tip-calculator", name: "Tip Calculator", description: "Tip and split a bill.", category: "shopping", keywords: ["tip"], inputs: [], part: 2 }),

  /* sports */
  plan({ slug: "running-pace", name: "Running Pace", description: "Pace, time, or distance.", category: "sports", keywords: ["pace", "run"], inputs: [], part: 4 }),
  plan({ slug: "odds-converter", name: "Odds Converter", description: "Decimal / fractional / implied probability.", category: "sports", keywords: ["odds"], inputs: [], part: 5 }),

  /* pets */
  plan({ slug: "dog-age", name: "Dog Age Calculator", description: "Human-equivalent dog age.", category: "pets", keywords: ["dog age"], inputs: [], part: 5 }),
  plan({ slug: "pet-calorie", name: "Pet Calorie Needs", description: "RER and DER for dogs/cats.", category: "pets", keywords: ["pet", "calorie"], inputs: [], part: 5 }),

  /* parenting */
  plan({ slug: "due-date", name: "Pregnancy Due Date", description: "Estimate due date from LMP.", category: "parenting", keywords: ["due date", "pregnancy"], inputs: [], part: 5 }),
  plan({ slug: "ovulation", name: "Ovulation Calendar", description: "Fertile window estimate.", category: "parenting", keywords: ["ovulation"], inputs: [], part: 5 }),

  /* astronomy */
  plan({ slug: "orbital-period", name: "Orbital Period (Kepler)", description: "T² = (4π²/GM) a³.", category: "astronomy", keywords: ["orbit", "kepler"], inputs: [], part: 5 }),
  plan({ slug: "light-time", name: "Light Travel Time", description: "Time for light to cross a distance.", category: "astronomy", keywords: ["light", "distance"], inputs: [], part: 5 }),

  /* manufacturing */
  plan({ slug: "oee", name: "OEE Calculator", description: "Overall equipment effectiveness.", category: "manufacturing", keywords: ["oee"], inputs: [], part: 5 }),
  plan({ slug: "cycle-time", name: "Cycle Time", description: "Time per unit / units per hour.", category: "manufacturing", keywords: ["cycle"], inputs: [], part: 5 }),

  /* logistics */
  plan({ slug: "volumetric-weight", name: "Volumetric Weight", description: "DIM weight for shipping.", category: "logistics", keywords: ["volumetric", "dim"], inputs: [], part: 5 }),
  plan({ slug: "container-packing", name: "Container Packing", description: "How many cartons fit a container.", category: "logistics", keywords: ["container"], inputs: [], part: 5 }),

  /* productivity */
  plan({ slug: "hourly-rate", name: "Hourly Rate Calculator", description: "Effective hourly rate from salary.", category: "productivity", keywords: ["hourly rate"], inputs: [], part: 3 }),
  plan({ slug: "pomodoro-planner", name: "Pomodoro Planner", description: "Sessions and break scheduling.", category: "productivity", keywords: ["pomodoro"], inputs: [], part: 4 }),

  /* specialized */
  plan({ slug: "concrete-strength", name: "Concrete Strength (Mix)", description: " MPa from mix proportions.", category: "specialized", keywords: ["concrete", "mpa"], inputs: [], part: 5 }),
  plan({ slug: "paint-coverage-pro", name: "Paint Coverage Pro", description: "Multi-room paint estimator.", category: "specialized", keywords: ["paint"], inputs: [], part: 5 }),
];
