/**
 * Finance and Banking — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum, round } from "../_format";

/* --------------------- Loan payment (amortized) ------------------- */
export const loanPayment: CalculatorDefinition = {
  slug: "loan-payment",
  name: "Loan Payment Calculator",
  description: "Monthly payment, total interest and full amortization schedule for an installment loan.",
  category: "finance",
  keywords: ["mortgage", "amortization", "installment", "EMI", "car loan", "principal interest"],
  status: "live",
  part: 1,
  inputs: [
    { name: "principal", label: "Loan amount", type: "number", default: 200000, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Annual interest rate", type: "number", default: 6.5, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Loan term", type: "number", default: 30, min: 1, max: 50, step: 1, unit: "years" },
  ],
  related: ["compound-interest", "mortgage-affordability"],
  calculate: (raw) => {
    const P = toNum(raw.principal);
    const annualRate = toNum(raw.rate) / 100;
    const years = toNum(raw.years);
    const n = years * 12;
    const r = annualRate / 12;
    const monthly = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - P;

    // Build yearly schedule (12 months summarized per row, up to 30 years)
    const series: { label: string; value: number }[] = [];
    let balance = P;
    for (let y = 1; y <= Math.min(years, 30); y++) {
      const startBalance = balance;
      for (let m = 0; m < 12; m++) {
        const interest = balance * r;
        const principalPart = monthly - interest;
        balance -= principalPart;
      }
      series.push({ label: `Year ${y}`, value: Math.max(0, round(startBalance, 0)) });
    }

    return {
      rows: [
        { key: "monthly_payment", label: "Monthly payment", value: fmtUSD(monthly), emphasis: "primary" },
        { key: "total_paid", label: "Total paid", value: fmtUSD(totalPaid) },
        { key: "total_interest", label: "Total interest", value: fmtUSD(totalInterest) },
        { key: "n_payments", label: "Number of payments", value: fmt(n, 0) },
      ],
      sections: [
        {
          title: "Loan summary",
          rows: [
            { key: "principal_pct", label: "Principal share", value: `${fmt((P / totalPaid) * 100, 1)}%` },
            { key: "interest_pct", label: "Interest share", value: `${fmt((totalInterest / totalPaid) * 100, 1)}%` },
          ],
        },
      ],
      chart: {
        type: "line",
        title: "Remaining balance over time",
        series,
      },
      summary:
        "The standard amortization formula assumes equal monthly payments. " +
        "Each payment covers the interest accrued that month; the remainder reduces principal.",
    };
  },
  tests: [
    {
      name: "200k @ 6.5% for 30 years",
      inputs: { principal: 200000, rate: 6.5, years: 30 },
      expected: { monthly_payment: "$1,264.14" },
    },
    {
      name: "10k @ 0% for 5 years",
      inputs: { principal: 10000, rate: 0, years: 5 },
      expected: { monthly_payment: "$166.67" },
    },
  ],
};

/* ----------------------- Compound interest ------------------------ */
export const compoundInterest: CalculatorDefinition = {
  slug: "compound-interest",
  name: "Compound Interest Calculator",
  description: "Project the future value of an investment with regular contributions and compounding.",
  category: "finance",
  keywords: ["savings", "investment", "future value", "interest", "growth", "APY"],
  status: "live",
  part: 1,
  inputs: [
    { name: "principal", label: "Initial deposit", type: "number", default: 1000, min: 0, step: "any", unit: "$" },
    { name: "monthly", label: "Monthly contribution", type: "number", default: 100, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Annual interest rate", type: "number", default: 7, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Time horizon", type: "number", default: 20, min: 1, max: 80, step: 1, unit: "years" },
    { name: "compounding", label: "Compounding frequency", type: "select", default: "monthly",
      options: [
        { label: "Annually", value: "annually" },
        { label: "Monthly", value: "monthly" },
        { label: "Daily", value: "daily" },
      ] },
  ],
  related: ["loan-payment", "savings-goal"],
  calculate: (raw) => {
    const P = toNum(raw.principal);
    const PMT = toNum(raw.monthly);
    const annualRate = toNum(raw.rate) / 100;
    const years = toNum(raw.years);
    const freq = String(raw.compounding ?? "monthly");
    const nPerYear = freq === "annually" ? 1 : freq === "daily" ? 365 : 12;
    const r = annualRate / nPerYear;
    const n = nPerYear * years;
    const fvLump = r === 0 ? P : P * Math.pow(1 + r, n);
    // Future value of an annuity (contributions at end of period)
    const fvAnn = r === 0 ? PMT * n : PMT * ((Math.pow(1 + r, n) - 1) / r);
    const totalContrib = P + PMT * n;
    const fv = fvLump + fvAnn;
    const interest = fv - totalContrib;

    const series: { label: string; value: number }[] = [];
    for (let y = 0; y <= years; y++) {
      const nn = nPerYear * y;
      const fvL = r === 0 ? P : P * Math.pow(1 + r, nn);
      const fvA = r === 0 ? PMT * nn : PMT * ((Math.pow(1 + r, nn) - 1) / r);
      series.push({ label: `Year ${y}`, value: round(fvL + fvA, 2) });
    }

    return {
      rows: [
        { key: "future_value", label: "Future value", value: fmtUSD(fv), emphasis: "primary" },
        { key: "total_contributed", label: "Total contributed", value: fmtUSD(totalContrib) },
        { key: "interest_earned", label: "Interest earned", value: fmtUSD(interest) },
      ],
      chart: { type: "line", title: "Balance growth", series },
      summary:
        "Compound interest earns interest on previously-earned interest. " +
        "More frequent compounding yields slightly more, but contribution size matters most.",
    };
  },
  tests: [
    {
      name: "1000 + 100/mo @ 7% for 20y (monthly)",
      inputs: { principal: 1000, monthly: 100, rate: 7, years: 20, compounding: "monthly" },
      expected: { future_value: "$56,131.40" },
    },
    {
      name: "0% rate (no growth)",
      inputs: { principal: 1000, monthly: 100, rate: 0, years: 10, compounding: "monthly" },
      expected: { future_value: "$13,000.00" },
    },
  ],
};

