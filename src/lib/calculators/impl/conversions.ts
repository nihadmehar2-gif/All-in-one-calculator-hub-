/**
 * Unit Conversions — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ----------------------------- Length ----------------------------- */
const LENGTH_TO_M: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000,
  in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
};
const lengthOptions = Object.keys(LENGTH_TO_M).map((u) => ({ label: u, value: u }));

export const lengthConverter: CalculatorDefinition = {
  slug: "length-converter",
  name: "Length Converter",
  description: "Convert between metric and imperial units of length: mm, cm, m, km, in, ft, yd, mi.",
  category: "conversions",
  keywords: ["distance", "metric", "imperial", "meter", "feet", "mile", "convert"],
  status: "live",
  part: 1,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 1, step: "any" },
    { name: "from", label: "From", type: "select", default: "m", options: lengthOptions },
    { name: "to", label: "To", type: "select", default: "ft", options: lengthOptions },
  ],
  related: ["temperature-converter", "mass-converter", "speed-converter"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "m");
    const to = String(raw.to ?? "ft");
    const inM = v * (LENGTH_TO_M[from] ?? 1);
    const out = inM / (LENGTH_TO_M[to] ?? 1);
    return {
      rows: [
        { key: "result", label: `${fmt(v, 6)} ${from} = `, value: `${fmt(out, 6)} ${to}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Common conversions",
        rows: [
          { key: "m_to_ft", label: "1 m in ft", value: fmt(LENGTH_TO_M.m / LENGTH_TO_M.ft, 6) },
          { key: "mi_to_km", label: "1 mi in km", value: fmt(LENGTH_TO_M.mi / LENGTH_TO_M.km, 6) },
          { key: "in_to_cm", label: "1 in in cm", value: fmt(LENGTH_TO_M.in / LENGTH_TO_M.cm, 6) },
        ],
      }],
    };
  },
  tests: [
    { name: "1 m to ft", inputs: { value: 1, from: "m", to: "ft" }, expected: "3.28084 ft" },
    { name: "1 mi to km", inputs: { value: 1, from: "mi", to: "km" }, expected: "1.609344 km" },
    { name: "100 cm to m", inputs: { value: 100, from: "cm", to: "m" }, expected: "1 m" },
  ],
};

/* -------------------------- Temperature --------------------------- */
export const temperatureConverter: CalculatorDefinition = {
  slug: "temperature-converter",
  name: "Temperature Converter",
  description: "Convert between Celsius, Fahrenheit, Kelvin and Rankine.",
  category: "conversions",
  keywords: ["celsius", "fahrenheit", "kelvin", "rankine", "thermometer"],
  status: "live",
  part: 1,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 25, step: "any" },
    { name: "from", label: "From", type: "select", default: "C",
      options: [{ label: "Celsius (°C)", value: "C" }, { label: "Fahrenheit (°F)", value: "F" },
        { label: "Kelvin (K)", value: "K" }, { label: "Rankine (°R)", value: "R" }] },
    { name: "to", label: "To", type: "select", default: "F",
      options: [{ label: "Celsius (°C)", value: "C" }, { label: "Fahrenheit (°F)", value: "F" },
        { label: "Kelvin (K)", value: "K" }, { label: "Rankine (°R)", value: "R" }] },
  ],
  related: ["length-converter", "mass-converter"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "C");
    const to = String(raw.to ?? "F");
    // to Celsius
    let c: number;
    switch (from) {
      case "C": c = v; break;
      case "F": c = (v - 32) * 5 / 9; break;
      case "K": c = v - 273.15; break;
      case "R": c = (v - 491.67) * 5 / 9; break;
      default: c = v;
    }
    let out: number;
    switch (to) {
      case "C": out = c; break;
      case "F": out = c * 9 / 5 + 32; break;
      case "K": out = c + 273.15; break;
      case "R": out = (c + 273.15) * 9 / 5; break;
      default: out = c;
    }
    const unitSymbol: Record<string, string> = { C: "°C", F: "°F", K: "K", R: "°R" };
    return {
      rows: [{
        key: "result",
        label: `${fmt(v, 4)} ${unitSymbol[from]} = `,
        value: `${fmt(out, 4)} ${unitSymbol[to]}`,
        emphasis: "primary",
      }],
      sections: [{
        title: "Reference points",
        rows: [
          { key: "freeze", label: "Water freezes", value: "0 °C / 32 °F / 273.15 K" },
          { key: "boil", label: "Water boils", value: "100 °C / 212 °F / 373.15 K" },
          { key: "body", label: "Body temperature", value: "37 °C / 98.6 °F" },
        ],
      }],
    };
  },
  tests: [
    { name: "25 C to F", inputs: { value: 25, from: "C", to: "F" }, expected: "77 °F" },
    { name: "32 F to C", inputs: { value: 32, from: "F", to: "C" }, expected: "0 °C" },
    { name: "0 C to K", inputs: { value: 0, from: "C", to: "K" }, expected: "273.15 K" },
  ],
};

/* ----------------------------- Mass -------------------------------- */
const MASS_TO_G: Record<string, number> = {
  mg: 0.001, g: 1, kg: 1000, t: 1_000_000,
  oz: 28.349523125, lb: 453.59237, "ton (US)": 907184.74, "tonne (metric)": 1_000_000,
};
const massOptions = Object.keys(MASS_TO_G).map((u) => ({ label: u, value: u }));

export const massConverter: CalculatorDefinition = {
  slug: "mass-converter",
  name: "Mass / Weight Converter",
  description: "Convert between metric and imperial mass units: mg, g, kg, t, oz, lb, ton.",
  category: "conversions",
  keywords: ["mass", "weight", "convert", "kg", "pound", "ounce", "ton"],
  status: "live",
  part: 4,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 1, step: "any" },
    { name: "from", label: "From", type: "select", default: "kg", options: massOptions },
    { name: "to", label: "To", type: "select", default: "lb", options: massOptions },
  ],
  related: ["length-converter", "volume-converter", "speed-converter"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "kg");
    const to = String(raw.to ?? "lb");
    const inG = v * (MASS_TO_G[from] ?? 1);
    const out = inG / (MASS_TO_G[to] ?? 1);
    return {
      rows: [
        { key: "result", label: `${fmt(v, 6)} ${from} = `, value: `${fmt(out, 6)} ${to}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Common conversions",
        rows: [
          { key: "kg_lb", label: "1 kg in lb", value: fmt(MASS_TO_G.kg / MASS_TO_G.lb, 6) },
          { key: "lb_kg", label: "1 lb in kg", value: fmt(MASS_TO_G.lb / MASS_TO_G.kg, 6) },
          { key: "oz_g", label: "1 oz in g", value: fmt(MASS_TO_G.oz / MASS_TO_G.g, 6) },
        ],
      }],
    };
  },
  tests: [
    { name: "1 kg to lb = 2.2046", inputs: { value: 1, from: "kg", to: "lb" }, expected: "2.2046 lb", tolerance: 0.0001 },
    { name: "1000 g to kg = 1", inputs: { value: 1000, from: "g", to: "kg" }, expected: "1 kg" },
  ],
};

