/**
 * Construction and Home Improvement — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* ----------------- Concrete volume + materials -------------------- */
export const concreteVolume: CalculatorDefinition = {
  slug: "concrete-volume",
  name: "Concrete Volume & Mix Materials",
  description: "Volume of concrete for a slab/footing plus cement, sand, aggregate and water for a chosen mix.",
  category: "construction",
  keywords: ["concrete", "cement", "sand", "aggregate", "slab", "mix", "bag"],
  status: "live",
  part: 4,
  inputs: [
    { name: "length", label: "Length", type: "number", default: 5, min: 0, step: "any", unit: "m" },
    { name: "width", label: "Width", type: "number", default: 3, min: 0, step: "any", unit: "m" },
    { name: "depth", label: "Depth / thickness", type: "number", default: 0.15, min: 0, step: "any", unit: "m" },
    { name: "mix", label: "Mix ratio (cement:sand:aggregate)", type: "select", default: "1:2:4",
      options: [
        { label: "1:1.5:3 (strong — structural columns)", value: "1:1.5:3" },
        { label: "1:2:4 (standard — slabs, beams)", value: "1:2:4" },
        { label: "1:3:6 (foundations, mass concrete)", value: "1:3:6" },
        { label: "1:4:8 (lean — PCC, blinding)", value: "1:4:8" },
      ] },
    { name: "wastage", label: "Wastage allowance", type: "number", default: 5, min: 0, max: 30, step: "any", unit: "%" },
  ],
  related: ["wall-area-room", "brick-mortar", "lumber-sheet"],
  calculate: (raw) => {
    const l = toNum(raw.length);
    const w = toNum(raw.width);
    const d = toNum(raw.depth);
    const mixStr = String(raw.mix ?? "1:2:4");
    const wastage = toNum(raw.wastage) / 100;
    const volume = l * w * d;
    if (volume <= 0) {
      return { rows: [{ key: "volume", label: "Concrete volume", value: "—" }] };
    }
    const volumeWithWaste = volume * (1 + wastage);
    // Dry volume is typically 1.54× wet volume (voids + shrinkage)
    const dryVolume = volumeWithWaste * 1.54;
    const parts = mixStr.split(":").map(Number);
    const totalParts = parts.reduce((a, b) => a + b, 0);
    const cementPart = parts[0], sandPart = parts[1], aggPart = parts[2];
    // Cement: 1 bag = 50 kg, density 1440 kg/m³ → 0.0347 m³/bag
    const cementVol = dryVolume * (cementPart / totalParts);
    const cementKg = cementVol * 1440;
    const cementBags = cementKg / 50;
    const sandVol = dryVolume * (sandPart / totalParts);
    const aggVol = dryVolume * (aggPart / totalParts);
    // Water-cement ratio ≈ 0.5
    const waterLiters = cementKg * 0.5;
    return {
      rows: [
        { key: "volume", label: "Wet concrete volume", value: `${fmt(volume, 4)} m³`, emphasis: "primary" },
        { key: "volume_waste", label: `Volume + ${wastage * 100}% wastage`, value: `${fmt(volumeWithWaste, 4)} m³` },
        { key: "cement_bags", label: `Cement (50kg bags, ${mixStr})`, value: `${fmt(cementBags, 2)} bags`, emphasis: "primary" },
        { key: "sand", label: "Sand volume", value: `${fmt(sandVol, 4)} m³` },
        { key: "aggregate", label: "Aggregate volume", value: `${fmt(aggVol, 4)} m³` },
        { key: "water", label: "Water (W/C ratio 0.5)", value: `${fmt(waterLiters, 0)} liters` },
      ],
      sections: [{
        title: "Conversion",
        rows: [
          { key: "cubic_yards", label: "In cubic yards", value: `${fmt(volumeWithWaste * 1.30795, 4)} yd³` },
          { key: "cubic_ft", label: "In cubic feet", value: `${fmt(volumeWithWaste * 35.3147, 2)} ft³` },
        ],
      }],
      summary: "Dry volume ≈ 1.54 × wet volume (accounts for voids in sand/aggregate). Materials per mix ratio. ESTIMATE — actual mix design varies with aggregate gradation, moisture, and strength requirements. Consult a structural engineer for load-bearing applications.",
    };
  },
  tests: [
    { name: "5×3×0.15m slab @ 1:2:4", inputs: { length: 5, width: 3, depth: 0.15, mix: "1:2:4", wastage: 5 }, expected: { volume: "2.25 m³" } },
  ],
};