/* ----------------------- Simple interest -------------------------- */
export const simpleInterest: CalculatorDefinition = {
  slug: "simple-interest",
  name: "Simple Interest Calculator",
  description: "Interest computed only on the original principal. No compounding.",
  category: "finance",
  keywords: ["simple interest", "principal", "flat rate", "I = Prt"],
  status: "live",
  part: 3,
  inputs: [
    { name: "principal", label: "Principal (P)", type: "number", default: 10000, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Annual interest rate (r)", type: "number", default: 5, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Time in years (t)", type: "number", default: 3, min: 0, step: "any", unit: "yrs" },
  ],
  related: ["compound-interest", "loan-payment", "present-value"],
  calculate: (raw) => {
    const P = toNum(raw.principal);
    const r = toNum(raw.rate) / 100;
    const t = toNum(raw.years);
    const interest = P * r * t;
    const total = P + interest;
    return {
      rows: [
        { key: "interest", label: "Interest I = P·r·t", value: fmtUSD(interest), emphasis: "primary" },
        { key: "total", label: "Total to repay", value: fmtUSD(total), emphasis: "primary" },
      ],
      sections: [{
        title: "Per-period breakdown",
        rows: [
          { key: "annual", label: "Interest per year", value: fmtUSD(P * r) },
          { key: "monthly", label: "Interest per month", value: fmtUSD((P * r) / 12) },
          { key: "daily", label: "Interest per day", value: fmtUSD((P * r) / 365) },
        ],
      }],
      summary: "Simple interest never earns interest on interest. I = P × r × t. Useful for short-term loans and many auto loans.",
    };
  },
  tests: [
    { name: "$10,000 @ 5% for 3 years", inputs: { principal: 10000, rate: 5, years: 3 }, expected: { interest: "$1,500.00" } },
    { name: "$5,000 @ 0% (no interest)", inputs: { principal: 5000, rate: 0, years: 5 }, expected: { interest: "$0.00" } },
  ],
};

