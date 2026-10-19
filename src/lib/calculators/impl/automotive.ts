/**
 * Automotive and Transportation — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* ----------------------- Fuel economy ----------------------------- */
export const fuelEconomy: CalculatorDefinition = {
  slug: "fuel-economy",
  name: "Fuel Economy & Trip Cost",
  description: "Convert between MPG, L/100km and km/L, and compute trip fuel cost.",
  category: "automotive",
  keywords: ["fuel", "economy", "mpg", "l/100km", "km/l", "gas", "petrol", "car"],
  status: "live",
  part: 4,
  inputs: [
    { name: "mode", label: "Input unit", type: "select", default: "mpg_us",
      options: [
        { label: "MPG (US gallon)", value: "mpg_us" },
        { label: "MPG (UK gallon)", value: "mpg_uk" },
        { label: "L/100km", value: "l100km" },
        { label: "km/L", value: "kml" },
      ] },
    { name: "value", label: "Fuel economy value", type: "number", default: 30, min: 0, step: "any" },
    { name: "distance", label: "Trip distance", type: "number", default: 500, min: 0, step: "any", unit: "km" },
    { name: "fuel_price", label: "Fuel price", type: "number", default: 1.5, min: 0, step: "any", unit: "$/L",
      help: "Enter price per liter (divide $/gallon by 3.785)." },
  ],
  related: ["trip-cost", "speed-converter", "vehicle-running-costs"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "mpg_us");
    const value = toNum(raw.value);
    const distance = toNum(raw.distance);
    const price = toNum(raw.fuel_price);
    if (value <= 0) return { rows: [{ key: "mpg_us", label: "MPG (US)", value: "—" }] };
    // Convert to L/100km first
    let l100: number;
    if (mode === "l100km") l100 = value;
    else if (mode === "kml") l100 = 100 / value;
    else if (mode === "mpg_us") l100 = 235.215 / value; // 1 MPG (US) = 235.215 L/100km
    else l100 = 282.481 / value; // MPG (UK)
    const mpgUs = 235.215 / l100;
    const mpgUk = 282.481 / l100;
    const kml = 100 / l100;
    const fuelNeeded = (distance * l100) / 100;
    const cost = fuelNeeded * price;
    return {
      rows: [
        { key: "mpg_us", label: "MPG (US)", value: `${fmt(mpgUs, 2)}` },
        { key: "mpg_uk", label: "MPG (UK)", value: `${fmt(mpgUk, 2)}` },
        { key: "l100km", label: "L/100km", value: `${fmt(l100, 2)}`, emphasis: "primary" },
        { key: "kml", label: "km/L", value: `${fmt(kml, 2)}` },
        { key: "fuel", label: `Fuel needed for ${fmt(distance, 0)} km`, value: `${fmt(fuelNeeded, 2)} L`, emphasis: "primary" },
        { key: "cost", label: "Trip cost", value: fmtUSD(cost), emphasis: "primary" },
      ],
      summary: "1 MPG (US) = 235.215 L/100km. 1 MPG (UK) = 282.481 L/100km. L/100km is inversely related to MPG — lower L/100km is more efficient.",
    };
  },
  tests: [
    { name: "30 MPG US → 7.84 L/100km", inputs: { mode: "mpg_us", value: 30, distance: 500, fuel_price: 1.5 }, expected: { l100km: "7.84" } },
    { name: "30 MPG US, 500km @ $1.5/L → $58.80", inputs: { mode: "mpg_us", value: 30, distance: 500, fuel_price: 1.5 }, expected: { cost: "$58.80" } },
  ],
};

