/**
 * Engineering and Electronics — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

// Standard resistor color codes
const COLOR_BANDS: Record<string, { value: number | null; multiplier: number; tolerance: number | null }> = {
  black:  { value: 0,  multiplier: 1,        tolerance: null },
  brown:  { value: 1,  multiplier: 10,       tolerance: 1 },
  red:    { value: 2,  multiplier: 100,      tolerance: 2 },
  orange: { value: 3,  multiplier: 1000,     tolerance: null },
  yellow: { value: 4,  multiplier: 10000,    tolerance: null },
  green:  { value: 5,  multiplier: 100000,   tolerance: 0.5 },
  blue:   { value: 6,  multiplier: 1000000,  tolerance: 0.25 },
  violet: { value: 7,  multiplier: 10000000, tolerance: 0.1 },
  gray:   { value: 8,  multiplier: 100000000, tolerance: 0.05 },
  white:  { value: 9,  multiplier: 1000000000, tolerance: null },
  gold:   { value: null, multiplier: 0.1,    tolerance: 5 },
  silver: { value: null, multiplier: 0.01,   tolerance: 10 },
};

export const resistorColorCode: CalculatorDefinition = {
  slug: "resistor-color-code",
  name: "Resistor Color Code Decoder",
  description: "Decode a 4-band or 5-band resistor from color bands to resistance value.",
  category: "engineering",
  keywords: ["resistor", "color code", "band", "decode", "ohm", "electronics"],
  status: "live",
  part: 4,
  inputs: [
    { name: "bands", label: "Number of bands", type: "select", default: "4",
      options: [{ label: "4-band (2 digits + multiplier + tolerance)", value: "4" }, { label: "5-band (3 digits + multiplier + tolerance)", value: "5" }] },
    { name: "b1", label: "Band 1", type: "select", default: "red",
      options: ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white"].map((c) => ({ label: c, value: c })) },
    { name: "b2", label: "Band 2", type: "select", default: "red",
      options: ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white"].map((c) => ({ label: c, value: c })) },
    { name: "b3", label: "Band 3 (5-band: 3rd digit; 4-band: multiplier)", type: "select", default: "black",
      options: ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white", "gold", "silver"].map((c) => ({ label: c, value: c })) },
    { name: "b4", label: "Band 4 (5-band: multiplier; 4-band: tolerance)", type: "select", default: "gold",
      options: ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white", "gold", "silver"].map((c) => ({ label: c, value: c })) },
    { name: "b5", label: "Band 5 (5-band: tolerance only)", type: "select", default: "gold",
      options: ["brown", "red", "green", "blue", "violet", "gray", "gold", "silver"].map((c) => ({ label: c, value: c })) },
  ],
  related: ["ohms-law", "series-parallel-resistance", "led-resistor", "voltage-divider"],
  calculate: (raw) => {
    const bandCount = Number(raw.bands ?? 4);
    let resistance: number;
    let tolerance: number | null = null;
    try {
      if (bandCount === 4) {
        const d1 = COLOR_BANDS[String(raw.b1)].value!;
        const d2 = COLOR_BANDS[String(raw.b2)].value!;
        const mult = COLOR_BANDS[String(raw.b3)].multiplier;
        tolerance = COLOR_BANDS[String(raw.b4)].tolerance;
        resistance = (d1 * 10 + d2) * mult;
      } else {
        const d1 = COLOR_BANDS[String(raw.b1)].value!;
        const d2 = COLOR_BANDS[String(raw.b2)].value!;
        const d3 = COLOR_BANDS[String(raw.b3)].value!;
        const mult = COLOR_BANDS[String(raw.b4)].multiplier;
        tolerance = COLOR_BANDS[String(raw.b5)].tolerance;
        resistance = (d1 * 100 + d2 * 10 + d3) * mult;
      }
    } catch (e) {
      return { rows: [{ key: "result", label: "Resistance", value: "—", hint: (e as Error).message }] };
    }
    const fmtRes = formatResistance(resistance);
    const min = resistance * (1 - (tolerance ?? 0) / 100);
    const max = resistance * (1 + (tolerance ?? 0) / 100);
    return {
      rows: [
        { key: "result", label: "Resistance", value: fmtRes, emphasis: "primary" },
        { key: "tolerance", label: "Tolerance", value: tolerance !== null ? `±${tolerance}%` : "—" },
        { key: "range", label: "Range", value: `${formatResistance(min)} — ${formatResistance(max)}`, emphasis: "primary" },
      ],
      summary: "Standard resistor color code. Band 1-2 (or 1-3 for 5-band) are significant digits, next band is multiplier (×10^n), final band is tolerance. Gold = ±5%, Silver = ±10%.",
    };
  },
  tests: [
    { name: "Red-Red-Black-Gold = 22Ω ±5%", inputs: { bands: "4", b1: "red", b2: "red", b3: "black", b4: "gold", b5: "gold" }, expected: { result: "22 Ω" } },
    { name: "Yellow-Violet-Orange-Gold = 47kΩ", inputs: { bands: "4", b1: "yellow", b2: "violet", b3: "orange", b4: "gold", b5: "gold" }, expected: { result: "47 kΩ" } },
    { name: "5-band: brown-black-black-red-brown = 10kΩ ±1%", inputs: { bands: "5", b1: "brown", b2: "black", b3: "black", b4: "red", b5: "brown" }, expected: { result: "10 kΩ" } },
  ],
};

function formatResistance(r: number): string {
  if (r >= 1e6) return `${fmt(r / 1e6, 4)} MΩ`;
  if (r >= 1e3) return `${fmt(r / 1e3, 4)} kΩ`;
  return `${fmt(r, 4)} Ω`;
}

/* ------------------ Voltage divider -------------------------------- */
export const voltageDivider: CalculatorDefinition = {
  slug: "voltage-divider",
  name: "Voltage Divider",
  description: "Compute output voltage from a 2-resistor divider (Vout = Vin × R2/(R1+R2)).",
  category: "engineering",
  keywords: ["voltage divider", "vout", "potential divider", "resistor", "circuit"],
  status: "live",
  part: 4,
  inputs: [
    { name: "vin", label: "Input voltage (Vin)", type: "number", default: 12, step: "any", unit: "V" },
    { name: "r1", label: "R1 (top resistor)", type: "number", default: 1000, min: 0, step: "any", unit: "Ω" },
    { name: "r2", label: "R2 (bottom resistor)", type: "number", default: 2000, min: 0, step: "any", unit: "Ω" },
  ],
  related: ["ohms-law", "resistor-color-code", "series-parallel-resistance", "led-resistor"],
  calculate: (raw) => {
    const vin = toNum(raw.vin);
    const r1 = toNum(raw.r1);
    const r2 = toNum(raw.r2);
    if (r1 + r2 === 0) {
      return { rows: [{ key: "vout", label: "Vout", value: "—" }] };
    }
    const vout = vin * r2 / (r1 + r2);
    const current = vin / (r1 + r2);
    const powerR1 = current * current * r1;
    const powerR2 = current * current * r2;
    return {
      rows: [
        { key: "vout", label: "Vout = Vin × R2/(R1+R2)", value: `${fmt(vout, 4)} V`, emphasis: "primary" },
        { key: "current", label: "Current draw", value: `${fmt(current * 1000, 4)} mA` },
      ],
      sections: [{
        title: "Power dissipation",
        rows: [
          { key: "p_r1", label: "R1 power", value: `${fmt(powerR1 * 1000, 4)} mW` },
          { key: "p_r2", label: "R2 power", value: `${fmt(powerR2 * 1000, 4)} mW` },
        ],
      }],
      summary: "Vout = Vin × R2 / (R1 + R2). The current through both resistors is the same; power dissipated is I²R. Choose resistor values low enough to drive the load but high enough to limit wasted current.",
    };
  },
  tests: [
    { name: "12V, R1=1k, R2=2k → Vout = 8V", inputs: { vin: 12, r1: 1000, r2: 2000 }, expected: { vout: "8 V" } },
    { name: "5V, R1=R2=10k → Vout = 2.5V", inputs: { vin: 5, r1: 10000, r2: 10000 }, expected: { vout: "2.5 V" } },
  ],
};

