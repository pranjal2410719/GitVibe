import { NextResponse } from "next/server";
import { fetchProfile, GitHubError, USERNAME_RE } from "@/lib/github";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/* ------------------------------ rate limiting ------------------------------ */

// Simple in-memory sliding-window limiter per client IP. Serverless instances
// are ephemeral, so this is per-instance protection (not a global quota) — it
// raises the bar against casual abuse, while GitHub's own limits stay the hard
// cap. Values are deliberately generous so normal browsing is never affected.
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
  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 10_000) {
    for (const [k, ts] of hits) {
      if (ts.every((t) => now - t >= RATE.windowMs)) hits.delete(k);
    }
  }
  return recent.length > RATE.max;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ username: string }> },
) {
  const { username } = await context.params;
  const u = username.toLowerCase();

  // Rate-limit first so even invalid-username spam is throttled (it never
  // reaches GitHub, but it should still not be free to hammer us).
  if (isRateLimited(clientIp(_req))) {
    return NextResponse.json(
      { error: "Too many requests. Take a breath and try again in a minute.", code: "rate_limit" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  if (!USERNAME_RE.test(u) || u.length > 39) {
    return NextResponse.json(
      { error: "That doesn't look like a valid GitHub username.", code: "invalid_username" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchProfile(u);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GitHubError) {
      const status = err.status === 0 ? 502 : err.status === 404 ? 404 : err.status === 403 ? 429 : 502;
      const code = err.status === 404 ? "not_found" : err.status === 403 ? "rate_limit" : "upstream";
      return NextResponse.json({ error: err.message, code }, { status });
    }
    return NextResponse.json(
      { error: "Something went wrong while analyzing this profile.", code: "internal" },
      { status: 500 },
    );
  }
}
