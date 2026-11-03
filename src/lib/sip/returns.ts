import { formatRupees } from "./format";

/** "Total returns" under the value. The tone drives the colour; the arrow, the sign and the words carry the meaning. */
export type Returns = {
  tone: "gain" | "loss" | "flat";
  arrow: "up" | "down" | null;
  amountText: string;
  percentText: string;
};

/** Describes a gain (value minus invested) against what was invested. The percent is to one decimal. */
export function describeReturns(gain: number, invested: number): Returns {
  const tone = gain > 0 ? "gain" : gain < 0 ? "loss" : "flat";
  const sign = tone === "gain" ? "+" : tone === "loss" ? "-" : "";
  const pct = invested > 0 ? Math.abs((gain / invested) * 100).toFixed(1) : "0.0";
  return {
    tone,
    arrow: tone === "gain" ? "up" : tone === "loss" ? "down" : null,
    amountText: `${sign}${formatRupees(Math.abs(gain))}`,
    percentText: `${sign}${pct}%`,
  };
}