/* ----------------- RC time constant ------------------------------- */
export const rcTimeConstant: CalculatorDefinition = {
  slug: "rc-time-constant",
  name: "RC Time Constant",
  description: "Compute the RC time constant τ = R × C and charge/discharge timing.",
  category: "engineering",
  keywords: ["rc", "time constant", "tau", "capacitor", "charge", "discharge", "circuit"],
  status: "live",
  part: 4,
  inputs: [
    { name: "r", label: "Resistance (R)", type: "number", default: 10000, min: 0, step: "any", unit: "Ω" },
    { name: "c", label: "Capacitance (C)", type: "number", default: 0.0001, min: 0, step: "any", unit: "F",
      help: "100µF = 0.0001 F, 1µF = 0.000001 F, 1nF = 1e-9 F, 1pF = 1e-12 F." },
  ],
  related: ["voltage-divider", "ohms-law", "battery-runtime"],
  calculate: (raw) => {
    const r = toNum(raw.r);
    const c = toNum(raw.c);
    const tau = r * c;
    if (tau === 0) {
      return { rows: [{ key: "tau", label: "Time constant τ", value: "—" }] };
    }
    // Time to reach various charge levels
    const t63 = tau;                  // 1τ → 63.2%
    const t86 = -tau * Math.log(1 - 0.863); // 2τ → 86.3%
    const t95 = -tau * Math.log(1 - 0.95);  // 3τ → 95%
    const t99 = -tau * Math.log(1 - 0.99);  // 5τ → 99%
    return {
      rows: [
        { key: "tau", label: "Time constant τ = R·C", value: formatTime(tau), emphasis: "primary" },
        { key: "t63", label: "Time to 63.2% (1τ)", value: formatTime(t63) },
        { key: "t86", label: "Time to 86.3% (2τ)", value: formatTime(t86) },
        { key: "t95", label: "Time to 95% (3τ)", value: formatTime(t95) },
        { key: "t99", label: "Time to 99% (5τ)", value: formatTime(t99), emphasis: "primary" },
      ],
      summary: "τ = R × C. After 1τ a capacitor charges to 63.2%; after 5τ it's considered fully charged (>99%). Discharge follows the inverse: 36.8% remains after 1τ.",
    };
  },
  tests: [
    { name: "10kΩ × 100µF = 1s", inputs: { r: 10000, c: 0.0001 }, expected: { tau: "1 s" } },
  ],
};

