/**
 * Business and Accounting — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum, round } from "../_format";

/* ----------------- Profit margin & markup ------------------------- */
export const marginMarkup: CalculatorDefinition = {
  slug: "margin-markup",
  name: "Profit Margin & Markup",
  description: "Convert between gross margin and markup, given revenue and cost.",
  category: "business",
  keywords: ["margin", "markup", "gross profit", "profit", "pricing"],
  status: "live",
  part: 3,
  inputs: [
    { name: "revenue", label: "Selling price (revenue)", type: "number", default: 100, min: 0, step: "any", unit: "$" },
    { name: "cost", label: "Cost of goods sold (COGS)", type: "number", default: 60, min: 0, step: "any", unit: "$" },
  ],
  related: ["breakeven", "roi-payback", "discount-commission"],
  calculate: (raw) => {
    const revenue = toNum(raw.revenue);
    const cost = toNum(raw.cost);
    if (revenue <= 0) {
      return { rows: [{ key: "profit", label: "Gross profit", value: "—" }] };
    }
    const profit = revenue - cost;
    const margin = (profit / revenue) * 100;
    const markup = cost > 0 ? (profit / cost) * 100 : NaN;
    return {
      rows: [
        { key: "profit", label: "Gross profit", value: fmtUSD(profit), emphasis: "primary" },
        { key: "margin", label: "Profit margin (profit / revenue)", value: `${fmt(margin, 2)}%`, emphasis: "primary" },
        { key: "markup", label: "Markup (profit / cost)", value: cost > 0 ? `${fmt(markup, 2)}%` : "—", hint: "Markup is the % added to cost to reach selling price." },
      ],
      sections: [{
        title: "Reverse calculation",
        rows: [
          { key: "rev_from_margin", label: "To get 30% margin on $60 cost", value: fmtUSD(60 / (1 - 0.30)) },
          { key: "rev_from_markup", label: "To get 30% markup on $60 cost", value: fmtUSD(60 * 1.30) },
        ],
      }],
      summary: "Margin = profit ÷ revenue. Markup = profit ÷ cost. A 50% markup only yields a 33% margin — they are NOT the same.",
    };
  },
  tests: [
    { name: "$100 rev, $60 cost", inputs: { revenue: 100, cost: 60 }, expected: { margin: "40%", markup: "66.67%" } },
    { name: "0% margin (cost = revenue)", inputs: { revenue: 100, cost: 100 }, expected: { margin: "0%" } },
  ],
};

/* --------------------- Break-even point --------------------------- */
export const breakeven: CalculatorDefinition = {
  slug: "breakeven",
  name: "Break-Even Analysis",
  description: "Units to sell to cover fixed costs, given price and per-unit variable cost.",
  category: "business",
  keywords: ["breakeven", "break even", "fixed cost", "variable cost", "units"],
  status: "live",
  part: 3,
  inputs: [
    { name: "fixed", label: "Total fixed costs", type: "number", default: 10000, min: 0, step: "any", unit: "$" },
    { name: "price", label: "Selling price per unit", type: "number", default: 50, min: 0, step: "any", unit: "$" },
    { name: "variable", label: "Variable cost per unit", type: "number", default: 30, min: 0, step: "any", unit: "$" },
  ],
  related: ["margin-markup", "roi-payback", "unit-economics"],
  calculate: (raw) => {
    const fixed = toNum(raw.fixed);
    const price = toNum(raw.price);
    const variable = toNum(raw.variable);
    const contribution = price - variable;
    if (contribution <= 0) {
      return { rows: [{ key: "units", label: "Break-even units", value: "—", hint: "Price must exceed variable cost.", emphasis: "warning" }] };
    }
    const units = fixed / contribution;
    const revenue = units * price;
    const series: { label: string; value: number }[] = [];
    const maxUnits = Math.ceil(units * 1.5);
    for (let u = 0; u <= maxUnits; u += Math.max(1, Math.floor(maxUnits / 10))) {
      const profit = u * contribution - fixed;
      series.push({ label: `${u} units`, value: round(profit, 2) });
    }
    return {
      rows: [
        { key: "units", label: "Break-even units", value: fmt(units, 2), emphasis: "primary" },
        { key: "revenue", label: "Break-even revenue", value: fmtUSD(revenue), emphasis: "primary" },
        { key: "contribution", label: "Contribution margin per unit", value: fmtUSD(contribution) },
      ],
      chart: { type: "line", title: "Profit vs units sold", series },
      summary: "Break-even = fixed costs ÷ (price − variable cost). Each unit sold contributes (price − variable) toward covering fixed costs.",
    };
  },
  tests: [
    { name: "$10k fixed, $50 price, $30 var → 500 units", inputs: { fixed: 10000, price: 50, variable: 30 }, expected: { units: "500" } },
    { name: "Price < variable → can't break even", inputs: { fixed: 10000, price: 20, variable: 30 }, expected: { units: "—" } },
  ],
};

