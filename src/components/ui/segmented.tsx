"use client";

/**
 * A row of choices on a soft track; the chosen one lifts onto a white pill. Used for the language and the chart range.
 * Each choice is a button that says whether it is pressed, so it works with a keyboard and a screen reader.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: {
  label: string;
  options: readonly { value: T; label: string; lang?: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const pad = size === "sm" ? "min-h-8 px-3 text-[13px]" : "min-h-11 px-4 text-sm";
  return (
    <div role="group" aria-label={label} className={`inline-flex gap-0.5 rounded-full bg-surface-strong p-0.5 ${className}`}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.lang}
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            className={`${pad} rounded-full font-medium leading-tight transition-colors ${
              on ? "bg-paper text-ink shadow-[0_1px_2px_rgba(31,36,50,0.14)]" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
