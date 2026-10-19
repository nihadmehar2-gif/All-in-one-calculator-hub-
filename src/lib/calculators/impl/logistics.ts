/**
 * Logistics and Shipping — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* --------------- Volumetric (DIM) weight --------------------------- */
export const volumetricWeight: CalculatorDefinition = {
  slug: "volumetric-weight",
  name: "Volumetric / Dimensional Weight",
  description: "Compute DIM weight for shipping using the standard courier divisor.",
  category: "logistics",
  keywords: ["volumetric", "dimensional", "dim", "shipping", "weight", "courier"],
  status: "live",
  part: 4,
  inputs: [
    { name: "length", label: "Length", type: "number", default: 50, min: 0, step: "any", unit: "cm" },
    { name: "width", label: "Width", type: "number", default: 40, min: 0, step: "any", unit: "cm" },
    { name: "height", label: "Height", type: "number", default: 30, min: 0, step: "any", unit: "cm" },
    { name: "actual_weight", label: "Actual weight", type: "number", default: 5, min: 0, step: "any", unit: "kg" },
    { name: "courier", label: "Courier / divisor", type: "select", default: "5000",
      options: [
        { label: "DHL/FedEx/UPS (5000 cm³/kg)", value: "5000" },
        { label: "USPS (166 in³/lb → ~6000 cm³/kg)", value: "6000" },
        { label: "Air freight (6000 cm³/kg)", value: "6000_air" },
        { label: "Standard freight (3000 cm³/kg)", value: "3000" },
      ] },
  ],
  related: ["package-volume", "trip-cost"],
  calculate: (raw) => {
    const l = toNum(raw.length);
    const w = toNum(raw.width);
    const h = toNum(raw.height);
    const actual = toNum(raw.actual_weight);
    const courier = Number(raw.courier ?? 5000);
    const volume = l * w * h;
    if (courier === 0) {
      return { rows: [{ key: "dim_weight", label: "DIM weight", value: "—" }] };
    }
    const dimWeight = volume / courier;
    const chargeable = Math.max(actual, dimWeight);
    const isDim = dimWeight > actual;
    return {
      rows: [
        { key: "volume", label: "Volume", value: `${fmt(volume, 0)} cm³`, emphasis: "primary" },
        { key: "dim_weight", label: "Volumetric (DIM) weight", value: `${fmt(dimWeight, 2)} kg`, emphasis: "primary" },
        { key: "actual", label: "Actual weight", value: `${fmt(actual, 2)} kg` },
        { key: "chargeable", label: "Chargeable weight", value: `${fmt(chargeable, 2)} kg`, emphasis: "primary", },
      ],
      summary: `Chargeable = max(actual, DIM weight). ${isDim ? "This package will be billed on DIM weight (it's light for its size)." : "Billed on actual weight."} DIM weight = L × W × H ÷ divisor.`,
    };
  },
  tests: [
    { name: "50×40×30cm, 5kg, 5000 divisor", inputs: { length: 50, width: 40, height: 30, actual_weight: 5, courier: "5000" }, expected: { dim_weight: "12 kg" } },
  ],
};

/* ------------------- Package volume ------------------------------- */
export const packageVolume: CalculatorDefinition = {
  slug: "package-volume",
  name: "Package Volume & Filling Efficiency",
  description: "Compute package volume and how many smaller items fit inside (bin packing, simple).",
  category: "logistics",
  keywords: ["package", "volume", "packing", "container", "box", "shipping"],
  status: "live",
  part: 4,
  inputs: [
    { name: "box_l", label: "Box length", type: "number", default: 60, min: 0, step: "any", unit: "cm" },
    { name: "box_w", label: "Box width", type: "number", default: 40, min: 0, step: "any", unit: "cm" },
    { name: "box_h", label: "Box height", type: "number", default: 40, min: 0, step: "any", unit: "cm" },
    { name: "item_l", label: "Item length", type: "number", default: 15, min: 0, step: "any", unit: "cm" },
    { name: "item_w", label: "Item width", type: "number", default: 10, min: 0, step: "any", unit: "cm" },
    { name: "item_h", label: "Item height", type: "number", default: 8, min: 0, step: "any", unit: "cm" },
  ],
  related: ["volumetric-weight", "trip-cost"],
  calculate: (raw) => {
    const bl = toNum(raw.box_l);
    const bw = toNum(raw.box_w);
    const bh = toNum(raw.box_h);
    const il = toNum(raw.item_l);
    const iw = toNum(raw.item_w);
    const ih = toNum(raw.item_h);
    if (il <= 0 || iw <= 0 || ih <= 0) {
      return { rows: [{ key: "volume", label: "Box volume", value: "—" }] };
    }
    const boxVolume = bl * bw * bh;
    const itemVolume = il * iw * ih;
    // Try all 6 axis rotations to find max packing
    const orientations = [
      [il, iw, ih], [il, ih, iw], [iw, il, ih],
      [iw, ih, il], [ih, il, iw], [ih, iw, il],
    ];
    let maxItems = 0;
    for (const [l, w, h] of orientations) {
      const n = Math.floor(bl / l) * Math.floor(bw / w) * Math.floor(bh / h);
      if (n > maxItems) maxItems = n;
    }
    const packingEff = (maxItems * itemVolume / boxVolume) * 100;
    return {
      rows: [
        { key: "box_volume", label: "Box volume", value: `${fmt(boxVolume, 0)} cm³ (${fmt(boxVolume / 1000, 2)} L)`, emphasis: "primary" },
        { key: "items", label: "Items per box", value: `${maxItems}`, emphasis: "primary" },
        { key: "packing_eff", label: "Packing efficiency", value: `${fmt(packingEff, 1)}%` },
        { key: "item_volume", label: "Item volume", value: `${fmt(itemVolume, 0)} cm³` },
      ],
      summary: "Uses simple axis-aligned bin packing (no rotation in mid-stack). Real packing often achieves lower efficiency due to fragile items, padding, and orientation constraints.",
    };
  },
  tests: [
    { name: "60×40×40cm box, 15×10×8cm items", inputs: { box_l: 60, box_w: 40, box_h: 40, item_l: 15, item_w: 10, item_h: 8 }, expected: { items: "80" } },
  ],
};
