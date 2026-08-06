/** GitHub REST API — user profile (GET /users/:username) */
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

/** GitHub REST API — repository (GET /users/:username/repos) */
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  archived: boolean;
  topics: string[];
  license: {
    key: string;
    name: string;
    spdx_id: string | null;
    node_id: string;
  } | null;
}

/** GitHub REST API — public event (GET /users/:username/events/public) */
export interface GitHubEvent {
  id: string;
  type: string;
  repo: { id: number; name: string; url: string };
  payload: Record<string, unknown>;
  public: boolean;
  created_at: string;
}

/** github-contributions-api — contribution calendar day */
export interface ContributionDay {
  date: string;
  count: number;
}

/** github-contributions-api — full response (v4?y=last) */
export interface ContributionsData {
  total: number;
  years: { year: string; total: number }[] | null;
  contributions: ContributionDay[];
}

export type LanguageShare = { name: string; count: number; share: number };

export type SkillDomain =
  | "Frontend"
  | "Backend"
  | "Data & ML"
  | "Systems"
  | "Mobile"
  | "DevOps"
  | "Scripting"
  | "Design";

/** Raw data bundle used by the personality engine */
export interface RawProfile {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  contributions: ContributionsData | null;
}

export interface ContributionStreakInfo {
  total: number;
  longestStreak: number;
  currentStreak: number;
  bestDay: string | null;
  bestCount: number;
  days: number;
}

/** Computed, data-derived profile stats */
export interface ProfileStats {
  stars: number;
  forks: number;
  repoCount: number;
  ownRepos: number;
  forkRepos: number;
  gists: number;
  followers: number;
  following: number;
  accountAgeYears: number;
  daysSinceCreation: number;
  languages: LanguageShare[];
  languageEntropy: number;
  topRepo: GitHubRepo | null;
  starSkew: number;
  smallReposShare: number;
  spicyShare: number;
  prEvents: number;
  issueEvents: number;
  eventsCount: number;
  eventsLast14d: number;
  nightOwlRatio: number;
  peakHour: number | null;
  recentPushDaysAgo: number | null;
  contributions: ContributionStreakInfo | null;
  profileScore: number;
  hasBio: boolean;
  hasBlog: boolean;
  hasLocation: boolean;
  hasCompany: boolean;
  hireable: boolean;
  skills: SkillDomain[];
  starPerRepo: number;
  docShare: number;
  forkRatio: number;
  eventRatio: number;
  eventTypes: number;
  pushEvents: number;
  forkEvents: number;
  watchEvents: number;
}

export interface Score {
  value: number;
  tier: string;
  label: string;
  description: string;
}

export interface Archetype {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  traits: string[];
  gradient: string;
}

export interface RecruiterReport {
  notes: string[];
  verdict: string;
  verdictNote: string;
  hireScore: number;
}

export interface Personality {
  archetype: Archetype;
  secondary: Archetype;
  scores: { aura: Score; chaos: Score; energy: Score };
  traits: string[];
  recruiting: RecruiterReport;
  roasts: string[];
  funFact: string;
  powerLevel: { level: number; title: string };
}

/** The full result handed to the UI */
export interface ProfileResult {
  username: string;
  raw: RawProfile;
  stats: ProfileStats;
  personality: Personality;
  meta: {
    fromCache: boolean;
    partial: boolean;
    fetchedAt: number;
  };
}
