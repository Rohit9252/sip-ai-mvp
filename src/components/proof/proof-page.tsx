import Link from "next/link";

/**
 * The frame of the three "how we built it" pages: the design thesis, the cohort proof and the experiment plan.
 * They are written for reviewers, in English, and sit outside the app's phone and desktop shell.
 */

const PAGES = [
  { href: "/design", label: "Design thesis" },
  { href: "/cohorts", label: "Cohort proof" },
  { href: "/experiment", label: "Experiment plan" },
] as const;

export function ProofPage({ current, title, lead, children }: { current: (typeof PAGES)[number]["href"]; title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            ← Back to the app
          </Link>
          <nav aria-label="The proof behind it" className="flex flex-wrap gap-1">
            {PAGES.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                aria-current={p.href === current ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${p.href === current ? "bg-primary text-paper" : "text-muted hover:bg-surface-strong hover:text-ink"}`}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1040px] px-5 pb-16 pt-8">
        <h1 className="text-3xl font-semibold leading-tight text-ink">{title}</h1>
        <p className="mt-3 max-w-[760px] text-base leading-relaxed text-muted">{lead}</p>
        <div className="mt-8 flex flex-col gap-6">{children}</div>
        <p className="mt-12 text-xs text-muted">
          A concept for a Groww feature, made for a graduation project. Not made by or linked to Groww. Not investment advice.
        </p>
      </main>
    </div>
  );
}

export function Card({ title, children, tone = "plain", className = "" }: { title: string; children: React.ReactNode; tone?: "plain" | "accent" | "warn"; className?: string }) {
  const ring = tone === "accent" ? "ring-2 ring-primary/40" : tone === "warn" ? "ring-2 ring-loss/40" : "ring-1 ring-line";
  return (
    <section className={`rounded-2xl bg-paper p-5 ${ring} ${className}`}>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}