/* ----------------- ROI & payback period --------------------------- */
export const roiPayback: CalculatorDefinition = {
  slug: "roi-payback",
  name: "ROI & Payback Period",
  description: "Return on investment (ROI), annualized ROI, and simple payback period.",
  category: "business",
  keywords: ["roi", "return on investment", "payback", "annualized", "investment"],
  status: "live",
  part: 3,
  inputs: [
    { name: "initial", label: "Initial investment", type: "number", default: 10000, min: 0, step: "any", unit: "$" },
    { name: "final", label: "Final value (or total return)", type: "number", default: 15000, min: 0, step: "any", unit: "$" },
    { name: "years", label: "Holding period", type: "number", default: 3, min: 0.01, step: "any", unit: "yrs" },
  ],
  related: ["margin-markup", "breakeven", "compound-interest"],
  calculate: (raw) => {
    const initial = toNum(raw.initial);
    const final = toNum(raw.final);
    const years = Math.max(0.01, toNum(raw.years));
    if (initial <= 0) {
      return { rows: [{ key: "roi", label: "ROI", value: "—" }] };
    }
    const gain = final - initial;
    const roi = (gain / initial) * 100;
    const annualizedRoi = (Math.pow(final / initial, 1 / years) - 1) * 100;
    const paybackYears = gain > 0 ? initial / (gain / years) : Infinity;
    return {
      rows: [
        { key: "gain", label: "Total gain", value: fmtUSD(gain), emphasis: gain >= 0 ? "success" : "warning" },
        { key: "roi", label: "ROI (total)", value: `${fmt(roi, 2)}%`, emphasis: "primary" },
        { key: "annual_roi", label: "Annualized ROI", value: `${fmt(annualizedRoi, 2)}%`, emphasis: "primary" },
        { key: "payback", label: "Payback period", value: Number.isFinite(paybackYears) ? `${fmt(paybackYears, 2)} years` : "Never", hint: "Time for cumulative returns to equal the initial investment." },
      ],
      summary: "ROI = (final − initial) ÷ initial. Annualized ROI = (final/initial)^(1/years) − 1. Payback = initial ÷ (annual gain).",
    };
  },
  tests: [
    { name: "$10k → $15k in 3y", inputs: { initial: 10000, final: 15000, years: 3 }, expected: { roi: "50%" } },
    { name: "Annualized ROI", inputs: { initial: 10000, final: 15000, years: 3 }, expected: { annual_roi: "14.47%" } },
    { name: "Loss", inputs: { initial: 10000, final: 8000, years: 2 }, expected: { roi: "-20%" } },
  ],
};

