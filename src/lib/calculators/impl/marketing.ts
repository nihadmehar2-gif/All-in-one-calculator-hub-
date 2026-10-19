/**
 * Marketing and Business Metrics — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtUSD, toNum } from "../_format";

/* ------------------- Conversion rate -------------------------------- */
export const conversionRate: CalculatorDefinition = {
  slug: "conversion-rate",
  name: "Conversion Rate Calculator",
  description: "Compute conversion rate from visitors and conversions, plus A/B test lift.",
  category: "business",
  keywords: ["conversion", "marketing", "ab test", "lift", "funnel"],
  status: "live",
  part: 5,
  inputs: [
    { name: "visitors", label: "Total visitors", type: "number", default: 10000, min: 1, step: 1 },
    { name: "conversions", label: "Conversions", type: "number", default: 350, min: 0, step: 1 },
  ],
  related: ["unit-economics", "roi-payback", "discount-commission"],
  calculate: (raw) => {
    const v = toNum(raw.visitors);
    const c = toNum(raw.conversions);
    if (v <= 0) {
      return { rows: [{ key: "rate", label: "Conversion rate", value: "—" }] };
    }
    const rate = (c / v) * 100;
    return {
      rows: [
        { key: "rate", label: "Conversion rate", value: `${fmt(rate, 4)}%`, emphasis: "primary" },
        { key: "ratio", label: "Ratio", value: `1 in ${fmt(v / Math.max(1, c), 1)}` },
      ],
      sections: [{
        title: "Reference benchmarks",
        rows: [
          { key: "ecom", label: "E-commerce (avg)", value: "2-3%" },
          { key: "saas", label: "SaaS free trial signup", value: "5-10%" },
          { key: "landing", label: "Landing page (B2B)", value: "2-5%" },
          { key: "email", label: "Email click-through", value: "2-5%" },
        ],
      }],
      summary: "Conversion rate = conversions ÷ visitors × 100. Benchmarks vary widely by industry and channel.",
    };
  },
  tests: [
    { name: "350 / 10000 = 3.5%", inputs: { visitors: 10000, conversions: 350 }, expected: { rate: "3.5%" } },
  ],
};

/* ------------------- Customer Lifetime Value (CLV) ----------------- */
export const customerLifetimeValue: CalculatorDefinition = {
  slug: "customer-lifetime-value",
  name: "Customer Lifetime Value (CLV)",
  description: "Estimate CLV from average purchase value, frequency, customer lifespan and margin.",
  category: "business",
  keywords: ["clv", "ltv", "lifetime value", "customer", "marketing", "retention"],
  status: "live",
  part: 5,
  inputs: [
    { name: "avg_purchase", label: "Average purchase value", type: "number", default: 75, min: 0, step: "any", unit: "$" },
    { name: "frequency", label: "Purchases per year", type: "number", default: 6, min: 0, step: "any" },
    { name: "lifespan", label: "Customer lifespan (years)", type: "number", default: 5, min: 0.1, step: "any" },
    { name: "margin", label: "Gross margin", type: "number", default: 40, min: 0, max: 100, step: "any", unit: "%" },
    { name: "cac", label: "Customer acquisition cost (CAC)", type: "number", default: 100, min: 0, step: "any", unit: "$" },
  ],
  related: ["unit-economics", "conversion-rate", "roi-payback"],
  calculate: (raw) => {
    const avgP = toNum(raw.avg_purchase);
    const freq = toNum(raw.frequency);
    const life = toNum(raw.lifespan);
    const margin = toNum(raw.margin) / 100;
    const cac = toNum(raw.cac);
    const annualRevenue = avgP * freq;
    const annualProfit = annualRevenue * margin;
    const clv = annualProfit * life;
    const ratio = cac > 0 ? clv / cac : 0;
    const netValue = clv - cac;
    return {
      rows: [
        { key: "clv", label: "Customer lifetime value", value: fmtUSD(clv), emphasis: "primary" },
        { key: "ratio", label: "CLV : CAC ratio", value: `${fmt(ratio, 2)} : 1`, emphasis: ratio >= 3 ? "success" : "warning" },
        { key: "net", label: "Net value per customer", value: fmtUSD(netValue) },
      ],
      sections: [{
        title: "Inputs",
        rows: [
          { key: "annual_rev", label: "Annual revenue per customer", value: fmtUSD(annualRevenue) },
          { key: "annual_profit", label: "Annual profit per customer", value: fmtUSD(annualProfit) },
        ],
      }],
      summary: "CLV = avg purchase × frequency × lifespan × margin. Healthy SaaS rule of thumb: CLV:CAC ≥ 3:1.",
    };
  },
  tests: [
    { name: "$75 × 6 × 5 × 40% = $900 CLV", inputs: { avg_purchase: 75, frequency: 6, lifespan: 5, margin: 40, cac: 100 }, expected: { clv: "$900.00" } },
  ],
};

