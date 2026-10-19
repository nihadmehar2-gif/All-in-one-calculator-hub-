/**
 * Real Estate and Property — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum, round } from "../_format";

/* --------------------- Rent vs Buy -------------------------------- */
export const rentVsBuy: CalculatorDefinition = {
  slug: "rent-vs-buy",
  name: "Rent vs Buy Comparison",
  description: "Compare the total cost of renting vs buying a home over a holding period.",
  category: "real-estate",
  keywords: ["rent", "buy", "rent vs buy", "comparison", "home", "mortgage"],
  status: "live",
  part: 3,
  inputs: [
    { name: "home_price", label: "Home price", type: "number", default: 400000, min: 0, step: "any", unit: "$" },
    { name: "down_pct", label: "Down payment (%)", type: "number", default: 20, min: 0, max: 100, step: "any", unit: "%" },
    { name: "rate", label: "Mortgage rate", type: "number", default: 6.5, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Holding period", type: "number", default: 7, min: 1, step: 1, unit: "yrs" },
    { name: "property_tax", label: "Annual property tax", type: "number", default: 4800, min: 0, step: "any", unit: "$" },
    { name: "maintenance", label: "Annual maintenance + insurance", type: "number", default: 3600, min: 0, step: "any", unit: "$" },
    { name: "appreciation", label: "Annual home appreciation", type: "number", default: 3, step: "any", unit: "%" },
    { name: "rent", label: "Monthly rent (comparable)", type: "number", default: 2200, min: 0, step: "any", unit: "$" },
    { name: "rent_growth", label: "Annual rent growth", type: "number", default: 3, step: "any", unit: "%" },
  ],
  related: ["mortgage-affordability", "loan-payment", "rental-yield"],
  calculate: (raw) => {
    const price = toNum(raw.home_price);
    const downPct = toNum(raw.down_pct) / 100;
    const rate = toNum(raw.rate) / 100;
    const years = Math.max(1, Math.round(toNum(raw.years)));
    const propTax = toNum(raw.property_tax);
    const maint = toNum(raw.maintenance);
    const appreciation = toNum(raw.appreciation) / 100;
    const rentStart = toNum(raw.rent);
    const rentGrowth = toNum(raw.rent_growth) / 100;

    // BUY side
    const down = price * downPct;
    const loan = price - down;
    const r = rate / 12;
    const n = 30 * 12; // assume 30y mortgage
    const monthlyPI = r === 0 ? loan / n : loan * r / (1 - Math.pow(1 + r, -n));
    const yearsHeld = years;
    // Total mortgage payments over holding period
    let buyMortgagePaid = 0;
    let buyEquity = 0;
    let bal = loan;
    for (let y = 1; y <= yearsHeld; y++) {
      for (let m = 0; m < 12; m++) {
        const interest = bal * r;
        const principal = monthlyPI - interest;
        bal -= principal;
        buyMortgagePaid += monthlyPI;
        buyEquity += principal;
      }
    }
    const buyPropTax = propTax * yearsHeld;
    const buyMaint = maint * yearsHeld;
    const buyClosingCosts = price * 0.04; // ~4% to buy
    const buySellingCosts = price * Math.pow(1 + appreciation, yearsHeld) * 0.06; // ~6% to sell
    const futureValue = price * Math.pow(1 + appreciation, yearsHeld);
    const buyTotalCosts = down + buyMortgagePaid + buyPropTax + buyMaint + buyClosingCosts + buySellingCosts;
    const buyNetProceeds = futureValue - Math.max(0, bal); // sell home, pay off remaining loan
    const buyNetCost = buyTotalCosts - buyNetProceeds;

    // RENT side
    let rentPaid = 0;
    let curRent = rentStart;
    for (let y = 1; y <= yearsHeld; y++) {
      rentPaid += curRent * 12;
      curRent *= (1 + rentGrowth);
    }
    // Opportunity cost: down payment + closing costs invested instead
    const investPrincipal = down + buyClosingCosts;
    const opportunityCost = investPrincipal * (Math.pow(1.07, yearsHeld) - 1); // assume 7% market return
    const rentTotalCost = rentPaid + opportunityCost;

    const diff = rentTotalCost - buyNetCost;
    const series: { label: string; value: number }[] = [];
    let cumBuy = 0, cumRent = 0;
    let rentC = rentStart;
    let bal2 = loan;
    for (let y = 1; y <= yearsHeld; y++) {
      cumBuy += monthlyPI * 12 + propTax + maint;
      cumRent += rentC * 12;
      rentC *= (1 + rentGrowth);
      for (let m = 0; m < 12; m++) {
        const i = bal2 * r;
        bal2 -= (monthlyPI - i);
      }
      series.push({ label: `Year ${y}`, value: round(cumRent - cumBuy, 2) });
    }

    return {
      rows: [
        { key: "buy_cost", label: `Buy net cost (over ${yearsHeld}y)`, value: fmtUSD(buyNetCost), emphasis: "primary" },
        { key: "rent_cost", label: `Rent total cost (over ${yearsHeld}y)`, value: fmtUSD(rentTotalCost), emphasis: "primary" },
        { key: "winner", label: diff >= 0 ? "Buying saves" : "Renting saves", value: fmtUSD(Math.abs(diff)), emphasis: diff >= 0 ? "success" : "warning" },
      ],
      sections: [{
        title: "Assumptions",
        rows: [
          { key: "mortgage", label: "Mortgage payment (P&I)", value: fmtUSD(monthlyPI) },
          { key: "down", label: "Down payment", value: fmtUSD(down) },
          { key: "future_value", label: "Home value at sale", value: fmtUSD(futureValue) },
          { key: "remaining_loan", label: "Remaining loan at sale", value: fmtUSD(Math.max(0, bal)) },
          { key: "opp_cost", label: "Opportunity cost of down payment", value: fmtUSD(opportunityCost) },
        ],
      }],
      chart: { type: "line", title: "Cumulative rent cost − buy cost (positive = renting costs more)", series },
      summary: "Simplified estimate — assumes 30y mortgage, 4% buying closing costs, 6% selling costs, 7% market return on alternative investment. Real results depend on local taxes, insurance, HOA, and market conditions. Not financial advice.",
    };
  },
  tests: [
    { name: "$400k home, 7y holding", inputs: { home_price: 400000, down_pct: 20, rate: 6.5, years: 7, property_tax: 4800, maintenance: 3600, appreciation: 3, rent: 2200, rent_growth: 3 }, expected: { buy_cost: "$179,574.79" }, tolerance: 50 },
  ],
};

/* --------------- Down payment & closing costs --------------------- */
export const downPaymentClosing: CalculatorDefinition = {
  slug: "down-payment-closing",
  name: "Down Payment & Closing Costs",
  description: "Compute the cash needed at closing for a home purchase.",
  category: "real-estate",
  keywords: ["down payment", "closing costs", "cash to close", "upfront", "buying"],
  status: "live",
  part: 3,
  inputs: [
    { name: "price", label: "Home price", type: "number", default: 350000, min: 0, step: "any", unit: "$" },
    { name: "down_pct", label: "Down payment %", type: "number", default: 20, min: 0, max: 100, step: "any", unit: "%" },
    { name: "closing_pct", label: "Closing costs %", type: "number", default: 3, min: 0, max: 10, step: "any", unit: "%",
      help: "Typically 2-5% of price — covers lender fees, title, appraisal, etc." },
    { name: "property_tax_prepaid", label: "Prepaid property tax (6mo)", type: "number", default: 2400, min: 0, step: "any", unit: "$" },
    { name: "insurance_prepaid", label: "Prepaid insurance (1yr)", type: "number", default: 1200, min: 0, step: "any", unit: "$" },
  ],
  related: ["mortgage-affordability", "rent-vs-buy", "ltv-ratio"],
  calculate: (raw) => {
    const price = toNum(raw.price);
    const downPct = toNum(raw.down_pct) / 100;
    const closingPct = toNum(raw.closing_pct) / 100;
    const taxPrepaid = toNum(raw.property_tax_prepaid);
    const insPrepaid = toNum(raw.insurance_prepaid);
    const down = price * downPct;
    const closing = price * closingPct;
    const cashToClose = down + closing + taxPrepaid + insPrepaid;
    const loanAmount = price - down;
    return {
      rows: [
        { key: "cash_to_close", label: "Total cash to close", value: fmtUSD(cashToClose), emphasis: "primary" },
        { key: "down", label: "Down payment", value: fmtUSD(down), emphasis: "primary" },
        { key: "closing", label: "Closing costs", value: fmtUSD(closing) },
        { key: "loan", label: "Loan amount", value: fmtUSD(loanAmount) },
      ],
      sections: [{
        title: "Prepaid items",
        rows: [
          { key: "tax", label: "Property tax (6mo)", value: fmtUSD(taxPrepaid) },
          { key: "ins", label: "Homeowners insurance (1yr)", value: fmtUSD(insPrepaid) },
        ],
      }],
      summary: "Down payment + closing costs + prepaid taxes/insurance = cash needed at signing. Lenders often want 20% down to avoid PMI; some loans allow 3.5% (FHA) or 0% (VA/USDA).",
    };
  },
  tests: [
    { name: "$350k, 20% down, 3% closing", inputs: { price: 350000, down_pct: 20, closing_pct: 3, property_tax_prepaid: 2400, insurance_prepaid: 1200 }, expected: { cash_to_close: "$84,100.00" } },
  ],
};

/* ----------------- Rental yield & cash flow ----------------------- */
export const rentalYield: CalculatorDefinition = {
  slug: "rental-yield",
  name: "Rental Yield & Cash Flow",
  description: "Compute gross/net rental yield and monthly cash flow for an investment property.",
  category: "real-estate",
  keywords: ["rental", "yield", "cash flow", "investment property", "cap rate", "roi"],
  status: "live",
  part: 3,
  inputs: [
    { name: "price", label: "Property purchase price", type: "number", default: 300000, min: 0, step: "any", unit: "$" },
    { name: "monthly_rent", label: "Monthly rent", type: "number", default: 2200, min: 0, step: "any", unit: "$" },
    { name: "monthly_costs", label: "Monthly costs (mortgage, tax, insurance, HOA)", type: "number", default: 1800, min: 0, step: "any", unit: "$" },
    { name: "vacancy", label: "Vacancy rate", type: "number", default: 5, min: 0, max: 50, step: "any", unit: "%" },
    { name: "annual_maint", label: "Annual maintenance", type: "number", default: 2400, min: 0, step: "any", unit: "$" },
  ],
  related: ["rent-vs-buy", "ltv-ratio", "mortgage-affordability"],
  calculate: (raw) => {
    const price = toNum(raw.price);
    const rent = toNum(raw.monthly_rent);
    const costs = toNum(raw.monthly_costs);
    const vacancy = toNum(raw.vacancy) / 100;
    const maint = toNum(raw.annual_maint);
    const grossAnnualRent = rent * 12;
    const effectiveRent = grossAnnualRent * (1 - vacancy);
    const annualCosts = costs * 12 + maint;
    const netOperatingIncome = effectiveRent - annualCosts;
    const grossYield = price > 0 ? (grossAnnualRent / price) * 100 : 0;
    const netYield = price > 0 ? (netOperatingIncome / price) * 100 : 0;
    const monthlyCashFlow = netOperatingIncome / 12;
    const capRate = netYield; // simplified: NOI / price
    return {
      rows: [
        { key: "gross_yield", label: "Gross rental yield", value: `${fmt(grossYield, 2)}%`, emphasis: "primary" },
        { key: "net_yield", label: "Net rental yield (cap rate)", value: `${fmt(netYield, 2)}%`, emphasis: "primary" },
        { key: "monthly_cf", label: "Monthly cash flow", value: fmtUSD(monthlyCashFlow), emphasis: monthlyCashFlow >= 0 ? "success" : "warning" },
        { key: "annual_cf", label: "Annual cash flow", value: fmtUSD(netOperatingIncome) },
      ],
      sections: [{
        title: "Income breakdown",
        rows: [
          { key: "gross_rent", label: "Gross annual rent", value: fmtUSD(grossAnnualRent) },
          { key: "vacancy_loss", label: "Vacancy loss", value: fmtUSD(grossAnnualRent * vacancy) },
          { key: "effective_rent", label: "Effective rent collected", value: fmtUSD(effectiveRent) },
          { key: "annual_costs", label: "Total annual costs", value: fmtUSD(annualCosts) },
          { key: "noi", label: "Net operating income (NOI)", value: fmtUSD(netOperatingIncome) },
        ],
      }],
      summary: "Cap rate = NOI ÷ price. A 'good' cap rate is typically 5-10% depending on market. Cash flow = NOI − debt service. Always include vacancy and maintenance reserves.",
    };
  },
  tests: [
    { name: "$300k property, $2200 rent", inputs: { price: 300000, monthly_rent: 2200, monthly_costs: 1800, vacancy: 5, annual_maint: 2400 }, expected: { gross_yield: "8.8%" } },
    { name: "Same — net yield", inputs: { price: 300000, monthly_rent: 2200, monthly_costs: 1800, vacancy: 5, annual_maint: 2400 }, expected: { net_yield: "0.36%" } },
  ],
};

/* ----------------- Property appreciation -------------------------- */
export const propertyAppreciation: CalculatorDefinition = {
  slug: "property-appreciation",
  name: "Property Appreciation",
  description: "Project future home value given annual appreciation rate.",
  category: "real-estate",
  keywords: ["appreciation", "future value", "property", "home value", "growth"],
  status: "live",
  part: 3,
  inputs: [
    { name: "current_value", label: "Current property value", type: "number", default: 400000, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Annual appreciation rate", type: "number", default: 3, min: -10, max: 30, step: "any", unit: "%" },
    { name: "years", label: "Years from now", type: "number", default: 10, min: 0, step: 1, unit: "yrs" },
  ],
  related: ["rent-vs-buy", "rental-yield", "compound-interest"],
  calculate: (raw) => {
    const val = toNum(raw.current_value);
    const rate = toNum(raw.rate) / 100;
    const years = Math.max(0, toNum(raw.years));
    const future = val * Math.pow(1 + rate, years);
    const gain = future - val;
    const pctGain = val > 0 ? (gain / val) * 100 : 0;
    const series: { label: string; value: number }[] = [];
    for (let y = 0; y <= Math.min(years, 30); y++) {
      series.push({ label: `Year ${y}`, value: round(val * Math.pow(1 + rate, y), 2) });
    }
    return {
      rows: [
        { key: "future", label: "Projected value", value: fmtUSD(future), emphasis: "primary" },
        { key: "gain", label: "Total appreciation", value: fmtUSD(gain), emphasis: gain >= 0 ? "success" : "warning" },
        { key: "pct", label: "Total % gain", value: `${fmt(pctGain, 2)}%` },
      ],
      chart: { type: "line", title: "Projected property value", series },
      summary: `Future value = current × (1+rate)^years. Long-term US average home appreciation is ~3-4% nominal; real (inflation-adjusted) is ~1-2%. Local markets vary widely.`,
    };
  },
  tests: [
    { name: "$400k @ 3% for 10y", inputs: { current_value: 400000, rate: 3, years: 10 }, expected: { future: "$537,566.55" }, tolerance: 1 },
    { name: "$200k @ -2% (depreciation)", inputs: { current_value: 200000, rate: -2, years: 5 }, expected: { future: "$180,784.16" }, tolerance: 1 },
  ],
};

/* --------------------- Price per sqft ----------------------------- */
export const pricePerSqft: CalculatorDefinition = {
  slug: "price-per-sqft",
  name: "Price per Square Foot",
  description: "Compare properties on price per square foot or square meter.",
  category: "real-estate",
  keywords: ["price per sqft", "price per square foot", "price per m2", "compare", "value"],
  status: "live",
  part: 3,
  inputs: [
    { name: "price", label: "Property price", type: "number", default: 450000, min: 0, step: "any", unit: "$" },
    { name: "area", label: "Floor area", type: "number", default: 1800, min: 0, step: "any" },
    { name: "unit", label: "Area unit", type: "select", default: "sqft",
      options: [{ label: "Square feet", value: "sqft" }, { label: "Square meters", value: "sqm" }] },
  ],
  related: ["mortgage-affordability", "rent-vs-buy", "construction-budget"],
  calculate: (raw) => {
    const price = toNum(raw.price);
    const area = toNum(raw.area);
    const unit = String(raw.unit ?? "sqft");
    if (area <= 0) {
      return { rows: [{ key: "per_sqft", label: "Price per sqft", value: "—" }] };
    }
    const perSqft = price / area;
    const perSqm = unit === "sqft" ? perSqft * 10.7639 : perSqft;
    const perSqftOut = unit === "sqm" ? perSqft / 10.7639 : perSqft;
    return {
      rows: [
        { key: "per_sqft", label: "Price per sq ft", value: fmtUSD(perSqftOut), emphasis: "primary" },
        { key: "per_sqm", label: "Price per sq m", value: fmtUSD(perSqm), emphasis: "primary" },
      ],
      sections: [{
        title: "Reference",
        rows: [
          { key: "us_avg", label: "US avg new home (2024)", value: "~$150-$200/sqft" },
          { key: "luxury", label: "Luxury markets (NYC, SF)", value: "$1,000+/sqft" },
        ],
      }],
      summary: "Price per square foot = price ÷ floor area. Useful for comparing similar properties in a market, but doesn't capture lot size, condition, or location quality.",
    };
  },
  tests: [
    { name: "$450k / 1800 sqft", inputs: { price: 450000, area: 1800, unit: "sqft" }, expected: { per_sqft: "$250.00" } },
    { name: "$450k / 167 sqm", inputs: { price: 450000, area: 167, unit: "sqm" }, expected: { per_sqm: "$2,694.61" } },
  ],
};

/* ------------------ Loan-to-Value (LTV) --------------------------- */
export const ltvRatio: CalculatorDefinition = {
  slug: "ltv-ratio",
  name: "Loan-to-Value (LTV) Ratio",
  description: "Compute LTV ratio to determine mortgage pricing and PMI requirement.",
  category: "real-estate",
  keywords: ["ltv", "loan to value", "pmi", "mortgage", "ratio", "equity"],
  status: "live",
  part: 3,
  inputs: [
    { name: "loan", label: "Loan amount", type: "number", default: 320000, min: 0, step: "any", unit: "$" },
    { name: "value", label: "Property value", type: "number", default: 400000, min: 0, step: "any", unit: "$" },
  ],
  related: ["mortgage-affordability", "down-payment-closing", "rental-yield"],
  calculate: (raw) => {
    const loan = toNum(raw.loan);
    const value = toNum(raw.value);
    if (value <= 0) {
      return { rows: [{ key: "ltv", label: "LTV", value: "—" }] };
    }
    const ltv = (loan / value) * 100;
    const equity = value - loan;
    const equityPct = 100 - ltv;
    let pmi = "Not required";
    let pmiHint: string | undefined;
    if (ltv > 80) {
      pmi = "Required (LTV > 80%)";
      pmiHint = `Estimated annual PMI: ${fmtUSD((loan * 0.005) - (loan * 0.011) * Math.max(0, (1 - ltv/100)))} (typical 0.5%-1.1% of loan)`;
    } else if (ltv > 95) {
      pmi = "Required (high LTV)";
    }
    return {
      rows: [
        { key: "ltv", label: "Loan-to-value ratio", value: `${fmt(ltv, 2)}%`, emphasis: "primary" },
        { key: "equity", label: "Equity", value: fmtUSD(equity) },
        { key: "equity_pct", label: "Equity %", value: `${fmt(equityPct, 2)}%` },
        { key: "pmi", label: "PMI status", value: pmi, hint: pmiHint, emphasis: ltv > 80 ? "warning" : "success" },
      ],
      summary: "LTV = loan ÷ value × 100. Most conventional loans require PMI when LTV > 80%. FHA loans require mortgage insurance regardless of LTV.",
    };
  },
  tests: [
    { name: "$320k loan on $400k home → 80%", inputs: { loan: 320000, value: 400000 }, expected: { ltv: "80%" } },
    { name: "$360k loan on $400k → 90%, PMI required", inputs: { loan: 360000, value: 400000 }, expected: { pmi: "Required (LTV > 80%)" } },
  ],
};

/* ----------------- Construction budget ---------------------------- */
export const constructionBudget: CalculatorDefinition = {
  slug: "construction-budget",
  name: "Construction Budget Estimator",
  description: "Estimate construction cost from area and per-unit cost (rough ballpark).",
  category: "real-estate",
  keywords: ["construction", "budget", "build", "cost", "estimate", "contractor"],
  status: "live",
  part: 3,
  inputs: [
    { name: "area", label: "Floor area", type: "number", default: 2000, min: 0, step: "any" },
    { name: "unit", label: "Area unit", type: "select", default: "sqft",
      options: [{ label: "Square feet", value: "sqft" }, { label: "Square meters", value: "sqm" }] },
    { name: "cost_per_unit", label: "Cost per unit", type: "number", default: 175, min: 0, step: "any", unit: "$",
      help: "Typical US 2024 cost per sqft: $100 (basic) / $150-250 (standard) / $300-500+ (luxury). Varies hugely by region." },
    { name: "contingency", label: "Contingency buffer", type: "number", default: 15, min: 0, max: 100, step: "any", unit: "%" },
    { name: "permit_pct", label: "Permits & fees", type: "number", default: 5, min: 0, max: 30, step: "any", unit: "%" },
  ],
  related: ["price-per-sqft", "mortgage-affordability", "down-payment-closing"],
  calculate: (raw) => {
    const areaIn = toNum(raw.area);
    const unit = String(raw.unit ?? "sqft");
    const costPer = toNum(raw.cost_per_unit);
    const contingency = toNum(raw.contingency) / 100;
    const permitPct = toNum(raw.permit_pct) / 100;
    // Normalize to sqft internally for display
    const areaSqft = unit === "sqm" ? areaIn * 10.7639 : areaIn;
    const baseCost = areaSqft * (unit === "sqm" ? costPer / 10.7639 : costPer);
    const contingencyCost = baseCost * contingency;
    const permitCost = baseCost * permitPct;
    const total = baseCost + contingencyCost + permitCost;
    return {
      rows: [
        { key: "base", label: "Base construction cost", value: fmtUSD(baseCost) },
        { key: "contingency", label: `Contingency (${(contingency * 100).toFixed(0)}%)`, value: fmtUSD(contingencyCost) },
        { key: "permits", label: `Permits & fees (${(permitPct * 100).toFixed(0)}%)`, value: fmtUSD(permitCost) },
        { key: "total", label: "Total estimated budget", value: fmtUSD(total), emphasis: "primary" },
      ],
      sections: [{
        title: "Project details",
        rows: [
          { key: "area", label: "Floor area", value: `${fmt(areaIn, 0)} ${unit} (${fmt(areaSqft, 0)} sqft)` },
          { key: "rate", label: "Cost rate", value: fmtUSD(costPer) + `/${unit}` },
        ],
      }],
      summary: "Rough ballpark only — actual costs depend on location, finishes, site conditions, labor rates, and material prices. Always get contractor bids. Contingency of 10-20% is standard for surprises.",
    };
  },
  tests: [
    { name: "2000 sqft @ $175 + 15% contingency + 5% permits", inputs: { area: 2000, unit: "sqft", cost_per_unit: 175, contingency: 15, permit_pct: 5 }, expected: { total: "$420,000.00" } },
  ],
};

/* ----------------- Mortgage affordability (real-estate alias) ----- */
export const realEstateMortgageAffordability: CalculatorDefinition = {
  slug: "real-estate-mortgage-affordability",
  name: "Home Affordability (Real Estate)",
  description: "Estimate the maximum home price affordable given income, debts, and down payment.",
  category: "real-estate",
  keywords: ["affordability", "home", "house", "buy", "how much", "mortgage"],
  status: "live",
  part: 3,
  inputs: [
    { name: "income", label: "Gross annual income", type: "number", default: 100000, min: 0, step: "any", unit: "$" },
    { name: "down", label: "Available down payment", type: "number", default: 60000, min: 0, step: "any", unit: "$" },
    { name: "debts", label: "Monthly debt payments", type: "number", default: 500, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Mortgage rate", type: "number", default: 6.5, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Loan term", type: "number", default: 30, min: 1, max: 40, step: 1, unit: "yrs" },
    { name: "taxes_ins", label: "Monthly property tax + insurance", type: "number", default: 400, min: 0, step: "any", unit: "$" },
  ],
  related: ["mortgage-affordability", "rent-vs-buy", "ltv-ratio", "down-payment-closing"],
  calculate: (raw) => {
    const income = toNum(raw.income);
    const down = toNum(raw.down);
    const debts = toNum(raw.debts);
    const rate = toNum(raw.rate) / 100;
    const years = toNum(raw.years);
    const taxesIns = toNum(raw.taxes_ins);
    const monthlyIncome = income / 12;
    const maxPITI = Math.min(monthlyIncome * 0.28, monthlyIncome * 0.36 - debts);
    if (maxPITI <= taxesIns) {
      return {
        rows: [{ key: "max_price", label: "Max affordable price", value: "—", hint: "Income too low or debts too high.", emphasis: "warning" }],
      };
    }
    const maxPayment = maxPITI - taxesIns;
    const r = rate / 12;
    const n = years * 12;
    const maxLoan = r === 0 ? maxPayment * n : maxPayment * (1 - Math.pow(1 + r, -n)) / r;
    const maxPrice = maxLoan + down;
    return {
      rows: [
        { key: "max_price", label: "Max affordable home price", value: fmtUSD(maxPrice), emphasis: "primary" },
        { key: "max_loan", label: "Max loan amount", value: fmtUSD(maxLoan), emphasis: "primary" },
        { key: "down_pct", label: "Effective down payment %", value: `${fmt((down / maxPrice) * 100, 1)}%` },
      ],
      sections: [{
        title: "DTI analysis (28/36 rule)",
        rows: [
          { key: "monthly_income", label: "Gross monthly income", value: fmtUSD(monthlyIncome) },
          { key: "max_piti", label: "Max monthly PITI", value: fmtUSD(maxPITI) },
          { key: "pi", label: "Principal & interest portion", value: fmtUSD(maxPayment) },
        ],
      }],
      summary: "Estimate only — not financial advice. Lenders also check credit score, employment, and reserves. Pre-qualification requires a formal lender application.",
    };
  },
  tests: [
    { name: "$100k income, $60k down, 6.5%/30y", inputs: { income: 100000, down: 60000, debts: 500, rate: 6.5, years: 30, taxes_ins: 400 }, expected: { max_price: "$365,874.25" }, tolerance: 50 },
  ],
};
