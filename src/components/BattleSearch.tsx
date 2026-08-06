"use client";

import { Loader2, Swords } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SuggestionDropdown, useUsernameSuggestions, type UsernameSuggestion } from "./SearchBar";

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

function BattleInput({
  side,
  value,
  onChange,
  onError,
  placeholder,
}: {
  side: "left" | "right";
  value: string;
  onChange: (v: string) => void;
  onError: (msg: string | null) => void;
  placeholder: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { suggestions, loading, search, close } = useUsernameSuggestions();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [close]);

  const pick = (s: UsernameSuggestion) => {
    onChange(s.login);
    close();
  };

  return (
    <div className="relative min-w-0 flex-1" ref={wrapperRef}>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white/5 px-3.5 py-2.5 transition-all duration-200 focus-within:border-aura-500/60 focus-within:bg-white/[0.07] ${
          side === "left" ? "border-chaos-500/30" : "border-energy-500/30"
        }`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${side === "left" ? "bg-chaos-400" : "bg-energy-400"}`}
          aria-hidden
        />
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onError(null);
            search(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          placeholder={placeholder}
          aria-label={`${side} GitHub username`}
          name={`battle-${side}`}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-1 text-[15px] text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>
      <SuggestionDropdown suggestions={suggestions} loading={loading} onPick={pick} />
    </div>
  );
}

export default function BattleSearch({
  loading,
  onBattle,
}: {
  loading: boolean;
  onBattle: (left: string, right: string) => void;
}) {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [error, setError] = useState<string | null>(null);

  const valid = (u: string) => USERNAME_RE.test(u) && u.length <= 39;
  const ready = valid(left.trim()) && valid(right.trim());

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const l = left.trim();
    const r = right.trim();
    if (!valid(l) || !valid(r)) {
      setError("Enter two valid GitHub usernames (letters, numbers, hyphens).");
      return;
    }
    setError(null);
    onBattle(l, r);
  };

  return (
    <div className="w-full">
      <form onSubmit={submit}>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <BattleInput side="left" value={left} onChange={setLeft} onError={setError} placeholder="challenger…" />
          <span className="shrink-0 self-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-display text-sm font-bold text-white/60">
            VS
          </span>
          <BattleInput side="right" value={right} onChange={setRight} onError={setError} placeholder="opponent…" />
          <button
            type="submit"
            disabled={loading || !ready}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-chaos-600 to-aura-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-chaos-600/30 transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:self-stretch"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Battling…
              </>
            ) : (
              <>
                <Swords className="h-4 w-4" /> Start battle
              </>
            )}
          </button>
        </div>
      </form>
      {error ? (
        <p className="mt-2 text-center text-sm font-medium text-chaos-400" role="alert">
          ⚠️ {error}
        </p>
      ) : null}
    </div>
  );
}
