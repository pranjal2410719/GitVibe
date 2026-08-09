"use client";

import type { ProfileResult } from "@/lib/types";
import { Reveal } from "./ui";
import ProfileHeader from "./ProfileHeader";
import ScoreCards from "./ScoreCards";
import ArchetypeCard from "./ArchetypeCard";
import RepoHighlights from "./RepoHighlights";
import LanguageChart from "./LanguageChart";
import ContributionHeatmap from "./ContributionHeatmap";
import ActivitySection from "./ActivitySection";
import RecruiterSection from "./RecruiterSection";
import RoastSection from "./RoastSection";
import IdentityCard from "./IdentityCard";

export default function ProfileSections({
  result,
  onShare,
  titleAs = "h1",
}: {
  result: ProfileResult;
  onShare: () => void;
  titleAs?: "h1" | "h2";
}) {
  const { raw, stats, personality } = result;

  return (
    <div className="w-full space-y-5">
      <ProfileHeader result={result} onShare={onShare} titleAs={titleAs} />

      <ScoreCards scores={personality.scores} stats={stats} />

      <Reveal delay={60}>
        <ArchetypeCard personality={personality} />
      </Reveal>

      <Reveal delay={60}>
        {/* min-w-0 on grid items lets cards with scrollable/truncated content (heatmap,
            repo rows) shrink to the column instead of stretching the page on mobile */}
        <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
          <RepoHighlights repos={raw.repos} total={stats.repoCount} />
          <LanguageChart stats={stats} />
        </div>
      </Reveal>

      {raw.contributions?.contributions?.length ? (
        <Reveal delay={60}>
          {/* The calendar is the widest element on the page — give it the full
              card width so the month labels and cells aren't cramped into a
              half column on desktop. Activity stacks below it. */}
          <div className="space-y-5">
            <ContributionHeatmap
              days={raw.contributions.contributions}
              streak={stats.contributions!}
            />
            <ActivitySection events={raw.events} stats={stats} />
          </div>
        </Reveal>
      ) : (
        <Reveal delay={60}>
          <ActivitySection events={raw.events} stats={stats} />
        </Reveal>
      )}

      <RecruiterSection report={personality.recruiting} />
      <RoastSection roasts={personality.roasts} />

      <Reveal>
        <div className="card p-5 sm:p-6">
          <p className="flex items-start gap-3 text-[15px] leading-relaxed text-white/75">
            <span className="text-2xl" aria-hidden>✨</span>
            <span>
              <span className="font-display font-semibold text-white">Fun fact: </span>
              {personality.funFact}
            </span>
          </p>
        </div>
      </Reveal>

      <IdentityCard result={result} />

      {result.meta.partial ? (
        <p className="text-center text-xs text-white/30">
          Contribution data was unavailable, so that section was skipped. Everything else is freshly squeezed.
        </p>
      ) : null}
    </div>
  );
}
