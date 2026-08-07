"use client";

import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export interface UsernameSuggestion {
  login: string;
  avatar_url: string;
}

/**
 * Shared username-autocomplete logic: debounced fetch against /api/search with
 * a dropdown of matching GitHub users. Used by the single search bar and by
 * both inputs of the battle search.
 */
export function useUsernameSuggestions() {
  const [suggestions, setSuggestions] = useState<UsernameSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const search = useCallback((raw: string) => {
    if (timer.current) clearTimeout(timer.current);
    const term = raw.trim();
    if (term.length < 1 || term.length > 39 || !/^[a-zA-Z0-9-]+$/.test(term)) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const id = ++seq.current;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = (await res.json().catch(() => null)) as { users?: UsernameSuggestion[] } | null;
        if (id !== seq.current) return;
        setSuggestions((data?.users ?? []).slice(0, 5));
      } catch {
        /* autocomplete is best-effort — never block the search */
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 250);
  }, []);

  const close = useCallback(() => {
    setSuggestions([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { suggestions, loading, search, close };
}

export function SuggestionDropdown({
  suggestions,
  loading,
  onPick,
}: {
  suggestions: UsernameSuggestion[];
  loading: boolean;
  onPick: (s: UsernameSuggestion) => void;
}) {
  if (suggestions.length === 0 && !loading) return null;
  return (
    <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-ink-800/95 shadow-2xl backdrop-blur-xl animate-pop">
      {loading ? (
        <div className="px-4 py-3" role="status" aria-live="polite">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-white/45">
            <Loader2 className="h-3 w-3 animate-spin" /> Searching GitHub…
          </p>
          {/* Skeleton rows mirroring the real suggestion items: circular avatar
              placeholder + username bar, shimmering while the query runs. */}
          <div className="space-y-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-1.5">
                <div className="h-6 w-6 shrink-0 animate-shimmer rounded-full bg-[linear-gradient(90deg,rgb(255_255_255/0.04)_25%,rgb(255_255_255/0.09)_50%,rgb(255_255_255/0.04)_75%)] bg-[length:200%_100%]" />
                <div className="h-3.5 w-28 animate-shimmer rounded-md bg-[linear-gradient(90deg,rgb(255_255_255/0.04)_25%,rgb(255_255_255/0.09)_50%,rgb(255_255_255/0.04)_75%)] bg-[length:200%_100%]" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ul role="listbox" aria-label="GitHub username suggestions">
          {suggestions.map((s) => (
            <li key={s.login} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => onPick(s)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external avatar URL, avoids next/image remote config */}
                <img src={s.avatar_url} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10" loading="lazy" />
                <span className="font-medium">@{s.login}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SearchBar({
  initialValue = "",
  loading,
  onSearch,
}: {
  initialValue?: string;
  loading: boolean;
  onSearch: (username: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { suggestions, loading: suggestLoading, search, close } = useUsernameSuggestions();

  // Close the suggestion dropdown when clicking anywhere outside the bar.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [close]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    close();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Type a GitHub username first.");
      inputRef.current?.focus();
      return;
    }
    if (!USERNAME_RE.test(trimmed) || trimmed.length > 39) {
      setError("That doesn't look like a valid GitHub username.");
      return;
    }
    setError(null);
    onSearch(trimmed);
  };

  const pickSuggestion = (s: UsernameSuggestion) => {
    setValue(s.login);
    close();
    // Submit the picked login directly: submit() reads the (stale) render-time
    // value, which would search the typed prefix instead of the suggestion.
    onSearch(s.login);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <form
        onSubmit={submit}
        className="group relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 pl-4 backdrop-blur-md transition-all duration-300 focus-within:border-aura-500/60 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_0_4px_rgb(139_92_246/0.15),0_20px_50px_-20px_rgb(139_92_246/0.5)]"
      >
        <Search className="h-5 w-5 shrink-0 text-white/35 transition-colors group-focus-within:text-aura-400" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
            search(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          placeholder="e.g. torvalds, sindresorhus, or you"
          aria-label="GitHub username"
          name="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white placeholder:text-white/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-aura-600 to-chaos-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-aura-600/30 transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Analyzing…</span>
            </>
          ) : (
            <>
              <span>Read my vibes</span>
              <span className="hidden sm:inline">→</span>
            </>
          )}
        </button>
      </form>
      <SuggestionDropdown suggestions={suggestions} loading={suggestLoading} onPick={pickSuggestion} />
      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-chaos-400" role="alert">
          <span aria-hidden>⚠️</span> {error}
        </p>
      ) : null}
    </div>
  );
}
