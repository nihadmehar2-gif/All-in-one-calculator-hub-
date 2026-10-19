/**
 * Shopping and Everyday Life — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtFixed, fmtUSD, toNum } from "../_format";

/* ----------------------- Discount calculator ---------------------- */
export const discountCalculator: CalculatorDefinition = {
  slug: "discount-calculator",
  name: "Discount Calculator",
  description: "Apply percentage discounts and find the final sale price.",
  category: "shopping",
  keywords: ["discount", "sale", "percent off", "markdown", "shopping"],
  status: "live",
  part: 4,
  inputs: [
    { name: "original", label: "Original price", type: "number", default: 80, min: 0, step: "any", unit: "$" },
    { name: "discount", label: "Discount %", type: "number", default: 25, min: 0, max: 100, step: "any", unit: "%" },
    { name: "extra_discount", label: "Additional discount % (stacked)", type: "number", default: 0, min: 0, max: 100, step: "any", unit: "%" },
  ],
  related: ["unit-price", "tip-calculator", "sales-tax-vat-gst"],
  calculate: (raw) => {
    const orig = toNum(raw.original);
    const d1 = toNum(raw.discount) / 100;
    const d2 = toNum(raw.extra_discount) / 100;
    const afterFirst = orig * (1 - d1);
    const final = afterFirst * (1 - d2);
    const totalDiscount = orig - final;
    const totalDiscountPct = orig > 0 ? (totalDiscount / orig) * 100 : 0;
    return {
      rows: [
        { key: "final", label: "Final price", value: fmtUSD(final), emphasis: "primary" },
        { key: "saved", label: "Total saved", value: fmtUSD(totalDiscount), emphasis: "primary" },
        { key: "total_pct", label: "Effective discount", value: `${fmt(totalDiscountPct, 2)}%` },
      ],
      sections: [{
        title: "Steps",
        rows: [
          { key: "after_d1", label: `After ${fmt(d1 * 100, 0)}% off`, value: fmtUSD(afterFirst) },
          { key: "after_d2", label: d2 > 0 ? `Then ${fmt(d2 * 100, 0)}% off` : "No extra discount", value: fmtUSD(final) },
        ],
      }],
      summary: "Stacked discounts are applied sequentially — 25% + 25% = 43.75% off, not 50% off.",
    };
  },
  tests: [
    { name: "$80 with 25% off = $60", inputs: { original: 80, discount: 25, extra_discount: 0 }, expected: { final: "$60.00" } },
    { name: "Stacked 25% + 10%", inputs: { original: 80, discount: 25, extra_discount: 10 }, expected: { final: "$54.00" } },
  ],
};

/* ----------------------- Unit price -------------------------------- */
export const unitPrice: CalculatorDefinition = {
  slug: "unit-price",
  name: "Unit Price Comparison",
  description: "Compare prices per unit across package sizes to find the best value.",
  category: "shopping",
  keywords: ["unit price", "compare", "best value", "per ounce", "per gram", "shopping"],
  status: "live",
  part: 4,
  inputs: [
    { name: "items", label: "Items (one per line: <price> <quantity> <unit>)", type: "textarea",
      default: "5.99 500 g\n8.99 1000 g\n3.49 250 g",
      placeholder: "price quantity unit\ne.g. 5.99 500 g" },
  ],
  related: ["discount-calculator", "tip-calculator", "mass-converter"],
  calculate: (raw) => {
    const text = String(raw.items ?? "");
    const items: { price: number; qty: number; unit: string; perUnit: number }[] = [];
    for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 3) continue;
      const price = toNum(parts[0]);
      const qty = toNum(parts[1]);
      const unit = parts.slice(2).join(" ");
      if (Number.isFinite(price) && Number.isFinite(qty) && qty > 0) {
        items.push({ price, qty, unit, perUnit: price / qty });
      }
    }
    if (items.length === 0) {
      return { rows: [{ key: "best", label: "Best value", value: "—" }] };
    }
    items.sort((a, b) => a.perUnit - b.perUnit);
    const best = items[0];
    const formatUnitPrice = (v: number) => `$${fmtFixed(v, 5)}`;
    const rows = items.map((it, i) => ({
      key: `item_${i}`,
      label: `${fmtUSD(it.price)} / ${fmt(it.qty, 2)} ${it.unit}`,
      value: `${formatUnitPrice(it.perUnit)} / ${it.unit}${i === 0 ? " ← best" : ""}`,
    }));
    return {
      rows: [
        { key: "best", label: "Best value (lowest unit price)", value: `${formatUnitPrice(best.perUnit)} / ${best.unit}`, emphasis: "primary" },
      ],
      sections: [{
        title: "All items (sorted by unit price)",
        rows,
      }],
      summary: "Unit price = price ÷ quantity. Comparing per-unit cost reveals bulk savings — but only if you'll use the larger size before it expires.",
    };
  },
  tests: [
    { name: "Three packages, 1kg should win", inputs: { items: "5.99 500 g\n8.99 1000 g\n3.49 250 g" }, expected: { best: "$0.00899 / g" } },
  ],
};

/* ----------------------- Tip calculator --------------------------- */
export const tipCalculator: CalculatorDefinition = {
  slug: "tip-calculator",
  name: "Tip & Bill Splitter",
  description: "Compute tip and split a restaurant bill among multiple people.",
  category: "shopping",
  keywords: ["tip", "restaurant", "bill", "split", "gratuity"],
  status: "live",
  part: 4,
  inputs: [
    { name: "bill", label: "Bill amount", type: "number", default: 80, min: 0, step: "any", unit: "$" },
    { name: "tip_pct", label: "Tip %", type: "number", default: 18, min: 0, max: 100, step: "any", unit: "%" },
    { name: "people", label: "Number of people", type: "number", default: 4, min: 1, step: 1 },
    { name: "tax_pct", label: "Sales tax % (added before tip)", type: "number", default: 8, min: 0, step: "any", unit: "%" },
  ],
  related: ["discount-calculator", "unit-price", "sales-tax-vat-gst"],
  calculate: (raw) => {
    const bill = toNum(raw.bill);
    const tipPct = toNum(raw.tip_pct) / 100;
    const people = Math.max(1, Math.round(toNum(raw.people)));
    const taxPct = toNum(raw.tax_pct) / 100;
    const tax = bill * taxPct;
    const postTax = bill + tax;
    const tip = postTax * tipPct;
    const total = postTax + tip;
    const perPerson = total / people;
    return {
      rows: [
        { key: "total", label: "Total (incl. tax + tip)", value: fmtUSD(total), emphasis: "primary" },
        { key: "per_person", label: `Per person (${people})`, value: fmtUSD(perPerson), emphasis: "primary" },
        { key: "tip", label: "Tip amount", value: fmtUSD(tip) },
        { key: "tax", label: "Sales tax", value: fmtUSD(tax) },
      ],
      summary: "Tip is calculated on the post-tax bill (US convention). Tip %: 15% = ok service, 18% = good, 20%+ = excellent.",
    };
  },
  tests: [
    { name: "$80 bill, 18% tip, 4 people, 8% tax", inputs: { bill: 80, tip_pct: 18, people: 4, tax_pct: 8 }, expected: { per_person: "$25.49" } },
  ],
};
