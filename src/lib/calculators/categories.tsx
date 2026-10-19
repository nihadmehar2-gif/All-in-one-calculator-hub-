"use client";

/**
 * EveryCalc — Category Catalog
 * ============================
 *
 * The 32 categories below are the canonical top-level grouping for every
 * calculator on the platform. They mirror the user-supplied roadmap order so
 * future development phases can simply add calculators under existing
 * categories — no UI or routing changes required.
 *
 * Each category is a stable `id` (lowercase, kebab-case, never renamed once
 * published) plus display metadata. The `color` is a Tailwind color token
 * (e.g. "emerald", "rose") used for icon tinting and card accents.
 */

import {
  Calculator,
  Sigma,
  Triangle,
  FunctionSquare,
  BarChart3,
  Landmark,
  Receipt,
  Briefcase,
  HeartPulse,
  Calendar,
  Ruler,
  Atom,
  FlaskConical,
  Cpu,
  Hammer,
  GraduationCap,
  Code2,
  Database,
  Car,
  ChefHat,
  Sprout,
  Leaf,
  Home,
  ShoppingCart,
  Trophy,
  PawPrint,
  Baby,
  Rocket,
  Factory,
  Truck,
  Clock,
  Stethoscope,
} from "lucide-react";

import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "basic-math", name: "Basic Mathematics", description: "Percentages, averages, fractions and everyday arithmetic.", icon: Calculator, color: "slate", order: 1 },
  { id: "algebra", name: "Algebra and Equations", description: "Solve linear and quadratic equations, systems and polynomials.", icon: Sigma, color: "slate", order: 2 },
  { id: "geometry", name: "Geometry and Trigonometry", description: "Areas, volumes, angles and trigonometric identities.", icon: Triangle, color: "slate", order: 3 },
  { id: "calculus", name: "Calculus", description: "Derivatives, integrals, limits and series.", icon: FunctionSquare, color: "slate", order: 4 },
  { id: "statistics", name: "Statistics and Probability", description: "Mean, median, standard deviation, distributions and probability.", icon: BarChart3, color: "emerald", order: 5 },
  { id: "finance", name: "Finance and Banking", description: "Loans, interest, savings, investments and currency math.", icon: Landmark, color: "emerald", order: 6 },
  { id: "taxes", name: "Taxes and Salary", description: "Income tax, payroll deductions, take-home pay and bonuses.", icon: Receipt, color: "emerald", order: 7 },
  { id: "business", name: "Business and Accounting", description: "Margin, markup, depreciation, breakeven and P&L math.", icon: Briefcase, color: "emerald", order: 8 },
  { id: "health", name: "Health and Fitness", description: "BMI, BMR, body fat, macros, hydration and training load.", icon: HeartPulse, color: "rose", order: 9 },
  { id: "date-time", name: "Date and Time", description: "Date differences, durations, age and timezone math.", icon: Calendar, color: "amber", order: 10 },
  { id: "conversions", name: "Unit Conversions", description: "Length, mass, temperature, pressure, speed and more.", icon: Ruler, color: "amber", order: 11 },
  { id: "science", name: "Science and Physics", description: "Motion, energy, electricity, waves and constants.", icon: Atom, color: "sky", order: 12 },
  { id: "chemistry", name: "Chemistry", description: "Moles, molarity, dilution, gas laws and reaction math.", icon: FlaskConical, color: "sky", order: 13 },
  { id: "engineering", name: "Engineering and Electronics", description: "Ohm's law, RC circuits, power, resistors and logic gates.", icon: Cpu, color: "sky", order: 14 },
  { id: "construction", name: "Construction and Home Improvement", description: "Paint, flooring, concrete, roofing and DIY takeoffs.", icon: Hammer, color: "amber", order: 15 },
  { id: "education", name: "Education and Grades", description: "GPA, test scores, weighted grades and study planners.", icon: GraduationCap, color: "violet", order: 16 },
  { id: "computer-science", name: "Computer Science and Technology", description: "Number bases, bit ops, hash, color and algorithmic math.", icon: Code2, color: "violet", order: 17 },
  { id: "data-networking", name: "Data, Storage and Networking", description: "Bandwidth, subnetting, IP, RAID and storage sizing.", icon: Database, color: "violet", order: 18 },
  { id: "automotive", name: "Automotive and Transportation", description: "Fuel economy, trip cost, tire size and EV range.", icon: Car, color: "amber", order: 19 },
  { id: "cooking", name: "Cooking, Food and Nutrition", description: "Recipe scaling, baking ratios and nutrition math.", icon: ChefHat, color: "rose", order: 20 },
  { id: "agriculture", name: "Agriculture and Gardening", description: "Yield, fertilizer, irrigation, seed and crop math.", icon: Sprout, color: "emerald", order: 21 },
  { id: "environment", name: "Environment and Energy", description: "Solar, carbon, electricity bills and efficiency.", icon: Leaf, color: "emerald", order: 22 },
  { id: "real-estate", name: "Real Estate and Property", description: "Mortgage, rent vs buy, ROI and property yields.", icon: Home, color: "emerald", order: 23 },
  { id: "shopping", name: "Shopping and Everyday Life", description: "Discounts, coupons, unit price and tip math.", icon: ShoppingCart, color: "rose", order: 24 },
  { id: "sports", name: "Sports and Games", description: "Pace, odds, handicaps and training metrics.", icon: Trophy, color: "amber", order: 25 },
  { id: "pets", name: "Pets and Animals", description: "Pet age, food portions, dosage and breeding math.", icon: PawPrint, color: "rose", order: 26 },
  { id: "parenting", name: "Pregnancy and Parenting", description: "Due date, ovulation, growth percentiles and feeding.", icon: Baby, color: "rose", order: 27 },
  { id: "astronomy", name: "Astronomy and Space", description: "Orbital periods, distances, light-time and stargazing.", icon: Rocket, color: "sky", order: 28 },
  { id: "manufacturing", name: "Manufacturing and Industry", description: "Cycle time, OEE, throughput and material yield.", icon: Factory, color: "amber", order: 29 },
  { id: "logistics", name: "Logistics and Shipping", description: "Volumetric weight, freight, ETA and container packing.", icon: Truck, color: "amber", order: 30 },
  { id: "productivity", name: "Time Tracking and Productivity", description: "Pomodoro, hourly rate, time budgets and focus metrics.", icon: Clock, color: "violet", order: 31 },
  { id: "specialized", name: "Specialized Professional Calculators", description: "Domain tools for legal, medical, actuarial and trades.", icon: Stethoscope, color: "slate", order: 32 },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export function getCategory(id: string): Category | undefined {
  return CATEGORY_MAP[id];
}