/* ------------------ Mortgage affordability ------------------------- */
export const mortgageAffordability: CalculatorDefinition = {
  slug: "mortgage-affordability",
  name: "Mortgage Affordability",
  description: "Estimate the maximum home price you can afford using the 28/36 debt-to-income rule.",
  category: "finance",
  keywords: ["mortgage", "afford", "affordability", "how much house", "dti", "debt to income"],
  status: "live",
  part: 3,
  inputs: [
    { name: "income", label: "Gross annual income", type: "number", default: 80000, min: 0, step: "any", unit: "$" },
    { name: "down_pct", label: "Down payment (%)", type: "number", default: 20, min: 0, max: 100, step: "any", unit: "%" },
    { name: "rate", label: "Mortgage rate", type: "number", default: 6.5, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Loan term", type: "number", default: 30, min: 1, max: 40, step: 1, unit: "yrs" },
    { name: "debts", label: "Monthly debt payments", type: "number", default: 400, min: 0, step: "any", unit: "$" },
    { name: "taxes_ins", label: "Property tax + insurance (monthly)", type: "number", default: 350, min: 0, step: "any", unit: "$" },
  ],
  related: ["loan-payment", "compound-interest", "rent-vs-buy"],
  calculate: (raw) => {
    const income = toNum(raw.income);
    const downPct = toNum(raw.down_pct) / 100;
    const rate = toNum(raw.rate) / 100;
    const years = toNum(raw.years);
    const debts = toNum(raw.debts);
    const taxesIns = toNum(raw.taxes_ins);
    const monthlyIncome = income / 12;
    // 28% front-end ratio: max PITI = 28% of gross monthly income
    const maxPITI = monthlyIncome * 0.28;
    // 36% back-end: max (PITI + debts) = 36% of gross monthly income
    const maxTotalDebt = monthlyIncome * 0.36;
    const maxPITIFromBackend = Math.max(0, maxTotalDebt - debts);
    const maxPITIFinal = Math.min(maxPITI, maxPITIFromBackend);
    if (maxPITIFinal <= taxesIns) {
      return {
        rows: [{ key: "max_price", label: "Max affordable home price", value: "—", hint: "Existing debts and taxes/insurance exceed the 28/36 limits.", emphasis: "warning" }],
        summary: "The 28/36 rule: housing payment ≤ 28% of gross monthly income, total debts ≤ 36%.",
      };
    }
    const maxPayment = maxPITIFinal - taxesIns; // available for principal + interest
    const r = rate / 12;
    const n = years * 12;
    // Max loan = payment × (1 − (1+r)^(−n)) / r
    const maxLoan = r === 0 ? maxPayment * n : maxPayment * (1 - Math.pow(1 + r, -n)) / r;
    const maxPrice = maxLoan / (1 - downPct);
    return {
      rows: [
        { key: "max_price", label: "Max affordable home price", value: fmtUSD(maxPrice), emphasis: "primary" },
        { key: "max_loan", label: "Max loan amount", value: fmtUSD(maxLoan), emphasis: "primary" },
        { key: "down_payment", label: "Required down payment", value: fmtUSD(maxPrice * downPct) },
      ],
      sections: [{
        title: "DTI analysis (28/36 rule)",
        rows: [
          { key: "monthly_income", label: "Gross monthly income", value: fmtUSD(monthlyIncome) },
          { key: "max_piti", label: "Max monthly PITI (28% rule)", value: fmtUSD(maxPITI) },
          { key: "max_piti_actual", label: "Max PITI allowed after debts", value: fmtUSD(maxPITIFinal) },
          { key: "payment_pi", label: "P&I portion of payment", value: fmtUSD(maxPayment) },
        ],
      }],
      summary: "Estimate only — not financial advice. The 28/36 rule is a common US underwriting guideline; lenders also check credit score and employment.",
    };
  },
  tests: [
    { name: "$80k income, 20% down, 6.5%/30y", inputs: { income: 80000, down_pct: 20, rate: 6.5, years: 30, debts: 400, taxes_ins: 350 }, expected: { max_price: "$299,941.35" }, tolerance: 1 },
  ],
};

/* -------------------- Savings goal -------------------------------- */
export const savingsGoal: CalculatorDefinition = {
  slug: "savings-goal",
  name: "Savings Goal Calculator",
  description: "Find the monthly contribution needed to reach a target savings goal.",
  category: "finance",
  keywords: ["savings", "goal", "target", "how much to save", "monthly contribution"],
  status: "live",
  part: 3,
  inputs: [
    { name: "goal", label: "Savings goal", type: "number", default: 50000, min: 0, step: "any", unit: "$" },
    { name: "starting", label: "Current savings", type: "number", default: 5000, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Annual return rate", type: "number", default: 5, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Years to goal", type: "number", default: 5, min: 1, max: 60, step: 1, unit: "yrs" },
  ],
  related: ["compound-interest", "loan-payment", "retirement"],
  calculate: (raw) => {
    const goal = toNum(raw.goal);
    const start = toNum(raw.starting);
    const rate = toNum(raw.rate) / 100;
    const years = toNum(raw.years);
    const r = rate / 12;
    const n = years * 12;
    // Future value of starting savings
    const fvStart = start * Math.pow(1 + r, n);
    const shortfall = Math.max(0, goal - fvStart);
    // Monthly contribution = shortfall × r / ((1+r)^n − 1)
    const monthly = shortfall === 0 ? 0 : (r === 0 ? shortfall / n : shortfall * r / (Math.pow(1 + r, n) - 1));
    const totalContrib = monthly * n;
    const interest = (start + totalContrib) - (goal - shortfall) > 0 ? (start + totalContrib) - goal + shortfall : 0;
    // Build growth chart
    const series: { label: string; value: number }[] = [];
    let bal = start;
    for (let y = 0; y <= years; y++) {
      if (y > 0) {
        for (let m = 0; m < 12; m++) {
          bal = bal * (1 + r) + monthly;
        }
      }
      series.push({ label: `Year ${y}`, value: round(bal, 2) });
    }
    return {
      rows: [
        { key: "monthly", label: "Monthly contribution needed", value: fmtUSD(monthly), emphasis: "primary" },
        { key: "total_contrib", label: "Total contributions", value: fmtUSD(start + totalContrib) },
        { key: "interest", label: "Interest earned", value: fmtUSD(Math.max(0, goal - start - totalContrib)) },
      ],
      chart: { type: "line", title: "Savings growth", series },
      summary: "If your starting savings grow to less than the goal, the shortfall is funded by an annuity of monthly contributions.",
    };
  },
  tests: [
    { name: "$50k goal, $5k start, 5%, 5y", inputs: { goal: 50000, starting: 5000, rate: 5, years: 5 }, expected: { monthly: "$640.87" }, tolerance: 0.5 },
    { name: "$0 rate (no growth)", inputs: { goal: 12000, starting: 0, rate: 0, years: 10 }, expected: { monthly: "$100.00" } },
  ],
};

/* ----------------- Present value & future value ------------------- */
export const presentValue: CalculatorDefinition = {
  slug: "present-value",
  name: "Present Value (PV) Calculator",
  description: "Today's value of a future sum or stream of payments, discounted at a given rate.",
  category: "finance",
  keywords: ["present value", "pv", "discount", "time value of money", "tvm"],
  status: "live",
  part: 3,
  inputs: [
    { name: "mode", label: "Type of cash flow", type: "select", default: "lump",
      options: [
        { label: "Single future sum (lump sum)", value: "lump" },
        { label: "Annuity (equal periodic payments)", value: "annuity" },
      ] },
    { name: "fv", label: "Future value (or annual payment)", type: "number", default: 10000, step: "any", unit: "$" },
    { name: "rate", label: "Discount rate per period", type: "number", default: 5, min: 0, step: "any", unit: "%" },
    { name: "n", label: "Number of periods", type: "number", default: 10, min: 1, step: 1 },
  ],
  related: ["future-value", "compound-interest", "loan-payment"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "lump");
    const fv = toNum(raw.fv);
    const r = toNum(raw.rate) / 100;
    const n = Math.max(1, Math.round(toNum(raw.n)));
    let pv: number;
    let formula: string;
    if (mode === "lump") {
      pv = r === 0 ? fv : fv / Math.pow(1 + r, n);
      formula = `PV = FV / (1+r)^n = ${fmtUSD(fv)} / (1+${(r * 100).toFixed(2)}%)^${n}`;
    } else {
      pv = r === 0 ? fv * n : fv * (1 - Math.pow(1 + r, -n)) / r;
      formula = `PV = PMT × (1 − (1+r)^(−n)) / r`;
    }
    return {
      rows: [
        { key: "pv", label: "Present value", value: fmtUSD(pv), emphasis: "primary" },
        { key: "fv", label: mode === "lump" ? "Future value" : "Annual payment", value: fmtUSD(fv) },
        { key: "discount", label: "Discount amount", value: fmtUSD(fv * (mode === "lump" ? 1 : n) - pv) },
      ],
      summary: `Formula: ${formula}. The time value of money means a dollar today is worth more than a dollar tomorrow because it can earn interest.`,
    };
  },
  tests: [
    { name: "$10k in 10y @ 5%", inputs: { mode: "lump", fv: 10000, rate: 5, n: 10 }, expected: { pv: "$6,139.13" } },
    { name: "annuity $1k/yr for 10y @ 5%", inputs: { mode: "annuity", fv: 1000, rate: 5, n: 10 }, expected: { pv: "$7,721.73" } },
  ],
};

