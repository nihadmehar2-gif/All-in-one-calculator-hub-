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
