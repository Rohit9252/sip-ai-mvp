"use client";

import { copy } from "@/lib/copy/dictionary";
import { LangSwitch } from "@/components/lang/lang-switch";
import { useT } from "@/components/lang/lang-provider";

/**
 * The fixed band at the top of every screen. It says this is a concept made for a course project, not made by or
 * linked to Groww, and not investment advice (ADR-0004). The language switch sits under it.
 */
export function Strip() {
  const t = useT();
  return (
    <header className="screen-top shrink-0 border-b border-line bg-surface">
      <p className="px-4 pt-2 text-xs leading-[1.5] text-muted" data-testid="strip">
        {t(copy.common.strip)}
      </p>
      <div className="flex justify-end px-4 pb-2 pt-1.5">
        <LangSwitch />
      </div>
    </header>
  );
}
