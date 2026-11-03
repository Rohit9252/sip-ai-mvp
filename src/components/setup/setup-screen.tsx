"use client";

import { useEffect, useState } from "react";
import { copy, monthName } from "@/lib/copy/dictionary";
import type { FundsResponse } from "@/lib/api/types";
import type { FundSearchResult } from "@/lib/nav/types";
import { DEFAULT_DAY, startMonthOptions, startMonthRange, validateSetup } from "@/lib/setup/rules";
import type { SetupField, SipRequest } from "@/lib/setup/rules";
import { useLang, useT } from "@/components/lang/lang-provider";
import { useToday } from "@/hooks/use-today";
import { CheckIcon, HelperIcon, SearchIcon, ShieldIcon } from "@/components/icons";
import { deskCopy } from "@/lib/copy/tour";
import { useLayoutMode } from "@/components/device-shell/layout-mode";

/** Fund, start month, monthly amount and SIP date, or the sample SIP. No name, phone or PAN (ADR-0004). */
export function SetupScreen({
  problem,
  onSubmit,
  onSample,
}: {
  problem?: "load" | "tooNew";
  onSubmit: (request: SipRequest) => void;
  onSample: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const today = useToday();
  const desktop = useLayoutMode() === "desktop";

  const [query, setQuery] = useState("");
  const [found, setFound] = useState<{ query: string; funds: FundSearchResult[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [fund, setFund] = useState<FundSearchResult | null>(null);
  const [startMonth, setStartMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState(String(DEFAULT_DAY));
  const [errors, setErrors] = useState<Partial<Record<SetupField, true>>>({});

  // Search after the person stops typing for a moment.
  useEffect(() => {
    if (fund || query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchFailed(false);
      try {
        const response = await fetch(`/api/funds?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (!response.ok) throw new Error("search failed");
        setFound({ query, funds: ((await response.json()) as FundsResponse).funds });
      } catch {
        if (!controller.signal.aborted) setSearchFailed(true);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, fund]);

  const results = found?.query === query ? found.funds : null;
  if (!today) return <div className="flex-1" />;
  const range = startMonthRange(today);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const check = validateSetup({ schemeCode: fund?.schemeCode ?? null, startMonth, amount, day }, today!);
    setErrors(check.errors);
    if (check.request) onSubmit(check.request);
  }

  const form = (
      <form
        onSubmit={submit}
        noValidate
        className={desktop ? "flex flex-col gap-5 rounded-2xl bg-paper p-7 ring-1 ring-line" : "mx-auto flex max-w-md flex-col gap-5 px-5 pb-8 pt-6"}
      >
        <div>
          <h1 className={`font-semibold leading-tight ${desktop ? "text-xl" : "text-2xl"}`}>{t(copy.setup.title)}</h1>
          <p className="mt-1.5 text-[15px] text-muted">{t(copy.setup.sub)}</p>
        </div>

        {problem && (
          <p role="alert" className="rounded-xl bg-loss-soft px-4 py-3 text-sm text-loss">
            {problem === "tooNew" ? t(copy.setup.tooNew) : t(copy.common.loadError)}
          </p>
        )}

        <button
          type="button"
          onClick={onSample}
          className="flex min-h-12 items-center justify-center rounded-xl bg-primary-soft px-4 text-[15px] font-semibold text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/10"
          data-testid="sample"
          data-tour="sample"
        >
          {t(copy.setup.sample)}
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted" aria-hidden>
          <span className="h-px flex-1 bg-line" />
          <span>{t(copy.setup.orYours)}</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-col gap-5" data-tour="form">
        <Field label={t(copy.setup.fund)} error={errors.fund ? t(copy.setup.errFund) : undefined} htmlFor="fund">
          {fund ? (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
              <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug">{fund.schemeName}</span>
              <button
                type="button"
                className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-soft"
                onClick={() => {
                  setFund(null);
                  setQuery("");
                }}
              >
                {t(copy.setup.changeFund)}
              </button>
            </div>
          ) : (
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="fund"
                type="search"
                autoComplete="off"
                placeholder={t(copy.setup.fundHint)}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input pl-10"
                aria-invalid={errors.fund ? true : undefined}
              />
            </div>
          )}
          {!fund && query.trim().length >= 2 && (
            <div className="mt-1.5 overflow-hidden rounded-xl border border-line" aria-live="polite">
              {searching && <p className="px-3 py-2.5 text-sm text-muted">{t(copy.setup.searching)}</p>}
              {!searching && searchFailed && <p className="px-3 py-2.5 text-sm text-loss">{t(copy.common.loadError)}</p>}
              {!searching && results && results.length === 0 && (
                <p className="px-3 py-2.5 text-sm text-muted">{t(copy.setup.noFunds)}</p>
              )}
              {!searching &&
                results?.map((r) => (
                  <button
                    key={r.schemeCode}
                    type="button"
                    onClick={() => {
                      setFund(r);
                      setErrors((e) => ({ ...e, fund: undefined }));
                    }}
                    className="block w-full border-b border-line px-3 py-2.5 text-left text-sm leading-snug last:border-b-0 hover:bg-surface"
                  >
                    {r.schemeName}
                  </button>
                ))}
            </div>
          )}
        </Field>

        <Field
          label={t(copy.setup.start)}
          htmlFor="start"
          error={errors.start ? t(copy.setup.errStart, { min: monthName(range.min, lang), max: monthName(range.max, lang) }) : undefined}
        >
          <select id="start" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="input" aria-invalid={errors.start ? true : undefined}>
            <option value="">{t(copy.setup.startHint)}</option>
            {startMonthOptions(today).map((m) => (
              <option key={m} value={m}>
                {monthName(m, lang)}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-[1.4fr_1fr] gap-3">
          <Field label={t(copy.setup.amount)} htmlFor="amount" hint={t(copy.setup.amountHint)} error={errors.amount ? t(copy.setup.errAmount) : undefined}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
              <input
                id="amount"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5,000"
                className="input num pl-7"
                aria-invalid={errors.amount ? true : undefined}
              />
            </div>
          </Field>
          <Field label={t(copy.setup.day)} htmlFor="day" hint={t(copy.setup.dayHint)} error={errors.day ? t(copy.setup.errDay) : undefined}>
            <input
              id="day"
              inputMode="numeric"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="input num"
              aria-invalid={errors.day ? true : undefined}
            />
          </Field>
        </div>

        <button type="submit" className="btn-primary mt-1">
          {t(copy.setup.show)}
        </button>
        </div>
      </form>
  );

  const trust = (
    <ul className={`grid gap-3 ${desktop ? "mt-10 grid-cols-3" : "mx-auto max-w-md px-5 pb-10"}`} data-testid="trust">
      {deskCopy.trust.map((item, i) => {
        const Icon = [CheckIcon, HelperIcon, ShieldIcon][i];
        return (
          <li key={item.title.en} className="flex gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line">
            <Icon width={18} height={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">{t(item.title)}</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">{t(item.body)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );

  if (!desktop)
    return (
      <main className="scroll-soft flex-1 overflow-y-auto">
        {form}
        {trust}
      </main>
    );

  return (
    <main className="scroll-soft flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)_440px] items-start gap-14 px-8 py-14">
        <section className="pt-6">
          <h2 className="max-w-[16ch] text-balance text-[40px] font-semibold leading-[1.1] tracking-tight">{t(deskCopy.introTitle)}</h2>
          <ol className="mt-10 flex flex-col gap-6">
            {deskCopy.introSteps.map((step, i) => (
              <li key={step.en} className="flex items-start gap-4">
                <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{i + 1}</span>
                <p className="max-w-[46ch] pt-1 text-[17px] leading-relaxed text-ink">{t(step)}</p>
              </li>
            ))}
          </ol>
          {trust}
          <p className="mt-8 max-w-[60ch] text-sm leading-relaxed text-muted">
            {t(copy.common.strip)} <strong className="font-semibold text-ink">{t(copy.common.stripAdvice)}</strong>
          </p>
        </section>
        {form}
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-loss" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}
