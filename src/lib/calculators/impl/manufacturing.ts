/**
 * Manufacturing and Industry — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ------------------- OEE ------------------------------------------ */
export const oeeCalculator: CalculatorDefinition = {
  slug: "oee",
  name: "OEE (Overall Equipment Effectiveness)",
  description: "Compute OEE from availability, performance and quality — the standard manufacturing KPI.",
  category: "manufacturing",
  keywords: ["oee", "manufacturing", "availability", "performance", "quality", "efficiency"],
  status: "live",
  part: 5,
  inputs: [
    { name: "planned_time", label: "Planned production time (min)", type: "number", default: 480, min: 0, step: "any", unit: "min" },
    { name: "downtime", label: "Unplanned downtime (min)", type: "number", default: 45, min: 0, step: "any", unit: "min" },
    { name: "ideal_cycle", label: "Ideal cycle time (sec/unit)", type: "number", default: 5, min: 0.001, step: "any", unit: "s" },
    { name: "total_count", label: "Total units produced", type: "number", default: 4200, min: 0, step: 1 },
    { name: "reject_count", label: "Rejected units", type: "number", default: 80, min: 0, step: 1 },
  ],
  related: ["cycle-time", "throughput", "inventory-turnover"],
  calculate: (raw) => {
    const planned = toNum(raw.planned_time);
    const down = toNum(raw.downtime);
    const idealCycle = toNum(raw.ideal_cycle);
    const total = toNum(raw.total_count);
    const reject = toNum(raw.reject_count);
    if (planned <= 0 || idealCycle <= 0) {
      return { rows: [{ key: "oee", label: "OEE", value: "—" }] };
    }
    const runTime = Math.max(0, planned - down);
    const availability = runTime / planned;
    const goodCount = Math.max(0, total - reject);
    // Performance = (ideal cycle × total count) / run time
    const performance = (idealCycle * total / 60) / runTime;
    const quality = total > 0 ? goodCount / total : 0;
    const oee = availability * performance * quality;
    return {
      rows: [
        { key: "oee", label: "OEE", value: `${fmt(oee * 100, 2)}%`, emphasis: "primary" },
        { key: "availability", label: "Availability", value: `${fmt(availability * 100, 2)}%` },
        { key: "performance", label: "Performance", value: `${fmt(performance * 100, 2)}%` },
        { key: "quality", label: "Quality", value: `${fmt(quality * 100, 2)}%` },
      ],
      sections: [{
        title: "Components",
        rows: [
          { key: "run_time", label: "Run time", value: `${fmt(runTime, 0)} min` },
          { key: "good_count", label: "Good units", value: String(goodCount) },
          { key: "benchmark", label: "World-class benchmark", value: "85% OEE (90% A × 95% P × 99% Q)" },
        ],
      }],
      summary: "OEE = Availability × Performance × Quality. World-class is typically ≥85%. Each component isolates a different loss category.",
    };
  },
  tests: [
    { name: "480 min planned, 45 down, 5s cycle, 4200 units, 80 rejects", inputs: { planned_time: 480, downtime: 45, ideal_cycle: 5, total_count: 4200, reject_count: 80 }, expected: { oee: "70.7%" }, tolerance: 1 },
  ],
};

/* ------------------- Cycle time ----------------------------------- */
export const cycleTime: CalculatorDefinition = {
  slug: "cycle-time",
  name: "Cycle Time & Throughput",
  description: "Compute cycle time per unit and throughput rate from production data.",
  category: "manufacturing",
  keywords: ["cycle time", "throughput", "takt", "production rate", "manufacturing"],
  status: "live",
  part: 5,
  inputs: [
    { name: "units", label: "Total units produced", type: "number", default: 1000, min: 1, step: 1 },
    { name: "time_min", label: "Production time (minutes)", type: "number", default: 240, min: 0.001, step: "any" },
  ],
  related: ["oee", "throughput", "inventory-turnover"],
  calculate: (raw) => {
    const units = toNum(raw.units);
    const timeMin = toNum(raw.time_min);
    if (units <= 0 || timeMin <= 0) {
      return { rows: [{ key: "cycle", label: "Cycle time", value: "—" }] };
    }
    const cycleSecPerUnit = (timeMin * 60) / units;
    const unitsPerHour = (units / timeMin) * 60;
    const unitsPerDay = unitsPerHour * 24;
    return {
      rows: [
        { key: "cycle", label: "Cycle time per unit", value: `${fmt(cycleSecPerUnit, 4)} sec/unit`, emphasis: "primary" },
        { key: "rate", label: "Throughput", value: `${fmt(unitsPerHour, 2)} units/hour`, emphasis: "primary" },
        { key: "daily", label: "Per day (24h)", value: `${fmt(unitsPerDay, 0)} units/day` },
      ],
      summary: "Cycle time = total time ÷ units. Throughput = units ÷ time. Lower cycle time = higher throughput.",
    };
  },
  tests: [
    { name: "1000 units in 240 min → 14.4 s/unit, 250/hr", inputs: { units: 1000, time_min: 240 }, expected: { cycle: "14.4 sec/unit", rate: "250 units/hour" } },
  ],
};

