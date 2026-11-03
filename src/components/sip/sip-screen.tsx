"use client";

import { useMemo, useState } from "react";
import { copy, monthName } from "@/lib/copy/dictionary";
import type { SipResponse } from "@/lib/api/types";
import { reasonLine } from "@/lib/helper";
import { describeReturns, formatDate, formatRupees } from "@/lib/sip";
import { track } from "@/lib/events";
import { useLang, useT } from "@/components/lang/lang-provider";
import { Segmented } from "@/components/ui/segmented";
import { ArrowLeftIcon, TriangleIcon } from "@/components/icons";
import { HelperSheet } from "@/components/helper/helper-sheet";
import { RANGES, ValueChart } from "./value-chart";
import type { Range } from "./value-chart";

/**
 * The SIP page in the style of an Indian investing app, with no logo (ADR-0004). It replays the SIP month by month
 * from month 1 (ADR-0005); at the first setback the helper card slides up.
 */
export function SipScreen({ data, onBack, onSample }: { data: SipResponse; onBack: () => void; onSample: () => void }) {
  const t = useT();
  const { lang } = useLang();
  const { snapshots, setback, facts, series, fund, request } = data;

  const setbackIndex = setback ? snapshots.findIndex((s) => s.date === setback.snapshot.date) : -1;
  const [index, setIndex] = useState(0);
  const [range, setRange] = useState<Range>("1Y");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [seenSetback, setSeenSetback] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [stopNote, setStopNote] = useState(false);

  const snap = snapshots[index];
  const atEnd = index === snapshots.length - 1;
  const returns = describeReturns(snap.gain, snap.invested);

  // The card appears once, the first time the replay reaches the setback month.
  function goTo(next: number) {
    const target = Math.max(0, Math.min(next, snapshots.length - 1));
    setIndex(target);
    if (setbackIndex >= 0 && target === setbackIndex && !seenSetback) {
      setSeenSetback(true);
      setSheetOpen(true);
      track("setback_shown", { month: snapshots[target].monthNumber });
    }
  }

  const words = returns.tone === "gain" ? copy.sip.above : returns.tone === "loss" ? copy.sip.below : copy.sip.equal;
  const initial = fund.schemeName.trim().charAt(0).toUpperCase();
  const shortName = useMemo(() => fund.schemeName.replace(/\s*-\s*Direct Plan.*$/i, "").replace(/\s*Direct.*$/i, ""), [fund.schemeName]);
  const showReasonLine = understood && facts && setbackIndex >= 0 && index >= setbackIndex;

  const endMessage = !setback
    ? snapshots.length < 4
      ? t(copy.replay.tooEarly)
      : snapshots.length >= 12
        ? t(copy.replay.noSetback)
        : t(copy.replay.noSetbackYet, { n: snapshots[snapshots.length - 1].monthNumber })
    : null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <main className="scroll-soft flex-1 overflow-y-auto pb-4">
        <div className="flex items-center gap-3 px-3 pb-2 pt-3">
          <button type="button" onClick={onBack} aria-label={t(copy.followup.back)} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-surface">
            <ArrowLeftIcon />
          </button>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-base font-semibold text-primary" aria-hidden>
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight" title={fund.schemeName}>
              {shortName}
            </p>
            <p className="text-xs text-muted">Direct · Growth</p>
          </div>
        </div>

        <div className="px-5 pt-2">
          <span className="inline-flex rounded-full bg-surface-strong px-3 py-1 text-xs font-medium text-ink" data-testid="month-badge">
            {t(copy.sip.monthBadge, { n: snap.monthNumber, month: monthName(snap.date.slice(0, 7), lang) })}
          </span>

          <p className="mt-4 text-sm text-muted">{t(copy.sip.value)}</p>
          <p className="num text-[34px] font-semibold leading-none tracking-tight" data-testid="value">
            {formatRupees(snap.value)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 border-y border-line py-3">
            <div>
              <p className="text-xs text-muted">{t(copy.sip.invested)}</p>
              <p className="num mt-0.5 text-[15px] font-semibold">{formatRupees(snap.invested)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">{t(copy.sip.returns)}</p>
              <p
                className={`num mt-0.5 flex items-center gap-1 text-[15px] font-semibold ${
                  returns.tone === "gain" ? "text-gain" : returns.tone === "loss" ? "text-loss" : "text-ink"
                }`}
                data-testid="returns"
              >
                {returns.arrow && <TriangleIcon direction={returns.arrow} width={12} height={12} />}
                {returns.amountText} <span className="font-medium">({returns.percentText})</span>
              </p>
            </div>
            <p className="col-span-2 -mt-2 text-xs text-muted">{t(words)}</p>
          </div>

          {showReasonLine && (
            <div className="anim-settle mt-3 flex gap-2.5 rounded-xl bg-primary-soft px-3.5 py-3" data-testid="reason-line">
              <span className="mt-0.5 text-primary" aria-hidden>
                ✓
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-ink">{reasonLine(facts!, lang)}</p>
                <button type="button" onClick={() => setSheetOpen(true)} className="mt-1 text-xs font-semibold text-primary">
                  {t(copy.helper.more)}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 px-3">
          <ValueChart series={series} endDate={snap.date} range={range} tone={returns.tone} label={t(copy.sip.chartLabel)} />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className={`h-0.5 w-4 rounded ${returns.tone === "loss" ? "bg-loss" : "bg-gain"}`} />
                {t(copy.sip.legendValue)}
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-0 w-4 border-t border-dashed border-muted" />
                {t(copy.sip.legendInvested)}
              </span>
            </div>
            <Segmented<Range> size="sm" label="Range" value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r, label: r }))} />
          </div>
          <p className="mt-3 px-2 text-[11px] text-muted" data-testid="source">
            {t(copy.common.source, { date: formatDate(snap.date) })}
          </p>
        </div>

        <div className="mx-5 mt-4 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">SIP</p>
              <p className="num mt-0.5 text-sm text-muted">
                {snap.instalments === 1
                  ? t(copy.sip.instalment1, { amount: formatRupees(request.monthlyAmount) })
                  : t(copy.sip.instalments, { n: snap.instalments, amount: formatRupees(request.monthlyAmount) })}
              </p>
            </div>
            {/* The stop button never moves and never hides: leaving stays one tap away. */}
            <button
              type="button"
              onClick={() => setStopNote((v) => !v)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-line hover:ring-ink/30"
            >
              {t(copy.sip.stop)}
            </button>
          </div>
          {stopNote && <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-muted">{t(copy.sip.stopNote)}</p>}
        </div>

        {atEnd && endMessage && (
          <div className="mx-5 mt-4 rounded-2xl bg-gain-soft p-4" data-testid="no-setback">
            <p className="text-sm leading-snug text-ink">{endMessage}</p>
            <button type="button" onClick={onSample} className="mt-2 text-sm font-semibold text-primary">
              {t(copy.replay.seeSample)}
            </button>
          </div>
        )}
      </main>

      <div className="screen-bottom shrink-0 border-t border-line bg-paper px-5 pb-4 pt-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => goTo(0)} disabled={index === 0} className="btn-quiet">
            {t(copy.replay.restart)}
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={atEnd}
            className="btn-primary flex-1"
            data-testid="next-month"
          >
            {t(copy.replay.next)}
          </button>
        </div>
        {setbackIndex > index && (
          <button type="button" onClick={() => goTo(setbackIndex)} className="mt-2 w-full text-center text-sm font-medium text-primary" data-testid="skip">
            {t(copy.replay.skip)}
          </button>
        )}
      </div>

      {sheetOpen && facts && (
        <HelperSheet
          facts={facts}
          request={request}
          onClose={() => setSheetOpen(false)}
          onUnderstood={() => {
            setUnderstood(true);
            setSheetOpen(false);
            track("got_it");
          }}
        />
      )}
    </div>
  );
}
