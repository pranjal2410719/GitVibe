import { computeStats } from "./stats";
import type {
  Archetype,
  Personality,
  ProfileStats,
  RawProfile,
  RecruiterReport,
  Score,
} from "./types";
import { clamp, pluralize } from "./format";
import { createRng, profileSeed } from "./seeded-random";

export { computeStats };

/* ---------------------------------- tiers ---------------------------------- */

function tierFor(
  value: number,
  tiers: [number, string, string][],
): { label: string; description: string } {
  for (const [min, label, description] of tiers) {
    if (value >= min) return { label, description };
  }
  const last = tiers[tiers.length - 1];
  return { label: last[1], description: last[2] };
}

const AURA_TIERS: [number, string, string][] = [
  [82, "Radiant", "Lights up entire repos. Recruitment DMs are answered, eventually."],
  [62, "Respected", "People star their repos. Some even remember their name."],
  [42, "Underrated", "A glow that is currently under NDA with the general public."],
  [22, "Incognito", "Aura detected, but faint. Like a phone on silent."],
  [0, "Fading", "Aura currently in airplane mode. Rebooting soon, hopefully."],
];

const CHAOS_TIERS: [number, string, string][] = [
  [75, "Chaotic", "Refactors at 3 AM. The git history is a found-footage horror film."],
  [55, "Spicy", "Occasionally pushes to main. The force is strong, the restraint is not."],
  [35, "Organized", "Squashes commits, writes PR titles, generally a delight."],
  [0, "Zen", "Calm as a Sunday afternoon. Disturbingly so."],
];

const ENERGY_TIERS: [number, string, string][] = [
  [75, "Supernova", "Commits at a rate that suggests a coffee IV drip."],
  [55, "Buzzing", "Keeps the green squares mostly green. Respectable hum."],
  [35, "Idling", "Runs occasionally, like a classic car in a garage."],
  [0, "Hibernating", "Deep sleep mode. Wake with a pull request."],
];

/* -------------------------------- archetypes ------------------------------- */

