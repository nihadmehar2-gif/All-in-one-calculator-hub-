/**
 * Real Estate and Property — additional calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* ------------------- Property tax ---------------------------------- */
export const propertyTax: CalculatorDefinition = {
  slug: "property-tax",
  name: "Property Tax Estimator",
  description: "Estimate annual property tax from assessed value and mill rate.",
  category: "real-estate",
  keywords: ["property tax", "mill rate", "assessed value", "real estate"],
  status: "live",
  part: 5,
  inputs: [
    { name: "assessed", label: "Assessed value", type: "number", default: 350000, min: 0, step: "any", unit: "$" },
    { name: "mill_rate", label: "Mill rate (or use % rate)", type: "number", default: 12.5, min: 0, step: "any", unit: "mills",
      help: "1 mill = $1 per $1,000 assessed. Common US range: 5-30 mills." },
    { name: "exemptions", label: "Exemptions (homestead, senior, etc.)", type: "number", default: 50000, min: 0, step: "any", unit: "$" },
  ],
  related: ["ltv-ratio", "mortgage-affordability", "down-payment-closing"],
  calculate: (raw) => {
    const assessed = toNum(raw.assessed);
    const mill = toNum(raw.mill_rate);
    const exemptions = toNum(raw.exemptions);
    const taxable = Math.max(0, assessed - exemptions);
    // 1 mill = $1 per $1,000 = 0.001
    const annualTax = taxable * (mill / 1000);
    return {
      rows: [
        { key: "annual_tax", label: "Annual property tax", value: fmtUSD(annualTax), emphasis: "primary" },
        { key: "monthly", label: "Monthly", value: fmtUSD(annualTax / 12), emphasis: "primary" },
        { key: "effective_rate", label: "Effective rate (of assessed)", value: assessed > 0 ? `${fmt((annualTax / assessed) * 100, 4)}%` : "—" },
      ],
      sections: [{
        title: "Inputs",
        rows: [
          { key: "assessed", label: "Assessed value", value: fmtUSD(assessed) },
          { key: "exemptions", label: "Exemptions", value: fmtUSD(exemptions) },
          { key: "taxable", label: "Taxable value", value: fmtUSD(taxable) },
          { key: "mill", label: "Mill rate", value: `${mill} mills` },
        ],
      }],
      summary: "Property tax = taxable value × (mill rate ÷ 1000). Assessments differ from market value; check your local assessor's office for actual rates and exemptions.",
    };
  },
  tests: [
    { name: "$350k assessed, 12.5 mills, $50k exempt → $3,750", inputs: { assessed: 350000, mill_rate: 12.5, exemptions: 50000 }, expected: { annual_tax: "$3,750.00" } },
  ],
};