function formatTime(s: number): string {
  if (s < 1e-6) return `${fmt(s * 1e9, 4)} ns`;
  if (s < 1e-3) return `${fmt(s * 1e6, 4)} µs`;
  if (s < 1) return `${fmt(s * 1e3, 4)} ms`;
  if (s < 60) return `${fmt(s, 4)} s`;
  if (s < 3600) return `${fmt(s / 60, 4)} min`;
  return `${fmt(s / 3600, 4)} h`;
}

/* ------------------- Battery runtime ------------------------------ */
export const batteryRuntime: CalculatorDefinition = {
  slug: "battery-runtime",
  name: "Battery Capacity & Runtime",
  description: "Estimate how long a battery will last given its capacity and device current draw.",
  category: "engineering",
  keywords: ["battery", "runtime", "capacity", "mah", "ah", "discharge", "life"],
  status: "live",
  part: 4,
  inputs: [
    { name: "capacity", label: "Battery capacity", type: "number", default: 2000, min: 0, step: "any", unit: "mAh" },
    { name: "current", label: "Average current draw", type: "number", default: 200, min: 0.001, step: "any", unit: "mA" },
    { name: "efficiency", label: "Battery efficiency (depth-of-discharge factor)", type: "number", default: 80, min: 1, max: 100, step: "any", unit: "%",
      help: "Real-world usable capacity is less than rated. Li-ion ≈ 80-90%, lead-acid ≈ 50%." },
  ],
  related: ["rc-time-constant", "electrical-energy-consumption", "ohms-law"],
  calculate: (raw) => {
    const cap = toNum(raw.capacity);
    const cur = toNum(raw.current);
    const eff = toNum(raw.efficiency) / 100;
    if (cur === 0) return { rows: [{ key: "runtime", label: "Runtime", value: "—" }] };
    const hours = (cap * eff) / cur;
    return {
      rows: [
        { key: "runtime", label: "Estimated runtime", value: formatTime(hours * 3600), emphasis: "primary" },
        { key: "hours", label: "In hours", value: `${fmt(hours, 4)} h` },
      ],
      sections: [{
        title: "Battery summary",
        rows: [
          { key: "usable_cap", label: "Usable capacity", value: `${fmt(cap * eff, 0)} mAh (${fmt(cap * eff / 1000, 4)} Ah)` },
          { key: "energy", label: "Energy at 3.7V (Li-ion)", value: `${fmt(cap * eff * 3.7 / 1000, 4)} Wh` },
        ],
      }],
      summary: "Runtime = (capacity × efficiency) ÷ current draw. ESTIMATE — actual runtime varies with temperature, age, discharge rate (Peukert's law), and voltage cutoff.",
    };
  },
  tests: [
    { name: "2000mAh @ 200mA, 80% → 8h", inputs: { capacity: 2000, current: 200, efficiency: 80 }, expected: { hours: "8 h" } },
  ],
};

