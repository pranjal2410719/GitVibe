"use client";

import {
  Activity,
  CircleDot,
  FileText,
  FolderPlus,
  GitCommit,
  GitFork,
  GitPullRequest,
  MessageSquare,
  Moon,
  Rocket,
  Star,
  Sun,
} from "lucide-react";
import { timeAgo } from "@/lib/format";
import type { GitHubEvent, ProfileStats } from "@/lib/types";
import { Section } from "./ui";

function eventMeta(e: GitHubEvent): { icon: React.ReactNode; tint: string } {
  switch (e.type) {
    case "PushEvent":
      return { icon: <GitCommit className="h-4 w-4" />, tint: "text-energy-300 bg-energy-500/10 border-energy-400/20" };
    case "PullRequestEvent":
      return { icon: <GitPullRequest className="h-4 w-4" />, tint: "text-aura-300 bg-aura-500/10 border-aura-400/20" };
    case "IssuesEvent":
      return { icon: <CircleDot className="h-4 w-4" />, tint: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20" };
    case "IssueCommentEvent":
      return { icon: <MessageSquare className="h-4 w-4" />, tint: "text-sky-300 bg-sky-500/10 border-sky-400/20" };
    case "WatchEvent":
      return { icon: <Star className="h-4 w-4" />, tint: "text-amber-300 bg-amber-500/10 border-amber-400/20" };
    case "ForkEvent":
      return { icon: <GitFork className="h-4 w-4" />, tint: "text-rose-300 bg-rose-500/10 border-rose-400/20" };
    case "CreateEvent":
      return { icon: <FolderPlus className="h-4 w-4" />, tint: "text-cyan-300 bg-cyan-500/10 border-cyan-400/20" };
    case "ReleaseEvent":
      return { icon: <Rocket className="h-4 w-4" />, tint: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-400/20" };
    case "GollumEvent":
      return { icon: <FileText className="h-4 w-4" />, tint: "text-lime-300 bg-lime-500/10 border-lime-400/20" };
    default:
      return { icon: <Activity className="h-4 w-4" />, tint: "text-white/60 bg-white/5 border-white/10" };
  }
}

/** Title + optional description for the timeline rows, derived from the event. */
function eventInfo(g: EventGroup): { title: string; description?: string } {
  const repo = g.repo.split("/")[1] ?? g.repo;
  switch (g.type) {
    case "PushEvent": {
      const branch = (g.last.payload as { ref?: string })?.ref?.replace("refs/heads/", "");
      const commits = g.pushSize;
      return {
        title: commits > 1 ? `Pushed ${commits} commits to ${repo}` : `Pushed to ${repo}`,
        description: branch ? `on ${branch}` : undefined,
      };
    }
    case "WatchEvent":
      return { title: `Starred ${repo}` };
    case "ForkEvent":
      return { title: `Forked ${repo}` };
    case "PullRequestEvent":
      return { title: `PR activity in ${repo}` };
    case "IssuesEvent":
      return { title: `Issue activity in ${repo}` };
    case "IssueCommentEvent":
      return { title: `Commented in ${repo}` };
    case "CreateEvent":
      return { title: `Created something in ${repo}` };
    case "ReleaseEvent":
      return { title: `Released in ${repo}` };
    case "GollumEvent":
      return { title: `Updated the wiki of ${repo}` };
    default:
      return { title: `Activity in ${repo}` };
  }
}

interface EventGroup {
  type: string;
  repo: string;
  count: number;
  last: GitHubEvent;
  pushSize: number;
}

/**
 * Collapse consecutive identical events (same type + repo) into one row so a
 * burst of pushes doesn't flood the feed — "Pushed to X" × 6 becomes one line.
 * Push groups also sum their commit counts for a richer "Pushed N commits" line.
 */
function groupEvents(events: GitHubEvent[]): EventGroup[] {
  const groups: EventGroup[] = [];
  for (const e of events) {
    const key = e.repo.name;
    const prev = groups[groups.length - 1];
    if (prev && prev.type === e.type && prev.repo === key) {
      prev.count += 1;
      prev.last = e;
      if (e.type === "PushEvent") {
        prev.pushSize += (e.payload as { size?: number })?.size ?? 0;
      }
    } else {
      const pushSize =
        e.type === "PushEvent" ? ((e.payload as { size?: number })?.size ?? 0) : 0;
      groups.push({ type: e.type, repo: key, count: 1, last: e, pushSize });
    }
  }
  return groups.slice(0, 7);
}

function formatHour(h: number): string {
  return `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "AM" : "PM"}`;
}

export default function ActivitySection({ events, stats }: { events: GitHubEvent[]; stats: ProfileStats }) {
  const groups = groupEvents(events);

  return (
    <Section emoji="📡" title="Recent activity" subtitle="Public events, freshly scraped from the timeline">
      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
          No recent public activity. The account is either resting or plotting.
        </p>
      ) : (
        <ul className="relative">
          {/* vertical connector line (shadcn-style TimelineSeparator) */}
          <span
            className="absolute bottom-3 left-3 top-3 w-px bg-gradient-to-b from-white/15 via-white/10 to-transparent"
            aria-hidden
          />
          {groups.map((g, i) => {
            const meta = eventMeta(g.last);
            const { title, description } = eventInfo(g);
            return (
              <li key={`${g.last.id}-${i}`} className="relative flex items-start gap-3 pb-5 last:pb-0">
                {/* timeline indicator dot on the line */}
                <span
                  className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-ink-900 ${meta.tint}`}
                >
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white/90">{title}</p>
                    {g.count > 1 ? (
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50">
                        ×{g.count}
                      </span>
                    ) : null}
                  </div>
                  {description ? (
                    <p className="mt-0.5 text-[13px] leading-snug text-white/50">{description}</p>
                  ) : null}
                  <p className="mt-1 text-xs tabular-nums text-white/35">{timeAgo(g.last.created_at)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {stats.peakHour !== null ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
          <div className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
              {stats.nightOwlRatio > 0.3 ? (
                <Moon className="h-5 w-5 text-amber-300" />
              ) : (
                <Sun className="h-5 w-5 text-amber-300" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">
                {stats.nightOwlRatio > 0.3 ? "Certified night owl" : "Suspiciously diurnal"}
              </p>
              <p className="text-xs text-white/45">Peak activity around {formatHour(stats.peakHour)}</p>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/60">
              {Math.round(stats.nightOwlRatio * 100)}% after dark
            </span>
          </div>

          {/* day vs night activity split */}
          <div className="px-4 pb-4">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-l-full bg-gradient-to-r from-amber-300/90 to-orange-400/90"
                style={{ width: `${(1 - stats.nightOwlRatio) * 100}%` }}
              />
              <div
                className="h-full rounded-r-full bg-gradient-to-r from-indigo-500/90 to-violet-500/90"
                style={{ width: `${stats.nightOwlRatio * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-white/35">
              <span className="flex items-center gap-1">
                <Sun className="h-3 w-3" /> Day {Math.round((1 - stats.nightOwlRatio) * 100)}%
              </span>
              <span className="flex items-center gap-1">
                {Math.round(stats.nightOwlRatio * 100)}% <Moon className="h-3 w-3" /> After dark
              </span>
            </div>
            <p className="mt-2 text-[11px] italic text-white/40">
              {stats.nightOwlRatio > 0.3
                ? "The monitor glow is doing the heavy lifting."
                : "Very responsible."}
            </p>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