/* ------------------ Brick / block / mortar ------------------------ */
export const brickMortar: CalculatorDefinition = {
  slug: "brick-mortar",
  name: "Brick & Block Estimator",
  description: "Estimate brick count and mortar volume for a wall.",
  category: "construction",
  keywords: ["brick", "block", "mortar", "wall", "masonry"],
  status: "live",
  part: 4,
  inputs: [
    { name: "wall_length", label: "Wall length", type: "number", default: 5, min: 0, step: "any", unit: "m" },
    { name: "wall_height", label: "Wall height", type: "number", default: 3, min: 0, step: "any", unit: "m" },
    { name: "brick_type", label: "Brick type", type: "select", default: "standard",
      options: [
        { label: "Standard modular (190×90×90 mm)", value: "standard" },
        { label: "Imperial (215×102.5×65 mm)", value: "imperial" },
        { label: "Concrete block (400×200×200 mm)", value: "block" },
      ] },
    { name: "wall_thickness", label: "Wall thickness (bricks)", type: "select", default: "1",
      options: [{ label: "Half brick (1)", value: "1" }, { label: "One brick (2)", value: "2" }, { label: "1.5 brick (3)", value: "3" }] },
    { name: "mortar_thickness", label: "Mortar joint thickness", type: "number", default: 10, min: 0, step: "any", unit: "mm" },
    { name: "wastage", label: "Wastage allowance", type: "number", default: 5, min: 0, max: 30, step: "any", unit: "%" },
  ],
  related: ["concrete-volume", "wall-area-room", "paint-coverage"],
  calculate: (raw) => {
    const wl = toNum(raw.wall_length);
    const wh = toNum(raw.wall_height);
    const brickType = String(raw.brick_type ?? "standard");
    const thickness = Number(raw.wall_thickness ?? 1);
    const mortar = toNum(raw.mortar_thickness) / 1000; // mm to m
    const wastage = toNum(raw.wastage) / 100;
    const wallArea = wl * wh;
    if (wallArea <= 0) {
      return { rows: [{ key: "bricks", label: "Bricks needed", value: "—" }] };
    }
    // Brick dimensions (m)
    const dims: Record<string, { w: number; h: number }> = {
      standard: { w: 0.190, h: 0.090 },
      imperial: { w: 0.215, h: 0.065 },
      block: { w: 0.400, h: 0.200 },
    };
    const d = dims[brickType] ?? dims.standard;
    // Effective brick face including mortar joint
    const effW = d.w + mortar;
    const effH = d.h + mortar;
    const bricksPerM2 = 1 / (effW * effH);
    const totalBricks = bricksPerM2 * wallArea * thickness * (1 + wastage);
    // Mortar: typically 30% of brick volume for half-brick walls
    const brickVolume = d.w * d.h * (brickType === "block" ? 0.200 : 0.090); // assume depth
    const wallVolume = wallArea * (thickness * (d.w + mortar));
    const mortarVolume = Math.max(0, wallVolume - totalBricks / (1 + wastage) * brickVolume);
    return {
      rows: [
        { key: "bricks", label: `${brickType === "block" ? "Blocks" : "Bricks"} needed`, value: `${fmt(totalBricks, 0)}`, emphasis: "primary" },
        { key: "bricks_per_m2", label: "Per m² of wall", value: `${fmt(bricksPerM2 * thickness, 1)}` },
        { key: "wall_area", label: "Wall area", value: `${fmt(wallArea, 2)} m²` },
        { key: "mortar", label: "Mortar volume needed", value: `${fmt(mortarVolume, 3)} m³`, emphasis: "primary" },
      ],
      sections: [{
        title: "Materials for mortar",
        rows: [
          { key: "cement", label: "Cement (1:4 mix, ~50kg bags)", value: `${fmt(mortarVolume * 350 / 50, 2)} bags` },
          { key: "sand", label: "Sand (1:4 mix)", value: `${fmt(mortarVolume * 4 * 0.35, 3)} m³` },
        ],
      }],
      summary: `Bricks = wall area ÷ effective brick face area × thickness × wastage. Assumes ${brickType} brick with ${fmt(toNum(raw.mortar_thickness), 0)}mm mortar joints. ESTIMATE — openings, bond pattern, and cutting losses will alter counts.`,
    };
  },
  tests: [
    { name: "5m × 3m wall, standard brick, half-brick thick", inputs: { wall_length: 5, wall_height: 3, brick_type: "standard", wall_thickness: "1", mortar_thickness: 10, wastage: 5 }, expected: { wall_area: "15 m²" } },
  ],
};

