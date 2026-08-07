"use client";

import {
  ArrowUpRight,
  Building2,
  Calendar,
  Link2,
  MapPin,
} from "lucide-react";
import { XIcon } from "./icons";
import { formatDate, formatFullNumber, timeAgo } from "@/lib/format";
import type { ProfileResult } from "@/lib/types";
import ShareButtons from "./ShareButtons";

export default function ProfileHeader({
  result,
  onShare,
}: {
  result: ProfileResult;
  onShare: () => void;
}) {
  const { raw, stats } = result;
  const user = raw.user;
  if (!user) return null;

  const metaBadges = [
    user.location ? { icon: MapPin, text: user.location } : null,
    user.company ? { icon: Building2, text: user.company } : null,
    user.twitter_username ? { icon: XIcon, text: `@${user.twitter_username}` } : null,
    user.blog ? { icon: Link2, text: user.blog } : null,
  ].filter((b): b is { icon: typeof MapPin; text: string } => b !== null);

  return (
    <section className="card animate-fade-up overflow-hidden p-0">
      <div className="h-24 bg-[radial-gradient(120%_160%_at_10%_0%,rgb(139_92_246/0.45)_0%,rgb(244_63_94/0.22)_45%,rgb(6_212_250/0.18)_100%)] sm:h-28" />
      <div className="relative px-5 pb-6 sm:px-7">
        <div className="-mt-12 flex flex-wrap items-end gap-4 sm:-mt-14">
        {/* eslint-disable-next-line @next/next/no-img-element -- external avatar URL, avoids next/image remote config */}
        <img
          src={user.avatar_url}
            alt={`${user.login}'s avatar`}
            width={112}
            height={112}
            className="h-24 w-24 rounded-full border-4 border-ink-900 object-cover shadow-2xl sm:h-28 sm:w-28"
          />
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {user.name ?? user.login}
              </h1>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-white/45 transition-colors hover:text-aura-300"
              >
                @{user.login}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="mt-0.5 text-sm text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> on GitHub since {formatDate(user.created_at)}
              </span>
              <span className="mx-2 text-white/20">·</span>
              last active {timeAgo(user.updated_at)}
            </p>
          </div>
          <div className="mb-1">
            <ShareButtons username={user.login} onCopy={onShare} />
          </div>
        </div>

        {user.bio ? (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/75">{user.bio}</p>
        ) : (
          <p className="mt-4 max-w-2xl text-sm italic text-white/35">
            No bio — the mystery is part of the brand.
          </p>
        )}

        {metaBadges.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {metaBadges.map((b, i) => (
              <span
                key={i}
                className="flex max-w-[220px] items-center gap-1.5 truncate text-sm text-white/55"
              >
                <b.icon className="h-3.5 w-3.5 shrink-0 text-white/35" />
                <span className="truncate">{b.text}</span>
              </span>
            ))}
          </div>
        ) : null}

        {user.hireable ? (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Open to work
          </span>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-5 sm:grid-cols-4">
          <div>
            <p className="font-display text-xl font-bold text-white">{formatFullNumber(stats.followers)}</p>
            <p className="text-[11px] uppercase tracking-wider text-white/40">Followers</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">{formatFullNumber(stats.following)}</p>
            <p className="text-[11px] uppercase tracking-wider text-white/40">Following</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-aura-300">{formatFullNumber(stats.repoCount)}</p>
            <p className="text-[11px] uppercase tracking-wider text-white/40">Public repos</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-amber-300">★ {formatFullNumber(stats.stars)}</p>
            <p className="text-[11px] uppercase tracking-wider text-white/40">Stars earned</p>
          </div>
        </div>
      </div>
    </section>
  );
}
