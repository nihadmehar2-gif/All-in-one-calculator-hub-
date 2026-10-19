/**
 * Tax and Salary — implemented calculators.
 *
 * ACCURACY RULES (per Part 3 spec):
 *  - Each tax calculator clearly states the supported country, region, tax year.
 *  - Tax brackets are sourced from official public-rate tables (US IRS 2024).
 *  - No invented rates: every percentage in this file is from a verifiable public source.
 *  - Estimates are clearly labeled as estimates, not official tax advice.
 *  - Country never leaks: a US calculator does not assume UK rules, etc.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* ------------------- Wage conversion ------------------------------ */
export const wageConversion: CalculatorDefinition = {
  slug: "wage-conversion",
  name: "Wage Converter (Hourly ↔ Salary)",
  description: "Convert between hourly, weekly, monthly and annual wages.",
  category: "taxes",
  keywords: ["wage", "hourly", "annual", "salary", "convert", "pay rate"],
  status: "live",
  part: 3,
  inputs: [
    { name: "amount", label: "Amount", type: "number", default: 25, min: 0, step: "any" },
    { name: "per", label: "Per", type: "select", default: "hour",
      options: [
        { label: "Hour", value: "hour" },
        { label: "Week", value: "week" },
        { label: "Month", value: "month" },
        { label: "Year", value: "year" },
      ] },
    { name: "hours_per_week", label: "Hours per week", type: "number", default: 40, min: 1, max: 168, step: "any" },
    { name: "weeks_per_year", label: "Weeks worked per year", type: "number", default: 52, min: 1, max: 52, step: 1 },
  ],
  related: ["salary-take-home", "overtime", "income-tax-us-2024"],
  calculate: (raw) => {
    const amt = toNum(raw.amount);
    const per = String(raw.per ?? "hour");
    const hpw = toNum(raw.hours_per_week);
    const wpy = toNum(raw.weeks_per_year);
    if (hpw <= 0 || wpy <= 0) {
      return { rows: [{ key: "annual", label: "Annual", value: "—" }] };
    }
    // Convert input to annual first
    let annual: number;
    switch (per) {
      case "hour": annual = amt * hpw * wpy; break;
      case "week": annual = amt * wpy; break;
      case "month": annual = amt * 12; break;
      case "year": annual = amt; break;
      default: annual = 0;
    }
    const hourly = annual / (hpw * wpy);
    const weekly = annual / wpy;
    const monthly = annual / 12;
    return {
      rows: [
        { key: "annual", label: "Annual salary", value: fmtUSD(annual), emphasis: "primary" },
        { key: "monthly", label: "Monthly", value: fmtUSD(monthly), emphasis: "primary" },
        { key: "weekly", label: "Weekly", value: fmtUSD(weekly) },
        { key: "hourly", label: "Hourly", value: fmtUSD(hourly) },
      ],
      sections: [{
        title: "Assumptions",
        rows: [
          { key: "hpw", label: "Hours per week", value: `${fmt(hpw, 1)}` },
          { key: "wpy", label: "Weeks per year", value: `${fmt(wpy, 0)}` },
          { key: " unpaid", label: "Note", value: "Does not account for unpaid leave, overtime, bonuses or benefits." },
        ],
      }],
      summary: "Conversion assumes a fixed schedule with no overtime. Real paychecks vary with benefits, 401(k) contributions, and tax withholding.",
    };
  },
  tests: [
    { name: "$25/hr × 40h × 52w = $52,000/yr", inputs: { amount: 25, per: "hour", hours_per_week: 40, weeks_per_year: 52 }, expected: { annual: "$52,000.00" } },
    { name: "$60,000/yr → $5,000/mo", inputs: { amount: 60000, per: "year", hours_per_week: 40, weeks_per_year: 52 }, expected: { monthly: "$5,000.00" } },
  ],
};

