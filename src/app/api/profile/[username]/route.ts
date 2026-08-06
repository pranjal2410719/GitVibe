import { NextResponse } from "next/server";
import { analyze } from "@/lib/personality";
import type {
  ContributionsData,
  GitHubEvent,
  GitHubRepo,
  GitHubUser,
  ProfileResult,
  RawProfile,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const GH = "https://api.github.com";
const CONTRIB_API = "https://github-contributions-api.jogruber.de/v4";
const TOKEN = process.env.GITHUB_TOKEN;
const CACHE_TTL_MS = 10 * 60 * 1000;

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

const cache = new Map<string, { result: ProfileResult; at: number }>();
const inflight = new Map<string, Promise<ProfileResult>>();

class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "gitvibes-app",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  let res: Response;
  try {
    res = await fetch(`${GH}${path}`, {
      headers,
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 300 },
    });
  } catch {
    throw new GitHubError(0, "Could not reach the GitHub API.");
  }

  if (res.status === 404) throw new GitHubError(404, "This user does not exist on GitHub.");
  if (res.status === 403 || res.status === 429) {
    throw new GitHubError(403, "GitHub's rate limit was reached. Try again in a few minutes.");
  }
  if (!res.ok) throw new GitHubError(res.status, `GitHub API returned status ${res.status}.`);
  return (await res.json()) as T;
}

async function fetchContributions(username: string): Promise<ContributionsData | null> {
  try {
    const res = await fetch(`${CONTRIB_API}/${username}?y=last`, {
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      total?: number;
      contributions?: { date?: string; count?: number }[];
    };
    const contributions = (data.contributions ?? [])
      .filter((c) => typeof c.date === "string")
      .map((c) => ({ date: c.date as string, count: c.count ?? 0 }));
    if (contributions.length === 0) return null;
    return { total: data.total ?? 0, years: null, contributions };
  } catch {
    return null;
  }
}

async function loadProfile(username: string): Promise<ProfileResult> {
  const u = username.toLowerCase();
  // The user leg is required; repos/events/contributions degrade gracefully so a
  // transient failure on one leg doesn't take down the whole profile.
  const [user, repos, events, contributions] = await Promise.all([
    gh<GitHubUser>(`/users/${u}`),
    gh<GitHubRepo[]>(`/users/${u}/repos?per_page=100&sort=stars`).catch(() => [] as GitHubRepo[]),
    gh<GitHubEvent[]>(`/users/${u}/events/public?per_page=30`).catch(() => [] as GitHubEvent[]),
    fetchContributions(u),
  ]);

  const raw: RawProfile = { user, repos, events, contributions };
  const { stats, personality } = analyze(raw);

  return {
    username: u,
    raw,
    stats,
    personality,
    meta: {
      fromCache: false,
      partial: contributions === null,
      fetchedAt: Date.now(),
    },
  };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ username: string }> },
) {
  const { username } = await context.params;
  const u = username.toLowerCase();

  if (!USERNAME_RE.test(u) || u.length > 39) {
    return NextResponse.json(
      { error: "That doesn't look like a valid GitHub username.", code: "invalid_username" },
      { status: 400 },
    );
  }

  const cached = cache.get(u);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached.result, meta: { ...cached.result.meta, fromCache: true } });
  }

  const inFlight = inflight.get(u);
  if (inFlight) {
    return NextResponse.json(await inFlight);
  }

  const promise = loadProfile(u)
    .then((result) => {
      // Only cache complete results; partial ones (e.g. contributions API down)
      // should be re-attempted on the next request.
      if (!result.meta.partial) {
        cache.set(u, { result, at: Date.now() });
      }
      return result;
    })
    .finally(() => inflight.delete(u));
  inflight.set(u, promise);

  try {
    const result = await promise;
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
