import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const GH = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;
const CACHE_TTL_MS = 30_000; // short TTL: autocomplete queries repeat a lot

const QUERY_RE = /^[a-zA-Z0-9-]{1,39}$/;

interface SearchUser {
  login: string;
  avatar_url: string;
}

/* ------------------------------ rate limiting ------------------------------ */

// Same in-memory sliding-window pattern as the profile route. Kept separate so
// search typing can't eat into profile-analysis quota (or vice versa).
const RATE = { windowMs: 60_000, max: 30 };
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE.windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) {
    for (const [k, ts] of hits) {
      if (ts.every((t) => now - t >= RATE.windowMs)) hits.delete(k);
    }
  }
  return recent.length > RATE.max;
}

const cache = new Map<string, { users: SearchUser[]; at: number }>();

export async function GET(req: Request) {
  if (isRateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "Too many requests. Slow down for a second.", code: "rate_limit" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!QUERY_RE.test(q)) {
    // Not a valid search term — return an empty list rather than an error so
    // the autocomplete just shows nothing while the user is mid-keystroke.
    return NextResponse.json({ users: [] });
  }

  const cached = cache.get(q);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ users: cached.users });
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "gitvibe-app",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  try {
    const res = await fetch(`${GH}/search/users?q=${encodeURIComponent(q)}&per_page=5&page=1`, {
      headers,
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      // GitHub's search API throttles aggressively; fail quietly to a 502.
      const status = res.status === 403 || res.status === 429 ? 429 : 502;
      return NextResponse.json(
        { error: "Search is temporarily unavailable.", code: status === 429 ? "rate_limit" : "upstream" },
        { status },
      );
    }
    const data = (await res.json()) as { items?: { login?: string; avatar_url?: string }[] };
    const users: SearchUser[] = (data.items ?? [])
      .filter((i) => typeof i.login === "string" && i.login)
      .slice(0, 5)
      .map((i) => ({ login: i.login as string, avatar_url: i.avatar_url ?? "" }));

    if (cache.size > 500) {
      const now = Date.now();
      for (const [k, v] of cache) {
        if (now - v.at >= CACHE_TTL_MS) cache.delete(k);
      }
    }
    cache.set(q, { users, at: Date.now() });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the GitHub API.", code: "upstream" },
      { status: 502 },
    );
  }
}