/* --------------------- Paint coverage ----------------------------- */
export const paintCoverage: CalculatorDefinition = {
  slug: "paint-coverage",
  name: "Paint Coverage Estimator",
  description: "Estimate paint quantity for walls including multiple coats.",
  category: "construction",
  keywords: ["paint", "coverage", "wall", "room", "gallon", "liter"],
  status: "live",
  part: 4,
  inputs: [
    { name: "wall_area", label: "Total wall area", type: "number", default: 50, min: 0, step: "any", unit: "m²" },
    { name: "coats", label: "Number of coats", type: "number", default: 2, min: 1, max: 5, step: 1 },
    { name: "coverage", label: "Paint coverage", type: "number", default: 10, min: 1, step: "any", unit: "m²/L",
      help: "Typical coverage: 10-12 m²/L for smooth walls, less for textured surfaces." },
    { name: "wastage", label: "Wastage allowance", type: "number", default: 10, min: 0, max: 50, step: "any", unit: "%" },
  ],
  related: ["wall-area-room", "brick-mortar", "flooring-tile"],
  calculate: (raw) => {
    const area = toNum(raw.wall_area);
    const coats = toNum(raw.coats);
    const coverage = toNum(raw.coverage);
    const wastage = toNum(raw.wastage) / 100;
    if (coverage <= 0) {
      return { rows: [{ key: "liters", label: "Paint needed", value: "—" }] };
    }
    const effectiveArea = area * coats * (1 + wastage);
    const liters = effectiveArea / coverage;
    const gallonsUS = liters / 3.785;
    return {
      rows: [
        { key: "liters", label: "Paint needed", value: `${fmt(liters, 2)} liters`, emphasis: "primary" },
        { key: "gallons", label: "In US gallons", value: `${fmt(gallonsUS, 2)} gal`, emphasis: "primary" },
        { key: "cans", label: "5L cans to buy", value: `${Math.ceil(liters / 5)}` },
      ],
      sections: [{
        title: "Coverage breakdown",
        rows: [
          { key: "area", label: "Wall area", value: `${fmt(area, 2)} m²` },
          { key: "coats_area", label: `Area × ${coats} coats`, value: `${fmt(area * coats, 2)} m²` },
          { key: "with_waste", label: `With ${wastage * 100}% wastage`, value: `${fmt(effectiveArea, 2)} m²` },
        ],
      }],
      summary: "Paint needed = (wall area × coats × (1 + wastage)) ÷ coverage rate. Rough surfaces, dark colors over light, and porous primers all reduce coverage. Always round up to whole cans.",
    };
  },
  tests: [
    { name: "50m² × 2 coats @ 10 m²/L + 10% waste → 11L", inputs: { wall_area: 50, coats: 2, coverage: 10, wastage: 10 }, expected: { liters: "11 liters" } },
  ],
};

/* ------------------ Flooring / tile / grout ----------------------- */
export const flooringTile: CalculatorDefinition = {
  slug: "flooring-tile",
  name: "Flooring & Tile Estimator",
  description: "Compute tile/wood flooring quantity and grout needed for a room.",
  category: "construction",
  keywords: ["flooring", "tile", "grout", "wood", "laminate", "floor"],
  status: "live",
  part: 4,
  inputs: [
    { name: "room_length", label: "Room length", type: "number", default: 5, min: 0, step: "any", unit: "m" },
    { name: "room_width", label: "Room width", type: "number", default: 4, min: 0, step: "any", unit: "m" },
    { name: "tile_length", label: "Tile length", type: "number", default: 0.6, min: 0, step: "any", unit: "m" },
    { name: "tile_width", label: "Tile width", type: "number", default: 0.6, min: 0, step: "any", unit: "m" },
    { name: "grout_gap", label: "Grout gap", type: "number", default: 3, min: 0, step: "any", unit: "mm" },
    { name: "wastage", label: "Wastage allowance", type: "number", default: 10, min: 0, max: 50, step: "any", unit: "%" },
  ],
  related: ["paint-coverage", "wall-area-room", "concrete-volume"],
  calculate: (raw) => {
    const rl = toNum(raw.room_length);
    const rw = toNum(raw.room_width);
    const tl = toNum(raw.tile_length);
    const tw = toNum(raw.tile_width);
    const gap = toNum(raw.grout_gap) / 1000;
    const wastage = toNum(raw.wastage) / 100;
    const roomArea = rl * rw;
    const tileEffArea = (tl + gap) * (tw + gap);
    if (roomArea <= 0 || tileEffArea <= 0) {
      return { rows: [{ key: "tiles", label: "Tiles needed", value: "—" }] };
    }
    const baseTiles = roomArea / tileEffArea;
    const totalTiles = Math.ceil(baseTiles * (1 + wastage));
    // Grout: gap volume / grout-yield approx; use ~1.5 kg/m² per mm of gap
    const groutKg = roomArea * (gap * 1000) * 0.0005 * 1000; // rough
    return {
      rows: [
        { key: "tiles", label: "Tiles needed", value: `${totalTiles}`, emphasis: "primary" },
        { key: "tiles_per_m2", label: "Tiles per m²", value: `${fmt(1 / tileEffArea, 2)}` },
        { key: "room_area", label: "Floor area", value: `${fmt(roomArea, 2)} m²` },
        { key: "grout", label: "Grout needed (approx)", value: `${fmt(Math.max(0.5, groutKg), 2)} kg`, emphasis: "primary" },
      ],
      sections: [{
        title: "Other flooring options",
        rows: [
          { key: "laminate", label: "Laminate (packs of 2 m²)", value: `${Math.ceil(roomArea * (1 + wastage) / 2)}` },
          { key: "vinyl", label: "Vinyl sheet (linear m of 2m-wide)", value: `${fmt(roomArea * (1 + wastage) / 2, 2)} m` },
        ],
      }],
      summary: "Tiles = room area ÷ effective tile area (including grout gap). Wastage of 10-15% is standard for cuts and breakage.",
    };
  },
  tests: [
    { name: "5×4m room, 600×600mm tiles, 10% waste", inputs: { room_length: 5, room_width: 4, tile_length: 0.6, tile_width: 0.6, grout_gap: 3, wastage: 10 }, expected: { room_area: "20 m²" } },
  ],
};