/* ------------------- Depreciation (3 methods) --------------------- */
export const depreciation: CalculatorDefinition = {
  slug: "depreciation",
  name: "Depreciation Calculator",
  description: "Compute annual depreciation using straight-line, declining-balance, or units-of-production.",
  category: "business",
  keywords: ["depreciation", "straight line", "declining balance", "units of production", "asset"],
  status: "live",
  part: 3,
  inputs: [
    { name: "cost", label: "Asset cost", type: "number", default: 50000, min: 0, step: "any", unit: "$" },
    { name: "salvage", label: "Salvage value", type: "number", default: 5000, min: 0, step: "any", unit: "$" },
    { name: "life", label: "Useful life (years)", type: "number", default: 5, min: 1, step: 1, unit: "yrs" },
    { name: "method", label: "Method", type: "select", default: "straight",
      options: [
        { label: "Straight-line", value: "straight" },
        { label: "Double-declining balance", value: "ddb" },
        { label: "Units of production (use total_units)", value: "uop" },
      ] },
    { name: "total_units", label: "Total units (for UoP method)", type: "number", default: 100000, min: 0, step: 1,
      help: "Only used for units-of-production method." },
    { name: "actual_units", label: "Units produced this year (for UoP)", type: "number", default: 20000, min: 0, step: 1 },
  ],
  related: ["margin-markup", "breakeven", "roi-payback"],
  calculate: (raw) => {
    const cost = toNum(raw.cost);
    const salvage = toNum(raw.salvage);
    const life = Math.max(1, Math.round(toNum(raw.life)));
    const method = String(raw.method ?? "straight");
    const totalUnits = toNum(raw.total_units);
    const actualUnits = toNum(raw.actual_units);
    const depreciableBase = Math.max(0, cost - salvage);
    const series: { label: string; value: number }[] = [];
    if (method === "straight") {
      const annual = depreciableBase / life;
      let acc = 0;
      for (let y = 1; y <= life; y++) {
        acc += annual;
        series.push({ label: `Year ${y}`, value: round(annual, 2) });
      }
      return {
        rows: [
          { key: "annual", label: "Annual depreciation", value: fmtUSD(annual), emphasis: "primary" },
          { key: "total", label: "Total depreciation", value: fmtUSD(depreciableBase) },
        ],
        chart: { type: "bar", title: "Annual depreciation", series },
        summary: "Straight-line: (cost − salvage) ÷ useful life. Same expense every year — simplest and most common method.",
      };
    }
    if (method === "ddb") {
      // Double-declining balance: 2 × straight-line rate × book value (no salvage in early years)
      const rate = 2 / life;
      let book = cost;
      let acc = 0;
      for (let y = 1; y <= life; y++) {
        let dep = book * rate;
        // Don't depreciate below salvage
        if (book - dep < salvage) dep = book - salvage;
        if (dep < 0) dep = 0;
        book -= dep;
        acc += dep;
        series.push({ label: `Year ${y}`, value: round(dep, 2) });
      }
      return {
        rows: [
          { key: "y1", label: "Year 1 depreciation", value: fmtUSD(series[0]?.value ?? 0), emphasis: "primary" },
          { key: "total", label: "Total depreciation", value: fmtUSD(acc) },
          { key: "ending_book", label: "Ending book value", value: fmtUSD(book) },
        ],
        chart: { type: "bar", title: "Annual depreciation (DDB)", series },
        summary: "Double-declining balance: 2× straight-line rate × current book value. Front-loads depreciation — larger expenses early, smaller later.",
      };
    }
    // Units of production
    if (totalUnits <= 0) {
      return { rows: [{ key: "annual", label: "Depreciation per unit", value: "—" }] };
    }
    const perUnit = depreciableBase / totalUnits;
    const yearDep = perUnit * actualUnits;
    return {
      rows: [
        { key: "per_unit", label: "Depreciation per unit", value: fmtUSD(perUnit), emphasis: "primary" },
        { key: "year_dep", label: `This year (${fmt(actualUnits, 0)} units)`, value: fmtUSD(yearDep), emphasis: "primary" },
        { key: "total", label: "Total depreciable base", value: fmtUSD(depreciableBase) },
      ],
      summary: "Units-of-production: (cost − salvage) ÷ total expected units × actual units this period. Best for machinery whose wear tracks usage rather than time.",
    };
  },
  tests: [
    { name: "Straight-line: $50k cost, $5k salvage, 5y", inputs: { cost: 50000, salvage: 5000, life: 5, method: "straight", total_units: 100000, actual_units: 20000 }, expected: { annual: "$9,000.00" } },
    { name: "DDB Year 1: 2/5 × $50k = $20k", inputs: { cost: 50000, salvage: 5000, life: 5, method: "ddb", total_units: 100000, actual_units: 20000 }, expected: { y1: "$20,000.00" } },
    { name: "UoP: $45k / 100k units × 20k = $9k", inputs: { cost: 50000, salvage: 5000, life: 5, method: "uop", total_units: 100000, actual_units: 20000 }, expected: { year_dep: "$9,000.00" } },
  ],
};

