/**
 * Science and Physics — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* Ohm's Law */
export const ohmsLaw: CalculatorDefinition = {
  slug: "ohms-law",
  name: "Ohm's Law Calculator",
  description: "Solve for voltage, current, resistance or power given any two values.",
  category: "science",
  keywords: ["voltage", "current", "resistance", "power", "V=IR", "watt", "volt", "amp"],
  status: "live",
  part: 1,
  inputs: [
    { name: "voltage", label: "Voltage (V)", type: "number", default: 12, step: "any", unit: "V", help: "Leave blank to solve." },
    { name: "current", label: "Current (I)", type: "number", default: 2, step: "any", unit: "A", help: "Leave blank to solve." },
    { name: "resistance", label: "Resistance (R)", type: "number", default: 0, step: "any", unit: "Ω", help: "Leave blank to solve." },
  ],
  related: ["power-calculator", "resistor-color-code"],
  calculate: (raw) => {
    const hasV = raw.voltage !== "" && raw.voltage !== undefined && raw.voltage !== null;
    const hasI = raw.current !== "" && raw.current !== undefined && raw.current !== null;
    const hasR = raw.resistance !== "" && raw.resistance !== undefined && raw.resistance !== null;
    const V = hasV ? toNum(raw.voltage) : NaN;
    const I = hasI ? toNum(raw.current) : NaN;
    const R = hasR ? toNum(raw.resistance) : NaN;
    let v = V, i = I, r = R;
    if (Number.isFinite(v) && Number.isFinite(i) && !Number.isFinite(r)) r = v / i;
    else if (Number.isFinite(v) && Number.isFinite(r) && !Number.isFinite(i)) i = v / r;
    else if (Number.isFinite(i) && Number.isFinite(r) && !Number.isFinite(v)) v = i * r;
    if (!Number.isFinite(v) || !Number.isFinite(i) || !Number.isFinite(r) || i === 0 || r === 0) {
      return { rows: [{ key: "power", label: "Power", value: "—", hint: "Provide any two of V, I, R." }] };
    }
    const power = v * i;
    return {
      rows: [
        { key: "voltage", label: "Voltage (V)", value: `${fmt(v, 4)} V` },
        { key: "current", label: "Current (I)", value: `${fmt(i, 4)} A` },
        { key: "resistance", label: "Resistance (R)", value: `${fmt(r, 4)} Ω` },
        { key: "power", label: "Power (P = V × I)", value: `${fmt(power, 4)} W`, emphasis: "primary" },
      ],
      summary: "Ohm's Law: V = I·R. Power P = V·I = I²R = V²/R.",
    };
  },
  tests: [
    { name: "12V, 2A → solve R", inputs: { voltage: 12, current: 2, resistance: "" }, expected: { power: "24 W" } },
    { name: "5V, 10Ω → solve I", inputs: { voltage: 5, current: "", resistance: 10 }, expected: { power: "2.5 W" } },
  ],
};