/* --------------- Wall area / room area / perimeter ---------------- */
export const wallAreaRoom: CalculatorDefinition = {
  slug: "wall-area-room",
  name: "Room Area, Perimeter & Wall Surface",
  description: "Compute floor area, perimeter and total wall surface area for a rectangular room.",
  category: "construction",
  keywords: ["room", "wall area", "floor area", "perimeter", "surface area"],
  status: "live",
  part: 4,
  inputs: [
    { name: "length", label: "Room length", type: "number", default: 6, min: 0, step: "any", unit: "m" },
    { name: "width", label: "Room width", type: "number", default: 4, min: 0, step: "any", unit: "m" },
    { name: "height", label: "Ceiling height", type: "number", default: 2.7, min: 0, step: "any", unit: "m" },
    { name: "openings", label: "Door + window area (to subtract)", type: "number", default: 5, min: 0, step: "any", unit: "m²" },
  ],
  related: ["paint-coverage", "flooring-tile", "concrete-volume"],
  calculate: (raw) => {
    const l = toNum(raw.length);
    const w = toNum(raw.width);
    const h = toNum(raw.height);
    const openings = toNum(raw.openings);
    const floorArea = l * w;
    const perimeter = 2 * (l + w);
    const grossWallArea = perimeter * h;
    const ceilingArea = floorArea;
    const paintableWallArea = Math.max(0, grossWallArea - openings);
    const totalSurfaceArea = grossWallArea + ceilingArea;
    return {
      rows: [
        { key: "floor_area", label: "Floor area", value: `${fmt(floorArea, 2)} m²`, emphasis: "primary" },
        { key: "perimeter", label: "Perimeter", value: `${fmt(perimeter, 2)} m`, emphasis: "primary" },
        { key: "wall_gross", label: "Gross wall area", value: `${fmt(grossWallArea, 2)} m²` },
        { key: "wall_paintable", label: "Paintable wall area (minus openings)", value: `${fmt(paintableWallArea, 2)} m²`, emphasis: "primary" },
        { key: "ceiling", label: "Ceiling area", value: `${fmt(ceilingArea, 2)} m²` },
        { key: "total", label: "Total surface (walls + ceiling)", value: `${fmt(totalSurfaceArea, 2)} m²` },
      ],
      summary: "Rectangular room assumed. Floor area = L × W. Perimeter = 2(L+W). Gross walls = perimeter × height. Subtract doors and windows for paintable area.",
    };
  },
  tests: [
    { name: "6×4×2.7m room, 5m² openings", inputs: { length: 6, width: 4, height: 2.7, openings: 5 }, expected: { floor_area: "24 m²" } },
    { name: "Same → paintable walls 49 m²", inputs: { length: 6, width: 4, height: 2.7, openings: 5 }, expected: { wall_paintable: "49 m²" } },
  ],
};