export const futureValue: CalculatorDefinition = {
  slug: "future-value",
  name: "Future Value (FV) Calculator",
  description: "Project the value at a future date of a present sum or stream of payments.",
  category: "finance",
  keywords: ["future value", "fv", "time value of money", "tvm", "growth"],
  status: "live",
  part: 3,
  inputs: [
    { name: "mode", label: "Type of cash flow", type: "select", default: "lump",
      options: [
        { label: "Single present sum (lump sum)", value: "lump" },
        { label: "Annuity (equal periodic payments)", value: "annuity" },
      ] },
    { name: "pv", label: "Present value (or annual payment)", type: "number", default: 1000, step: "any", unit: "$" },
    { name: "rate", label: "Interest rate per period", type: "number", default: 5, min: 0, step: "any", unit: "%" },
    { name: "n", label: "Number of periods", type: "number", default: 10, min: 1, step: 1 },
  ],
  related: ["present-value", "compound-interest", "savings-goal"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "lump");
    const pv = toNum(raw.pv);
    const r = toNum(raw.rate) / 100;
    const n = Math.max(1, Math.round(toNum(raw.n)));
    let fv: number;
    if (mode === "lump") {
      fv = pv * Math.pow(1 + r, n);
    } else {
      fv = r === 0 ? pv * n : pv * (Math.pow(1 + r, n) - 1) / r;
    }
    return {
      rows: [
        { key: "fv", label: "Future value", value: fmtUSD(fv), emphasis: "primary" },
      ],
      sections: [{
        title: "Breakdown",
        rows: [
          { key: "contrib", label: "Total contributions", value: fmtUSD(mode === "lump" ? pv : pv * n) },
          { key: "interest", label: "Interest earned", value: fmtUSD(fv - (mode === "lump" ? pv : pv * n)) },
        ],
      }],
      summary: "Lump: FV = PV × (1+r)^n. Annuity (end of period): FV = PMT × ((1+r)^n − 1) / r.",
    };
  },
  tests: [
    { name: "$1,000 @ 5% for 10y (lump)", inputs: { mode: "lump", pv: 1000, rate: 5, n: 10 }, expected: { fv: "$1,628.89" } },
    { name: "$1,000/yr annuity @ 5% for 10y", inputs: { mode: "annuity", pv: 1000, rate: 5, n: 10 }, expected: { fv: "$12,577.89" } },
  ],
};

/* ----------------------- Rule of 72 -------------------------------- */
export const ruleOf72: CalculatorDefinition = {
  slug: "rule-of-72",
  name: "Rule of 72 (Doubling Time)",
  description: "Quick estimate of how long it takes an investment to double at a given rate.",
  category: "finance",
  keywords: ["rule of 72", "double", "doubling time", "estimate", "growth"],
  status: "live",
  part: 3,
  inputs: [
    { name: "rate", label: "Annual rate of return", type: "number", default: 7, min: 0.0001, step: "any", unit: "%" },
  ],
  related: ["compound-interest", "future-value", "inflation"],
  calculate: (raw) => {
    const r = toNum(raw.rate);
    if (r <= 0) {
      return { rows: [{ key: "years", label: "Doubling time", value: "—", hint: "Rate must be positive." }] };
    }
    const approxYears = 72 / r;
    const exactYears = Math.log(2) / Math.log(1 + r / 100);
    const quadruple = 144 / r; // rule of 144 for quadrupling
    return {
      rows: [
        { key: "years", label: "Years to double (Rule of 72)", value: `${fmt(approxYears, 2)} years`, emphasis: "primary" },
        { key: "exact", label: "Exact doubling time", value: `${fmt(exactYears, 2)} years` },
        { key: "quadruple", label: "Years to quadruple (Rule of 144)", value: `${fmt(quadruple, 2)} years` },
      ],
      summary: "Rule of 72: years ≈ 72 ÷ rate%. Exact: ln(2) ÷ ln(1+r). Accurate within 1% for rates between 6% and 10%.",
    };
  },
  tests: [
    { name: "7% → ~10.29 years", inputs: { rate: 7 }, expected: { years: "10.29 years" } },
    { name: "10% → 7.2 years", inputs: { rate: 10 }, expected: { years: "7.2 years" } },
  ],
};

/* ----------------------- Inflation --------------------------------- */
export const inflation: CalculatorDefinition = {
  slug: "inflation",
  name: "Inflation & Purchasing Power",
  description: "See how inflation erodes purchasing power, or project future prices.",
  category: "finance",
  keywords: ["inflation", "purchasing power", "real value", "cpi", "prices"],
  status: "live",
  part: 3,
  inputs: [
    { name: "amount", label: "Amount today", type: "number", default: 1000, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Annual inflation rate", type: "number", default: 3, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Years from now", type: "number", default: 10, min: 0, step: 1, unit: "yrs" },
  ],
  related: ["rule-of-72", "present-value", "compound-interest"],
  calculate: (raw) => {
    const amt = toNum(raw.amount);
    const r = toNum(raw.rate) / 100;
    const years = Math.max(0, toNum(raw.years));
    const futurePrice = amt * Math.pow(1 + r, years);
    const realValue = r === 0 ? amt : amt / Math.pow(1 + r, years);
    const lostPct = (1 - realValue / amt) * 100;
    const series: { label: string; value: number }[] = [];
    for (let y = 0; y <= Math.min(years, 30); y++) {
      series.push({ label: `Year ${y}`, value: round(amt * Math.pow(1 + r, y), 2) });
    }
    return {
      rows: [
        { key: "future_price", label: `Cost in ${years}y to buy what ${fmtUSD(amt)} buys today`, value: fmtUSD(futurePrice), emphasis: "primary" },
        { key: "real_value", label: `Real value of ${fmtUSD(amt)} in ${years}y`, value: fmtUSD(realValue), emphasis: "primary" },
        { key: "lost", label: "Purchasing power lost", value: `${fmt(lostPct, 2)}%` },
      ],
      chart: { type: "line", title: "Future cost of today's goods", series },
      summary: `Future cost = today × (1+r)^n. Real value = today ÷ (1+r)^n. At ${(r * 100).toFixed(1)}% inflation, prices double in ~${fmt(72 / (r * 100), 1)} years.`,
    };
  },
  tests: [
    { name: "$1000 @ 3% for 10y → $1,343.92", inputs: { amount: 1000, rate: 3, years: 10 }, expected: { future_price: "$1,343.92" } },
    { name: "real value of $1000 after 10y @ 3%", inputs: { amount: 1000, rate: 3, years: 10 }, expected: { real_value: "$744.09" } },
  ],
};