/* ------------------ Inventory turnover ---------------------------- */
export const inventoryTurnover: CalculatorDefinition = {
  slug: "inventory-turnover",
  name: "Inventory Turnover Ratio",
  description: "How many times a business sells and replaces its inventory in a period.",
  category: "business",
  keywords: ["inventory", "turnover", "days sales", "efficiency", "ratio"],
  status: "live",
  part: 3,
  inputs: [
    { name: "cogs", label: "Cost of goods sold (COGS)", type: "number", default: 600000, min: 0, step: "any", unit: "$" },
    { name: "begin_inv", label: "Beginning inventory", type: "number", default: 80000, min: 0, step: "any", unit: "$" },
    { name: "end_inv", label: "Ending inventory", type: "number", default: 100000, min: 0, step: "any", unit: "$" },
  ],
  related: ["margin-markup", "breakeven", "unit-economics"],
  calculate: (raw) => {
    const cogs = toNum(raw.cogs);
    const begin = toNum(raw.begin_inv);
    const end = toNum(raw.end_inv);
    const avgInv = (begin + end) / 2;
    if (avgInv <= 0) {
      return { rows: [{ key: "turnover", label: "Turnover ratio", value: "—" }] };
    }
    const turnover = cogs / avgInv;
    const daysSales = (365 / turnover);
    return {
      rows: [
        { key: "turnover", label: "Inventory turnover (×)", value: `${fmt(turnover, 2)}×`, emphasis: "primary" },
        { key: "days", label: "Days sales in inventory", value: `${fmt(daysSales, 1)} days`, emphasis: "primary" },
        { key: "avg_inv", label: "Average inventory", value: fmtUSD(avgInv) },
      ],
      summary: "Turnover = COGS ÷ average inventory. Higher = sells faster. Days sales = 365 ÷ turnover. Industry norms vary widely (grocery ~15×, fashion ~6×).",
    };
  },
  tests: [
    { name: "$600k COGS, avg inv $90k", inputs: { cogs: 600000, begin_inv: 80000, end_inv: 100000 }, expected: { turnover: "6.67×" } },
    { name: "Days sales for 6.67× turnover", inputs: { cogs: 600000, begin_inv: 80000, end_inv: 100000 }, expected: { days: "54.8 days" } },
  ],
};