/* -------------------- Roofing & slope ----------------------------- */
export const roofingSlope: CalculatorDefinition = {
  slug: "roofing-slope",
  name: "Roof Area & Slope Calculator",
  description: "Compute roof surface area from footprint and pitch (slope).",
  category: "construction",
  keywords: ["roof", "slope", "pitch", "shingle", "area"],
  status: "live",
  part: 4,
  inputs: [
    { name: "footprint_length", label: "Building length", type: "number", default: 12, min: 0, step: "any", unit: "m" },
    { name: "footprint_width", label: "Building width", type: "number", default: 8, min: 0, step: "any", unit: "m" },
    { name: "pitch", label: "Roof pitch (rise:run)", type: "select", default: "4:12",
      options: ["1:12", "2:12", "3:12", "4:12", "5:12", "6:12", "7:12", "8:12", "9:12", "10:12", "12:12"].map((p) => ({ label: p, value: p })) },
    { name: "type", label: "Roof type", type: "select", default: "gable",
      options: [
        { label: "Gable (2 slopes)", value: "gable" },
        { label: "Hip (4 slopes)", value: "hip" },
      ] },
  ],
  related: ["wall-area-room", "concrete-volume", "paint-coverage"],
  calculate: (raw) => {
    const l = toNum(raw.footprint_length);
    const w = toNum(raw.footprint_width);
    const pitchStr = String(raw.pitch ?? "4:12");
    const type = String(raw.type ?? "gable");
    const [riseStr, runStr] = pitchStr.split(":");
    const rise = Number(riseStr);
    const run = Number(runStr);
    // Slope multiplier = sqrt(1 + (rise/run)²)
    const slopeMult = Math.sqrt(1 + (rise / run) ** 2);
    const footprintArea = l * w;
    let roofArea: number;
    if (type === "gable") {
      roofArea = footprintArea * slopeMult;
    } else {
      // Hip roof approximated: 4 equal triangular sides → similar to gable but ~1.1× for the hip factor
      roofArea = footprintArea * slopeMult * 1.1;
    }
    // Shingle bundles: typically 3 bundles per "square" (100 sq ft = 9.29 m²)
    const squares = roofArea / 9.29;
    const bundles = Math.ceil(squares * 3);
    return {
      rows: [
        { key: "footprint", label: "Footprint area", value: `${fmt(footprintArea, 2)} m²` },
        { key: "slope_mult", label: "Slope multiplier", value: `${fmt(slopeMult, 4)}×` },
        { key: "roof_area", label: "Roof surface area", value: `${fmt(roofArea, 2)} m²`, emphasis: "primary" },
        { key: "bundles", label: "Shingle bundles (3 per square)", value: `${bundles}`, emphasis: "primary" },
      ],
      sections: [{
        title: "Other materials",
        rows: [
          { key: "underlayment", label: "Underlayment (15 lb roll, ~40 m²)", value: `${Math.ceil(roofArea / 40)} rolls` },
          { key: "drip_edge", label: "Drip edge (linear m)", value: `${fmt(2 * (l + w) + 2 * l, 1)} m` },
        ],
      }],
      summary: "Pitch rise:run means inches of rise per 12 inches of run. Slope multiplier = √(1 + (rise/run)²). Hip roofs add ~10% for the hip factor.",
    };
  },
  tests: [
    { name: "12×8m, 4:12 gable → footprint 96m²", inputs: { footprint_length: 12, footprint_width: 8, pitch: "4:12", type: "gable" }, expected: { footprint: "96 m²" } },
  ],
};