const ARCHETYPES: Archetype[] = [
  {
    id: "architect",
    emoji: "🏛️",
    title: "The Architect",
    tagline: "Builds things that outlive trends",
    description:
      "Thinks in systems, draws in layers, and names things so well future-you sends thank-you notes. Few repos, each one load-bearing.",
    traits: ["System thinker", "Naming sense", "Patterns > patches"],
    gradient: "from-violet-500/25 to-indigo-500/10",
  },
  {
    id: "midnight-hacker",
    emoji: "🌙",
    title: "The Midnight Hacker",
    tagline: "Best ideas arrive after 1 AM",
    description:
      "The commit timestamps tell a story with a 2 AM plot twist. Thinks best when the world is asleep and the fridge is within reach.",
    traits: ["Night owl", "Deep focus", "Questionable sleep schedule"],
    gradient: "from-indigo-500/25 to-cyan-500/10",
  },
  {
    id: "maintainer",
    emoji: "🧑‍🔧",
    title: "The Maintainer",
    tagline: "Keeps the lights on and the issues triaged",
    description:
      "The quiet hero who turns 'works on my machine' into 'works on everyone's machine'. Releases, docs, and patience in equal measure.",
    traits: ["Reliable", "Docs-first", "Bug whisperer"],
    gradient: "from-emerald-500/25 to-teal-500/10",
  },
  {
    id: "polymath",
    emoji: "🧠",
    title: "The Polymath",
    tagline: "A language for every mood",
    description:
      "Refuses to specialize on principle. Jumps between languages like a browser with 47 tabs — and closes none of them.",
    traits: ["Curious", "Versatile", "Serial context-switcher"],
    gradient: "from-amber-500/25 to-orange-500/10",
  },
  {
    id: "oss-soul",
    emoji: "🌍",
    title: "The OSS Soul",
    tagline: "Gives away the good stuff, free",
    description:
      "Their gift to humanity is MIT-licensed and documented. Forks flow in, stars accumulate, and the world quietly runs on their weekend project.",
    traits: ["Generous", "Community-first", "Impact-driven"],
    gradient: "from-sky-500/25 to-blue-500/10",
  },
  {
    id: "perfectionist",
    emoji: "🧐",
    title: "The Perfectionist",
    tagline: "Merges only when it's right",
    description:
      "Rarely ships, never misses. Every commit is a statement, every README a manifesto. Quality over quantity, always.",
    traits: ["Meticulous", "High standards", "Slightly afraid of 'good enough'"],
    gradient: "from-fuchsia-500/25 to-purple-500/10",
  },
  {
    id: "velocity",
    emoji: "⚡",
    title: "The Velocity Demon",
    tagline: "Shipped it before you finished reading this",
    description:
      "Moves fast, pushes faster, and refactors even faster. The git log looks like a drum solo. Their IDE is always 2 commits behind them.",
    traits: ["Fast shipper", "Action bias", "Minimal planning, maximum doing"],
    gradient: "from-rose-500/25 to-red-500/10",
  },
  {
    id: "remixer",
    emoji: "🔧",
    title: "The Remixer",
    tagline: "Standing on the shoulders of forks",
    description:
      "Sees someone else's good idea and makes it better. Fork ratio high, originality ratio higher. The mashup artist of GitHub.",
    traits: ["Adaptive", "Resourceful", "Great taste in bases"],
    gradient: "from-orange-500/25 to-amber-500/10",
  },
  {
    id: "gardener",
    emoji: "🌱",
    title: "The Issue Gardener",
    tagline: "Watering repos with well-written issues",
    description:
      "Finds the bugs everyone else walked past, then writes up a report so good it deserves a citation. Their attention to detail is borderline clinical.",
    traits: ["Observant", "Precise", "Naturally suspicious"],
    gradient: "from-lime-500/25 to-green-500/10",
  },
  {
    id: "ghost",
    emoji: "👻",
    title: "The Watchful Ghost",
    tagline: "Reads everything, pushes occasionally",
    description:
      "Maintains the lowest-key presence in open source. Watches repos, absorbs knowledge, and strikes precisely when the stars align.",
    traits: ["Observant", "Selective", "Understated"],
    gradient: "from-slate-400/25 to-slate-500/10",
  },
  {
    id: "founder",
    emoji: "🚀",
    title: "The Founder",
    tagline: "One repo to rule them all",
    description:
      "All energy funnels into a single, increasingly famous project. Side quests exist only to serve the main quest.",
    traits: ["Focused", "Visionary", "Slightly obsessed"],
    gradient: "from-pink-500/25 to-rose-500/10",
  },
  {
    id: "scholar",
    emoji: "📚",
    title: "The Scholar",
    tagline: "Notebooks, papers, and well-cited code",
    description:
      "Their repos read like a syllabus. Data, docs, and diagrams everywhere. The only person whose README includes a bibliography.",
    traits: ["Rigorous", "Documentation geek", "Citation enjoyer"],
    gradient: "from-teal-500/25 to-emerald-500/10",
  },
];

interface ArchetypeWeight {
  archetype: Archetype;
  weight: number;
}

function archetypeWeights(s: ProfileStats): ArchetypeWeight[] {
  const w = (id: string, base: number, extra = 0) => {
    const a = ARCHETYPES.find((x) => x.id === id);
    return a ? { archetype: a, weight: Math.max(0.02, base + extra) } : null;
  };
  const logStars = Math.log10(s.stars + 1);
  const items: (ArchetypeWeight | null)[] = [
    w("architect", 0.4, s.starPerRepo * 0.4 + s.accountAgeYears * 0.05),
    w("midnight-hacker", 0.5, s.nightOwlRatio * 3.2),
    w("maintainer", 0.4, (s.prEvents + s.issueEvents) * 0.08 + s.docShare * 2 + Math.min(2, s.accountAgeYears * 0.2)),
    w("polymath", 0.5, Math.max(0, s.languageEntropy - 1) * 1.6),
    w("oss-soul", 0.35, logStars * 1.4 + Math.log10(s.forks + 1) * 0.8),
    w("perfectionist", 0.35, s.accountAgeYears * 0.1 + s.starPerRepo * 0.5),
    w("velocity", 0.45, Math.min(3, s.eventsLast14d * 0.3) + (s.recentPushDaysAgo !== null && s.recentPushDaysAgo <= 2 ? 0.8 : 0)),
    w("remixer", 0.45, s.forkRatio * 2.6),
    w("gardener", 0.4, s.issueEvents * 0.1 + s.eventRatio * 1.2),
    w("ghost", 0.3, s.eventsCount === 0 ? 2.5 : s.eventsCount < 4 ? 1 : 0),
    w("founder", 0.35, s.starSkew * 1.8 + logStars * 0.9),
    w("scholar", 0.3, s.docShare * 1.8 + (s.gists > 10 ? 0.6 : 0)),
  ];
  return items.filter((x): x is ArchetypeWeight => x !== null);
}