/* ------------------- Cash flow / budgeting ------------------------ */
export const cashFlow: CalculatorDefinition = {
  slug: "cash-flow",
  name: "Monthly Cash Flow Budget",
  description: "Compute monthly net cash flow from itemized income and expenses.",
  category: "business",
  keywords: ["cash flow", "budget", "income", "expenses", "personal finance"],
  status: "live",
  part: 3,
  inputs: [
    { name: "income_items", label: "Income (one per line, format: <label> <amount>)", type: "textarea",
      default: "Salary 5000\nSide business 800\nInvestments 200",
      placeholder: "label amount\ne.g. Salary 5000" },
    { name: "expense_items", label: "Expenses (one per line, format: <label> <amount>)", type: "textarea",
      default: "Rent 1500\nGroceries 600\nUtilities 250\nTransport 200\nInsurance 180\nEntertainment 200",
      placeholder: "label amount\ne.g. Rent 1500" },
  ],
  related: ["margin-markup", "savings-goal", "breakeven"],
  calculate: (raw) => {
    function parse(text: unknown): { label: string; amount: number }[] {
      const out: { label: string; amount: number }[] = [];
      for (const line of String(text ?? "").split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
        const parts = line.split(/[\s,;\t]+/).filter(Boolean);
        if (parts.length < 2) continue;
        const amt = toNum(parts[parts.length - 1]);
        const label = parts.slice(0, parts.length - 1).join(" ");
        if (Number.isFinite(amt)) out.push({ label, amount: amt });
      }
      return out;
    }
    const income = parse(raw.income_items);
    const expenses = parse(raw.expense_items);
    const totalIncome = income.reduce((s, x) => s + x.amount, 0);
    const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
    const net = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;
    return {
      rows: [
        { key: "income", label: "Total monthly income", value: fmtUSD(totalIncome), emphasis: "primary" },
        { key: "expenses", label: "Total monthly expenses", value: fmtUSD(totalExpenses), emphasis: "primary" },
        { key: "net", label: "Net cash flow", value: fmtUSD(net), emphasis: net >= 0 ? "success" : "warning" },
        { key: "savings_rate", label: "Savings rate", value: `${fmt(savingsRate, 1)}%` },
      ],
      sections: [
        { title: "Income breakdown", rows: income.map((x, i) => ({ key: `inc_${i}`, label: x.label, value: fmtUSD(x.amount) })) },
        { title: "Expense breakdown", rows: expenses.map((x, i) => ({ key: `exp_${i}`, label: x.label, value: fmtUSD(x.amount) })) },
      ],
      summary: "Net cash flow = income − expenses. A positive savings rate of 10-20% is a common personal-finance target. Emergency funds typically cover 3-6 months of expenses.",
    };
  },
  tests: [
    { name: "Default sample", inputs: { income_items: "Salary 5000\nSide business 800\nInvestments 200", expense_items: "Rent 1500\nGroceries 600\nUtilities 250\nTransport 200\nInsurance 180\nEntertainment 200" }, expected: { net: "$3,070.00" } },
  ],
};

/* -------------------- Discount & commission ----------------------- */
export const discountCommission: CalculatorDefinition = {
  slug: "discount-commission",
  name: "Discount & Commission Calculator",
  description: "Apply multi-tier percentage discounts and compute sales commission.",
  category: "business",
  keywords: ["discount", "commission", "sale", "sales", "percent off", "tiered"],
  status: "live",
  part: 3,
  inputs: [
    { name: "price", label: "Original price", type: "number", default: 200, min: 0, step: "any", unit: "$" },
    { name: "discount", label: "Discount %", type: "number", default: 20, min: 0, max: 100, step: "any", unit: "%" },
    { name: "commission", label: "Sales commission %", type: "number", default: 5, min: 0, step: "any", unit: "%" },
  ],
  related: ["margin-markup", "breakeven", "unit-economics"],
  calculate: (raw) => {
    const price = toNum(raw.price);
    const discount = toNum(raw.discount) / 100;
    const commission = toNum(raw.commission) / 100;
    const discountAmount = price * discount;
    const finalPrice = price - discountAmount;
    const commissionAmount = finalPrice * commission;
    const netToSeller = finalPrice - commissionAmount;
    return {
      rows: [
        { key: "final_price", label: "Final price (after discount)", value: fmtUSD(finalPrice), emphasis: "primary" },
        { key: "discount_amt", label: "Discount amount", value: fmtUSD(discountAmount) },
        { key: "commission_amt", label: "Commission earned", value: fmtUSD(commissionAmount), emphasis: "primary" },
        { key: "net", label: "Net to seller", value: fmtUSD(netToSeller) },
      ],
      summary: "Commission is typically calculated on the post-discount price. Adjust the order if your business pays commission on the original price.",
    };
  },
  tests: [
    { name: "$200, 20% off, 5% commission", inputs: { price: 200, discount: 20, commission: 5 }, expected: { final_price: "$160.00" } },
    { name: "Commission on $160 = $8", inputs: { price: 200, discount: 20, commission: 5 }, expected: { commission_amt: "$8.00" } },
  ],
};

