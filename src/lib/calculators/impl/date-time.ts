/**
 * Date and Time — implemented calculators.
 */
import type { CalculatorDefinition } from "../types";

function parseDate(v: unknown): Date | null {
  if (v instanceof Date) return v;
  if (typeof v === "string" && v.trim()) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export const dateDifference: CalculatorDefinition = {
  slug: "date-difference",
  name: "Date Difference Calculator",
  description: "Compute the number of days, weeks, months and years between two dates.",
  category: "date-time",
  keywords: ["days between", "duration", "age", "calendar", "elapsed"],
  status: "live",
  part: 1,
  inputs: [
    { name: "start", label: "Start date", type: "date", default: "2024-01-01" },
    { name: "end", label: "End date", type: "date", default: "2024-12-31" },
  ],
  related: ["age-calculator", "workday-counter"],
  calculate: (raw) => {
    const a = parseDate(raw.start);
    const b = parseDate(raw.end);
    if (!a || !b) {
      return { rows: [{ key: "days", label: "Difference", value: "—", hint: "Pick both dates." }] };
    }
    const days = daysBetween(a, b);
    const weeks = days / 7;
    const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    const years = days / 365.25;
    return {
      rows: [
        { key: "days", label: "Total days", value: `${days}`, emphasis: "primary" },
        { key: "weeks", label: "Weeks", value: `${(weeks).toFixed(2)}` },
        { key: "months", label: "Calendar months", value: `${months}` },
        { key: "years", label: "Years (approx)", value: `${years.toFixed(3)}` },
      ],
      summary: "Calendar months count whole month boundaries crossed; days/years are exact ratios.",
    };
  },
  tests: [
    { name: "Jan 1 to Dec 31 2024 (leap year)", inputs: { start: "2024-01-01", end: "2024-12-31" }, expected: { days: "365" } },
    { name: "2024-01-01 to 2024-02-01", inputs: { start: "2024-01-01", end: "2024-02-01" }, expected: { days: "31" } },
  ],
};

/* ----------------------- Age calculator --------------------------- */
export const ageCalculator: CalculatorDefinition = {
  slug: "age-calculator",
  name: "Age Calculator",
  description: "Exact age in years, months, days and total days from birth date to today.",
  category: "date-time",
  keywords: ["age", "birthday", "born", "days alive", "years old"],
  status: "live",
  part: 4,
  inputs: [
    { name: "dob", label: "Date of birth", type: "date", default: "1990-01-15" },
  ],
  related: ["date-difference", "workday-counter", "pregnancy-due-date"],
  calculate: (raw) => {
    const dobStr = String(raw.dob ?? "");
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) {
      return { rows: [{ key: "age", label: "Age", value: "—", hint: "Enter a valid date." }] };
    }
    const now = new Date();
    if (dob > now) {
      return { rows: [{ key: "age", label: "Age", value: "—", hint: "Date of birth is in the future.", emphasis: "warning" }] };
    }
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    const totalDays = Math.floor((now.getTime() - dob.getTime()) / (24 * 60 * 60 * 1000));
    const totalMonths = years * 12 + months;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    // Next birthday
    const nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday < now) nextBday.setFullYear(nextBday.getFullYear() + 1);
    const daysToBday = Math.ceil((nextBday.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return {
      rows: [
        { key: "age", label: "Age", value: `${years} years, ${months} months, ${days} days`, emphasis: "primary" },
        { key: "total_months", label: "Total months", value: `${totalMonths}` },
        { key: "total_weeks", label: "Total weeks", value: `${totalWeeks}` },
        { key: "total_days", label: "Total days", value: `${totalDays}`, emphasis: "primary" },
        { key: "total_hours", label: "Total hours", value: `${totalHours.toLocaleString()}` },
        { key: "next_bday", label: "Days to next birthday", value: `${daysToBday}` },
      ],
      summary: "Exact age using calendar months. Total days accounts for leap years.",
    };
  },
  tests: [
    // Total months depends on current date; we test the calculation indirectly via total_days approximation
    { name: "DOB 1990-01-15 → at least 30 years", inputs: { dob: "1990-01-15" }, expected: { total_months: "441" }, tolerance: 24 },
  ],
};

/* ----------------------- Workday counter -------------------------- */
export const workdayCounter: CalculatorDefinition = {
  slug: "workday-counter",
  name: "Business Days Between Two Dates",
  description: "Count working days (Mon-Fri) and total days between two dates, with optional holiday list.",
  category: "date-time",
  keywords: ["workday", "business day", "working day", "weekday", "monday friday"],
  status: "live",
  part: 4,
  inputs: [
    { name: "start", label: "Start date", type: "date", default: "2024-01-01" },
    { name: "end", label: "End date", type: "date", default: "2024-01-31" },
    { name: "weekend", label: "Weekend days off", type: "select", default: "sat-sun",
      options: [
        { label: "Saturday + Sunday (most countries)", value: "sat-sun" },
        { label: "Friday + Saturday (Middle East)", value: "fri-sat" },
        { label: "Sunday only", value: "sun" },
      ] },
    { name: "holidays", label: "Holidays (comma-separated YYYY-MM-DD)", type: "text", default: "2024-01-01",
      placeholder: "2024-01-01, 2024-07-04" },
  ],
  related: ["date-difference", "age-calculator", "timezone-converter"],
  calculate: (raw) => {
    const startStr = String(raw.start ?? "");
    const endStr = String(raw.end ?? "");
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { rows: [{ key: "workdays", label: "Workdays", value: "—" }] };
    }
    const weekend = String(raw.weekend ?? "sat-sun");
    const holidaysStr = String(raw.holidays ?? "");
    const holidays = new Set<string>();
    for (const h of holidaysStr.split(",").map((s) => s.trim()).filter(Boolean)) {
      holidays.add(h);
    }
    const isWeekend = (d: Date): boolean => {
      const day = d.getDay(); // 0=Sun, 6=Sat
      if (weekend === "sat-sun") return day === 0 || day === 6;
      if (weekend === "fri-sat") return day === 5 || day === 6;
      if (weekend === "sun") return day === 0;
      return false;
    };
    const cur = new Date(start);
    let totalDays = 0;
    let workdays = 0;
    let weekendDays = 0;
    let holidayCount = 0;
    while (cur <= end) {
      const isoDate = cur.toISOString().slice(0, 10);
      const isHol = holidays.has(isoDate);
      const isWknd = isWeekend(cur);
      if (isHol) holidayCount++;
      if (isWknd) weekendDays++;
      if (!isWknd && !isHol) workdays++;
      totalDays++;
      cur.setDate(cur.getDate() + 1);
    }
    return {
      rows: [
        { key: "workdays", label: "Workdays (business days)", value: `${workdays}`, emphasis: "primary" },
        { key: "total_days", label: "Total calendar days", value: `${totalDays}` },
        { key: "weekend_days", label: "Weekend days", value: `${weekendDays}` },
        { key: "holidays", label: "Holidays in range", value: `${holidayCount}` },
      ],
      summary: "Workdays = total days − weekends − holidays (holidays that fall on weekends are counted in both). Add your own holiday list to match your region's calendar.",
    };
  },
  tests: [
    { name: "Jan 1-31 2024, Sat-Sun weekend, Jan 1 holiday", inputs: { start: "2024-01-01", end: "2024-01-31", weekend: "sat-sun", holidays: "2024-01-01" }, expected: { total_days: "31" } },
    { name: "Same → 22 workdays", inputs: { start: "2024-01-01", end: "2024-01-31", weekend: "sat-sun", holidays: "2024-01-01" }, expected: { workdays: "22" } },
  ],
};

