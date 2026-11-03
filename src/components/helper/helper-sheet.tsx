"use client";

import { useEffect, useRef, useState } from "react";
import { AMFI_LINK, copy } from "@/lib/copy/dictionary";
import type { FollowupResponse, ReasonResponse } from "@/lib/api/helper-routes";
import { askQuestion, explain, GUESSES } from "@/lib/helper";
import type { Guess } from "@/lib/helper";
import type { SipRequest } from "@/lib/setup/rules";
import type { Facts } from "@/lib/sip";
import { track } from "@/lib/events";
import { OverlayLayer } from "@/components/device-shell/overlay-layer";
import { useLang, useT } from "@/components/lang/lang-provider";
import { ArrowLeftIcon } from "@/components/icons";

const OPTION = { fund: copy.helper.optFund, market: copy.helper.optMarket, dunno: copy.helper.optDunno, worth: copy.helper.optWorth };
type Turn = { question: string; reply?: FollowupResponse; failed?: boolean };

/**
 * The helper card (ADR-0002): a greeting and one question with four taps, then the reason (fund move against market
 * move), then "Got it" or "Ask more". The bars and every number come from code; the words come from the AI only
 * when they pass every check, otherwise from the code's template.
 */
export function HelperSheet({
  facts,
  request,
  onClose,
  onUnderstood,
}: {
  facts: Facts;
  request: SipRequest;
  onClose: () => void;
  onUnderstood: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const [guess, setGuess] = useState<Guess | null>(null);
  const [fetched, setFetched] = useState<{ key: string; reply: ReasonResponse } | null>(null);
  const [step, setStep] = useState<"card" | "chat">("card");

  const plain = guess ? explain(facts, guess, lang) : null;
  const key = `${guess}-${lang}`;
  const reason = fetched?.key === key ? fetched.reply : null;

  // The words are fetched again when the language changes, so the reason always matches the screen.
  useEffect(() => {
    if (!guess) return;
    let live = true;
    const thisKey = `${guess}-${lang}`;
    fetch("/api/reason", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request, guess, lang }) })
      .then((r) => (r.ok ? (r.json() as Promise<ReasonResponse>) : null))
      .catch(() => null)
      .then((body) => {
        if (!live) return;
        const plainNow = explain(facts, guess, lang);
        const result: ReasonResponse = body ?? { opening: plainNow.opening, reason: plainNow.reason, source: "template", case: plainNow.case, misread: plainNow.misread };
        setFetched({ key: thisKey, reply: result });
        track("reason_shown", { source: result.source, case: result.case });
      });
    return () => {
      live = false;
    };
  }, [guess, lang, request, facts]);

  function choose(g: Guess) {
    setGuess(g);
    const e = explain(facts, g, lang);
    track("guess_chosen", { guess: g, misread: e.misread, case: e.case });
  }

  return (
    <OverlayLayer>
      <div className="absolute inset-0 flex flex-col justify-end">
        <button type="button" aria-label={t(copy.followup.back)} className="anim-scrim absolute inset-0 bg-ink/40" onClick={onClose} />
        <section
          role="dialog"
          aria-modal="true"
          aria-label={t(copy.helper.hello)}
          className="anim-sheet relative flex max-h-[90%] flex-col rounded-t-3xl bg-paper shadow-(--shadow-sheet)"
          data-testid="helper"
        >
          <span className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line" aria-hidden />
          {step === "card" ? (
            <div className="scroll-soft overflow-y-auto px-5 pb-6 pt-3">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-paper" aria-hidden>
                  ?
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-surface px-3.5 py-2.5">
                  <p className="text-[15px] leading-snug">{t(copy.helper.hello)}</p>
                  <p className="mt-1 text-[15px] font-semibold leading-snug" data-testid="ask">
                    {askQuestion(facts, lang)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label={askQuestion(facts, lang)}>
                {GUESSES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={guess === g}
                    onClick={() => choose(g)}
                    disabled={guess !== null && guess !== g}
                    className={`min-h-12 rounded-xl px-3 py-2.5 text-left text-sm font-medium leading-snug ring-1 transition-colors ${
                      guess === g ? "bg-primary text-paper ring-primary" : guess ? "text-muted ring-line opacity-60" : "ring-line hover:bg-surface"
                    }`}
                    data-testid={`guess-${g}`}
                  >
                    {t(OPTION[g])}
                  </button>
                ))}
              </div>

              {guess && plain && (
                <div className="anim-settle mt-5" data-testid="answer" aria-live="polite">
                  {!reason ? (
                    <p className="flex items-center gap-2 text-sm text-muted" role="status">
                      <span className="loader" aria-hidden />
                      {t(copy.followup.thinking)}
                    </p>
                  ) : (
                    <>
                      {reason.opening.map((line) => (
                        <p key={line} className="text-[17px] font-semibold leading-snug">
                          {line}
                        </p>
                      ))}
                      <p className={`${reason.opening.length ? "mt-1.5" : ""} text-[15px] leading-relaxed`} data-testid="reason">
                        {reason.reason}
                      </p>
                    </>
                  )}

                  <div className="mt-4 space-y-3 rounded-2xl border border-line p-4" data-testid="bars">
                    {[plain.bars.market, plain.bars.fund].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex items-baseline justify-between text-sm">
                          <span>{bar.label}</span>
                          <span className={`num font-semibold ${bar.direction === "down" ? "text-loss" : bar.direction === "up" ? "text-gain" : ""}`}>
                            {bar.direction === "down" ? "▼ " : bar.direction === "up" ? "▲ " : ""}
                            {bar.text}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 rounded-full bg-surface-strong">
                          <div
                            className={`h-full rounded-full ${bar.direction === "down" ? "bg-loss" : "bg-gain"}`}
                            style={{ width: `${Math.max(bar.widthPct, 2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted">
                      {t(copy.helper.between, { from: facts.monthMove.fromText, to: facts.monthMove.toText })}
                    </p>
                  </div>

                  {reason && (
                    <p className="mt-3 text-xs font-medium text-gain" data-testid="quality-tag">
                      {reason.source === "ai" ? t(copy.helper.checked) : `✓ ${t(copy.common.tagNumbers)}`}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">{t(copy.common.notice)}</p>

                  <div className="mt-4 flex gap-3">
                    <button type="button" className="btn-quiet flex-1" onClick={() => { setStep("chat"); }} data-testid="ask-more">
                      {t(copy.helper.more)}
                    </button>
                    <button type="button" className="btn-primary flex-1" onClick={onUnderstood} data-testid="got-it">
                      {t(copy.helper.got)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <FollowupChat facts={facts} request={request} onBack={() => setStep("card")} onDone={onUnderstood} />
          )}
        </section>
      </div>
    </OverlayLayer>
  );
}

const SUGGESTED = [copy.followup.qStop, copy.followup.qWorse, copy.followup.qSwitch, copy.followup.qLast];

/** "Ask more": suggested questions and free text. Each reply carries its tag: numbers from your SIP, or a safe answer. */
function FollowupChat({ request, onBack, onDone }: { facts: Facts; request: SipRequest; onBack: () => void; onDone: () => void }) {
  const t = useT();
  const { lang } = useLang();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const busy = turns.some((turn) => !turn.reply && !turn.failed);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setText("");
    setTurns((all) => [...all, { question: q }]);
    let reply: FollowupResponse | null = null;
    try {
      const response = await fetch("/api/followup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ request, question: q, lang }),
      });
      if (response.ok) reply = (await response.json()) as FollowupResponse;
    } catch {
      reply = null;
    }
    if (reply) track("followup_asked", { kind: reply.kind, source: reply.source });
    setTurns((all) => all.map((turn, i) => (i === all.length - 1 ? (reply ? { ...turn, reply } : { ...turn, failed: true }) : turn)));
  }

  return (
    <div className="flex min-h-0 flex-col" data-testid="chat">
      <div className="flex items-center gap-2 px-3 pb-2 pt-2">
        <button type="button" onClick={onBack} aria-label={t(copy.followup.back)} className="grid size-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeftIcon />
        </button>
        <h2 className="text-base font-semibold">{t(copy.followup.title)}</h2>
        <button type="button" onClick={onDone} className="ml-auto rounded-full px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-soft">
          {t(copy.helper.got)}
        </button>
      </div>

      <div className="scroll-soft min-h-50 flex-1 overflow-y-auto px-5 pb-3">
        {turns.length === 0 && <p className="text-sm text-muted">{t(copy.followup.hint)}</p>}
        {turns.map((turn, i) => (
          <div key={i} className="mb-4">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-paper">{turn.question}</p>
            {turn.reply ? (
              <div className="mt-2 max-w-[92%] rounded-2xl rounded-tl-sm bg-surface px-3.5 py-2.5" data-testid="reply">
                <p className="text-sm leading-relaxed">{turn.reply.text}</p>
                {turn.reply.link === "amfi" && (
                  <a href={AMFI_LINK[lang]} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-primary underline">
                    mutualfundssahihai.com
                  </a>
                )}
                <p className={`mt-1.5 text-[11px] font-semibold ${turn.reply.source === "ai" ? "text-gain" : "text-primary"}`} data-testid="reply-tag">
                  {turn.reply.source === "ai" ? `✓ ${t(copy.common.tagNumbers)}` : `🛡 ${t(copy.common.tagSafe)}`}
                </p>
              </div>
            ) : turn.failed ? (
              <p className="mt-2 text-sm text-loss">{t(copy.common.loadError)}</p>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted" role="status">
                <span className="loader" aria-hidden />
                {t(copy.followup.thinking)}
              </p>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="screen-bottom shrink-0 border-t border-line px-4 pb-4 pt-3">
        <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
          {SUGGESTED.map((q) => (
            <button
              key={q.en}
              type="button"
              disabled={busy}
              onClick={() => ask(t(q))}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-line hover:bg-surface disabled:opacity-50"
            >
              {t(q)}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(text);
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder={t(copy.followup.hint)} className="input flex-1" aria-label={t(copy.followup.hint)} />
          <button type="submit" disabled={busy || !text.trim()} className="btn-primary px-4">
            {t(copy.followup.send)}
          </button>
        </form>
      </div>
    </div>
  );
}