function pickWeighted(rng: ReturnType<typeof createRng>, items: ArchetypeWeight[], excludeId?: string) {
  const pool = items.filter((i) => i.archetype.id !== excludeId);
  const total = pool.reduce((sum, i) => sum + i.weight, 0);
  let roll = rng.next() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item.archetype;
  }
  return pool[pool.length - 1].archetype;
}

/* ---------------------------------- scores --------------------------------- */

function computeScores(s: ProfileStats, rng: ReturnType<typeof createRng>) {
  const logStars = Math.log10(s.stars + 1);
  const logFollowers = Math.log10(s.followers + 1);
  const completeness = (s.hasBio ? 1 : 0) + (s.hasBlog ? 1 : 0) + (s.hasLocation ? 1 : 0) + (s.hasCompany ? 1 : 0) + (s.hireable ? 1 : 0);

  const aura = clamp(
    Math.round(
      16 +
        logStars * 11 +
        logFollowers * 9 +
        Math.min(1, s.accountAgeYears / 8) * 12 +
        (completeness / 5) * 20 +
        Math.min(10, s.starPerRepo) +
        rng.int(-3, 3),
    ),
    4, 99,
  );

  const chaos = clamp(
    Math.round(
      s.nightOwlRatio * 24 +
        (s.peakHour !== null && (s.peakHour >= 23 || s.peakHour <= 5) ? 6 : 0) +
        s.smallReposShare * 14 +
        s.forkRatio * 13 +
        s.spicyShare * 16 +
        s.eventRatio * 9 +
        Math.min(8, s.eventTypes) +
        rng.int(-3, 3),
    ),
    4, 99,
  );

  const activity =
    s.recentPushDaysAgo === null ? 0 : Math.max(0, 24 - s.recentPushDaysAgo * 2.5);
  const contrib =
    s.contributions && s.contributions.total > 0
      ? Math.min(30, Math.log10(s.contributions.total) * 9)
      : 0;
  const streak = s.contributions && s.contributions.longestStreak > 0 ? Math.min(10, Math.log10(s.contributions.longestStreak) * 4) : 0;

  const energy = clamp(
    Math.round(
      activity +
        contrib +
        streak +
        Math.min(14, s.eventsLast14d * 0.9) +
        Math.min(12, Math.log10(s.repoCount + 1) * 7) +
        Math.min(6, Math.log10(s.gists + 1) * 3) +
        rng.int(-3, 3),
    ),
    4, 99,
  );

  const auraTier = tierFor(aura, AURA_TIERS);
  const chaosTier = tierFor(chaos, CHAOS_TIERS);
  const energyTier = tierFor(energy, ENERGY_TIERS);

  const scores: { aura: Score; chaos: Score; energy: Score } = {
    aura: {
      value: aura,
      tier: auraTier.label,
      label: "Aura",
      description: auraTier.description,
    },
    chaos: {
      value: chaos,
      tier: chaosTier.label,
      label: "Chaos",
      description: chaosTier.description,
    },
    energy: {
      value: energy,
      tier: energyTier.label,
      label: "Energy",
      description: energyTier.description,
    },
  };
  return scores;
}

/* ---------------------------------- traits --------------------------------- */

interface TraitDef {
  name: string;
  emoji: string;
  when: (s: ProfileStats) => boolean;
}

