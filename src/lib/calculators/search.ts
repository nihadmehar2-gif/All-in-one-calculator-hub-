/**
 * EveryCalc — Calculator Search
 * =============================
 *
 * Lightweight fuzzy search across live calculators. Matches against:
 *  - calculator name (highest weight)
 *  - description (medium weight)
 *  - category name (medium weight)
 *  - keywords/synonyms (high weight — these are curated synonyms)
 *
 * The matcher tokenizes both the query and the calculator text, then scores
 * by how many query tokens are found and how closely (prefix matches score
 * higher). Multi-token matches dominate single-token matches so "loan
 * payment" beats "loan" alone when both appear.
 *
 * Only `status === "live"` calculators are ever returned. Planned
 * calculators are intentionally invisible to the user.
 */

import type { CalculatorDefinition, SearchResult } from "./types";
import { getLiveCalculators } from "./registry";
import { CATEGORY_MAP } from "./categories";

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function scoreText(needle: string, haystackTokens: string[]): number {
  // Returns higher score for prefix matches, lower for substring/contains.
  let best = 0;
  for (const tok of haystackTokens) {
    if (tok === needle) { best = Math.max(best, 1.0); }
    else if (tok.startsWith(needle)) { best = Math.max(best, 0.8); }
    else if (tok.includes(needle)) { best = Math.max(best, 0.5); }
  }
  return best;
}

export function searchCalculators(query: string, limit = 50): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const qTokens = tokenize(q);
  if (qTokens.length === 0) return [];

  const results: SearchResult[] = [];
  for (const calc of getLiveCalculators()) {
    const nameTokens = tokenize(calc.name);
    const descTokens = tokenize(calc.description);
    const kwTokens = calc.keywords.flatMap(tokenize);
    const cat = CATEGORY_MAP[calc.category];
    const catTokens = cat ? tokenize(cat.name) : [];

    let totalScore = 0;
    const matchedOn: SearchResult["matchedOn"] = [];
    let nameHit = 0, descHit = 0, kwHit = 0, catHit = 0;

    for (const t of qTokens) {
      const n = scoreText(t, nameTokens);
      const d = scoreText(t, descTokens);
      const k = scoreText(t, kwTokens);
      const c = scoreText(t, catTokens);
      nameHit = Math.max(nameHit, n);
      descHit = Math.max(descHit, d);
      kwHit = Math.max(kwHit, k);
      catHit = Math.max(catHit, c);
    }
    // Weight: keywords > name > category > description
    totalScore = kwHit * 3 + nameHit * 2 + catHit * 1.2 + descHit * 1;
    // Reward multi-token queries that match across multiple fields
    const fieldsHit = [nameHit, descHit, kwHit, catHit].filter((v) => v > 0).length;
    totalScore += fieldsHit * 0.5;

    if (totalScore > 0) {
      if (nameHit > 0) matchedOn.push("name");
      if (descHit > 0) matchedOn.push("description");
      if (kwHit > 0) matchedOn.push("keywords");
      if (catHit > 0) matchedOn.push("category");
      results.push({ calculator: calc, score: totalScore, matchedOn });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