/* ------------------- Churn rate ------------------------------------ */
export const churnRate: CalculatorDefinition = {
  slug: "churn-rate",
  name: "Customer Churn Rate",
  description: "Compute monthly and annual churn rate from customer counts.",
  category: "business",
  keywords: ["churn", "retention", "subscription", "saas", "attrition"],
  status: "live",
  part: 5,
  inputs: [
    { name: "start_customers", label: "Customers at start of period", type: "number", default: 1000, min: 1, step: 1 },
    { name: "end_customers", label: "Customers at end of period", type: "number", default: 950, min: 0, step: 1 },
    { name: "new_customers", label: "New customers acquired in period", type: "number", default: 50, min: 0, step: 1 },
  ],
  related: ["customer-lifetime-value", "unit-economics", "conversion-rate"],
  calculate: (raw) => {
    const start = toNum(raw.start_customers);
    const end = toNum(raw.end_customers);
    const newC = toNum(raw.new_customers);
    if (start <= 0) {
      return { rows: [{ key: "churn", label: "Churn rate", value: "—" }] };
    }
    const lost = start - end + newC;
    const churnPct = (lost / start) * 100;
    const retentionPct = 100 - churnPct;
    const annualChurn = (1 - Math.pow(1 - churnPct / 100, 12)) * 100;
    return {
      rows: [
        { key: "churn", label: "Period churn rate", value: `${fmt(churnPct, 2)}%`, emphasis: "primary" },
        { key: "retention", label: "Retention rate", value: `${fmt(retentionPct, 2)}%`, emphasis: "primary" },
        { key: "annual_churn", label: "Annualized churn (compound)", value: `${fmt(annualChurn, 2)}%` },
        { key: "lost", label: "Customers lost", value: String(Math.max(0, lost)) },
      ],
      summary: "Churn = (start − end + new) ÷ start. Monthly churn of 5% → ~46% annual. Reducing churn is usually more cost-effective than acquiring new customers.",
    };
  },
  tests: [
    { name: "1000 start, 950 end, 50 new → 10% churn", inputs: { start_customers: 1000, end_customers: 950, new_customers: 50 }, expected: { churn: "10%" } },
  ],
};

/* ------------------- ROI of marketing campaign --------------------- */
export const marketingROI: CalculatorDefinition = {
  slug: "marketing-roi",
  name: "Marketing Campaign ROI",
  description: "Compute return on ad spend (ROAS) and ROI for a marketing campaign.",
  category: "business",
  keywords: ["marketing", "roi", "roas", "campaign", "ad spend", "advertising"],
  status: "live",
  part: 5,
  inputs: [
    { name: "spend", label: "Total ad spend", type: "number", default: 5000, min: 0, step: "any", unit: "$" },
    { name: "revenue", label: "Revenue attributed to campaign", type: "number", default: 18000, min: 0, step: "any", unit: "$" },
    { name: "margin", label: "Gross margin on revenue", type: "number", default: 50, min: 0, max: 100, step: "any", unit: "%" },
  ],
  related: ["roi-payback", "customer-lifetime-value", "conversion-rate"],
  calculate: (raw) => {
    const spend = toNum(raw.spend);
    const revenue = toNum(raw.revenue);
    const margin = toNum(raw.margin) / 100;
    if (spend <= 0) {
      return { rows: [{ key: "roas", label: "ROAS", value: "—" }] };
    }
    const roas = revenue / spend;
    const profit = revenue * margin - spend;
    const roi = (profit / spend) * 100;
    const breakEvenRevenue = spend / margin;
    return {
      rows: [
        { key: "roas", label: "ROAS (revenue ÷ spend)", value: `${fmt(roas, 2)}×`, emphasis: "primary" },
        { key: "roi", label: "ROI (profit ÷ spend)", value: `${fmt(roi, 2)}%`, emphasis: "primary" },
        { key: "profit", label: "Gross profit from campaign", value: fmtUSD(profit) },
        { key: "break_even", label: "Break-even revenue", value: fmtUSD(breakEvenRevenue) },
      ],
      summary: "ROAS = revenue ÷ spend. ROI = (revenue × margin − spend) ÷ spend × 100. ROAS ≥ 4× is profitable for most e-commerce with ~50% margin.",
    };
  },
  tests: [
    { name: "$5k spend, $18k rev, 50% margin", inputs: { spend: 5000, revenue: 18000, margin: 50 }, expected: { roas: "3.6×", roi: "80%" } },
  ],
};