const TRAIT_POOL: TraitDef[] = [
  { name: "Night owl", emoji: "🌙", when: (s) => s.nightOwlRatio > 0.25 },
  { name: "Ship-it-fast", emoji: "🚢", when: (s) => (s.recentPushDaysAgo ?? 99) <= 2 || s.eventsLast14d >= 5 },
  { name: "Detail-obsessed", emoji: "🔍", when: (s) => s.docShare > 0.15 || s.prEvents > 3 },
  { name: "Polyglot", emoji: "🗣️", when: (s) => s.languageEntropy > 2 },
  { name: "Issue gardener", emoji: "🌱", when: (s) => s.issueEvents > 3 || s.eventRatio > 0.25 },
  { name: "PR machine", emoji: "🤝", when: (s) => s.prEvents >= 4 },
  { name: "YOLO merger", emoji: "🎲", when: () => true },
  { name: "Reads docs cover to cover", emoji: "📖", when: () => true },
  { name: "Semicolon enforcer", emoji: "🧷", when: () => true },
  { name: "Rebases with rage", emoji: "🔄", when: () => true },
  { name: "Early adopter", emoji: "🧪", when: () => true },
  { name: "Legacy whisperer", emoji: "🏚️", when: (s) => s.accountAgeYears > 8 },
  { name: "Lone wolf", emoji: "🐺", when: (s) => s.eventsCount < 4 && s.forkRatio < 0.2 },
  { name: "Community builder", emoji: "🌐", when: (s) => s.followers >= 50 || s.watchEvents >= 3 },
  { name: "Minimalist", emoji: "🪶", when: (s) => s.smallReposShare > 0.5 },
  { name: "Over-engineer", emoji: "🏗️", when: () => true },
  { name: "Copy-paste artisan", emoji: "📋", when: () => true },
  { name: "Documentarian", emoji: "📝", when: (s) => s.docShare > 0.25 },
  { name: "Data storyteller", emoji: "📊", when: () => true },
  { name: "Systems tinkerer", emoji: "⚙️", when: (s) => s.spicyShare > 0.3 },
  { name: "Frontend wizard", emoji: "✨", when: (s) => s.skills.includes("Frontend") },
  { name: "Backend plumber", emoji: "🔧", when: (s) => s.skills.includes("Backend") },
  { name: "Mobile maven", emoji: "📱", when: (s) => s.skills.includes("Mobile") },
  { name: "Occasionally active", emoji: "😴", when: (s) => s.eventsLast14d < 2 && s.contributions?.total === 0 },
  { name: "All-night cruncher", emoji: "☕", when: (s) => s.nightOwlRatio > 0.4 },
  { name: "Trivia collector", emoji: "🎓", when: (s) => s.gists >= 10 },
  { name: "Open source citizen", emoji: "🌍", when: (s) => s.stars >= 100 || s.forks >= 25 },
  { name: "Perfectionist", emoji: "🧐", when: (s) => s.ownRepos > 0 && s.starPerRepo >= 10 },
  { name: "Velocity hound", emoji: "⚡", when: (s) => s.eventsLast14d >= 8 },
  { name: "The kid who reads ToS", emoji: "🤓", when: () => true },
  { name: "Tab person", emoji: "📑", when: () => true },
  { name: "Micro-optimizer", emoji: "🔬", when: () => true },
  { name: "TDD believer", emoji: "🧪", when: () => true },
  { name: "README romantic", emoji: "💌", when: (s) => s.docShare > 0.3 },
  { name: "Batch-commit king", emoji: "👑", when: (s) => s.pushEvents >= 10 },
];

function pickTraits(s: ProfileStats, rng: ReturnType<typeof createRng>): string[] {
  const matching = TRAIT_POOL.filter((t) => t.when(s));
  // Trait pool already contains always-true traits, but guarantee enough
  // candidates for empty/quiet profiles by appending the full pool.
  const pool = matching.length >= 6 ? matching : [...matching, ...TRAIT_POOL];
  const chosen = rng.picks(pool, 6);
  const unique = [...new Set(chosen.map((t) => `${t.emoji} ${t.name}`))];
  return unique.slice(0, 5);
}

/* ---------------------------------- roasts --------------------------------- */

interface RoastDef {
  when: (s: ProfileStats) => boolean;
  text: (s: ProfileStats) => string;
}

const CONDITIONAL_ROASTS: RoastDef[] = [
  {
    when: (s) => !s.hasBio,
    text: () => "That bio is empty enough to be a private repo. We respect the mystery, but the mystery is not paying off.",
  },
  {
    when: (s) => s.ownRepos > 0 && s.stars === 0,
    text: (s) => `${pluralize(s.ownRepos, "repo")} and a combined total of 0 stars. Your code is a secret — and apparently staying one.`,
  },
  {
    when: (s) => s.repoCount === 0,
    text: () => "Zero public repos. Bold strategy. The personality analysis was, however, still 100% complete.",
  },
  {
    when: (s) => s.accountAgeYears > 10 && s.eventsLast14d < 2,
    text: (s) => `Account born over ${Math.floor(s.accountAgeYears)} years ago, last meaningful action around the Obama era. Vintage energy.`,
  },
  {
    when: (s) => s.forkRatio > 0.5,
    text: () => "Over half the repos are forks. Not a criticism — everyone needs a good starting template.",
  },
  {
    when: (s) => s.nightOwlRatio > 0.4,
    text: () => "Mostly committing between midnight and 6 AM. Your circadian rhythm has filed a bug report against you.",
  },
  {
    when: (s) => s.smallReposShare > 0.7 && s.ownRepos > 2,
    text: () => "Every repo is under 100KB. That's not a codebase, that's a text message with stars.",
  },
  {
    when: (s) => s.contributions !== null && s.contributions.total === 0,
    text: () => "Zero contributions this year. GitHub's green squares send their regards — and a care package.",
  },
  {
    when: (s) => s.followers <= 1,
    text: () => "A single follower, and it's probably being polite. Even the bot is just being nice.",
  },
];

