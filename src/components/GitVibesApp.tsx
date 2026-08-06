"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { GithubIcon } from "./icons";
import type { ProfileResult } from "@/lib/types";
import Background from "./Background";
import SearchBar from "./SearchBar";
import RecentSearches, { clearRecent, loadRecent, saveRecent, type RecentSearch } from "./RecentSearches";
import LoadingState from "./LoadingState";
import ErrorState, { type AppErrorCode } from "./ErrorState";
import ProfileSections from "./ProfileSections";

type Status = "idle" | "loading" | "error" | "done";

interface AppError {
  code: AppErrorCode;
  message?: string;
}

export default function GitVibesApp() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [copied, setCopied] = useState(false);
  const [urlUsername, setUrlUsername] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<string>("");

  const search = useCallback(async (username: string) => {
    lastQueryRef.current = username;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
      const data = (await res.json()) as ProfileResult & { error?: string; code?: AppErrorCode };
      if (!res.ok) {
        setError({ code: data.code ?? "internal", message: data.error });
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
      saveRecent({ username: data.username, avatar: data.raw.user?.avatar_url ?? "", fetchedAt: Date.now() });
      setRecent(loadRecent());
    } catch {
      setError({ code: "network" });
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // One-time client-only mount init: hydrate recent searches from localStorage and
    // honor a ?u= share link. These setStates run only on the first mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(loadRecent());
    const u = new URLSearchParams(window.location.search).get("u");
    if (u) {
      setUrlUsername(u);
      void search(u);
    }
  }, [search]);

  useEffect(() => {
    if (status === "done" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status]);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?u=${result?.username ?? ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="relative min-h-screen">
      <Background />

      <header className="mx-auto w-full max-w-5xl px-4 pb-4 pt-10 sm:px-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-aura-600 via-chaos-500 to-energy-500 text-lg shadow-lg shadow-aura-600/30">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Git<span className="text-gradient">Vibes</span>
            </span>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white"
          >
            <GithubIcon className="h-4 w-4" /> Powered by GitHub
          </a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        <section className="py-8 text-center sm:py-12">
          <div className="mx-auto mb-4 flex max-w-md items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            Developer Personality Lab
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Type a GitHub username.
            <br />
            <span className="text-gradient">Get their entire vibe.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/55 sm:text-base">
            A playful personality breakdown of any public profile — aura, chaos, energy, traits, a recruiter
            report, a roast, and a shareable identity card. All from live GitHub data.
          </p>

          <div className="mx-auto mt-8 w-full max-w-xl">
            <SearchBar key={urlUsername} initialValue={urlUsername} loading={status === "loading"} onSearch={search} />
          </div>

          <div className="mx-auto mt-5 w-full max-w-2xl">
            <RecentSearches
              items={recent}
              onPick={search}
              onClear={() => {
                clearRecent();
                setRecent([]);
              }}
            />
          </div>
        </section>

        {status === "loading" ? <LoadingState /> : null}

        {status === "error" && error ? (
          <ErrorState code={error.code} message={error.message} onRetry={() => lastQueryRef.current && search(lastQueryRef.current)} />
        ) : null}

        {status === "idle" ? (
          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { emoji: "🔮", label: "Archetype" },
              { emoji: "🌪️", label: "Chaos score" },
              { emoji: "🔥", label: "The roast" },
              { emoji: "🪪", label: "Identity card" },
            ].map((f) => (
              <div
                key={f.label}
                className="card flex flex-col items-center gap-1.5 px-3 py-5 text-center transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-xs font-medium text-white/60">{f.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        {status === "done" && result ? (
          <div ref={resultsRef} className="scroll-mt-6">
            <ProfileSections result={result} onShare={share} />
          </div>
        ) : null}

        {copied ? (
          <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-400/30 bg-ink-800/95 px-5 py-2.5 text-sm font-semibold text-emerald-300 shadow-2xl backdrop-blur animate-pop">
            <Check className="h-4 w-4" /> Link copied — share the vibes
          </div>
        ) : null}
      </main>

      <footer className="border-t border-white/8 py-6">
        <p className="text-center text-xs text-white/30">
          GitVibes is a fan-made experiment. Not affiliated with GitHub — and vibe analysis is not career advice. · Made with 💜 and caffeine
        </p>
      </footer>
    </div>
  );
}
