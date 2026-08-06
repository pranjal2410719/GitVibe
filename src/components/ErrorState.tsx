"use client";

import { RefreshCw } from "lucide-react";

export type AppErrorCode = "not_found" | "rate_limit" | "invalid_username" | "upstream" | "network" | "internal";

const COPY: Record<AppErrorCode, { emoji: string; title: string; body: string }> = {
  not_found: {
    emoji: "🕵️",
    title: "That user doesn't exist",
    body: "GitHub searched high and low. Nobody by that name was found — double-check the spelling, or it might be a private profile.",
  },
  rate_limit: {
    emoji: "🪫",
    title: "GitHub is taking a nap",
    body: "The public GitHub API rate limit was reached (60 requests/hour). Give it a few minutes, then try again — or add a GITHUB_TOKEN to raise the limit.",
  },
  invalid_username: {
    emoji: "🤔",
    title: "That's not a username",
    body: "GitHub usernames are 1–39 characters: letters, numbers, and hyphens. That input didn't make the cut.",
  },
  upstream: {
    emoji: "🩹",
    title: "GitHub hiccuped",
    body: "The GitHub API returned an unexpected response. The vibes are temporarily unavailable — try again shortly.",
  },
  network: {
    emoji: "📡",
    title: "Connection lost",
    body: "Couldn't reach the GitHub API. Check your connection and give it another shot.",
  },
  internal: {
    emoji: "🧯",
    title: "Something exploded",
    body: "An unexpected error while analyzing the profile. Our bad — try again, or pick a different victim.",
  },
};

export default function ErrorState({
  code,
  message,
  onRetry,
}: {
  code: AppErrorCode;
  message?: string;
  onRetry: () => void;
}) {
  const copy = COPY[code] ?? COPY.internal;

  return (
    <div className="card mx-auto w-full max-w-lg animate-pop p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-chaos-500/20 to-aura-600/20 text-3xl">
        {copy.emoji}
      </div>
      <h3 className="font-display text-xl font-bold text-white">{copy.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{copy.body}</p>
      {message && code === "internal" ? (
        <p className="mt-2 text-xs text-white/30">{message}</p>
      ) : null}
      <button
        onClick={onRetry}
        className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/15 active:scale-[0.97]"
      >
        <RefreshCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
