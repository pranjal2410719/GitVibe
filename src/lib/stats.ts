import type {
  ContributionDay,
  ContributionStreakInfo,
  ProfileStats,
  RawProfile,
  SkillDomain,
} from "./types";

const SPICY_LANGUAGES = new Set([
  "Rust", "C", "C++", "Go", "Assembly", "Zig", "Lua", "Haskell", "Erlang", "Elixir", "Crystal",
]);
const DOC_LANGUAGES = new Set(["Markdown", "TeX", "MDX", "HTML", "CSS", "SCSS"]);
const DATA_LANGUAGES = new Set(["Python", "Jupyter Notebook", "R", "Julia", "MATLAB", "Fortran", "SQL"]);
const MOBILE_LANGUAGES = new Set(["Swift", "Kotlin", "Dart", "Objective-C", "Java"]);
const SYSTEMS_LANGUAGES = new Set(["Rust", "C", "C++", "Go", "Zig", "Assembly", "Haskell", "OCaml", "Nim"]);
const FRONTEND_LANGUAGES = new Set(["JavaScript", "TypeScript", "HTML", "CSS", "SCSS", "Vue", "Svelte", "MDX"]);
const BACKEND_LANGUAGES = new Set(["Python", "Go", "Ruby", "PHP", "Java", "C#", "Elixir", "Scala", "Crystal"]);
const DEVOPS_LANGUAGES = new Set(["Shell", "PowerShell", "Dockerfile", "Makefile", "Nix", "Groovy", "YAML"]);
const SCRIPTING_LANGUAGES = new Set(["Shell", "Python", "Perl", "Lua", "Ruby", "Vim Script", "PowerShell"]);

const DOMAIN_LANGS: Record<SkillDomain, Set<string>> = {
  Frontend: FRONTEND_LANGUAGES,
  Backend: BACKEND_LANGUAGES,
  "Data & ML": DATA_LANGUAGES,
  Systems: SYSTEMS_LANGUAGES,
  Mobile: MOBILE_LANGUAGES,
  DevOps: DEVOPS_LANGUAGES,
  Scripting: SCRIPTING_LANGUAGES,
  Design: new Set(["CSS", "SCSS", "HTML", "SVG"]),
};

const DAY_MS = 86_400_000;

function mostCommonHour(hours: number[]): number | null {
  if (hours.length === 0) return null;
  const counts = new Map<number, number>();
  for (const h of hours) counts.set(h, (counts.get(h) ?? 0) + 1);
  let best = 0;
  let bestH = hours[0];
  for (const [h, c] of counts) if (c > best) { best = c; bestH = h; }
  return bestH;
}

function streakInfo(days: ContributionDay[]): ContributionStreakInfo {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const counts = new Map(sorted.map((d) => [d.date, d.count]));
  let total = 0;
  let longest = 0;
  let run = 0;
  let bestDay: string | null = null;
  let bestCount = 0;
  for (const d of sorted) {
    total += d.count;
    if (d.count > 0) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
    if (d.count > bestCount) {
      bestCount = d.count;
      bestDay = d.date;
    }
  }
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  let current = 0;
  const cursor = new Date();
  if ((counts.get(iso(cursor)) ?? 0) === 0) cursor.setDate(cursor.getDate() - 1);
  while ((counts.get(iso(cursor)) ?? 0) > 0) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    total,
    longestStreak: longest,
    currentStreak: current,
    bestDay,
    bestCount,
    days: sorted.length,
  };
}

function computeSkills(languages: { name: string; count: number }[]): SkillDomain[] {
  const scores = new Map<SkillDomain, number>();
  for (const { name, count } of languages) {
    for (const [domain, langs] of Object.entries(DOMAIN_LANGS)) {
      if (langs.has(name)) scores.set(domain as SkillDomain, (scores.get(domain as SkillDomain) ?? 0) + count);
    }
  }
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return [];
  const strong = ranked.filter(([, c]) => c >= 2);
  const chosen = (strong.length > 0 ? strong : ranked.slice(0, 1)).slice(0, 4);
  return chosen.map(([domain]) => domain);
}