/* --------------------- Timezone converter ------------------------- */
export const timezoneConverter: CalculatorDefinition = {
  slug: "timezone-converter",
  name: "Timezone Converter",
  description: "Convert a date/time from one timezone to another using IANA timezone names.",
  category: "date-time",
  keywords: ["timezone", "convert", "utc", "dst", "time zone", "et", "pt", "gmt"],
  status: "live",
  part: 4,
  inputs: [
    { name: "datetime", label: "Date and time", type: "text", default: "2024-07-15 14:00",
      placeholder: "YYYY-MM-DD HH:MM" },
    { name: "from_tz", label: "From timezone", type: "select", default: "America/New_York",
      options: [
        { label: "America/New_York (ET)", value: "America/New_York" },
        { label: "America/Chicago (CT)", value: "America/Chicago" },
        { label: "America/Denver (MT)", value: "America/Denver" },
        { label: "America/Los_Angeles (PT)", value: "America/Los_Angeles" },
        { label: "Europe/London (GMT/BST)", value: "Europe/London" },
        { label: "Europe/Paris (CET)", value: "Europe/Paris" },
        { label: "Asia/Karachi (PKT)", value: "Asia/Karachi" },
        { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
        { label: "Asia/Dubai (GST)", value: "Asia/Dubai" },
        { label: "Asia/Shanghai (CST)", value: "Asia/Shanghai" },
        { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
        { label: "Australia/Sydney (AEDT)", value: "Australia/Sydney" },
        { label: "UTC", value: "UTC" },
      ] },
    { name: "to_tz", label: "To timezone", type: "select", default: "Asia/Karachi",
      options: [
        { label: "America/New_York (ET)", value: "America/New_York" },
        { label: "America/Chicago (CT)", value: "America/Chicago" },
        { label: "America/Denver (MT)", value: "America/Denver" },
        { label: "America/Los_Angeles (PT)", value: "America/Los_Angeles" },
        { label: "Europe/London (GMT/BST)", value: "Europe/London" },
        { label: "Europe/Paris (CET)", value: "Europe/Paris" },
        { label: "Asia/Karachi (PKT)", value: "Asia/Karachi" },
        { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
        { label: "Asia/Dubai (GST)", value: "Asia/Dubai" },
        { label: "Asia/Shanghai (CST)", value: "Asia/Shanghai" },
        { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
        { label: "Australia/Sydney (AEDT)", value: "Australia/Sydney" },
        { label: "UTC", value: "UTC" },
      ] },
  ],
  related: ["date-difference", "age-calculator", "workday-counter"],
  calculate: (raw) => {
    const dtStr = String(raw.datetime ?? "");
    const fromTz = String(raw.from_tz ?? "UTC");
    const toTz = String(raw.to_tz ?? "UTC");
    const m = dtStr.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    if (!m) {
      return { rows: [{ key: "result", label: "Converted time", value: "—", hint: "Use format YYYY-MM-DD HH:MM." }] };
    }
    try {
      // Build the date as if it were in the from timezone
      const [_, y, mo, d, h, mi] = m;
      const dateStr = `${y}-${mo}-${d}T${h}:${mi}:00`;
      // Interpret in the from_tz, then output in to_tz
      const fromDate = new Date(dateStr + tzOffsetString(fromTz, Number(y), Number(mo), Number(d)));
      const outStr = fromDate.toLocaleString("en-US", {
        timeZone: toTz,
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
      });
      const utcStr = fromDate.toUTCString();
      return {
        rows: [
          { key: "result", label: `In ${toTz}`, value: outStr, emphasis: "primary" },
          { key: "utc", label: "UTC equivalent", value: utcStr },
        ],
        sections: [{
          title: "Common conversions",
          rows: [
            { key: "et_pt", label: "ET to PT", value: "−3 hours" },
            { key: "gmt_ist", label: "GMT to IST", value: "+5:30 hours" },
            { key: "pst_jst", label: "PT to JST", value: "+17 hours" },
          ],
        }],
        summary: "Timezone offsets include daylight-saving adjustments when applicable. Browser's Intl API handles the IANA timezone database. Verify critical conversions with an authoritative source.",
      };
    } catch (e) {
      return { rows: [{ key: "result", label: "Converted time", value: "—", hint: (e as Error).message }] };
    }
  },
  tests: [
    { name: "2024-07-15 14:00 ET → Pakistan", inputs: { datetime: "2024-07-15 14:00", from_tz: "America/New_York", to_tz: "Asia/Karachi" }, expected: { utc: "Mon, 15 Jul 2024 18:00:00 GMT" } },
  ],
};

// Compute the offset for a timezone at a given date (uses browser's Intl API)
function tzOffsetString(tz: string, year: number, month: number, day: number): string {
  if (tz === "UTC") return "Z";
  try {
    // Format a date in the target tz to extract its offset
    const dummy = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(dummy);
    const parts: Record<string, string> = {};
    for (const p of formatted) parts[p.type] = p.value;
    const tzDate = new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`);
    const offsetMs = tzDate.getTime() - dummy.getTime();
    const offsetMin = Math.round(offsetMs / 60000);
    const sign = offsetMin >= 0 ? "+" : "-";
    const absMin = Math.abs(offsetMin);
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  } catch {
    return "Z";
  }
}
