"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Summoning your aura…",
  "Measuring chaos levels…",
  "Reading commit history…",
  "Consulting the coding gods…",
  "Brewing personality tea…",
  "Analyzing repo energy…",
  "Calibrating roast intensity…",
  "Counting your green squares…",
];

/**
 * Reusable shimmer block. The gradient slide is the same one LoadingState
 * uses, so the whole app shares one consistent "loading" look.
 */
function S({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-[linear-gradient(90deg,rgb(255_255_255/0.04)_25%,rgb(255_255_255/0.09)_50%,rgb(255_255_255/0.04)_75%)] bg-[length:200%_100%] ${className}`}
    />
  );
}

/** A fake stat label + value pair used in the header and footer grids. */
function StatBlock() {
  return (
    <div className="space-y-1.5">
      <S className="h-7 w-16" />
      <S className="h-3 w-20" />
    </div>
  );
}

/**
 * Full-page skeleton that mirrors ProfileSections so the layout is stable
 * from the first paint: the header (with a circular avatar), score gauges,
 * archetype, repo/language cards, heatmap, recruiter, roast and identity card
 * are all hinted at — and the page only swaps to real content once the data
 * AND the avatar image have finished loading.
 */
export default function ProfileSkeleton() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full animate-fade-up space-y-5" role="status" aria-live="polite" aria-busy="true">
      {/* rotating status line */}
      <div className="flex items-center justify-center gap-3 py-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aura-400 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-aura-500" />
        </span>
        <p className="font-display text-lg font-medium text-white/85">{MESSAGES[msgIndex]}</p>
      </div>

      {/* ---------- profile header ---------- */}
      <section className="card animate-fade-up overflow-hidden p-0">
        <div className="h-24 bg-[radial-gradient(120%_160%_at_10%_0%,rgb(139_92_246/0.3)_0%,rgb(244_63_94/0.14)_45%,rgb(6_212_250/0.12)_100%)] sm:h-28" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex flex-wrap items-end gap-4 sm:-mt-14">
            {/* circular avatar placeholder */}
            <div className="h-24 w-24 shrink-0 rounded-full border-4 border-ink-900 shadow-2xl sm:h-28 sm:w-28">
              <S className="h-full w-full rounded-full" />
            </div>
            <div className="min-w-0 flex-1 space-y-2.5 pb-1">
              <S className="h-7 w-44 sm:w-56" />
              <S className="h-4 w-64 max-w-full" />
              <S className="h-4 w-40 max-w-full" />
            </div>
            <div className="mb-1 flex gap-2">
              <S className="h-9 w-24 rounded-xl" />
              <S className="hidden h-9 w-9 rounded-xl sm:block" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <S className="h-4 w-full max-w-2xl" />
            <S className="h-4 w-3/4 max-w-xl" />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <S className="h-4 w-28" />
            <S className="h-4 w-32" />
            <S className="h-4 w-24" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-5 sm:grid-cols-4">
            <StatBlock />
            <StatBlock />
            <StatBlock />
            <StatBlock />
          </div>
        </div>
      </section>

      {/* ---------- score gauges ---------- */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card flex h-64 flex-col items-center justify-center gap-4 px-4 py-6">
            <div className="h-28 w-28 rounded-full p-1.5 ring-1 ring-white/10">
              <S className="h-full w-full rounded-full" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <S className="h-5 w-20" />
              <S className="h-5 w-24 rounded-full" />
              <S className="mt-1 h-3 w-40" />
            </div>
          </div>
        ))}
      </div>

      {/* ---------- archetype ---------- */}
      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🔮</span>
              <S className="h-5 w-44" />
            </div>
            <S className="h-3.5 w-72 max-w-full" />
          </div>
          <S className="h-7 w-36 rounded-full" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] p-5">
          <div className="flex items-center gap-3">
            <S className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <S className="h-6 w-48" />
              <S className="h-4 w-64 max-w-full" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <S className="h-3.5 w-full" />
            <S className="h-3.5 w-5/6" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <S className="h-6 w-24 rounded-full" />
            <S className="h-6 w-28 rounded-full" />
            <S className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <S className="h-6 w-32 rounded-full" />
          <S className="h-6 w-28 rounded-full" />
          <S className="h-6 w-24 rounded-full" />
          <S className="h-6 w-20 rounded-full" />
        </div>
      </section>

      {/* ---------- repo highlights + language chart ---------- */}
      <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <section className="card p-5 sm:p-6">
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🗂️</span>
              <S className="h-5 w-40" />
            </div>
            <S className="h-3.5 w-56 max-w-full" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                <S className="h-9 w-9 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <S className="h-4 w-40 max-w-full" />
                  <S className="h-3 w-28" />
                </div>
                <S className="h-3 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🎨</span>
              <S className="h-5 w-40" />
            </div>
            <S className="h-3.5 w-52 max-w-full" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <S className="h-2.5 w-2.5 rounded-full" />
                    <S className="h-3.5 w-20" />
                  </div>
                  <S className="h-3 w-8" />
                </div>
                <S className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ---------- contribution heatmap ---------- */}
      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🟩</span>
              <S className="h-5 w-44" />
            </div>
            <S className="h-3.5 w-56 max-w-full" />
          </div>
          <S className="h-7 w-28 rounded-full" />
        </div>
        {/* static cells (no shimmer on each) so the grid stays cheap */}
        <div className="overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-[3px]">
            {Array.from({ length: 26 }).map((_, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => (
                  <div
                    key={di}
                    className="h-3 w-3 rounded-[2px]"
                    style={{ backgroundColor: `rgb(255 255 255 / ${0.03 + ((wi + di) % 5) * 0.02})` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 h-3.5 w-64 max-w-full rounded-lg">
          <S className="h-full w-full" />
        </div>
      </section>

      {/* ---------- activity feed ---------- */}
      <section className="card p-5 sm:p-6">
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>📡</span>
            <S className="h-5 w-36" />
          </div>
          <S className="h-3.5 w-48 max-w-full" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-1 py-1">
              <S className="h-8 w-8 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <S className="h-3.5 w-full" />
                <S className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- recruiter ---------- */}
      <section className="card p-5 sm:p-6">
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>💼</span>
            <S className="h-5 w-44" />
          </div>
          <S className="h-3.5 w-64 max-w-full" />
        </div>
        <S className="h-9 w-40 rounded-full" />
        <div className="mt-4 space-y-2">
          <S className="h-3.5 w-full" />
          <S className="h-3.5 w-11/12" />
          <S className="h-3.5 w-4/5" />
          <S className="h-3.5 w-2/3" />
        </div>
      </section>

      {/* ---------- roast ---------- */}
      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl" aria-hidden>🔥</span>
          <S className="h-5 w-28" />
          <S className="ml-auto h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-2.5">
          <S className="h-14 w-full rounded-xl" />
          <S className="h-14 w-full rounded-xl" />
          <S className="h-14 w-full rounded-xl" />
        </div>
      </section>

      {/* ---------- fun fact ---------- */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>✨</span>
          <div className="flex-1 space-y-2">
            <S className="h-4 w-full" />
            <S className="h-4 w-3/4" />
          </div>
        </div>
      </section>

      {/* ---------- identity card ---------- */}
      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🪪</span>
              <S className="h-5 w-48" />
            </div>
            <S className="h-3.5 w-64 max-w-full" />
          </div>
          <S className="h-9 w-36 rounded-xl" />
        </div>
        <S className="h-64 w-full rounded-3xl" />
      </section>
    </div>
  );
}
