/**
 * Server-safe category data (no React components, no "use client").
 * This mirrors categories.tsx but without Lucide icon imports.
 * Used by server components (dynamic routes, sitemap).
 */
export interface CategoryData {
  id: string;
  name: string;
  description: string;
  color: string;
  order: number;
}

export const CATEGORIES_DATA: CategoryData[] = [
  { id: "basic-math", name: "Basic Mathematics", description: "Percentages, averages, fractions and everyday arithmetic.", color: "slate", order: 1 },
  { id: "algebra", name: "Algebra and Equations", description: "Solve linear and quadratic equations, systems and polynomials.", color: "slate", order: 2 },
  { id: "geometry", name: "Geometry and Trigonometry", description: "Areas, volumes, angles and trigonometric identities.", color: "slate", order: 3 },
  { id: "calculus", name: "Calculus", description: "Derivatives, integrals, limits and series.", color: "slate", order: 4 },
  { id: "statistics", name: "Statistics and Probability", description: "Mean, median, standard deviation, distributions and probability.", color: "emerald", order: 5 },
  { id: "finance", name: "Finance and Banking", description: "Loans, interest, savings, investments and currency math.", color: "emerald", order: 6 },
  { id: "taxes", name: "Taxes and Salary", description: "Income tax, payroll deductions, take-home pay and bonuses.", color: "emerald", order: 7 },
  { id: "business", name: "Business and Accounting", description: "Margin, markup, depreciation, breakeven and P&L math.", color: "emerald", order: 8 },
  { id: "health", name: "Health and Fitness", description: "BMI, BMR, body fat, macros, hydration and training load.", color: "rose", order: 9 },
  { id: "date-time", name: "Date and Time", description: "Date differences, durations, age and timezone math.", color: "amber", order: 10 },
  { id: "conversions", name: "Unit Conversions", description: "Length, mass, temperature, pressure, speed and more.", color: "amber", order: 11 },
  { id: "science", name: "Science and Physics", description: "Motion, energy, electricity, waves and constants.", color: "sky", order: 12 },
  { id: "chemistry", name: "Chemistry", description: "Moles, molarity, dilution, gas laws and reaction math.", color: "sky", order: 13 },
  { id: "engineering", name: "Engineering and Electronics", description: "Ohm's law, RC circuits, power, resistors and logic gates.", color: "sky", order: 14 },
  { id: "construction", name: "Construction and Home Improvement", description: "Paint, flooring, concrete, roofing and DIY takeoffs.", color: "amber", order: 15 },
  { id: "education", name: "Education and Grades", description: "GPA, test scores, weighted grades and study planners.", color: "violet", order: 16 },
  { id: "computer-science", name: "Computer Science and Technology", description: "Number bases, bit ops, hash, color and algorithmic math.", color: "violet", order: 17 },
  { id: "data-networking", name: "Data, Storage and Networking", description: "Bandwidth, subnetting, IP, RAID and storage sizing.", color: "violet", order: 18 },
  { id: "automotive", name: "Automotive and Transportation", description: "Fuel economy, trip cost, tire size and EV range.", color: "amber", order: 19 },
  { id: "cooking", name: "Cooking, Food and Nutrition", description: "Recipe scaling, baking ratios and nutrition math.", color: "rose", order: 20 },
  { id: "agriculture", name: "Agriculture and Gardening", description: "Yield, fertilizer, irrigation, seed and crop math.", color: "emerald", order: 21 },
  { id: "environment", name: "Environment and Energy", description: "Solar, carbon, electricity bills and efficiency.", color: "emerald", order: 22 },
  { id: "real-estate", name: "Real Estate and Property", description: "Mortgage, rent vs buy, ROI and property yields.", color: "emerald", order: 23 },
  { id: "shopping", name: "Shopping and Everyday Life", description: "Discounts, coupons, unit price and tip math.", color: "rose", order: 24 },
  { id: "sports", name: "Sports and Games", description: "Pace, odds, handicaps and training metrics.", color: "amber", order: 25 },
  { id: "pets", name: "Pets and Animals", description: "Pet age, food portions, dosage and breeding math.", color: "rose", order: 26 },
  { id: "parenting", name: "Pregnancy and Parenting", description: "Due date, ovulation, growth percentiles and feeding.", color: "rose", order: 27 },
  { id: "astronomy", name: "Astronomy and Space", description: "Orbital periods, distances, light-time and stargazing.", color: "sky", order: 28 },
  { id: "manufacturing", name: "Manufacturing and Industry", description: "Cycle time, OEE, throughput and material yield.", color: "amber", order: 29 },
  { id: "logistics", name: "Logistics and Shipping", description: "Volumetric weight, freight, ETA and container packing.", color: "amber", order: 30 },
  { id: "productivity", name: "Time Tracking and Productivity", description: "Pomodoro, hourly rate, time budgets and focus metrics.", color: "violet", order: 31 },
  { id: "specialized", name: "Specialized Professional Calculators", description: "Domain tools for legal, medical, actuarial and trades.", color: "slate", order: 32 },
];

export const CATEGORY_DATA_MAP: Record<string, CategoryData> = Object.fromEntries(
  CATEGORIES_DATA.map((c) => [c.id, c]),
);

export function getCategoryData(id: string): CategoryData | undefined {
  return CATEGORY_DATA_MAP[id];
}
