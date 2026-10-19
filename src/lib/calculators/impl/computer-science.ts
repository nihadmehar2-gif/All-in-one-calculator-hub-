/**
 * Computer Science and Technology — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* ------------------- Number base converter ------------------------ */
export const numberBaseConverter: CalculatorDefinition = {
  slug: "number-base-converter",
  name: "Number Base Converter",
  description: "Convert numbers between binary, octal, decimal and hexadecimal.",
  category: "computer-science",
  keywords: ["binary", "octal", "decimal", "hex", "hexadecimal", "base", "radix"],
  status: "live",
  part: 2,
  inputs: [
    { name: "value", label: "Value to convert", type: "text", default: "255",
      placeholder: "e.g. 255 or 0xFF or 0b1010" },
    { name: "from", label: "Source base", type: "select", default: "10",
      options: [
        { label: "Binary (base 2)", value: "2" },
        { label: "Octal (base 8)", value: "8" },
        { label: "Decimal (base 10)", value: "10" },
        { label: "Hexadecimal (base 16)", value: "16" },
      ] },
  ],
  related: ["bitwise-calculator", "data-size-converter"],
  calculate: (raw) => {
    const valueStr = String(raw.value ?? "").trim().replace(/^0[bxo]/i, "").replace(/_/g, "");
    const base = Number(raw.from ?? 10);
    let num: number;
    try {
      // Validate digits
      const validDigits = base === 2 ? /^[01]+$/i
        : base === 8 ? /^[0-7]+$/i
        : base === 10 ? /^-?\d+$/i
        : base === 16 ? /^[0-9a-f]+$/i
        : null;
      if (!validDigits || !validDigits.test(valueStr)) {
        throw new Error("Invalid digits for the chosen base");
      }
      num = parseInt(valueStr, base);
      if (!Number.isFinite(num)) throw new Error("Out of range");
    } catch (e) {
      return { rows: [{ key: "decimal", label: "Decimal", value: "—", hint: (e as Error).message, emphasis: "warning" }] };
    }
    const unsigned = num < 0 ? (1 << 30) * 4 + num : num; // approximate unsigned for negatives
    return {
      rows: [
        { key: "decimal", label: "Decimal (base 10)", value: String(num), emphasis: "primary" },
        { key: "binary", label: "Binary (base 2)", value: num.toString(2).toUpperCase(), emphasis: "primary" },
        { key: "octal", label: "Octal (base 8)", value: "0o" + num.toString(8) },
        { key: "hex", label: "Hexadecimal (base 16)", value: "0x" + num.toString(16).toUpperCase() },
      ],
      sections: [{
        title: "Quick formats",
        rows: [
          { key: "bin_padded", label: "Binary (8-bit padded)", value: (num & 0xFF).toString(2).padStart(8, "0") },
          { key: "hex_padded", label: "Hex (2-byte padded)", value: "0x" + (num & 0xFFFF).toString(16).toUpperCase().padStart(4, "0") },
          { key: "unsigned", label: "As unsigned 32-bit", value: String(unsigned >>> 0) },
        ],
      }],
      summary: "Each base is a way of writing the same integer using different digit sets. Prefixes 0b, 0o, 0x are common in code.",
    };
  },
  tests: [
    { name: "255 dec → FF hex", inputs: { value: "255", from: "10" }, expected: { hex: "0xFF" } },
    { name: "1010 bin → 10 dec", inputs: { value: "1010", from: "2" }, expected: { decimal: "10" } },
    { name: "FF hex → 255 dec", inputs: { value: "FF", from: "16" }, expected: { decimal: "255" } },
    { name: "17 oct → 15 dec", inputs: { value: "17", from: "8" }, expected: { decimal: "15" } },
  ],
};

