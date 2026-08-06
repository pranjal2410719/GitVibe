"use client";

export interface HallEntry {
  username: string;
  avatar: string;
  aura: number;
  fetchedAt: number;
}

const STORAGE_KEY = "gitvibes:hall";
export const HALL_LIMIT = 20;

/** Load the device-local Hall of Fame, sorted by aura (highest first). */
export function loadHall(): HallEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HallEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => typeof e?.username === "string" && typeof e?.aura === "number")
      .sort((a, b) => b.aura - a.aura || a.fetchedAt - b.fetchedAt)
      .slice(0, HALL_LIMIT);
  } catch {
    return [];
  }
}

/**
 * Record an analyzed profile in the Hall of Fame. Re-analyzing the same user
 * replaces their old entry with the fresh aura reading.
 */
export function saveHall(entry: HallEntry) {
  try {
    const next = [entry, ...loadHall().filter((e) => e.username !== entry.username)]
      .sort((a, b) => b.aura - a.aura || a.fetchedAt - b.fetchedAt)
      .slice(0, HALL_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — ignore */
  }
}

