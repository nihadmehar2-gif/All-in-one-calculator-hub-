/**
 * Gaming and Sports Statistics — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* ------------------- Odds converter -------------------------------- */
export const oddsConverter: CalculatorDefinition = {
  slug: "odds-converter",
  name: "Betting Odds Converter",
  description: "Convert between decimal, fractional and American odds; compute implied probability.",
  category: "sports",
  keywords: ["odds", "betting", "decimal", "fractional", "american", "probability", "implied"],
  status: "live",
  part: 5,
  inputs: [
    { name: "format", label: "Input format", type: "select", default: "decimal",
      options: [
        { label: "Decimal (e.g. 2.50)", value: "decimal" },
        { label: "Fractional (e.g. 3/2)", value: "fractional" },
        { label: "American (e.g. +150 or -200)", value: "american" },
      ] },
    { name: "value", label: "Odds value", type: "text", default: "2.50",
      placeholder: "decimal: 2.50, fractional: 3/2, american: +150" },
  ],
  related: ["sports-average", "running-pace", "expected-value"],
  calculate: (raw) => {
    const format = String(raw.format ?? "decimal");
    const value = String(raw.value ?? "").trim();
    if (!value) return { rows: [{ key: "decimal", label: "Decimal", value: "—" }] };
    let decimal: number;
    if (format === "decimal") {
      decimal = parseFloat(value);
      if (!Number.isFinite(decimal) || decimal <= 1) {
        return { rows: [{ key: "decimal", label: "Decimal", value: "—", hint: "Decimal odds must be > 1." }] };
      }
    } else if (format === "fractional") {
      const m = value.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!m) {
        return { rows: [{ key: "decimal", label: "Decimal", value: "—", hint: "Use format like 3/2." }] };
      }
      decimal = 1 + Number(m[1]) / Number(m[2]);
    } else {
      // American
      const n = Number(value);
      if (!Number.isFinite(n) || n === 0) {
        return { rows: [{ key: "decimal", label: "Decimal", value: "—" }] };
      }
      decimal = n > 0 ? (n / 100) + 1 : (100 / -n) + 1;
    }
    const implied = (1 / decimal) * 100;
    // Convert back to other formats
    const fractionalNum = decimal - 1;
    const fracStr = formatFraction(fractionalNum);
    const american = decimal >= 2
      ? `+${Math.round((decimal - 1) * 100)}`
      : `-${Math.round(100 / (decimal - 1))}`;
    return {
      rows: [
        { key: "decimal", label: "Decimal odds", value: fmt(decimal, 4), emphasis: "primary" },
        { key: "fractional", label: "Fractional odds", value: fracStr, emphasis: "primary" },
        { key: "american", label: "American odds", value: american, emphasis: "primary" },
        { key: "implied", label: "Implied probability", value: `${fmt(implied, 2)}%`, emphasis: "primary" },
      ],
      summary: "Decimal: total payout per $1. Fractional: profit/stake. American: +X = win $X per $100; −X = bet $X to win $100. Implied prob = 1 ÷ decimal. Bookmaker margins cause implied probs to sum to >100%.",
    };
  },
  tests: [
    { name: "Decimal 2.50 → 60% implied", inputs: { format: "decimal", value: "2.50" }, expected: { implied: "40%" } },
    { name: "American +150 → 2.50 decimal", inputs: { format: "american", value: "+150" }, expected: { decimal: "2.5" } },
    { name: "American -200 → 1.50 decimal", inputs: { format: "american", value: "-200" }, expected: { decimal: "1.5" } },
  ],
};

function formatFraction(n: number): string {
  // Try simple fractions
  const denominators = [1, 2, 4, 5, 10, 20, 50, 100];
  for (const d of denominators) {
    const num = n * d;
    if (Math.abs(num - Math.round(num)) < 0.001) {
      return `${Math.round(num)}/${d}`;
    }
  }
  return `${fmt(n, 2)}/1`;
}

