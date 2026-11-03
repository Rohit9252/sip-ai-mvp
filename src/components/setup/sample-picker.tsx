"use client";

import { useState } from "react";
import { copy } from "@/lib/copy/dictionary";
import { SAMPLE_AMOUNTS, SAMPLE_DEFAULT_AMOUNT, sampleCopy } from "@/lib/copy/tour";
import { AMOUNT_MAX, AMOUNT_MIN, parseWholeNumber } from "@/lib/setup/rules";
import { formatRupees } from "@/lib/sip";
import { OverlayLayer } from "@/components/device-shell/overlay-layer";
import { useLayoutMode } from "@/components/device-shell/layout-mode";
import { useT } from "@/components/lang/lang-provider";
import { HelpIcon } from "@/components/icons";

/**
 * Before the sample replay, the person picks a monthly amount close to their own, and we say why we ask. The fund,
 * start month and SIP day stay fixed (the real sample), so the setback still comes in month 8 at any amount.
 */
export function SamplePicker({ onStart, onClose }: { onStart: (monthlyAmount: number) => void; onClose: () => void }) {
  const t = useT();
  const desktop = useLayoutMode() === "desktop";
  const [chip, setChip] = useState<number | null>(SAMPLE_DEFAULT_AMOUNT);
  const [own, setOwn] = useState("");

  const ownAmount = parseWholeNumber(own);
  const amount = own !== "" ? ownAmount : chip;
  const ok = amount !== null && amount >= AMOUNT_MIN && amount <= AMOUNT_MAX;

  return (
    <OverlayLayer>
      <div className={`absolute inset-0 flex ${desktop ? "items-center justify-center p-6" : "flex-col justify-end"}`}>
        <button type="button" aria-label={t(sampleCopy.cancel)} className="anim-scrim absolute inset-0 bg-ink/45" onClick={onClose} />
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby="sample-title"
          onSubmit={(e) => {
            e.preventDefault();
            if (ok) onStart(amount!);
          }}
          className={`relative flex flex-col gap-4 bg-paper px-5 pb-5 shadow-(--shadow-sheet) ${
            desktop ? "anim-settle w-full max-w-md rounded-3xl pt-6" : "anim-sheet rounded-t-3xl pt-3"
          }`}
          data-testid="sample-picker"
        >
          {!desktop && <span className="mx-auto h-1 w-10 shrink-0 rounded-full bg-line" aria-hidden />}
          <div>
            <h2 id="sample-title" className="text-lg font-semibold">
              {t(sampleCopy.title)}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(sampleCopy.body)}</p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t(sampleCopy.amount)}</legend>
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_AMOUNTS.map((a) => {
                const on = own === "" && chip === a;
                return (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setChip(a);
                      setOwn("");
                    }}
                    className={`num min-h-11 rounded-xl text-sm font-semibold ring-1 transition-colors ${
                      on ? "bg-primary text-paper ring-primary" : "ring-line hover:bg-surface"
                    }`}
                    data-testid={`sample-amount-${a}`}
                  >
                    {formatRupees(a)}
                  </button>
                );
              })}
            </div>
            <label htmlFor="sample-own" className="mt-3 block text-xs text-muted">
              {t(sampleCopy.own)} ({t(copy.setup.amountHint)})
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
              <input
                id="sample-own"
                inputMode="numeric"
                value={own}
                onChange={(e) => setOwn(e.target.value)}
                className="input num pl-7"
                aria-invalid={own !== "" && !ok ? true : undefined}
              />
            </div>
            {own !== "" && !ok && (
              <p className="mt-1.5 text-sm text-loss" role="alert">
                {t(copy.setup.errAmount)}
              </p>
            )}
          </fieldset>

          <p className="flex gap-2.5 rounded-xl bg-primary-soft px-3.5 py-3 text-[13px] leading-snug text-ink">
            <HelpIcon width={16} height={16} className="mt-0.5 shrink-0 text-primary" />
            {t(sampleCopy.why)}
          </p>

          <div className="flex gap-3">
            <button type="button" className="btn-quiet" onClick={onClose}>
              {t(sampleCopy.cancel)}
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!ok} data-testid="sample-start">
              {t(sampleCopy.start)}
            </button>
          </div>
        </form>
      </div>
    </OverlayLayer>
  );
}