export function computeStats(raw: RawProfile): ProfileStats {
  const { user, repos, events, contributions } = raw;
  const ownRepos = repos.filter((r) => !r.fork);
  const forkRepos = repos.filter((r) => r.fork);
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = repos.reduce((s, r) => s + r.forks_count, 0);

  const langMap = new Map<string, number>();
  for (const r of ownRepos) {
    if (r.language) langMap.set(r.language, (langMap.get(r.language) ?? 0) + 1);
  }
  const totalLang = [...langMap.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...langMap.entries()]
    .map(([name, count]) => ({ name, count, share: count / totalLang }))
    .sort((a, b) => b.count - a.count);

  const languageEntropy = -languages.reduce((s, l) => s + l.share * Math.log2(l.share || 1), 0);

  const daysSinceCreation = user
    ? Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / DAY_MS))
    : 0;
  const accountAgeYears = daysSinceCreation / 365.25;

  const sortedByStars = [...ownRepos].sort((a, b) => b.stargazers_count - a.stargazers_count);
  const topRepo = sortedByStars[0] ?? null;
  const starSkew = stars > 0 ? (topRepo?.stargazers_count ?? 0) / stars : 0;
  const smallReposShare = ownRepos.length
    ? ownRepos.filter((r) => r.size < 100).length / ownRepos.length
    : 0;
  const spicyShare = ownRepos.length
    ? ownRepos.filter((r) => SPICY_LANGUAGES.has(r.language ?? "")).length / ownRepos.length
    : 0;
  const docShare = ownRepos.length
    ? ownRepos.filter((r) => DOC_LANGUAGES.has(r.language ?? "")).length / ownRepos.length
    : 0;
  const forkRatio = repos.length ? forkRepos.length / repos.length : 0;

  let prEvents = 0;
  let issueEvents = 0;
  let pushEvents = 0;
  let forkEvents = 0;
  let watchEvents = 0;
  let eventsLast14d = 0;
  let lastPushAt: string | null = null;
  const hours: number[] = [];
  const cut14 = Date.now() - 14 * DAY_MS;
  for (const e of events) {
    const t = new Date(e.created_at).getTime();
    if (t >= cut14) eventsLast14d += 1;
    hours.push(new Date(e.created_at).getHours());
    switch (e.type) {
      case "PullRequestEvent": prEvents += 1; break;
      case "IssuesEvent":
      case "IssueCommentEvent": issueEvents += 1; break;
      case "PushEvent":
        pushEvents += 1;
        if (!lastPushAt || t > new Date(lastPushAt).getTime()) lastPushAt = e.created_at;
        break;
      case "ForkEvent": forkEvents += 1; break;
      case "WatchEvent": watchEvents += 1; break;
      default: break;
    }
  }

  const nightOwlRatio = hours.length ? hours.filter((h) => h >= 22 || h < 6).length / hours.length : 0;
  const peakHour = mostCommonHour(hours);
  const recentPushDaysAgo =
    lastPushAt != null ? Math.max(0, Math.floor((Date.now() - new Date(lastPushAt).getTime()) / DAY_MS)) : null;

  const contributionsInfo = contributions?.contributions?.length
    ? streakInfo(contributions.contributions)
    : null;

  const hasBio = Boolean(user?.bio?.trim());
  const hasBlog = Boolean(user?.blog?.trim());
  const hasLocation = Boolean(user?.location?.trim());
  const hasCompany = Boolean(user?.company?.trim());
  const hireable = Boolean(user?.hireable);

  const logStars = Math.log10(stars + 1);
  const logFollowers = Math.log10((user?.followers ?? 0) + 1);
  const profileScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (hasBio ? 18 : 0) +
          (hasBlog ? 10 : 0) +
          (hasLocation ? 10 : 0) +
          (hasCompany ? 8 : 0) +
          (hireable ? 6 : 0) +
          Math.min(24, logFollowers * 8) +
          Math.min(24, logStars * 8),
      ),
    ),
  );

  const eventRatio = events.length ? (prEvents + issueEvents) / events.length : 0;
  const eventTypes = new Set(events.map((e) => e.type)).size;

  return {
    stars,
    forks,
    repoCount: repos.length,
    ownRepos: ownRepos.length,
    forkRepos: forkRepos.length,
    gists: user?.public_gists ?? 0,
    followers: user?.followers ?? 0,
    following: user?.following ?? 0,
    accountAgeYears,
    daysSinceCreation,
    languages,
    languageEntropy,
    topRepo,
    starSkew,
    smallReposShare,
    spicyShare,
    docShare,
    forkRatio,
    prEvents,
    issueEvents,
    pushEvents,
    forkEvents,
    watchEvents,
    eventsCount: events.length,
    eventsLast14d,
    eventRatio,
    eventTypes,
    nightOwlRatio,
    peakHour,
    recentPushDaysAgo,
    contributions: contributionsInfo,
    profileScore,
    hasBio,
    hasBlog,
    hasLocation,
    hasCompany,
    hireable,
    skills: computeSkills(languages),
    starPerRepo: ownRepos.length ? stars / ownRepos.length : 0,
  };
}
