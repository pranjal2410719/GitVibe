"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Swords, User } from "lucide-react";
import { GithubIcon } from "./icons";
import type { ProfileResult } from "@/lib/types";
import Background from "./Background";
import SearchBar from "./SearchBar";
import BattleSearch from "./BattleSearch";
import RecentSearches, { clearRecent, loadRecent, saveRecent, type RecentSearch } from "./RecentSearches";
import HallOfFame from "./HallOfFame";
import { loadHall, saveHall, type HallEntry } from "@/lib/hall-of-fame";
import LoadingState from "./LoadingState";
import ProfileSkeleton from "./ProfileSkeleton";
import ErrorState, { type AppErrorCode } from "./ErrorState";
import ProfileSections from "./ProfileSections";
import CompareResults from "./CompareResults";
import { POPULAR_USERS } from "@/lib/popular-users";

type Status = "idle" | "loading" | "error" | "done";
type Mode = "single" | "battle";

interface AppError {
  code: AppErrorCode;
  message?: string;
}

export default function GitVibeApp({ initialUsername = "" }: { initialUsername?: string }) {
  const embedded = Boolean(initialUsername);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [hall, setHall] = useState<HallEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [urlUsername, setUrlUsername] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [battle, setBattle] = useState<{ left: ProfileResult; right: ProfileResult } | null>(null);
  const [battleLoading, setBattleLoading] = useState(false);
  const [battleError, setBattleError] = useState<string | null>(null);
  // When false, the profile skeleton stays on screen until the avatar image
  // has finished downloading (so the header never pops in half-drawn).
  const [mediaReady, setMediaReady] = useState(true);
  const mediaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against stale preload handlers: each search bumps this, so an
  // avatar that finishes loading from an earlier search can't flip mediaReady
  // for the current one.
  const avatarSeqRef = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<string>("");

  const search = useCallback(async (username: string) => {
    lastQueryRef.current = username;
    setStatus("loading");
    setError(null);
    // Invalidate any in-flight avatar preload from a previous search.
    const seq = ++avatarSeqRef.current;
    if (mediaTimerRef.current) clearTimeout(mediaTimerRef.current);
    setMediaReady(false);
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
      const data = (await res.json()) as ProfileResult & { error?: string; code?: AppErrorCode };
      if (!res.ok) {
        setError({ code: data.code ?? "internal", message: data.error });
        setStatus("error");
        setMediaReady(true);
        return;
      }
      setResult(data);
      setStatus("done");
      // Keep the skeleton visible until the avatar image is fully loaded too.
      // The image is preloaded into the browser cache, so the real <img> in
      // the header renders instantly when the skeleton swaps out. A timeout
      // guarantees the swap always happens even if the image stalls.
      const avatarUrl = data.raw.user?.avatar_url ?? "";
      if (avatarUrl) {
        const timer = setTimeout(() => {
          if (seq === avatarSeqRef.current) setMediaReady(true);
        }, 8000);
        mediaTimerRef.current = timer;
        const img = new Image();
        img.onload = () => {
          if (seq !== avatarSeqRef.current) return;
          clearTimeout(timer);
          setMediaReady(true);
        };
        img.onerror = () => {
          if (seq !== avatarSeqRef.current) return;
          clearTimeout(timer);
          setMediaReady(true);
        };
        img.src = avatarUrl;
      } else {
        setMediaReady(true);
      }
      saveRecent({ username: data.username, avatar: data.raw.user?.avatar_url ?? "", fetchedAt: Date.now() });
      setRecent(loadRecent());
      saveHall({
        username: data.username,
        avatar: data.raw.user?.avatar_url ?? "",
        aura: data.personality.scores.aura.value,
        fetchedAt: Date.now(),
      });
      setHall(loadHall());
    } catch {
      setError({ code: "network" });
      setStatus("error");
    }
  }, []);

  // Quick-pick from "try these" chips or the Hall of Fame always analyzes in single mode.
  const handlePick = useCallback(
    (username: string) => {
      setMode("single");
      void search(username);
    },
    [search],
  );

  const runBattle = useCallback(async (leftName: string, rightName: string) => {
    setBattleLoading(true);
    setBattleError(null);
    try {
      const [l, r] = await Promise.all([
        fetch(`/api/profile/${encodeURIComponent(leftName)}`),
        fetch(`/api/profile/${encodeURIComponent(rightName)}`),
      ]);
      const lj = (await l.json().catch(() => null)) as (ProfileResult & { error?: string }) | null;
      const rj = (await r.json().catch(() => null)) as (ProfileResult & { error?: string }) | null;
      if (!l.ok || !lj || !r.ok || !rj) {
        const failing = !l.ok || !lj ? lj : rj;
        setBattleError(failing?.error ?? "Couldn't load one of those profiles. Check both usernames and try again.");
        setBattle(null);
        return;
      }
      setBattle({ left: lj, right: rj });
      const now = Date.now();
      for (const p of [lj, rj]) {
        saveRecent({ username: p.username, avatar: p.raw.user?.avatar_url ?? "", fetchedAt: now });
        saveHall({
          username: p.username,
          avatar: p.raw.user?.avatar_url ?? "",
          aura: p.personality.scores.aura.value,
          fetchedAt: now,
        });
      }
      setRecent(loadRecent());
      setHall(loadHall());
    } catch {
      setBattleError("Network error while loading the battle. Try again.");
      setBattle(null);
    } finally {
      setBattleLoading(false);
    }
  }, []);

  useEffect(() => {
    // One-time client-only mount init: hydrate recent searches and the hall of
    // fame from localStorage. Search for an initialUsername passed by a
    // server-rendered /u/[username] page, falling back to a ?u= share link.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(loadRecent());
    setHall(loadHall());
    const u = initialUsername || new URLSearchParams(window.location.search).get("u");
    if (u) {
      setUrlUsername(u);
      void search(u);
    }
  }, [initialUsername, search]);

  useEffect(() => {
    if (status === "done" && mediaReady && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status, mediaReady]);

  // Clear any pending avatar preload timer on unmount.
  useEffect(() => {
    return () => {
      if (mediaTimerRef.current) clearTimeout(mediaTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (battle && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [battle]);

  const share = async () => {
    const username = result?.username ?? "";
    const url = embedded
      ? `${window.location.origin}/u/${encodeURIComponent(username)}`
      : `${window.location.origin}${window.location.pathname}?u=${username}`;
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
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white xs:px-4"
            aria-label="Powered by GitHub"
          >
            <GithubIcon className="h-4 w-4" />
            <span className="hidden xs:inline">Powered by GitHub</span>
          </a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        {!embedded ? (
          <section className="py-8 text-center sm:py-12">
          <div className="mx-auto mb-4 flex max-w-md items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-white/40 sm:tracking-[0.25em]">
            <span className="h-px flex-1 bg-white/10" />
            Developer Personality Lab
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight xs:text-4xl sm:text-6xl">
            Type a GitHub username.
            <br />
            <span className="text-gradient">Get their entire vibe.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/55 sm:text-base">
            Turn public commits into custom personality profiles — check your developer aura, track language
            vibes, and get roasted by your own code activity.
          </p>

          <div className="mx-auto mt-8 w-full max-w-xl">
            <div className="mb-3 flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
                <button
                  onClick={() => setMode("single")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                    mode === "single" ? "bg-white/10 text-white shadow" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  <User className="h-3.5 w-3.5" /> Single
                </button>
                <button
                  onClick={() => setMode("battle")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                    mode === "battle" ? "bg-white/10 text-white shadow" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  <Swords className="h-3.5 w-3.5" /> VS Battle
                </button>
              </div>
            </div>

            {mode === "single" ? (
              <SearchBar key={urlUsername} initialValue={urlUsername} loading={status === "loading"} onSearch={search} />
            ) : (
              <BattleSearch loading={battleLoading} onBattle={runBattle} />
            )}
          </div>

          <div className="mx-auto mt-5 w-full max-w-2xl">
            <RecentSearches
              items={recent}
              onPick={handlePick}
              onClear={() => {
                clearRecent();
                setRecent([]);
              }}
            />
          </div>

          {mode === "single" ? (
            <div className="mx-auto mt-6 max-w-2xl">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/35">Or try:</span>
                {POPULAR_USERS.map((u) => (
                  <button
                    key={u}
                    onClick={() => handlePick(u)}
                    className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/70 transition-all duration-200 hover:border-aura-500/50 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                  >
                    @{u}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>
        ) : null}

        {mode === "single" && !embedded ? (
          <div className="mx-auto mb-12 mt-10 w-full max-w-2xl">
            <HallOfFame items={hall} onPick={handlePick} />
          </div>
        ) : null}

        {status === "loading" ? <ProfileSkeleton /> : null}
        {battleLoading ? <LoadingState /> : null}

        {battleError ? (
          <div className="card mx-auto mt-6 max-w-lg animate-pop p-6 text-center">
            <p className="text-sm leading-relaxed text-white/60">{battleError}</p>
          </div>
        ) : null}

        {status === "error" && error ? (
          <ErrorState code={error.code} message={error.message} onRetry={() => lastQueryRef.current && search(lastQueryRef.current)} />
        ) : null}

        {mode === "battle" && battle ? (
          <div ref={resultsRef} className="scroll-mt-6">
            <CompareResults left={battle.left} right={battle.right} />
          </div>
        ) : null}

        {mode === "single" && status === "done" && result ? (
          <div ref={resultsRef} className="scroll-mt-6">
            {mediaReady ? <ProfileSections result={result} onShare={share} titleAs={embedded ? "h2" : "h1"} /> : <ProfileSkeleton />}
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
          GitVibe is a fan-made experiment. Not affiliated with GitHub — and vibe analysis is not career advice. · Made with 💜 and caffeine
        </p>
      </footer>
    </div>
  );
}