/* -------------------- Lumber / sheet ------------------------------ */
export const lumberSheet: CalculatorDefinition = {
  slug: "lumber-sheet",
  name: "Lumber & Sheet Material Estimator",
  description: "Estimate board feet, sheet count and cost for framing or panelling.",
  category: "construction",
  keywords: ["lumber", "board feet", "plywood", "sheet", "wood", "framing"],
  status: "live",
  part: 4,
  inputs: [
    { name: "mode", label: "Mode", type: "select", default: "sheet",
      options: [
        { label: "Sheet materials (plywood, drywall)", value: "sheet" },
        { label: "Lumber board feet", value: "lumber" },
      ] },
    { name: "area", label: "Area to cover (m²) — sheet mode", type: "number", default: 50, min: 0, step: "any", unit: "m²" },
    { name: "sheet_w", label: "Sheet width (m)", type: "number", default: 1.22, min: 0, step: "any" },
    { name: "sheet_h", label: "Sheet length (m)", type: "number", default: 2.44, min: 0, step: "any" },
    { name: "wastage", label: "Wastage", type: "number", default: 10, min: 0, max: 50, step: "any", unit: "%" },
    { name: "lum_length", label: "Lumber length (m) — lumber mode", type: "number", default: 2.4, min: 0, step: "any" },
    { name: "lum_width", label: "Lumber width (mm)", type: "number", default: 50, min: 0, step: "any" },
    { name: "lum_thickness", label: "Lumber thickness (mm)", type: "number", default: 100, min: 0, step: "any" },
    { name: "lum_count", label: "Number of boards", type: "number", default: 10, min: 0, step: 1 },
  ],
  related: ["concrete-volume", "wall-area-room", "brick-mortar"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "sheet");
    const wastage = toNum(raw.wastage) / 100;
    if (mode === "sheet") {
      const area = toNum(raw.area);
      const sw = toNum(raw.sheet_w);
      const sl = toNum(raw.sheet_h);
      const sheetArea = sw * sl;
      if (sheetArea <= 0) return { rows: [{ key: "sheets", label: "Sheets needed", value: "—" }] };
      const sheets = Math.ceil((area * (1 + wastage)) / sheetArea);
      return {
        rows: [
          { key: "sheets", label: "Sheets needed", value: `${sheets}`, emphasis: "primary" },
          { key: "sheet_area", label: "Sheet area", value: `${fmt(sheetArea, 2)} m² (standard 4×8 ft = 2.44×1.22 m)` },
        ],
        summary: `Sheets = ceil(area × (1 + wastage) ÷ sheet area). Standard plywood/drywall sheets are 4×8 ft (1.22 × 2.44 m).`,
      };
    }
    // lumber
    const L = toNum(raw.lum_length);
    const W = toNum(raw.lum_width) / 1000;
    const T = toNum(raw.lum_thickness) / 1000;
    const count = toNum(raw.lum_count);
    // Board feet = (T × W × L) / 144 × 12 with T,W in inches... but we'll use metric: 1 board foot = 144 in³ = 0.00236 m³
    const volumeM3 = L * W * T * count;
    const boardFeet = volumeM3 / 0.002359737;
    return {
      rows: [
        { key: "board_feet", label: "Total board feet", value: `${fmt(boardFeet, 2)} bf`, emphasis: "primary" },
        { key: "volume", label: "Volume", value: `${fmt(volumeM3, 4)} m³` },
        { key: "per_board", label: "Board feet per board", value: `${fmt(boardFeet / count, 2)} bf` },
      ],
      summary: "1 board foot = 144 cubic inches (1 ft × 1 ft × 1 inch) = 0.00236 m³. Volume = L × W × T × count.",
    };
  },
  tests: [
    { name: "50m² / (1.22×2.44) = ~19 sheets +10%", inputs: { mode: "sheet", area: 50, sheet_w: 1.22, sheet_h: 2.44, wastage: 10, lum_length: 2.4, lum_width: 50, lum_thickness: 100, lum_count: 10 }, expected: { sheets: "19" } },
  ],
};

/* -------------- Soil, gravel, mulch volume ------------------------ */
export const soilGravelMulch: CalculatorDefinition = {
  slug: "soil-gravel-mulch",
  name: "Soil, Gravel & Mulch Volume",
  description: "Compute volume and weight of soil, gravel or mulch for a garden bed or path.",
  category: "construction",
  keywords: ["soil", "mulch", "gravel", "garden", "volume", "landscape"],
  status: "live",
  part: 4,
  inputs: [
    { name: "length", label: "Length", type: "number", default: 5, min: 0, step: "any", unit: "m" },
    { name: "width", label: "Width", type: "number", default: 2, min: 0, step: "any", unit: "m" },
    { name: "depth", label: "Depth", type: "number", default: 0.1, min: 0, step: "any", unit: "m" },
    { name: "material", label: "Material", type: "select", default: "topsoil",
      options: [
        { label: "Topsoil (~1600 kg/m³)", value: "topsoil" },
        { label: "Sand (~1600 kg/m³)", value: "sand" },
        { label: "Gravel (~1800 kg/m³)", value: "gravel" },
        { label: "Mulch (~500 kg/m³)", value: "mulch" },
        { label: "Compost (~1000 kg/m³)", value: "compost" },
      ] },
  ],
  related: ["concrete-volume", "wall-area-room", "plant-spacing"],
  calculate: (raw) => {
    const l = toNum(raw.length);
    const w = toNum(raw.width);
    const d = toNum(raw.depth);
    const mat = String(raw.material ?? "topsoil");
    const densities: Record<string, number> = {
      topsoil: 1600, sand: 1600, gravel: 1800, mulch: 500, compost: 1000,
    };
    const density = densities[mat] ?? 1600;
    const volume = l * w * d;
    const weight = volume * density;
    return {
      rows: [
        { key: "volume", label: "Volume needed", value: `${fmt(volume, 3)} m³`, emphasis: "primary" },
        { key: "liters", label: "In liters", value: `${fmt(volume * 1000, 0)} L`, emphasis: "primary" },
        { key: "weight", label: "Estimated weight", value: `${fmt(weight, 0)} kg (${fmt(weight / 1000, 2)} t)`, emphasis: "primary" },
        { key: "bags", label: "40 L bags", value: `${Math.ceil(volume * 1000 / 40)}` },
      ],
      sections: [{
        title: "Reference",
        rows: [
          { key: "density", label: "Bulk density", value: `${density} kg/m³` },
          { key: "cubic_yards", label: "In cubic yards", value: `${fmt(volume * 1.30795, 3)} yd³` },
        ],
      }],
      summary: "Volume = L × W × D. Densities are bulk densities — actual moisture and compaction will affect weight. ESTIMATE only.",
    };
  },
  tests: [
    { name: "5×2×0.1m topsoil = 1m³", inputs: { length: 5, width: 2, depth: 0.1, material: "topsoil" }, expected: { volume: "1 m³" } },
    { name: "Same → 1,600 kg", inputs: { length: 5, width: 2, depth: 0.1, material: "topsoil" }, expected: { weight: "1,600 kg (1.6 t)" } },
  ],
};

