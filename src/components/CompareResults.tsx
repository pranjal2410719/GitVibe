"use client";

import { Crown, Swords } from "lucide-react";
import { formatFullNumber } from "@/lib/format";
import type { ProfileResult } from "@/lib/types";
import { Reveal, Section } from "./ui";

function FighterCard({ result, isWinner }: { result: ProfileResult; isWinner: boolean }) {
  const { raw, stats, personality } = result;
  const user = raw.user;
  if (!user) return null;

  const scoreChips = [
    { label: "Aura", value: personality.scores.aura.value, color: "#a78bfa" },
    { label: "Chaos", value: personality.scores.chaos.value, color: "#fb7185" },
    { label: "Energy", value: personality.scores.energy.value, color: "#22d3ee" },
  ];

  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all duration-300 ${
        isWinner ? "border-amber-400/40 bg-amber-500/[0.06] shadow-[0_0_40px_-15px_rgb(251_191_36/0.4)]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {isWinner ? (
        <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full border border-amber-400/40 bg-ink-900 px-3 py-1 text-xs font-bold text-amber-300">
          <Crown className="h-3.5 w-3.5" /> Winner
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- external avatar URL, avoids next/image remote config */}
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/15"
        />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-white">{user.name ?? user.login}</p>
          <p className="truncate text-sm text-white/45">@{user.login}</p>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
        <span className="text-xl" aria-hidden>
          {personality.archetype.emoji}
        </span>
        <span className="font-semibold text-white">{personality.archetype.title}</span>
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {scoreChips.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border px-2 py-2 text-center ${
              c.label === "Aura" && isWinner ? "border-amber-400/40 bg-amber-500/10" : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <p className="font-display text-xl font-bold" style={{ color: c.color }}>
              {c.value}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/40">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/8 pt-4 text-center">
        {[
          { label: "Stars", value: formatFullNumber(stats.stars), color: "text-amber-300" },
          { label: "Followers", value: formatFullNumber(stats.followers), color: "text-white" },
          { label: "Repos", value: formatFullNumber(stats.repoCount), color: "text-white" },
          { label: "Contribs", value: formatFullNumber(stats.contributions?.total ?? 0), color: "text-emerald-300" },
        ].map((s) => (
          <div key={s.label}>
            <p className={`font-display text-sm font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/35">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompareResults({ left, right }: { left: ProfileResult; right: ProfileResult }) {
  const la = left.personality.scores.aura.value;
  const ra = right.personality.scores.aura.value;
  const le = left.personality.scores.energy.value;
  const re = right.personality.scores.energy.value;
  const winner: "left" | "right" | "tie" = la > ra ? "left" : ra > la ? "right" : le > re ? "left" : re > le ? "right" : "tie";
  const lName = left.raw.user?.name ?? left.username;
  const rName = right.raw.user?.name ?? right.username;

  const verdict =
    winner === "left"
      ? la === ra
        ? `${lName} breaks the ${la}–${ra} aura deadlock on energy.`
        : `${lName} takes the vibe battle, ${la}–${ra}.`
      : winner === "right"
        ? la === ra
          ? `${rName} breaks the ${ra}–${la} aura deadlock on energy.`
          : `${rName} takes the vibe battle, ${ra}–${la}.`
        : "A perfectly balanced clash. The multiverse splits.";

  return (
    <Reveal>
      <Section
        emoji="⚔️"
        title="The vibe battle"
        subtitle="Two developers walk in. One aura walks out."
        right={
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/60">
            <Swords className="h-3.5 w-3.5" /> head to head
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch sm:gap-4">
          <FighterCard result={left} isWinner={winner === "left"} />
          <div className="flex items-center justify-center">
            <span className="rounded-full border border-chaos-400/30 bg-chaos-500/10 px-4 py-1.5 font-display text-sm font-bold text-chaos-300">
              VS
            </span>
          </div>
          <FighterCard result={right} isWinner={winner === "right"} />
        </div>
        <p className="mt-5 text-center font-display text-lg font-semibold text-white/85">{verdict}</p>
      </Section>
    </Reveal>
  );
}
