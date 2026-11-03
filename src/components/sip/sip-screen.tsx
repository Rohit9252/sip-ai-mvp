"use client";

import { useMemo, useState } from "react";
import { copy, monthName } from "@/lib/copy/dictionary";
import { deskCopy } from "@/lib/copy/tour";
import type { SipResponse } from "@/lib/api/types";
import { reasonLine } from "@/lib/helper";
import { describeReturns, formatDate, formatRupees } from "@/lib/sip";
import type { Snapshot } from "@/lib/sip";
import { track } from "@/lib/events";
import { useLang, useT } from "@/components/lang/lang-provider";
import { useLayoutMode } from "@/components/device-shell/layout-mode";
import { Segmented } from "@/components/ui/segmented";
import { ArrowLeftIcon, CheckIcon, HelperIcon, TriangleIcon } from "@/components/icons";
import { HelperSheet, Learn } from "@/components/helper/helper-sheet";
import { learnCopy } from "@/lib/copy/learn";
import { manageCopy } from "@/lib/copy/manage";
import { ManageSheet } from "./manage-sheet";
import { RANGES, ValueChart } from "./value-chart";
import type { Range } from "./value-chart";

type Props = { data: SipResponse; onBack: () => void; onSample: () => void };

/**
 * The SIP page in the style of an Indian investing app, with no logo (ADR-0004). It replays the SIP month by month
 * from month 1 (ADR-0005); at the first setback the helper steps in: a sheet on a phone, the side panel on desktop.
 */
