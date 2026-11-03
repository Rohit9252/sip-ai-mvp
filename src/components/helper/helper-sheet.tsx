"use client";

import { useEffect, useRef, useState } from "react";
import { AMFI_LINK, copy } from "@/lib/copy/dictionary";
import { cheerCopy, deskCopy } from "@/lib/copy/tour";
import { consentCopy } from "@/lib/copy/consent";
import { learnCards, learnCopy, learnLink } from "@/lib/copy/learn";
import type { FollowupResponse, ReasonResponse } from "@/lib/api/helper-routes";
import { askQuestion, explain, GUESSES } from "@/lib/helper";
import type { Explanation, Guess } from "@/lib/helper";
import type { SipRequest } from "@/lib/setup/rules";
import type { Facts } from "@/lib/sip";
import { track } from "@/lib/events";
import { OverlayLayer } from "@/components/device-shell/overlay-layer";
import { useLang, useT } from "@/components/lang/lang-provider";
import { CheckIcon, ChevronRightIcon, HelperIcon, ShieldIcon, TriangleIcon } from "@/components/icons";

const OPTION = { fund: copy.helper.optFund, market: copy.helper.optMarket, dunno: copy.helper.optDunno, worth: copy.helper.optWorth };
const SUGGESTED = [copy.followup.qStop, copy.followup.qWorse, copy.followup.qSwitch, copy.followup.qLast];
type Turn = { question: string; reply?: FollowupResponse; failed?: boolean };

/**
 * The helper (ADR-0002) as one conversation: it greets and asks once, the person taps a guess (shown back as their
 * own message), then the helper explains with the two bars, adds a warm line, offers the basics to learn, and stays
 * open for follow-up questions in the same thread. Every number comes from code; the AI's words are shown only when
 * they pass every check, otherwise the code's template. A sheet on a phone, the side panel on desktop.
 */