/* ------------------- Golf handicap --------------------------------- */
export const golfHandicap: CalculatorDefinition = {
  slug: "golf-handicap",
  name: "Golf Course Handicap",
  description: "Compute course handicap from your Handicap Index and course slope rating.",
  category: "sports",
  keywords: ["golf", "handicap", "slope", "course", "index"],
  status: "live",
  part: 5,
  inputs: [
    { name: "index", label: "Handicap Index", type: "number", default: 15.5, min: -10, max: 54, step: "any" },
    { name: "slope", label: "Course slope rating", type: "number", default: 130, min: 55, max: 155, step: 1 },
    { name: "par", label: "Course par", type: "number", default: 72, min: 60, max: 90, step: 1 },
  ],
  related: ["sports-average", "running-pace", "odds-converter"],
  calculate: (raw) => {
    const index = toNum(raw.index);
    const slope = toNum(raw.slope);
    const par = toNum(raw.par);
    if (slope <= 0) {
      return { rows: [{ key: "handicap", label: "Course handicap", value: "—" }] };
    }
    // Course Handicap = Handicap Index × (Slope Rating / 113)
    const courseHandicap = Math.round(index * (slope / 113));
    const targetScore = par + courseHandicap;
    return {
      rows: [
        { key: "handicap", label: "Course Handicap", value: String(courseHandicap), emphasis: "primary" },
        { key: "target", label: "Target score (par + handicap)", value: String(targetScore), emphasis: "primary" },
      ],
      sections: [{
        title: "Reference slope ratings",
        rows: [
          { key: "easy", label: "Easy course (low slope)", value: "110-120" },
          { key: "average", label: "Average course", value: "120-130" },
          { key: "hard", label: "Difficult course", value: "130-140" },
          { key: "championship", label: "Championship", value: "140-155" },
        ],
      }],
      summary: "Course Handicap = Index × (Slope ÷ 113). The 113 is the standard slope for an average-difficulty course. Your target score is par + handicap.",
    };
  },
  tests: [
    { name: "Index 15.5, slope 130, par 72", inputs: { index: 15.5, slope: 130, par: 72 }, expected: { handicap: "18" } },
  ],
};

/* ------------------- Expected value (betting) ---------------------- */
export const bettingExpectedValue: CalculatorDefinition = {
  slug: "betting-expected-value",
  name: "Betting Expected Value",
  description: "Compute the expected value of a bet given probability and odds.",
  category: "sports",
  keywords: ["expected value", "betting", "ev", "gambling", "probability"],
  status: "live",
  part: 5,
  inputs: [
    { name: "stake", label: "Stake", type: "number", default: 100, min: 0, step: "any", unit: "$" },
    { name: "decimal_odds", label: "Decimal odds", type: "number", default: 2.50, min: 1.01, step: "any" },
    { name: "probability", label: "Your estimated win probability", type: "number", default: 45, min: 0, max: 100, step: "any", unit: "%" },
  ],
  related: ["odds-converter", "probability-expected-value", "marketing-roi"],
  calculate: (raw) => {
    const stake = toNum(raw.stake);
    const odds = toNum(raw.decimal_odds);
    const p = toNum(raw.probability) / 100;
    if (odds <= 1 || stake <= 0) {
      return { rows: [{ key: "ev", label: "Expected value", value: "—" }] };
    }
    // EV = (p × stake × (odds−1)) − ((1−p) × stake)
    const winProfit = stake * (odds - 1);
    const lossAmount = stake;
    const ev = p * winProfit - (1 - p) * lossAmount;
    const evPct = (ev / stake) * 100;
    const impliedProb = (1 / odds) * 100;
    const edge = p * 100 - impliedProb;
    return {
      rows: [
        { key: "ev", label: "Expected value per bet", value: fmtUSD(ev), emphasis: ev >= 0 ? "success" : "warning" },
        { key: "ev_pct", label: "EV % of stake", value: `${fmt(evPct, 2)}%`, emphasis: ev >= 0 ? "success" : "warning" },
        { key: "implied", label: "Implied probability (bookmaker)", value: `${fmt(impliedProb, 2)}%` },
        { key: "edge", label: "Your edge", value: `${fmt(edge, 2)}%`, emphasis: edge > 0 ? "success" : "warning" },
      ],
      summary: "Positive EV means profitable long-term. EV = p × (odds−1) × stake − (1−p) × stake. Real-world betting includes bookmaker margins (~5%) that make beating the market hard.",
    };
  },
  tests: [
    { name: "$100 @ 2.50 odds, 45% probability", inputs: { stake: 100, decimal_odds: 2.5, probability: 45 }, expected: { ev: "$12.50" } },
  ],
};

