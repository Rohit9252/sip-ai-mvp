"use client";

import { copy } from "@/lib/copy/dictionary";
import { deskCopy, tourCopy } from "@/lib/copy/tour";
import { LangSwitch } from "@/components/lang/lang-switch";
import { useT } from "@/components/lang/lang-provider";
import { useLayoutMode } from "@/components/device-shell/layout-mode";
import { ChevronRightIcon, HelpIcon } from "@/components/icons";

/**
 * The top of every screen. It always says this is a concept made for a graduation project, not made by or linked to
 * Groww, and not investment advice (ADR-0004), with the language switch and a way to replay the tour.
 * Phone: a quiet band. Desktop: a top bar with the page path; the full notice sits in a line under it.
 */
export function Strip({ onHelp, page }: { onHelp?: () => void; page?: "setup" | "sip" }) {
  const t = useT();
  const desktop = useLayoutMode() === "desktop";

  const help = onHelp ? (
    <button
      type="button"
      onClick={onHelp}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted hover:bg-surface-strong hover:text-ink"
      data-testid="tour-replay"
    >
      <HelpIcon width={16} height={16} />
      {desktop && t(tourCopy.replay)}
    </button>
  ) : null;

  if (desktop) {
    return (
      <header className="shrink-0 border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-8">
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
            <rect width="64" height="64" rx="14" fill="var(--color-primary)" />
            <path d="M12 40 L22 30 L30 35 L40 22 L46 29 L52 25" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <nav aria-label="Path" className="flex items-center gap-1.5 text-sm">
            <span className="text-muted">{t(deskCopy.crumb)}</span>
            <ChevronRightIcon width={14} height={14} className="text-muted" />
            <span className="font-semibold">{page === "sip" ? t(deskCopy.page) : t(copy.setup.title)}</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-line" data-tour="strip" title={`${t(copy.common.strip)} ${t(copy.common.stripAdvice)}`}>
              {t(deskCopy.conceptPill)}
            </span>
            <div data-tour="lang">
              <LangSwitch />
            </div>
            {help}
          </div>
        </div>
        <p className="border-t border-line bg-surface px-8 py-1.5 text-center text-xs text-muted" data-testid="strip">
          {t(copy.common.strip)} <strong className="font-semibold text-ink">{t(copy.common.stripAdvice)}</strong>
        </p>
      </header>
    );
  }

  return (
    <header className="screen-top shrink-0 border-b border-line bg-surface">
      <p className="px-4 pt-2 text-xs leading-normal text-muted" data-testid="strip" data-tour="strip">
        {t(copy.common.strip)} <strong className="font-semibold text-ink">{t(copy.common.stripAdvice)}</strong>
      </p>
      <div className="flex items-center justify-end gap-1 px-4 pb-2 pt-1.5">
        {help}
        <div data-tour="lang">
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