/* ----------------------- Trip cost --------------------------------- */
export const tripCost: CalculatorDefinition = {
  slug: "trip-cost",
  name: "Trip Cost Calculator",
  description: "Estimate total trip cost including fuel, tolls, wear, and time.",
  category: "automotive",
  keywords: ["trip", "travel", "cost", "drive", "road trip"],
  status: "live",
  part: 4,
  inputs: [
    { name: "distance", label: "Trip distance", type: "number", default: 800, min: 0, step: "any", unit: "km" },
    { name: "fuel_economy", label: "Vehicle fuel economy", type: "number", default: 8, min: 0, step: "any", unit: "L/100km" },
    { name: "fuel_price", label: "Fuel price", type: "number", default: 1.5, min: 0, step: "any", unit: "$/L" },
    { name: "tolls", label: "Tolls", type: "number", default: 15, min: 0, step: "any", unit: "$" },
    { name: "wear_per_km", label: "Wear & maintenance per km", type: "number", default: 0.05, min: 0, step: "any", unit: "$/km" },
    { name: "avg_speed", label: "Average speed", type: "number", default: 90, min: 1, step: "any", unit: "km/h" },
    { name: "time_value", label: "Value of your time", type: "number", default: 15, min: 0, step: "any", unit: "$/hr" },
  ],
  related: ["fuel-economy", "vehicle-running-costs", "speed-converter"],
  calculate: (raw) => {
    const d = toNum(raw.distance);
    const econ = toNum(raw.fuel_economy);
    const price = toNum(raw.fuel_price);
    const tolls = toNum(raw.tolls);
    const wear = toNum(raw.wear_per_km);
    const speed = toNum(raw.avg_speed);
    const timeValue = toNum(raw.time_value);
    const fuelLiters = (d * econ) / 100;
    const fuelCost = fuelLiters * price;
    const wearCost = d * wear;
    const hours = d / speed;
    const timeCost = hours * timeValue;
    const total = fuelCost + tolls + wearCost + timeCost;
    return {
      rows: [
        { key: "total", label: "Total trip cost", value: fmtUSD(total), emphasis: "primary" },
        { key: "fuel", label: "Fuel cost", value: fmtUSD(fuelCost), emphasis: "primary" },
        { key: "wear", label: "Wear & maintenance", value: fmtUSD(wearCost) },
        { key: "tolls", label: "Tolls", value: fmtUSD(tolls) },
        { key: "time", label: "Time value", value: fmtUSD(timeCost) },
        { key: "hours", label: "Driving time", value: `${fmt(hours, 2)} hours` },
      ],
      summary: "Trip cost = fuel + tolls + wear + value of time. Time value is optional — set to 0 to exclude. Wear estimate (~$0.05/km) covers tires, oil, depreciation.",
    };
  },
  tests: [
    { name: "800km, 8L/100km, $1.5/L, $15 tolls, 0.05/km wear", inputs: { distance: 800, fuel_economy: 8, fuel_price: 1.5, tolls: 15, wear_per_km: 0.05, avg_speed: 90, time_value: 15 }, expected: { fuel: "$96.00" } },
  ],
};

/* ----------------- Vehicle running costs -------------------------- */
export const vehicleRunningCosts: CalculatorDefinition = {
  slug: "vehicle-running-costs",
  name: "Vehicle Annual Running Costs",
  description: "Estimate total annual cost of owning and operating a vehicle.",
  category: "automotive",
  keywords: ["vehicle", "car", "running cost", "annual", "ownership", "tco"],
  status: "live",
  part: 4,
  inputs: [
    { name: "annual_km", label: "Annual kilometers driven", type: "number", default: 15000, min: 0, step: "any", unit: "km" },
    { name: "fuel_economy", label: "Fuel economy", type: "number", default: 8, min: 0, step: "any", unit: "L/100km" },
    { name: "fuel_price", label: "Fuel price", type: "number", default: 1.5, min: 0, step: "any", unit: "$/L" },
    { name: "insurance", label: "Annual insurance", type: "number", default: 1200, min: 0, step: "any", unit: "$" },
    { name: "maintenance", label: "Annual maintenance", type: "number", default: 600, min: 0, step: "any", unit: "$" },
    { name: "depreciation", label: "Annual depreciation", type: "number", default: 2500, min: 0, step: "any", unit: "$" },
    { name: "registration", label: "Registration & taxes", type: "number", default: 200, min: 0, step: "any", unit: "$" },
  ],
  related: ["fuel-economy", "trip-cost", "auto-loan"],
  calculate: (raw) => {
    const km = toNum(raw.annual_km);
    const econ = toNum(raw.fuel_economy);
    const price = toNum(raw.fuel_price);
    const insurance = toNum(raw.insurance);
    const maint = toNum(raw.maintenance);
    const depr = toNum(raw.depreciation);
    const reg = toNum(raw.registration);
    const fuelCost = (km * econ / 100) * price;
    const total = fuelCost + insurance + maint + depr + reg;
    const perKm = total / Math.max(1, km);
    return {
      rows: [
        { key: "total", label: "Total annual cost", value: fmtUSD(total), emphasis: "primary" },
        { key: "per_km", label: "Cost per km", value: `${fmt(perKm, 2)} $/km`, emphasis: "primary" },
        { key: "per_month", label: "Per month", value: fmtUSD(total / 12) },
      ],
      sections: [{
        title: "Cost breakdown",
        rows: [
          { key: "fuel", label: "Fuel", value: fmtUSD(fuelCost) },
          { key: "depr", label: "Depreciation", value: fmtUSD(depr) },
          { key: "insurance", label: "Insurance", value: fmtUSD(insurance) },
          { key: "maint", label: "Maintenance", value: fmtUSD(maint) },
          { key: "reg", label: "Registration & taxes", value: fmtUSD(reg) },
        ],
      }],
      summary: "Annual cost = fuel + insurance + maintenance + depreciation + registration. Depreciation is usually the largest single cost for new cars. Per-km cost is useful for comparing with ride-share alternatives.",
    };
  },
  tests: [
    { name: "15k km/yr, 8L/100km @ $1.5, $1200 ins, $600 maint, $2500 depr, $200 reg", inputs: { annual_km: 15000, fuel_economy: 8, fuel_price: 1.5, insurance: 1200, maintenance: 600, depreciation: 2500, registration: 200 }, expected: { total: "$6,300.00" } },
  ],
};