/* --------------- HVAC load (rough) -------------------------------- */
export const hvacLoad: CalculatorDefinition = {
  slug: "hvac-load",
  name: "HVAC Load Estimate (Rough)",
  description: "Rough cooling/heating load estimate from room size, climate and insulation.",
  category: "construction",
  keywords: ["hvac", "cooling", "heating", "btu", "load", "air conditioning"],
  status: "live",
  part: 4,
  inputs: [
    { name: "area", label: "Floor area", type: "number", default: 50, min: 0, step: "any", unit: "m²" },
    { name: "ceiling", label: "Ceiling height", type: "number", default: 2.7, min: 0, step: "any", unit: "m" },
    { name: "climate", label: "Climate", type: "select", default: "mild",
      options: [
        { label: "Cold (heavy load)", value: "cold" },
        { label: "Mild (moderate)", value: "mild" },
        { label: "Hot (heavy load)", value: "hot" },
      ] },
    { name: "insulation", label: "Insulation quality", type: "select", default: "average",
      options: [
        { label: "Poor (old building)", value: "poor" },
        { label: "Average", value: "average" },
        { label: "Good (modern, well-insulated)", value: "good" },
      ] },
    { name: "occupants", label: "Typical occupants", type: "number", default: 2, min: 0, step: 1 },
    { name: "windows", label: "Window area", type: "number", default: 8, min: 0, step: "any", unit: "m²" },
  ],
  related: ["wall-area-room", "electrical-energy-consumption"],
  calculate: (raw) => {
    const area = toNum(raw.area);
    const ceiling = toNum(raw.ceiling);
    const climate = String(raw.climate ?? "mild");
    const ins = String(raw.insulation ?? "average");
    const occ = toNum(raw.occupants);
    const windows = toNum(raw.windows);
    const volume = area * ceiling;
    // Very rough rule-of-thumb: 100-200 W/m² for cooling
    const climateFactor = climate === "cold" ? 1.3 : climate === "hot" ? 1.4 : 1.0;
    const insFactor = ins === "poor" ? 1.3 : ins === "good" ? 0.7 : 1.0;
    const baseW = area * 120 * climateFactor * insFactor;
    const windowGain = windows * 50; // 50 W/m² of window
    const peopleGain = occ * 100; // 100 W per person sensible
    const totalCoolingW = baseW + windowGain + peopleGain;
    const totalHeatingW = (volume * 35 + area * 60) * (climate === "cold" ? 1.3 : climate === "hot" ? 0.7 : 1.0) * insFactor;
    const coolingBTU = totalCoolingW * 3.412;
    const heatingBTU = totalHeatingW * 3.412;
    const coolingTons = coolingBTU / 12000;
    return {
      rows: [
        { key: "cooling_w", label: "Cooling load", value: `${fmt(totalCoolingW, 0)} W`, emphasis: "primary" },
        { key: "cooling_btu", label: "In BTU/h", value: `${fmt(coolingBTU, 0)} BTU/h` },
        { key: "cooling_tons", label: "Tons of refrigeration", value: `${fmt(coolingTons, 2)} tons`, emphasis: "primary" },
        { key: "heating_w", label: "Heating load", value: `${fmt(totalHeatingW, 0)} W` },
        { key: "heating_btu", label: "Heating (BTU/h)", value: `${fmt(heatingBTU, 0)} BTU/h` },
      ],
      sections: [{
        title: "Breakdown",
        rows: [
          { key: "base", label: "Base load (area × 120 W/m²)", value: `${fmt(baseW, 0)} W` },
          { key: "windows_load", label: "Window gain", value: `${fmt(windowGain, 0)} W` },
          { key: "people_load", label: "Occupant gain", value: `${fmt(peopleGain, 0)} W` },
        ],
      }],
      summary: "ROUGH ESTIMATE ONLY — not a substitute for Manual J or professional load calculation. Real HVAC sizing requires accounting for orientation, shading, duct losses, local design temperatures, and internal gains. Use ASHRAE Manual J for actual equipment selection.",
    };
  },
  tests: [
    { name: "50m² mild climate, average insulation", inputs: { area: 50, ceiling: 2.7, climate: "mild", insulation: "average", occupants: 2, windows: 8 }, expected: { cooling_w: "6,600 W" } },
  ],
};