/* ----------------------- Retirement -------------------------------- */
export const retirement: CalculatorDefinition = {
  slug: "retirement",
  name: "Retirement Savings Projection",
  description: "Project retirement nest egg from current savings, monthly contributions and expected return.",
  category: "finance",
  keywords: ["retirement", "pension", "nest egg", "401k", "ira", "fire"],
  status: "live",
  part: 3,
  inputs: [
    { name: "current_age", label: "Current age", type: "number", default: 30, min: 1, max: 100, step: 1 },
    { name: "retire_age", label: "Retirement age", type: "number", default: 65, min: 1, max: 100, step: 1 },
    { name: "current_savings", label: "Current retirement savings", type: "number", default: 25000, min: 0, step: "any", unit: "$" },
    { name: "monthly", label: "Monthly contribution", type: "number", default: 500, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Expected annual return", type: "number", default: 7, min: 0, step: "any", unit: "%" },
    { name: "withdraw_rate", label: "Safe withdrawal rate", type: "number", default: 4, min: 0, max: 20, step: "any", unit: "%" },
  ],
  related: ["compound-interest", "savings-goal", "inflation"],
  calculate: (raw) => {
    const curAge = Math.round(toNum(raw.current_age));
    const retAge = Math.max(curAge + 1, Math.round(toNum(raw.retire_age)));
    const startSavings = toNum(raw.current_savings);
    const monthly = toNum(raw.monthly);
    const rate = toNum(raw.rate) / 100;
    const withdrawRate = toNum(raw.withdraw_rate) / 100;
    const years = retAge - curAge;
    const r = rate / 12;
    const n = years * 12;
    const fvLump = startSavings * Math.pow(1 + r, n);
    const fvAnn = r === 0 ? monthly * n : monthly * (Math.pow(1 + r, n) - 1) / r;
    const nestEgg = fvLump + fvAnn;
    const annualRetirementIncome = nestEgg * withdrawRate;
    const monthlyRetirementIncome = annualRetirementIncome / 12;
    const totalContrib = startSavings + monthly * n;
    const series: { label: string; value: number }[] = [];
    let bal = startSavings;
    for (let y = 0; y <= years; y++) {
      if (y > 0) {
        for (let m = 0; m < 12; m++) bal = bal * (1 + r) + monthly;
      }
      series.push({ label: `Age ${curAge + y}`, value: round(bal, 2) });
    }
    return {
      rows: [
        { key: "nest_egg", label: "Projected nest egg at retirement", value: fmtUSD(nestEgg), emphasis: "primary" },
        { key: "annual_income", label: `Annual retirement income (${(withdrawRate * 100).toFixed(1)}% rule)`, value: fmtUSD(annualRetirementIncome), emphasis: "primary" },
        { key: "monthly_income", label: "Monthly retirement income", value: fmtUSD(monthlyRetirementIncome) },
      ],
      sections: [{
        title: "Summary",
        rows: [
          { key: "years", label: "Years to retirement", value: `${years}` },
          { key: "total_contrib", label: "Total contributions", value: fmtUSD(totalContrib) },
          { key: "growth", label: "Investment growth", value: fmtUSD(nestEgg - totalContrib) },
        ],
      }],
      chart: { type: "line", title: "Projected balance over time", series },
      summary: `Estimate only — not financial advice. The 4% rule (Trinity study) suggests withdrawing 4% of the initial nest egg annually for ~30 years. Inflation and market volatility can dramatically change actual results.`,
    };
  },
  tests: [
    { name: "30yo, retire 65, $25k start, $500/mo, 7%, 4% WR", inputs: { current_age: 30, retire_age: 65, current_savings: 25000, monthly: 500, rate: 7, withdraw_rate: 4 }, expected: { nest_egg: "$1,188,181.10" }, tolerance: 5 },
  ],
};

/* ----------------- Credit card payoff ----------------------------- */
export const creditCardPayoff: CalculatorDefinition = {
  slug: "credit-card-payoff",
  name: "Credit Card Payoff Calculator",
  description: "Months to become debt-free and total interest for a credit card balance.",
  category: "finance",
  keywords: ["credit card", "payoff", "debt", "balance", "interest", "minimum payment"],
  status: "live",
  part: 3,
  inputs: [
    { name: "balance", label: "Current balance", type: "number", default: 5000, min: 0, step: "any", unit: "$" },
    { name: "apr", label: "Annual percentage rate (APR)", type: "number", default: 19.99, min: 0, step: "any", unit: "%" },
    { name: "monthly", label: "Monthly payment", type: "number", default: 200, min: 0.01, step: "any", unit: "$" },
  ],
  related: ["debt-snowball-avalanche", "loan-payment", "apr-ear"],
  calculate: (raw) => {
    const balance = toNum(raw.balance);
    const apr = toNum(raw.apr) / 100;
    const monthly = toNum(raw.monthly);
    const r = apr / 12;
    const minInterest = balance * r;
    if (monthly <= minInterest) {
      return {
        rows: [{ key: "months", label: "Months to payoff", value: "Never", hint: `Payment must exceed the monthly interest of ${fmtUSD(minInterest)}.`, emphasis: "warning" }],
        summary: "If your payment doesn't cover the monthly interest, the balance will grow forever.",
      };
    }
    let bal = balance;
    let totalInterest = 0;
    let months = 0;
    const series: { label: string; value: number }[] = [{ label: "Start", value: round(bal, 2) }];
    while (bal > 0 && months < 1200) {
      const interest = bal * r;
      const payment = Math.min(monthly, bal + interest);
      bal -= (payment - interest);
      totalInterest += interest;
      months++;
      if (months % 6 === 0 || bal <= 0) series.push({ label: `Mo ${months}`, value: round(Math.max(0, bal), 2) });
    }
    return {
      rows: [
        { key: "months", label: "Months to payoff", value: `${months}`, emphasis: "primary" },
        { key: "years", label: "Years", value: `${fmt(months / 12, 2)}` },
        { key: "total_interest", label: "Total interest paid", value: fmtUSD(totalInterest), emphasis: "primary" },
        { key: "total_paid", label: "Total paid", value: fmtUSD(balance + totalInterest) },
      ],
      chart: { type: "line", title: "Balance over time", series },
      summary: "Credit cards compound daily in most countries; this approximation uses monthly compounding. Paying more than the minimum dramatically cuts interest.",
    };
  },
  tests: [
    { name: "$5000 @ 19.99% APR, $200/mo", inputs: { balance: 5000, apr: 19.99, monthly: 200 }, expected: { months: "33" }, tolerance: 1 },
  ],
};

/* ------------- Debt snowball vs avalanche ------------------------- */
export const debtSnowballAvalanche: CalculatorDefinition = {
  slug: "debt-snowball-avalanche",
  name: "Debt Snowball vs Avalanche",
  description: "Compare snowball (smallest balance first) and avalanche (highest APR first) strategies.",
  category: "finance",
  keywords: ["debt", "snowball", "avalanche", "payoff", "strategy", "compare"],
  status: "live",
  part: 3,
  inputs: [
    { name: "debts", label: "Debts (one per line: <balance> <apr>)", type: "textarea",
      default: "2000 18.99\n500 24.99\n3500 6.5\n800 22.0",
      placeholder: "balance apr\ne.g. 2000 18.99" },
    { name: "extra", label: "Extra monthly payment (above minimums)", type: "number", default: 300, min: 0, step: "any", unit: "$" },
  ],
  related: ["credit-card-payoff", "loan-payment", "apr-ear"],
  calculate: (raw) => {
    const text = String(raw.debts ?? "");
    const parsed: { bal: number; apr: number }[] = [];
    for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const bal = toNum(parts[0]);
      const apr = toNum(parts[1]);
      if (Number.isFinite(bal) && Number.isFinite(apr)) parsed.push({ bal, apr });
    }
    if (parsed.length === 0) {
      return { rows: [{ key: "snowball_months", label: "Snowball months", value: "—" }] };
    }
    const extra = toNum(raw.extra);
    // Simulate a strategy. Returns { months, totalInterest }
    function simulate(order: "snowball" | "avalanche"): { months: number; totalInterest: number } {
      const debts = parsed.map((d) => ({ ...d }));
      // Sort
      if (order === "snowball") debts.sort((a, b) => a.bal - b.bal);
      else debts.sort((a, b) => b.apr - a.apr);
      let months = 0;
      let totalInterest = 0;
      while (debts.some((d) => d.bal > 0.005) && months < 1200) {
        months++;
        // 1. Accrue interest on each
        for (const d of debts) {
          if (d.bal > 0) {
            const i = d.bal * (d.apr / 100) / 12;
            d.bal += i;
            totalInterest += i;
          }
        }
        // 2. Pay minimums (assume 2% of balance or $25, whichever is larger) on each, plus extra to first
        let remaining = extra;
        for (const d of debts) {
          if (d.bal <= 0) continue;
          const min = Math.max(25, d.bal * 0.02);
          const pay = Math.min(min, d.bal);
          d.bal -= pay;
        }
        // Apply extra to first non-zero debt
        for (const d of debts) {
          if (d.bal <= 0) continue;
          const pay = Math.min(remaining, d.bal);
          d.bal -= pay;
          remaining -= pay;
          if (remaining <= 0) break;
        }
      }
      return { months, totalInterest };
    }
    const snowball = simulate("snowball");
    const avalanche = simulate("avalanche");
    const savings = snowball.totalInterest - avalanche.totalInterest;
    return {
      rows: [
        { key: "snowball_months", label: "Snowball: months to debt-free", value: `${snowball.months}` },
        { key: "avalanche_months", label: "Avalanche: months to debt-free", value: `${avalanche.months}`, emphasis: "primary" },
        { key: "snowball_interest", label: "Snowball: total interest", value: fmtUSD(snowball.totalInterest) },
        { key: "avalanche_interest", label: "Avalanche: total interest", value: fmtUSD(avalanche.totalInterest), emphasis: "primary" },
        { key: "savings", label: "Avalanche saves you", value: fmtUSD(Math.max(0, savings)) },
      ],
      summary: "Avalanche (highest APR first) minimizes total interest. Snowball (smallest balance first) gives quick wins that help motivation. Minimum payment assumed: max($25, 2% of balance).",
    };
  },
  tests: [
    { name: "4 debts, $300 extra", inputs: { debts: "2000 18.99\n500 24.99\n3500 6.5\n800 22.0", extra: 300 }, expected: { snowball_months: "20" }, tolerance: 5 },
  ],
};