/* --------------------- Overtime ----------------------------------- */
export const overtime: CalculatorDefinition = {
  slug: "overtime",
  name: "Overtime Pay Calculator",
  description: "Estimate weekly pay including overtime at 1.5× rate (US FLSA standard).",
  category: "taxes",
  keywords: ["overtime", "time and a half", "flsa", "weekly pay", "extra hours"],
  status: "live",
  part: 3,
  inputs: [
    { name: "hourly", label: "Regular hourly rate", type: "number", default: 20, min: 0, step: "any", unit: "$/hr" },
    { name: "regular_hours", label: "Regular hours", type: "number", default: 40, min: 0, step: "any", unit: "hrs" },
    { name: "ot_hours", label: "Overtime hours", type: "number", default: 8, min: 0, step: "any", unit: "hrs" },
    { name: "ot_mult", label: "Overtime multiplier", type: "select", default: "1.5",
      options: [
        { label: "1.5× (US FLSA standard)", value: "1.5" },
        { label: "2.0× (double time)", value: "2" },
        { label: "1.0× (no overtime)", value: "1" },
      ] },
  ],
  related: ["wage-conversion", "salary-take-home", "income-tax-us-2024"],
  calculate: (raw) => {
    const hourly = toNum(raw.hourly);
    const reg = toNum(raw.regular_hours);
    const ot = toNum(raw.ot_hours);
    const mult = Number(raw.ot_mult ?? 1.5);
    const regPay = hourly * reg;
    const otPay = hourly * mult * ot;
    const total = regPay + otPay;
    const effRate = reg + ot > 0 ? total / (reg + ot) : 0;
    return {
      rows: [
        { key: "total", label: "Total weekly pay", value: fmtUSD(total), emphasis: "primary" },
        { key: "reg_pay", label: "Regular pay", value: fmtUSD(regPay) },
        { key: "ot_pay", label: `Overtime pay (${mult}×)`, value: fmtUSD(otPay), emphasis: "primary" },
        { key: "eff_rate", label: "Effective hourly rate", value: fmtUSD(effRate) },
      ],
      summary: "US Fair Labor Standards Act (FLSA) requires 1.5× pay for hours over 40/week for non-exempt employees. Some states (e.g. California) require daily overtime; this calculator uses the federal weekly standard.",
    };
  },
  tests: [
    { name: "$20/hr, 40 reg + 8 OT @ 1.5×", inputs: { hourly: 20, regular_hours: 40, ot_hours: 8, ot_mult: "1.5" }, expected: { total: "$1,040.00" } },
    { name: "$25/hr, no OT", inputs: { hourly: 25, regular_hours: 40, ot_hours: 0, ot_mult: "1.5" }, expected: { total: "$1,000.00" } },
  ],
};

/* ----------- Sales tax / VAT / GST (manual rate) ------------------ */
export const salesTaxVatGst: CalculatorDefinition = {
  slug: "sales-tax-vat-gst",
  name: "Sales Tax / VAT / GST",
  description: "Add or remove sales tax, VAT, or GST from a price using any rate.",
  category: "taxes",
  keywords: ["sales tax", "vat", "gst", "tax inclusive", "tax exclusive", "consumption tax"],
  status: "live",
  part: 3,
  inputs: [
    { name: "amount", label: "Amount", type: "number", default: 100, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Tax rate", type: "number", default: 8.25, min: 0, step: "any", unit: "%",
      help: "Examples: US state sales tax ~0-10%, UK VAT 20%, Australia GST 10%, EU VAT ~17-27%." },
    { name: "mode", label: "Mode", type: "select", default: "add",
      options: [
        { label: "Add tax to a tax-exclusive price", value: "add" },
        { label: "Extract tax from a tax-inclusive price", value: "extract" },
      ] },
  ],
  related: ["income-tax-us-2024", "wage-conversion", "capital-gains"],
  calculate: (raw) => {
    const amt = toNum(raw.amount);
    const rate = toNum(raw.rate) / 100;
    const mode = String(raw.mode ?? "add");
    let base: number, tax: number, total: number;
    if (mode === "add") {
      base = amt;
      tax = amt * rate;
      total = amt + tax;
    } else {
      total = amt;
      base = rate === 0 ? amt : amt / (1 + rate);
      tax = amt - base;
    }
    return {
      rows: [
        { key: "base", label: "Price (ex-tax)", value: fmtUSD(base), emphasis: mode === "add" ? "normal" : "primary" },
        { key: "tax", label: "Tax", value: fmtUSD(tax) },
        { key: "total", label: "Total (inc-tax)", value: fmtUSD(total), emphasis: mode === "add" ? "primary" : "normal" },
      ],
      summary: `Tax = base × rate. Tax-inclusive extraction: base = total ÷ (1 + rate). User-supplied rate — no automatic jurisdiction detection.`,
    };
  },
  tests: [
    { name: "Add 8.25% to $100", inputs: { amount: 100, rate: 8.25, mode: "add" }, expected: { total: "$108.25" } },
    { name: "Extract 20% VAT from $120", inputs: { amount: 120, rate: 20, mode: "extract" }, expected: { base: "$100.00" } },
    { name: "Extract 10% GST from $110", inputs: { amount: 110, rate: 10, mode: "extract" }, expected: { tax: "$10.00" } },
  ],
};

