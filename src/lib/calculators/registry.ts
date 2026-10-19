/**
 * EveryCalc — Central Calculator Registry
 * =======================================
 *
 * Single source of truth for every calculator on the platform.
 * Add a new calculator by importing it and pushing to ALL_CALCULATORS —
 * no UI or routing changes required.
 *
 * Public API:
 *   - getAllCalculators()      — every entry, live AND planned
 *   - getLiveCalculators()     — only status==="live" (shown in UI/search)
 *   - getCalculator(slug)      — by slug, any status
 *   - getLiveByCategory(catId) — live calculators in a category
 *   - getCategoryCounts()      — live counts per category id
 */

import type { CalculatorDefinition } from "./types";
import { percentageCalculator, averageCalculator, fractionToDecimal } from "./impl/basic-math";
import { loanPayment, compoundInterest } from "./impl/finance";
import { bmiCalculator } from "./impl/health";
import { lengthConverter, temperatureConverter } from "./impl/conversions";
import { dateDifference } from "./impl/date-time";
import { medianMode, standardDeviation } from "./impl/statistics";
import { triangleArea, circleArea } from "./impl/geometry";
import { ohmsLaw } from "./impl/science";
import { gpaCalculator } from "./impl/education";
import { PLANNED_CALCULATORS } from "./impl/_planned";

export const LIVE_CALCULATORS: CalculatorDefinition[] = [
  percentageCalculator,
  averageCalculator,
  fractionToDecimal,
  loanPayment,
  compoundInterest,
  bmiCalculator,
  lengthConverter,
  temperatureConverter,
  dateDifference,
  medianMode,
  standardDeviation,
  triangleArea,
  circleArea,
  ohmsLaw,
  gpaCalculator,
];

export const ALL_CALCULATORS: CalculatorDefinition[] = [
  ...LIVE_CALCULATORS,
  ...PLANNED_CALCULATORS,
];

const BY_SLUG = new Map<string, CalculatorDefinition>(
  ALL_CALCULATORS.map((c) => [c.slug, c]),
);

export function getAllCalculators(): CalculatorDefinition[] {
  return ALL_CALCULATORS;
}

export function getLiveCalculators(): CalculatorDefinition[] {
  return ALL_CALCULATORS.filter((c) => c.status === "live");
}

export function getCalculator(slug: string): CalculatorDefinition | undefined {
  return BY_SLUG.get(slug);
}

export function getLiveByCategory(categoryId: string): CalculatorDefinition[] {
  return getLiveCalculators().filter((c) => c.category === categoryId);
}

export function getPlannedByCategory(categoryId: string): CalculatorDefinition[] {
  return ALL_CALCULATORS.filter((c) => c.status === "planned" && c.category === categoryId);
}

export function getCategoryCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of getLiveCalculators()) {
    out[c.category] = (out[c.category] ?? 0) + 1;
  }
  return out;
}

/** Validate the registry — throws on duplicate slugs or dangling references. */
export function validateRegistry(): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const c of ALL_CALCULATORS) {
    if (seen.has(c.slug)) issues.push(`Duplicate slug: ${c.slug}`);
    seen.add(c.slug);
    if (c.related) {
      for (const r of c.related) {
        if (!BY_SLUG.has(r)) issues.push(`${c.slug} references unknown related: ${r}`);
      }
    }
    if (c.status === "live") {
      if (c.inputs.length === 0) issues.push(`Live calculator ${c.slug} has no inputs`);
      if (c.tests.length === 0) issues.push(`Live calculator ${c.slug} has no tests`);
    }
  }
  return issues;
}