export function SipScreen({ data, onBack, onSample }: Props) {
  const t = useT();
  const { lang } = useLang();
  const desktop = useLayoutMode() === "desktop";
  const { snapshots, setback, facts, series, fund, request } = data;

  const setbackIndex = setback ? snapshots.findIndex((s) => s.date === setback.snapshot.date) : -1;
  const [index, setIndex] = useState(0);
  const [range, setRange] = useState<Range>("1Y");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [seenSetback, setSeenSetback] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [manage, setManage] = useState<"menu" | "withdraw" | null>(null);

  const snap = snapshots[index];
  const atEnd = index === snapshots.length - 1;
  const returns = describeReturns(snap.gain, snap.invested);
  const shortName = useMemo(() => fund.schemeName.replace(/\s*-\s*Direct Plan.*$/i, "").replace(/\s*Direct.*$/i, ""), [fund.schemeName]);
  const reachedSetback = setbackIndex >= 0 && index >= setbackIndex;
  const showReasonLine = understood && facts && reachedSetback;

  // The helper steps in once, the first time the replay reaches the setback month.
  function goTo(next: number) {
    const target = Math.max(0, Math.min(next, snapshots.length - 1));
    setIndex(target);
    if (setbackIndex >= 0 && target === setbackIndex && !seenSetback) {
      setSeenSetback(true);
      setSheetOpen(true);
      track("setback_shown", { month: snapshots[target].monthNumber });
    }
  }

  function understoodNow() {
    setUnderstood(true);
    setSheetOpen(false);
    track("got_it");
  }

  const endMessage = !setback
    ? snapshots.length < 4
      ? t(copy.replay.tooEarly)
      : snapshots.length >= 12
        ? t(copy.replay.noSetback)
        : t(copy.replay.noSetbackYet, { n: snapshots[snapshots.length - 1].monthNumber })
    : null;

  const words = returns.tone === "gain" ? copy.sip.above : returns.tone === "loss" ? copy.sip.below : copy.sip.equal;
  const toneText = returns.tone === "gain" ? "text-gain" : returns.tone === "loss" ? "text-loss" : "text-ink";
  const badge = t(copy.sip.monthBadge, { n: snap.monthNumber, month: monthName(snap.date.slice(0, 7), lang) });

  const fundHeader = (
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onBack} aria-label={t(copy.followup.back)} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-surface-strong">
        <ArrowLeftIcon />
      </button>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-base font-semibold text-primary" aria-hidden>
        {fund.schemeName.trim().charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold leading-tight ${desktop ? "text-lg" : "text-[15px]"}`} title={fund.schemeName}>
          {shortName}
        </p>
        <p className="num text-xs text-muted">Direct · Growth · {formatRupees(request.monthlyAmount)} / month</p>
      </div>
    </div>
  );

  const returnsLine = (
    <p className={`num flex flex-wrap items-center gap-x-1.5 gap-y-1 font-semibold ${toneText}`} data-testid="returns">
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {returns.arrow && <TriangleIcon direction={returns.arrow} width={12} height={12} />}
        {returns.amountText}
      </span>
      <span className="whitespace-nowrap font-medium">({returns.percentText})</span>
    </p>
  );

  const reasonLineBox = showReasonLine ? (
    <div className="anim-settle flex gap-2.5 rounded-xl bg-primary-soft px-3.5 py-3" data-testid="reason-line">
      <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug text-ink">{reasonLine(facts!, lang)}</p>
        {!desktop && (
          <button type="button" onClick={() => setSheetOpen(true)} className="mt-1 text-xs font-semibold text-primary">
            {t(copy.helper.more)}
          </button>
        )}
      </div>
    </div>
  ) : null;

  const chartBlock = (height: string) => (
    <div data-tour="chart">
      <ValueChart series={series} endDate={snap.date} range={range} tone={returns.tone} label={t(copy.sip.chartLabel)} className={height} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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
      <p className="mt-3 text-[11px] text-muted" data-testid="source">
        {t(copy.common.source, { date: formatDate(snap.date) })}
      </p>
    </div>
  );

  const sipCard = (
    <div className="rounded-2xl border border-line bg-paper p-4">
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
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              setManage("withdraw");
              track("manage_opened", { from: "withdraw" });
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-line hover:ring-ink/30"
            data-testid="withdraw"
          >
            {t(manageCopy.withdrawButton)}
          </button>
          <button
            type="button"
            onClick={() => {
              setManage("menu");
              track("manage_opened", { from: "stop" });
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-line hover:ring-ink/30"
            data-tour="stop"
            data-testid="stop"
          >
            {t(copy.sip.stop)}
          </button>
        </div>
      </div>
    </div>
  );

  const endBox =
    atEnd && endMessage ? (
      <div className="rounded-2xl bg-gain-soft p-4" data-testid="no-setback">
        <p className="text-sm leading-snug text-ink">{endMessage}</p>
        <button type="button" onClick={onSample} className="mt-2 text-sm font-semibold text-primary">
          {t(copy.replay.seeSample)}
        </button>
      </div>
    ) : null;

  const replayControls = (
    <div data-tour="replay">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => goTo(0)} disabled={index === 0} className="btn-quiet">
          {t(copy.replay.restart)}
        </button>
        <button type="button" onClick={() => goTo(index + 1)} disabled={atEnd} className="btn-primary flex-1" data-testid="next-month">
          {t(copy.replay.next)}
        </button>
      </div>
      {setbackIndex > index && (
        <button type="button" onClick={() => goTo(setbackIndex)} className="mt-2 w-full text-center text-sm font-medium text-primary" data-testid="skip">
          {t(copy.replay.skip)}
        </button>
      )}
    </div>
  );

  const manageSheet = manage ? (
    <ManageSheet
      start={manage}
      value={snap.value}
      monthlyAmount={request.monthlyAmount}
      firstInstalment={series[0]?.date ?? snap.date}
      onDate={snap.date}
      onClose={() => setManage(null)}
      onSeeWhy={
        reachedSetback && facts
          ? () => {
              setManage(null);
              setSheetOpen(true);
            }
          : undefined
      }
    />
  ) : null;

  if (desktop) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="scroll-soft flex-1 overflow-y-auto">
          <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)_400px] gap-6 px-8 pb-24 pt-6">
            <section className="flex min-w-0 flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                {fundHeader}
                <span className="shrink-0 rounded-full bg-paper px-3 py-1.5 text-xs font-medium ring-1 ring-line" data-testid="month-badge">
                  {badge}
                </span>
              </div>

              <div className="grid grid-cols-4 overflow-hidden rounded-2xl bg-paper ring-1 ring-line" data-tour="stats">
                <Stat label={t(copy.sip.value)}>
                  <p className="num text-[28px] font-semibold leading-none tracking-tight" data-testid="value">
                    {formatRupees(snap.value)}
                  </p>
                </Stat>
                <Stat label={t(copy.sip.invested)}>
                  <p className="num text-xl font-semibold leading-none">{formatRupees(snap.invested)}</p>
                </Stat>
                <Stat label={t(copy.sip.returns)}>
                  <div className="text-xl leading-tight">{returnsLine}</div>
                  <p className="mt-2 text-xs text-muted">{t(words)}</p>
                </Stat>
                <Stat label={t(deskCopy.monthOfSip)}>
                  <p className="num text-xl font-semibold leading-none">
                    {snap.monthNumber} <span className="text-sm font-medium text-muted">/ 12</span>
                  </p>
                  <p className="mt-2 text-xs text-muted">{monthName(snap.date.slice(0, 7), lang)}</p>
                </Stat>
              </div>

              <div className="rounded-2xl bg-paper p-5 ring-1 ring-line">{chartBlock("h-72")}</div>

              <div className="grid grid-cols-2 items-start gap-5">
                <div className="rounded-2xl bg-paper p-4 ring-1 ring-line">{replayControls}</div>
                {sipCard}
              </div>
              {endBox}

              <FirstYear snapshots={snapshots} upTo={index} setbackIndex={setbackIndex} onPick={goTo} />
            </section>

            <aside className="sticky top-6 self-start">
              <div className="flex h-[calc(100dvh-8rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
                <div className="flex shrink-0 items-center gap-2.5 border-b border-line px-5 py-3.5">
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-paper" aria-hidden>
                    <HelperIcon width={16} height={16} />
                  </span>
                  <h2 className="text-[15px] font-semibold">{t(deskCopy.helperTitle)}</h2>
                </div>
                {seenSetback && facts ? (
                  <>
                    {reasonLineBox && <div className="shrink-0 border-b border-line px-4 py-3">{reasonLineBox}</div>}
                    <HelperSheet variant="panel" facts={facts} request={request} onClose={() => {}} onUnderstood={understoodNow} />
                  </>
                ) : (
                  <div className="scroll-soft min-h-0 flex-1 overflow-y-auto px-5 py-5">
                    <p className="text-sm leading-relaxed text-muted">{t(deskCopy.helperWaiting)}</p>
                    {setbackIndex > index && (
                      <button type="button" onClick={() => goTo(setbackIndex)} className="mt-3 text-sm font-semibold text-primary">
                        {t(copy.replay.skip)}
                      </button>
                    )}
                    <h3 className="mt-6 text-[13px] font-semibold">{t(learnCopy.heading)}</h3>
                    <Learn />
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
        {manageSheet}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <main className="scroll-soft flex-1 overflow-y-auto pb-4">
        <div className="px-3 pb-2 pt-3">{fundHeader}</div>

        <div className="px-5 pt-2">
          <span className="inline-flex rounded-full bg-surface-strong px-3 py-1 text-xs font-medium text-ink" data-testid="month-badge">
            {badge}
          </span>

          <div data-tour="stats">
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
                <div className="mt-0.5 text-[15px]">{returnsLine}</div>
              </div>
              <p className="col-span-2 -mt-2 text-xs text-muted">{t(words)}</p>
            </div>
          </div>

          {reasonLineBox && <div className="mt-3">{reasonLineBox}</div>}
        </div>

        <div className="mt-4 px-5">{chartBlock("h-37.5")}</div>
        <div className="mx-5 mt-4">{sipCard}</div>
        {endBox && <div className="mx-5 mt-4">{endBox}</div>}
      </main>

      <div className="screen-bottom shrink-0 border-t border-line bg-paper px-5 pb-4 pt-3">{replayControls}</div>

      {sheetOpen && facts && <HelperSheet facts={facts} request={request} onClose={() => setSheetOpen(false)} onUnderstood={understoodNow} />}
      {manageSheet}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-l border-line p-5 first:border-l-0">
      <p className="mb-3 text-xs font-medium text-muted">{label}</p>
      {children}
    </div>
  );
}

/** Desktop only: every month-end so far, with its gap from what was put in. Facts, nothing more. */
function FirstYear({
  snapshots,
  upTo,
  setbackIndex,
  onPick,
}: {
  snapshots: Snapshot[];
  upTo: number;
  setbackIndex: number;
  onPick: (i: number) => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const rows = snapshots.slice(0, upTo + 1);
  return (
    <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
      <h3 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold">{t(deskCopy.firstYear)}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="px-5 py-2.5 font-medium">#</th>
            <th className="py-2.5 font-medium">{t(deskCopy.month)}</th>
            <th className="py-2.5 text-right font-medium">{t(copy.sip.invested)}</th>
            <th className="py-2.5 text-right font-medium">{t(copy.sip.value)}</th>
            <th className="px-5 py-2.5 text-right font-medium">{t(copy.sip.returns)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => {
            const r = describeReturns(s.gain, s.invested);
            return (
              <tr key={s.date} onClick={() => onPick(i)} className={`num cursor-pointer border-t border-line hover:bg-surface ${i === upTo ? "bg-surface" : ""}`}>
                <td className="px-5 py-2.5 text-muted">{s.monthNumber}</td>
                <td className="py-2.5">
                  {monthName(s.date.slice(0, 7), lang)}
                  {i === setbackIndex && (
                    <span className="ml-2 rounded-full bg-loss-soft px-2 py-0.5 text-[11px] font-semibold text-loss">{t(deskCopy.setbackTag)}</span>
                  )}
                </td>
                <td className="py-2.5 text-right">{formatRupees(s.invested)}</td>
                <td className="py-2.5 text-right">{formatRupees(s.value)}</td>
                <td className={`px-5 py-2.5 text-right font-medium ${r.tone === "gain" ? "text-gain" : r.tone === "loss" ? "text-loss" : ""}`}>
                  <span className="inline-flex items-center gap-1">
                    {r.arrow && <TriangleIcon direction={r.arrow} width={9} height={9} />}
                    {r.amountText}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
