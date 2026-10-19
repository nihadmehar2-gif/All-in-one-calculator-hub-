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
  plan({ slug: "percentage-change", name: "Percentage Change Calculator", description: "Percent increase or decrease between two values.", category: "basic-math", keywords: ["change", "growth", "increase"], inputs: [], part: 2 }),
  plan({ slug: "decimal-to-fraction", name: "Decimal to Fraction", description: "Convert any decimal to a simplified fraction.", category: "basic-math", keywords: ["decimal", "fraction"], inputs: [], part: 2 }),
  plan({ slug: "ratio-simplifier", name: "Ratio Simplifier", description: "Simplify ratios to their lowest terms.", category: "basic-math", keywords: ["ratio"], inputs: [], part: 2 }),

  /* algebra */
  plan({ slug: "linear-equation-solver", name: "Linear Equation Solver", description: "Solve ax + b = c for x.", category: "algebra", keywords: ["linear", "equation"], inputs: [], part: 2 }),
  plan({ slug: "quadratic-solver", name: "Quadratic Equation Solver", description: "Find real and complex roots of ax² + bx + c = 0.", category: "algebra", keywords: ["quadratic", "roots"], inputs: [], part: 2 }),
  plan({ slug: "system-of-equations", name: "System of Linear Equations", description: "2x2 and 3x3 systems by substitution / Cramer's rule.", category: "algebra", keywords: ["system", "cramer"], inputs: [], part: 3 }),

  /* geometry */
  plan({ slug: "right-triangle", name: "Right Triangle Solver", description: "Pythagorean theorem and missing sides/angles.", category: "geometry", keywords: ["pythagoras", "right angle"], inputs: [], part: 2 }),
  plan({ slug: "sphere-volume", name: "Sphere Volume & Surface", description: "Volume and surface area of a sphere from radius.", category: "geometry", keywords: ["sphere", "ball"], inputs: [], part: 2 }),
  plan({ slug: "trig-identity", name: "Trigonometric Identity Evaluator", description: "Evaluate sin/cos/tan in degrees or radians.", category: "geometry", keywords: ["sin", "cos", "tan"], inputs: [], part: 3 }),

  /* calculus */
  plan({ slug: "derivative", name: "Numerical Derivative", description: "Estimate derivative of a function at a point.", category: "calculus", keywords: ["derivative", "differentiation"], inputs: [], part: 3 }),
  plan({ slug: "definite-integral", name: "Definite Integral (Simpson)", description: "Approximate ∫f(x)dx using Simpson's rule.", category: "calculus", keywords: ["integral", "area under curve"], inputs: [], part: 3 }),

  /* statistics */
  plan({ slug: "permutations-combinations", name: "Permutations & Combinations", description: "nPr and nCr with factorials.", category: "statistics", keywords: ["npr", "ncr", "factorial"], inputs: [], part: 2 }),
  plan({ slug: "binomial-probability", name: "Binomial Probability", description: "P(X=k) for binomial distribution.", category: "statistics", keywords: ["binomial", "probability"], inputs: [], part: 3 }),
  plan({ slug: "normal-distribution", name: "Normal Distribution", description: "Z-scores and cumulative probabilities.", category: "statistics", keywords: ["normal", "z-score", "bell"], inputs: [], part: 3 }),

  /* finance */
  plan({ slug: "mortgage-affordability", name: "Mortgage Affordability", description: "How much house can you afford on your income?", category: "finance", keywords: ["mortgage", "afford"], inputs: [], part: 2 }),
  plan({ slug: "savings-goal", name: "Savings Goal Calculator", description: "How much to save monthly to reach a goal.", category: "finance", keywords: ["savings", "goal"], inputs: [], part: 2 }),
  plan({ slug: "present-value", name: "Present Value of an Annuity", description: "Today's value of a stream of future payments.", category: "finance", keywords: ["pv", "annuity"], inputs: [], part: 3 }),
  plan({ slug: "rule-of-72", name: "Rule of 72", description: "Years to double money at a given rate.", category: "finance", keywords: ["double", "rule 72"], inputs: [], part: 2 }),

  /* taxes */
  plan({ slug: "income-tax", name: "Income Tax Estimator", description: "Federal income tax estimate (US brackets).", category: "taxes", keywords: ["tax", "income"], inputs: [], part: 3 }),
  plan({ slug: "take-home-pay", name: "Take-Home Pay", description: "Net pay after tax, SS, Medicare.", category: "taxes", keywords: ["salary", "net"], inputs: [], part: 3 }),
  plan({ slug: "sales-tax", name: "Sales Tax Calculator", description: "Add or remove sales tax from a price.", category: "taxes", keywords: ["sales tax"], inputs: [], part: 2 }),

  /* business */
  plan({ slug: "margin-markup", name: "Margin & Markup", description: "Convert between gross margin and markup.", category: "business", keywords: ["margin", "markup"], inputs: [], part: 2 }),
  plan({ slug: "breakeven", name: "Break-Even Analysis", description: "Units needed to cover fixed costs.", category: "business", keywords: ["breakeven"], inputs: [], part: 2 }),
  plan({ slug: "depreciation-straight-line", name: "Straight-Line Depreciation", description: "Annual depreciation of an asset.", category: "business", keywords: ["depreciation"], inputs: [], part: 3 }),

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
  plan({ slug: "data-size-converter", name: "Data Size Converter", description: "Bit, byte, KB, MB, GB, TB (binary & decimal).", category: "conversions", keywords: ["data", "bytes"], inputs: [], part: 2 }),

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
  plan({ slug: "grade-calculator", name: "Grade Calculator", description: "Weighted class grade from categories.", category: "education", keywords: ["grade"], inputs: [], part: 3 }),
  plan({ slug: "test-score", name: "Test Score Calculator", description: "Percent and letter grade from raw points.", category: "education", keywords: ["test"], inputs: [], part: 3 }),

  /* computer-science */
  plan({ slug: "number-base-converter", name: "Number Base Converter", description: "Binary / octal / decimal / hex.", category: "computer-science", keywords: ["binary", "hex"], inputs: [], part: 3 }),
  plan({ slug: "bitwise-calculator", name: "Bitwise Calculator", description: "AND, OR, XOR, NOT, shifts.", category: "computer-science", keywords: ["bitwise"], inputs: [], part: 3 }),
  plan({ slug: "color-converter", name: "Color Converter (HEX/RGB/HSL)", description: "Convert between color spaces.", category: "computer-science", keywords: ["color", "hex"], inputs: [], part: 3 }),

  /* data-networking */
  plan({ slug: "subnet-calculator", name: "Subnet Calculator", description: "Network, broadcast, host range from CIDR.", category: "data-networking", keywords: ["subnet", "cidr"], inputs: [], part: 4 }),
  plan({ slug: "bandwidth-calculator", name: "Bandwidth Calculator", description: "Time to transfer a file at a given rate.", category: "data-networking", keywords: ["bandwidth"], inputs: [], part: 4 }),

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
  plan({ slug: "rent-vs-buy", name: "Rent vs Buy", description: "Break-even horizon for ownership.", category: "real-estate", keywords: ["rent", "buy"], inputs: [], part: 5 }),
  plan({ slug: "cap-rate", name: "Cap Rate", description: "Real-estate capitalization rate.", category: "real-estate", keywords: ["cap rate"], inputs: [], part: 5 }),

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
