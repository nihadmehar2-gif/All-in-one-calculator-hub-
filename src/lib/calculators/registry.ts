/**
 * EveryCalc — Central Calculator Registry
 * =======================================
 *
 * Single source of truth for every calculator on the platform.
 * Add a new calculator by importing it and pushing to LIVE_CALCULATORS —
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
import {
  percentageCalculator,
  averageCalculator,
  fractionToDecimal,
  percentageChange,
  reversePercentage,
  decimalToFraction,
  ratioSimplifier,
  gcdLcmPrime,
  exponentsRootsLogs,
  scientificNotation,
  scientificCalculator,
} from "./impl/basic-math";
import {
  loanPayment,
  compoundInterest,
  simpleInterest,
  mortgageAffordability,
  savingsGoal,
  presentValue,
  futureValue,
  ruleOf72,
  inflation,
  retirement,
  creditCardPayoff,
  debtSnowballAvalanche,
  aprEar,
  bondYield,
  autoLoan,
  refinance,
} from "./impl/finance";
import {
  bmiCalculator,
  bmrCalculator,
  bodyFatCalculator,
  idealWeight,
  heartRateZones,
  hydration,
  pregnancyDueDate,
  sleepSchedule,
  macroCalculator,
  paceSpeedDistance,
} from "./impl/health";
import { lengthConverter, temperatureConverter, massConverter, speedConverter, volumeConverter, pressureConverter, areaConverter, energyConverter } from "./impl/conversions";
import { dateDifference, ageCalculator, workdayCounter, timezoneConverter } from "./impl/date-time";
import {
  medianMode,
  standardDeviation,
  probabilityExpectedValue,
  binomialProbability,
  normalDistribution,
  confidenceInterval,
} from "./impl/statistics";
import {
  triangleArea,
  circleArea,
  rightTriangle,
  pythagoreanTheorem,
  sphereVolume,
  cylinderVolume,
  coneVolume,
  cubeVolume,
  regularPolygon,
  coordinateGeometry,
  trigEvaluator,
} from "./impl/geometry";
import {
  linearEquationSolver,
  quadraticSolver,
  system2x2,
  sequencesSeries,
  permutationsCombinations,
} from "./impl/algebra";
import { numericalDerivative, definiteIntegral } from "./impl/calculus";
import {
  ohmsLaw,
  kinematics,
  newtonsSecond,
  workEnergyPower,
  momentumEnergy,
  densityPressure,
  thermalExpansion,
  waveFrequency,
  electricalEnergy,
  seriesParallelResistance,
  gasLaws,
} from "./impl/science";
import { molarMass, molarity, dilution } from "./impl/chemistry";
import {
  resistorColorCode,
  voltageDivider,
  rcTimeConstant,
  batteryRuntime,
  gearRatio,
  ledResistor,
} from "./impl/engineering";
import {
  concreteVolume,
  brickMortar,
  paintCoverage,
  flooringTile,
  wallAreaRoom,
  roofingSlope,
  lumberSheet,
  soilGravelMulch,
  hvacLoad,
  solarPanel,
} from "./impl/construction";
import { fuelEconomy, tripCost, vehicleRunningCosts } from "./impl/automotive";
import { recipeScaler, foodServingConversion } from "./impl/cooking";
import { plantSpacing, fertilizerCalculator } from "./impl/agriculture";
import { electricityBill, carbonFootprint } from "./impl/environment";
import { discountCalculator, unitPrice, tipCalculator } from "./impl/shopping";
import { sportsAverage, runningPace } from "./impl/sports";
import { dogAge, petCalorie } from "./impl/pets";
import { volumetricWeight, packageVolume } from "./impl/logistics";
import {
  gpaCalculator,
  cgpaCalculator,
  marksPercentage,
  weightedAverage,
  finalExamScore,
  weightedAssignments,
  significantFigures,
  readingTime,
} from "./impl/education";
import {
  numberBaseConverter,
  bitwiseCalculator,
  colorConverter,
} from "./impl/computer-science";
import {
  dataSizeConverter,
  downloadTime,
  bandwidthCalculator,
  subnetCalculator,
  screenResolution,
  aspectRatio,
  imageFileSize,
} from "./impl/data-networking";
import {
  wageConversion,
  overtime,
  salesTaxVatGst,
  incomeTaxUS2024,
  salaryTakeHome,
  capitalGains,
  zakat,
} from "./impl/taxes";
import {
  marginMarkup,
  breakeven,
  roiPayback,
  depreciation,
  inventoryTurnover,
  cashFlow,
  discountCommission,
  unitEconomics,
} from "./impl/business";
import {
  rentVsBuy,
  downPaymentClosing,
  rentalYield,
  propertyAppreciation,
  pricePerSqft,
  ltvRatio,
  constructionBudget,
  realEstateMortgageAffordability,
} from "./impl/real-estate";
import { PLANNED_CALCULATORS } from "./impl/_planned";

export const LIVE_CALCULATORS: CalculatorDefinition[] = [
  // basic-math (Part 1 + Part 2)
  percentageCalculator,
  averageCalculator,
  fractionToDecimal,
  percentageChange,
  reversePercentage,
  decimalToFraction,
  ratioSimplifier,
  gcdLcmPrime,
  exponentsRootsLogs,
  scientificNotation,
  scientificCalculator,
  // finance (Part 1 + Part 3)
  loanPayment,
  compoundInterest,
  simpleInterest,
  mortgageAffordability,
  savingsGoal,
  presentValue,
  futureValue,
  ruleOf72,
  inflation,
  retirement,
  creditCardPayoff,
  debtSnowballAvalanche,
  aprEar,
  bondYield,
  autoLoan,
  refinance,
  // health (Part 1 + Part 4)
  bmiCalculator,
  bmrCalculator,
  bodyFatCalculator,
  idealWeight,
  heartRateZones,
  hydration,
  pregnancyDueDate,
  sleepSchedule,
  macroCalculator,
  paceSpeedDistance,
  // conversions (Part 1 + Part 4)
  lengthConverter,
  temperatureConverter,
  massConverter,
  speedConverter,
  volumeConverter,
  pressureConverter,
  areaConverter,
  energyConverter,
  // date-time (Part 1 + Part 4)
  dateDifference,
  ageCalculator,
  workdayCounter,
  timezoneConverter,
  // statistics (Part 1 + Part 2)
  medianMode,
  standardDeviation,
  probabilityExpectedValue,
  binomialProbability,
  normalDistribution,
  confidenceInterval,
  // geometry (Part 1 + Part 2)
  triangleArea,
  circleArea,
  rightTriangle,
  pythagoreanTheorem,
  sphereVolume,
  cylinderVolume,
  coneVolume,
  cubeVolume,
  regularPolygon,
  coordinateGeometry,
  trigEvaluator,
  // algebra (Part 2)
  linearEquationSolver,
  quadraticSolver,
  system2x2,
  sequencesSeries,
  permutationsCombinations,
  // calculus (Part 2)
  numericalDerivative,
  definiteIntegral,
  // science (Part 1 + Part 4)
  ohmsLaw,
  kinematics,
  newtonsSecond,
  workEnergyPower,
  momentumEnergy,
  densityPressure,
  thermalExpansion,
  waveFrequency,
  electricalEnergy,
  seriesParallelResistance,
  gasLaws,
  // chemistry (Part 4)
  molarMass,
  molarity,
  dilution,
  // engineering (Part 4)
  resistorColorCode,
  voltageDivider,
  rcTimeConstant,
  batteryRuntime,
  gearRatio,
  ledResistor,
  // construction (Part 4)
  concreteVolume,
  brickMortar,
  paintCoverage,
  flooringTile,
  wallAreaRoom,
  roofingSlope,
  lumberSheet,
  soilGravelMulch,
  hvacLoad,
  solarPanel,
  // automotive (Part 4)
  fuelEconomy,
  tripCost,
  vehicleRunningCosts,
  // cooking (Part 4)
  recipeScaler,
  foodServingConversion,
  // agriculture (Part 4)
  plantSpacing,
  fertilizerCalculator,
  // environment (Part 4)
  electricityBill,
  carbonFootprint,
  // shopping (Part 4)
  discountCalculator,
  unitPrice,
  tipCalculator,
  // sports (Part 4)
  sportsAverage,
  runningPace,
  // pets (Part 4)
  dogAge,
  petCalorie,
  // logistics (Part 4)
  volumetricWeight,
  packageVolume,
  // education (Part 1 + Part 2)
  gpaCalculator,
  cgpaCalculator,
  marksPercentage,
  weightedAverage,
  finalExamScore,
  weightedAssignments,
  significantFigures,
  readingTime,
  // computer-science (Part 2)
  numberBaseConverter,
  bitwiseCalculator,
  colorConverter,
  // data-networking (Part 2)
  dataSizeConverter,
  downloadTime,
  bandwidthCalculator,
  subnetCalculator,
  screenResolution,
  aspectRatio,
  imageFileSize,
  // taxes (Part 3)
  wageConversion,
  overtime,
  salesTaxVatGst,
  incomeTaxUS2024,
  salaryTakeHome,
  capitalGains,
  zakat,
  // business (Part 3)
  marginMarkup,
  breakeven,
  roiPayback,
  depreciation,
  inventoryTurnover,
  cashFlow,
  discountCommission,
  unitEconomics,
  // real-estate (Part 3)
  rentVsBuy,
  downPaymentClosing,
  rentalYield,
  propertyAppreciation,
  pricePerSqft,
  ltvRatio,
  constructionBudget,
  realEstateMortgageAffordability,
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
