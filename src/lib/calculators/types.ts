/**
 * EveryCalc — Core Calculator Type System
 * =======================================
 *
 * This file defines the contract every calculator in the platform must follow.
 * The registry (registry.ts) is the single source of truth for what calculators
 * exist, what their inputs look like, how to compute results, and how to verify
 * the computation is correct.
 *
 * Design goals:
 *  - Hundreds/thousands of calculators can be added without touching UI code.
 *  - Every published calculator is self-verifying via `tests`.
 *  - Calculators are pure functions — no I/O, no network — safe to run in browser.
 *  - Categories are stable identifiers; slugs are globally unique.
 *  - "Planned" calculators are tracked but never exposed as available.
 */

import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export interface Category {
  /** Stable lowercase id, e.g. "finance". Never changes once published. */
  id: string;
  /** Human-readable name, e.g. "Finance and Banking". */
  name: string;
  /** Short single-sentence description used in cards and SEO. */
  description: string;
  /** Lucide icon component, imported in categories.tsx. */
  icon: LucideIcon;
  /** Tailwind color token used for accents (e.g. "emerald"). */
  color: string;
  /** Order in the directory (1-based, mirrors the user's category list). */
  order: number;
}

/* ------------------------------------------------------------------ */
/* Field schema (input form definition)                                */
/* ------------------------------------------------------------------ */

export type FieldType =
  | "number"
  | "text"
  | "select"
  | "checkbox"
  | "date"
  | "textarea";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldSchema {
  /** Form field name — must match the key in the calculator's input object. */
  name: string;
  label: string;
  type: FieldType;
  /** Helpful hint shown under the input. */
  help?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Default value when the form first renders. */
  default?: number | string | boolean;
  /** For number fields: minimum accepted value. */
  min?: number;
  /** For number fields: maximum accepted value. */
  max?: number;
  /** For number fields: step granularity. */
  step?: number;
  /** For select fields: the dropdown options. */
  options?: FieldOption[];
  /** Unit suffix shown next to the input, e.g. "kg" or "%". */
  unit?: string;
  /** Whether the field is required (default true). */
  required?: boolean;
}

/* ------------------------------------------------------------------ */
/* Result schema (output of a calculator)                              */
/* ------------------------------------------------------------------ */

export interface ResultRow {
  /** Stable key, useful for tests. */
  key: string;
  /** Human-readable label. */
  label: string;
  /** Pre-formatted value, e.g. "1,234.56" or "27.5 kg/m²". */
  value: string;
  /** Optional secondary explanation shown beneath the value. */
  hint?: string;
  /** Optional emphasis: "primary" rows are highlighted, "warning" red, etc. */
  emphasis?: "primary" | "normal" | "warning" | "success";
}

export interface ResultSection {
  title?: string;
  rows: ResultRow[];
}

export interface CalculatorResult {
  /** Top-level rows rendered as the headline answer. */
  rows: ResultRow[];
  /** Optional grouped sections rendered beneath the headline. */
  sections?: ResultSection[];
  /** Optional chart data for visual calculators (e.g. amortization). */
  chart?: {
    type: "line" | "bar" | "pie";
    title?: string;
    series: { label: string; value: number }[];
  };
  /** Optional plain-language summary paragraph. */
  summary?: string;
}

/* ------------------------------------------------------------------ */
/* Test cases                                                          */
/* ------------------------------------------------------------------ */

export interface TestCase {
  /** Test name shown in the runner output. */
  name: string;
  /** Inputs to feed to the calculator. */
  inputs: Record<string, unknown>;
  /**
   * Expected value for `result.rows[0].value` by default, OR a partial
   * matcher against specific row keys: `{ "monthly_payment": "$1,073.64" }`.
   */
  expected: string | Record<string, string>;
  /** Allowed rounding tolerance when comparing numeric strings. */
  tolerance?: number;
}

/* ------------------------------------------------------------------ */
/* Calculator definition                                               */
/* ------------------------------------------------------------------ */

export type CalculatorStatus = "live" | "planned";

export interface CalculatorDefinition {
  /** Stable slug used in URLs, e.g. "bmi". Globally unique. */
  slug: string;
  /** Display name, e.g. "BMI Calculator". */
  name: string;
  /** One-line description shown in cards and search results. */
  description: string;
  /** Category id from categories.tsx. */
  category: string;
  /** Search synonyms — words users might type that aren't in the name. */
  keywords: string[];
  /** Implementation status. Only "live" calculators are exposed. */
  status: CalculatorStatus;
  /** Input form definition. */
  inputs: FieldSchema[];
  /** Pure compute function. Must never throw on valid inputs. */
  calculate: (inputs: Record<string, unknown>) => CalculatorResult;
  /** Self-verifying test cases run by the test runner. */
  tests: TestCase[];
  /** Slugs of related calculators (must exist in the registry). */
  related?: string[];
  /** Optional longer-form explanation rendered beneath the calculator. */
  learnMore?: string;
  /** Which Part # of the build roadmap delivered this calculator. */
  part?: number;
}

/* ------------------------------------------------------------------ */
/* Result of running every test case for a calculator                  */
/* ------------------------------------------------------------------ */

export interface TestResult {
  slug: string;
  name: string;
  passed: number;
  failed: number;
  failures: { testName: string; message: string }[];
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export interface SearchResult {
  calculator: CalculatorDefinition;
  /** Relevance score; higher = better match. */
  score: number;
  /** Where the match happened — used for highlighting in UI. */
  matchedOn: ("name" | "description" | "category" | "keywords")[];
}
