/**
 * Advanced Logistics and Freight — additional calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ------------------- Container packing ----------------------------- */
export const containerPacking: CalculatorDefinition = {
  slug: "container-packing",
  name: "Container Packing Estimator",
  description: "Estimate how many cartons fit a standard shipping container by volume.",
  category: "logistics",
  keywords: ["container", "shipping", "packing", "freight", "carton"],
  status: "live",
  part: 5,
  inputs: [
    { name: "container", label: "Container type", type: "select", default: "20ft",
      options: [
        { label: "20 ft standard (~33 m³)", value: "20ft" },
        { label: "40 ft standard (~67 m³)", value: "40ft" },
        { label: "40 ft High Cube (~76 m³)", value: "40hc" },
      ] },
    { name: "carton_l", label: "Carton length (cm)", type: "number", default: 50, min: 1, step: "any" },
    { name: "carton_w", label: "Carton width (cm)", type: "number", default: 40, min: 1, step: "any" },
    { name: "carton_h", label: "Carton height (cm)", type: "number", default: 30, min: 1, step: "any" },
    { name: "max_weight", label: "Max carton weight (kg)", type: "number", default: 20, min: 0.1, step: "any" },
  ],
  related: ["volumetric-weight", "package-volume", "trip-cost"],
  calculate: (raw) => {
    const cType = String(raw.container ?? "20ft");
    const cl = toNum(raw.carton_l) / 100;
    const cw = toNum(raw.carton_w) / 100;
    const ch = toNum(raw.carton_h) / 100;
    const maxW = toNum(raw.max_weight);
    // Internal dimensions (m)
    const dims: Record<string, { l: number; w: number; h: number; maxPayloadKg: number }> = {
      "20ft": { l: 5.898, w: 2.352, h: 2.393, maxPayloadKg: 28000 },
      "40ft": { l: 12.032, w: 2.352, h: 2.393, maxPayloadKg: 30000 },
      "40hc": { l: 12.032, w: 2.352, h: 2.698, maxPayloadKg: 30000 },
    };
    const d = dims[cType] ?? dims["20ft"];
    if (cl <= 0 || cw <= 0 || ch <= 0) {
      return { rows: [{ key: "cartons", label: "Cartons per container", value: "—" }] };
    }
    // Try all 6 axis orientations
    const orientations = [
      [cl, cw, ch], [cl, ch, cw], [cw, cl, ch],
      [cw, ch, cl], [ch, cl, cw], [ch, cw, cl],
    ];
    let maxCartons = 0;
    let bestOrientation = "";
    for (const [l, w, h] of orientations) {
      const n = Math.floor(d.l / l) * Math.floor(d.w / w) * Math.floor(d.h / h);
      if (n > maxCartons) {
        maxCartons = n;
        bestOrientation = `${(l * 100).toFixed(0)}×${(w * 100).toFixed(0)}×${(h * 100).toFixed(0)} cm`;
      }
    }
    const cartonVol = cl * cw * ch;
    const totalVol = maxCartons * cartonVol;
    const containerVol = d.l * d.w * d.h;
    const volEff = (totalVol / containerVol) * 100;
    const totalWeight = maxCartons * maxW;
    const weightLimited = totalWeight > d.maxPayloadKg;
    const weightLimitedCartons = Math.floor(d.maxPayloadKg / maxW);
    const finalCartons = weightLimited ? weightLimitedCartons : maxCartons;
    return {
      rows: [
        { key: "cartons", label: "Cartons per container (volume-limited)", value: String(maxCartons), emphasis: "primary" },
        { key: "final", label: `Final (considering weight limit ${d.maxPayloadKg} kg)`, value: String(finalCartons), emphasis: "primary" },
        { key: "vol_eff", label: "Volume utilization", value: `${fmt(volEff, 1)}%` },
        { key: "total_weight", label: "Total weight at max cartons", value: `${fmt(totalWeight, 0)} kg` },
      ],
      sections: [{
        title: "Container details",
        rows: [
          { key: "type", label: "Container", value: cType },
          { key: "internal", label: "Internal dimensions", value: `${d.l} × ${d.w} × ${d.h} m` },
          { key: "volume", label: "Internal volume", value: `${fmt(containerVol, 2)} m³` },
          { key: "max_payload", label: "Max payload", value: `${d.maxPayloadKg.toLocaleString()} kg` },
          { key: "best_orientation", label: "Best carton orientation", value: bestOrientation },
        ],
      }],
      summary: "Volume-limited estimate using axis-aligned packing. Real-world packing achieves 70-85% volume efficiency due to carton fragility, pallets, and loading constraints.",
    };
  },
  tests: [
    { name: "20ft container, 50×40×30 cm cartons, 20kg each", inputs: { container: "20ft", carton_l: 50, carton_w: 40, carton_h: 30, max_weight: 20 }, expected: { cartons: "392" } },
  ],
};