const GENERIC_ROASTS: string[] = [
  "Their commit messages read like ransom notes: 'fix', 'stuff', 'please work'.",
  "They refactor constantly and still have a folder called 'final_v2_FINAL'.",
  "Their code reviews are 90% emoji and 10% 'lgtm'.",
  "They'll spend four hours automating a 30-second task, and call it productivity.",
  "The README says 'work in progress'. It has said that for years.",
  "They learned everything from Stack Overflow and are proud of it.",
  "Their TODOs outnumber their features.",
  "They name variables like 'data2', 'temp3', and 'actuallyFinalThisTime'.",
  "100% of their deploys go to prod. 0% are tested. Chaos is a lifestyle.",
  "Their most-used library is 'copy-paste'.",
  "They describe themselves as 'self-taught' in the way people describe weather they caused.",
  "Their git history is 60% 'wip' and 40% 'oops'.",
];

function pickRoasts(s: ProfileStats, rng: ReturnType<typeof createRng>): string[] {
  const matched = CONDITIONAL_ROASTS.filter((r) => r.when(s)).map((r) => r.text(s));
  const picks: string[] = [];
  const chosenConditional = rng.picks(matched, 2);
  picks.push(...chosenConditional);
  const generic = rng.picks(GENERIC_ROASTS, 3 - picks.length + 1);
  for (const g of generic) {
    if (picks.length >= 3) break;
    if (!picks.includes(g)) picks.push(g);
  }
  return picks.slice(0, 3);
}

/* --------------------------------- fun facts -------------------------------- */

function funFactCandidates(s: ProfileStats): string[] {
  const facts: string[] = [];
  if (s.peakHour !== null) {
    const h = s.peakHour;
    const display = `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "AM" : "PM"}`;
    facts.push(
      s.nightOwlRatio > 0.3
        ? `Their most active hour is ${display} — the code gremlins come out when the world is asleep.`
        : `Their most active hour is ${display} — suspiciously responsible hours for a developer.`,
    );
  }
  if (s.contributions && s.contributions.total > 0) {
    facts.push(`Logged ${pluralize(s.contributions.total, "contribution")} over the last year.`);
    if (s.contributions.longestStreak >= 7) {
      facts.push(
        s.contributions.longestStreak >= 30
          ? `Longest streak: ${s.contributions.longestStreak} days. Are they okay?`
          : `Longest streak of ${pluralize(s.contributions.longestStreak, "day")}. Respect.`,
      );
    }
  }
  if (s.accountAgeYears > 0) {
    const perYear = s.repoCount / s.accountAgeYears;
    facts.push(
      `${Math.round(s.accountAgeYears)} year${s.accountAgeYears >= 2 ? "s" : ""} on GitHub, ${s.repoCount} public repos — ${perYear.toFixed(1)} repo${perYear === 1 ? "" : "s"} per year. ${perYear < 0.5 ? "A slow, deliberate pace." : perYear > 5 ? "An industrial output." : "A healthy cadence."}`,
    );
  }
  if (s.languages.length > 0) {
    facts.push(`Primary language: ${s.languages[0].name}. They really commit to it.`);
  }
  if (s.starPerRepo > 0) {
    facts.push(`Average of ${s.starPerRepo.toFixed(1)} star${s.starPerRepo === 1 ? "" : "s"} per repo — ${s.starPerRepo > 5 ? "basically a celebrity." : "the grind continues."}`);
  }
  if (s.gists > 5) {
    facts.push(`Keeps ${pluralize(s.gists, "gist")} — the developer equivalent of a junk drawer, but curated.`);
  }
  if (facts.length === 0) {
    facts.push("The GitHub data is unusually quiet — a blank canvas of untold potential.");
  }
  return facts;
}

/* ------------------------------- recruiter --------------------------------- */

