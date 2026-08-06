/** Deterministic string hash (FNV-1a) */
export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — fast, deterministic PRNG */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(arr: T[]) => T;
  picks: <T>(arr: T[], n: number) => T[];
  shuffle: <T>(arr: T[]) => T[];
  chance: (p: number) => boolean;
}

export function createRng(seed: number | string): Rng {
  const next = mulberry32(typeof seed === "string" ? hashString(seed) : seed);
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    picks: (arr, n) => {
      const copy = [...arr];
      const out: typeof arr = [];
      while (out.length < n && copy.length > 0) {
        out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]);
      }
      return out;
    },
    shuffle: (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    chance: (p) => next() < p,
  };
}

/** Stable seed for a username (used for traits/scores) */
export function profileSeed(username: string, salt = ""): string {
  return `${username.toLowerCase()}::${salt}`;
}
