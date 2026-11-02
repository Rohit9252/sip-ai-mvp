/** Words for numbers and dates, the Indian way. These are the only formatters the app uses. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Indian digit grouping: the last three digits, then groups of two (1234567 -> "12,34,567"). */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const head = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${head},${digits.slice(-3)}`;
}

/** Whole rupees with the rupee sign: 123456 -> "₹1,23,456", -4215 -> "-₹4,215". Paise are rounded away. */
export function formatRupees(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return "₹0";
  const sign = rounded < 0 ? "-" : "";
  return `${sign}₹${groupIndian(String(Math.abs(rounded)))}`;
}

/** One decimal, minus sign only when it is really below zero: -11.719 -> "-11.7%", -0.04 -> "0.0%". */
export function formatPercent(pct: number): string {
  const rounded = Math.round(pct * 10) / 10;
  if (rounded === 0) return "0.0%";
  return `${rounded.toFixed(1)}%`;
}

/** "2026-03-31" -> "31 Mar 2026". */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** "2025-08" -> "Aug 2025". */
export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}
