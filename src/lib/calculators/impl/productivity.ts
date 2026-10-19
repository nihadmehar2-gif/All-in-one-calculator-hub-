/**
 * Productivity, Time Tracking and Payroll — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, fmtFixed, fmtUSD, toNum } from "../_format";

/* --------------------- Hourly rate from salary --------------------- */
export const hourlyRate: CalculatorDefinition = {
  slug: "hourly-rate",
  name: "Effective Hourly Rate",
  description: "Compute effective hourly rate from annual salary and actual hours worked.",
  category: "productivity",
  keywords: ["hourly rate", "salary", "effective rate", "wage", "pay"],
  status: "live",
  part: 5,
  inputs: [
    { name: "salary", label: "Annual salary", type: "number", default: 75000, min: 0, step: "any", unit: "$" },
    { name: "hours_per_week", label: "Hours worked per week", type: "number", default: 45, min: 1, max: 168, step: "any" },
    { name: "weeks_per_year", label: "Weeks worked per year", type: "number", default: 50, min: 1, max: 52, step: 1 },
    { name: "benefits", label: "Annual benefits value", type: "number", default: 15000, min: 0, step: "any", unit: "$",
      help: "Health insurance, 401k match, etc. Set 0 to ignore." },
  ],
  related: ["wage-conversion", "salary-take-home", "overtime"],
  calculate: (raw) => {
    const salary = toNum(raw.salary);
    const hpw = toNum(raw.hours_per_week);
    const wpy = toNum(raw.weeks_per_year);
    const benefits = toNum(raw.benefits);
    const totalHours = hpw * wpy;
    if (totalHours <= 0) {
      return { rows: [{ key: "hourly", label: "Effective hourly rate", value: "—" }] };
    }
    const totalComp = salary + benefits;
    const hourly = totalComp / totalHours;
    const hourlyNoBenefits = salary / totalHours;
    return {
      rows: [
        { key: "hourly", label: "Effective hourly rate (with benefits)", value: `${fmtUSD(hourly)}/hr`, emphasis: "primary" },
        { key: "hourly_no_benefits", label: "Hourly rate (salary only)", value: `${fmtUSD(hourlyNoBenefits)}/hr`, emphasis: "primary" },
        { key: "total_comp", label: "Total annual compensation", value: fmtUSD(totalComp) },
        { key: "total_hours", label: "Total hours worked/yr", value: `${fmt(totalHours, 0)}` },
      ],
      summary: "Effective hourly rate = (salary + benefits) ÷ (hours × weeks). 50 weeks at 40h = 2000h standard; many salaried roles actually work 45-50h, lowering the effective rate.",
    };
  },
  tests: [
    { name: "$75k, 45h × 50w + $15k benefits → $40/hr", inputs: { salary: 75000, hours_per_week: 45, weeks_per_year: 50, benefits: 15000 }, expected: { hourly: "$40.00/hr" } },
  ],
};

/* ------------------- Pomodoro planner ------------------------------ */
export const pomodoroPlanner: CalculatorDefinition = {
  slug: "pomodoro-planner",
  name: "Pomodoro Planner",
  description: "Plan a focus session with N pomodoros and compute total time including breaks.",
  category: "productivity",
  keywords: ["pomodoro", "focus", "productivity", "break", "work session"],
  status: "live",
  part: 5,
  inputs: [
    { name: "num_pomodoros", label: "Number of pomodoros", type: "number", default: 4, min: 1, max: 20, step: 1 },
    { name: "work_min", label: "Work duration per pomodoro", type: "number", default: 25, min: 1, max: 90, step: 1, unit: "min" },
    { name: "short_break", label: "Short break", type: "number", default: 5, min: 1, max: 30, step: 1, unit: "min" },
    { name: "long_break", label: "Long break (every 4 pomodoros)", type: "number", default: 15, min: 1, max: 60, step: 1, unit: "min" },
  ],
  related: ["hourly-rate", "reading-time"],
  calculate: (raw) => {
    const n = Math.max(1, Math.round(toNum(raw.num_pomodoros)));
    const work = toNum(raw.work_min);
    const shortB = toNum(raw.short_break);
    const longB = toNum(raw.long_break);
    const totalWork = n * work;
    // Short breaks between every pomodoro except after the last; long break after every 4th
    const shortBreaks = n - 1;
    const longBreaks = Math.floor(n / 4);
    const adjustedShortBreaks = Math.max(0, shortBreaks - longBreaks);
    const totalBreaks = adjustedShortBreaks * shortB + longBreaks * longB;
    const totalTime = totalWork + totalBreaks;
    const endH = Math.floor(totalTime / 60);
    const endM = totalTime % 60;
    return {
      rows: [
        { key: "total_time", label: "Total session time", value: `${endH}h ${endM}m`, emphasis: "primary" },
        { key: "total_work", label: "Total focus time", value: `${totalWork} min`, emphasis: "primary" },
        { key: "total_breaks", label: "Total break time", value: `${totalBreaks} min` },
        { key: "long_breaks", label: "Long breaks taken", value: String(longBreaks) },
      ],
      summary: `Plan: ${n} × ${work}min work sessions. Short breaks (${shortB}min) between pomodoros, long breaks (${longB}min) every 4 pomodoros. Adjust the rhythm to match your focus style.`,
    };
  },
  tests: [
    { name: "4 pomodoros, 25/5/15", inputs: { num_pomodoros: 4, work_min: 25, short_break: 5, long_break: 15 }, expected: { total_time: "2h 5m" } },
    { name: "1 pomodoro, 25/5/15", inputs: { num_pomodoros: 1, work_min: 25, short_break: 5, long_break: 15 }, expected: { total_time: "0h 25m" } },
  ],
};