/* ------------------- ETA calculator -------------------------------- */
export const etaCalculator: CalculatorDefinition = {
  slug: "eta-calculator",
  name: "ETA & Travel Time Calculator",
  description: "Compute arrival time from distance, speed, and rest stops.",
  category: "logistics",
  keywords: ["eta", "arrival", "travel time", "trip", "delivery"],
  status: "live",
  part: 5,
  inputs: [
    { name: "distance", label: "Distance", type: "number", default: 600, min: 0, step: "any", unit: "km" },
    { name: "speed", label: "Average speed", type: "number", default: 80, min: 1, step: "any", unit: "km/h" },
    { name: "rest_every_hours", label: "Rest stop every", type: "number", default: 2, min: 0.5, step: "any", unit: "h" },
    { name: "rest_min", label: "Rest stop duration", type: "number", default: 15, min: 0, step: "any", unit: "min" },
    { name: "start_time", label: "Start time (HH:MM, 24h)", type: "text", default: "08:00",
      placeholder: "HH:MM" },
  ],
  related: ["trip-cost", "volumetric-weight", "fuel-economy"],
  calculate: (raw) => {
    const d = toNum(raw.distance);
    const speed = toNum(raw.speed);
    const restEvery = toNum(raw.rest_every_hours);
    const restMin = toNum(raw.rest_min);
    const startStr = String(raw.start_time ?? "");
    if (speed <= 0) {
      return { rows: [{ key: "eta", label: "ETA", value: "—" }] };
    }
    const driveHours = d / speed;
    const stops = restEvery > 0 ? Math.floor(driveHours / restEvery) : 0;
    const totalRestMin = stops * restMin;
    const totalMin = driveHours * 60 + totalRestMin;
    const m = startStr.match(/^(\d{1,2}):(\d{2})$/);
    let etaStr = "—";
    if (m) {
      const sh = Number(m[1]);
      const sm = Number(m[2]);
      if (sh <= 23 && sm <= 59) {
        const startMin = sh * 60 + sm;
        const etaMin = (startMin + totalMin) % (24 * 60);
        const eh = Math.floor(etaMin / 60);
        const em = Math.round(etaMin % 60);
        etaStr = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
      }
    }
    const h = Math.floor(totalMin / 60);
    const mm = Math.round(totalMin % 60);
    return {
      rows: [
        { key: "eta", label: "Estimated arrival", value: etaStr, emphasis: "primary" },
        { key: "total_time", label: "Total trip time (incl. rest)", value: `${h}h ${mm}m`, emphasis: "primary" },
        { key: "drive_time", label: "Driving time only", value: `${fmt(driveHours, 2)} h` },
        { key: "stops", label: "Rest stops", value: String(stops) },
      ],
      summary: "Total time = driving time + rest stops. Professional drivers are typically required to rest 30 min every 4.5 hours (EU) or similar rules elsewhere. Always check local regulations.",
    };
  },
  tests: [
    { name: "600km @ 80km/h, rest every 2h × 15min, start 08:00", inputs: { distance: 600, speed: 80, rest_every_hours: 2, rest_min: 15, start_time: "08:00" }, expected: { total_time: "8h 15m" } },
  ],
};