/* --------------------- Gear ratio --------------------------------- */
export const gearRatio: CalculatorDefinition = {
  slug: "gear-ratio",
  name: "Gear Ratio & Mechanical Power",
  description: "Compute gear ratio, output speed, and output torque for a 2-gear system.",
  category: "engineering",
  keywords: ["gear", "ratio", "torque", "speed", "rpm", "mechanical"],
  status: "live",
  part: 4,
  inputs: [
    { name: "teeth_in", label: "Teeth on driving gear", type: "number", default: 20, min: 1, step: 1 },
    { name: "teeth_out", label: "Teeth on driven gear", type: "number", default: 60, min: 1, step: 1 },
    { name: "rpm_in", label: "Input RPM", type: "number", default: 1800, min: 0, step: "any" },
    { name: "torque_in", label: "Input torque (N·m)", type: "number", default: 10, min: 0, step: "any" },
    { name: "efficiency", label: "Efficiency", type: "number", default: 95, min: 1, max: 100, step: "any", unit: "%" },
  ],
  related: ["ohms-law", "work-energy-power"],
  calculate: (raw) => {
    const tIn = toNum(raw.teeth_in);
    const tOut = toNum(raw.teeth_out);
    const rpmIn = toNum(raw.rpm_in);
    const torqueIn = toNum(raw.torque_in);
    const eff = toNum(raw.efficiency) / 100;
    const ratio = tOut / tIn; // output rotates slower if larger
    const rpmOut = rpmIn / ratio;
    const torqueOut = torqueIn * ratio * eff;
    const powerIn = (torqueIn * rpmIn * 2 * Math.PI) / 60;
    const powerOut = (torqueOut * rpmOut * 2 * Math.PI) / 60;
    return {
      rows: [
        { key: "ratio", label: "Gear ratio (driven / driver)", value: `${fmt(ratio, 4)} : 1`, emphasis: "primary" },
        { key: "rpm_out", label: "Output RPM", value: `${fmt(rpmOut, 2)}`, emphasis: "primary" },
        { key: "torque_out", label: "Output torque", value: `${fmt(torqueOut, 4)} N·m`, emphasis: "primary" },
      ],
      sections: [{
        title: "Power",
        rows: [
          { key: "power_in", label: "Input power", value: `${fmt(powerIn, 4)} W` },
          { key: "power_out", label: "Output power", value: `${fmt(powerOut, 4)} W` },
        ],
      }],
      summary: "Ratio = N_out / N_in. Speed reduction (large driven gear) increases torque; speed increase (small driven gear) decreases torque. Power = torque × ω (where ω = 2π × RPM / 60).",
    };
  },
  tests: [
    { name: "20T driver, 60T driven → 3:1 ratio", inputs: { teeth_in: 20, teeth_out: 60, rpm_in: 1800, torque_in: 10, efficiency: 100 }, expected: { ratio: "3 : 1" } },
    { name: "Same → output RPM = 600", inputs: { teeth_in: 20, teeth_out: 60, rpm_in: 1800, torque_in: 10, efficiency: 100 }, expected: { rpm_out: "600" } },
  ],
};

