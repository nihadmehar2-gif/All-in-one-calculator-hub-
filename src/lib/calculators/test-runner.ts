/**
 * EveryCalc — Calculator Test Runner
 * ==================================
 *
 * Runs every test case for every calculator and reports pass/fail.
 * Usable from:
 *   - the browser (dev panel) — runTestSuite() returns TestResult[]
 *   - a Node/Bun CLI script — see /home/z/my-project/scripts/run-tests.ts
 *
 * Comparison rules:
 *  - `expected` is matched against `result.rows[0].value` if it's a string,
 *    or against the value of each keyed row if it's an object.
 *  - When `tolerance` is set, numeric parts are compared with that tolerance.
 *  - Otherwise we compare the full formatted string (case-insensitive).
 */

import type { TestResult, TestCase } from "./types";
import { ALL_CALCULATORS } from "./registry";

function extractNumbers(s: string): number[] {
  const matches = s.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return matches.map(Number);
}

function compareValues(actual: string, expected: string, tolerance?: number): boolean {
  if (tolerance === undefined) {
    return actual.trim().toLowerCase() === expected.trim().toLowerCase();
  }
  const aNums = extractNumbers(actual);
  const eNums = extractNumbers(expected);
  if (aNums.length === 0 || aNums.length !== eNums.length) {
    return actual.trim().toLowerCase() === expected.trim().toLowerCase();
  }
  return aNums.every((a, i) => Math.abs(a - eNums[i]) <= tolerance);
}

function runOneTest(calc: { slug: string; calculate: (i: Record<string, unknown>) => { rows: { key: string; value: string }[] } }, t: TestCase): { passed: boolean; message: string } {
  let result: { rows: { key: string; value: string }[] };
  try {
    result = calc.calculate(t.inputs);
  } catch (e) {
    return { passed: false, message: `Threw: ${(e as Error).message}` };
  }
  if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
    return { passed: false, message: "No rows returned" };
  }
  if (typeof t.expected === "string") {
    const actual = result.rows[0].value;
    const ok = compareValues(actual, t.expected, t.tolerance);
    return { passed: ok, message: ok ? "" : `expected "${t.expected}", got "${actual}"` };
  }
  // Object: check each keyed row
  for (const [key, expectedValue] of Object.entries(t.expected)) {
    const row = result.rows.find((r) => r.key === key);
    if (!row) return { passed: false, message: `Row "${key}" not found` };
    if (!compareValues(row.value, expectedValue, t.tolerance)) {
      return { passed: false, message: `Row "${key}": expected "${expectedValue}", got "${row.value}"` };
    }
  }
  return { passed: true, message: "" };
}

export function runTestSuite(): TestResult[] {
  const out: TestResult[] = [];
  for (const calc of ALL_CALCULATORS) {
    if (calc.status !== "live") continue;
    if (!calc.tests.length) continue;
    let passed = 0;
    let failed = 0;
    const failures: TestResult["failures"] = [];
    for (const t of calc.tests) {
      const r = runOneTest(calc, t);
      if (r.passed) passed++;
      else {
        failed++;
        failures.push({ testName: t.name, message: r.message });
      }
    }
    out.push({ slug: calc.slug, name: calc.name, passed, failed, failures });
  }
  return out;
}

export function summarize(results: TestResult[]): { totalCalculators: number; totalPassed: number; totalFailed: number; allGreen: boolean } {
  const totalPassed = results.reduce((s, r) => s + r.passed, 0);
  const totalFailed = results.reduce((s, r) => s + r.failed, 0);
  return {
    totalCalculators: results.length,
    totalPassed,
    totalFailed,
    allGreen: totalFailed === 0,
  };
}