/* --------------- Solar panel / household energy ------------------- */
export const solarPanel: CalculatorDefinition = {
  slug: "solar-panel",
  name: "Solar Panel System Estimator",
  description: "Estimate solar panel count, system size and energy output from roof area and sun hours.",
  category: "construction",
  keywords: ["solar", "panel", "pv", "renewable", "energy", "roof"],
  status: "live",
  part: 4,
  inputs: [
    { name: "monthly_kwh", label: "Monthly electricity usage", type: "number", default: 600, min: 0, step: "any", unit: "kWh" },
    { name: "sun_hours", label: "Average peak sun hours/day", type: "number", default: 5, min: 0.5, max: 12, step: "any", unit: "h",
      help: "US range: 3-7 hrs. Arizona ~6.5, Germany ~3, India ~5." },
    { name: "panel_w", label: "Panel wattage", type: "number", default: 400, min: 100, max: 800, step: 10, unit: "W" },
    { name: "efficiency", label: "System efficiency (after losses)", type: "number", default: 80, min: 50, max: 100, step: "any", unit: "%" },
  ],
  related: ["electrical-energy-consumption", "hvac-load", "battery-runtime"],
  calculate: (raw) => {
    const monthlyKwh = toNum(raw.monthly_kwh);
    const sunHrs = toNum(raw.sun_hours);
    const panelW = toNum(raw.panel_w);
    const eff = toNum(raw.efficiency) / 100;
    const dailyKwh = monthlyKwh / 30;
    const requiredKw = dailyKwh / (sunHrs * eff);
    const panelsNeeded = Math.ceil((requiredKw * 1000) / panelW);
    const systemKw = (panelsNeeded * panelW) / 1000;
    const actualDailyKwh = systemKw * sunHrs * eff;
    const actualMonthlyKwh = actualDailyKwh * 30;
    const coveragePct = (actualMonthlyKwh / monthlyKwh) * 100;
    return {
      rows: [
        { key: "system_kw", label: "System size needed", value: `${fmt(systemKw, 2)} kW`, emphasis: "primary" },
        { key: "panels", label: "Panels needed", value: `${panelsNeeded} × ${panelW} W`, emphasis: "primary" },
        { key: "actual_monthly", label: "Estimated monthly output", value: `${fmt(actualMonthlyKwh, 0)} kWh` },
        { key: "coverage", label: "Coverage of usage", value: `${fmt(coveragePct, 0)}%`, emphasis: coveragePct >= 100 ? "success" : "normal" },
      ],
      sections: [{
        title: "Reference",
        rows: [
          { key: "daily_use", label: "Daily usage", value: `${fmt(dailyKwh, 2)} kWh/day` },
          { key: "roof_area", label: "Approx roof area needed", value: `${fmt(panelsNeeded * 2, 0)} m² (assuming 2 m²/panel)` },
          { key: "savings", label: "Monthly savings at $0.15/kWh", value: fmtUSD(Math.min(actualMonthlyKwh, monthlyKwh) * 0.15) },
        ],
      }],
      summary: "ESTIMATE ONLY — actual output varies with panel orientation, shading, temperature, inverter efficiency, and degradation. Professional solar assessment required for installation. 1 kW system produces ~sun_hours × efficiency kWh/day.",
    };
  },
  tests: [
    { name: "600kWh/mo, 5 sun hrs, 400W panels, 80%", inputs: { monthly_kwh: 600, sun_hours: 5, panel_w: 400, efficiency: 80 }, expected: { panels: "13 × 400 W" }, tolerance: 1 },
  ],
};
