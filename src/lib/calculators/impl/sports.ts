/**
 * Sports and Games — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtFixed, toNum } from "../_format";

/* --------------- Sports average / batting average ----------------- */
export const sportsAverage: CalculatorDefinition = {
  slug: "sports-average",
  name: "Batting Average & Sports Stats",
  description: "Compute batting average, slugging percentage, and success rate.",
  category: "sports",
  keywords: ["batting", "average", "slugging", "baseball", "success rate", "stats"],
  status: "live",
  part: 4,
  inputs: [
    { name: "at_bats", label: "At bats", type: "number", default: 100, min: 0, step: 1 },
    { name: "hits", label: "Hits", type: "number", default: 30, min: 0, step: 1 },
    { name: "doubles", label: "Doubles", type: "number", default: 8, min: 0, step: 1 },
    { name: "triples", label: "Triples", type: "number", default: 1, min: 0, step: 1 },
    { name: "home_runs", label: "Home runs", type: "number", default: 3, min: 0, step: 1 },
  ],
  related: ["pace-speed-distance", "running-pace"],
  calculate: (raw) => {
    const ab = toNum(raw.at_bats);
    const h = toNum(raw.hits);
    const d = toNum(raw.doubles);
    const t = toNum(raw.triples);
    const hr = toNum(raw.home_runs);
    if (ab === 0) return { rows: [{ key: "ba", label: "Batting average", value: "—" }] };
    const singles = h - d - t - hr;
    const ba = h / ab;
    const slg = (singles + 2 * d + 3 * t + 4 * hr) / ab;
    const obp_approx = ba; // approximation without walks/HBP
    const ops = slg + obp_approx;
    // Baseball averages traditionally show 3 decimals with leading 0 stripped
    const formatBaseballAvg = (v: number) => fmtFixed(v, 3).replace(/^0/, "");
    return {
      rows: [
        { key: "ba", label: "Batting average (BA)", value: formatBaseballAvg(ba), emphasis: "primary" },
        { key: "slg", label: "Slugging percentage (SLG)", value: formatBaseballAvg(slg), emphasis: "primary" },
        { key: "ops", label: "OPS (approx, no walks)", value: formatBaseballAvg(ops) },
      ],
      sections: [{
        title: "Breakdown",
        rows: [
          { key: "singles", label: "Singles", value: `${singles}` },
          { key: "total_bases", label: "Total bases", value: `${singles + 2 * d + 3 * t + 4 * hr}` },
        ],
      }],
      summary: "BA = hits ÷ at-bats. SLG = (1B + 2×2B + 3×3B + 4×HR) ÷ at-bats. OPS = OBP + SLG; here OBP is approximated as BA (no walk data).",
    };
  },
  tests: [
    { name: "100 AB, 30 H, 8 2B, 1 3B, 3 HR", inputs: { at_bats: 100, hits: 30, doubles: 8, triples: 1, home_runs: 3 }, expected: { ba: ".300" } },
  ],
};

/* --------------- Running pace (sports category) ------------------- */
export const runningPace: CalculatorDefinition = {
  slug: "running-pace",
  name: "Running Pace Calculator",
  description: "Compute pace, time, or distance for running races from 5K to marathon.",
  category: "sports",
  keywords: ["running", "pace", "race", "5k", "10k", "marathon", "half marathon"],
  status: "live",
  part: 4,
  inputs: [
    { name: "race", label: "Race distance", type: "select", default: "10k",
      options: [
        { label: "5K (5 km)", value: "5k" },
        { label: "10K (10 km)", value: "10k" },
        { label: "Half marathon (21.0975 km)", value: "half" },
        { label: "Marathon (42.195 km)", value: "full" },
        { label: "Custom", value: "custom" },
      ] },
    { name: "custom_km", label: "Custom distance (km)", type: "number", default: 10, min: 0, step: "any", unit: "km" },
    { name: "hours", label: "Finish time: hours", type: "number", default: 0, min: 0, step: "any" },
    { name: "minutes", label: "Finish time: minutes", type: "number", default: 50, min: 0, max: 59, step: "any" },
    { name: "seconds", label: "Finish time: seconds", type: "number", default: 0, min: 0, max: 59, step: "any" },
  ],
  related: ["pace-speed-distance", "sports-average", "heart-rate-zones"],
  calculate: (raw) => {
    const race = String(raw.race ?? "10k");
    const custom = toNum(raw.custom_km);
    const hours = toNum(raw.hours);
    const minutes = toNum(raw.minutes);
    const seconds = toNum(raw.seconds);
    const distances: Record<string, number> = {
      "5k": 5, "10k": 10, half: 21.0975, full: 42.195, custom,
    };
    const dist = distances[race] ?? custom;
    const totalSec = hours * 3600 + minutes * 60 + seconds;
    if (dist <= 0 || totalSec <= 0) {
      return { rows: [{ key: "pace", label: "Pace", value: "—" }] };
    }
    const paceSecPerKm = totalSec / dist;
    const pm = Math.floor(paceSecPerKm / 60);
    const ps = Math.round(paceSecPerKm % 60);
    const pacePerMile = paceSecPerKm * 1.609344;
    const mpm = Math.floor(pacePerMile / 60);
    const mps = Math.round(pacePerMile % 60);
    const speedKmh = (dist * 3600) / totalSec;
    return {
      rows: [
        { key: "pace", label: "Pace (per km)", value: `${pm}:${String(ps).padStart(2, "0")}`, emphasis: "primary" },
        { key: "pace_mile", label: "Pace (per mile)", value: `${mpm}:${String(mps).padStart(2, "0")}`, emphasis: "primary" },
        { key: "speed", label: "Average speed", value: `${fmt(speedKmh, 2)} km/h` },
      ],
      sections: [{
        title: "Splits",
        rows: [
          { key: "k1", label: "1K split", value: `${pm}:${String(ps).padStart(2, "0")}` },
          { key: "k5", label: "5K split", value: formatDuration(paceSecPerKm * 5) },
          { key: "k10", label: "10K split", value: formatDuration(paceSecPerKm * 10) },
        ],
      }],
      summary: `Pace = total time ÷ distance. ${race === "full" ? "Marathon" : race === "half" ? "Half marathon" : race.toUpperCase()} distance: ${fmt(dist, 4)} km.`,
    };
  },
  tests: [
    { name: "10K in 50min → 5:00/km pace", inputs: { race: "10k", custom_km: 10, hours: 0, minutes: 50, seconds: 0 }, expected: { pace: "5:00" } },
  ],
};

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
