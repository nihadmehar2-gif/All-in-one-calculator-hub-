/**
 * Payroll — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* ------------------- Payroll with overtime ------------------------- */
export const payrollCalculator: CalculatorDefinition = {
  slug: "payroll-calculator",
  name: "Payroll with Overtime (US FLSA)",
  description: "Compute weekly gross pay including overtime at 1.5× for hours over 40.",
  category: "productivity",
  keywords: ["payroll", "overtime", "flsa", "weekly pay", "gross", "wage"],
  status: "live",
  part: 5,
  inputs: [
    { name: "hourly_rate", label: "Hourly rate", type: "number", default: 22, min: 0, step: "any", unit: "$/hr" },
    { name: "regular_hours", label: "Regular hours worked", type: "number", default: 40, min: 0, step: "any" },
    { name: "ot_hours", label: "Overtime hours (over 40/wk)", type: "number", default: 6, min: 0, step: "any" },
    { name: "double_hours", label: "Double-time hours (2.0×)", type: "number", default: 0, min: 0, step: "any" },
    { name: "pre_tax_deductions", label: "Pre-tax deductions (401k, HSA)", type: "number", default: 50, min: 0, step: "any", unit: "$" },
    { name: "post_tax_deductions", label: "Post-tax deductions", type: "number", default: 20, min: 0, step: "any", unit: "$" },
  ],
  related: ["overtime", "salary-take-home", "hourly-rate"],
  calculate: (raw) => {
    const rate = toNum(raw.hourly_rate);
    const regH = toNum(raw.regular_hours);
    const otH = toNum(raw.ot_hours);
    const dtH = toNum(raw.double_hours);
    const preTax = toNum(raw.pre_tax_deductions);
    const postTax = toNum(raw.post_tax_deductions);
    if (rate <= 0) {
      return { rows: [{ key: "gross", label: "Gross pay", value: "—" }] };
    }
    const regPay = regH * rate;
    const otPay = otH * rate * 1.5;
    const dtPay = dtH * rate * 2.0;
    const grossPay = regPay + otPay + dtPay;
    // Rough tax estimate: 7.65% FICA + 12% federal + 5% state on (gross - preTax)
    const taxableGross = Math.max(0, grossPay - preTax);
    const fica = taxableGross * 0.0765;
    const federal = taxableGross * 0.12;
    const state = taxableGross * 0.05;
    const totalTax = fica + federal + state;
    const netPay = grossPay - preTax - totalTax - postTax;
    return {
      rows: [
        { key: "gross", label: "Gross pay", value: fmtUSD(grossPay), emphasis: "primary" },
        { key: "net", label: "Net (take-home) pay", value: fmtUSD(netPay), emphasis: "primary" },
        { key: "total_tax", label: "Estimated taxes", value: fmtUSD(totalTax) },
      ],
      sections: [{
        title: "Pay breakdown",
        rows: [
          { key: "reg", label: `Regular (${fmt(regH, 1)}h × ${fmtUSD(rate)})`, value: fmtUSD(regPay) },
          { key: "ot", label: `Overtime (${fmt(otH, 1)}h × ${fmtUSD(rate * 1.5)})`, value: fmtUSD(otPay) },
          { key: "dt", label: `Double-time (${fmt(dtH, 1)}h × ${fmtUSD(rate * 2)})`, value: fmtUSD(dtPay) },
        ],
      }, {
        title: "Estimated taxes",
        rows: [
          { key: "fica", label: "FICA (7.65%)", value: fmtUSD(fica) },
          { key: "fed", label: "Federal income (12%)", value: fmtUSD(federal) },
          { key: "st", label: "State income (5%)", value: fmtUSD(state) },
          { key: "pre_tax", label: "Pre-tax deductions", value: fmtUSD(preTax) },
          { key: "post_tax", label: "Post-tax deductions", value: fmtUSD(postTax) },
        ],
      }],
      summary: "US FLSA: overtime = 1.5× for hours > 40/week. ESTIMATE ONLY — actual tax withholding depends on W-4 allowances, state, and credits. Tax rates shown are illustrative.",
    };
  },
  tests: [
    { name: "$22/hr × 40 + 6 OT, $50 pre-tax, $20 post-tax", inputs: { hourly_rate: 22, regular_hours: 40, ot_hours: 6, double_hours: 0, pre_tax_deductions: 50, post_tax_deductions: 20 }, expected: { gross: "$1,078.00" } },
  ],
};

/* ------------------- Bonus tax (US supplemental) ------------------- */
export const bonusTax: CalculatorDefinition = {
  slug: "bonus-tax",
  name: "Bonus Tax (US Supplemental)",
  description: "Estimate US federal tax on a bonus using the 22% supplemental rate.",
  category: "productivity",
  keywords: ["bonus", "supplemental", "tax", "irs", "withholding"],
  status: "live",
  part: 5,
  inputs: [
    { name: "bonus", label: "Bonus amount", type: "number", default: 5000, min: 0, step: "any", unit: "$" },
    { name: "method", label: "Withholding method", type: "select", default: "supplemental",
      options: [
        { label: "Supplemental (flat 22% federal)", value: "supplemental" },
        { label: "Aggregate (with regular wages)", value: "aggregate" },
      ] },
    { name: "state_rate", label: "State income tax rate", type: "number", default: 5, min: 0, max: 13, step: "any", unit: "%" },
  ],
  related: ["payroll-calculator", "salary-take-home", "income-tax-us-2024"],
  calculate: (raw) => {
    const bonus = toNum(raw.bonus);
    const method = String(raw.method ?? "supplemental");
    const stateRate = toNum(raw.state_rate) / 100;
    if (bonus <= 0) {
      return { rows: [{ key: "net", label: "Net bonus", value: "—" }] };
    }
    let federalRate: number;
    if (method === "supplemental") {
      // Flat 22% for bonuses under $1M (simplified; ignores 37% above $1M)
      federalRate = bonus >= 1000000 ? 0.37 : 0.22;
    } else {
      // Aggregate method approximates to ~22-24% for most earners
      federalRate = 0.24;
    }
    const federal = bonus * federalRate;
    const fica = bonus * 0.0765; // 6.2% SS + 1.45% Medicare
    const state = bonus * stateRate;
    const totalTax = federal + fica + state;
    const net = bonus - totalTax;
    return {
      rows: [
        { key: "net", label: "Net bonus (take-home)", value: fmtUSD(net), emphasis: "primary" },
        { key: "total_tax", label: "Total taxes withheld", value: fmtUSD(totalTax), emphasis: "primary" },
      ],
      sections: [{
        title: "Tax breakdown",
        rows: [
          { key: "federal", label: `Federal (${(federalRate * 100).toFixed(0)}% supplemental)`, value: fmtUSD(federal) },
          { key: "fica", label: "FICA (7.65%)", value: fmtUSD(fica) },
          { key: "state", label: `State (${(stateRate * 100).toFixed(2)}%)`, value: fmtUSD(state) },
        ],
      }],
      summary: "ESTIMATE — US supplemental wages (bonuses, commissions) are typically withheld at flat 22% federal if paid separately. FICA always applies. Actual tax due may differ at year-end based on total income.",
    };
  },
  tests: [
    { name: "$5k bonus, supplemental, 5% state", inputs: { bonus: 5000, method: "supplemental", state_rate: 5 }, expected: { net: "$3,267.50" } },
  ],
};
