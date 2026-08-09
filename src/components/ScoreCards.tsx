"use client";

import { Flower2, Tornado, TrendingUp, Zap } from "lucide-react";
import type { ProfileStats, Score } from "@/lib/types";
import { Reveal } from "./ui";

/* Shadcn-style card primitives, adapted to the site's dark theme tokens.
   Card = rounded-xl border + solid surface + shadow; content is a flexible
   column of header / hero / badge / separator / footnote. */

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div style={style} className={`rounded-xl border border-white/10 bg-ink-850 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex h-full flex-col gap-5 p-6 ${className}`}>{children}</div>;
}

function Badge({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Separator() {
  return <div className="h-px w-full bg-white/10" aria-hidden />;
}

/** One-line, profile-specific "how to boost this" hint for a metric. */
function boostSuggestion(metric: "aura" | "chaos" | "energy", stats: ProfileStats): string {
  const {
    followers,
    hasBio,
    hasBlog,
    hasLocation,
    starSkew,
    topRepo,
    stars,
    repoCount,
    spicyShare,
    pushEvents,
    forkRatio,
    eventsLast14d,
    recentPushDaysAgo,
    contributions,
  } = stats;

  if (metric === "aura") {
    if (!hasBio) return "Add a bio — it's the single fastest Aura win.";
    if (!hasBlog && !hasLocation) return "Link a site and add a location — complete profiles earn more Aura.";
    if (followers < 20) return `Engage more — ${followers} followers leaves your Aura under-credited.`;
    if (starSkew > 0.75 && topRepo) return `Diversify — ${topRepo.name} holds most of your ${stars} stars; spread the love.`;
    return "Keep polishing and sharing — visibility is the Aura multiplier.";
  }

  if (metric === "chaos") {
    if (spicyShare < 0.2 && repoCount > 0) return "Add a spicy-language repo (Rust, Go, Zig) for instant Chaos.";
    if (pushEvents === 0) return "Push straight to main more often — raw pushes are pure Chaos.";
    if (repoCount < 3) return "Scatter more small experiments — repo sprawl is the Chaos signature.";
    if (forkRatio < 0.15) return "Fork something and make it yours — forks add instant Chaos.";
    return "Skip the PR review once in a while — Chaos thanks you.";
  }

  const cs = contributions?.currentStreak ?? 0;
  const total = contributions?.total ?? 0;
  if (cs > 0) return `Keep your ${cs}-day streak alive — consistency is the Energy engine.`;
  if (total > 0) return "Your streak just reset — one commit today restarts the meter.";
  if (recentPushDaysAgo != null && recentPushDaysAgo >= 3) return `No push in ${recentPushDaysAgo} days — a fresh commit recharges Energy.`;
  if (eventsLast14d < 3) return "Ramp up activity — PRs and issues in the last two weeks feed Energy.";
  return "Small daily commits beat one giant push — steady wins.";
}

function RadialGauge({
  value,
  color,
  glow,
}: {
  value: number;
  color: string;
  glow: string;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);

  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="animate-[pop_0.8s_cubic-bezier(0.34,1.56,0.64,1)_both]"
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold tabular-nums text-white">{value}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/40">/ 100</span>
      </div>
    </div>
  );
}

export default function ScoreCards({
  scores,
  stats,
}: {
  scores: { aura: Score; chaos: Score; energy: Score };
  stats: ProfileStats;
}) {
  const gauges = [
    {
      key: "aura" as const,
      color: "#a78bfa",
      glow: "rgb(139 92 246 / 0.8)",
      icon: <Flower2 className="h-4 w-4 text-aura-300" />,
      tips: [
        "Polish your profile — bio, blog, location, company all count toward Aura",
        "Write clear READMEs; star-worthy repos attract stars",
        "Share your work publicly to grow followers",
        "Answer mentions and build a network",
      ],
    },
    {
      key: "chaos" as const,
      color: "#fb7185",
      glow: "rgb(244 63 94 / 0.8)",
      icon: <Tornado className="h-4 w-4 text-chaos-300" />,
      tips: [
        "Ship more — more repos, more pushes, fewer delays",
        "Go spicy: Rust, Go, Zig and friends bump the Chaos",
        "Fork projects and contribute to random repos",
        "Rush a commit straight to main once in a while",
      ],
    },
    {
      key: "energy" as const,
      color: "#22d3ee",
      glow: "rgb(6 182 212 / 0.8)",
      icon: <Zap className="h-4 w-4 text-energy-300" />,
      tips: [
        "Commit daily — streaks are the engine behind Energy",
        "Keep repos fresh; idle projects drain the meter",
        "Stay active: PRs, issues, and releases add fuel",
        "Small frequent commits beat one giant push",
      ],
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {gauges.map((g, i) => {
        const s = scores[g.key];
        return (
          <Reveal key={g.key} delay={i * 80} className="h-full">
            {/* Flip card: front = score card, back = how to level up. Both faces
                live in the same grid cell (grid-area 1/1), so they always share
                the exact same height and all three cards line up. */}
            <div className="group h-full [perspective:1400px]" tabIndex={0}>
              <div className="grid h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
                {/* ---------------- FRONT ---------------- */}
                <div className="[grid-area:1/1] [backface-visibility:hidden]">
                  <Card className="h-full">
                    <CardContent>
                      {/* header: muted title + icon action */}
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium tracking-tight text-white/50">{s.label}</h3>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                          {g.icon}
                        </span>
                      </div>

                      {/* hero: circular gauge */}
                      <div className="flex justify-center py-1">
                        <RadialGauge value={s.value} color={g.color} glow={g.glow} />
                      </div>

                      {/* tier badge */}
                      <div className="flex justify-center">
                        <Badge style={{ color: g.color, backgroundColor: `${g.color}1f`, borderColor: `${g.color}40` }}>
                          {s.tier}
                        </Badge>
                      </div>

                      {/* profile-specific boost hint */}
                      <p className="flex items-start gap-1.5 text-xs leading-snug text-white/70">
                        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: g.color }} />
                        <span>{boostSuggestion(g.key, stats)}</span>
                      </p>

                      <Separator />

                      {/* footnote */}
                      <p className="mt-auto text-center text-xs leading-relaxed text-white/45">{s.description}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* ---------------- BACK ---------------- */}
                <div className="[grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <Card className="h-full" style={{ borderColor: `${g.color}4d`, boxShadow: `0 0 40px -18px ${g.color}` }}>
                    <CardContent>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium tracking-tight text-white/50">How to level up</h3>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                          <TrendingUp className="h-4 w-4" style={{ color: g.color }} />
                        </span>
                      </div>

                      <h4 className="font-display text-xl font-bold tracking-tight text-white">
                        Boost your <span style={{ color: g.color }}>{s.label}</span>
                      </h4>

                      <ul className="flex flex-1 flex-col justify-center gap-3">
                        {g.tips.map((tip) => (
                          <li key={tip} className="flex items-start gap-2.5 text-xs leading-relaxed text-white/70">
                            <span
                              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: g.color, boxShadow: `0 0 6px ${g.color}` }}
                              aria-hidden
                            />
                            {tip}
                          </li>
                        ))}
                      </ul>

                      <Separator />

                      <p className="text-center text-[11px] text-white/35">Hover to flip back to your score</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
