"use client";

import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { tourCopy } from "@/lib/copy/tour";
import type { TourStep } from "@/lib/copy/tour";
import { OverlayLayerContext } from "@/components/device-shell/overlay-layer";
import { useT } from "@/components/lang/lang-provider";

/**
 * A first-visit tour on the real screen (no separate tutorial mode): a spotlight on one part at a time, with a short
 * card beside it. It shows once per screen, can be skipped at any step, closes on Escape, and can be replayed.
 */

const listeners = new Set<() => void>();
const memory = new Set<string>();

function hasSeen(key: string): boolean {
  if (memory.has(key)) return true;
  try {
    return window.localStorage.getItem(key) === "seen";
  } catch {
    return false;
  }
}

function markSeen(key: string) {
  memory.add(key);
  try {
    window.localStorage.setItem(key, "seen");
  } catch {
    // Storage blocked: the tour still stays closed for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Whether to show the tour: on the first visit (once mounted, never on the server), or when replayed. */
export function useTour(key: string) {
  const seen = useSyncExternalStore(subscribe, () => hasSeen(key), () => true);
  const [replaying, setReplaying] = useState(false);
  return {
    open: replaying || !seen,
    start: useCallback(() => setReplaying(true), []),
    close: useCallback(() => {
      markSeen(key);
      setReplaying(false);
    }, [key]),
  };
}

type Box = { top: number; left: number; width: number; height: number };
const PAD = 6;
const CARD_W = 320;
const GAP = 12;

export function Tour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const host = useContext(OverlayLayerContext);
  const t = useT();
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  // The card's real height, so it sits fully above or below the spotlight and never covers it.
  const [cardH, setCardH] = useState(200);
  const step = steps[index];
  const last = index === steps.length - 1;

  const measure = useCallback(() => {
    if (!host) return;
    const screen = host.parentElement;
    const target = screen?.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    const h = host.getBoundingClientRect();
    setHostSize({ width: h.width, height: h.height });
    if (!target) {
      setBox(null);
      return;
    }
    const r = target.getBoundingClientRect();
    setBox({ top: r.top - h.top - PAD, left: r.left - h.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [host, step.target]);

  // Bring the part into view, then measure it. Measure again when anything scrolls or resizes.
  useLayoutEffect(() => {
    const target = host?.parentElement?.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    target?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    const frame = requestAnimationFrame(measure);
    // Measure once more after any smooth scroll or layout shift has settled.
    const settle = window.setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [host, step.target, measure]);

  useEffect(() => {
    cardRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(() => setCardH(card.offsetHeight));
    observer.observe(card);
    return () => observer.disconnect();
  }, [host]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, steps.length]);

  if (!host) return null;

  // The card goes under the part when there is room, otherwise above it, and stays inside the screen.
  const cardWidth = Math.min(CARD_W, hostSize.width - 32);
  let cardTop = hostSize.height / 2 - 90;
  let cardLeft = (hostSize.width - cardWidth) / 2;
  if (box) {
    const below = box.top + box.height + GAP;
    cardTop = below + cardH + 16 < hostSize.height ? below : Math.max(16, box.top - GAP - cardH);
    cardLeft = Math.min(Math.max(16, box.left + box.width / 2 - cardWidth / 2), hostSize.width - cardWidth - 16);
  }

  return createPortal(
    <div className="absolute inset-0 z-50" data-testid="tour">
      {box ? (
        <div
          className="tour-spot pointer-events-none absolute rounded-2xl"
          style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-ink/55" aria-hidden />
      )}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        className="tour-card absolute rounded-2xl bg-paper p-4 outline-none"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        <p className="text-xs font-medium text-muted">{t(tourCopy.stepOf, { n: index + 1, total: steps.length })}</p>
        <h2 id="tour-title" className="mt-1 text-base font-semibold leading-snug">
          {t(step.title)}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(step.body)}</p>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={onClose} className="mr-auto rounded-lg px-2 py-2 text-sm font-medium text-muted hover:text-ink" data-testid="tour-skip">
            {t(tourCopy.skip)}
          </button>
          {index > 0 && (
            <button type="button" onClick={() => setIndex(index - 1)} className="btn-quiet min-h-10 px-3 text-sm">
              {t(tourCopy.back)}
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? onClose() : setIndex(index + 1))}
            className="btn-primary min-h-10 px-4 text-sm"
            data-testid="tour-next"
          >
            {last ? t(tourCopy.done) : t(tourCopy.next)}
          </button>
        </div>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {steps.map((s, i) => (
            <span key={s.target} className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-line"}`} />
          ))}
        </div>
      </div>
    </div>,
    host,
  );
}
