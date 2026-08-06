"use client";

import { Loader2, Search } from "lucide-react";
import { useRef, useState } from "react";

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

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

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
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

  return (
    <div className="w-full">
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
      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-chaos-400" role="alert">
          <span aria-hidden>⚠️</span> {error}
        </p>
      ) : null}
    </div>
  );
}
