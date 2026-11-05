"use client";

import { useEffect, useId, useRef, useState } from "react";
import { consentCopy } from "@/lib/copy/consent";
import { consentRenewsAt } from "@/lib/consent";
import { OverlayLayer } from "@/components/device-shell/overlay-layer";
import { useLang, useT } from "@/components/lang/lang-provider";
import { LangSwitch } from "@/components/lang/lang-switch";
import { CheckIcon, ShieldIcon } from "@/components/icons";

/**
 * What this is, how to use it, what happens to data, and the limits. Shared by the first-visit notice and the
 * About popup, so the two can never say different things (the attempt-one pattern).
 */
function AboutSections() {
  const t = useT();
  return (
    <>
      <section className="flex flex-col gap-2.5">
        <h3 className="text-sm font-semibold text-ink">{t(consentCopy.whatTitle)}</h3>
        <p>{t(consentCopy.what)}</p>
        <p className="font-semibold text-ink">{t(consentCopy.notAdvice)}</p>
        <p className="rounded-2xl bg-primary-soft px-4 py-3 text-[15px] leading-snug text-ink">{t(consentCopy.finding)}</p>
      </section>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-sm font-semibold text-ink">{t(consentCopy.howTitle)}</h3>
        <ol className="flex flex-col gap-2.5">
          {consentCopy.steps.map((step, i) => (
            <li key={step.en} className="flex gap-3">
              <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-medium text-paper">{i + 1}</span>
              <span className="min-w-0 pt-0.5">{t(step)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl bg-surface p-4 ring-1 ring-line">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldIcon width={15} height={15} className="text-primary" />
          {t(consentCopy.dataTitle)}
        </h3>
        <p>{t(consentCopy.data)}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-ink">{t(consentCopy.limitsTitle)}</h3>
        <p>{t(consentCopy.limits)}</p>
      </section>
    </>
  );
}

function Frame({ titleId, children }: { titleId: string; children: React.ReactNode }) {
  return (
    <OverlayLayer>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/55 p-3 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="anim-settle flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] bg-paper shadow-(--shadow-sheet) ring-1 ring-line"
          data-testid="consent"
        >
          {children}
        </div>
      </div>
    </OverlayLayer>
  );
}

/**
 * Shown on a first visit and again after five hours, before anything else. It closes only through the checkbox and
 * "Get started": no close icon, no Escape, no outside click. The language switch sits in it, so a Hindi reader can
 * read it in Hindi first.
 */
export function ConsentDialog({ onAccept }: { onAccept: () => void }) {
  const t = useT();
  const [agreed, setAgreed] = useState(false);
  const titleId = useId();
  const boxRef = useRef<HTMLInputElement>(null);
  useEffect(() => boxRef.current?.focus({ preventScroll: true }), []);

  return (
    <Frame titleId={titleId}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <h2 id={titleId} className="text-2xl font-semibold leading-tight">
          {t(consentCopy.title)}
        </h2>
        <LangSwitch />
      </div>
      <div className="scroll-soft flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pb-5 pt-4 text-sm leading-relaxed text-ink/85">
        <AboutSections />
        <p className="text-xs text-muted">{t(consentCopy.renew)}</p>
      </div>
      <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-ink">
          <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
            <input
              ref={boxRef}
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer size-5 cursor-pointer appearance-none rounded-md bg-surface ring-1 ring-ink/30 transition checked:bg-ink checked:ring-ink"
              data-testid="consent-agree"
            />
            <CheckIcon width={13} height={13} strokeWidth={3} className="pointer-events-none absolute text-paper opacity-0 transition peer-checked:opacity-100" />
          </span>
          <span className="min-w-0">{t(consentCopy.agree)}</span>
        </label>
        <button type="button" onClick={onAccept} disabled={!agreed} className="btn-primary" data-testid="consent-start">
          {t(consentCopy.start)}
        </button>
      </div>
    </Frame>
  );
}

const TIME: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" };

/** The same content, opened again from the i button. It asks for nothing and says when consent was given. */
export function AboutDialog({ acceptedAt, onClose }: { acceptedAt: Date | null; onClose: () => void }) {
  const t = useT();
  const { lang } = useLang();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const fmt = (d: Date) => d.toLocaleString(locale, TIME);

  return (
    <Frame titleId={titleId}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <h2 id={titleId} className="text-2xl font-semibold leading-tight">
          {t(consentCopy.aboutTitle)}
        </h2>
        <button ref={closeRef} type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-line hover:bg-surface">
          {t(consentCopy.close)}
        </button>
      </div>
      <div className="scroll-soft flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pb-5 pt-4 text-sm leading-relaxed text-ink/85">
        <AboutSections />
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-ink">{t(consentCopy.buildTitle)}</h3>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="/design" className="font-semibold text-primary underline underline-offset-2">Design thesis</a>
            <a href="/cohorts" className="font-semibold text-primary underline underline-offset-2">Cohort proof</a>
            <a href="/experiment" className="font-semibold text-primary underline underline-offset-2">Experiment plan</a>
          </p>
        </section>
      </div>
      <p className="border-t border-line px-5 py-3.5 text-xs leading-relaxed text-muted">
        {acceptedAt ? t(consentCopy.agreedOn, { time: fmt(acceptedAt), renew: fmt(consentRenewsAt(acceptedAt)) }) : t(consentCopy.visitOnly)}
      </p>
    </Frame>
  );
}
