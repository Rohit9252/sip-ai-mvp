"use client";

import Link from "next/link";
import { consentCopy } from "@/lib/copy/consent";
import { useT } from "@/components/lang/lang-provider";

/** The three "how we built it" pages (English, for reviewers). */
export const BUILD_PAGES = [
  { href: "/design", label: "Design thesis" },
  { href: "/cohorts", label: "Cohort proof" },
  { href: "/experiment", label: "Experiment plan" },
] as const;

/** A card on the set-up screen, so a visitor finds the three pages without opening any menu. */
export function BuildCard({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <section className={`rounded-2xl bg-primary-soft p-4 ring-1 ring-primary/20 ${className}`} data-testid="build-card">
      <h3 className="text-sm font-semibold text-ink">{t(consentCopy.buildTitle)}</h3>
      <p className="mt-1 text-[13px] leading-snug text-muted">{t(consentCopy.buildBody)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {BUILD_PAGES.map((p) => (
          <Link key={p.href} href={p.href} className="rounded-full bg-paper px-3 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary hover:text-paper">
            {p.label} →
          </Link>
        ))}
      </div>
    </section>
  );
}