/* ----------------- APR & effective annual rate ------------------- */
export const aprEar: CalculatorDefinition = {
  slug: "apr-ear",
  name: "APR → EAR (Effective Annual Rate)",
  description: "Convert a nominal APR to the effective annual rate given a compounding frequency.",
  category: "finance",
  keywords: ["apr", "ear", "effective annual rate", "apy", "compounding", "nominal"],
  status: "live",
  part: 3,
  inputs: [
    { name: "apr", label: "Nominal APR", type: "number", default: 18, min: 0, step: "any", unit: "%" },
    { name: "freq", label: "Compounding frequency", type: "select", default: "monthly",
      options: [
        { label: "Annually (1×/yr)", value: "1" },
        { label: "Semiannually (2×/yr)", value: "2" },
        { label: "Quarterly (4×/yr)", value: "4" },
        { label: "Monthly (12×/yr)", value: "12" },
        { label: "Daily (365×/yr)", value: "365" },
        { label: "Continuously", value: "continuous" },
      ] },
  ],
  related: ["compound-interest", "credit-card-payoff", "loan-payment"],
  calculate: (raw) => {
    const apr = toNum(raw.apr) / 100;
    const freq = String(raw.freq ?? "12");
    let ear: number;
    let formula: string;
    if (freq === "continuous") {
      ear = Math.exp(apr) - 1;
      formula = "EAR = e^r − 1 (continuous compounding)";
    } else {
      const n = Number(freq);
      ear = Math.pow(1 + apr / n, n) - 1;
      formula = `EAR = (1 + APR/n)^n − 1, where n = ${n}`;
    }
    return {
      rows: [
        { key: "ear", label: "Effective annual rate (EAR)", value: `${fmt(ear * 100, 4)}%`, emphasis: "primary" },
        { key: "apr", label: "Nominal APR", value: `${fmt(apr * 100, 4)}%` },
        { key: "diff", label: "Effective premium", value: `${fmt((ear - apr) * 100, 4)}%` },
      ],
      summary: `${formula}. EAR is what you actually pay (or earn) after compounding. APR understates true cost when compounding is more than annual.`,
    };
  },
  tests: [
    { name: "18% APR compounded monthly", inputs: { apr: 18, freq: "12" }, expected: { ear: "19.5618%" } },
    { name: "18% APR compounded continuously", inputs: { apr: 18, freq: "continuous" }, expected: { ear: "19.7217%" } },
    { name: "12% APR compounded annually", inputs: { apr: 12, freq: "1" }, expected: { ear: "12%" } },
  ],
};

