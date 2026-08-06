"use client";

import { Trophy } from "lucide-react";
import type { HallEntry } from "@/lib/hall-of-fame";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function HallOfFame({
  items,
  onPick,
}: {
  items: HallEntry[];
  onPick: (username: string) => void;
}) {
  const top = items.slice(0, 5);
  if (top.length === 0) return null;

  return (
    <div className="w-full animate-fade-up">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
        <Trophy className="h-3.5 w-3.5 text-amber-400" /> Hall of fame — highest aura on this device
      </p>
      <div className="card mx-auto max-w-xl p-2.5 sm:p-3">
        <ul className="divide-y divide-white/5">
          {top.map((e, i) => (
            <li key={e.username}>
              <button
                onClick={() => onPick(e.username)}
                className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-white/5"
                title={`Re-analyze @${e.username}`}
              >
                <span className="w-7 shrink-0 text-center text-base">
                  {MEDALS[i] ?? <span className="text-xs font-bold text-white/40">{i + 1}</span>}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element -- external avatar URL, avoids next/image remote config */}
                <img
                  src={e.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/80 transition-colors group-hover:text-white">
                  @{e.username}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-aura-500/15 px-2.5 py-1 text-xs font-bold text-aura-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-aura-400" aria-hidden /> {e.aura}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
