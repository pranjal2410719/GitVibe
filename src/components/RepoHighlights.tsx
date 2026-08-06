"use client";

import { ArrowUpRight, Archive, GitFork, Star } from "lucide-react";
import { languageColor } from "@/lib/language-colors";
import { formatFullNumber, timeAgo } from "@/lib/format";
import type { GitHubRepo } from "@/lib/types";
import { Section } from "./ui";

function RepoRow({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate font-display text-[15px] font-semibold text-white">
            {repo.name}
            {repo.archived ? (
              <Archive className="h-3.5 w-3.5 shrink-0 text-white/30" aria-label="archived" />
            ) : null}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-white/40">
            {repo.description ?? "No description — pure vibes."}
          </p>
        </div>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-aura-300" />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
        {repo.language ? (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
            {repo.language}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-400/70" /> {formatFullNumber(repo.stargazers_count)}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="h-3.5 w-3.5 text-white/40" /> {formatFullNumber(repo.forks_count)}
        </span>
        <span className="ml-auto hidden sm:inline">{timeAgo(repo.pushed_at)}</span>
      </div>
    </a>
  );
}

export default function RepoHighlights({ repos, total }: { repos: GitHubRepo[]; total: number }) {
  const top = [...repos].filter((r) => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 4);

  if (top.length === 0) {
    return (
      <Section emoji="🗂️" title="Repo highlights" subtitle="The crown jewels of the public portfolio">
        <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
          No public repos yet. The vault is empty, but the potential is vaulted.
        </p>
      </Section>
    );
  }

  return (
    <Section
      emoji="🗂️"
      title="Repo highlights"
      subtitle={total > top.length ? `Top ${top.length} of ${total} public repos by stars` : `Top ${top.length} public repos`}
    >
      <div className="space-y-2.5">
        {top.map((r) => (
          <RepoRow key={r.id} repo={r} />
        ))}
      </div>
    </Section>
  );
}