/* ------------------- Time tracking / billable ---------------------- */
export const timeTracking: CalculatorDefinition = {
  slug: "time-tracking",
  name: "Time Tracking & Billable Hours",
  description: "Convert logged time entries to billable hours, revenue, and utilization rate.",
  category: "productivity",
  keywords: ["time tracking", "billable", "freelance", "consulting", "utilization"],
  status: "live",
  part: 5,
  inputs: [
    { name: "entries", label: "Time entries (one per line: <hours> <billable yes/no>)", type: "textarea",
      default: "2.5 yes\n1.0 no\n3.0 yes\n0.5 no\n4.0 yes",
      placeholder: "hours billable\ne.g. 2.5 yes" },
    { name: "rate", label: "Billable rate", type: "number", default: 100, min: 0, step: "any", unit: "$/hr" },
  ],
  related: ["hourly-rate", "invoice-total", "wage-conversion"],
  calculate: (raw) => {
    const text = String(raw.entries ?? "");
    const rate = toNum(raw.rate);
    let billableHours = 0, nonBillableHours = 0;
    const entries: { hours: number; billable: boolean }[] = [];
    for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const hours = toNum(parts[0]);
      const billable = parts[1].toLowerCase().startsWith("y");
      if (Number.isFinite(hours)) {
        entries.push({ hours, billable });
        if (billable) billableHours += hours;
        else nonBillableHours += hours;
      }
    }
    const totalHours = billableHours + nonBillableHours;
    const revenue = billableHours * rate;
    const utilization = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
    return {
      rows: [
        { key: "revenue", label: "Total billable revenue", value: fmtUSD(revenue), emphasis: "primary" },
        { key: "billable", label: "Billable hours", value: `${fmt(billableHours, 2)}`, emphasis: "primary" },
        { key: "total", label: "Total hours logged", value: `${fmt(totalHours, 2)}` },
        { key: "utilization", label: "Utilization rate", value: `${fmt(utilization, 1)}%` },
      ],
      sections: [{
        title: "Entries",
        rows: entries.map((e, i) => ({ key: `e${i}`, label: `Entry ${i + 1}`, value: `${fmt(e.hours, 2)}h ${e.billable ? "✓ billable" : "✗ non-billable"}` })),
      }],
      summary: "Billable revenue = billable hours × rate. Utilization = billable ÷ total hours. Many consultancies target 60-80% utilization.",
    };
  },
  tests: [
    { name: "Sample entries → 9.5 billable × $100", inputs: { entries: "2.5 yes\n1.0 no\n3.0 yes\n0.5 no\n4.0 yes", rate: 100 }, expected: { revenue: "$950.00" } },
  ],
};