/* -------------------- Bitwise calculator -------------------------- */
export const bitwiseCalculator: CalculatorDefinition = {
  slug: "bitwise-calculator",
  name: "Bitwise Calculator",
  description: "Apply AND, OR, XOR, NOT, left shift and right shift to integers, with binary visualization.",
  category: "computer-science",
  keywords: ["bitwise", "and", "or", "xor", "not", "shift", "binary operation"],
  status: "live",
  part: 2,
  inputs: [
    { name: "a", label: "Operand a", type: "number", default: 12, step: 1 },
    { name: "op", label: "Operation", type: "select", default: "&",
      options: [
        { label: "AND (a & b)", value: "&" },
        { label: "OR (a | b)", value: "|" },
        { label: "XOR (a ^ b)", value: "^" },
        { label: "NOT (~a) — ignores b", value: "~" },
        { label: "Left shift (a << b)", value: "<<" },
        { label: "Right shift (a >> b)", value: ">>" },
      ] },
    { name: "b", label: "Operand b", type: "number", default: 10, step: 1 },
  ],
  related: ["number-base-converter", "data-size-converter"],
  calculate: (raw) => {
    const a = Math.trunc(toNum(raw.a));
    const b = Math.trunc(toNum(raw.b));
    const op = String(raw.op ?? "&");
    let result: number;
    let formula: string;
    switch (op) {
      case "&": result = a & b; formula = `${a} & ${b}`; break;
      case "|": result = a | b; formula = `${a} | ${b}`; break;
      case "^": result = a ^ b; formula = `${a} ^ ${b}`; break;
      case "~": result = ~a; formula = `~${a}`; break;
      case "<<": result = a << b; formula = `${a} << ${b}`; break;
      case ">>": result = a >> b; formula = `${a} >> ${b}`; break;
      default: result = 0; formula = "";
    }
    return {
      rows: [
        { key: "result", label: `${formula} = `, value: String(result), emphasis: "primary" },
        { key: "binary", label: "Result in binary", value: (result >>> 0).toString(2), emphasis: "primary" },
        { key: "hex", label: "Result in hex", value: "0x" + (result >>> 0).toString(16).toUpperCase() },
      ],
      sections: [{
        title: "Operands",
        rows: [
          { key: "a_bin", label: "a in binary", value: (a >>> 0).toString(2) },
          { key: "b_bin", label: "b in binary", value: (b >>> 0).toString(2) },
        ],
      }],
      summary: "Bitwise ops work on the 32-bit two's-complement representation of integers. NOT flips all bits; shifts can change the sign.",
    };
  },
  tests: [
    { name: "12 & 10 = 8", inputs: { a: 12, op: "&", b: 10 }, expected: { result: "8" } },
    { name: "12 | 10 = 14", inputs: { a: 12, op: "|", b: 10 }, expected: { result: "14" } },
    { name: "12 ^ 10 = 6", inputs: { a: 12, op: "^", b: 10 }, expected: { result: "6" } },
    { name: "~0 = -1", inputs: { a: 0, op: "~", b: 0 }, expected: { result: "-1" } },
    { name: "1 << 4 = 16", inputs: { a: 1, op: "<<", b: 4 }, expected: { result: "16" } },
  ],
};

/* --------------------- Color converter ---------------------------- */
export const colorConverter: CalculatorDefinition = {
  slug: "color-converter",
  name: "Color Converter (HEX / RGB / HSL)",
  description: "Convert a color between HEX, RGB and HSL color spaces.",
  category: "computer-science",
  keywords: ["color", "hex", "rgb", "hsl", "css", "design"],
  status: "live",
  part: 2,
  inputs: [
    { name: "input_type", label: "Input format", type: "select", default: "hex",
      options: [
        { label: "HEX (e.g. #FF8800)", value: "hex" },
        { label: "RGB (e.g. 255, 136, 0)", value: "rgb" },
        { label: "HSL (e.g. 32, 100, 50)", value: "hsl" },
      ] },
    { name: "value", label: "Color value", type: "text", default: "#FF8800",
      placeholder: "e.g. #FF8800 or 255, 136, 0" },
  ],
  related: ["number-base-converter", "screen-resolution"],
  calculate: (raw) => {
    const inputType = String(raw.input_type ?? "hex");
    const v = String(raw.value ?? "").trim();
    let r = 0, g = 0, b = 0;
    try {
      if (inputType === "hex") {
        let hex = v.replace(/^#/, "").trim();
        if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
        if (hex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error("Invalid HEX");
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else if (inputType === "rgb") {
        const parts = v.split(/[,\s]+/).filter(Boolean).map((n) => parseInt(n, 10));
        if (parts.length < 3) throw new Error("Need 3 numbers");
        [r, g, b] = parts;
      } else {
        const parts = v.split(/[,\s]+/).filter(Boolean).map((n) => parseFloat(n));
        if (parts.length < 3) throw new Error("Need 3 numbers");
        [r, g, b] = hslToRgb(parts[0], parts[1], parts[2]);
      }
      if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) throw new Error("Out of 0-255 range");
    } catch (e) {
      return { rows: [{ key: "hex", label: "HEX", value: "—", hint: (e as Error).message, emphasis: "warning" }] };
    }
    const hex = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0").toUpperCase()).join("");
    const [h, s, l] = rgbToHsl(r, g, b);
    return {
      rows: [
        { key: "hex", label: "HEX", value: hex, emphasis: "primary" },
        { key: "rgb", label: "RGB", value: `rgb(${r}, ${g}, ${b})`, emphasis: "primary" },
        { key: "hsl", label: "HSL", value: `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`, emphasis: "primary" },
      ],
      sections: [{
        title: "Useful variants",
        rows: [
          { key: "rgb_pct", label: "RGB %", value: `${(r / 255 * 100).toFixed(0)}%, ${(g / 255 * 100).toFixed(0)}%, ${(b / 255 * 100).toFixed(0)}%` },
          { key: "css_short", label: "CSS shorthand", value: hex.length === 7 && hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6] ? "#" + hex[1] + hex[3] + hex[5] : "(no short form)" },
        ],
      }],
      summary: "HEX packs each channel into 2 hex digits (0-FF). RGB uses 0-255 decimals. HSL describes hue (0-360°), saturation and lightness (both %).",
    };
  },
  tests: [
    { name: "#FF8800 → RGB(255, 136, 0)", inputs: { input_type: "hex", value: "#FF8800" }, expected: { rgb: "rgb(255, 136, 0)" } },
    { name: "RGB(255, 0, 0) → #FF0000", inputs: { input_type: "rgb", value: "255, 0, 0" }, expected: { hex: "#FF0000" } },
    { name: "#000000 → HSL(0, 0%, 0%)", inputs: { input_type: "hex", value: "#000000" }, expected: { hsl: "hsl(0, 0%, 0%)" } },
  ],
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
