import { z } from "zod";
import { formatDate, formatMonth, formatPercent, formatRupees } from "./format";
import type { Move, SipInput, Snapshot } from "./types";

/**
 * The facts object (ADR-0001): every number the AI may use, worked out in code.
 * Each number comes twice: as a number, and as the exact words the person sees.
 * The number is already rounded to what the words show, so the two always agree.
 * Code later checks that every number in an AI reply appears here.
 */

const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Whole rupees: 4000 and "₹4,000". */
const MoneySchema = z.strictObject({ amount: z.number().int(), text: z.string() });

/** Whole rupees that can be below zero: -600, "-₹600", and the plain size "₹600". */
const SignedMoneySchema = z.strictObject({
  amount: z.number().int(),
  text: z.string(),
  absText: z.string(),
});

/** A percentage to one decimal: -11.7, "-11.7%", and the plain size "11.7%". */
const PercentSchema = z.strictObject({
  pct: z.number(),
  text: z.string(),
  absText: z.string(),
});

/** The fund and the market over the same two dates. */
const MoveSchema = z.strictObject({
  fromDate: IsoDateSchema,
  fromText: z.string(),
  toDate: IsoDateSchema,
  toText: z.string(),
  fundMove: PercentSchema,
  marketMove: PercentSchema,
});

export const FactsSchema = z.strictObject({
  /** True when the facts describe a setback. False when they describe the last finished month instead. */
  hasSetback: z.boolean(),
  fund: z.strictObject({ schemeCode: z.number().int(), name: z.string() }),
  market: z.strictObject({ schemeCode: z.number().int(), name: z.string() }),
  sip: z.strictObject({
    monthlyAmount: MoneySchema,
    sipDay: z.number().int(),
    startMonth: z.string().regex(/^\d{4}-\d{2}$/),
    startMonthText: z.string(),
  }),
  /** Which month of the SIP the facts are about. 1 is the start month. */
  monthNumber: z.number().int(),
  /** Instalments paid by `date`. */
  monthsKept: z.number().int(),
  /** The month-end the facts are about. */
  date: IsoDateSchema,
  dateText: z.string(),
  invested: MoneySchema,
  value: MoneySchema,
  gain: SignedMoneySchema,
  /** Previous month-end to `date`. In month 1 it starts at the first instalment. */
  monthMove: MoveSchema,
  /** First instalment to `date`. */
  sinceStartMove: MoveSchema,
  /** Where the NAVs come from. */
  source: z.string(),
});

export type Facts = z.infer<typeof FactsSchema>;

function money(amount: number) {
  return { amount, text: formatRupees(amount) };
}

function signedMoney(amount: number) {
  return { amount, text: formatRupees(amount), absText: formatRupees(Math.abs(amount)) };
}

/** Rounded to one decimal, never -0, with the words that show the same number. */
function percent(pct: number) {
  const rounded = Math.round(pct * 10) / 10 || 0;
  return { pct: rounded, text: formatPercent(rounded), absText: formatPercent(Math.abs(rounded)) };
}

function move(m: Move) {
  return {
    fromDate: m.fromDate,
    fromText: formatDate(m.fromDate),
    toDate: m.toDate,
    toText: formatDate(m.toDate),
    fundMove: percent(m.fundPct),
    marketMove: percent(m.marketPct),
  };
}

export function buildFacts(args: {
  input: SipInput;
  /** The month-end the facts are about. */
  focus: Snapshot;
  hasSetback: boolean;
  monthMove: Move;
  sinceStartMove: Move;
}): Facts {
  const { input, focus } = args;
  return FactsSchema.parse({
    hasSetback: args.hasSetback,
    fund: { schemeCode: input.fund.schemeCode, name: input.fund.schemeName },
    market: { schemeCode: input.market.schemeCode, name: input.market.schemeName },
    sip: {
      monthlyAmount: money(input.monthlyAmount),
      sipDay: input.sipDay,
      startMonth: input.startMonth,
      startMonthText: formatMonth(input.startMonth),
    },
    monthNumber: focus.monthNumber,
    monthsKept: focus.instalments,
    date: focus.date,
    dateText: formatDate(focus.date),
    invested: money(focus.invested),
    value: money(focus.value),
    gain: signedMoney(focus.gain),
    monthMove: move(args.monthMove),
    sinceStartMove: move(args.sinceStartMove),
    source: "AMFI, via mfapi.in",
  });
}