/* ------------------- Throughput with downtime ---------------------- */
export const throughput: CalculatorDefinition = {
  slug: "throughput",
  name: "Throughput with Downtime",
  description: "Compute effective throughput accounting for planned and unplanned downtime.",
  category: "manufacturing",
  keywords: ["throughput", "downtime", "oee", "effective", "production"],
  status: "live",
  part: 5,
  inputs: [
    { name: "shift_hours", label: "Shift length (hours)", type: "number", default: 8, min: 0.1, step: "any" },
    { name: "planned_down", label: "Planned downtime (breaks, changeover) (min)", type: "number", default: 45, min: 0, step: "any" },
    { name: "unplanned_down", label: "Unplanned downtime (min)", type: "number", default: 25, min: 0, step: "any" },
    { name: "cycle_sec", label: "Cycle time (sec/unit)", type: "number", default: 12, min: 0.01, step: "any" },
  ],
  related: ["cycle-time", "oee", "inventory-turnover"],
  calculate: (raw) => {
    const shiftH = toNum(raw.shift_hours);
    const plannedDown = toNum(raw.planned_down);
    const unplannedDown = toNum(raw.unplanned_down);
    const cycle = toNum(raw.cycle_sec);
    const totalMin = shiftH * 60;
    const runMin = Math.max(0, totalMin - plannedDown - unplannedDown);
    const runSec = runMin * 60;
    const units = runSec / cycle;
    const utilization = totalMin > 0 ? runMin / totalMin : 0;
    return {
      rows: [
        { key: "units", label: "Units per shift", value: `${fmt(units, 0)}`, emphasis: "primary" },
        { key: "rate", label: "Effective throughput", value: `${fmt(units / shiftH, 2)} units/hour`, emphasis: "primary" },
        { key: "util", label: "Utilization", value: `${fmt(utilization * 100, 2)}%` },
      ],
      sections: [{
        title: "Time breakdown",
        rows: [
          { key: "total", label: "Total shift time", value: `${fmt(totalMin, 0)} min` },
          { key: "planned", label: "Planned downtime", value: `${fmt(plannedDown, 0)} min` },
          { key: "unplanned", label: "Unplanned downtime", value: `${fmt(unplannedDown, 0)} min` },
          { key: "run", label: "Run time", value: `${fmt(runMin, 0)} min` },
        ],
      }],
      summary: "Effective throughput = run time ÷ cycle time. Utilization = run time ÷ total time.",
    };
  },
  tests: [
    { name: "8h shift, 45+25 min down, 12s cycle", inputs: { shift_hours: 8, planned_down: 45, unplanned_down: 25, cycle_sec: 12 }, expected: { units: "2,050" }, tolerance: 1 },
  ],
};

/* ------------------- Material yield -------------------------------- */
export const materialYield: CalculatorDefinition = {
  slug: "material-yield",
  name: "Material Yield & Scrap Rate",
  description: "Compute yield percentage and scrap rate from raw material input vs good output.",
  category: "manufacturing",
  keywords: ["yield", "scrap", "waste", "material", "production"],
  status: "live",
  part: 5,
  inputs: [
    { name: "input", label: "Raw material input (units or kg)", type: "number", default: 1000, min: 0, step: "any" },
    { name: "good_output", label: "Good output (units or kg)", type: "number", default: 920, min: 0, step: "any" },
  ],
  related: ["oee", "cycle-time", "throughput"],
  calculate: (raw) => {
    const input = toNum(raw.input);
    const good = toNum(raw.good_output);
    if (input <= 0) {
      return { rows: [{ key: "yield", label: "Yield", value: "—" }] };
    }
    const yieldPct = (good / input) * 100;
    const scrapPct = 100 - yieldPct;
    const scrap = input - good;
    return {
      rows: [
        { key: "yield", label: "Yield", value: `${fmt(yieldPct, 2)}%`, emphasis: "primary" },
        { key: "scrap_pct", label: "Scrap rate", value: `${fmt(scrapPct, 2)}%`, emphasis: "primary" },
        { key: "scrap", label: "Scrap amount", value: `${fmt(scrap, 2)}` },
        { key: "ratio", label: "First-pass yield ratio", value: `${fmt(good / input, 4)} : 1` },
      ],
      summary: "Yield = good output ÷ input. Scrap = input − good output. Tracking yield over time reveals process improvements.",
    };
  },
  tests: [
    { name: "1000 in, 920 good → 92% yield", inputs: { input: 1000, good_output: 920 }, expected: { yield: "92%" } },
  ],
};
