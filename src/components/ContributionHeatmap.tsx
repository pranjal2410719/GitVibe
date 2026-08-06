"use client";

import { Flame } from "lucide-react";
import type { ContributionDay, ContributionStreakInfo } from "@/lib/types";
import { Section } from "./ui";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL = 11;
const GAP = 3;
const GUTTER = CELL + 4; // day-label column width (cell + its right margin)

function colorFor(count: number): string {
  if (count <= 0) return "#161b22";
  if (count <= 3) return "#0e4429";
  if (count <= 6) return "#006d32";
  if (count <= 9) return "#26a641";
  return "#39d353";
}

function buildWeeks(days: ContributionDay[]) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const counts = new Map(sorted.map((d) => [d.date, d.count]));
  const first = new Date(`${sorted[0].date}T00:00:00Z`);
  const last = new Date(`${sorted[sorted.length - 1].date}T00:00:00Z`);
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - first.getUTCDay());

  const weeks: { date: string; count: number }[][] = [];
  const cursor = new Date(start);
  const monthLabels: { index: number; label: string }[] = [];
  let prevMonth = -1;
  while (cursor <= last) {
    const week: { date: string; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({ date: iso, count: counts.get(iso) ?? 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    const m = new Date(`${week[0].date}T00:00:00Z`).getUTCMonth();
    if (m !== prevMonth) {
      monthLabels.push({ index: weeks.length, label: MONTHS[m] });
      prevMonth = m;
    }
    weeks.push(week);
  }
  return { weeks, monthLabels };
}

const DAY_LABELS = ["", "M", "", "W", "", "F", ""];

export default function ContributionHeatmap({
  days,
  streak,
}: {
  days: ContributionDay[];
  streak: ContributionStreakInfo;
}) {
  const { weeks, monthLabels } = buildWeeks(days);

  return (
    <Section
      emoji="🟩"
      title="Contribution activity"
      subtitle={`${streak.total.toLocaleString()} contributions over the last year`}
      right={
        <span className="flex items-center gap-1 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
          <Flame className="h-3.5 w-3.5" /> {streak.longestStreak}-day streak
        </span>
      }
    >
      <p className="mb-2 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25 sm:hidden">
        ← drag to scroll →
      </p>
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="inline-block">
          <div className="relative mb-1 h-4 text-[10px] font-medium text-white/35">
            {monthLabels.map((m) => (
              // +GUTTER aligns labels with the weeks grid that follows the day-label column
              <span key={m.index} className="absolute" style={{ left: GUTTER + m.index * (CELL + GAP) }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="mr-1 flex flex-col gap-[3px] text-[9px] text-white/35">
              {DAY_LABELS.map((d, i) => (
                <span key={i} style={{ height: CELL }} className="leading-[11px]">
                  {d}
                </span>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count} contribution${d.count === 1 ? "" : "s"}`}
                    className="rounded-[2px] ring-1 ring-inset ring-white/[0.06]"
                    style={{ width: CELL, height: CELL, backgroundColor: colorFor(d.count) }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-white/35">
            Less
            {[0, 2, 5, 8, 12].map((c) => (
              <span key={c} className="rounded-[2px]" style={{ width: CELL, height: CELL, backgroundColor: colorFor(c) }} />
            ))}
            More
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-white/40">
        {streak.currentStreak > 0
          ? `Currently on a ${streak.currentStreak}-day streak. The momentum is real.`
          : streak.total > 0
            ? "Streak currently cooling down — but the year's tally speaks for itself."
            : "A blank canvas. GitHub's green squares are anxiously awaiting a first commit."}
      </p>
    </Section>
  );
}