/* ------------------- Email marketing metrics ----------------------- */
export const emailMetrics: CalculatorDefinition = {
  slug: "email-marketing-metrics",
  name: "Email Marketing Metrics",
  description: "Compute open rate, click-through rate, and bounce rate from campaign stats.",
  category: "business",
  keywords: ["email", "marketing", "open rate", "ctr", "bounce", "campaign"],
  status: "live",
  part: 5,
  inputs: [
    { name: "sent", label: "Emails sent", type: "number", default: 10000, min: 1, step: 1 },
    { name: "delivered", label: "Emails delivered", type: "number", default: 9850, min: 0, step: 1 },
    { name: "opens", label: "Unique opens", type: "number", default: 3200, min: 0, step: 1 },
    { name: "clicks", label: "Unique clicks", type: "number", default: 480, min: 0, step: 1 },
    { name: "unsubscribes", label: "Unsubscribes", type: "number", default: 25, min: 0, step: 1 },
  ],
  related: ["conversion-rate", "marketing-roi", "customer-lifetime-value"],
  calculate: (raw) => {
    const sent = toNum(raw.sent);
    const delivered = toNum(raw.delivered);
    const opens = toNum(raw.opens);
    const clicks = toNum(raw.clicks);
    const unsubs = toNum(raw.unsubscribes);
    if (sent <= 0 || delivered <= 0 || opens <= 0) {
      return { rows: [{ key: "open_rate", label: "Open rate", value: "—" }] };
    }
    const bounceRate = ((sent - delivered) / sent) * 100;
    const openRate = (opens / delivered) * 100;
    const ctr = (clicks / delivered) * 100;
    const ctor = (clicks / opens) * 100;
    const unsubRate = (unsubs / delivered) * 100;
    return {
      rows: [
        { key: "open_rate", label: "Open rate", value: `${fmt(openRate, 2)}%`, emphasis: "primary" },
        { key: "ctr", label: "Click-through rate (CTR)", value: `${fmt(ctr, 2)}%`, emphasis: "primary" },
        { key: "ctor", label: "Click-to-open rate (CTOR)", value: `${fmt(ctor, 2)}%` },
        { key: "bounce_rate", label: "Bounce rate", value: `${fmt(bounceRate, 2)}%` },
        { key: "unsub_rate", label: "Unsubscribe rate", value: `${fmt(unsubRate, 3)}%` },
      ],
      sections: [{
        title: "Industry benchmarks",
        rows: [
          { key: "open_bench", label: "Open rate (avg)", value: "20-25%" },
          { key: "ctr_bench", label: "CTR (avg)", value: "2-5%" },
          { key: "bounce_bench", label: "Bounce rate (good)", value: "<2%" },
          { key: "unsub_bench", label: "Unsub rate (acceptable)", value: "<0.5%" },
        ],
      }],
      summary: "Open rate = opens ÷ delivered. CTR = clicks ÷ delivered. CTOR = clicks ÷ opens (engagement quality). Bounce rate should stay below 2% to protect sender reputation.",
    };
  },
  tests: [
    { name: "9850 delivered, 3200 opens → 32.49% open", inputs: { sent: 10000, delivered: 9850, opens: 3200, clicks: 480, unsubscribes: 25 }, expected: { open_rate: "32.49%" } },
  ],
};