/* ------------------- HOA impact ------------------------------------ */
export const hoaImpact: CalculatorDefinition = {
  slug: "hoa-impact",
  name: "HOA Total Cost Impact",
  description: "Compute total HOA cost over a holding period and impact on effective equity.",
  category: "real-estate",
  keywords: ["hoa", "homeowners association", "fees", "holding cost"],
  status: "live",
  part: 5,
  inputs: [
    { name: "monthly_hoa", label: "Monthly HOA fee", type: "number", default: 350, min: 0, step: "any", unit: "$" },
    { name: "annual_increase", label: "Annual fee increase", type: "number", default: 3, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Holding period", type: "number", default: 10, min: 1, step: 1, unit: "yrs" },
  ],
  related: ["mortgage-affordability", "property-tax", "rental-yield"],
  calculate: (raw) => {
    const monthly = toNum(raw.monthly_hoa);
    const increase = toNum(raw.annual_increase) / 100;
    const years = Math.max(1, Math.round(toNum(raw.years)));
    let total = 0;
    let currentMonthly = monthly;
    const series: { label: string; value: number }[] = [];
    for (let y = 1; y <= years; y++) {
      const yearTotal = currentMonthly * 12;
      total += yearTotal;
      series.push({ label: `Year ${y}`, value: Math.round(yearTotal) });
      currentMonthly *= (1 + increase);
    }
    return {
      rows: [
        { key: "total", label: `Total HOA cost over ${years}y`, value: fmtUSD(total), emphasis: "primary" },
        { key: "annual_avg", label: "Average per year", value: fmtUSD(total / years), emphasis: "primary" },
        { key: "final_monthly", label: "Monthly fee in final year", value: fmtUSD(currentMonthly) },
      ],
      sections: [{
        title: "Yearly breakdown",
        rows: series.map((s, i) => ({ key: `y${i}`, label: s.label, value: fmtUSD(s.value) })),
      }],
      summary: "HOA fees are a recurring carrying cost often underestimated. A $350/mo fee with 3% annual increases costs ~$48,000 over 10 years — equivalent to a noticeable chunk of equity.",
    };
  },
  tests: [
    { name: "$350/mo, 3% increase, 10y → ~$48k", inputs: { monthly_hoa: 350, annual_increase: 3, years: 10 }, expected: { total: "$48,148.29" } },
  ],
};

/* ------------------- Cap rate (real estate) ------------------------ */
export const capRate: CalculatorDefinition = {
  slug: "cap-rate",
  name: "Capitalization Rate (Cap Rate)",
  description: "Compute cap rate (NOI ÷ price) for an investment property.",
  category: "real-estate",
  keywords: ["cap rate", "capitalization", "noi", "investment property", "yield"],
  status: "live",
  part: 5,
  inputs: [
    { name: "price", label: "Property purchase price", type: "number", default: 400000, min: 0, step: "any", unit: "$" },
    { name: "gross_rent", label: "Annual gross rental income", type: "number", default: 36000, min: 0, step: "any", unit: "$" },
    { name: "operating_costs", label: "Annual operating costs (tax, insurance, maintenance, mgmt)", type: "number", default: 9000, min: 0, step: "any", unit: "$" },
  ],
  related: ["rental-yield", "ltv-ratio", "mortgage-affordability"],
  calculate: (raw) => {
    const price = toNum(raw.price);
    const gross = toNum(raw.gross_rent);
    const op = toNum(raw.operating_costs);
    if (price <= 0) {
      return { rows: [{ key: "cap_rate", label: "Cap rate", value: "—" }] };
    }
    const noi = gross - op;
    const capRate = (noi / price) * 100;
    const grossYield = (gross / price) * 100;
    return {
      rows: [
        { key: "cap_rate", label: "Cap rate (NOI ÷ price)", value: `${fmt(capRate, 2)}%`, emphasis: "primary" },
        { key: "noi", label: "Net operating income (NOI)", value: fmtUSD(noi), emphasis: "primary" },
        { key: "gross_yield", label: "Gross yield", value: `${fmt(grossYield, 2)}%` },
      ],
      sections: [{
        title: "Reference",
        rows: [
          { key: "urban", label: "Urban core (low cap, high appreciation)", value: "3-5%" },
          { key: "suburban", label: "Suburban (balanced)", value: "5-7%" },
          { key: "rural", label: "Rural / Class C (high cap, more risk)", value: "8-10%+" },
        ],
      }],
      summary: "Cap rate = NOI ÷ price. Higher cap rate = higher cash yield but often more risk. Cap rate does NOT include mortgage payments — it's an unlevered return measure.",
    };
  },
  tests: [
    { name: "$400k, $36k rent, $9k costs → 6.75% cap", inputs: { price: 400000, gross_rent: 36000, operating_costs: 9000 }, expected: { cap_rate: "6.75%" } },
  ],
};

/* ------------------- 1031 exchange (illustrative) ------------------ */
export const exchange1031: CalculatorDefinition = {
  slug: "exchange-1031",
  name: "1031 Exchange Tax Deferral",
  description: "Estimate US capital gains tax deferred by a 1031 like-kind exchange.",
  category: "real-estate",
  keywords: ["1031", "exchange", "tax deferral", "capital gains", "us", "real estate"],
  status: "live",
  part: 5,
  inputs: [
    { name: "purchase_price", label: "Original purchase price", type: "number", default: 200000, min: 0, step: "any", unit: "$" },
    { name: "sale_price", label: "Current sale price", type: "number", default: 400000, min: 0, step: "any", unit: "$" },
    { name: "depreciation", label: "Depreciation taken", type: "number", default: 60000, min: 0, step: "any", unit: "$" },
    { name: "ltcg_rate", label: "LTCG tax rate", type: "number", default: 15, min: 0, max: 23.8, step: "any", unit: "%" },
  ],
  related: ["capital-gains", "cap-rate", "property-tax"],
  calculate: (raw) => {
    const purchase = toNum(raw.purchase_price);
    const sale = toNum(raw.sale_price);
    const dep = toNum(raw.depreciation);
    const ltcgRate = toNum(raw.ltcg_rate) / 100;
    if (sale <= purchase) {
      return {
        rows: [
          { key: "gain", label: "Capital gain", value: fmtUSD(sale - purchase), emphasis: "warning" },
          { key: "tax", label: "Estimated tax (no exchange)", value: fmtUSD(0) },
          { key: "deferred", label: "Deferred by 1031", value: fmtUSD(0) },
        ],
        summary: "Sale price ≤ purchase price — no gain to defer.",
      };
    }
    // Adjusted basis = purchase − depreciation
    const adjustedBasis = Math.max(0, purchase - dep);
    const gain = sale - adjustedBasis;
    // Depreciation recapture (US, 25% max)
    const depRecapture = Math.min(dep, gain) * 0.25;
    const ltcg = Math.max(0, gain - dep) * ltcgRate;
    const totalTax = depRecapture + ltcg;
    return {
      rows: [
        { key: "gain", label: "Total taxable gain", value: fmtUSD(gain), emphasis: "primary" },
        { key: "tax", label: "Estimated tax (no exchange)", value: fmtUSD(totalTax), emphasis: "primary" },
        { key: "deferred", label: "Deferred by 1031 exchange", value: fmtUSD(totalTax), emphasis: "primary" },
      ],
      sections: [{
        title: "Breakdown",
        rows: [
          { key: "adjusted_basis", label: "Adjusted basis (price − depreciation)", value: fmtUSD(adjustedBasis) },
          { key: "dep_recapture", label: "Depreciation recapture (25%)", value: fmtUSD(depRecapture) },
          { key: "ltcg", label: `LTCG tax (${(ltcgRate * 100).toFixed(0)}%)`, value: fmtUSD(ltcg) },
        ],
      }],
      summary: "US 1031 exchange defers (not eliminates) capital gains tax if you reinvest proceeds in a like-kind property within 180 days. Tax is due when you eventually sell without exchanging. Consult a tax professional — rules are complex.",
    };
  },
  tests: [
    { name: "$200k → $400k, $60k depreciation, 15% LTCG", inputs: { purchase_price: 200000, sale_price: 400000, depreciation: 60000, ltcg_rate: 15 }, expected: { gain: "$260,000.00" } },
  ],
};
