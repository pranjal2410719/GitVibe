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

function eventMeta(e: GitHubEvent): { icon: React.ReactNode; text: string; tint: string } {
  const repoName = e.repo.name.split("/")[1] ?? e.repo.name;
  switch (e.type) {
    case "PushEvent":
      return { icon: <GitCommit className="h-4 w-4" />, text: `Pushed to ${repoName}`, tint: "text-energy-300 bg-energy-500/10 border-energy-400/20" };
    case "PullRequestEvent":
      return { icon: <GitPullRequest className="h-4 w-4" />, text: `Opened/updated a PR in ${repoName}`, tint: "text-aura-300 bg-aura-500/10 border-aura-400/20" };
    case "IssuesEvent":
      return { icon: <CircleDot className="h-4 w-4" />, text: `Did issue things in ${repoName}`, tint: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20" };
    case "IssueCommentEvent":
      return { icon: <MessageSquare className="h-4 w-4" />, text: `Commented on an issue in ${repoName}`, tint: "text-sky-300 bg-sky-500/10 border-sky-400/20" };
    case "WatchEvent":
      return { icon: <Star className="h-4 w-4" />, text: `Starred ${repoName}`, tint: "text-amber-300 bg-amber-500/10 border-amber-400/20" };
    case "ForkEvent":
      return { icon: <GitFork className="h-4 w-4" />, text: `Forked ${repoName}`, tint: "text-rose-300 bg-rose-500/10 border-rose-400/20" };
    case "CreateEvent":
      return { icon: <FolderPlus className="h-4 w-4" />, text: `Created something in ${repoName}`, tint: "text-cyan-300 bg-cyan-500/10 border-cyan-400/20" };
    case "ReleaseEvent":
      return { icon: <Rocket className="h-4 w-4" />, text: `Released in ${repoName}`, tint: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-400/20" };
    case "GollumEvent":
      return { icon: <FileText className="h-4 w-4" />, text: `Updated the wiki of ${repoName}`, tint: "text-lime-300 bg-lime-500/10 border-lime-400/20" };
    default:
      return { icon: <Activity className="h-4 w-4" />, text: `Did something in ${repoName}`, tint: "text-white/60 bg-white/5 border-white/10" };
  }
}

export default function ActivitySection({ events, stats }: { events: GitHubEvent[]; stats: ProfileStats }) {
  const recent = events.slice(0, 7);

  return (
    <Section emoji="📡" title="Recent activity" subtitle="Public events, freshly scraped from the timeline">
      {recent.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
          No recent public activity. The account is either resting or plotting.
        </p>
      ) : (
        <ul className="space-y-1">
          {recent.map((e) => {
            const meta = eventMeta(e);
            return (
              <li key={e.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
                  {meta.icon}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-white/75">{meta.text}</span>
                <span className="shrink-0 text-xs text-white/35">{timeAgo(e.created_at)}</span>
              </li>
            );
          })}
        </ul>
      )}

      {stats.peakHour !== null ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
            {stats.nightOwlRatio > 0.3 ? <Moon className="h-5 w-5 text-amber-300" /> : <Sun className="h-5 w-5 text-amber-300" />}
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              {stats.nightOwlRatio > 0.3 ? "Certified night owl" : "Suspiciously diurnal"}
            </p>
            <p className="text-xs text-white/45">
              Peak activity around {stats.peakHour % 12 === 0 ? 12 : stats.peakHour % 12}:00 {stats.peakHour < 12 ? "AM" : "PM"} ·{" "}
              {Math.round(stats.nightOwlRatio * 100)}% of activity happens after dark
              {stats.nightOwlRatio > 0.3 ? ". The monitor glow is doing the heavy lifting." : ". Very responsible."}
            </p>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
