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
