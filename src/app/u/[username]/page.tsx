import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Star } from "lucide-react";
import Background from "@/components/Background";
import GitVibeApp from "@/components/GitVibeApp";
import { fetchProfile, GitHubError, hasMeaningfulData } from "@/lib/github";
import { POPULAR_USERS } from "@/lib/popular-users";
import { formatFullNumber } from "@/lib/format";
import { languageColor } from "@/lib/language-colors";
import type { ProfileResult } from "@/lib/types";

// ISR: curated profiles prerender at build; any other username is generated on
// demand and cached at the edge for an hour. Crawlers get cached HTML instead
// of a fresh GitHub round-trip per hit.
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return POPULAR_USERS.map((username) => ({ username }));
}

function describe(result: ProfileResult): string {
  const { stats, personality } = result;
  const aura = personality.scores.aura.value;
  const top = stats.languages
    .slice(0, 3)
    .map((l) => `${l.name} ${Math.round(l.share * 100)}%`)
    .join(", ");
  const parts = [
    `${personality.archetype.title} archetype with a ${aura}/100 aura.`,
    stats.repoCount > 0
      ? `${stats.repoCount} public repos, ${formatFullNumber(stats.stars)} stars, ${formatFullNumber(stats.followers)} followers.`
      : "",
    top ? `Top languages: ${top}.` : "",
    "Analyze any GitHub developer's personality on GitVibe.",
  ].filter(Boolean);
  return parts.join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  try {
    const result = await fetchProfile(username);
    const user = result.raw.user;
    const name = user?.name ?? result.username;
    const title = `${name} (@${result.username}) GitHub Aura — ${result.personality.archetype.title}`;
    const description = describe(result);
    const meaningful = hasMeaningfulData(result);
    const ogImage = `/api/og?u=${encodeURIComponent(result.username)}`;

    return {
      title,
      description,
      alternates: { canonical: `/u/${result.username}` },
      robots: meaningful ? { index: true, follow: true } : { index: false, follow: false },
      openGraph: {
        title,
        description,
        type: "profile",
        url: `/u/${result.username}`,
        images: [{ url: ogImage, width: 1200, height: 630, alt: `${name}'s GitVibe aura card` }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
        creator: user?.twitter_username ? `@${user.twitter_username}` : undefined,
      },
    };
  } catch (err) {
    // A transient outage (rate limit / network) must not noindex a real
    // profile — emit a generic but indexable page until the cache recovers.
    if (err instanceof GitHubError && (err.status === 403 || err.status === 429 || err.status === 0)) {
      return {
        title: `${username} (@${username}) GitHub personality`,
        description: `Analyze @${username}'s developer aura, language vibes, and GitHub personality on GitVibe.`,
        robots: { index: true, follow: true },
      };
    }
    return { title: "Profile not found", robots: { index: false, follow: false } };
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let result: ProfileResult;
  try {
    result = await fetchProfile(username);
  } catch (err) {
    if (err instanceof GitHubError) {
      if (err.status === 404) notFound();
      // Transient GitHub failure (rate limit / network): don't fail the build
      // or the request. Render a minimal fallback; the client app retries live.
      return (
        <>
          <div className="relative min-h-screen">
            <Background />
            <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
              <section className="card mt-8 overflow-hidden">
                <div className="px-5 py-10 text-center sm:px-7">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    GitHub analysis unavailable right now
                  </h1>
                  <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">
                    We hit GitHub&apos;s rate limit while building @{username}&apos;s profile. It resets
                    shortly — the analyzer below will retry automatically.
                  </p>
                </div>
              </section>
              <div className="mt-8">
                <GitVibeApp initialUsername={username} />
              </div>
            </main>
          </div>
        </>
      );
    }
    throw err;
  }

  const { raw, stats, personality } = result;
  const user = raw.user!;
  const name = user.name ?? result.username;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name,
          alternateName: `@${result.username}`,
          url: user.html_url,
          image: user.avatar_url,
          sameAs: [user.blog, user.twitter_username ? `https://twitter.com/${user.twitter_username}` : null].filter(Boolean),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "GitVibe", item: "/" },
          { "@type": "ListItem", position: 2, name: result.username, item: `/u/${result.username}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative min-h-screen">
        <Background />

        <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
          {/* Server-rendered SEO summary — crawlers read this without JS */}
          <section className="card mt-8 overflow-hidden">
            <div className="h-20 bg-[radial-gradient(120%_160%_at_10%_0%,rgb(139_92_246/0.45)_0%,rgb(244_63_94/0.22)_45%,rgb(6_212_250/0.18)_100%)]" />
            <div className="px-5 py-6 sm:px-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                GitHub developer personality
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
                <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {name}
                </h1>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-1 flex items-center gap-1 text-sm font-medium text-white/50 transition-colors hover:text-aura-300"
                >
                  @{result.username} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-white/60">
                {describe(result)}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-aura-400/30 bg-aura-500/10 px-3 py-1 text-sm font-semibold text-aura-300">
                  {personality.archetype.emoji} {personality.archetype.title}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white/80">
                  {personality.scores.aura.label} aura · {personality.scores.aura.value}/100
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
                  <Star className="h-3.5 w-3.5" /> {formatFullNumber(stats.stars)} stars
                </span>
              </div>

              {stats.languages.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {stats.languages.slice(0, 4).map((l) => (
                    <span key={l.name} className="text-xs text-white/55">
                      <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: languageColor(l.name) }} />
                      {l.name} · {Math.round(l.share * 100)}%
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {/* Interactive dashboard — full experience for human visitors */}
          <div className="mt-8">
            <GitVibeApp initialUsername={result.username} />
          </div>
        </main>
      </div>
    </>
  );
}
