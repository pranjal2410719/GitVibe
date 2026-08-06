"use client";

import { Clock, Trash2 } from "lucide-react";

export interface RecentSearch {
  username: string;
  avatar: string;
  fetchedAt: number;
}

const STORAGE_KEY = "gitvibes:recent";
export const RECENT_LIMIT = 8;

export function loadRecent(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearch[];
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

export function saveRecent(entry: RecentSearch) {
  try {
    const next = [entry, ...loadRecent().filter((r) => r.username !== entry.username)].slice(0, RECENT_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clearRecent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function RecentSearches({
  items,
  onPick,
  onClear,
}: {
  items: RecentSearch[];
  onPick: (username: string) => void;
  onClear: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="w-full animate-fade-up">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
          <Clock className="h-3.5 w-3.5" /> Recently read
        </p>
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/35 transition-colors hover:bg-white/5 hover:text-chaos-400"
        >
          <Trash2 className="h-3 w-3" /> Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((r) => (
          <button
            key={r.username}
            onClick={() => onPick(r.username)}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3.5 text-sm font-medium text-white/75 transition-all duration-200 hover:border-aura-500/50 hover:bg-white/10 hover:text-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external avatar URL, avoids next/image remote config */}
            <img
              src={r.avatar}
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px] rounded-full object-cover ring-1 ring-white/10"
              loading="lazy"
            />
            <span>@{r.username}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
