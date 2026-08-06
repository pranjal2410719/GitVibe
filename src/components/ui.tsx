import type { ReactNode } from "react";

/** Shared section shell with a playful heading */
export function Section({
  emoji,
  title,
  subtitle,
  children,
  className = "",
  right,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-white">
            <span className="text-xl" aria-hidden>
              {emoji}
            </span>
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/** Small pill used for tags / chips */
export function Chip({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 ${className}`}
    >
      {children}
    </span>
  );
}

/** Stat block: big number + label */
export function Stat({
  value,
  label,
  accent = "text-white",
}: {
  value: ReactNode;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center sm:items-start sm:text-left">
      <span className={`font-display text-xl font-bold sm:text-2xl ${accent}`}>{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</span>
    </div>
  );
}

/** Fade-up reveal wrapper with configurable delay */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
