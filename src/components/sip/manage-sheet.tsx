"use client";

import { useState } from "react";
import { manageCopy, STOP_REASONS } from "@/lib/copy/manage";
import type { StopReason } from "@/lib/copy/manage";
import { parseWholeNumber } from "@/lib/setup/rules";
import { formatRupees, withdrawal } from "@/lib/sip";
import { track } from "@/lib/events";
import { OverlayLayer } from "@/components/device-shell/overlay-layer";
import { useLayoutMode } from "@/components/device-shell/layout-mode";
import { useT } from "@/components/lang/lang-provider";
import { Segmented } from "@/components/ui/segmented";
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon } from "@/components/icons";

export type ManageAction = "stop" | "skip" | "withdraw";
type Step = "menu" | "withdraw" | "reason" | "done";

/**
 * Stop, skip one instalment, or withdraw. Facts first, the person's choice always one tap away: no "are you sure",
 * no warnings, no urgency (the brief). An optional, skippable reason question tells us whether stops come from a
 * cash need or a fall. In this concept nothing real changes, and the last screen says so.
 */
export function ManageSheet({
  start,
  value,
  monthlyAmount,
  firstInstalment,
  onDate,
  onClose,
  onSeeWhy,
}: {
  start: "menu" | "withdraw";
  value: number;
  monthlyAmount: number;
  firstInstalment: string;
  onDate: string;
  onClose: () => void;
  /** Opens the helper's explanation, when the replay has reached the setback. */
  onSeeWhy?: () => void;
}) {
  const t = useT();
  const desktop = useLayoutMode() === "desktop";
  const [step, setStep] = useState<Step>(start);
  const [action, setAction] = useState<ManageAction | null>(start === "withdraw" ? "withdraw" : null);
  const [mode, setMode] = useState<"all" | "part">("all");
  const [partText, setPartText] = useState("");
  const [reason, setReason] = useState<StopReason | null>(null);

  const partAmount = parseWholeNumber(partText);
  const amount = mode === "all" ? value : partAmount ?? 0;
  const amountOk = mode === "all" || (partAmount !== null && partAmount >= 1 && partAmount <= value);
  const w = withdrawal(amountOk ? amount : 0, firstInstalment, onDate);
  const valueText = formatRupees(value);

  function choose(a: ManageAction) {
    setAction(a);
    if (a === "skip") return finish(a, null);
    setStep(a === "withdraw" ? "withdraw" : "reason");
  }

  function finish(a: ManageAction, r: StopReason | null) {
    track("manage_action", { action: a, reason: r ?? "none", ...(a === "withdraw" ? { all: mode === "all" } : {}) });
    setStep("done");
  }

  const back = (to: Step) => (
    <button type="button" onClick={() => setStep(to)} aria-label={t(manageCopy.close)} className="grid size-10 place-items-center rounded-full hover:bg-surface">
      <ArrowLeftIcon />
    </button>
  );

  let body: React.ReactNode;
  if (step === "menu") {
    body = (
      <>
        <Header title={t(manageCopy.title)} onClose={onClose} closeLabel={t(manageCopy.close)} />
        <div className="flex flex-col gap-2 px-5 pb-2">
          <ActionRow title={t(manageCopy.stopTitle)} fact={t(manageCopy.stopFact, { value: valueText })} onClick={() => choose("stop")} testId="manage-stop" />
          <ActionRow title={t(manageCopy.skipTitle)} fact={t(manageCopy.skipFact, { amount: formatRupees(monthlyAmount) })} onClick={() => choose("skip")} testId="manage-skip" />
          <ActionRow title={t(manageCopy.withdrawTitle)} fact={t(manageCopy.withdrawFact, { value: valueText })} onClick={() => choose("withdraw")} testId="manage-withdraw" />
        </div>
      </>
    );
  } else if (step === "withdraw") {
    body = (
      <>
        <div className="flex items-center gap-2 px-3 pt-2">
          {start === "menu" ? back("menu") : <span className="w-2" />}
          <h2 className="text-base font-semibold">{t(manageCopy.withdrawTitle)}</h2>
        </div>
        <div className="flex flex-col gap-4 px-5 pb-2 pt-2">
          <Segmented<"all" | "part">
            label={t(manageCopy.amountLabel)}
            value={mode}
            onChange={setMode}
            options={[
              { value: "all", label: `${t(manageCopy.all)} · ${valueText}` },
              { value: "part", label: t(manageCopy.part) },
            ]}
          />
          {mode === "part" && (
            <div>
              <label htmlFor="withdraw-amount" className="mb-1.5 block text-sm font-medium">
                {t(manageCopy.amountLabel)}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
                <input
                  id="withdraw-amount"
                  inputMode="numeric"
                  value={partText}
                  onChange={(e) => setPartText(e.target.value)}
                  className="input num pl-7"
                  aria-invalid={partText !== "" && !amountOk ? true : undefined}
                  data-testid="withdraw-amount"
                />
              </div>
              {partText !== "" && !amountOk && (
                <p className="mt-1.5 text-sm text-loss" role="alert">
                  {t(manageCopy.amountError, { max: valueText })}
                </p>
              )}
            </div>
          )}
          <dl className="num divide-y divide-line rounded-xl ring-1 ring-line">
            <Row label={t(manageCopy.youWithdraw)} value={formatRupees(w.amount)} />
            <Row label={w.exitLoad > 0 ? t(manageCopy.exitLoad) : t(manageCopy.noExitLoad)} value={w.exitLoad > 0 ? `-${formatRupees(w.exitLoad)}` : formatRupees(0)} />
            <Row label={t(manageCopy.youGet)} value={formatRupees(w.youGet)} strong />
          </dl>
          <p className="text-xs leading-relaxed text-muted">{t(manageCopy.withdrawNote)}</p>
          <button type="button" className="btn-primary" disabled={!amountOk || w.amount === 0} onClick={() => setStep("reason")} data-testid="withdraw-continue">
            {t(manageCopy.continue)}
          </button>
        </div>
      </>
    );
  } else if (step === "reason") {
    const fallReason = reason === "returns" || reason === "confused";
    body = (
      <>
        <div className="flex items-center gap-2 px-3 pt-2">
          {back(action === "withdraw" ? "withdraw" : "menu")}
          <h2 className="text-base font-semibold">{action === "withdraw" ? t(manageCopy.reasonWithdraw) : t(manageCopy.reasonStop)}</h2>
        </div>
        <div className="flex flex-col gap-2 px-5 pb-2 pt-1">
          <p className="text-sm text-muted">{t(manageCopy.reasonHint)}</p>
          <div className="mt-1 flex flex-col gap-2" role="radiogroup" aria-label={t(manageCopy.reasonStop)}>
            {STOP_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                onClick={() => setReason(reason === r ? null : r)}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-left text-sm font-medium ring-1 transition-colors ${
                  reason === r ? "bg-primary-soft text-ink ring-primary" : "ring-line hover:bg-surface"
                }`}
                data-testid={`reason-${r}`}
              >
                <span className={`grid size-5 shrink-0 place-items-center rounded-full ring-1 ${reason === r ? "bg-primary text-paper ring-primary" : "ring-line"}`}>
                  {reason === r && <CheckIcon width={12} height={12} />}
                </span>
                {t(manageCopy.reasons[r])}
              </button>
            ))}
          </div>
          {fallReason && onSeeWhy && (
            <p className="anim-settle mt-1 rounded-xl bg-surface px-4 py-3 text-sm">
              {t(manageCopy.seeWhy)}{" "}
              <button type="button" onClick={onSeeWhy} className="font-semibold text-primary underline underline-offset-2">
                {t(manageCopy.seeWhyLink)}
              </button>
            </p>
          )}
          <button type="button" className="btn-primary mt-2" onClick={() => finish(action!, reason)} data-testid="manage-confirm">
            {action === "withdraw" ? t(manageCopy.confirmWithdraw, { amount: formatRupees(w.amount) }) : t(manageCopy.confirmStop)}
          </button>
        </div>
      </>
    );
  } else {
    const doneText =
      action === "stop"
        ? t(manageCopy.doneStop, { value: valueText })
        : action === "skip"
          ? t(manageCopy.doneSkip, { amount: formatRupees(monthlyAmount) })
          : t(manageCopy.doneWithdraw, { get: formatRupees(w.youGet) });
    body = (
      <div className="flex flex-col items-center px-6 pb-2 pt-6 text-center" data-testid="manage-done">
        <span className="grid size-12 place-items-center rounded-full bg-gain-soft text-gain">
          <CheckIcon width={24} height={24} />
        </span>
        <h2 className="mt-3 text-lg font-semibold">{t(manageCopy.doneTitle)}</h2>
        <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-muted">{doneText}</p>
        <button type="button" className="btn-primary mt-5 w-full" onClick={onClose}>
          {t(manageCopy.backToSip)}
        </button>
      </div>
    );
  }

  return (
    <OverlayLayer>
      <div className={`absolute inset-0 flex ${desktop ? "items-center justify-center p-6" : "flex-col justify-end"}`}>
        <button type="button" aria-label={t(manageCopy.close)} className="anim-scrim absolute inset-0 bg-ink/40" onClick={onClose} />
        <section
          role="dialog"
          aria-modal="true"
          aria-label={t(manageCopy.title)}
          className={`relative flex flex-col bg-paper shadow-(--shadow-sheet) ${
            desktop ? "anim-settle w-full max-w-md rounded-3xl pb-5" : "anim-sheet max-h-[92%] rounded-t-3xl pb-5"
          }`}
          data-testid="manage"
        >
          {!desktop && <span className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line" aria-hidden />}
          <div className="scroll-soft min-h-0 overflow-y-auto">{body}</div>
          <p className="px-5 pt-3 text-center text-[11px] text-muted">{t(manageCopy.concept)}</p>
        </section>
      </div>
    </OverlayLayer>
  );
}

function Header({ title, onClose, closeLabel }: { title: string; onClose: () => void; closeLabel: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface hover:text-ink">
        {closeLabel}
      </button>
    </div>
  );
}

function ActionRow({ title, fact, onClick, testId }: { title: string; fact: string; onClick: () => void; testId: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 ring-line transition-colors hover:bg-surface" data-testid={testId}>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{fact}</span>
      </span>
      <ChevronRightIcon width={18} height={18} className="shrink-0 text-muted" />
    </button>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className={strong ? "text-base font-semibold" : "font-medium"}>{value}</dd>
    </div>
  );
}