/* ------------------- Freight class (NMFC-style) -------------------- */
export const freightClass: CalculatorDefinition = {
  slug: "freight-class",
  name: "Freight Class Estimator (PCF)",
  description: "Estimate US NMFC freight class from density (pounds per cubic foot).",
  category: "logistics",
  keywords: ["freight", "class", "nmfc", "density", "pcf", "ltl"],
  status: "live",
  part: 5,
  inputs: [
    { name: "weight_lb", label: "Total weight (lb)", type: "number", default: 500, min: 0.001, step: "any", unit: "lb" },
    { name: "length_in", label: "Length (in)", type: "number", default: 48, min: 0.1, step: "any" },
    { name: "width_in", label: "Width (in)", type: "number", default: 40, min: 0.1, step: "any" },
    { name: "height_in", label: "Height (in)", type: "number", default: 36, min: 0.1, step: "any" },
  ],
  related: ["volumetric-weight", "container-packing", "eta-calculator"],
  calculate: (raw) => {
    const w = toNum(raw.weight_lb);
    const l = toNum(raw.length_in);
    const wd = toNum(raw.width_in);
    const h = toNum(raw.height_in);
    if (l <= 0 || wd <= 0 || h <= 0) {
      return { rows: [{ key: "class", label: "Freight class", value: "—" }] };
    }
    const cubicFt = (l * wd * h) / 1728;
    const pcf = w / cubicFt;
    // NMFC class based on density
    let freightClass: string;
    if (pcf >= 50) freightClass = "50";
    else if (pcf >= 35) freightClass = "55";
    else if (pcf >= 30) freightClass = "60";
    else if (pcf >= 22.5) freightClass = "65";
    else if (pcf >= 15) freightClass = "70";
    else if (pcf >= 13.5) freightClass = "77.5";
    else if (pcf >= 12) freightClass = "85";
    else if (pcf >= 10.5) freightClass = "92.5";
    else if (pcf >= 9) freightClass = "100";
    else if (pcf >= 8) freightClass = "110";
    else if (pcf >= 7) freightClass = "125";
    else if (pcf >= 6) freightClass = "150";
    else if (pcf >= 5) freightClass = "175";
    else if (pcf >= 4) freightClass = "200";
    else if (pcf >= 3) freightClass = "250";
    else if (pcf >= 2) freightClass = "300";
    else if (pcf >= 1) freightClass = "400";
    else freightClass = "500";
    return {
      rows: [
        { key: "class", label: "Estimated freight class", value: freightClass, emphasis: "primary" },
        { key: "pcf", label: "Density (PCF)", value: `${fmt(pcf, 2)} lb/ft³`, emphasis: "primary" },
        { key: "cubic_ft", label: "Cubic feet", value: `${fmt(cubicFt, 2)} ft³` },
      ],
      sections: [{
        title: "NMFC class reference",
        rows: [
          { key: "class50", label: "Class 50 (≥50 PCF)", value: "Lowest cost — heavy, dense items" },
          { key: "class85", label: "Class 85 (12+ PCF)", value: "Machinery, building materials" },
          { key: "class125", label: "Class 125 (7+ PCF)", value: "Appliances, furniture" },
          { key: "class500", label: "Class 500 (<1 PCF)", value: "Highest cost — gold dust, ping-pong balls" },
        ],
      }],
      summary: "Freight class is determined by density, stowability, handling and liability (NMFC standard). Lower class = denser = cheaper per pound. ESTIMATE — actual class may differ based on other factors.",
    };
  },
  tests: [
    { name: "500 lb, 48×40×36 in → ~12.5 PCF → class 85", inputs: { weight_lb: 500, length_in: 48, width_in: 40, height_in: 36 }, expected: { class: "85" } },
  ],
};