/* ----------------------- Bond yield -------------------------------- */
export const bondYield: CalculatorDefinition = {
  slug: "bond-yield",
  name: "Bond Current Yield",
  description: "Current yield and approximate yield to maturity for a coupon-paying bond.",
  category: "finance",
  keywords: ["bond", "yield", "coupon", "fixed income", "current yield", "ytm"],
  status: "live",
  part: 3,
  inputs: [
    { name: "face", label: "Face value (par)", type: "number", default: 1000, min: 0, step: "any", unit: "$" },
    { name: "price", label: "Current market price", type: "number", default: 950, min: 0, step: "any", unit: "$" },
    { name: "coupon_rate", label: "Annual coupon rate", type: "number", default: 5, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Years to maturity", type: "number", default: 10, min: 1, step: 1, unit: "yrs" },
  ],
  related: ["compound-interest", "present-value", "future-value"],
  calculate: (raw) => {
    const face = toNum(raw.face);
    const price = toNum(raw.price);
    const couponRate = toNum(raw.coupon_rate) / 100;
    const years = Math.max(1, Math.round(toNum(raw.years)));
    if (price <= 0) {
      return { rows: [{ key: "current_yield", label: "Current yield", value: "—", hint: "Price must be positive." }] };
    }
    const annualCoupon = face * couponRate;
    const currentYield = (annualCoupon / price) * 100;
    // Approximate YTM: (C + (F − P)/n) / ((F + P)/2)
    const approxYTM = ((annualCoupon + (face - price) / years) / ((face + price) / 2)) * 100;
    const discount = price < face ? "discount" : price > face ? "premium" : "par";
    return {
      rows: [
        { key: "current_yield", label: "Current yield", value: `${fmt(currentYield, 4)}%`, emphasis: "primary" },
        { key: "ytm", label: "Approx. yield to maturity (YTM)", value: `${fmt(approxYTM, 4)}%`, emphasis: "primary" },
        { key: "annual_coupon", label: "Annual coupon payment", value: fmtUSD(annualCoupon) },
      ],
      sections: [{
        title: "Bond status",
        rows: [
          { key: "trading", label: "Trading at", value: discount },
          { key: "gain_loss", label: "Capital gain/loss at maturity", value: fmtUSD(face - price) },
        ],
      }],
      summary: "Current yield = annual coupon ÷ price. Approx YTM = (C + (F−P)/n) ÷ ((F+P)/2). True YTM requires iterative solving; this approximation is accurate to ~0.1% for typical bonds.",
    };
  },
  tests: [
    { name: "$1000 face @ $950, 5% coupon, 10y", inputs: { face: 1000, price: 950, coupon_rate: 5, years: 10 }, expected: { current_yield: "5.2632%" } },
    { name: "same bond approx YTM", inputs: { face: 1000, price: 950, coupon_rate: 5, years: 10 }, expected: { ytm: "5.6319%" }, tolerance: 0.01 },
  ],
};

/* ----------------------- Auto loan --------------------------------- */
export const autoLoan: CalculatorDefinition = {
  slug: "auto-loan",
  name: "Auto Loan Calculator",
  description: "Monthly payment and total cost for a car loan with trade-in and down payment.",
  category: "finance",
  keywords: ["auto loan", "car loan", "vehicle", "monthly payment", "trade-in"],
  status: "live",
  part: 3,
  inputs: [
    { name: "price", label: "Vehicle price", type: "number", default: 28000, min: 0, step: "any", unit: "$" },
    { name: "down", label: "Down payment", type: "number", default: 5000, min: 0, step: "any", unit: "$" },
    { name: "trade_in", label: "Trade-in value", type: "number", default: 3000, min: 0, step: "any", unit: "$" },
    { name: "rate", label: "Annual interest rate", type: "number", default: 6.5, min: 0, step: "any", unit: "%" },
    { name: "years", label: "Loan term", type: "number", default: 5, min: 1, max: 10, step: 1, unit: "yrs" },
    { name: "tax", label: "Sales tax rate", type: "number", default: 7, min: 0, step: "any", unit: "%" },
  ],
  related: ["loan-payment", "apr-ear", "simple-interest"],
  calculate: (raw) => {
    const price = toNum(raw.price);
    const down = toNum(raw.down);
    const tradeIn = toNum(raw.trade_in);
    const rate = toNum(raw.rate) / 100;
    const years = toNum(raw.years);
    const taxRate = toNum(raw.tax) / 100;
    const taxableAmount = Math.max(0, price - tradeIn);
    const tax = taxableAmount * taxRate;
    const amountFinanced = Math.max(0, price + tax - down - tradeIn);
    const r = rate / 12;
    const n = years * 12;
    const monthly = amountFinanced === 0 ? 0 : (r === 0 ? amountFinanced / n : amountFinanced * r / (1 - Math.pow(1 + r, -n)));
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - amountFinanced;
    return {
      rows: [
        { key: "monthly", label: "Monthly payment", value: fmtUSD(monthly), emphasis: "primary" },
        { key: "amount_financed", label: "Amount financed", value: fmtUSD(amountFinanced) },
        { key: "total_interest", label: "Total interest", value: fmtUSD(totalInterest) },
        { key: "total_cost", label: "Total cost (incl. tax + interest)", value: fmtUSD(down + tradeIn + totalPaid) },
      ],
      sections: [{
        title: "Loan summary",
        rows: [
          { key: "tax", label: "Sales tax", value: fmtUSD(tax) },
          { key: "down_pct", label: "Down payment %", value: `${fmt((down / price) * 100, 1)}%` },
        ],
      }],
      summary: "Standard amortized auto loan. Sales tax is typically applied to (price − trade-in) in most US states; rules vary by jurisdiction.",
    };
  },
  tests: [
    { name: "$28k car, $5k down, $3k trade, 6.5%/5y, 7% tax", inputs: { price: 28000, down: 5000, trade_in: 3000, rate: 6.5, years: 5, tax: 7 }, expected: { monthly: "$425.56" }, tolerance: 0.5 },
  ],
};

/* ----------------------- Refinance --------------------------------- */
export const refinance: CalculatorDefinition = {
  slug: "refinance",
  name: "Mortgage Refinance Calculator",
  description: "Compare an existing mortgage with a refinanced loan to find monthly savings and break-even.",
  category: "finance",
  keywords: ["refinance", "refi", "mortgage", "break-even", "closing costs"],
  status: "live",
  part: 3,
  inputs: [
    { name: "current_balance", label: "Current loan balance", type: "number", default: 200000, min: 0, step: "any", unit: "$" },
    { name: "current_rate", label: "Current interest rate", type: "number", default: 6.5, min: 0, step: "any", unit: "%" },
    { name: "current_years_left", label: "Years remaining on current loan", type: "number", default: 25, min: 1, step: 1, unit: "yrs" },
    { name: "new_rate", label: "New interest rate", type: "number", default: 5.0, min: 0, step: "any", unit: "%" },
    { name: "new_years", label: "New loan term", type: "number", default: 30, min: 1, step: 1, unit: "yrs" },
    { name: "closing_costs", label: "Closing costs", type: "number", default: 4000, min: 0, step: "any", unit: "$" },
  ],
  related: ["loan-payment", "mortgage-affordability", "auto-loan"],
  calculate: (raw) => {
    const bal = toNum(raw.current_balance);
    const curRate = toNum(raw.current_rate) / 100;
    const curYears = toNum(raw.current_years_left);
    const newRate = toNum(raw.new_rate) / 100;
    const newYears = toNum(raw.new_years);
    const closing = toNum(raw.closing_costs);
    function pmt(p: number, rate: number, years: number): number {
      const r = rate / 12;
      const n = years * 12;
      return r === 0 ? p / n : p * r / (1 - Math.pow(1 + r, -n));
    }
    const curPmt = pmt(bal, curRate, curYears);
    const newPmt = pmt(bal, newRate, newYears);
    const monthlySavings = curPmt - newPmt;
    const curTotal = curPmt * curYears * 12;
    const newTotal = newPmt * newYears * 12 + closing;
    const totalSavings = curTotal - newTotal;
    const breakEvenMonths = monthlySavings > 0 ? closing / monthlySavings : Infinity;
    return {
      rows: [
        { key: "cur_pmt", label: "Current monthly payment", value: fmtUSD(curPmt) },
        { key: "new_pmt", label: "New monthly payment", value: fmtUSD(newPmt) },
        { key: "monthly_savings", label: "Monthly savings", value: fmtUSD(monthlySavings), emphasis: monthlySavings > 0 ? "success" : "warning" },
        { key: "break_even", label: "Break-even (months to recoup closing)", value: Number.isFinite(breakEvenMonths) ? `${fmt(breakEvenMonths, 1)} months` : "Never", emphasis: "primary" },
      ],
      sections: [{
        title: "Lifetime cost",
        rows: [
          { key: "cur_total", label: `Total cost of current loan (${curYears}y)`, value: fmtUSD(curTotal) },
          { key: "new_total", label: `Total cost of new loan (${newYears}y)`, value: fmtUSD(newPmt * newYears * 12) },
          { key: "total_savings", label: "Lifetime savings (incl. closing)", value: fmtUSD(totalSavings) },
        ],
      }],
      summary: "Refinance makes sense if you'll stay past the break-even point. A lower rate but longer term can actually cost more in total interest — check the lifetime numbers.",
    };
  },
  tests: [
    { name: "$200k @ 6.5%/25y → 5%/30y, $4k closing", inputs: { current_balance: 200000, current_rate: 6.5, current_years_left: 25, new_rate: 5.0, new_years: 30, closing_costs: 4000 }, expected: { monthly_savings: "$276.77" }, tolerance: 2 },
  ],
};