/* --------------------------- Speed --------------------------------- */
const SPEED_TO_MS: Record<string, number> = {
  "m/s": 1, "km/h": 1/3.6, "mph": 0.44704, "knot": 0.5144444444, "ft/s": 0.3048,
};
const speedOptions = Object.keys(SPEED_TO_MS).map((u) => ({ label: u, value: u }));

export const speedConverter: CalculatorDefinition = {
  slug: "speed-converter",
  name: "Speed Converter",
  description: "Convert between m/s, km/h, mph, knot and ft/s.",
  category: "conversions",
  keywords: ["speed", "velocity", "convert", "kmh", "mph", "knot"],
  status: "live",
  part: 4,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 100, step: "any" },
    { name: "from", label: "From", type: "select", default: "km/h", options: speedOptions },
    { name: "to", label: "To", type: "select", default: "mph", options: speedOptions },
  ],
  related: ["length-converter", "mass-converter", "volume-converter"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "km/h");
    const to = String(raw.to ?? "mph");
    const inMs = v * (SPEED_TO_MS[from] ?? 1);
    const out = inMs / (SPEED_TO_MS[to] ?? 1);
    return {
      rows: [
        { key: "result", label: `${fmt(v, 6)} ${from} = `, value: `${fmt(out, 6)} ${to}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Common conversions",
        rows: [
          { key: "kmh_mph", label: "1 km/h in mph", value: fmt(SPEED_TO_MS["km/h"] / SPEED_TO_MS["mph"], 6) },
          { key: "mph_kmh", label: "1 mph in km/h", value: fmt(SPEED_TO_MS["mph"] / SPEED_TO_MS["km/h"], 6) },
          { key: "knot_kmh", label: "1 knot in km/h", value: fmt(SPEED_TO_MS["knot"] / SPEED_TO_MS["km/h"], 6) },
        ],
      }],
    };
  },
  tests: [
    { name: "100 km/h to mph = 62.137", inputs: { value: 100, from: "km/h", to: "mph" }, expected: "62.137 mph", tolerance: 0.001 },
    { name: "1 knot to km/h", inputs: { value: 1, from: "knot", to: "km/h" }, expected: "1.852 km/h", tolerance: 0.001 },
  ],
};

/* --------------------------- Volume -------------------------------- */
const VOLUME_TO_L: Record<string, number> = {
  ml: 0.001, L: 1, "m³": 1000,
  "tsp": 0.00492892, "tbsp": 0.0147868, "cup": 0.236588,
  "pt (US)": 0.473176, "qt (US)": 0.946353, "gal (US)": 3.78541, "fl oz (US)": 0.0295735,
  "gal (UK)": 4.54609,
};
const volumeOptions = Object.keys(VOLUME_TO_L).map((u) => ({ label: u, value: u }));

export const volumeConverter: CalculatorDefinition = {
  slug: "volume-converter",
  name: "Volume Converter",
  description: "Convert between metric and imperial volume units: ml, L, m³, cup, gal, fl oz.",
  category: "conversions",
  keywords: ["volume", "convert", "liter", "gallon", "cup", "fluid ounce"],
  status: "live",
  part: 4,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 1, step: "any" },
    { name: "from", label: "From", type: "select", default: "gal (US)", options: volumeOptions },
    { name: "to", label: "To", type: "select", default: "L", options: volumeOptions },
  ],
  related: ["length-converter", "mass-converter", "speed-converter"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "gal (US)");
    const to = String(raw.to ?? "L");
    const inL = v * (VOLUME_TO_L[from] ?? 1);
    const out = inL / (VOLUME_TO_L[to] ?? 1);
    return {
      rows: [
        { key: "result", label: `${fmt(v, 6)} ${from} = `, value: `${fmt(out, 6)} ${to}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Common conversions",
        rows: [
          { key: "gal_L", label: "1 US gal in L", value: fmt(VOLUME_TO_L["gal (US)"], 6) },
          { key: "cup_ml", label: "1 cup in ml", value: fmt(VOLUME_TO_L["cup"] * 1000, 4) },
          { key: "tbsp_ml", label: "1 tbsp in ml", value: fmt(VOLUME_TO_L["tbsp"] * 1000, 4) },
        ],
      }],
    };
  },
  tests: [
    { name: "1 US gal to L = 3.78541", inputs: { value: 1, from: "gal (US)", to: "L" }, expected: "3.78541 L" },
    { name: "1 cup to ml", inputs: { value: 1, from: "cup", to: "ml" }, expected: "236.588 ml" },
  ],
};