function recruitingReport(s: ProfileStats, rng: ReturnType<typeof createRng>): RecruiterReport {
  const notes: string[] = [];
  const shipState =
    s.eventsLast14d >= 5
      ? `Shipping ${pluralize(s.eventsLast14d, "event")} in the last 14 days — clearly not hibernating.`
      : s.recentPushDaysAgo !== null
        ? `Last push ${pluralize(s.recentPushDaysAgo, "day")} ago — active, if a little coy.`
        : "No recent public pushes — may be deep in a private monorepo.";
  notes.push(shipState);

  if (s.languages.length > 0) {
    const top = s.languages[0];
    notes.push(`Primary stack: ${top.name} across ${pluralize(top.count, "repo")}.${s.languages[1] ? ` Also spotted: ${s.languages.slice(1, 4).map((l) => l.name).join(", ")}.` : ""}`);
  } else {
    notes.push("No dominant language detected — a mystery candidate, or a polyglot with stage fright.");
  }

  if (s.stars > 0 || s.forks > 0) {
    notes.push(`Code footprint: ${pluralize(s.stars, "star")} and ${pluralize(s.forks, "fork")} collected in the wild.`);
  } else {
    notes.push("Code footprint: currently being written. Every legend starts with an empty repo.");
  }

  if (s.contributions) {
    notes.push(
      s.contributions.total > 0
        ? `Consistency check: ${pluralize(s.contributions.total, "contribution")} this year with a ${s.contributions.longestStreak}-day best streak.`
        : "Consistency check: the contribution graph is reading as a solid grey void.",
    );
  }

  if (s.followers > 0) notes.push(`Community signal: ${pluralize(s.followers, "follower")} paying attention.`);

  const activity = s.eventsLast14d >= 5 ? 24 : s.recentPushDaysAgo !== null && s.recentPushDaysAgo <= 14 ? 14 : 4;
  const popularity = Math.min(20, Math.log10(s.stars + 1) * 5 + Math.log10(s.followers + 1) * 4);
  const consistency = s.contributions && s.contributions.total > 0 ? Math.min(18, Math.log10(s.contributions.total) * 5 + Math.min(6, s.contributions.longestStreak / 6)) : 3;
  const versatility = Math.min(15, s.languageEntropy * 3.5);
  const completeness = s.profileScore / 7;
  const shipping = Math.min(12, s.pushEvents * 1.2);
  const hireScore = clamp(Math.round(activity + popularity + consistency + versatility + completeness + shipping + rng.int(-2, 2)), 3, 99);

  const verdicts: [number, string, string][] = [
    [82, "Hire immediately", "Update the offer letter before someone else does."],
    [66, "Strong candidate", "Interviews would be a formality, and a fun one."],
    [50, "Worth a chat", "The resume says maybe; the GitHub says interesting."],
    [34, "Proceed with curiosity", "Potential detected. Timing is the question."],
    [0, "Maybe just friends", "Great energy, questionable hire-ability. Stay in touch."],
  ];
  const verdict = tierFor(hireScore, verdicts);

  return {
    notes,
    verdict: verdict.label,
    verdictNote: verdict.description,
    hireScore,
  };
}

/* ------------------------------- power level ------------------------------- */

const POWER_TIERS: [number, string][] = [
  [85, "Legendary Maintainer"],
  [70, "Code Overlord"],
  [55, "Git Sorcerer"],
  [40, "Script Kiddie +"],
  [20, "Aspiring Enthusiast"],
  [0, "Napping Developer"],
];

/* --------------------------------- analyze --------------------------------- */

export function analyze(raw: RawProfile): { stats: ProfileStats; personality: Personality } {
  const stats = computeStats(raw);
  const rng = createRng(profileSeed(raw.user?.login ?? "anonymous"));

  const weights = archetypeWeights(stats);
  const primary = pickWeighted(rng, weights);
  const secondary = pickWeighted(rng, weights, primary.id);

  const scores = computeScores(stats, rng);
  const traits = pickTraits(stats, rng);
  const roasts = pickRoasts(stats, rng);
  const funFacts = rng.picks(funFactCandidates(stats), 2);
  const recruiting = recruitingReport(stats, rng);

  const powerRaw = Math.round(
    scores.aura.value * 0.38 + scores.energy.value * 0.28 + recruiting.hireScore * 0.22 + scores.chaos.value * 0.12,
  );
  const power = clamp(powerRaw, 1, 100);
  const powerTitle = POWER_TIERS.find(([min]) => power >= min)?.[1] ?? POWER_TIERS[POWER_TIERS.length - 1][1];

  const personality: Personality = {
    archetype: primary,
    secondary,
    scores,
    traits,
    recruiting,
    roasts,
    funFact: funFacts.join(" "),
    powerLevel: { level: power, title: powerTitle },
  };

  return { stats, personality };
}
