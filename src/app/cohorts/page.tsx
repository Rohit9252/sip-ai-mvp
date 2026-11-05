import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Card, ProofPage } from "@/components/proof/proof-page";
import { todayInIndia } from "@/lib/api/today";
import { navClient } from "@/lib/nav";
import { cohortRows, cohortSummary } from "@/lib/proof/cohorts";
import type { CohortRow } from "@/lib/proof/cohorts";
import { formatMonth } from "@/lib/sip";

export const metadata: Metadata = { title: "Cohort proof · Your SIP, explained" };

const FIRST_START = "2024-11";
const STARTS = 13;
const AMOUNT = 1000;
const SIP_DAY = 5;

const FUNDS = [
  { code: 120716, name: "UTI Nifty 50 Index Fund (the whole market)" },
  { code: 118955, name: "HDFC Flexi Cap Fund (a popular active fund)" },
];

/** One decimal with a sign; a value that rounds to zero shows as 0.0, never -0.0. */
function signed(pct: number): string {
  const v = Math.round(pct * 10) / 10;
  if (v === 0) return "0.0";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}`;
}

/** A cell's colour: deeper orange the further below what was put in, green above it. */
function cellStyle(gainPct: number): React.CSSProperties {
  if (gainPct < 0) {
    const depth = Math.min(1, Math.abs(gainPct) / 10);
    return { background: `rgba(194, 65, 12, ${0.15 + depth * 0.65})`, color: depth > 0.55 ? "#fff" : "#1f2432" };
  }
  const height = Math.min(1, gainPct / 15);
  return { background: `rgba(0, 121, 107, ${0.1 + height * 0.45})`, color: "#1f2432" };
}

function Grid({ rows }: { rows: CohortRow[] }) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-1 text-center text-xs tabular-nums">
        <thead>
          <tr>
            <th className="text-left font-semibold text-muted">SIP started</th>
            {months.map((m) => (
              <th key={m} className={`font-semibold ${m >= 4 ? "text-ink" : "text-muted"}`}>
                M{m}
              </th>
            ))}
            <th className="text-left font-semibold text-ink">First fall, months 4 to 12</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.startMonth}>
              <td className="whitespace-nowrap pr-2 text-left font-medium text-ink">{formatMonth(row.startMonth)}</td>
              {months.map((m) => {
                const cell = row.cells.find((c) => c.monthNumber === m);
                if (!cell) return <td key={m} className="rounded-md bg-surface text-muted">·</td>;
                const first = row.setbackMonth === m;
                return (
                  <td
                    key={m}
                    className={`rounded-md px-1 py-1.5 ${first ? "outline-2 outline-ink" : ""}`}
                    style={cellStyle(cell.gainPct)}
                    title={`Month ${m}: ${signed(cell.gainPct)}% against money put in`}
                  >
                    {signed(cell.gainPct)}
                  </td>
                );
              })}
              <td className="whitespace-nowrap pl-2 text-left font-medium">
                {row.setbackMonth ? <span className="text-loss">Month {row.setbackMonth}</span> : <span className="text-gain">None</span>}
                {!row.complete && <span className="text-muted"> (not 12 months yet)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Worked out on each visit from AMFI NAVs (the NAV client keeps a 12 hour cache), so it renders at request time. */
async function Results() {
  await connection();
  const asOf = todayInIndia();
  let results: { name: string; rows: CohortRow[] }[] | null = null;
  try {
    const market = await navClient.getMarketHistory();
    results = await Promise.all(
      FUNDS.map(async (f) => {
        const fund = f.code === 120716 ? market : await navClient.getNavHistory(f.code);
        return {
          name: f.name,
          rows: cohortRows({ fund, market, firstStartMonth: FIRST_START, starts: STARTS, monthlyAmount: AMOUNT, sipDay: SIP_DAY, asOf }),
        };
      }),
    );
  } catch {
    results = null;
  }

  return (
    <>
      {results === null ? (
        <Card title="Prices are not available right now" tone="warn">
          <p>We could not load fund prices from mfapi.in. Please try again in a minute.</p>
        </Card>
      ) : (
        results.map(({ name, rows }) => {
          const s = cohortSummary(rows);
          return (
            <Card key={name} title={name} tone="accent">
              <p className="text-base">
                <span className="text-2xl font-semibold text-loss">
                  {s.fell} of {s.reached}
                </span>{" "}
                start months fell below the money put in at least once in months 4 to 12.
              </p>
              <Grid rows={rows} />
            </Card>
          );
        })
      )}
      <p className="text-sm text-muted">
        Prices: AMFI, via mfapi.in, as of {asOf}. Month-end values, the same rule the SIP page uses (ADR-0005). A replay of public
        prices, not any person&apos;s account.
      </p>
    </>
  );
}

export default function CohortsPage() {
  return (
    <ProofPage
      current="/cohorts"
      title="Cohort proof: for most first-timers, a fall in months 4 to 12 is normal"
      lead={`The same SIP (₹${AMOUNT.toLocaleString("en-IN")} a month on the ${SIP_DAY}th) started in each month from ${formatMonth(FIRST_START)}, replayed on real AMFI prices with the same engine as the SIP page. Each cell is the month-end value against the money put in so far, in percent. The outlined cell is the first month in 4 to 12 that ended below what was put in.`}
    >
      <Suspense fallback={<p className="text-muted">Replaying each start month on real prices...</p>}>
        <Results />
      </Suspense>
      <Card title="Why this matters for the product">
        <p>
          A first-timer sees only their own SIP, so their first fall looks like their own mistake. Across start months the fall is the
          normal case, not the exception. That is the fact the helper puts next to their number: their fund against the whole market,
          for the same month.
        </p>
      </Card>
    </ProofPage>
  );
}
