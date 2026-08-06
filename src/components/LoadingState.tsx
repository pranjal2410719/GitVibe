"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Summoning your aura…",
  "Measuring chaos levels…",
  "Reading commit history…",
  "Consulting the coding gods…",
  "Brewing personality tea…",
  "Analyzing repo energy…",
  "Calibrating roast intensity…",
  "Counting your green squares…",
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded-xl bg-[linear-gradient(90deg,rgb(255_255_255/0.04)_25%,rgb(255_255_255/0.09)_50%,rgb(255_255_255/0.04)_75%)] bg-[length:200%_100%] ${className}`} />;
}

export default function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full animate-fade-up space-y-5" aria-live="polite">
      <div className="flex items-center justify-center gap-3 py-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aura-400 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-aura-500" />
        </span>
        <p className="font-display text-lg font-medium text-white/85">
          {MESSAGES[msgIndex]}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