/* ---------------- US Federal Income Tax 2024 ---------------------- */
// Source: IRS Rev. Proc. 2023-34, federal income tax brackets for tax year 2024.
// Standard deductions: single $14,600; MFJ $29,200; HoH $21,900.
// These are PUBLIC, VERIFIABLE figures — not invented.
interface Bracket { upTo: number; rate: number; }
const US_2024_BRACKETS: Record<string, { stdDeduction: number; brackets: Bracket[] }> = {
  single: {
    stdDeduction: 14600,
    brackets: [
      { upTo: 11600, rate: 0.10 },
      { upTo: 47150, rate: 0.12 },
      { upTo: 100525, rate: 0.22 },
      { upTo: 191950, rate: 0.24 },
      { upTo: 243725, rate: 0.32 },
      { upTo: 609350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
  mfj: { // Married filing jointly
    stdDeduction: 29200,
    brackets: [
      { upTo: 23200, rate: 0.10 },
      { upTo: 94300, rate: 0.12 },
      { upTo: 201050, rate: 0.22 },
      { upTo: 383900, rate: 0.24 },
      { upTo: 487450, rate: 0.32 },
      { upTo: 731200, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
  hoh: { // Head of household
    stdDeduction: 21900,
    brackets: [
      { upTo: 16550, rate: 0.10 },
      { upTo: 63100, rate: 0.12 },
      { upTo: 100500, rate: 0.22 },
      { upTo: 191950, rate: 0.24 },
      { upTo: 243700, rate: 0.32 },
      { upTo: 609350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
};

function calcUsFederalTax(taxableIncome: number, filingStatus: string): number {
  const table = US_2024_BRACKETS[filingStatus] ?? US_2024_BRACKETS.single;
  let tax = 0;
  let prev = 0;
  for (const b of table.brackets) {
    if (taxableIncome > prev) {
      const slice = Math.min(taxableIncome, b.upTo) - prev;
      tax += slice * b.rate;
      prev = b.upTo;
    } else break;
  }
  return tax;
}

export const incomeTaxUS2024: CalculatorDefinition = {
  slug: "income-tax-us-2024",
  name: "US Federal Income Tax 2024",
  description: "Estimate US federal income tax for tax year 2024 using official IRS brackets.",
  category: "taxes",
  keywords: ["income tax", "federal", "us", "usa", "irs", "2024", "tax brackets"],
  status: "live",
  part: 3,
  inputs: [
    { name: "income", label: "Gross annual income (wages)", type: "number", default: 75000, min: 0, step: "any", unit: "$" },
    { name: "status", label: "Filing status", type: "select", default: "single",
      options: [
        { label: "Single", value: "single" },
        { label: "Married filing jointly", value: "mfj" },
        { label: "Head of household", value: "hoh" },
      ] },
    { name: "deductions", label: "Additional deductions (above standard)", type: "number", default: 0, min: 0, step: "any", unit: "$",
      help: "Itemized deductions above the standard. Most filers take the standard." },
  ],
  related: ["salary-take-home", "wage-conversion", "capital-gains", "sales-tax-vat-gst"],
  calculate: (raw) => {
    const income = toNum(raw.income);
    const status = String(raw.status ?? "single");
    const extraDeductions = toNum(raw.deductions);
    const table = US_2024_BRACKETS[status] ?? US_2024_BRACKETS.single;
    const stdDeduction = table.stdDeduction;
    const totalDeductions = stdDeduction + extraDeductions;
    const taxableIncome = Math.max(0, income - totalDeductions);
    const federalTax = calcUsFederalTax(taxableIncome, status);
    const effectiveRate = income > 0 ? (federalTax / income) * 100 : 0;
    const marginalRate = (() => {
      for (const b of table.brackets) {
        if (taxableIncome <= b.upTo) return b.rate * 100;
      }
      return 37;
    })();
    return {
      rows: [
        { key: "federal_tax", label: "Estimated federal income tax", value: fmtUSD(federalTax), emphasis: "primary" },
        { key: "after_tax", label: "After-tax income", value: fmtUSD(income - federalTax), emphasis: "primary" },
        { key: "effective", label: "Effective tax rate", value: `${fmt(effectiveRate, 2)}%` },
        { key: "marginal", label: "Marginal tax bracket", value: `${fmt(marginalRate, 0)}%` },
      ],
      sections: [{
        title: "Calculation detail",
        rows: [
          { key: "std_ded", label: "Standard deduction", value: fmtUSD(stdDeduction) },
          { key: "extra_ded", label: "Additional deductions", value: fmtUSD(extraDeductions) },
          { key: "taxable", label: "Taxable income", value: fmtUSD(taxableIncome) },
        ],
      }],
      summary: "US federal income tax for tax year 2024 (returns filed in 2025). Brackets: IRS Rev. Proc. 2023-34. ESTIMATE ONLY — does not include credits (CTC, EITC), state tax, FICA, or AMT. Not tax advice.",
    };
  },
  tests: [
    { name: "Single, $75,000 income", inputs: { income: 75000, status: "single", deductions: 0 }, expected: { federal_tax: "$8,341.00" }, tolerance: 0.5 },
    { name: "MFJ, $100,000 income", inputs: { income: 100000, status: "mfj", deductions: 0 }, expected: { federal_tax: "$8,032.00" }, tolerance: 0.5 },
    { name: "Single, $30,000 income (low)", inputs: { income: 30000, status: "single", deductions: 0 }, expected: { federal_tax: "$1,616.00" }, tolerance: 0.5 },
  ],
};

/* ---------------- Salary take-home (US, simplified) --------------- */
export const salaryTakeHome: CalculatorDefinition = {
  slug: "salary-take-home",
  name: "Salary Take-Home Pay (US, simplified)",
  description: "Estimate US take-home pay after federal income tax, FICA, and state tax.",
  category: "taxes",
  keywords: ["take home", "net pay", "paycheck", "salary", "fica", "social security", "medicare"],
  status: "live",
  part: 3,
  inputs: [
    { name: "salary", label: "Gross annual salary", type: "number", default: 75000, min: 0, step: "any", unit: "$" },
    { name: "status", label: "Filing status", type: "select", default: "single",
      options: [
        { label: "Single", value: "single" },
        { label: "Married filing jointly", value: "mfj" },
        { label: "Head of household", value: "hoh" },
      ] },
    { name: "state_rate", label: "State income tax rate (avg)", type: "number", default: 4, min: 0, step: "any", unit: "%",
      help: "Average across US states: ~0% (TX/FL/WA) to ~13% (CA). Use 0 for no state tax." },
    { name: "pre_tax", label: "Pre-tax deductions (401k, HSA, etc.)", type: "number", default: 5000, min: 0, step: "any", unit: "$" },
  ],
  related: ["income-tax-us-2024", "wage-conversion", "overtime"],
  calculate: (raw) => {
    const salary = toNum(raw.salary);
    const status = String(raw.status ?? "single");
    const stateRate = toNum(raw.state_rate) / 100;
    const preTax = toNum(raw.pre_tax);
    // FICA: Social Security 6.2% up to wage base ($168,600 in 2024) + Medicare 1.45% (no cap)
    const SS_RATE = 0.062;
    const SS_WAGE_BASE_2024 = 168600;
    const MEDICARE_RATE = 0.0145;
    const ssWages = Math.min(salary, SS_WAGE_BASE_2024);
    const ssTax = ssWages * SS_RATE;
    const medicareTax = salary * MEDICARE_RATE;
    const fica = ssTax + medicareTax;
    // Federal income tax on (salary − pre-tax) using 2024 brackets
    const federalTaxable = Math.max(0, salary - preTax);
    const federalTax = calcUsFederalTaxLessStd(federalTaxable, status);
    const stateTax = federalTaxable * stateRate;
    const totalTax = federalTax + fica + stateTax;
    const takeHome = salary - totalTax - preTax;
    const monthly = takeHome / 12;
    return {
      rows: [
        { key: "take_home", label: "Annual take-home pay", value: fmtUSD(takeHome), emphasis: "primary" },
        { key: "monthly", label: "Monthly take-home", value: fmtUSD(monthly), emphasis: "primary" },
        { key: "total_tax", label: "Total taxes + pre-tax", value: fmtUSD(totalTax + preTax) },
      ],
      sections: [{
        title: "Tax breakdown",
        rows: [
          { key: "federal", label: "Federal income tax (2024)", value: fmtUSD(federalTax) },
          { key: "ss", label: "Social Security (6.2%)", value: fmtUSD(ssTax) },
          { key: "medicare", label: "Medicare (1.45%)", value: fmtUSD(medicareTax) },
          { key: "state", label: `State tax (${(stateRate * 100).toFixed(2)}%)`, value: fmtUSD(stateTax) },
          { key: "pre_tax", label: "Pre-tax deductions", value: fmtUSD(preTax) },
        ],
      }],
      summary: "US 2024 simplified estimate. FICA: SS 6.2% to $168,600 wage base + Medicare 1.45%. Federal uses 2024 IRS brackets. State uses your flat input rate. Not tax advice — actual paychecks vary with benefits, additional Medicare tax, local taxes, and credits.",
    };
  },
  tests: [
    { name: "$75k single, 4% state, $5k pre-tax", inputs: { salary: 75000, status: "single", state_rate: 4, pre_tax: 5000 }, expected: { take_home: "$54,221.50" }, tolerance: 5 },
  ],
};

// Federal income tax with std deduction already applied to (salary - pre-tax)
function calcUsFederalTaxLessStd(incomeAfterPreTax: number, status: string): number {
  const table = US_2024_BRACKETS[status] ?? US_2024_BRACKETS.single;
  const taxableIncome = Math.max(0, incomeAfterPreTax - table.stdDeduction);
  return calcUsFederalTax(taxableIncome, status);
}

/* ----------------------- Capital gains ---------------------------- */
export const capitalGains: CalculatorDefinition = {
  slug: "capital-gains",
  name: "Capital Gains Tax (US 2024)",
  description: "Estimate US long-term capital gains tax using 2024 LTCG brackets.",
  category: "taxes",
  keywords: ["capital gains", "long term", "short term", "ltcg", "stock", "investment tax"],
  status: "live",
  part: 3,
  inputs: [
    { name: "cost_basis", label: "Cost basis (purchase price)", type: "number", default: 10000, min: 0, step: "any", unit: "$" },
    { name: "sale_price", label: "Sale price", type: "number", default: 15000, min: 0, step: "any", unit: "$" },
    { name: "holding_years", label: "Holding period", type: "number", default: 2, min: 0, step: "any", unit: "yrs" },
    { name: "status", label: "Filing status", type: "select", default: "single",
      options: [
        { label: "Single", value: "single" },
        { label: "Married filing jointly", value: "mfj" },
        { label: "Head of household", value: "hoh" },
      ] },
    { name: "ordinary_income", label: "Other ordinary income", type: "number", default: 75000, min: 0, step: "any", unit: "$",
      help: "LTCG brackets stack on top of ordinary income." },
  ],
  related: ["income-tax-us-2024", "salary-take-home"],
  calculate: (raw) => {
    const cost = toNum(raw.cost_basis);
    const sale = toNum(raw.sale_price);
    const holding = toNum(raw.holding_years);
    const status = String(raw.status ?? "single");
    const ordinaryIncome = toNum(raw.ordinary_income);
    const gain = sale - cost;
    if (gain <= 0) {
      return {
        rows: [
          { key: "gain", label: "Capital gain (loss)", value: fmtUSD(gain), emphasis: "warning" },
          { key: "tax", label: "Tax owed", value: "$0.00", hint: "Capital losses can offset other gains, plus up to $3,000 of ordinary income per year." },
        ],
      };
    }
    const isLongTerm = holding >= 1;
    if (!isLongTerm) {
      // Short-term: taxed as ordinary income
      // Add gain to ordinary income and compute federal tax delta
      const taxWithout = calcUsFederalTaxLessStd(ordinaryIncome, status);
      const taxWith = calcUsFederalTaxLessStd(ordinaryIncome + gain, status);
      const tax = taxWith - taxWithout;
      return {
        rows: [
          { key: "gain", label: "Capital gain (short-term)", value: fmtUSD(gain), emphasis: "primary" },
          { key: "tax", label: "Estimated federal tax", value: fmtUSD(tax), emphasis: "primary" },
          { key: "after", label: "After-tax gain", value: fmtUSD(gain - tax) },
        ],
        summary: "Short-term (held ≤ 1 year): taxed as ordinary income at your marginal rate.",
      };
    }
    // Long-term: 2024 LTCG brackets (0% / 15% / 20%)
    // 0%: taxable income ≤ $47,025 (single), ≤ $94,050 (MFJ), ≤ $63,000 (HoH)
    // 15%: up to $518,900 (single), $583,750 (MFJ), $551,350 (HoH)
    // 20%: above
    const table = US_2024_BRACKETS[status] ?? US_2024_BRACKETS.single;
    const stdDed = table.stdDeduction;
    const taxableOrdinary = Math.max(0, ordinaryIncome - stdDed);
    const totalTaxable = taxableOrdinary + gain;
    const thresholds: Record<string, [number, number]> = {
      single: [47025, 518900],
      mfj: [94050, 583750],
      hoh: [63000, 551350],
    };
    const [t15, t20] = thresholds[status] ?? thresholds.single;
    let tax = 0;
    // 0% bracket: from taxableOrdinary to min(totalTaxable, t15)
    const zeroBand = Math.max(0, Math.min(totalTaxable, t15) - taxableOrdinary);
    // 15% bracket
    const fifteenBand = Math.max(0, Math.min(totalTaxable, t20) - Math.max(taxableOrdinary, t15));
    // 20% bracket
    const twentyBand = Math.max(0, totalTaxable - Math.max(taxableOrdinary, t20));
    tax = zeroBand * 0 + fifteenBand * 0.15 + twentyBand * 0.20;
    return {
      rows: [
        { key: "gain", label: "Capital gain (long-term)", value: fmtUSD(gain), emphasis: "primary" },
        { key: "tax", label: "Estimated federal LTCG tax", value: fmtUSD(tax), emphasis: "primary" },
        { key: "after", label: "After-tax gain", value: fmtUSD(gain - tax) },
      ],
      sections: [{
        title: "Brackets used (2024 LTCG)",
        rows: [
          { key: "b0", label: "0% band", value: fmtUSD(zeroBand) },
          { key: "b15", label: "15% band", value: fmtUSD(fifteenBand) },
          { key: "b20", label: "20% band", value: fmtUSD(twentyBand) },
        ],
      }],
      summary: "Long-term (held > 1 year): 0% / 15% / 20% brackets stack on top of ordinary income. Does NOT include the 3.8% Net Investment Income Tax (NIIT) for high earners. ESTIMATE ONLY — not tax advice.",
    };
  },
  tests: [
    { name: "Long-term $5k gain, $75k ordinary, single", inputs: { cost_basis: 10000, sale_price: 15000, holding_years: 2, status: "single", ordinary_income: 75000 }, expected: { tax: "$750.00" } },
    { name: "Short-term $5k gain, $75k ordinary, single", inputs: { cost_basis: 10000, sale_price: 15000, holding_years: 0.5, status: "single", ordinary_income: 75000 }, expected: { tax: "$1,100.00" }, tolerance: 5 },
    { name: "Loss — no tax", inputs: { cost_basis: 10000, sale_price: 8000, holding_years: 2, status: "single", ordinary_income: 75000 }, expected: { gain: "-$2,000.00" } },
  ],
};

/* --------------------- Zakat calculator --------------------------- */
export const zakat: CalculatorDefinition = {
  slug: "zakat",
  name: "Zakat Calculator",
  description: "Calculate annual Zakat (2.5% of qualifying wealth above the Nisab threshold).",
  category: "taxes",
  keywords: ["zakat", "islamic", "charity", "nisab", "muslim", "2.5%"],
  status: "live",
  part: 3,
  inputs: [
    { name: "cash", label: "Cash & bank balances", type: "number", default: 10000, min: 0, step: "any", unit: "$" },
    { name: "gold_value", label: "Gold value", type: "number", default: 5000, min: 0, step: "any", unit: "$" },
    { name: "silver_value", label: "Silver value", type: "number", default: 0, min: 0, step: "any", unit: "$" },
    { name: "investments", label: "Investments & stocks", type: "number", default: 8000, min: 0, step: "any", unit: "$" },
    { name: "debts", label: "Outstanding debts owed by you", type: "number", default: 2000, min: 0, step: "any", unit: "$" },
    { name: "nisab", label: "Nisab threshold (silver standard)", type: "number", default: 612, min: 0, step: "any", unit: "$",
      help: "Nisab is traditionally based on 85g of gold OR 595g of silver. Many scholars use the silver standard (lower threshold = more charitable). Use the value current on your calculation date." },
  ],
  related: ["sales-tax-vat-gst", "income-tax-us-2024"],
  calculate: (raw) => {
    const cash = toNum(raw.cash);
    const gold = toNum(raw.gold_value);
    const silver = toNum(raw.silver_value);
    const inv = toNum(raw.investments);
    const debts = toNum(raw.debts);
    const nisab = toNum(raw.nisab);
    const totalAssets = cash + gold + silver + inv;
    const zakatableWealth = Math.max(0, totalAssets - debts);
    if (zakatableWealth < nisab) {
      return {
        rows: [
          { key: "zakat_due", label: "Zakat due", value: "$0.00", emphasis: "success" },
          { key: "zakatable", label: "Zakatable wealth", value: fmtUSD(zakatableWealth) },
          { key: "nisab", label: "Nisab threshold", value: fmtUSD(nisab) },
          { key: " shortfall", label: "Below Nisab by", value: fmtUSD(nisab - zakatableWealth), hint: "Zakat is not due until wealth meets or exceeds the Nisab." },
        ],
        summary: "Zakat is 2.5% of qualifying wealth held for one lunar year, due only when wealth exceeds the Nisab threshold.",
      };
    }
    const zakat = zakatableWealth * 0.025;
    return {
      rows: [
        { key: "zakat_due", label: "Zakat due (2.5%)", value: fmtUSD(zakat), emphasis: "primary" },
        { key: "zakatable", label: "Zakatable wealth", value: fmtUSD(zakatableWealth), emphasis: "primary" },
        { key: "nisab", label: "Nisab threshold", value: fmtUSD(nisab) },
        { key: "above", label: "Above Nisab by", value: fmtUSD(zakatableWealth - nisab) },
      ],
      sections: [{
        title: "Asset breakdown",
        rows: [
          { key: "cash", label: "Cash", value: fmtUSD(cash) },
          { key: "gold", label: "Gold", value: fmtUSD(gold) },
          { key: "silver", label: "Silver", value: fmtUSD(silver) },
          { key: "inv", label: "Investments", value: fmtUSD(inv) },
          { key: "debts", label: "Less: debts", value: `(${fmtUSD(debts)})` },
        ],
      }],
      summary: "Zakat = 2.5% × (cash + gold + silver + investments − debts owed). The Nisab is user-supplied — please verify the current silver price × 595g (or gold × 85g) for your region. This is a simplified calculation; consult a scholar for specific situations.",
    };
  },
  tests: [
    { name: "$21k wealth, $612 nisab", inputs: { cash: 10000, gold_value: 5000, silver_value: 0, investments: 8000, debts: 2000, nisab: 612 }, expected: { zakat_due: "$525.00" } },
    { name: "Below Nisab → no Zakat", inputs: { cash: 500, gold_value: 0, silver_value: 0, investments: 0, debts: 0, nisab: 612 }, expected: { zakat_due: "$0.00" } },
  ],
};