/* --------------------- LED series resistor ------------------------ */
export const ledResistor: CalculatorDefinition = {
  slug: "led-resistor",
  name: "LED Series Resistor",
  description: "Compute the current-limiting resistor needed for an LED from a given supply voltage.",
  category: "engineering",
  keywords: ["led", "resistor", "current limit", "diode", "electronics"],
  status: "live",
  part: 4,
  inputs: [
    { name: "vsupply", label: "Supply voltage", type: "number", default: 5, min: 0, step: "any", unit: "V" },
    { name: "vforward", label: "LED forward voltage (Vf)", type: "number", default: 2.1, min: 0, step: "any", unit: "V",
      help: "Red ≈ 1.8V, Yellow ≈ 2.0V, Green ≈ 2.1V, Blue/White ≈ 3.2V." },
    { name: "current", label: "Desired LED current", type: "number", default: 20, min: 0.1, step: "any", unit: "mA" },
  ],
  related: ["ohms-law", "resistor-color-code", "voltage-divider"],
  calculate: (raw) => {
    const vs = toNum(raw.vsupply);
    const vf = toNum(raw.vforward);
    const i = toNum(raw.current) / 1000; // mA → A
    if (vs <= vf) {
      return { rows: [{ key: "r", label: "Resistor", value: "—", hint: "Supply voltage must exceed LED forward voltage.", emphasis: "warning" }] };
    }
    if (i <= 0) {
      return { rows: [{ key: "r", label: "Resistor", value: "—" }] };
    }
    const r = (vs - vf) / i;
    const power = (vs - vf) * i;
    // Suggest nearest standard E12 value
    const standard = nearestE12(r);
    return {
      rows: [
        { key: "r", label: "Required resistor", value: `${fmt(r, 2)} Ω`, emphasis: "primary" },
        { key: "standard", label: "Nearest standard (E12)", value: `${fmt(standard, 2)} Ω`, emphasis: "primary" },
        { key: "power", label: "Power dissipated in resistor", value: `${fmt(power * 1000, 2)} mW` },
      ],
      sections: [{
        title: "With standard resistor",
        rows: [
          { key: "actual_current", label: "Actual current", value: `${fmt((vs - vf) / standard * 1000, 2)} mA` },
          { key: "power_rating", label: "Recommended resistor wattage", value: `${fmt(Math.max(0.125, power * 2), 3)} W (≥2× actual)` },
        ],
      }],
      summary: "R = (Vsupply − Vf) / I. Always use a resistor rated for at least 2× the calculated power dissipation for safety margin.",
    };
  },
  tests: [
    { name: "5V, Vf=2.1, 20mA → 145Ω", inputs: { vsupply: 5, vforward: 2.1, current: 20 }, expected: { r: "145 Ω" } },
  ],
};

function nearestE12(r: number): number {
  const e12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  if (r <= 0) return 0;
  const decade = Math.floor(Math.log10(r));
  const normalized = r / Math.pow(10, decade);
  let best = e12[0];
  let bestDiff = Math.abs(normalized - best);
  for (const v of e12) {
    const diff = Math.abs(normalized - v);
    if (diff < bestDiff) { best = v; bestDiff = diff; }
  }
  return best * Math.pow(10, decade);
}
