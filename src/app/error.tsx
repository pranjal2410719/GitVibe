"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="card mx-auto w-full max-w-md p-8 text-center">
        <p className="text-5xl" aria-hidden>💥</p>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">
          Something exploded
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-energy-600 to-aura-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-aura-600/30 transition-all hover:brightness-110 active:scale-[0.97]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