/* --------------------- Unit economics ----------------------------- */
export const unitEconomics: CalculatorDefinition = {
  slug: "unit-economics",
  name: "Unit Economics (CAC / LTV)",
  description: "Compute customer acquisition cost, lifetime value, and LTV:CAC ratio.",
  category: "business",
  keywords: ["unit economics", "cac", "ltv", "ltv:cac", "saas", "startup", "metrics"],
  status: "live",
  part: 3,
  inputs: [
    { name: "cac", label: "Customer acquisition cost (CAC)", type: "number", default: 100, min: 0, step: "any", unit: "$" },
    { name: "arpu", label: "ARPU (monthly revenue per user)", type: "number", default: 30, min: 0, step: "any", unit: "$/mo" },
    { name: "gross_margin", label: "Gross margin", type: "number", default: 70, min: 0, max: 100, step: "any", unit: "%" },
    { name: "churn", label: "Monthly churn rate", type: "number", default: 5, min: 0, max: 100, step: "any", unit: "%" },
  ],
  related: ["breakeven", "inventory-turnover", "roi-payback"],
  calculate: (raw) => {
    const cac = toNum(raw.cac);
    const arpu = toNum(raw.arpu);
    const gm = toNum(raw.gross_margin) / 100;
    const churn = toNum(raw.churn) / 100;
    if (churn <= 0) {
      return { rows: [{ key: "ltv", label: "LTV", value: "—", hint: "Churn must be > 0 for finite LTV." }] };
    }
    // LTV = ARPU × gross_margin ÷ churn (in months)
    const ltvMonths = (arpu * gm) / churn;
    const ltv = ltvMonths * 1; // already in dollars since arpu is monthly
    const ratio = cac > 0 ? ltv / cac : 0;
    const paybackMonths = arpu * gm > 0 ? cac / (arpu * gm) : Infinity;
    return {
      rows: [
        { key: "ltv", label: "Lifetime value (LTV)", value: fmtUSD(ltv), emphasis: "primary" },
        { key: "ratio", label: "LTV : CAC ratio", value: `${fmt(ratio, 2)} : 1`, emphasis: ratio >= 3 ? "success" : "warning" },
        { key: "payback", label: "CAC payback period", value: Number.isFinite(paybackMonths) ? `${fmt(paybackMonths, 1)} months` : "—" },
      ],
      sections: [{
        title: "Inputs",
        rows: [
          { key: "ltv_months", label: "Customer lifetime", value: `${fmt(ltvMonths, 1)} months` },
          { key: "gm_arpu", label: "Gross profit per user / mo", value: fmtUSD(arpu * gm) },
        ],
      }],
      summary: "LTV = ARPU × gross margin ÷ monthly churn. Healthy SaaS rule of thumb: LTV:CAC ≥ 3:1, CAC payback < 12 months.",
    };
  },
  tests: [
    { name: "CAC $100, ARPU $30, 70% GM, 5% churn", inputs: { cac: 100, arpu: 30, gross_margin: 70, churn: 5 }, expected: { ltv: "$420.00" } },
    { name: "Same input → 4.2:1 ratio", inputs: { cac: 100, arpu: 30, gross_margin: 70, churn: 5 }, expected: { ratio: "4.2 : 1" } },
  ],
};
