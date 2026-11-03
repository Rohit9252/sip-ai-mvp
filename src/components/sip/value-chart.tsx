"use client";

import { useMemo } from "react";
import type { DailyPoint } from "@/lib/sip";

export const RANGES = ["1M", "3M", "6M", "1Y"] as const;
export type Range = (typeof RANGES)[number];
const MONTHS: Record<Range, number> = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };

const W = 340;
const H = 150;
const PAD_Y = 10;

function monthsBefore(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns over time (gain as a percent of what was put in) as a thin line, against a dashed line at 0% for what was
 * put in, up to the replay's date. A plain value line would mostly show each new instalment stepping up, which hides
 * the fall; this shows the moment the SIP goes below what was put in. Hand-made SVG, no chart library.
 */
export function ValueChart({
  series,
  endDate,
  range,
  tone,
  label,
}: {
  series: DailyPoint[];
  endDate: string;
  range: Range;
  tone: "gain" | "loss" | "flat";
  label: string;
}) {
  const paths = useMemo(() => {
    const upTo = series.filter((p) => p.date <= endDate);
    const from = monthsBefore(endDate, MONTHS[range]);
    let points = upTo.filter((p) => p.date >= from);
    if (points.length < 2) points = upTo.slice(-2);
    if (points.length < 2) return null;

    const pct = points.map((p) => (p.invested > 0 ? ((p.value - p.invested) / p.invested) * 100 : 0));
    const min = Math.min(0, ...pct);
    const max = Math.max(0, ...pct);
    const span = max - min || 1;
    const x = (i: number) => (i / (points.length - 1)) * W;
    const y = (v: number) => PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2);

    const line = pct.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const zero = y(0).toFixed(1);
    return {
      line,
      zeroLine: `M0,${zero} L${W},${zero}`,
      area: `${line} L${W},${zero} L0,${zero} Z`,
      lastY: y(pct[pct.length - 1]),
    };
  }, [series, endDate, range]);

  const colour = tone === "loss" ? "var(--color-loss)" : tone === "gain" ? "var(--color-gain)" : "var(--color-muted)";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-37.5 w-full overflow-visible" role="img" aria-label={label} data-testid="chart">
      {paths && (
        <>
          <path d={paths.area} fill={colour} opacity="0.1" />
          <path d={paths.zeroLine} fill="none" stroke="var(--color-muted)" strokeWidth="1.25" strokeDasharray="4 4" opacity="0.8" vectorEffect="non-scaling-stroke" />
          <path d={paths.line} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <circle cx={W} cy={paths.lastY} r="3.5" fill={colour} />
        </>
      )}
    </svg>
  );
}