export function HelperSheet({
  facts,
  request,
  onClose,
  onUnderstood,
  variant = "sheet",
  hidden = false,
}: {
  facts: Facts;
  request: SipRequest;
  onClose: () => void;
  onUnderstood: () => void;
  /** "sheet": slides up over the phone screen. "panel": fills the desktop side column, with no overlay. */
  variant?: "sheet" | "panel";
  /** Phone: the sheet stays mounted while closed, so the conversation is still there when it opens again. */
  hidden?: boolean;
}) {
  const t = useT();
  const { lang } = useLang();
  const [guess, setGuess] = useState<Guess | null>(null);
  const [fetched, setFetched] = useState<{ key: string; reply: ReasonResponse } | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const plain = guess ? explain(facts, guess, lang) : null;
  const reason = fetched?.key === `${guess}-${lang}` ? fetched.reply : null;
  const busy = turns.some((turn) => !turn.reply && !turn.failed);

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
        const p = explain(facts, guess, lang);
        const result: ReasonResponse = body ?? { opening: p.opening, reason: p.reason, source: "template", case: p.case, misread: p.misread };
        setFetched({ key: thisKey, reply: result });
        track("reason_shown", { source: result.source, case: result.case });
      });
    return () => {
      live = false;
    };
  }, [guess, lang, request, facts]);

  // Keep the reply readable from its first line: a long answer must not scroll its own start out of view.
  const answerRef = useRef<HTMLDivElement>(null);
  const lastTurnRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (guess && !reason) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [guess, reason]);
  useEffect(() => {
    if (reason) answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [reason]);
  useEffect(() => {
    if (turns.length > 0) lastTurnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [turns]);

  function choose(g: Guess) {
    setGuess(g);
    const e = explain(facts, g, lang);
    track("guess_chosen", { guess: g, misread: e.misread, case: e.case });
  }

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

  const cheer = guess === "dunno" ? cheerCopy.asked : guess === "worth" ? cheerCopy.worth : plain?.misread ? cheerCopy.misread : cheerCopy.right;

  const thread = (
    <div className="scroll-soft min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3" aria-live="polite">
      <HelperSays>
        <p>{t(copy.helper.hello)}</p>
        <p className="mt-1 font-semibold" data-testid="ask">
          {askQuestion(facts, lang)}
        </p>
      </HelperSays>

      {!guess ? (
        <div className="ml-11 mt-2 grid grid-cols-2 gap-2" role="group" aria-label={askQuestion(facts, lang)}>
          {GUESSES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => choose(g)}
              className="min-h-12 rounded-xl bg-paper px-3 py-2.5 text-left text-sm font-medium leading-snug ring-1 ring-primary/30 transition-colors hover:bg-primary-soft"
              data-testid={`guess-${g}`}
            >
              {t(OPTION[g])}
            </button>
          ))}
        </div>
      ) : (
        <YouSay>{t(OPTION[guess])}</YouSay>
      )}

      {guess && plain && !reason && <Typing label={t(cheerCopy.typing)} />}

      {guess && plain && reason && (
        <>
          <HelperSays testId="answer" anchorRef={answerRef}>
            {reason.opening.map((line) => (
              <p key={line} className="text-[16px] font-semibold">
                {line}
              </p>
            ))}
            <p className={reason.opening.length ? "mt-1.5" : ""} data-testid="reason">
              {reason.reason}
            </p>
            <Bars plain={plain} between={t(copy.helper.between, { from: facts.monthMove.fromText, to: facts.monthMove.toText })} />
            <p className="mt-2.5 flex items-center gap-1 text-xs font-medium text-gain" data-testid="quality-tag">
              <CheckIcon width={13} height={13} />
              {reason.source === "ai" ? t(copy.helper.checked) : t(copy.common.tagNumbers)}
            </p>
          </HelperSays>

          <HelperSays tone="cheer" testId="cheer">
            <p className="font-medium">{t(cheer)}</p>
          </HelperSays>

          <HelperSays>
            <p className="font-medium">{t(cheerCopy.learnHint)}</p>
            <Learn />
          </HelperSays>
        </>
      )}

      {turns.map((turn, i) => (
        <div key={i} ref={i === turns.length - 1 ? lastTurnRef : undefined} className="scroll-mt-3">
          <YouSay>{turn.question}</YouSay>
          {turn.reply ? (
            <HelperSays testId="reply">
              <p>{turn.reply.text}</p>
              {turn.reply.link === "amfi" && (
                <a href={AMFI_LINK[lang]} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-2">
                  mutualfundssahihai.com
                </a>
              )}
              <p className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${turn.reply.source === "ai" ? "text-gain" : "text-primary"}`} data-testid="reply-tag">
                {turn.reply.source === "ai" ? <CheckIcon width={12} height={12} /> : <ShieldIcon width={12} height={12} />}
                {turn.reply.source === "ai" ? t(copy.common.tagNumbers) : t(copy.common.tagSafe)}
              </p>
            </HelperSays>
          ) : turn.failed ? (
            <HelperSays>
              <p className="text-loss">{t(copy.common.loadError)}</p>
            </HelperSays>
          ) : (
            <Typing label={t(cheerCopy.typing)} />
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );

  const footer = reason ? (
    <div className="screen-bottom shrink-0 border-t border-line bg-paper px-4 pb-4 pt-3" data-testid="chat">
      <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
        {SUGGESTED.map((q) => (
          <button
            key={q.en}
            type="button"
            disabled={busy}
            onClick={() => ask(t(q))}
            className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs font-medium ring-1 ring-line hover:bg-surface-strong disabled:opacity-50"
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
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          placeholder={t(copy.followup.hint)}
          className="input min-h-11 flex-1"
          aria-label={t(copy.followup.hint)}
          data-testid="ask-input"
        />
        <button type="submit" disabled={busy || !text.trim()} className="btn-primary min-h-11 px-4">
          {t(copy.followup.send)}
        </button>
      </form>
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <p className="text-[11px] leading-snug text-muted">{t(copy.common.notice)}</p>
        <button type="button" onClick={onUnderstood} className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper" data-testid="got-it">
          {t(copy.helper.got)}
        </button>
      </div>
    </div>
  ) : (
    <p className="shrink-0 border-t border-line px-4 py-2.5 text-[11px] text-muted">{t(copy.common.notice)}</p>
  );

  if (variant === "panel") {
    return (
      <section aria-label={t(copy.helper.hello)} className="flex min-h-0 flex-1 flex-col bg-surface/60" data-testid="helper">
        {thread}
        {footer}
      </section>
    );
  }

  return (
    <OverlayLayer>
      <div className={`absolute inset-0 flex flex-col justify-end ${hidden ? "hidden" : ""}`}>
        <button type="button" aria-label={t(consentCopy.close)} className="anim-scrim absolute inset-0 bg-ink/40" onClick={onClose} />
        <section
          role="dialog"
          aria-modal="true"
          aria-label={t(copy.helper.hello)}
          className="anim-sheet relative flex h-[90%] flex-col rounded-t-3xl bg-surface shadow-(--shadow-sheet)"
          data-testid="helper"
        >
          <div className="flex shrink-0 items-center gap-2.5 rounded-t-3xl border-b border-line bg-paper px-4 pb-3 pt-2">
            <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line" aria-hidden />
            <span className="mt-3 grid size-8 place-items-center rounded-full bg-primary text-paper" aria-hidden>
              <HelperIcon width={16} height={16} />
            </span>
            <p className="mt-3 text-[15px] font-semibold">{t(deskCopy.helperTitle)}</p>
            <button type="button" onClick={onClose} className="ml-auto mt-3 rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface hover:text-ink" data-testid="helper-close">
              {t(consentCopy.close)}
            </button>
          </div>
          {thread}
          {footer}
        </section>
      </div>
    </OverlayLayer>
  );
}

/** A message from the helper: its mark on the left, a soft bubble. */
function HelperSays({
  children,
  tone = "plain",
  testId,
  anchorRef,
}: {
  children: React.ReactNode;
  tone?: "plain" | "cheer";
  testId?: string;
  anchorRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={anchorRef} className="anim-settle mt-3 flex scroll-mt-3 items-start gap-2.5" data-testid={testId}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-paper" aria-hidden>
        <HelperIcon width={15} height={15} />
      </span>
      <div
        className={`min-w-0 max-w-[88%] rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[15px] leading-relaxed shadow-[0_1px_2px_rgba(31,36,50,0.06)] ${
          tone === "cheer" ? "bg-gain-soft text-ink ring-1 ring-gain/20" : "bg-paper text-ink ring-1 ring-line"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/** The person's own message, on the right. */
function YouSay({ children }: { children: React.ReactNode }) {
  return (
    <div className="anim-settle mt-3 flex justify-end">
      <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-[15px] leading-snug text-paper">{children}</p>
    </div>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <div className="mt-3 flex items-center gap-2.5" role="status">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-paper" aria-hidden>
        <HelperIcon width={15} height={15} />
      </span>
      <span className="inline-flex items-center gap-1 rounded-2xl rounded-tl-md bg-paper px-3.5 py-3 ring-1 ring-line">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="sr-only">{label}</span>
      </span>
    </div>
  );
}

function Bars({ plain, between }: { plain: Explanation; between: string }) {
  return (
    <div className="mt-3 space-y-2.5 rounded-xl bg-surface p-3" data-testid="bars">
      {[plain.bars.market, plain.bars.fund].map((bar) => (
        <div key={bar.label}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span>{bar.label}</span>
            <span className={`num inline-flex items-center gap-1 font-semibold ${bar.direction === "down" ? "text-loss" : bar.direction === "up" ? "text-gain" : ""}`}>
              {bar.direction !== "flat" && <TriangleIcon direction={bar.direction} width={9} height={9} />}
              {bar.text}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-surface-strong">
            <div className={`h-full rounded-full ${bar.direction === "down" ? "bg-loss" : "bg-gain"}`} style={{ width: `${Math.max(bar.widthPct, 2)}%` }} />
          </div>
        </div>
      ))}
      <p className="text-[11px] text-muted">{between}</p>
    </div>
  );
}

/** The basics, each opening in place with a link to AMFI's investor-education page on it. */
export function Learn() {
  const t = useT();
  const { lang } = useLang();
  return (
    <div className="mt-2 flex flex-col gap-1.5" data-testid="learn">
      {learnCards.map((card) => (
        <details key={card.id} className="group rounded-xl bg-surface px-3 py-2.5 ring-1 ring-line open:bg-paper">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px] font-semibold leading-snug">
            <ChevronRightIcon width={14} height={14} className="shrink-0 text-muted transition-transform group-open:rotate-90" />
            {t(card.title)}
          </summary>
          <p className="mt-2 pl-5.5 text-[13px] leading-relaxed text-muted">{t(card.body)}</p>
          <a
            href={learnLink(card.path, lang)}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-block pl-5.5 text-xs font-semibold text-primary underline underline-offset-2"
          >
            {t(learnCopy.readMore)}
          </a>
        </details>
      ))}
      <p className="mt-0.5 text-[11px] text-muted">{t(learnCopy.source)}</p>
    </div>
  );
}