/* --------------------------- Pressure ------------------------------ */
const PRESSURE_TO_PA: Record<string, number> = {
  Pa: 1, kPa: 1000, MPa: 1_000_000, bar: 100_000, mbar: 100,
  psi: 6894.76, atm: 101325, mmHg: 133.322, inHg: 3386.39, torr: 133.322,
};
const pressureOptions = Object.keys(PRESSURE_TO_PA).map((u) => ({ label: u, value: u }));

export const pressureConverter: CalculatorDefinition = {
  slug: "pressure-converter",
  name: "Pressure Converter",
  description: "Convert between Pa, kPa, bar, psi, atm, mmHg and other pressure units.",
  category: "conversions",
  keywords: ["pressure", "convert", "pascal", "bar", "psi", "atm", "mmhg"],
  status: "live",
  part: 4,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 1, step: "any" },
    { name: "from", label: "From", type: "select", default: "bar", options: pressureOptions },
    { name: "to", label: "To", type: "select", default: "psi", options: pressureOptions },
  ],
  related: ["density-pressure-buoyancy", "length-converter", "mass-converter"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "bar");
    const to = String(raw.to ?? "psi");
    const inPa = v * (PRESSURE_TO_PA[from] ?? 1);
    const out = inPa / (PRESSURE_TO_PA[to] ?? 1);
    return {
      rows: [
        { key: "result", label: `${fmt(v, 6)} ${from} = `, value: `${fmt(out, 6)} ${to}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Common conversions",
        rows: [
          { key: "atm_pa", label: "1 atm in Pa", value: fmt(PRESSURE_TO_PA.atm, 0) },
          { key: "bar_psi", label: "1 bar in psi", value: fmt(PRESSURE_TO_PA.bar / PRESSURE_TO_PA.psi, 4) },
          { key: "psi_kpa", label: "1 psi in kPa", value: fmt(PRESSURE_TO_PA.psi / PRESSURE_TO_PA.kPa, 4) },
        ],
      }],
    };
  },
  tests: [
    { name: "1 bar to psi = 14.504", inputs: { value: 1, from: "bar", to: "psi" }, expected: "14.504 psi", tolerance: 0.001 },
    { name: "1 atm to Pa = 101,325", inputs: { value: 1, from: "atm", to: "Pa" }, expected: "101,325 Pa" },
  ],
};

/* ----------------------------- Area -------------------------------- */
const AREA_TO_M2: Record<string, number> = {
  "mm²": 0.000001, "cm²": 0.0001, "m²": 1, "km²": 1_000_000,
  "in²": 0.00064516, "ft²": 0.092903, "yd²": 0.836127,
  "acre": 4046.86, "hectare": 10000, "mi²": 2_589_988,
};
const areaOptions = Object.keys(AREA_TO_M2).map((u) => ({ label: u, value: u }));

export const areaConverter: CalculatorDefinition = {
  slug: "area-converter",
  name: "Area Converter",
  description: "Convert between metric and imperial area units: m², ft², acre, hectare, mi².",
  category: "conversions",
  keywords: ["area", "convert", "square meter", "square foot", "acre", "hectare"],
  status: "live",
  part: 4,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 1, step: "any" },
    { name: "from", label: "From", type: "select", default: "acre", options: areaOptions },
    { name: "to", label: "To", type: "select", default: "m²", options: areaOptions },
  ],
  related: ["length-converter", "volume-converter", "wall-area-room"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "acre");
    const to = String(raw.to ?? "m²");
    const inM2 = v * (AREA_TO_M2[from] ?? 1);
    const out = inM2 / (AREA_TO_M2[to] ?? 1);
    return {
      rows: [
        { key: "result", label: `${fmt(v, 6)} ${from} = `, value: `${fmt(out, 6)} ${to}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Common conversions",
        rows: [
          { key: "acre_m2", label: "1 acre in m²", value: fmt(AREA_TO_M2["acre"], 2) },
          { key: "hectare_acre", label: "1 ha in acres", value: fmt(AREA_TO_M2["hectare"] / AREA_TO_M2["acre"], 4) },
          { key: "ft2_m2", label: "1 ft² in m²", value: fmt(AREA_TO_M2["ft²"], 6) },
        ],
      }],
    };
  },
  tests: [
    { name: "1 acre to m²", inputs: { value: 1, from: "acre", to: "m²" }, expected: "4,046.86 m²" },
    { name: "1 hectare to acres", inputs: { value: 1, from: "hectare", to: "acre" }, expected: "2.4711 acre", tolerance: 0.0001 },
  ],
};

