import { addMonths, monthOf } from "@/lib/sip/dates";

/** The rules for the set-up screen. The browser and the server use the same ones, so they never disagree. */

export const AMOUNT_MIN = 100;
export const AMOUNT_MAX = 100000;
export const DAY_MIN = 1;
export const DAY_MAX = 28;
export const DEFAULT_DAY = 5;
/** The SIP must have started at least this many months ago, and at most this many (months before today's month). */
export const START_MONTHS_AGO_MIN = 4;
export const START_MONTHS_AGO_MAX = 24;

/** What the server needs to run a SIP. */
export type SipRequest = {
  schemeCode: number;
  /** "yyyy-mm". */
  startMonth: string;
  /** Whole rupees. */
  monthlyAmount: number;
  sipDay: number;
};

/** The fields of the set-up form. */
export type SetupField = "fund" | "start" | "amount" | "day";

/** The oldest and newest start months allowed on a given day (both "yyyy-mm"). */
export function startMonthRange(today: string): { min: string; max: string } {
  const thisMonth = monthOf(today);
  return { min: addMonths(thisMonth, -START_MONTHS_AGO_MAX), max: addMonths(thisMonth, -START_MONTHS_AGO_MIN) };
}

/** Every allowed start month, newest first. */
export function startMonthOptions(today: string): string[] {
  const { min, max } = startMonthRange(today);
  const months: string[] = [];
  for (let m = max; m >= min; m = addMonths(m, -1)) months.push(m);
  return months;
}

/** Digits only, after taking out spaces, commas and a rupee sign ("₹1,00,000" is 100000). Anything else is null. */
export function parseWholeNumber(text: string): number | null {
  const cleaned = text.replace(/[\s,₹]/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

const isRealMonth = (s: unknown): s is string => typeof s === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);

function startMonthOk(startMonth: unknown, today: string): boolean {
  if (!isRealMonth(startMonth)) return false;
  const { min, max } = startMonthRange(today);
  return startMonth >= min && startMonth <= max;
}

const amountOk = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n >= AMOUNT_MIN && n <= AMOUNT_MAX;
const dayOk = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n >= DAY_MIN && n <= DAY_MAX;
const fundOk = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n > 0;

/** What the person typed. The amount and the day are text, as typed. */
export type SetupForm = { schemeCode: number | null; startMonth: string; amount: string; day: string };

export type SetupCheck = {
  errors: Partial<Record<SetupField, true>>;
  /** The request to send, or null when any field is wrong. */
  request: SipRequest | null;
};

/** Checks the set-up form and says which fields are wrong, all at once. */
export function validateSetup(form: SetupForm, today: string): SetupCheck {
  const amount = parseWholeNumber(form.amount);
  const day = parseWholeNumber(form.day);
  const errors: SetupCheck["errors"] = {};
  if (!fundOk(form.schemeCode)) errors.fund = true;
  if (!startMonthOk(form.startMonth, today)) errors.start = true;
  if (!amountOk(amount)) errors.amount = true;
  if (!dayOk(day)) errors.day = true;
  if (Object.keys(errors).length > 0) return { errors, request: null };
  return {
    errors,
    request: { schemeCode: form.schemeCode!, startMonth: form.startMonth, monthlyAmount: amount!, sipDay: day! },
  };
}

export type RequestCheck = { ok: true; request: SipRequest } | { ok: false; fields: SetupField[] };

/** The server's check of a request body of unknown shape. It applies the same rules as the form. */
export function checkSipRequest(body: unknown, today: string): RequestCheck {
  const b = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const fields: SetupField[] = [];
  if (!fundOk(b.schemeCode)) fields.push("fund");
  if (!startMonthOk(b.startMonth, today)) fields.push("start");
  if (!amountOk(b.monthlyAmount)) fields.push("amount");
  if (!dayOk(b.sipDay)) fields.push("day");
  if (fields.length > 0) return { ok: false, fields };
  return {
    ok: true,
    request: {
      schemeCode: b.schemeCode as number,
      startMonth: b.startMonth as string,
      monthlyAmount: b.monthlyAmount as number,
      sipDay: b.sipDay as number,
    },
  };
}