/* ------------------- Invoice total --------------------------------- */
export const invoiceTotal: CalculatorDefinition = {
  slug: "invoice-total",
  name: "Invoice Total Calculator",
  description: "Compute invoice subtotal, tax and total from line items.",
  category: "productivity",
  keywords: ["invoice", "billing", "subtotal", "tax", "freelance"],
  status: "live",
  part: 5,
  inputs: [
    { name: "items", label: "Line items (one per line: <qty> <unit_price>)", type: "textarea",
      default: "2 50\n5 25\n1 200\n3 15",
      placeholder: "qty unit_price\ne.g. 2 50" },
    { name: "tax_rate", label: "Tax rate", type: "number", default: 8.25, min: 0, step: "any", unit: "%" },
    { name: "discount", label: "Discount", type: "number", default: 0, min: 0, step: "any", unit: "$" },
  ],
  related: ["time-tracking", "hourly-rate", "sales-tax-vat-gst"],
  calculate: (raw) => {
    const text = String(raw.items ?? "");
    const taxRate = toNum(raw.tax_rate) / 100;
    const discount = toNum(raw.discount);
    let subtotal = 0;
    const items: { qty: number; price: number; line: number }[] = [];
    for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) continue;
      const qty = toNum(parts[0]);
      const price = toNum(parts[1]);
      if (Number.isFinite(qty) && Number.isFinite(price)) {
        const lineTotal = qty * price;
        items.push({ qty, price, line: lineTotal });
        subtotal += lineTotal;
      }
    }
    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = afterDiscount * taxRate;
    const total = afterDiscount + tax;
    return {
      rows: [
        { key: "subtotal", label: "Subtotal", value: fmtUSD(subtotal), emphasis: "primary" },
        { key: "discount", label: "Discount", value: fmtUSD(discount) },
        { key: "tax", label: `Tax (${(taxRate * 100).toFixed(2)}%)`, value: fmtUSD(tax) },
        { key: "total", label: "Total due", value: fmtUSD(total), emphasis: "primary" },
      ],
      sections: [{
        title: "Line items",
        rows: items.map((it, i) => ({ key: `i${i}`, label: `${fmt(it.qty, 2)} × ${fmtUSD(it.price)}`, value: fmtUSD(it.line) })),
      }],
      summary: "Total = (subtotal − discount) × (1 + tax). Apply tax after discount, as is typical in most jurisdictions.",
    };
  },
  tests: [
    { name: "Sample items + 8.25% tax + $0 discount", inputs: { items: "2 50\n5 25\n1 200\n3 15", tax_rate: 8.25, discount: 0 }, expected: { total: "$508.78" } },
  ],
};

/* ------------------- Meeting cost ---------------------------------- */
export const meetingCost: CalculatorDefinition = {
  slug: "meeting-cost",
  name: "Meeting Cost Calculator",
  description: "Estimate the cost of a meeting based on attendees and their hourly rates.",
  category: "productivity",
  keywords: ["meeting", "cost", "salary", "time", "productivity"],
  status: "live",
  part: 5,
  inputs: [
    { name: "attendees", label: "Attendees (one per line: <hourly_rate>)", type: "textarea",
      default: "75\n50\n60\n90",
      placeholder: "hourly rate per attendee\ne.g. 75" },
    { name: "duration_min", label: "Meeting duration", type: "number", default: 60, min: 1, step: 1, unit: "min" },
  ],
  related: ["hourly-rate", "time-tracking", "wage-conversion"],
  calculate: (raw) => {
    const text = String(raw.attendees ?? "");
    const rates = text.split(/\n+/).map((l) => l.trim()).filter(Boolean).map(toNum).filter((n) => Number.isFinite(n) && n > 0);
    const durMin = toNum(raw.duration_min);
    if (rates.length === 0 || durMin <= 0) {
      return { rows: [{ key: "cost", label: "Total cost", value: "—" }] };
    }
    const durH = durMin / 60;
    const totalCost = rates.reduce((sum, r) => sum + r * durH, 0);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    return {
      rows: [
        { key: "cost", label: "Total meeting cost", value: fmtUSD(totalCost), emphasis: "primary" },
        { key: "attendees", label: "Number of attendees", value: String(rates.length) },
        { key: "avg_rate", label: "Average hourly rate", value: fmtUSD(avgRate) },
        { key: "per_min", label: "Cost per minute", value: fmtUSD(totalCost / durMin) },
      ],
      summary: "Total cost = Σ(rate × duration). Many meetings could be emails — this calculator makes the trade-off visible.",
    };
  },
  tests: [
    { name: "4 attendees @ $75, $50, $60, $90, 60 min", inputs: { attendees: "75\n50\n60\n90", duration_min: 60 }, expected: { cost: "$275.00" } },
  ],
};