/* ----------------------------- Energy ------------------------------ */
const ENERGY_TO_J: Record<string, number> = {
  J: 1, kJ: 1000, MJ: 1_000_000,
  cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3_600_000,
  BTU: 1055.06, "therm (US)": 105_480_000,
  "ft·lb": 1.35582, "eV": 1.602176634e-19,
};
const energyOptions = Object.keys(ENERGY_TO_J).map((u) => ({ label: u, value: u }));

export const energyConverter: CalculatorDefinition = {
  slug: "energy-converter",
  name: "Energy Converter",
  description: "Convert between J, kJ, cal, kcal, Wh, kWh, BTU and other energy units.",
  category: "conversions",
  keywords: ["energy", "convert", "joule", "calorie", "kwh", "btu"],
  status: "live",
  part: 4,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 1, step: "any" },
    { name: "from", label: "From", type: "select", default: "kWh", options: energyOptions },
    { name: "to", label: "To", type: "select", default: "kJ", options: energyOptions },
  ],
  related: ["electrical-energy-consumption", "work-energy-power", "mass-converter"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "kWh");
    const to = String(raw.to ?? "kJ");
    const inJ = v * (ENERGY_TO_J[from] ?? 1);
    const out = inJ / (ENERGY_TO_J[to] ?? 1);
    return {
      rows: [
        { key: "result", label: `${fmt(v, 6)} ${from} = `, value: `${fmt(out, 6)} ${to}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Common conversions",
        rows: [
          { key: "kwh_kj", label: "1 kWh in kJ", value: fmt(ENERGY_TO_J["kWh"] / ENERGY_TO_J["kJ"], 0) },
          { key: "kcal_kj", label: "1 kcal in kJ", value: fmt(ENERGY_TO_J["kcal"] / ENERGY_TO_J["kJ"], 4) },
          { key: "btu_kj", label: "1 BTU in kJ", value: fmt(ENERGY_TO_J["BTU"] / ENERGY_TO_J["kJ"], 4) },
        ],
      }],
    };
  },
  tests: [
    { name: "1 kWh to kJ = 3600", inputs: { value: 1, from: "kWh", to: "kJ" }, expected: "3,600 kJ" },
    { name: "1 kcal to kJ = 4.184", inputs: { value: 1, from: "kcal", to: "kJ" }, expected: "4.184 kJ" },
  ],
};