/* ------------------- Dice probability ------------------------------ */
export const diceProbability: CalculatorDefinition = {
  slug: "dice-probability",
  name: "Dice Roll Probability",
  description: "Compute probability of rolling a target sum with N dice.",
  category: "sports",
  keywords: ["dice", "probability", "roll", "dnd", "game", "sum"],
  status: "live",
  part: 5,
  inputs: [
    { name: "n", label: "Number of dice", type: "number", default: 2, min: 1, max: 12, step: 1 },
    { name: "sides", label: "Sides per die", type: "number", default: 6, min: 2, max: 100, step: 1 },
    { name: "target", label: "Target sum", type: "number", default: 7, min: 1, step: 1 },
  ],
  related: ["probability-expected-value", "binomial-probability", "odds-converter"],
  calculate: (raw) => {
    const n = Math.max(1, Math.round(toNum(raw.n)));
    const sides = Math.max(2, Math.round(toNum(raw.sides)));
    const target = Math.round(toNum(raw.target));
    if (target < n || target > n * sides) {
      return {
        rows: [
          { key: "p", label: `P(sum = ${target})`, value: "0", hint: `Sum must be between ${n} and ${n * sides}.` },
        ],
      };
    }
    // Count ways to roll target with n dice of `sides` sides
    // Using inclusion-exclusion (each die contributes 1..sides)
    function waysToSum(dice: number, sum: number, max: number): number {
      if (dice === 0) return sum === 0 ? 1 : 0;
      if (sum < dice || sum > dice * max) return 0;
      let total = 0;
      for (let face = 1; face <= max && face <= sum; face++) {
        total += waysToSum(dice - 1, sum - face, max);
      }
      return total;
    }
    // Memoize for performance
    const memo = new Map<string, number>();
    function waysMemo(dice: number, sum: number, max: number): number {
      if (dice === 0) return sum === 0 ? 1 : 0;
      if (sum < dice || sum > dice * max) return 0;
      const key = `${dice}-${sum}-${max}`;
      if (memo.has(key)) return memo.get(key)!;
      let total = 0;
      for (let face = 1; face <= max && face <= sum; face++) {
        total += waysMemo(dice - 1, sum - face, max);
      }
      memo.set(key, total);
      return total;
    }
    const ways = waysMemo(n, target, sides);
    const total = Math.pow(sides, n);
    const p = ways / total;
    const pPct = p * 100;
    // Build distribution for chart
    const series: { label: string; value: number }[] = [];
    for (let s = n; s <= n * sides; s++) {
      series.push({ label: String(s), value: waysMemo(n, s, sides) / total });
    }
    return {
      rows: [
        { key: "p", label: `P(sum = ${target})`, value: `${fmt(pPct, 4)}%`, emphasis: "primary" },
        { key: "ways", label: "Number of ways", value: `${ways} out of ${total.toLocaleString()}` },
      ],
      chart: { type: "bar", title: `Probability distribution of ${n}d${sides}`, series },
      summary: `For ${n}d${sides}, sum ranges from ${n} to ${n * sides}. Most likely sum is ${Math.floor((n * (sides + 1)) / 2)}.`,
    };
  },
  tests: [
    { name: "2d6 sum=7 → 16.67%", inputs: { n: 2, sides: 6, target: 7 }, expected: { p: "16.6667%" }, tolerance: 0.001 },
    { name: "2d6 sum=2 → 2.78%", inputs: { n: 2, sides: 6, target: 2 }, expected: { p: "2.7778%" }, tolerance: 0.001 },
  ],
};

/* ------------------- Win rate / streak ----------------------------- */
export const winStreakProbability: CalculatorDefinition = {
  slug: "win-streak-probability",
  name: "Win Streak Probability",
  description: "Probability of achieving a winning streak of length k given per-game win probability.",
  category: "sports",
  keywords: ["streak", "win", "probability", "game", "esports"],
  status: "live",
  part: 5,
  inputs: [
    { name: "p_win", label: "Per-game win probability", type: "number", default: 50, min: 0, max: 100, step: "any", unit: "%" },
    { name: "streak", label: "Target streak length", type: "number", default: 5, min: 1, step: 1 },
    { name: "games", label: "Total games played", type: "number", default: 82, min: 1, step: 1 },
  ],
  related: ["odds-converter", "betting-expected-value", "probability-expected-value"],
  calculate: (raw) => {
    const p = toNum(raw.p_win) / 100;
    const k = Math.max(1, Math.round(toNum(raw.streak)));
    const n = Math.max(1, Math.round(toNum(raw.games)));
    if (p < 0 || p > 1) {
      return { rows: [{ key: "prob", label: "Probability", value: "—" }] };
    }
    // P(at least one streak of length k in n games)
    // Exact formula is complex; approximation: 1 - (1 - p^k)^(n-k+1)
    const pStreak = Math.pow(p, k);
    const pNoStreakPerWindow = 1 - pStreak;
    const windows = Math.max(0, n - k + 1);
    const pAtLeastOne = 1 - Math.pow(pNoStreakPerWindow, windows);
    const expectedStreaks = windows * pStreak;
    return {
      rows: [
        { key: "prob", label: "P(≥1 streak of length k)", value: `${fmt(pAtLeastOne * 100, 4)}%`, emphasis: "primary" },
        { key: "expected", label: "Expected number of such streaks", value: `${fmt(expectedStreaks, 4)}` },
        { key: "p_single", label: "P(single k-game streak)", value: `${fmt(pStreak * 100, 4)}%` },
      ],
      summary: `Approximation: P(≥1 streak) ≈ 1 − (1 − p^k)^(n−k+1). A true 50% player hitting 5 wins in a row in 82 games has ~${fmt(pAtLeastOne * 100, 1)}% chance.`,
    };
  },
  tests: [
    { name: "50% win, 5-game streak, 82 games", inputs: { p_win: 50, streak: 5, games: 82 }, expected: { p_single: "3.125%" } },
  ],
};
