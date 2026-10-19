/**
 * Environment and Energy — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* --------------- Electricity bill estimator ----------------------- */
export const electricityBill: CalculatorDefinition = {
  slug: "electricity-bill",
  name: "Electricity Bill Estimator",
  description: "Estimate monthly electricity bill from multiple appliances.",
  category: "environment",
  keywords: ["electricity", "bill", "kwh", "appliance", "energy", "power"],
  status: "live",
  part: 4,
  inputs: [
    { name: "appliances", label: "Appliances (one per line: <wattage> <hours/day>)", type: "textarea",
      default: "1500 3\n200 24\n100 8\n75 5\n50 24",
      placeholder: "wattage hours_per_day\ne.g. 1500 3 (heater 3h/day)" },
    { name: "rate", label: "Electricity rate", type: "number", default: 0.15, min: 0, step: "any", unit: "$/kWh" },
    { name: "days", label: "Billing period (days)", type: "number", default: 30, min: 1, step: 1, unit: "days" },
  ],
  related: ["electrical-energy-consumption", "solar-panel", "carbon-footprint"],
  calculate: (raw) => {
    const text = String(raw.appliances ?? "");
    const rate = toNum(raw.rate);
    const days = toNum(raw.days);
    const appliances: { w: number; h: number }[] = [];
    for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const w = toNum(parts[0]);
      const h = toNum(parts[1]);
      if (Number.isFinite(w) && Number.isFinite(h)) appliances.push({ w, h });
    }
    if (appliances.length === 0) {
      return { rows: [{ key: "total", label: "Total cost", value: "—" }] };
    }
    let totalKwh = 0;
    const rows = appliances.map((a, i) => {
      const kwh = (a.w * a.h * days) / 1000;
      totalKwh += kwh;
      return { key: `app_${i}`, label: `${a.w} W × ${a.h}h/day`, value: `${fmt(kwh, 2)} kWh` };
    });
    const totalCost = totalKwh * rate;
    return {
      rows: [
        { key: "kwh", label: "Total kWh used", value: `${fmt(totalKwh, 2)} kWh`, emphasis: "primary" },
        { key: "total", label: "Estimated bill", value: fmtUSD(totalCost), emphasis: "primary" },
        { key: "daily", label: "Daily average", value: `${fmt(totalKwh / days, 2)} kWh/day` },
      ],
      sections: [
        { title: "Appliance breakdown", rows },
      ],
      summary: "kWh = (W × hours × days) ÷ 1000. Total = kWh × rate. ESTIMATE — actual bills include fixed charges, tiered pricing, and taxes.",
    };
  },
  tests: [
    { name: "Default sample → 350.25 kWh, $52.54", inputs: { appliances: "1500 3\n200 24\n100 8\n75 5\n50 24", rate: 0.15, days: 30 }, expected: { kwh: "350.25 kWh" }, tolerance: 0.1 },
  ],
};

/* --------------- Carbon footprint --------------------------------- */
export const carbonFootprint: CalculatorDefinition = {
  slug: "carbon-footprint",
  name: "Household Carbon Footprint",
  description: "Estimate annual CO₂ emissions from electricity, gas, transport and diet.",
  category: "environment",
  keywords: ["carbon", "co2", "footprint", "emissions", "climate", "greenhouse"],
  status: "live",
  part: 4,
  inputs: [
    { name: "electricity_kwh", label: "Annual electricity (kWh)", type: "number", default: 5000, min: 0, step: "any", unit: "kWh" },
    { name: "grid_factor", label: "Grid CO₂ intensity", type: "number", default: 0.4, min: 0, step: "any", unit: "kg/kWh",
      help: "US avg ~0.4, EU ~0.25, China ~0.55, France (nuclear) ~0.06, hydro ~0.02." },
    { name: "gas_therms", label: "Natural gas (therms/year)", type: "number", default: 500, min: 0, step: "any", unit: "therms" },
    { name: "car_km", label: "Car distance per year", type: "number", default: 15000, min: 0, step: "any", unit: "km" },
    { name: "car_economy", label: "Car fuel economy", type: "number", default: 8, min: 0, step: "any", unit: "L/100km" },
    { name: "flights_hours", label: "Annual flight hours", type: "number", default: 10, min: 0, step: "any", unit: "hours" },
    { name: "diet", label: "Diet", type: "select", default: "average",
      options: [
        { label: "Heavy meat (~3.3 t/yr)", value: "heavy" },
        { label: "Average omnivore (~2.5 t/yr)", value: "average" },
        { label: "Vegetarian (~1.7 t/yr)", value: "vegetarian" },
        { label: "Vegan (~1.5 t/yr)", value: "vegan" },
      ] },
  ],
  related: ["electricity-bill", "solar-panel", "vehicle-running-costs"],
  calculate: (raw) => {
    const elec = toNum(raw.electricity_kwh);
    const grid = toNum(raw.grid_factor);
    const gas = toNum(raw.gas_therms);
    const carKm = toNum(raw.car_km);
    const carEcon = toNum(raw.car_economy);
    const flights = toNum(raw.flights_hours);
    const diet = String(raw.diet ?? "average");
    // Emission factors
    const elecCO2 = elec * grid;
    const gasCO2 = gas * 5.3; // 1 therm = 5.3 kg CO2
    const fuelL = carKm * carEcon / 100;
    const carCO2 = fuelL * 2.31; // 1 L petrol = 2.31 kg CO2
    const flightCO2 = flights * 90; // ~90 kg/hour (varies with flight length & class)
    const dietCO2: Record<string, number> = {
      heavy: 3.3, average: 2.5, vegetarian: 1.7, vegan: 1.5,
    };
    const dietT = dietCO2[diet] ?? 2.5;
    const dietCO2kg = dietT * 1000;
    const total = elecCO2 + gasCO2 + carCO2 + flightCO2 + dietCO2kg;
    const tons = total / 1000;
    return {
      rows: [
        { key: "total", label: "Total annual CO₂", value: `${fmt(tons, 2)} tonnes`, emphasis: "primary" },
        { key: "per_capita", label: "vs. world average (~4.7 t)", value: tons > 4.7 ? `${fmt(tons - 4.7, 2)} t above` : `${fmt(4.7 - tons, 2)} t below`, emphasis: tons > 4.7 ? "warning" : "success" },
      ],
      sections: [{
        title: "Breakdown",
        rows: [
          { key: "elec", label: "Electricity", value: `${fmt(elecCO2 / 1000, 2)} t` },
          { key: "gas", label: "Natural gas", value: `${fmt(gasCO2 / 1000, 2)} t` },
          { key: "car", label: "Car fuel", value: `${fmt(carCO2 / 1000, 2)} t` },
          { key: "flights", label: "Flights", value: `${fmt(flightCO2 / 1000, 2)} t` },
          { key: "diet", label: "Diet", value: `${fmt(dietCO2kg / 1000, 2)} t` },
        ],
      }],
      summary: "ESTIMATE ONLY — emission factors are global averages. Flight factors vary 2-3× by class and route. Diet factors from Poore & Nemecek (2018, Science). Paris Agreement target ~2 t/person by 2050.",
    };
  },
  tests: [
    { name: "5000 kWh @ 0.4, 500 therms, 15k km @ 8L/100km, 10 flight hr, average diet", inputs: { electricity_kwh: 5000, grid_factor: 0.4, gas_therms: 500, car_km: 15000, car_economy: 8, flights_hours: 10, diet: "average" }, expected: { total: "10.82 tonnes" }, tolerance: 0.1 },
  ],
};
